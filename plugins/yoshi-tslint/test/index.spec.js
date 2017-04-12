'use strict';

const {expect} = require('chai');
const tp = require('test-phases');
const stripAnsi = require('strip-ansi');
const intercept = require('intercept-stdout');
const tslint = require('../index');

describe('TSLint', () => {
  let test;
  let task;
  let cleanup;
  let stdout = '';

  before(() => cleanup = intercept(s => {
    stdout += stripAnsi(s);
  }));
  beforeEach(() => test = tp.create());
  beforeEach(() => process.chdir(test.tmp));
  beforeEach(() => task = tslint({base: () => 'src', logIf: a => a}));

  afterEach(() => test.teardown());
  afterEach(() => stdout = '');
  after(() => cleanup());

  const tslintConfig = JSON.stringify({
    rules: {
      radix: true
    }
  }, null, 2);

  it('should pass with exit code 0', () => {
    test.setup({
      'src/a.ts': `parseInt("1", 10);`,
      'tslint.json': tslintConfig
    });

    return task();
  });

  it('should fail with exit code 1', () => {
    test.setup({
      'src/a.ts': `parseInt("1");`,
      'tslint.json': tslintConfig
    });

    return task()
      .then(() => Promise.reject())
      .catch(() => {
        expect(stdout).to.contain('Missing radix parameter');
      });
  });

  it('should should fail with exit code 1 (tsx)', () => {
    test.setup({
      'src/a.tsx': `parseInt("1");`,
      'tslint.json': tslintConfig
    });

    return task()
      .then(() => Promise.reject())
      .catch(() => {
        expect(stdout).to.contain('Missing radix parameter');
      });
  });

  it('should skip d.ts files', () => {
    // tslint would fail on app/a.d.ts, but it would be skipped
    // and thus the res.code should be 0.
    test.setup({
      'src/a.d.ts': `parseInt("1");`,
      'tslint.json': tslintConfig
    });

    return task();
  });
});
