'use strict';

const path = require('path');
const fs = require('fs');
const gulp = require('gulp');
const glob = require('glob');
const mkdirp = require('mkdirp');

function copyFiles(patterns, destination = '', base = '.') {
  return matchFiles(patterns).then(fileList =>
    Promise.all(fileList.map(filePath =>
      copy(filePath, destination, base))));
}

function matchFiles(patterns) {
  return Promise.all(patterns.map(pattern => {
    return new Promise((resolve, reject) => {
      glob(path.resolve(pattern), {nodir: true}, (err, matches) => err ? reject(err) : resolve(matches));
    });
  })).then(results => results.reduce((acc, item) => acc.concat(item), []));
}

function copy(filePath, destination, base) {
  const dest = path.resolve('dist', destination);
  const relative = filePath.replace(path.resolve(base), '');
  return copyFile(filePath, path.join(dest, relative));
}

function copyFile(from, to) {
  return ensureDir(path.dirname(to)).then(() => {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(from);
      const writeStream = fs.createWriteStream(to);

      readStream.on('error', reject);
      writeStream.on('error', reject);
      writeStream.once('finish', resolve);
      readStream.pipe(writeStream);
    });
  });
}

function ensureDir(dir) {
  return new Promise((resolve, reject) =>
    mkdirp(dir, err => err ? reject(err) : resolve(dir)));
}

module.exports = ({log, watch, base}) => {
  function copyAssets({output = 'statics'} = {}) {
    const assets = `${base()}/assets/**/*`;
    const htmlAssets = `${base()}/**/*.{ejs,html,vm}`;
    const serverAssets = `${base()}/**/*.{css,json,d.ts}`;

    const copyAllAssets = () => Promise.all([
      copyFiles([assets, htmlAssets, serverAssets]),
      copyFiles([assets, htmlAssets], output, path.join(process.cwd(), 'src'))
    ]);

    if (watch) {
      gulp.watch([assets, htmlAssets, serverAssets], copyAllAssets);
    }

    return copyAllAssets();
  }

  return log(copyAssets);
};
