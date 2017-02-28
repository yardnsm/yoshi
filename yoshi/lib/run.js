'use strict';

const {watchMode} = require('./utils');

module.exports = (plugins, options) => {
  return plugins.reduce((promise, parallel) => {
    return promise.then(() => {
      return Promise.all(parallel.map(task => {
        return require(task)(options)
          .catch(error => {
            if (error) {
              console.log(error);
            }

            if (!watchMode()) {
              process.exit(1);
            }
          });
      }));
    });
  }, Promise.resolve());
};
