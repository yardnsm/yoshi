'use strict';

const wnpm = require('wnpm-ci');
const {log} = require('../log');

function wnpmRelease() {
  return new Promise(resolve =>
    wnpm.prepareForRelease({shouldShrinkWrap: false}, resolve)
  );
}

module.exports = log(wnpmRelease);
