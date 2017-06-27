'use strict';

const {expect} = require('chai');
const tp = require('test-phases');
const clean = require('../index');

describe('Clean', () => {
  let test;
  let task;

  beforeEach(() => {
    test = tp.create();
    process.chdir(test.tmp);
    task = clean({log: a => a, base: () => 'src'});
  });
  afterEach(() => test.teardown());

  it('should copy files from assets folder', () => {
    test.setup({
      'app/assets/some-file': 'a',
      'src/assets/some-file': 'a',
      'test/assets/some-file': 'a'
    });

    return task()
      .then(() => {
        expect(test.list('dist/src/assets')).to.include('some-file');
      });
  });

  it('should copy given types', () => {
    test.setup({
      'src/a.ejs': 'a',
      'src/a.html': 'a',
      'src/a.vm': 'a'
    });

    return task()
      .then(() => {
        expect(test.list('dist/src').sort()).to.eql(['a.ejs', 'a.html', 'a.vm']);
      });
  });

  it('should copy nested directories', () => {
    test.setup({
      'src/assets/fonts/some-font': '',
      'src/assets/images/secret/an-image.png': ''
    });

    return task()
      .then(() => {
        expect(test.list('dist/statics/assets', '-R'))
          .to.include('fonts/some-font')
          .and.to.include('images/secret/an-image.png');
      });
  });

  it('should copy files from assets folder into the output dir if specified', () => {
    test.setup({
      'src/assets/some-file': 'a'
    });

    return task({output: 'statics1'})
      .then(() => {
        expect(test.list('dist/statics1/assets')).to.include('some-file');
      });
  });

  it('should copy html assets to dist and to statics', () => {
    test.setup({
      'src/index.html': 'a',
      'src/index.vm': 'a',
      'src/index.ejs': 'a'
    });

    return task()
      .then(() => {
        expect(test.list('dist/statics')).to.include('index.html');
        expect(test.list('dist/statics')).to.include('index.vm');
        expect(test.list('dist/statics')).to.include('index.ejs');

        expect(test.list('dist/src')).to.include('index.html');
        expect(test.list('dist/src')).to.include('index.vm');
        expect(test.list('dist/src')).to.include('index.ejs');
      });
  });

  it('should copy server assets to dist', () => {
    test.setup({
      'src/style.css': '.a {\ncolor: red;\n}\n',
      'src/some.d.ts': '',
      'src/file.json': '{}',
    });

    return task()
      .then(() => {
        expect(test.list('dist/src')).to.include.members([
          'style.css',
          'file.json',
          'some.d.ts'
        ]);
      });
  });
});
