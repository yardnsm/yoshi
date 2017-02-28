'use strict';

const spawn = require('cross-spawn');
const run = require('../../run');
const clean = require('../clean');
const sass = require('../sass');
const transpile = require('../transpile');
const updateNodeVersion = require('../update-node-version');
const petri = require('../petri');
const targz = require('../targz');
const webpackDevServer = require('../webpack-dev-server');
const copyAssets = require('../copy-assets');
const runServer = require('../run-server');

function start(options) {
  const restartServer = () => options.server && runServer({entryPoint: options.entryPoint});
  const runWithOptions = run({...options, ...{done: restartServer}});

  return runWithOptions(clean, updateNodeVersion)
    .then(() => runWithOptions(sass, petri, targz, copyAssets, webpackDevServer, transpile))
    .then(() => spawn('npm', ['test', '--silent'], {stdio: 'inherit'}));
}

module.exports = start;
