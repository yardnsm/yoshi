#!/usr/bin/env node

const {watchMode} = require('./lib/utils');

if (watchMode()) {
  process.exit(0);
}

const program = require('commander');
const run = require('./lib/run');
const build = require('./lib/tasks/aggregators/build');

program
  .option('--output <dir>', 'output directory for the static assets', 'statics')
  .parse(process.argv);

run(program)(build);
