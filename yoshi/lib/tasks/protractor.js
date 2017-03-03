'use strict';

const {watchMode} = require('../utils');
const {hasConfFile, run} = require('../protractor');
const {logIf} = require('../log');

function protractor() {
  return run();
}

module.exports = logIf(protractor, () => hasConfFile() && !watchMode());
