#!/usr/bin/env node

const spawn = require('cross-spawn');
const {suffix, watchMode, isTypescriptProject, isBabelProject} = require('./lib/utils');
const projectConfig = require('./config/project');

watchMode(true);

const program = require('commander');
const run = require('./lib/run');

program
  .option('-e, --entry-point <entry>', 'entry point of the application', suffix('.js'), 'index.js')
  .option('-n, --no-server', 'run without starting entry-point')
  .parse(process.argv);

const runServer = require('./lib/tasks/run-server');
const restartServer = () => program.server && runServer({entryPoint: program.entryPoint});
Object.assign(program, {done: restartServer});

const preset = projectConfig.preset();

const {start} = require(preset)({isTypescriptProject, isBabelProject, projectConfig})(program);
run(start, program).then(() => spawn('npm', ['test', '--silent'], {stdio: 'inherit'}));
