'use strict';

const path = require('path');
const {merge} = require('lodash/fp');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const localIdentName = require('../../config/css-scope-pattern');

module.exports = (separateCss, cssModules, tpaStyle) => {
  const cssLoaderOptions = {
    camelCase: true,
    sourceMap: !!separateCss,
    localIdentName,
    modules: cssModules,
    importLoaders: tpaStyle ? 4 : 3
  };

  const sassLoaderOptions = {
    sourceMap: true,
    includePaths: ['node_modules', 'node_modules/compass-mixins/lib']
  };

  const globalRegex = /\.global.s?css$/;

  const getScssRule = (ruleConfig, loaderConfig) => merge(ruleConfig, {
    test: /\.s?css$/,
    use: clientLoader(separateCss, {loader: 'style-loader', options: {singleton: true}}, [
      {
        loader: 'css-loader',
        options: merge(cssLoaderOptions, loaderConfig)
      },
      {
        loader: 'postcss-loader',
        options: {
          config: {
            path: path.join(__dirname, '..', '..', 'config', 'postcss.config.js'),
          },
          sourceMap: true
        }
      },
      ...tpaStyle ? ['wix-tpa-style-loader'] : [],
      {
        loader: 'sass-loader',
        options: sassLoaderOptions
      }
    ])
  });

  return {
    client: [
      getScssRule({include: globalRegex}, {modules: false}),
      getScssRule({exclude: globalRegex})
    ],
    specs: {
      test: /\.s?css$/,
      use: [
        {
          loader: 'css-loader/locals',
          options: cssLoaderOptions
        },
        ...tpaStyle ? ['wix-tpa-style-loader'] : [],
        {
          loader: 'sass-loader',
          options: sassLoaderOptions
        }
      ]
    }
  };
};

function clientLoader(separateCss, l1, l2) {
  return separateCss ? ExtractTextPlugin.extract({fallback: l1, use: l2}) : [l1].concat(l2);
}
