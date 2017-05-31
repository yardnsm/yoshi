'use strict';

const {CLIEngine} = require('eslint');
const {readDir, logIfAny} = require('./utils');

module.exports = ({logIf, base}) => {
  const files = ['*.js', `${base()}/**/*.js`];

  function eslint() {
    return Promise.resolve().then(() => {
      const cli = new CLIEngine({cache: true, cacheLocation: 'target/.eslintcache'});
      const results = cli.executeOnFiles(files).results;
      const formatter = cli.getFormatter();
      const errors = CLIEngine.getErrorResults(results);
      logIfAny(formatter(results));
      return errors.length && Promise.reject();
    });
  }

  return logIf(eslint, () => readDir(files).length > 0);
};
