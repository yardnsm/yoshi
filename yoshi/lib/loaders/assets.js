'use strict';

module.exports = () => ({
  test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|wav)(\?.*)?$/,
  loader: 'url-loader',
  options: {
    name: '[path][name].[ext]?[hash]',
    limit: 10000
  }
});
