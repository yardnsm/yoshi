const expect = require('chai').expect;
const tp = require('./helpers/test-phases');
const fx = require('./helpers/fixtures');
const hooks = require('./helpers/hooks');
const {
  outsideTeamCity,
  insideTeamCity
} = require('./helpers/env-variables');
const {
  readFileSync
} = require('fs');

describe('Aggregator: Build', () => {
  const defaultOutput = 'statics';
  let test;

  beforeEach(() => test = tp.create());
  afterEach(() => test.teardown());

  describe('yoshi-sass', () => {
    it('should use yoshi-sass', () => {
      const compiledStyle = '.a .b {\n  color: red; }';
      const resp = test
        .setup({
          'src/client.js': '',
          'app/a/style.scss': fx.scss(),
          'src/b/style.scss': fx.scss(),
          'test/c/style.scss': fx.scss(),
          'package.json': fx.packageJson()
        })
        .execute('build');

      expect(resp.code).to.equal(0);
      expect(resp.stdout).to.contain(`Finished 'sass'`);
      expect(test.content('dist/app/a/style.scss')).to.contain(compiledStyle);
      expect(test.content('dist/src/b/style.scss')).to.contain(compiledStyle);
      expect(test.content('dist/test/c/style.scss')).to.contain(compiledStyle);
    });

    it('should fail with exit code 1', () => {
      const resp = test
        .setup({
          'src/client.js': '',
          'app/a/style.scss': fx.scssInvalid(),
          'package.json': fx.packageJson()
        })
        .execute('build');

      expect(resp.code).to.equal(1);
      expect(resp.stdout).to.contain(`Failed 'sass'`);
      expect(resp.stdout).to.contain('Invalid CSS after ".a {');
    });
  });

  describe('Less', () => {
    it('should transpile to dist/, preserve folder structure, extensions and exit with code 0', () => {
      const compiledStyle = '.a .b {\n  color: red;\n}';
      const resp = test
        .setup({
          'src/client.js': '',
          'app/a/style.less': '.a {\n.b {\ncolor: red;\n}\n}\n',
          'src/b/style.less': '.a {\n.b {\ncolor: red;\n}\n}\n',
          'test/c/style.less': '.a {\n.b {\ncolor: red;\n}\n}\n',
          'package.json': fx.packageJson()
        })
        .execute('build');

      expect(resp.code).to.equal(0);
      expect(resp.stdout).to.contain(`Finished 'less'`);
      expect(test.content('dist/app/a/style.less')).to.contain(compiledStyle);
      expect(test.content('dist/src/b/style.less')).to.contain(compiledStyle);
      expect(test.content('dist/test/c/style.less')).to.contain(compiledStyle);
    });

    it('should disable css modules for .global.less files', () => {
      const res = test
        .setup({
          'src/client.js': 'require(\'./styles/my-file.global.less\');',
          'src/styles/my-file.global.less': `.a {.b {color: red;}}`,
          'package.json': fx.packageJson({
            separateCss: true
          }),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content(`dist/${defaultOutput}/app.css`)).to.contain('.a .b {');
    });

    it('should fail with exit code 1', () => {
      const resp = test
        .setup({
          'src/client.js': '',
          'app/a/style.less': '.a {\n.b\ncolor: red;\n}\n}\n',
          'package.json': fx.packageJson()
        })
        .execute('build');

      expect(resp.code).to.equal(1);
      expect(resp.stdout).to.contain(`Failed 'less'`);
      expect(resp.stdout).to.contain(`[style.less] Unrecognised input`);
    });

    it('should handle @import statements', () => {
      const resp = test
        .setup({
          'src/client.js': '',
          'src/style.less': `@import (once) './foobar.less';`,
          'src/foobar.less': `.a { color: black; }`,
          'package.json': fx.packageJson()
        })
        .execute('build');

      expect(resp.code).to.equal(0);
      expect(resp.stdout).to.contain(`Finished 'less'`);
      expect(test.content('dist/src/style.less')).to.contain('.a {\n  color: black;\n}');
    });

    it('should consider node_modules for path', () => {
      const resp = test
        .setup({
          'src/client.js': '',
          'node_modules/some-module/style.less': `.a { color: black; }`,
          'src/a/style.less': `@import (once) 'some-module/style.less';`,
          'package.json': fx.packageJson()
        })
        .execute('build');

      expect(resp.code).to.equal(0);
      expect(resp.stdout).to.contain(`Finished 'less'`);
      expect(test.content('dist/src/a/style.less')).to.contain('.a {\n  color: black;\n}');
    });
  });

  describe('yoshi-babel', () => {
    it('should use yoshi-babel', () => {
      const resp = test
        .setup({
          '.babelrc': '{}',
          'app/b.jsx': 'const b = 2;',
          'src/a/a.js': 'const a = 1;',
          'test/a/a.spec.js': 'const test = \'test\';',
          'testkit/a.js': 'const a = 1;',
          'bin/a.js': 'const a = 1;',
          'index.js': 'const name = \'name\';',
          'package.json': fx.packageJson(),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(resp.stdout).to.contain(`Finished 'babel'`);
      expect(resp.code).to.equal(0);
      expect(test.list('dist')).to.include.members(['src', 'app', 'test', 'testkit', 'bin', 'index.js']);
    });

    it('should fail with exit code 1', () => {
      const resp = test
        .setup({
          '.babelrc': '{}',
          'src/a.js': 'function ()',
          'package.json': fx.packageJson(),
          'pom.xml': fx.pom()
        })
        .execute('build');
      expect(resp.code).to.equal(1);
      expect(resp.stdout).to.contain('Unexpected token (1:9)');
      expect(resp.stdout).to.contain('1 | function ()');
    });
  });

  describe('yoshi-typescript', () => {
    it('should use yoshi-typescript', () => {
      const resp = test
        .setup({
          'app/a.ts': 'const a = 1;',
          'app/b.tsx': 'const b = 2',
          'tsconfig.json': fx.tsconfig(),
          'package.json': fx.packageJson(),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(resp.stdout).to.contain(`Finished 'typescript'`);
      expect(resp.code).to.equal(0);
      expect(test.content('dist/app/a.js')).to.contain('var a = 1');
      expect(test.content('dist/app/b.js')).to.contain('var b = 2');
    });

    it('should fail with exit code 1', () => {
      const resp = test
        .setup({
          'src/a.ts': 'function ()',
          'tsconfig.json': fx.tsconfig(),
          'package.json': fx.packageJson(),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(resp.code).to.equal(1);
      expect(resp.stdout).to.contain('error TS1003: Identifier expected');
    });

    it('should not transpile with babel if there is tsconfig', () => {
      const resp = test
        .setup({
          'src/a.js': 'const a = 1;',
          'src/b.ts': 'const b = 2;',
          'tsconfig.json': fx.tsconfig(),
          '.babelrc': `{"plugins": ["transform-es2015-block-scoping"]}`,
          'pom.xml': fx.pom(),
          'package.json': `{
              "name": "a",\n
              "version": "1.0.4",\n
              "dependencies": {\n
                "babel-plugin-transform-es2015-block-scoping": "latest"\n
              },
              "yoshi": {
                "entry": "./a.js"
              }}`

        }, [hooks.installDependencies])
        .execute('build');

      expect(resp.code).to.equal(0);
      expect(test.list('dist/src')).not.to.contain('a.js');
      expect(test.content('dist/src/b.js')).to.contain('var b = 2');
    });
  });

  describe('No individual transpilation', () => {
    it('should not transpile if no tsconfig/babelrc', () => {
      const resp = test
        .setup({
          'src/b.ts': 'const b = 2;',
          'src/a/a.js': 'const a = 1;',
          'package.json': fx.packageJson()
        })
        .execute('build');

      expect(resp.stdout).to.not.contain(`Finished 'babel'`);
      expect(resp.code).to.equal(0);
      expect(test.list('/')).not.to.include('dist');
    });

    it('should not transpile if runIndividualTranspiler = false', () => {
      const resp = test
        .setup({
          '.babelrc': '{}',
          'src/b.ts': 'const b = 2;',
          'src/a/a.js': 'const a = 1;',
          'package.json': fx.packageJson({
            runIndividualTranspiler: false
          })
        })
        .execute('build');

      expect(resp.stdout).to.not.contain(`Finished 'babel'`);
      expect(resp.code).to.equal(0);
      expect(test.list('/')).not.to.include('dist');
    });
  });

  describe('Bundle', () => {
    ['fs', 'net', 'tls'].forEach(moduleName => {
      it(`should not fail to require node built-ins such as ${moduleName}`, () => {
        const res = test
          .setup({
            'src/client.js': `require('${moduleName}');`,
            'package.json': fx.packageJson(),
            'pom.xml': fx.pom()
          })
          .execute('build');

        expect(res.code).to.equal(0);
      });
    });

    it(`should not fail to require electron`, () => {
      const res = test
        .setup({
          'src/client.js': `require('electron');`,
          'package.json': fx.packageJson(),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
    });

    it('should generate a bundle', () => {
      const res = test
        .setup({
          'src/client.js': `const aFunction = require('./dep');const a = aFunction(1);`,
          'src/dep.js': `module.exports = function(a){return a + 1;};`,
          'package.json': fx.packageJson(),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.list('dist/statics')).to.contain('app.bundle.js');
      expect(test.content('dist/statics/app.bundle.js')).to.contain('const a = aFunction(1);');
      expect(test.content('dist/statics/app.bundle.js')).to.contain('module.exports = function (a)');
    });

    it('should fail with exit code 1', () => {
      const res = test
        .setup({
          'src/client.js': `const aFunction = require('./dep');const a = aFunction(1);`,
          'src/dep.js': `module.exports = a => {`,
          'package.json': fx.packageJson(),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(1);
      expect(res.stdout).to.contain('Unexpected token (2:0)');
    });

    it('should generate a bundle using different entry', () => {
      const res = test
        .setup({
          'src/app-final.js': `const aFunction = require('./dep');const a = aFunction(1);`,
          'src/dep.js': `module.exports = function(a){return a + 1;};`,
          'package.json': fx.packageJson({
            entry: './app-final.js'
          }),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.list('dist/statics').indexOf('app.bundle.js')).to.be.at.least(0);
      expect(test.content('dist/statics/app.bundle.js')).to.contain('const a = aFunction(1);');
      expect(test.content('dist/statics/app.bundle.js')).to.contain('module.exports = function (a)');
    });

    it('should support single entry point in package.json', () => {
      const res = test
        .setup({
          'src/app1.js': `const thisIsWorks = true;`,
          'package.json': fx.packageJson({
            entry: './app1.js'
          }),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content('dist/statics/app.bundle.js')).to.contain('thisIsWorks');
    });

    it('should support multiple entry points in package.json', () => {
      const res = test
        .setup({
          'src/app1.js': `const thisIsWorks = true;`,
          'src/app2.js': `const hello = "world";`,
          'package.json': fx.packageJson({
            entry: {
              first: './app1.js',
              second: './app2.js'
            }
          }),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content('dist/statics/first.bundle.js')).to.contain('thisIsWorks');
      expect(test.content('dist/statics/second.bundle.js')).to.contain('const hello');
    });

    it.skip('should put all of the bundles in the specified directory when --output flag is set', () => {
      const res = test.setup({
        'src/app1.js': `const thisIsWorks = true;`,
        'package.json': fx.packageJson({
          entry: {
            app: './app1.js',
          }
        })
      }).execute('build', ['--output=statics1']);

      expect(res.code).to.equal(0);
      expect(test.list('dist/statics1').indexOf('app.bundle.js')).to.be.at.least(0);
    });

    it('should create sourceMaps for both bundle and specs', () => {
      const res = test
        .setup({
          'src/app.js': `const thisIsWorks = true;`,
          'src/app.spec.js': `const thisIsWorksAgain = true;`,
          'package.json': fx.packageJson({
            entry: './app.js'
          }),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);

      expect(test.content('dist/statics/app.bundle.js')).to.contain('thisIsWorks');
      expect(test.list('dist/statics')).to.contain('app.bundle.js.map');
    });

    it('should bundle the app given importing json file', () => {
      test
        .setup({
          'src/app.js': `require('./some.json')`,
          'src/some.json': `{"json-content": 42}`,
          'package.json': fx.packageJson({
            entry: './app.js'
          }),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(test.content('dist/statics/app.bundle.js')).to.contain(`"json-content": 42`);
    });

    it('should consider babel\'s sourceMaps for bundle', function () {
      this.timeout(120000); // 2min, may be even shorter

      const res = test
        .setup({
          'src/app.js': `const thisIsWorks = true;`,
          'src/app.spec.js': `const thisIsWorksAgain = true;`,
          '.babelrc': `{"plugins": ["transform-es2015-block-scoping"]}`,
          'pom.xml': fx.pom(),
          'package.json': `{\n
              "name": "a",\n
              "version": "1.0.4",\n
              "dependencies": {\n
                "babel-plugin-transform-es2015-block-scoping": "latest"\n
              },
              "yoshi": {
                "entry": "./app.js"
              }
            }`
        }, [hooks.installDependencies])
        .execute('build');

      expect(res.code).to.equal(0);

      expect(test.content('dist/statics/app.bundle.js')).to.contain('var thisIsWorks');
      expect(test.content('dist/statics/app.bundle.js.map')).to.contain('const thisIsWorks');
    });

    it('should generate bundle if entry is a typescript file', () => {
      const res = test
        .setup({
          'src/app.ts': 'console.log("hello");',
          'tsconfig.json': fx.tsconfig(),
          'package.json': fx.packageJson({
            entry: './app.ts'
          }),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.list('dist/statics')).to.contain('app.bundle.js');
    });

    it('should generate bundle if entry extension is omitted by looking for existing .ts or .js files', () => {
      const res = test
        .setup({
          'src/app.ts': 'console.log("hello");',
          'tsconfig.json': fx.tsconfig(),
          'package.json': fx.packageJson({
            entry: './app'
          }),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.list('dist/statics')).to.contain('app.bundle.js');
    });

    it('should allow generating a bundle by default with both .js and .ts extensions', () => {
      const res = test
        .setup({
          'src/client.ts': 'console.log("hello");',
          'tsconfig.json': fx.tsconfig(),
          'package.json': fx.packageJson(),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.list('dist/statics')).to.contain('app.bundle.js');
    });

    it('should generate a minified bundle on ci', () => {
      const res = test
        .setup({
          'src/client.js': `const aFunction = require('./dep');const a = aFunction(1);`,
          'src/dep.js': `module.exports = function(a){return a + 1;};`,
          'package.json': fx.packageJson(),
          'pom.xml': fx.pom()
        })
        .execute('build', [], insideTeamCity);

      expect(res.code).to.equal(0);

      expect(test.list('dist/statics')).to.contain('app.bundle.js');
      expect(test.list('dist/statics')).to.contain('app.bundle.min.js');

      expect(test.list('dist/statics')).to.contain('app.bundle.min.js.map');
      expect(test.list('dist/statics')).to.contain('app.bundle.min.js.map');
    });

    it('should exit with code 1 with a custom entry that does not exist', () => {
      const res = test
        .setup({
          'tsconfig.json': fx.tsconfig(),
          'package.json': fx.packageJson({
            entry: './hello'
          }),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(1);
      expect(test.list('dist/statics')).not.to.contain('app.bundle.js');
    });

    it('should exit with code 1 without a custom entry and default entry not existing', () => {
      const res = test
        .setup({
          'tsconfig.json': fx.tsconfig(),
          'package.json': fx.packageJson(),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.list('dist/statics')).not.to.contain('app.bundle.js');
    });

    it('should not generate a minified version and instead copy the normal bundle inside of TeamCity', () => {
      const res = test
        .setup({
          'src/client.js': `const aFunction = require('./dep');const a = aFunction(1);`,
          'src/dep.js': `module.exports = function(a){return a + 1;};`,
          'package.json': fx.packageJson(),
          'pom.xml': fx.pom()
        })
        .execute('build', [], outsideTeamCity);

      expect(res.code).to.equal(0);
      expect(test.content('dist/statics/app.bundle.js')).to.eql(test.content('dist/statics/app.bundle.min.js'));
    });

    it('should generate a minified version inside of TeamCity', () => {
      const res = test
        .setup({
          'src/client.js': `const aFunction = require('./dep');const a = aFunction(1);`,
          'src/dep.js': `module.exports = function(a){return a + 1;};`,
          'package.json': fx.packageJson(),
          'pom.xml': fx.pom()
        })
        .execute('build', [], insideTeamCity);

      expect(res.code).to.equal(0);
      expect(test.content('dist/statics/app.bundle.js')).not.to.eql(test.content('dist/statics/app.bundle.min.js'));
    });
  });

  describe('Bundle output with library support', () => {
    it('should generate a bundle with umd library support', () => {
      const res = test
        .setup({
          'src/client.js': '',
          'package.json': fx.packageJson({
            exports: 'MyLibraryEndpoint'
          })
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content('dist/statics/app.bundle.js')).to.contain('exports["MyLibraryEndpoint"]');
      expect(test.content('dist/statics/app.bundle.js')).to.contain('root["MyLibraryEndpoint"]');
    });

    it('should generate a bundle with named amd library support', () => {
      const res = test
        .setup({
          'src/client.js': '',
          'package.json': fx.packageJson({
            exports: 'MyLibraryEndpoint'
          })
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content('dist/statics/app.bundle.js')).to.contain('define("MyLibraryEndpoint", [], factory)');
    });
  });

  describe('Bundle - sass', () => {

    const generateCssModulesPattern = (name, path, pattern = `[hash:base64:5]`) => {
      const genericNames = require('generic-names');
      const generate = genericNames(pattern);
      return generate(name, path);
    };

    it('should generate a bundle with css', () => {
      const res = test
        .setup({
          'src/client.js': 'require(\'./style.scss\');',
          'src/style.scss': `.a {.b {color: red;}}`,
          'package.json': fx.packageJson({
            separateCss: false,
            cssModules: false
          })
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content('dist/statics/app.bundle.js')).to.contain('.a .b');
    });

    it.skip('should fail with exit code 1', () => {
      const res = test
        .setup({
          'src/client.js': 'require(\'./style1.scss\');',
          'src/style.scss': `.a {.b {color: red;}}`,
          'package.json': fx.packageJson()
        })
        .execute('build');

      expect(res.code).to.equal(1);
      expect(test.list('dist', '-R')).to.not.include('statics/app.bundle.js');
    });

    it('should separate Css from bundle', () => {
      const res = test
        .setup({
          'src/client.js': 'require(\'./style.scss\');',
          'src/style.scss': `.a {.b {color: red;}}`,
          'package.json': fx.packageJson(),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content('dist/statics/app.bundle.js')).not.to.contain('{\n  color: red; }');
      expect(test.content('dist/statics/app.css')).to.contain('{\n  color: red; }');
    });

    it('should create a separate css file for each entry', () => {
      const res = test
        .setup({
          'src/client.js': 'require(\'./client-styles.scss\');',
          'src/settings.js': 'require(\'./settings-styles.scss\');',
          'src/client-styles.scss': `.a {.b {color: red;}}`,
          'src/settings-styles.scss': `.c {.d {color: purple;}}`,
          'package.json': fx.packageJson({
            entry: {
              app: './client.js',
              settings: './settings.js'
            }
          }),
          'pom.xml': fx.pom()
        })
        .execute('build');
      expect(res.code).to.equal(0);
      expect(test.list('./dist/statics')).to.contain.members(['app.css', 'settings.css']);
    });

    it.skip('should generate css modules on bundle', () => {
      const res = test
        .setup({
          'src/client.js': 'require(\'./styles/my-file.scss\');',
          'src/styles/my-file.scss': `.a {.b {color: red;}}`,
          'package.json': fx.packageJson()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content(`dist/${defaultOutput}/app.bundle.js`)).to.contain('.styles-__my-file__a__');
      expect(test.content(`dist/${defaultOutput}/app.bundle.js`)).to.contain('.styles-__my-file__b__');
    });

    it('should generate (runtime) css modules on production with hash only', function () {
      this.timeout(60000);

      const hash = generateCssModulesPattern('a', 'styles/my-file.css');
      const expectedCssMap = `{ a: '${hash}' }\n`;
      const myTest = tp.create('src/index');
      const res = myTest
        .setup({
          'src/index.js': `require('css-modules-require-hook')({
            rootDir: './src',
            generateScopedName: require('${__dirname}/../config/css-scope-pattern'),
            extensions: ['.scss', '.css'],
            camelCase: true
          });
          const s = require('./styles/my-file.css')
          console.log(s);
          `,
          'src/styles/my-file.css': `.a {color: red;}`,
          'package.json': `{
            "name": "a",\n
            "version": "1.0.4",\n
            "dependencies": {\n
              "css-modules-require-hook": "latest"\n
            },
            "yoshi": {
              "cssModules": true,
              "separateCss": true
            }
          }`,
          'pom.xml': fx.pom()
        }, [hooks.installDependencies])
        .execute('', [], {NODE_ENV: 'production', SHORT_CSS_PATTERN: true});

      expect(res.code).to.equal(0);
      expect(res.stdout).to.equal(expectedCssMap);
      myTest.teardown();
    });

    it('should NOT generate (runtime) css modules on production with hash only', function () {
      this.timeout(60000);

      const hash = generateCssModulesPattern('a', 'styles/my-file.css', '[path][name]__[local]__[hash:base64:5]');
      const expectedCssMap = `{ a: '${hash}' }\n`;
      const myTest = tp.create('src/index');
      const res = myTest
        .setup({
          'src/index.js': `require('css-modules-require-hook')({
            rootDir: './src',
            generateScopedName: require('${__dirname}/../config/css-scope-pattern'),
            extensions: ['.scss', '.css'],
            camelCase: true
          });
          const s = require('./styles/my-file.css')
          console.log(s);
          `,
          'src/styles/my-file.css': `.a {color: red;}`,
          'package.json': `{
            "name": "a",\n
            "version": "1.0.4",\n
            "dependencies": {\n
              "css-modules-require-hook": "latest"\n
            },
            "yoshi": {
              "cssModules": true,
              "separateCss": true
            }
          }`,
          'pom.xml': fx.pom()
        }, [hooks.installDependencies])
        .execute('', [], {NODE_ENV: 'production'});

      expect(res.code).to.equal(0);
      expect(res.stdout).to.equal(expectedCssMap);
      myTest.teardown();
    });

    it('should generate css modules on CI with hash only', () => {
      const hashA = generateCssModulesPattern('a', 'styles/my-file.scss');
      const hashB = generateCssModulesPattern('b', 'styles/my-file.scss');

      const expectedCssPattern = `.${hashA} .${hashB} {`;
      const res = test
        .setup({
          'src/client.js': 'require(\'./styles/my-file.scss\');',
          'src/styles/my-file.scss': `.a {.b {color: red;}}`,
          'package.json': fx.packageJson({
            cssModules: true,
            separateCss: true
          }),
          'pom.xml': fx.pom()
        })
        .execute('build', [], Object.assign({}, insideTeamCity, {SHORT_CSS_PATTERN: true}));

      expect(res.code).to.equal(0);
      expect(test.content(`dist/${defaultOutput}/app.css`)).to.contain(expectedCssPattern);
    });

    it('should NOT generate css modules on CI with hash only', () => {
      const hashA = generateCssModulesPattern('a', 'styles/my-file.scss', '[path][name]__[local]__[hash:base64:5]');
      const hashB = generateCssModulesPattern('b', 'styles/my-file.scss', '[path][name]__[local]__[hash:base64:5]');

      const expectedCssPattern = `.${hashA} .${hashB} {`;
      const res = test
        .setup({
          'src/client.js': 'require(\'./styles/my-file.scss\');',
          'src/styles/my-file.scss': `.a {.b {color: red;}}`,
          'package.json': fx.packageJson({
            cssModules: true,
            separateCss: true
          }),
          'pom.xml': fx.pom()
        })
        .execute('build', [], insideTeamCity);

      expect(res.code).to.equal(0);
      expect(test.content(`dist/${defaultOutput}/app.css`)).to.contain(expectedCssPattern);
    });

    it('should generate css modules on separate css file', () => {
      const regex = /\.styles-my-file__a__.{5}\s.styles-my-file__b__.{5}\s{/;
      const res = test
        .setup({
          'src/client.js': 'require(\'./styles/my-file.scss\');',
          'src/styles/my-file.scss': `.a {.b {color: red;}}`,
          'package.json': fx.packageJson({
            cssModules: true,
            separateCss: true
          }),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content(`dist/${defaultOutput}/app.bundle.js`)).not.to.match(regex);
      expect(test.content(`dist/${defaultOutput}/app.css`)).to.match(regex);
    });

    it('should generate css modules as default', () => {
      const regex = /\.styles-my-file__a__.{5}\s.styles-my-file__b__.{5}\s{/;
      const res = test
        .setup({
          'src/client.js': 'require(\'./styles/my-file.scss\');',
          'src/styles/my-file.scss': `.a {.b {color: red;}}`,
          'package.json': fx.packageJson(),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content(`dist/${defaultOutput}/app.bundle.js`)).not.to.match(regex);
      expect(test.content(`dist/${defaultOutput}/app.css`)).to.match(regex);
    });

    it('should disable css modules', () => {
      const res = test
        .setup({
          'src/client.js': 'require(\'./styles/my-file.scss\');',
          'src/styles/my-file.scss': `.a {.b {color: red;}}`,
          'package.json': fx.packageJson({
            cssModules: false,
            separateCss: true
          }),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content(`dist/${defaultOutput}/app.css`)).to.contain('.a .b {');
    });

    it('should disable css modules for .global.scss files', () => {
      const res = test
        .setup({
          'src/client.js': 'require(\'./styles/my-file.global.scss\');',
          'src/styles/my-file.global.scss': `.a {.b {color: red;}}`,
          'package.json': fx.packageJson({
            separateCss: true
          }),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content(`dist/${defaultOutput}/app.css`)).to.contain('.a .b {');
    });

    it.skip('should generate a bundle with svg/images', () => {
      const res = test
        .setup({
          'src/client.js': 'require(\'./style.scss\');',
          'src/style.scss': `.button {
                                background: url("./icon.svg") no-repeat center center;
                                background: url("./image.png") no-repeat center center;
                                background: url("./image.jpg") no-repeat center center;
                                background: url("./image.gif") no-repeat center center;
                              }`,
          'src/icon.svg': '',
          'src/image.gif': '',
          'src/image.jpg': '',
          'src/image.png': '',
          'package.json': fx.packageJson({
            separateCss: false
          })
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content(`dist/${defaultOutput}/app.bundle.js`)).to.match(/icon.\w+.svg/g);
      expect(test.content(`dist/${defaultOutput}/app.bundle.js`)).to.match(/image.\w+.png/g);
      expect(test.content(`dist/${defaultOutput}/app.bundle.js`)).to.match(/image.\w+.jpg/g);
      expect(test.content(`dist/${defaultOutput}/app.bundle.js`)).to.match(/image.\w+.gif/g);
    });

    it.skip('should generate a bundle with @font-face', () => {
      const res = test
        .setup({
          'src/client.js': 'require(\'./style.scss\');',
          'src/style.scss': `@font-face {
                              font-family: 'icomoon';
                              src:  url('assets/fonts/icomoon.eot?7yf4s0');
                              src:  url('assets/fonts/icomoon.eot?7yf4s0#iefix') format('embedded-opentype'),
                                url('assets/fonts/icomoon.ttf?7yf4s0') format('truetype'),
                                url('assets/fonts/icomoon.woff?7yf4s0') format('woff'),
                                url('assets/fonts/icomoon.svg?7yf4s0#icomoon') format('svg');
                              font-weight: normal;
                              font-style: normal;
                            }`,
          'src/assets/fonts/icomoon.eot': '',
          'src/assets/fonts/icomoon.ttf': '',
          'src/assets/fonts/icomoon.woff': '',
          'src/assets/fonts/icomoon.svg': '',
          'package.json': fx.packageJson({
            separateCss: false
          })
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content(`dist/${defaultOutput}/app.bundle.js`)).to.match(/icomoon.\w+.eot/g);
      expect(test.content(`dist/${defaultOutput}/app.bundle.js`)).to.match(/icomoon.\w+.ttf/g);
      expect(test.content(`dist/${defaultOutput}/app.bundle.js`)).to.match(/icomoon.\w+.woff/g);
      expect(test.content(`dist/${defaultOutput}/app.bundle.js`)).to.match(/icomoon.\w+.svg/g);
    });

    describe('autoprefixer', () => {
      it.skip('should generate css attributes prefixes', () => {
        const res = test
          .setup({
            'src/client.js': 'require(\'./style.scss\');',
            'src/style.scss': `.a {
                                display: flex;
                              }`,
            'package.json': fx.packageJson({
              separateCss: false
            })
          })
          .execute('build');

        expect(res.code).to.equal(0);
        expect(test.content(`dist/${defaultOutput}/app.bundle.js`)).to.match(/display: -webkit-box;/g);
        expect(test.content(`dist/${defaultOutput}/app.bundle.js`)).to.match(/display: -ms-flexbox;/g);
        expect(test.content(`dist/${defaultOutput}/app.bundle.js`)).to.match(/display: flex;/g);
      });

      it('should generate css attributes prefixes for on separate css file', () => {
        const res = test
          .setup({
            'src/client.js': 'require(\'./style.scss\');',
            'src/style.scss': `.a {
                                display: flex;
                              }`,
            'package.json': fx.packageJson({
              cssModules: true,
              separateCss: true
            }),
            'pom.xml': fx.pom()
          })
          .execute('build');

        expect(res.code).to.equal(0);
        expect(test.content(`dist/${defaultOutput}/app.css`)).to.match(/display: -webkit-box;/g);
        expect(test.content(`dist/${defaultOutput}/app.css`)).to.match(/display: -ms-flexbox;/g);
        expect(test.content(`dist/${defaultOutput}/app.css`)).to.match(/display: flex;/g);
      });

      it('should generate separated minified Css from bundle on ci', () => {
        const res = test
          .setup({
            'src/client.js': 'require(\'./style.scss\');',
            'src/style.scss': `.a {.b {color: red;}}`,
            'package.json': fx.packageJson(),
            'pom.xml': fx.pom()
          })
          .execute('build', [], insideTeamCity);

        expect(res.code).to.equal(0);
        expect(test.content('dist/statics/app.bundle.js')).not.to.contain('{\n  color: red; }');
        expect(test.content('dist/statics/app.min.css')).to.contain('{color:red}');
      });
    });
  });

  describe.skip('Specs Bundle', () => {
    describe('when an entry point does not exist', () => {
      it('should not generate a bundle with that configuration', () => {
        const res = test
          .setup({
            'src/client.js': `module.exports = 'hello'`,
            'src/server.js': `module.exports = 'world'`,
            'package.json': fx.packageJson()
          })
          .execute('build');

        expect(res.code).to.equal(0);
        expect(test.content('dist/statics/app.bundle.js')).not.to.equal('');
        expect(test.content('dist/server.bundle.js')).to.equal('');
        expect(test.content('dist/config.bundle.js')).to.equal('');
      });
    });

    it('should generate a bundle', () => {
      const res = test
        .setup({
          'src/client.js': `const add1 = a => {return a + 1;};module.exports = add1;`,
          'src/app.spec.js': `const add1 = require('./client');const a = add1(1);`,
          'src/appTwo.spec.js': `const add1 = require('./client');const b = add1(2);`,
          'package.json': fx.packageJson()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.list('dist')).to.contain('specs.bundle.js');
      expect(test.content('dist/specs.bundle.js')).to.contain('const a = add1(1);');
      expect(test.content('dist/specs.bundle.js')).to.contain('const b = add1(2);');
      expect(test.content('dist/specs.bundle.js')).to.contain('return a + 1;');
    });

    it('should consider custom specs.browser globs if configured', () => {
      const res = test
        .setup({
          'src/client.js': '',
          'some/other/app.js': `const add1 = a => { return a + 1; }; module.exports = add1;`,
          'some/other/app.glob.js': `const add1 = require("./app"); const a = add1(2);`,
          'package.json': fx.packageJson({
            specs: {
              browser: 'some/other/*.glob.js'
            }
          })
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content('dist/specs.bundle.js')).to.contain('const a = add1(2);');
      expect(test.content('dist/specs.bundle.js')).to.contain('return a + 1;');
    });

    it('should generate a bundle with css', () => {
      const res = test
        .setup({
          'src/client.js': `require('./style.css');const add1 = a => {return a + 1;};module.exports = add1;`,
          'src/app.spec.js': `const add1 = require('./client');const a = add1(2);`,
          'src/style.scss': `.a {.b {color: red;}}`,
          'package.json': fx.packageJson({
            separateCss: false
          })
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content('dist/specs.bundle.js')).to.contain('.a .b');
    });

    it('should separate css from bundle', () => {
      const res = test
        .setup({
          'src/client.js': `require('./style.css');const add1 = a => {return a + 1;};module.exports = add1;`,
          'src/app.spec.js': `const add1 = require('./client');const a = add1(2);`,
          'src/style.scss': `.a {.b {color: red;}}`,
          'package.json': fx.packageJson({
            separateCss: true
          })
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content('dist/statics/app.bundle.js')).not.to.contain('.a .b');
      expect(test.list('dist/statics')).to.contain('app.css');
      expect(test.content('dist/statics/app.css')).to.contain('.a .b');
    });

    it('should separate css from bundle by default', () => {
      const res = test
        .setup({
          'src/client.js': `require('./style.css');const add1 = a => {return a + 1;};module.exports = add1;`,
          'src/app.spec.js': `const add1 = require('./client');const a = add1(2);`,
          'src/style.scss': `.a {.b {color: red;}}`,
          'package.json': fx.packageJson()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content('dist/statics/app.bundle.js')).not.to.contain('.a .b');
      expect(test.list('dist/statics')).to.contain('app.css');
      expect(test.content('dist/statics/app.css')).to.contain('.a .b');
    });

  });

  describe('yoshi-copy', () => {
    it('should use yoshi-copy', () => {
      const res = test
        .setup({
          'app/assets/some-file': 'a',
          'src/assets/some-file': 'a',
          'test/assets/some-file': 'a',
          'package.json': fx.packageJson(),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.list(`dist/src/assets`)).to.include('some-file');
    });
  });

  describe('yoshi-maven-statics', () => {
    it('should use yoshi-maven-statics', () => {
      const res = test
        .setup({
          'package.json': fx.packageJson({
            clientProjectName: 'some-client-proj'
          }),
          'pom.xml': fx.pom()
        })
        .execute('build');

      expect(res.code).to.equal(0);
      expect(test.content('maven/assembly/tar.gz.xml').replace(/\s/g, '')).to.contain(`
        <assembly xmlns="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.0 http://maven.apache.org/xsd/assembly-1.1.0.xsd">
            <id>wix-angular</id>
            <baseDirectory>/</baseDirectory>
            <formats>
                <format>tar.gz</format>
            </formats>
            <fileSets>
                <fileSet>
                    <directory>\${project.basedir}/node_modules/some-client-proj/dist</directory>
                    <outputDirectory>/</outputDirectory>
                    <includes>
                        <include>*</include>
                        <include>*/**</include>
                    </includes>
                </fileSet>
            </fileSets>
        </assembly>
      `.replace(/\s/g, ''));
    });
  });

  describe('yoshi-clean', () => {
    it('should use yoshi-clean', () => {
      const res = test
        .setup({
          '.babelrc': '{}',
          'dist/old.js': `const hello = "world!";`,
          'src/new.js': 'const world = "hello!";',
          'package.json': fx.packageJson()
        })
        .execute('build');

      expect(res.code).to.be.equal(0);
      expect(res.stdout).to.include(`Finished 'clean'`);
      expect(test.list('dist')).to.not.include('old.js');
      expect(test.list('dist/src')).to.include('new.js');
    });
  });

  describe('yoshi-update-node-version', () => {
    it('should use yoshi-update-node-version', () => {
      const nodeVersion = readFileSync(require.resolve('../templates/.nvmrc'), {
        encoding: 'utf-8'
      }).trim();
      const res = test
        .setup({
          'package.json': fx.packageJson(),
          '.nvmrc': '0'
        })
        .execute('build', [], outsideTeamCity);

      expect(res.code).to.be.equal(0);
      expect(test.content('.nvmrc')).to.equal(nodeVersion);
    });
  });

  describe('yoshi-petri', () => {
    it('should use yoshi-petri', () => {
      test
        .setup({
          'petri-specs/specs.infra.Dummy.json': fx.petriSpec(),
          'package.json': fx.packageJson()
        })
        .execute('build');

      expect(test.list('dist', '-R')).to.contain('statics/petri-experiments.json');
    });

    it.skip('should do nothing if there is no petri-specs installed', () => {
      // TODO: figure out how to simulate module doesn't exist in registry
    });
  });
});
