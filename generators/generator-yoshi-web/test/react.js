'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fileList = require('./files/react');

describe('generator-wix-web:react', () => {
  let generator;

  beforeEach(() => {
    generator = helpers.run(path.join(__dirname, '../generators/react'));
  });

  describe('default settings', () => {
    beforeEach(() => {
      return generator.toPromise();
    });

    it('generates template files', () => {
      assert.file(fileList);
    });

    it('generates package.json file', () => {
      assert.file('package.json');
    });
  });

  describe('with an existing package.json file', () => {
    beforeEach(() => {
      return generator
        .on('ready', generator => {
          generator.fs.write('package.json', JSON.stringify({
            dependencies: {'some-test-dependency': '123'}
          }));
        })
        .toPromise();
    });

    it('should not override the existing package.json file', () => {
      assert.jsonFileContent('package.json', {dependencies: {'some-test-dependency': '123'}});
    });
  });

  it('generates .nvmrc file', () => {
    assert.file('.nvmrc');
  });

  describe('--generateInto', () => {
    beforeEach(() => {
      return generator
        .withOptions({generateInto: 'src'})
        .toPromise();
    });

    it('generates template files into generateInto dir', () => {
      assert.file(fileList.map(dir => path.join('src', dir)));
    });

    it('generates package.json file into generateInto dir', () => {
      assert.file(path.join('src', 'package.json'));
    });
  });
});
