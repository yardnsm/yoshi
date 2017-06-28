'use strict';

const gulp = require('gulp');
const Jasmine = require('jasmine');
const {TerminalReporter, TeamCityReporter} = require('jasmine-reporters');
const projectConfig = require('../../config/project');
const globs = require('../globs');
const isCI = require('is-ci');

const files = projectConfig.specs.node() || globs.specs();
require('../require-hooks'); // TODO: remove once jasmine is spawned in a child process

function runJasmine() {
  return new Promise((resolve, reject) => {
    process.env.NODE_ENV = 'test';
    process.env.SRC_PATH = './src';

    const jasm = new Jasmine();
    jasm.addReporter(new TerminalReporter({color: true, verbosity: 2}));

    if (isCI) {
      jasm.addReporter(new TeamCityReporter());
    }

    jasm.onComplete(passed => passed ? resolve() : reject());
    jasm.execute([].concat(files));
  });
}

module.exports = ({log, watch}) => {
  function jasmine() {
    if (watch) {
      gulp.watch(`${globs.base()}/**/*`, runJasmine);
    }

    return runJasmine();
  }

  return log(jasmine);
};
