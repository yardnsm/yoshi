'use strict';

// TODO: consider multiple modules
// TODO: figure out if we need definition files

const path = require('path');
const petriSpecs = require('petri-specs/lib/petri-specs');
const {sync} = require('glob');

function exists(pattern) {
  return sync(pattern).length > 0;
}

function runWatch() {
  // TODO: implement watch mode using chokidar
  return Promise.resolve();
}

module.exports = ({logIf, watch, statics}) => {
  const directory = 'petri-specs';
  const specs = path.join(directory, '**', '*.json');
  const json = path.join(statics(), 'petri-experiments.json');

  function shouldRun() {
    return exists(specs);
  }

  function runBuild() {
    const options = {directory, json};

    if (!shouldRun()) {
      return Promise.resolve();
    }

    petriSpecs.build(options);

    return Promise.resolve();
  }

  function petri() {
    return watch ? runWatch() : runBuild();
  }

  return logIf(petri, shouldRun);
};
