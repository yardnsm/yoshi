'use strict';

// const {expect} = require('chai');
const tp = require('test-phases');
// const stripAnsi = require('strip-ansi');
// const intercept = require('intercept-stdout');
// const retryPromise = require('retry-promise').default;
const mocha = require('../index');

// const passingTest = `it('should pass', () => expect(1).toBe(1));`;
// const failingTest = `it('should fail', () => expect(1).toBe(2));`;

const createTask = options => {
  const defaults = {
    log: x => x,
    watch: false,
    base: () => 'test',
    projectConfig: {specs: {node: () => undefined}},
    inTeamCity: () => false
  };

  return mocha(Object.assign({}, defaults, options));
};

describe('Mocha', () => {
  let test;
  // let cleanup;
  // let stdout = '';

  // const checkStdoutContains = (test, str) => {
  //   return retryPromise({backoff: 100}, () =>
  //     stdout.indexOf(str) > -1 ? Promise.resolve() : Promise.reject());
  // };

  // before(() => cleanup = intercept(s => {
  //   stdout += stripAnsi(s);
  // }));
  beforeEach(() => test = tp.create());
  beforeEach(() => process.chdir(test.tmp));

  afterEach(() => test.teardown());
  // afterEach(() => stdout = '');
  // after(() => cleanup());

  it('should pass', () => {
    test.setup({
      'test/some.spec.js': `it.only("pass", () => 1);`,
    });

    const task = createTask();

    return task();
  });

  it('should fail', done => {
    test.setup({
      'test/some.spec.js': `it("fail", () => { throw new Error() });`,
    });

    const task = createTask();

    task()
      .catch(done);
  });

  it('should consider custom globs if configured', () => {
    test.setup({
      'some/other.glob.js': `it("pass", () => 1);`,
    });

    const task = createTask({
      projectConfig: {specs: {node: () => 'some/*.glob.js'}}
    });

    return task();
  });

  it('should use the right reporter when running inside TeamCity', () => {
    test.setup({
      'test/some.spec.js': `it.only("pass", () => 1);`,
    });

    const task = createTask({
      inTeamCity: () => true
    });

    return task();

    // expect(res.code).to.equal(0);
    // expect(res.stdout).to.contain('##teamcity[');
  });

  it('should require "test/mocha-setup.js" configuration file', () => {
    test.setup({
      'test/mocha-setup.js': 'global.foo = 123',
      'test/some.spec.js': `
        const assert = require('assert');
        it("pass", () => assert.equal(global.foo, 123))`,
    });

    const task = createTask();

    return task();
  });
});
