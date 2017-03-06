'use strict';

const gulp = require('gulp');
const Jasmine = require('jasmine');
const {TerminalReporter, TeamCityReporter} = require('jasmine-reporters');
const projectConfig = require('../../config/project');
const globs = require('../globs');
const {inTeamCity} = require('../utils');
const {log} = require('../log');
const {watchMode} = require('../utils');

const watch = watchMode();
const files = projectConfig.specs.node() || globs.specs();

module.exports = log(jasmine);

function jasmine() {
  if (watch) {
    gulp.watch(`${globs.base()}/**/*`, runJasmine);
  }

  return runJasmine();
}

function runJasmine() {
  return new Promise((resolve, reject) => {
    process.env.NODE_ENV = 'test';
    process.env.SRC_PATH = './src';

    const jasm = new Jasmine();
    jasm.addReporter(new TerminalReporter({color: true, verbosity: 2}));

    if (inTeamCity()) {
      jasm.addReporter(new TeamCityReporter());
    }

    jasm.onComplete(passed => passed ? resolve() : reject());
    jasm.execute([].concat(files));
  });
}
