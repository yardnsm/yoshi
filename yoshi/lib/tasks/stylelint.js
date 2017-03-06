'use strict';

const {lint} = require('stylelint');
const cosmiconfig = require('cosmiconfig');
const globs = require('../globs');
const {logIfP} = require('../log');

function hasConfig() {
  return cosmiconfig('stylelint')
    .load(process.cwd())
    .then(result => !!result);
}

function stylelint() {
  return hasConfig().then(result => {
    if (result) {
      return lint({
        files: [globs.sass(), globs.less()],
        formatter: 'string'
      })
      .then(({output, errored}) => {
        console.log(output);

        if (errored) {
          return Promise.reject();
        }
      });
    }
  });
}

module.exports = logIfP(stylelint, hasConfig);
