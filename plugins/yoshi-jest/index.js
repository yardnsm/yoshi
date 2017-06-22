'use strict';

const path = require('path');
const jestCli = require('jest-cli');

module.exports = ({log, watch, inTeamCity, projectConfig}) => {
  function jest() {
    const config = projectConfig.jestConfig();

    if (inTeamCity()) {
      config.testResultsProcessor = path.join(__dirname, 'node_modules', 'jest-teamcity-reporter');
    }

    return new Promise((resolve, reject) => {
      jestCli.runCLI({watch, config}, [process.cwd()], result => {
        result.success ? resolve() : reject('jest failed');
      });
    });
  }

  return log(jest);
};
