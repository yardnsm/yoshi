'use strict';

const {expect} = require('chai');
const tp = require('test-phases');
const stripAnsi = require('strip-ansi');
const intercept = require('intercept-stdout');
const eslint = require('../index');

describe('ESLint', () => {
  let test;
  let cleanup;
  let stdout = '';

  before(() => cleanup = intercept(s => {stdout += stripAnsi(s);}));
  beforeEach(() => test = tp.create());
  beforeEach(() => process.chdir(test.tmp));

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

    return eslint()
      .then(() => {throw new Error();})
      .catch(() => {
        expect(stdout).to.contain('1:1  error  Missing radix parameter  radix');
      });
  });

  it('should pass with exit code 0', () => {
    setup({'app/a.js': `parseInt("1", 10);`});

    return eslint();
  });

  it('should fail with exit code 1', () => {
    setup({'app/a.js': `parseInt("1");`});

    return eslint()
      .then(() => {throw new Error();})
      .catch(() => {
        expect(stdout).to.contain('1:1  error  Missing radix parameter  radix');
      })
  });
});
