'use strict';

const {expect} = require('chai');
const tp = require('test-phases');
const stripAnsi = require('strip-ansi');
const intercept = require('intercept-stdout');
const jest = require('../index');

const createTask = options => {
  const defaults = {
    log: x => x,
    watch: false,
    inTeamCity: () => false,
    projectConfig: {jestConfig: () => ({})},
  };

  return jest(Object.assign({}, defaults, options));
};

describe('Jest', () => {
  let test;
  let cleanup;
  let stdout = '';

  before(() => cleanup = intercept(s => {
    stdout += stripAnsi(s);
  }));
  beforeEach(() => test = tp.create());
  beforeEach(() => process.chdir(test.tmp));

  afterEach(() => test.teardown());
  afterEach(() => stdout = '');
  after(() => cleanup());

  it('should pass with exit code 0', () => {
    test.setup({
      '__tests__/foo.js': `
        describe('Foo', () => {
          jest.mock('../foo');
          const foo = require('../foo');
          it('should return value', () => {
            // foo is a mock function
            foo.mockImplementation(() => 42);
            expect(foo()).toBe(42);
          });
        });
      `,
      'foo.js': `module.exports = function() {
          // some implementation;
        };`
    });

    const task = createTask();

    return task()
      .then(() => {
        expect(stdout).to.contain('1 passed');
      });
  });

  it('should fail with exit code 1', () => {
    test.setup({
      '__tests__/foo.js': `
        describe('Foo', () => {
          jest.mock('../foo');
          const foo = require('../foo');
          it('should return value', () => {
            // foo is a mock function
            foo.mockImplementation(() => 42);
            expect(foo()).toBe(41);
          });
        });
      `,
      'foo.js': `module.exports = function() {
          // some implementation;
        };`
    });

    const task = createTask();

    return task()
      .then(() => Promise.reject())
      .catch(() => {
        expect(stdout).to.contain('1 failed');
      });
  });

  describe('when inside teamcity', () => {
    before(() => process.env.TEAMCITY_VERSION = 1);
    after(() => {
      delete process.env.TEAMCITY_VERSION;
    });

    it('should use the right reporter when running inside TeamCity', () => {
      test.setup({
        '__tests__/foo.js': `
          describe('Foo', () => {
            jest.mock('../foo');
            const foo = require('../foo');
            it('should return value', () => {
              // foo is a mock function
              foo.mockImplementation(() => 42);
              expect(foo()).toBe(42);
            });
          });
        `,
        'foo.js': `module.exports = function() {
            // some implementation;
          };`,
      });

      const task = createTask({
        inTeamCity: () => true
      });

      return task()
        .then(() => {
          expect(stdout).to.contain('##teamcity[');
        });
    });
  });

  // it('should work load jest configuration and work with css', () => {
  //   const res = test
  //     .setup({
  //       '__tests__/foo.js': `
  //         describe('Foo', () => {
  //           jest.mock('../foo');
  //           const foo = require('../foo');
  //           it('should return value', () => {
  //             // foo is a mock function
  //             foo.mockImplementation(() => 42);
  //             expect(foo()).toBe(42);
  //           });
  //         });
  //       `,
  //       'foo.js': `
  //         const s = require('./foo.scss');
  //         module.exports = function() {
  //           const a = s.a;
  //         };`,
  //       'foo.scss': `.a {.b {color: red;}}`,
  //       'package.json': `{
  //         "name": "a",\n
  //         "jest": {
  //           "moduleNameMapper": {
  //             ".scss$": "identity-obj-proxy"
  //           }
  //         },
  //         "devDependencies": {
  //           "identity-obj-proxy": "^3.0.0"
  //         }
  //       }`
  //     }, [hooks.installDependencies])
  //     .execute('test', ['--jest']);
  //   console.log(res);
  //   expect(res.code).to.equal(0);
  //   expect(res.stderr).to.contain('1 passed');
  // });
});
