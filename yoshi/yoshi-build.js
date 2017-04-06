#!/usr/bin/env node

const {watchMode, isTypescriptProject, isBabelProject} = require('./lib/utils');
const projectConfig = require('./config/project');

if (watchMode()) {
  process.exit(0);
}

const program = require('commander');
const run = require('./lib/run');

program
  .option('--output <dir>', 'output directory for the static assets', 'statics')
  .parse(process.argv);

const {build} = require('yoshi-preset-all')({isTypescriptProject, isBabelProject, projectConfig})(program);
run(build, program);
