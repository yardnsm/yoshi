#!/usr/bin/env node

const {watchMode, loadPreset} = require('./lib/utils');

if (watchMode()) {
  process.exit(0);
}

const program = require('commander');
const run = require('./lib/run');

program
	.parse(process.argv);

const {lint} = loadPreset(program);
run(lint, program);
