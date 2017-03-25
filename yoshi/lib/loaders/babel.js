'use strict';

const {unprocessedModules} = require('../../config/project');

module.exports = isAngularProject => ({
  test: /\.js$/,
  include: unprocessedModules(),
  use: [...isAngularProject ? ['ng-annotate-loader'] : [], 'babel-loader']
});
