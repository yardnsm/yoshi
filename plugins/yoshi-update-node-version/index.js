'use strict';

const fs = require('fs');

function updateVersion() {
  const fwVersion = fs.readFileSync(require.resolve('./templates/.nvmrc')).toString();
  let projectVersion = '0';

  try {
    projectVersion = fs.readFileSync('.nvmrc').toString();
  } catch (e) {}

  if (fwVersion > projectVersion) {
    console.log(`Upgrading node version @ ${fwVersion}`);
    fs.writeFileSync('.nvmrc', fwVersion);
  }
}

module.exports = ({inTeamCity}) => {
  function updateNodeVersion() {
    if (!inTeamCity()) {
      updateVersion();
    }

    return Promise.resolve();
  }

  return updateNodeVersion;
};
