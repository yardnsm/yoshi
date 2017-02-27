'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const baseFileList = [
  'src/components/App/App.js',
  'src/components/App/App.scss',
  'src/components/App/App.spec.js',
  'src/components/App/index.js',
  'src/client.js',
  'src/index.ejs',
  'src/server.js',
  'test/mocha-setup.js',
  '.gitignore',
  '.nvmrc',
  'index.js',
  'wallaby.js'
];

describe('generator-wix-fullstack:app', () => {
  let generator;

  beforeEach(() => {
    generator = helpers.run(path.join(__dirname, '../generators/app'))
      .withOptions({
        name: 'name',
        groupId: 'groupId',
        authorName: 'authorName',
        authorEmail: 'authorEmail'
      });
  });

  describe('default settings', () => {
    beforeEach(() => {
      return generator.toPromise();
    });

    it('generates base files', () => {
      assert.file(baseFileList);
    });

    it('generates package.json file', () => {
      assert.jsonFileContent('package.json', {name: 'name'});
      assert.jsonFileContent('package.json', {scripts: {start: 'yoshi start'}});
    });
  });

  describe('--generateInto', () => {
    beforeEach(() => {
      return generator
        .withOptions({generateInto: 'generateInto'})
        .toPromise();
    });

    it('generates base files into generateInto dir', () => {
      assert.file(baseFileList.map(dir => path.join('generateInto', dir)));
    });
  });
});
