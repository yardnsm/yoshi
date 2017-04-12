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

const preset = projectConfig.preset();

const {lint} = require(preset)({isTypescriptProject, isBabelProject, projectConfig})(program);
run(lint, program);
