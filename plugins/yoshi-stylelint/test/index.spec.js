'use strict';

const {expect} = require('chai');
const tp = require('test-phases');
const stripAnsi = require('strip-ansi');
const intercept = require('intercept-stdout');
const stylelint = require('../index');

describe('Stylelint', () => {
  let test;
  let task;
  let cleanup;
  let stdout = '';

  before(() => cleanup = intercept(s => {
    stdout += stripAnsi(s);
  }));
  beforeEach(() => test = tp.create());
  beforeEach(() => process.chdir(test.tmp));
  beforeEach(() => task = stylelint({base: () => 'src', logIfP: a => a}));

  afterEach(() => test.teardown());
  afterEach(() => stdout = '');
  after(() => cleanup());

  const goodStyle = `
p {
$color: #ff0;
color: #ff0;
}`;

  const badStyle = `
p {
color: #ff0;
}




`;

  it('should pass with exit code 0', () => {
    test.setup({
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
    });

    return task();
  });

  it('should fail with exit code 1', () => {
    test.setup({
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
    });

    return task()
      .then(() => Promise.reject())
      .catch(() => {
        expect(stdout).to.contain('✖  Expected no more than 1 empty line(s)   max-empty-lines');
      });
  });

  it('should fail with exit code 1 with only a .less file', () => {
    test.setup({
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
    });

    return task()
      .then(() => Promise.reject())
      .catch(() => {
        expect(stdout).to.contain('✖  Expected no more than 1 empty line(s)   max-empty-lines');
      });
  });
});
