'use strict';

const path = require('path');
const gulp = require('gulp');

function copyDir(source, destination = '', base = '.') {
  return new Promise((resolve, reject) =>
    gulp.src(source, {base})
      .pipe(gulp.dest(path.join('dist', destination)))
      .on('error', reject)
      .once('end', resolve)
  );
}

module.exports = ({log, watch, base}) => {
  function copyAssets({output = 'statics'} = {}) {
    const assets = `${base()}/assets/**/*`;
    const htmlAssets = `${base()}/**/*.{ejs,html,vm}`;
    const serverAssets = `${base()}/**/*.{css,json,d.ts}`;

    const copyAllAssets = () => Promise.all([
      copyDir([assets, htmlAssets, serverAssets]),
      copyDir([assets, htmlAssets], output, path.join(process.cwd(), 'src'))
    ]);

    if (watch) {
      gulp.watch([assets, htmlAssets, serverAssets], copyAllAssets);
    }

    return copyAllAssets();
  }

  return log(copyAssets);
};
