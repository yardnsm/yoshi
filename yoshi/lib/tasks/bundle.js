'use strict';

const _ = require('lodash/fp');
const webpack = require('webpack');
const getConfig = require('../../config/webpack.config.client');
const {shouldRunWebpack, filterNoise, inTeamCity, readDir, copyFile} = require('../utils');
const {statics} = require('../globs');

function runBundle(webpackOptions) {
  const webpackConfig = getConfig(webpackOptions);

  if (!shouldRunWebpack(webpackConfig)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    filterNoise(webpack(webpackConfig)).run((err, stats) => {
      if (err || stats.hasErrors()) {
        return reject(err);
      }

      return resolve();
    });
  });
}

function toMinExt(filePath) {
  return filePath.replace(/(.+\.)(js|css)$/, '$1min.$2');
}

function copyFilesAsMin() {
  const promises = readDir(`${statics()}/**/*.+(js|css)`)
    .map(filePath => copyFile(filePath, toMinExt(filePath)));

  return Promise.all(promises);
}

function bundle() {
  const debugBundle = runBundle({debug: true});
  const minBundle = inTeamCity() ? runBundle({debug: false}) : debugBundle.then(copyFilesAsMin);

  return Promise.all([debugBundle, minBundle]);
}

module.exports = ({logIf}) => {
  return logIf(bundle, _.compose(shouldRunWebpack, getConfig));
};
