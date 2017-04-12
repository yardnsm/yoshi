'use strict';

const {expect} = require('chai');
const tp = require('test-phases');
const less = require('../index');

describe('Less', () => {
  let test;
  let task;

  beforeEach(() => test = tp.create());
  beforeEach(() => process.chdir(test.tmp));
  beforeEach(() => task = less({base: () => 'src', logIf: a => a}));
  afterEach(() => test.teardown());

  it('should transpile to dist/, preserve folder structure, extensions and exit with code 0', () => {
    const compiledStyle = '.a .b {\n  color: red;\n}';

    test.setup({
      'src/b/style.less': '.a {\n.b {\ncolor: red;\n}\n}\n',
    });

    return task()
      .then(() => {
        expect(test.content('dist/src/b/style.less')).to.contain(compiledStyle);
      });
  });

  it('should fail with exit code 1', () => {
    test.setup({
      'src/a/style.less': '.a {\n.b\ncolor: red;\n}\n}\n',
    });

    return task()
      .then(() => Promise.reject())
      .catch(err => {
        expect(err).to.equal(`[style.less] Unrecognised input`);
      });
  });

  it('should handle @import statements', () => {
    test.setup({
      'src/style.less': `@import (once) './foobar.less';`,
      'src/foobar.less': `.a { color: black; }`,
    });

    return task()
      .then(() => {
        expect(test.content('dist/src/style.less')).to.contain('.a {\n  color: black;\n}');
      });
  });

  it('should consider node_modules for path', () => {
    test.setup({
      'node_modules/some-module/style.less': `.a { color: black; }`,
      'src/a/style.less': `@import (once) 'some-module/style.less';`,
    });

    return task()
      .then(() => {
        expect(test.content('dist/src/a/style.less')).to.contain('.a {\n  color: black;\n}');
      });
  });
});
