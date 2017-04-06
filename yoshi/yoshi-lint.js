#!/usr/bin/env node

const {watchMode, isTypescriptProject, isBabelProject} = require('./lib/utils');
const projectConfig = require('./config/project');

if (watchMode()) {
  process.exit(0);
}

const program = require('commander');
const run = require('./lib/run');

program
	.parse(process.argv);

const {lint} = require('yoshi-preset-all')({isTypescriptProject, isBabelProject, projectConfig})(program);
run(lint, program);
