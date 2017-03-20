'use strict';

const {CLIEngine} = require('eslint');
const globs = require('../globs');
const {readDir, logIfAny} = require('../utils');

const files = globs.eslint();

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

module.exports = ({logIf}) => {
  return logIf(eslint, () => readDir(files).length > 0);
};
