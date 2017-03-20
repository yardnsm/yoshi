'use strict';

const _ = require('lodash/fp');
const webpack = require('webpack');
const getConfig = require('../../config/webpack.config.client');
const {shouldRunWebpack, filterNoise} = require('../utils');

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

function bundle() {
  return Promise.all([runBundle({debug: true}), runBundle({debug: false})]);
}

module.exports = ({logIf}) => {
  return logIf(bundle, _.compose(shouldRunWebpack, getConfig));
};
