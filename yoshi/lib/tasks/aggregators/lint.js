'use strict';

const {isTypescriptProject} = require('../../utils');
const run = require('../../run');
const stylelint = require('../stylelint');
const eslint = require('../eslint');
const tslint = require('../tslint');

const linter = isTypescriptProject() ? tslint : eslint;

function lint(options) {
  return run(options)(linter, stylelint);
}

module.exports = lint;
