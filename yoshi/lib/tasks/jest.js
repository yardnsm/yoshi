'use strict';

const jestCli = require('jest-cli');
const config = require('../../config/project').jestConfig();
const {inTeamCity} = require('../utils');

module.exports = ({log, watch}) => {
  function jest() {
    if (inTeamCity()) {
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
