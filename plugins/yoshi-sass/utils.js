'use strict'

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const mkdirp = require('mkdirp');
const nodeSass = require('node-sass');

module.exports.writeFile = (targetFileName, data) => {
  mkdirp.sync(path.dirname(targetFileName));
  fs.writeFileSync(path.resolve(targetFileName), data);
};

module.exports.renderSass = options => new Promise((resolve, reject) =>
  nodeSass.render(options, (err, result) => err ? reject(err.formatted) : resolve(result))
);

module.exports.readDir = pattern => {
  return glob.sync(pattern).filter(file => path.basename(file)[0] !== '_');
};
