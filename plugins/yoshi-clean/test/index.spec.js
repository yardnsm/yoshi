'use strict';

const {expect} = require('chai');
const tp = require('test-phases');
const clean = require('../index');

describe('Clean', () => {
  let test;

  beforeEach(() => test = tp.create());
  beforeEach(() => process.chdir(test.tmp));
  afterEach(() => test.teardown());

  ['dist', 'target'].forEach(folderName =>
    it(`should remove ${folderName} folder`, () => {
      const res = test
        .setup({
          [`${folderName}/old.js`]: `const hello = "world!";`,
          'src/new.js': 'const world = "hello!";',
        });

      return clean()
        .then(() => {
          expect(test.list(folderName)).to.not.include('old.js');
          expect(test.list('src')).to.include('new.js');
        });
    })
  );
});
