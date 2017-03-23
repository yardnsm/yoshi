'use strict';

const sh = require('shelljs');

module.exports = {
  installProtractor: cwd => {
    sh.exec('yarn add protractor@^5.0.0', {cwd});
  },
  installDependencies: cwd => {
    sh.exec('yarn install --no-lockfile', {cwd});
  },
  installDependency: cwd => dep => sh.exec(`yarn add ${dep}`, {cwd})
};
