const {expect} = require('chai');

const tp = require('./helpers/test-phases');
const fx = require('./helpers/fixtures');
const {insideTeamCity} = require('./helpers/env-variables');

describe('Aggregator: Lint', () => {
  const test = tp.create();
  afterEach(() => test.teardown());

  describe('yoshi-tslint', () => {
    it('should use yoshi-tslint', () => {
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
  });

  describe('yoshi-eslint', () => {
    function setup(data) {
      return test.setup(Object.assign({
        'package.json': fx.packageJson(),
        '.eslintrc': fx.eslintrc()
      }, data));
    }

    it('should use yoshi-eslint', () => {
      const res = setup({'app/a.js': `parseInt("1", 10);`}).execute('lint', [], insideTeamCity);
      expect(res.code).to.equal(0);
    });

    it('should fail with exit code 1', () => {
      const res = setup({'app/a.js': `parseInt("1");`}).execute('lint', [], insideTeamCity);
      expect(res.code).to.equal(1);
      expect(res.stdout).to.contain('1:1  error  Missing radix parameter  radix');
    });
  });

  describe('yoshi-stylelint', () => {
    it('should use yoshi-stylelint', () => {

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

      expect(res.stdout).to.contain('✖  Expected no more than 1 empty line   max-empty-lines');
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
