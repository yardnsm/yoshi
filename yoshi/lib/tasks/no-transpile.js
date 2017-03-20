'use strict';

const gulp = require('gulp');
const globs = require('../globs');
const {noop} = require('../utils');

const files = globs.babel();

function transpile() {
  return Promise.resolve();
}

module.exports = ({watch}) => {
  function noTranspile({done = noop}) {
    const transpileThenDone = () => transpile().then(done);

    if (watch) {
      gulp.watch(files, transpileThenDone);
    }

    return transpileThenDone();
  }

  return noTranspile;
};
