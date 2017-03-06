'use strict'

const glob = require('glob');

module.exports.logIfAny = log => {
  if (log) {
    console.log(log);
  }
};

module.exports.readDir = patterns => [].concat(patterns).reduce((acc, pattern) => acc.concat(glob.sync(pattern)), []);
