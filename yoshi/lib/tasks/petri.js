'use strict';

// TODO: consider multiple modules
// TODO: figure out if we need definition files

const {tryRequire, exists} = require('../utils');
const globs = require('../globs');
const petriSpecs = tryRequire('petri-specs/lib/petri-specs');

function shouldRun() {
  return petriSpecs && exists(globs.petriSpecs());
}

function runBuild() {
  const options = {directory: globs.petri(), json: globs.petriOutput()};

  if (!shouldRun()) {
    return Promise.resolve();
  }

  petriSpecs.build(options);

  return Promise.resolve();
}

function runWatch() {
  // TODO: implement watch mode using chokidar
  return Promise.resolve();
}

module.exports = ({logIf, watch}) => {
  function petri() {
    return watch ? runWatch() : runBuild();
  }

  return logIf(petri, shouldRun);
};
