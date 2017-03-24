'use strict';

const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = (separateCss, cssModules, tpaStyle) => {
  const cssLoaderOptions = {
    modules: cssModules,
    camelCase: true,
    sourceMap: !!separateCss,
    localIdentName: '[path][name]__[local]__[hash:base64:5]',
    importLoaders: tpaStyle ? 4 : 3
  };

  const lessLoaderOptions = {
    sourceMap: true,
    paths: ['.', 'node_modules']
  };

  return {
    client: {
      test: /\.less$/,
      use: clientLoader(separateCss, 'style-loader', [
        {
          loader: 'css-loader',
          options: cssLoaderOptions
        },
        {
          loader: 'postcss-loader',
          options: {
            config: path.join(__dirname, '..', '..', 'config', 'postcss.config.js')
          }
        },
        ...tpaStyle ? ['wix-tpa-style-loader'] : [],
        {
          loader: 'less-loader',
          options: lessLoaderOptions
        }
      ])
    },
    specs: {
      test: /\.less$/,
      use: [
        {
          loader: 'css-loader/locals',
          options: cssLoaderOptions
        },
        ...tpaStyle ? ['wix-tpa-style-loader'] : [],
        {
          loader: 'less-loader',
          options: lessLoaderOptions
        }
      ]
    }
  };
};

function clientLoader(separateCss, l1, l2) {
  return separateCss ? ExtractTextPlugin.extract({fallback: l1, use: l2}) : [l1].concat(l2);
}
