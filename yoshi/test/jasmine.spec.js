'use strict';

const expect = require('chai').expect;
const retryPromise = require('retry-promise').default;
const psTree = require('ps-tree');
const tp = require('./helpers/test-phases');
const fx = require('./helpers/fixtures');
const {outsideTeamCity, insideTeamCity, insideWatchMode} = require('./helpers/env-variables');
const hooks = require('./helpers/hooks');

describe('test --jasmine', () => {
  let test, child;

  beforeEach(() => {
    test = tp.create(outsideTeamCity);
  });

  afterEach(() => {
    const pid = child && child.pid;
    child = null;
    test.teardown();
    return killSpawnProcessAndHidChildren(pid);
  });

  it('should pass with exit code 0', () => {
    const res = test
      .setup(passingProject())
      .execute('test', ['--jasmine']);

    expect(res.code).to.equal(0);
    expect(res.stdout).to.contain('1 spec, 0 failures');
  });

  it('should pass with exit code 1', () => {
    const res = test
      .setup(failingProject())
      .execute('test', ['--jasmine']);

    expect(res.code).to.equal(1);
    expect(res.stdout).to.contain('1 spec, 1 failure');
  });

  it('should consider custom globs if configured', () => {
    const res = test
      .setup({
        'some/other.glob.js': `it("should pass", () => 1);`,
        'package.json': fx.packageJson({
          specs: {
            node: 'some/*.glob.js'
          }
        })
      })
      .execute('test', ['--jasmine']);

    expect(res.code).to.equal(0);
    expect(res.stdout).to.contain('1 spec, 0 failures');
  });

  it('should use the right reporter when running inside TeamCity', () => {
    const res = test
      .setup(passingProject())
      .execute('test', ['--jasmine'], insideTeamCity);

    expect(res.code).to.equal(0);
    expect(res.stdout).to.contain('##teamcity[progressStart \'Running Jasmine Tests\']');
  });

  it('should rerun tests after file changes when in watch mode', () => {
    child = test
      .setup(failingProject())
      .spawn('test', ['--jasmine'], insideWatchMode);

    return checkStdoutContains(test, '1 spec, 1 failure')
      .then(() => test.modify('test/a.spec.js', passingTest()))
      .then(() => checkStdoutContains(test, '1 spec, 0 failures'));
  });

  it('should attach require hooks', () => {
    test
      .setup({
        '.babelrc': `{"plugins": ["babel-plugin-transform-es2015-modules-commonjs"]}`,
        'test/some.js': `export default 1`,
        'test/some.spec.js': `import x from './some';
it("should pass", () => 1);`,
        'package.json': `{
            "name": "a",\n
            "dependencies": {\n
              "babel-plugin-transform-es2015-modules-commonjs": "latest"\n
            }
          }`
      }, [hooks.installDependencies])
      .execute('test', ['--jasmine']);

    return checkStdoutContains(test, '1 spec, 0 failure');
  });
});

function passingProject() {
  return {
    'test/some.spec.js': passingTest(),
    'package.json': fx.packageJson()
  };
}

function failingProject() {
  return {
    'test/some.spec.js': failingTest(),
    'package.json': fx.packageJson()
  };
}

function passingTest() {
  return `it('should pass', function () { expect(1).toBe(1); });`;
}

function failingTest() {
  return `it('should fail', () => expect(1).toBe(2));`;
}

function checkStdoutContains(test, str) {
  return retryPromise({backoff: 100}, () =>
    test.stdout.indexOf(str) > -1 ? Promise.resolve() : Promise.reject());
}

function killSpawnProcessAndHidChildren(pid) {
  if (!pid) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    psTree(pid, (err /*eslint handle-callback-err: 0*/, children) => {
      [pid].concat(children.map(p => p.PID)).forEach(tpid => {
        try {
          process.kill(tpid, 'SIGKILL');
        } catch (e) {}
      });
      resolve();
    });
  });
}
