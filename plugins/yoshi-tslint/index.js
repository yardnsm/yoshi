'use strict';

const fs = require('fs');
const glob = require('glob');
const {Linter, Configuration} = require('tslint');

const readDir = patterns => [].concat(patterns).reduce((acc, pattern) => acc.concat(glob.sync(pattern)), []);

const options = {fix: false, formatter: 'prose'};

function lint(file) {
  return readFile(file).then(content => {
    const linter = new Linter(options);
    const config = Configuration.findConfiguration(null, file).results;
    linter.lint(file, content, config);
    return linter.getResult();
  });
}

// TODO: introduce generic module for reading a file
function readFile(file) {
  return new Promise((resolve, reject) =>
    fs.readFile(file, 'utf8', (err, content) =>
      err ? reject(err) : resolve(content)));
}

module.exports = ({logIf, base}) => {
  const files = `${base()}/**/*.ts{,x}`;

  function readGlob() {
    return readDir(files).filter(file => !file.match(/\.d\.ts$/));
  }

  function tslint() {
    return Promise
      .all(readGlob().map(lint))
      .then(results => results.filter(result => result.output !== '\n'))
      .then(results => {
        const output = results.reduce((acc, result) => acc + result.output, '');
        const errorCount = results.reduce((acc, result) => acc + result.errorCount, 0);
        if (errorCount) {
          console.log(`${output}\n${errorCount} error(s)\n`);
          return Promise.reject();
        }
      });
  }

  return logIf(tslint, () => readGlob().length > 0);
};
