'use strict';

const {expect} = require('chai');
const tp = require('test-phases');
const clean = require('../index');

describe('Clean', () => {
  let test;
  let task;

  beforeEach(() => test = tp.create());
  beforeEach(() => process.chdir(test.tmp));
  beforeEach(() => task = clean({log: a => a}));
  afterEach(() => test.teardown());

  ['dist', 'target'].forEach(folderName =>
    it(`should remove ${folderName} folder`, () => {
      test.setup({
        [`${folderName}/old.js`]: `const hello = "world!";`,
        'src/new.js': 'const world = "hello!";',
      });

      return task()
        .then(() => {
          expect(test.list(folderName)).to.not.include('old.js');
          expect(test.list('src')).to.include('new.js');
        });
    })
  );
});
