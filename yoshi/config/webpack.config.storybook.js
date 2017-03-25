const webpackCommonConfig = require('./webpack.config.common');
const projectConfig = require('./project');

module.exports = config => {
  const cssModules = projectConfig.cssModules();

  config.module.loaders = [
    webpackCommonConfig.module.rules.map(transformWp2LoadersToWp1),
    require('../lib/loaders/json')(),
    require('../lib/loaders/sass.storybook')(cssModules)
  ];

  return config;
};

function transformWp2LoadersToWp1(loader) {
  loader.loaders = loader.use;
  loader.query = loader.options;
  delete loader.use;
  delete loader.options;
  return loader;
}
