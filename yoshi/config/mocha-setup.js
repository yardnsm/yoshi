'use strict';

const path = require('path');
const {tryRequire, isTypescriptProject} = require('../lib/utils');

const ext = isTypescriptProject() ? 'ts' : 'js';
const mochSetupPath = path.join(process.cwd(), 'test', `mocha-setup.${ext}`);

if (!process.env.IN_WALLABY) {
  require('../lib/require-hooks');
}
require('../lib/ignore-extensions');
tryRequire(mochSetupPath);
