'use strict';

const babel = require('./babel');
const typescript = require('./typescript');
const noTranspile = require('./no-transpile');
const {runIndividualTranspiler} = require('../../config/project');
const {isTypescriptProject, isBabelProject} = require('../utils');

function transpile() {
  if (isTypescriptProject() && runIndividualTranspiler()) {
    return typescript;
  }

  if (isBabelProject() && runIndividualTranspiler()) {
    return babel;
  }

  return noTranspile;
}

module.exports = () => transpile();
