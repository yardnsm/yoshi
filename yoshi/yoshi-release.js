#!/usr/bin/env node

const {isTypescriptProject, isBabelProject} = require('./lib/utils');
const projectConfig = require('./config/project');

const program = require('commander');
const run = require('./lib/run');

program
	.parse(process.argv);

const preset = projectConfig.preset();

const {release} = require(preset)({isTypescriptProject, isBabelProject, projectConfig})(program);
run(release, program);
