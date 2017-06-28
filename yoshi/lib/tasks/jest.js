'use strict';

const jestCli = require('jest-cli');
const config = require('../../config/project').jestConfig();
const isCI = require('is-ci');

module.exports = ({log, watch}) => {
  function jest() {
    if (isCI) {
      config.testResultsProcessor = 'jest-teamcity-reporter';
      process.argv.push('--teamcity');
    }

    return new Promise((resolve, reject) => {
      jestCli.runCLI({watch, config}, [process.cwd()], result => {
        result.success ? resolve() : reject('jest failed');
      });
    });
  }

  return log(jest);
};
