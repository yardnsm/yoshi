'use strict';

const babel = require('yoshi-babel');
const clean = require('yoshi-clean');
const copy = require('yoshi-copy');
const eslint = require('yoshi-eslint');
const less = require('yoshi-less');
const mavenStatics = require('yoshi-maven-statics');
const petri = require('yoshi-petri');
const sass = require('yoshi-sass');
const stylelint = require('yoshi-stylelint');
const tslint = require('yoshi-tslint');
const typescript = require('yoshi-typescript');
const updateNoteVersion = require('yoshi-update-node-version');
const wnpmRelease = require('yoshi-wnpm-release');

module.exports = ({projectConfig, isTypescriptProject, isBabelProject}) => {
  const linter = isTypescriptProject() ? tslint : eslint;

  function transpiler() {
    if (isTypescriptProject() && projectConfig.runIndividualTranspiler()) {
      return typescript;
    }

    if (isBabelProject() && projectConfig.runIndividualTranspiler()) {
      return babel;
    }

    return './tasks/no-transpile';
  }

  function tests(options) {
    const commands = ['mocha', 'jasmine', 'protractor', 'karma', 'jest'];
    const option = commands.find(option => options[option]);
    return option ? [[`./tasks/${option}`]] : [['./tasks/mocha'], ['./tasks/protractor']];
  }

  return options => ({
    build: [
      [clean, updateNoteVersion],
      [sass, less, petri, mavenStatics, copy, transpiler(), './tasks/bundle']
    ],
    lint: [[linter, stylelint]],
    release: [[wnpmRelease]],
    start: [
      [clean, updateNoteVersion],
      [sass, less, petri, mavenStatics, copy, transpiler(), './tasks/webpack-dev-server']
    ],
    test: tests(options)
  });
};
