'use strict';

const path = require('path');
const grafanaApi = require('fedops-grafana-api');

// move to a 3rd party?
const tryRequire = name => {
  try {
    return require(name);
  } catch (ex) {
    return null;
  }
};

module.exports = ({inTeamCity}) => {
  function fedopsSync() {
    if (!inTeamCity()) {
      return Promise.resolve();
    }

    const config = tryRequire(path.join(process.cwd(), 'fedops.json'));

    if (!config) {
      return Promise.resolve();
    }

    return grafanaApi.sync(config)
      .then(() => console.log('Fedops: sync succeeded'))
      .catch(e => console.log('grafana sync failure: status', e.status, 'message:', e.response && e.response.text));
  }

  return fedopsSync;
};
