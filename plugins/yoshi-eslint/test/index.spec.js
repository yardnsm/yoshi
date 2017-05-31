'use strict';

const {expect, assert} = require('chai');
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
  beforeEach(() => task = opts => eslint(Object.assign({
    base: () => 'src',
    logIf: a => a
  }, opts))());

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

  function mustReject(promise) {
    return promise.then(result => {
      assert(false, `expected promise to be rejected but it was fulfilled with ${result}`);
    });
  }

  function mustFulfill(promise) {
    return promise.catch(result => {
      assert(false, `expected promise to be fulfilled but it was rejected with ${result}`);
    });
  }

  it('should lint js files in the root folder too', () => {
    setup({'a.js': `parseInt('1');`});

    return mustReject(task())
      .catch(() =>
        expect(stdout).to.contain('1:1  error  Missing radix parameter  radix'));
  });

  it('should pass with exit code 0', () => {
    setup({'src/a.js': `parseInt('1', 10);`});

    return mustFulfill(task());
  });

  it('should fail with exit code 1', () => {
    setup({'src/a.js': `parseInt('1');`});

    return mustReject(task())
      .catch(() => {
        expect(stdout).to.contain('1:1  error  Missing radix parameter  radix');
      });
  });

  it('should generate a cache file inside target dir', () => {
    setup({'src/a.js': `parseInt('1', 10);`});
    return mustFulfill(task())
      .then(() =>
        expect(test.list('target', '-A')).to.contain('.eslintcache'));
  });
});
