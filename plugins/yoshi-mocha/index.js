'use strict';

const path = require('path');
const gulp = require('gulp');
const spawn = require('cross-spawn');

const mochaBin = path.join('mocha', 'bin', 'mocha');
const env = Object.assign(process.env, {NODE_ENV: 'test', SRC_PATH: './src'});

module.exports = ({log, watch, base, projectConfig, inTeamCity}) => {
  const files = projectConfig.specs.node() || `${base()}/**/*.spec.+(js|ts){,x}`;
  const options = {cwd: process.cwd(), env, stdio: 'inherit'};

  const args = {
    reporter: inTeamCity() ? 'mocha-teamcity-reporter' : 'progress',
    timeout: 30000,
    recursive: true,
    require: [
      // absolute('require-hooks'),
      absolute('mocha-setup')
    ]
  };

  function runMocha() {
    return new Promise((resolve, reject) => {
      const proc = spawn('node', [require.resolve(mochaBin), ...toCliArgs(args), files], options);
      proc.on('close', code => code ? reject() : resolve());
    });
  }

  function mocha() {
    if (watch) {
      gulp.watch(`${base()}/**/*`, runMocha);
    }

    return runMocha();
  }

  return log(mocha);
};

function absolute(...a) {
  return path.join(__dirname, ...a);
}

function toCliArgs(args) {
  return Object.keys(args).reduce((result, name) => {
    return [...result, ...decorate(args[name], name)];
  }, []);
}

function decorate(value, name) {
  return []
    .concat(value)
    .map(val => [`--${name}`].concat(val === true ? [] : String(val)))
    .reduce((acc, val) => [...acc, ...val], []);
}
