'use strict';

const {watchMode, logIfAny} = require('./utils');

const watch = watchMode();

module.exports = (plugins, options) => {
  return plugins.reduce((promise, parallel) => {
    return promise.then(() => {
      return Promise.all(parallel.map(task => {
        return require(task)(Object.assign(options, watch))
          .catch(error => {
            logIfAny(error);
            if (!watch) {
              process.exit(1);
            }
          });
      }));
    });
  }, Promise.resolve());
};
