#!/usr/bin/env node

const {loadPreset} = require('./lib/utils');
const projectConfig = require('./config/project');

const program = require('commander');
const run = require('./lib/run');

program
	.parse(process.argv);

const {release} = loadPreset(program);
run(release, program);
