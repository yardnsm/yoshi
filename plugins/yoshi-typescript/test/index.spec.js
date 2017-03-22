'use strict';

const {expect} = require('chai');
const tp = require('test-phases');
const stripAnsi = require('strip-ansi');
const intercept = require('intercept-stdout');
const typescript = require('../index');

const tsconfig = (options = {}) => JSON.stringify(Object.assign({}, {
  compilerOptions: {
    module: 'commonjs',
    target: 'es5',
    moduleResolution: 'node',
    sourceMap: true,
    outDir: 'dist',
    declaration: true,
    noImplicitAny: false
  },
  exclude: [
    'node_modules',
    'dist'
  ]
}, options), null, 2);

describe('Typescript', () => {
  let test;
  let task;
  let cleanup;
  let stdout = '';

  before(() => cleanup = intercept(s => {
    stdout += stripAnsi(s);
  }));
  beforeEach(() => test = tp.create());
  beforeEach(() => process.chdir(test.tmp));
  beforeEach(() => task = typescript({watch: false, log: a => a}));

  afterEach(() => test.teardown());
  afterEach(() => stdout = '');
  after(() => cleanup());

  it('should transpile to dist and exit with code 0', () => {
    test.setup({
      'app/a.ts': 'const a = 1;',
      'app/b.tsx': 'const b = 2',
      'tsconfig.json': tsconfig()
    });

    return task()
      .then(() => {
        expect(test.content('dist/app/a.js')).to.contain('var a = 1');
        expect(test.content('dist/app/b.js')).to.contain('var b = 2');
      });
  });

  it('should create source maps and definition files side by side', () => {
    test.setup({
      'app/a.ts': 'const b = 2;',
      'tsconfig.json': tsconfig()
    });

    return task()
      .then(() => {
        expect(test.content('dist/app/a.js')).to.contain('//# sourceMappingURL=a.js.map');
        expect(test.list('dist/app')).to.include('a.js.map', 'a.d.ts');
      });
  });

  it('should fail with exit code 1', () => {
    test.setup({
      'src/a.ts': 'function ()',
      'tsconfig.json': tsconfig()
    });

    return task()
      .then(() => Promise.reject())
      .catch(() => {
        expect(stdout).to.contain('error TS1003: Identifier expected');
      });
  });
});
