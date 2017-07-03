const union = require('lodash/union');
const webpackCommonConfig = require('./webpack.config.common');
const projectConfig = require('./project');

module.exports = config => {

  const cssModules = projectConfig.cssModules();

  config.resolve.extensions = union(config.resolve.extensions, webpackCommonConfig.resolve.extensions);

  config.module.loaders = [
    ...webpackCommonConfig.module.rules,
    require('../lib/loaders/sass')(true, cssModules, false).client
  ];

  return config;
};
