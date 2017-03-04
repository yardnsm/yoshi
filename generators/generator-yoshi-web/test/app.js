'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const reactFileList = require('./files/react');

describe('generator-wix-web:app', () => {
  let generator;

  beforeEach(() => {
    generator = helpers.run(path.join(__dirname, '../generators/app'))
      .withOptions({
        name: 'name',
        authorName: 'authorName',
        authorEmail: 'authorEmail'
      });
  });

  describe('default settings', () => {
    beforeEach(() => {
      return generator.toPromise();
    });

    it('generates package.json file', () => {
      assert.file('package.json');
      assert.jsonFileContent('package.json', {name: 'name'});
      assert.jsonFileContent('package.json', {author: {name: 'authorName'}});
      assert.jsonFileContent('package.json', {author: {email: 'authorEmail'}});
    });

    it('generates package.json\'s start command', () => {
      assert.jsonFileContent('package.json', {scripts: {start: 'yoshi start --entry-point=./test/fakes/start-fake-server.js'}});
    });

    it('generates package.json\'s scripts', () => {
      assert.jsonFileContent('package.json', {scripts: {pretest: 'yoshi lint && yoshi build'}});
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

  describe('--generateInto', () => {
    beforeEach(() => {
      return generator
        .withOptions({generateInto: 'src'})
        .toPromise();
    });

    it('generates template files into generateInto dir', () => {
      assert.file(path.join('src', 'package.json'));
    });
  });

  describe('react project', () => {
    beforeEach(() => {
      return generator
        .withPrompts({clientProjectsType: 'react'})
        .toPromise();
    });

    it('generates react project files', () => {
      assert.file(reactFileList);
    });
  });
});
