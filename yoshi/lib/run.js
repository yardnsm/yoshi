'use strict';

const isCI = require('is-ci');
const {watchMode, logIfAny} = require('./utils');
const {log, logIf, logIfP} = require('./log');
const {base, statics} = require('./globs');
const projectConfig = require('../config/project');

const watch = watchMode();

module.exports = (plugins, options) => {
  return plugins.reduce((promise, parallel) => {
    return promise.then(() => {
      return Promise.all(parallel.map(task => {
        return require(task)({log, logIf, logIfP, watch, base, statics, isCI, projectConfig})(options)
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
