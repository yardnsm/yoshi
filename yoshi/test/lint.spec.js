const {expect} = require('chai');

const tp = require('./helpers/test-phases');
const fx = require('./helpers/fixtures');
const {outsideTeamCity, insideTeamCity} = require('./helpers/env-variables');

describe('Aggregator: Lint', () => {
  const test = tp.create();
  afterEach(() => test.teardown());

  describe('TSLint', () => {
    it('should pass with exit code 0', () => {
      const res = test
        .setup({
          'app/a.ts': `parseInt("1", 10);`,
          'package.json': fx.packageJson(),
          'tsconfig.json': fx.tsconfig(),
          'tslint.json': fx.tslint()
        })
        .execute('lint');

      expect(res.code).to.equal(0);
    });

    it('should fail with exit code 1', () => {
      const res = test
        .setup({
          'app/a.ts': `parseInt("1");`,
          'package.json': fx.packageJson(),
          'tsconfig.json': fx.tsconfig(),
          'tslint.json': fx.tslint()
        })
        .execute('lint');

      expect(res.code).to.equal(1);
      expect(res.stdout).to.contain('Missing radix parameter');
    });

    it('should fail with exit code 1 (tsx)', () => {
      const res = test
        .setup({
          'app/a.tsx': `parseInt("1");`,
          'package.json': fx.packageJson(),
          'tsconfig.json': fx.tsconfig(),
          'tslint.json': fx.tslint()
        })
        .execute('lint');

      expect(res.code).to.equal(1);
      expect(res.stdout).to.contain('Missing radix parameter');
    });

    it('should skip d.ts files', () => {
      // tslint would fail on app/a.d.ts, but it would be skipped
      // and thus the res.code should be 0.
      const res = test
        .setup({
          'app/a.d.ts': `parseInt("1");`,
          'package.json': fx.packageJson(),
          'tsconfig.json': fx.tsconfig(),
          'tslint.json': fx.tslint()
        })
        .execute('lint');

      expect(res.code).to.equal(0);
    });
  });

  describe('ESLint', () => {

    function setup(data) {
      return test.setup(Object.assign({
        'package.json': fx.packageJson(),
        '.eslintrc': fx.eslintrc()
      }, data));
    }

    it('should lint js files in the root folder too', () => {
      const res = setup({'a.js': 'parseInt("1");'}).execute('lint', [], insideTeamCity);
      expect(res.code).to.equal(1);
      expect(res.stdout).to.contain('1:1  error  Missing radix parameter  radix');
    });

    it('should pass with exit code 0', () => {
      const res = setup({'app/a.js': `parseInt("1", 10);`}).execute('lint', [], insideTeamCity);
      expect(res.code).to.equal(0);
    });

    it('should fail with exit code 1', () => {
      const res = setup({'app/a.js': `parseInt("1");`}).execute('lint', [], insideTeamCity);
      expect(res.code).to.equal(1);
      expect(res.stdout).to.contain('1:1  error  Missing radix parameter  radix');
    });

    it('should fail with exit code 1 in outside of ci', () => {
      const res = setup({'app/a.js': `parseInt("1");`}).execute('lint', [], outsideTeamCity);
      expect(res.code).to.equal(1);
      expect(res.stdout).to.contain('1:1  error  Missing radix parameter  radix');
    });
  });

  describe('Stylelint', () => {
    it('should pass with exit code 0', () => {

      const goodStyle = `
p {
  $color: #ff0;
  color: #ff0;
}`;
      const res = test
        .setup({
          'src/a.sass': goodStyle,
          'src/a.scss': goodStyle,
          'a.less': goodStyle,
          'package.json': `{
            "name": "a",\n
            "version": "1.0.0",\n
            "stylelint": {
              "rules": {
                "max-empty-lines": 1
              }
            }
          }`
        })
        .execute('lint', []);

      expect(res.stdout).to.contain(`Starting 'stylelint'`);
      expect(res.stdout).to.contain(`Finished 'stylelint'`);
      expect(res.code).to.equal(0);
    });

    it('should fail with exit code 1', () => {
      const badStyle = `
p {
  color: #ff0;
}




`;

      const res = test
        .setup({
          'src/a.sass': badStyle,
          'src/a.scss': badStyle,
          'package.json': `{
            "name": "a",\n
            "version": "1.0.0",\n
            "stylelint": {
              "rules": {
                "max-empty-lines": 1
              }
            }
          }`
        })
        .execute('lint', []);

      expect(res.stdout).to.contain('✖  Expected no more than 1 empty line(s)   max-empty-lines');
      expect(res.code).to.equal(1);
    });

    it('should fail with exit code 1 with only a .less file', () => {
      const badStyle = `
p {
  color: #ff0;
}




`;

      const res = test
        .setup({
          'src/a.less': badStyle,
          'package.json': `{
            "name": "a",\n
            "version": "1.0.0",\n
            "stylelint": {
              "rules": {
                "max-empty-lines": 1
              }
            }
          }`
        })
        .execute('lint', []);

      expect(res.stdout).to.contain('✖  Expected no more than 1 empty line(s)   max-empty-lines');
      expect(res.code).to.equal(1);
    });


  });

  describe('Empty state', () => {
    it('should pass out of the box if no relevant files exist', () => {

      const res = test
        .setup({
          'package.json': fx.packageJson()
        })
        .execute('lint');

      expect(res.code).to.equal(0);
    });
  });
});
