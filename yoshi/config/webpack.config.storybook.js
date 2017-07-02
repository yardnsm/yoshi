const union = require('lodash/union');
const webpackCommonConfig = require('./webpack.config.common');
const projectConfig = require('./project');

const cssModules = projectConfig.cssModules();

module.exports = config => {

  config.resolve.extensions = union(config.resolve.extensions, webpackCommonConfig.resolve.extensions);

  config.module.loaders = process.env.STORYBOOK3 ?
    getStorybook3Loaders() :
    getStorybook2Loaders();

  return config;
};

function getStorybook3Loaders() {
  return [
    webpackCommonConfig.module.rules,
    require('../lib/loaders/json')(),
    require('../lib/loaders/sass')(true, cssModules, false).client
  ];
}

function getStorybook2Loaders() {
  return [
    webpackCommonConfig.module.rules.map(transformWp2LoadersToWp1),
    require('../lib/loaders/json')(),
    require('../lib/loaders/sass.storybook')(cssModules)
  ];
}

function transformWp2LoadersToWp1(loader) {
  loader.loaders = loader.use;
  loader.query = loader.options;
  delete loader.use;
  delete loader.options;
  return loader;
}
