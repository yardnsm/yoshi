'use strict';

const {hasConfFile, run} = require('../protractor');

module.exports = ({logIf, watch}) => {
  function protractor() {
    if (hasConfFile() && !watch) {
      return run();
    } else {
      return Promise.resolve();
    }
  }

  return logIf(protractor, () => hasConfFile() && !watch);
};
