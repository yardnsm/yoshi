#!/usr/bin/env node

const {watchMode, loadPreset} = require('./lib/utils');

if (watchMode()) {
  process.exit(0);
}

const program = require('commander');
const run = require('./lib/run');

program
  .option('--output <dir>', 'output directory for the static assets', 'statics')
  .parse(process.argv);

const {build} = loadPreset(program);
run(build, program);
