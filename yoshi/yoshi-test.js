#!/usr/bin/env node
'use strict';

const {isTypescriptProject, isBabelProject} = require('./lib/utils');
const projectConfig = require('./config/project');

const program = require('commander');
const run = require('./lib/run');

program
  .option('--mocha', 'run unit tests on mocha')
  .option('--jasmine', 'run unit tests on jasmine')
  .option('--karma', 'run unit tests on karma')
  .option('--jest', 'run unit tests on qjest')
  .option('--protractor', 'run e2e on protractor')
  .parse(process.argv);

const {test} = require('yoshi-preset-all')({isTypescriptProject, isBabelProject, projectConfig})(program);
run(test, program);
