'use strict';

const {CLIEngine} = require('eslint');
const {logIf} = require('yoshi/lib/log');
const {base} = require('yoshi/lib/globs');
const {readDir, logIfAny} = require('./utils');

const files = ['*.js', `${base()}/**/*.js`];

function eslint() {
  return Promise.resolve().then(() => {
    const cli = new CLIEngine();
    const results = cli.executeOnFiles(files).results;
    const formatter = cli.getFormatter();
    const errors = CLIEngine.getErrorResults(results);
    logIfAny(formatter(results));
    return errors.length && Promise.reject();
  });
}

module.exports = logIf(eslint, () => readDir(files).length > 0);
