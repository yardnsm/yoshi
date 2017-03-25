'use strict';

module.exports = cssModules => {
  const cssLoaderOptions = {
    modules: cssModules,
    camelCase: true,
    sourceMap: false,
    localIdentName: '[path][name]__[local]__[hash:base64:5]',
    importLoaders: 2
  };

  const sassLoaderOptions = {
    sourceMap: true,
    includePaths: ['node_modules', 'node_modules/compass-mixins/lib']
  };

  return {
    test: /\.s?css$/,
    loaders: [
      'style',
      `css-loader?${JSON.stringify(cssLoaderOptions)}`,
      'postcss',
      `sass?${JSON.stringify(sassLoaderOptions)}`
    ]
  };
};
