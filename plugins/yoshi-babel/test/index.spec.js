'use strict';

const {expect} = require('chai');
const tp = require('test-phases');
const hooks = require('test-phases/hooks');
const babel = require('../index');
const stripAnsi = require('strip-ansi');
const intercept = require('intercept-stdout');

describe('Babel', () => {
  let test;
  let stdout;
  let cleanup;

  before(() => cleanup = intercept(s => {stdout += stripAnsi(s);}));
  beforeEach(() => test = tp.create());
  beforeEach(() => process.chdir(test.tmp));

  afterEach(() => test.teardown());
  afterEach(() => stdout = '');
  after(() => cleanup());

  it('should transpile to dist but only form app, src, test, testkit folders and index.js itself and exit with code 0', () => {
    test.setup({
      '.babelrc': '{}',
      'app/b.jsx': 'const b = 2;',
      'src/a/a.js': 'const a = 1;',
      'test/a/a.spec.js': 'const test = \'test\';',
      'testkit/a.js': 'const a = 1;',
      'index.js': 'const name = \'name\';'
    });

    return babel()
      .then(() => {
        expect(test.list('dist')).to.include.members(['src', 'app', 'test', 'testkit', 'index.js']);
      });
  });

  it('should preserve folder structure, create source maps', function () {
    this.timeout(60000);

    test.setup({
      '.babelrc': `{"plugins": ["babel-plugin-transform-es2015-constants"]}`,
      'src/a/a.js': 'const a = 1;',
      'package.json': `{
          "name": "a",\n
          "version": "1.0.4",\n
          "dependencies": {\n
            "babel-plugin-transform-es2015-constants": "latest"\n
          }
        }`,
    }, [hooks.installDependencies]);

    return babel()
      .then(() => {
        expect(test.content('dist/src/a/a.js')).to.contain('let a = 1;');
        expect(test.content('dist/src/a/a.js')).to.contain('//# sourceMappingURL=a.js.map');
        expect(test.contains('dist/src/a/a.js.map')).to.be.true;
      });
  });

  it('should transpile when there is babel config inside package.json', () => {
    test.setup({
      'package.json': `{
        "name": "a",\n
        "version": "1.0.4",\n
        "babel": {}
      }`,
      'src/a/a.js': 'const a = 1;',
    });

    return babel()
      .then(() => {
        expect(test.content('dist/src/a/a.js')).to.contain('const a = 1;');
        expect(test.content('dist/src/a/a.js')).to.contain('//# sourceMappingURL=a.js.map');
        expect(test.contains('dist/src/a/a.js.map')).to.be.true;
      });
  });

  it('should fail with exit code 1', () => {
    test.setup({
      '.babelrc': '{}',
      'src/a.js': 'function ()'
    });

    return babel()
      .then(() => {throw new Error()})
      .catch(() => {
        expect(stdout).to.contain('Unexpected token (1:9)');
        expect(stdout).to.contain('1 | function ()');
      });
  });

  it('should ignore dist/ and node_modules/ from being transpiled', () => {
    test.setup({
      'dist/a.js': 'function () {{}',
      'node_modules/a.js': 'function () {{}'
    });

    return babel()
      .then(() => {
        expect(test.contains('dist/node_modules')).to.be.false;
      });
  });

  it('should store transpilation output into file system cache', () => {
    test.setup({
      '.babelrc': '{}',
      'src/foo.js': 'const foo = `bar`;'
    });

    return babel()
      .then(() => {
        expect(test.list('.', '-RA')).to.contain('target/.babel-cache');
      });
  });
});
