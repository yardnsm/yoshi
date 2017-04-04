'use strict';

const path = require('path');

const tryRequire = module.exports.tryRequire = name => {
  try {
    return require(name);
  } catch (ex) {
    if (ex.code === 'MODULE_NOT_FOUND') {
      return null;
    } else {
      throw ex;
    }
  }
};

const mochSetupPath = path.join(process.cwd(), 'test', 'mocha-setup.js');

tryRequire(mochSetupPath);
