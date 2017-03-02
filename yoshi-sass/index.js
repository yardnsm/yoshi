'use strict';

const path = require('path');
const gulp = require('gulp');
const {logIf} = require('yoshi/lib/log');
const {base} = require('yoshi/lib/globs');
const {writeFile, renderSass, readDir} = require('./utils');

const pattern = `${base()}/**/*.scss`;

function sass({watch} = {}) {
  if (watch) {
    gulp.watch(pattern, () => transpile());
  }

  return transpile();
}

function transpile() {
  return Promise.all(readDir(pattern).map(renderFile()));
}

function renderFile() {
  return file => {
    const options = {
      file: path.resolve(file),
      includePaths: ['.', 'node_modules', path.dirname(file), 'node_modules/compass-mixins/lib'],
      indentedSyntax: path.extname(file) === '.sass'
    };

    return renderSass(options)
      .then(result => writeFile(path.resolve('dist', file), result.css));
  };
}

module.exports = logIf(sass, () => readDir(pattern).length > 0);
