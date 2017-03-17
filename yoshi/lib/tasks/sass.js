'use strict';

// TODO: emit source maps

const path = require('path');
const nodeSass = require('node-sass');
const gulp = require('gulp');
const globs = require('../globs');
const {watchMode, readDir, writeFile} = require('../utils');
const {logIf} = require('../log');

const watch = watchMode();

function sass() {
  const glob = globs.sass();

  if (watch) {
    gulp.watch(glob, () => transpile(glob));
  }

  return transpile(glob);
}

function readGlob(glob) {
  return readDir(glob).filter(file => path.basename(file)[0] !== '_');
}

function transpile(glob) {
  return Promise.all(readGlob(glob).map(renderFile));
}

function renderFile(file) {
  const options = {
    file: path.resolve(file),
    includePaths: ['node_modules', 'node_modules/compass-mixins/lib'],
    indentedSyntax: path.extname(file) === '.sass'
  };

  return new Promise((resolve, reject) => {
    nodeSass.render(options, (err, result) => {
      if (err) {
        reject(err.formatted);
      } else {
        writeFile(path.resolve('dist', file), result.css);
        resolve(result);
      }
    });
  });
}

module.exports = logIf(sass, () => readGlob(globs.sass()).length > 0);
