'use strict';

const {lint} = require('stylelint');
const cosmiconfig = require('cosmiconfig');
const globs = require('../globs');

function stylelint() {
  return cosmiconfig('stylelint')
    .load(process.cwd())
    .then(result => {
      if (result) {
        return lint({
          files: globs.sass(),
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

module.exports = stylelint;
