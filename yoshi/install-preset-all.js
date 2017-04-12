#!/usr/bin/env node

const {execSync} = require('child_process');
const projectConfig = require('./config/project');

const preset = projectConfig.hasPreset();

if (!preset) {
  execSync('npm install --silent yoshi-preset-all', {stdio: 'inherit'});
}
