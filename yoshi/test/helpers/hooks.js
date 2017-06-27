'use strict';

const sh = require('shelljs');

module.exports = {
  installProtractor: cwd => {
    return exec('yarn add protractor@^5.0.0', cwd);
  },
  installDependencies: cwd => {
    return exec('yarn install --no-lockfile', cwd);
  },
  installDependency: cwd => {
    return dep => exec(`yarn add ${dep}`, cwd);
  }
};

function exec(cmd, cwd) {
  const res = sh.exec(cmd, {cwd, silent: true});
  if (res && res.code && res.code !== 0) {
    throw new Error(`Command ${cmd} failed with code ${res.code} and output: ${res.stdout + res.stderr}`);
  } else {
    return res;
  }
}
