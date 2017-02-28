'use strict';

const {CLIEngine} = require('eslint');
const globs = require('../globs');
const {readDir} = require('../utils');
const {logIf} = require('../log');

const files = globs.eslint();

function eslint() {
  return Promise.resolve().then(() => {
    const cli = new CLIEngine();
    const results = cli.executeOnFiles(files).results;
    const formatter = cli.getFormatter();
    const errors = CLIEngine.getErrorResults(results);
    console.log(formatter(results));
    return errors.length && Promise.reject();
  });
}

module.exports = logIf(eslint, () => readDir(files).length > 0);
