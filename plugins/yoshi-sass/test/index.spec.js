'use strict';

const {expect} = require('chai');
const tp = require('test-phases');
const sass = require('../index');

const scss = () => '.a {\n.b {\ncolor: red;\n}\n}\n';
const scssInvalid = () => '.a {\n.b\ncolor: red;\n}\n}\n';

describe('Sass', () => {
  let test;
  let task;

  beforeEach(() => test = tp.create());
  beforeEach(() => process.chdir(test.tmp));
  beforeEach(() => task = (projectConfig) => sass({base: () => 'src', logIf: a => a, projectConfig})());
  afterEach(() => test.teardown());

  it('should transpile to dist/, preserve folder structure, extensions and exit with code 0', () => {
    const compiledStyle = '.a .b {\n  color: red; }';

    test.setup({
      'src/b/style.scss': scss()
    });

    return task()
      .then(() => {
        expect(test.content('dist/src/b/style.scss')).to.contain(compiledStyle);
      });
  });

  it('should fail with exit code 1', () => {
    test.setup({
      'src/a/style.scss': scssInvalid()
    });

    return task()
      .catch(err => {
        expect(err).to.contain('Invalid CSS after ".a {');
      });
  });

  it('should consider node_modules for path', () => {
    test.setup({
      'node_modules/some-module/style.scss': `.a { color: black; }`,
      'src/a/style.scss': `@import 'some-module/style.scss'`,
    });

    return task()
      .then(() => {
        expect(test.content('dist/src/a/style.scss')).to.contain('.a {\n  color: black; }');
      });
  });

  it('should support compass', () => {
    test.setup({
      'src/style.scss': `@import 'compass'; .a { color: black; }`,
      'node_modules/compass-mixins/lib/_compass.scss': '',
    });

    return task()
      .then(() => {
        expect(test.content('dist/src/style.scss')).to.contain('.a {\n  color: black; }');
      });
  });

  it('should not render partial files with the name starting with _', () => {
    test.setup({
      'src/a/_partial.scss': '$text-color: #ff0000',
      'src/a/style.scss': `@import './partial'; body {color: $text-color;}`,
    });

    return task()
      .then(() => {
        expect(test.list('dist', '-R')).not.to.contain('app/a/_partial.scss');
      });
  });

  it('should obfuscate CSS classes', () => {
    const compiledStyle = '.src-b-style__a__tiTI0 .src-b-style__b__3rPcp {\n  color: red; }';
    const projectConfig = {
      cssModulesInBuildTime: () => true,
      cssScopePatern: () => '[path][name]__[local]__[hash:base64:5]'
    };

    test.setup({
      'src/b/style.scss': scss()
    });

    return task(projectConfig)
        .then(() => {
        expect(test.content('dist/src/b/style.scss')).to.contain(compiledStyle);
    });
  });



});
