'use strict';

const {watchMode} = require('../utils');
const {hasConfFile, run} = require('../protractor');
const {logIf} = require('../log');

function protractor() {
  if (hasConfFile() && !watchMode()) {
    return run();
  } else {
    return Promise.resolve();
  }
}

module.exports = logIf(protractor, () => hasConfFile() && !watchMode());
