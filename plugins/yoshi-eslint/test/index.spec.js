'use strict';

const {expect} = require('chai');
const tp = require('test-phases');
const stripAnsi = require('strip-ansi');
const intercept = require('intercept-stdout');
const eslint = require('../index');

describe('ESLint', () => {
  let test;
  let task;
  let cleanup;
  let stdout = '';

  before(() => cleanup = intercept(s => {
    stdout += stripAnsi(s);
  }));
  beforeEach(() => test = tp.create());
  beforeEach(() => process.chdir(test.tmp));
  beforeEach(() => task = eslint({base: () => 'src', logIf: a => a}));

  afterEach(() => test.teardown());
  afterEach(() => stdout = '');
  after(() => cleanup());

  function setup(data) {
    return test.setup(Object.assign({
      '.eslintrc': JSON.stringify({
        rules: {
          radix: 'error'
        }
      }, null, 2)
    }, data));
  }

  it('should lint js files in the root folder too', () => {
    setup({'a.js': 'parseInt("1");'});

    return task()
      .then(() => Promise.reject())
      .catch(() => {
        expect(stdout).to.contain('1:1  error  Missing radix parameter  radix');
      });
  });

  it('should pass with exit code 0', () => {
    setup({'src/a.js': `parseInt("1", 10);`});

    return task();
  });

  it('should fail with exit code 1', () => {
    setup({'src/a.js': `parseInt("1");`});

    return task()
      .then(() => Promise.reject())
      .catch(() => {
        expect(stdout).to.contain('1:1  error  Missing radix parameter  radix');
      });
  });
});
