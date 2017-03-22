'use strict';

const {lint} = require('stylelint');
const cosmiconfig = require('cosmiconfig');

function hasConfig() {
  return cosmiconfig('stylelint')
    .load(process.cwd())
    .then(result => !!result);
}

module.exports = ({logIfP, base}) => {
  function stylelint() {
    return hasConfig().then(result => {
      if (result) {
        return lint({
          files: [
            `${base()}/**/*.scss`,
            `${base()}/**/*.less`,
          ],
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

  return logIfP(stylelint, hasConfig);
};
