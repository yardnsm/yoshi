#!/usr/bin/env node

const program = require('commander');
const run = require('./lib/run');

program
	.parse(process.argv);

const {release} = require('./lib/yoshi-plugins')(program);
run(release, program);
