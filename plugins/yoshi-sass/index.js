'use strict';

const path = require('path');
const gulp = require('gulp');
const glob = require('glob');
const nodeSass = require('node-sass');
const {writeFile, ensureDir} = require('fs-promise');
const postcss = require('postcss');
const postcssModules = require('postcss-modules');

function writeFileIntoDir(filepath, content) {
  return ensureDir(path.dirname(filepath))
    .then(() => writeFile(filepath, content));
}

function readDir(pattern) {
  return glob.sync(pattern).filter(file => path.basename(file)[0] !== '_');
}

function renderSass(options) {
  return new Promise((resolve, reject) =>
    nodeSass.render(options, (err, result) => err ? reject(err.formatted) : resolve(result))
  );
}

function cssModules(css, file, cssScopePatern = '[name]__[local]___[hash:base64:5]') {
  return postcss([postcssModules({
      getJSON: () => {},
      generateScopedName: cssScopePatern
  })]).process(css, { from: file });
}

function renderFile(file, cssModulesInBuildTime, cssScopePatern) {
  const options = {
    file: path.resolve(file),
    includePaths: ['node_modules', 'node_modules/compass-mixins/lib'],
    indentedSyntax: path.extname(file) === '.sass'
  };

  return renderSass(options)
    .then(result => cssModulesInBuildTime ? cssModules(result.css, file, cssScopePatern) : result)
    .then(result => writeFileIntoDir(path.resolve('dist', file), result.css));
}

module.exports = ({logIf, base, watch, projectConfig}) => {
  const pattern = `${base()}/**/*.scss`;
  const cssModulesInBuildTime = projectConfig && projectConfig.cssModulesInBuildTime();
  const cssScopePatern = projectConfig && projectConfig.cssScopePatern();

  function sass() {
    if (watch) {
      gulp.watch(pattern, () => transpile());
    }

    return transpile();
  }

  function transpile() {
    return Promise.all(readDir(pattern).map(file => renderFile(file, cssModulesInBuildTime, cssScopePatern)));
  }

  return logIf(sass, () => readDir(pattern).length > 0);
};
