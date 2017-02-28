'use strict';

const del = require('del');
const {log} = require('../run');

function cleanDir(dir) {
  return del([`${dir}/**`, `!${dir}`]);
}

function clean() {
  return Promise.all([
    cleanDir('dist'),
    cleanDir('target')
  ]);
}

module.exports = log(clean);
