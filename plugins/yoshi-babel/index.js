'use strict';

const path = require('path');
const gulp = require('gulp');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const plumber = require('gulp-plumber');
const fileTransformCache = require('gulp-file-transform-cache');
const sourcemaps = require('gulp-sourcemaps');
const babelTranspiler = require('gulp-babel');

function noop() {}

function createInterceptor(resolve, reject) {
  let error;

  return {
    catchErrors: () => plumber(err => {
      error = err;
      printErrors(err);
    }),
    flush: () => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    }
  };
}

function printErrors(err) {
  const styledError = err.plugin === 'gulp-babel' ? `\n${err.codeFrame}` : '';
  const message = `${chalk.red(err.message)}${styledError}`;
  console.log(message);
}

module.exports = ({log, watch, base}) => {
  const files = [path.join(base(), '**', '*.js{,x}'), 'index.js'];

  function transpile() {
    return new Promise((resolve, reject) => {
      const interceptor = createInterceptor(resolve, reject);

      mkdirp(path.resolve('target'));

      gulp.src(files, {base: '.'})
        .pipe(interceptor.catchErrors())
        .pipe(fileTransformCache({
          path: path.resolve('target', '.babel-cache'),
          transformStreams: [sourcemaps.init(), babelTranspiler()]
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'))
        .once('end', interceptor.flush);
    });
  }

  function babel({done = noop} = {}) {
    const transpileThenDone = () => transpile().then(done);

    if (watch) {
      gulp.watch(files, transpileThenDone);
    }

    return transpileThenDone();
  }

  return log(babel);
};
