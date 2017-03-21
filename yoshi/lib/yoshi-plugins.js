const {runIndividualTranspiler} = require('../config/project');
const {isTypescriptProject, isBabelProject} = require('./utils');

const linter = isTypescriptProject() ? './tasks/tslint' : 'yoshi-eslint';

function transpiler() {
  if (isTypescriptProject() && runIndividualTranspiler()) {
    return './tasks/typescript';
  }

  if (isBabelProject() && runIndividualTranspiler()) {
    return 'yoshi-babel';
  }

  return './tasks/no-transpile';
}

function tests(options) {
  const commands = ['mocha', 'jasmine', 'protractor', 'karma', 'jest'];
  const option = commands.find(option => options[option]);
  return option ? [[`./tasks/${option}`]] : [['./tasks/mocha'], ['./tasks/protractor']];
}

module.exports = options => ({
  build: [
    ['yoshi-clean', './tasks/update-node-version'],
    ['yoshi-sass', './tasks/less', './tasks/petri', './tasks/targz', './tasks/copy-assets', transpiler(), './tasks/bundle']
  ],
  lint: [[linter, './tasks/stylelint']],
  release: [['./tasks/wnpm-release']],
  start: [
    ['yoshi-clean', './tasks/update-node-version'],
    ['yoshi-sass', './tasks/less', './tasks/petri', './tasks/targz', './tasks/copy-assets', transpiler(), './tasks/webpack-dev-server']
  ],
  test: tests(options)
});
