'use strict';

const updateNotifier = require('update-notifier');
const yeoman = require('yeoman-generator');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const askName = require('inquirer-npm-name');
const validations = require('./validations');

const projectTypes = {
  FULLSTACK: 'fullstack',
  CLIENT: 'client (coming soon)',
  NODE_LIBRARY: 'node library (coming soon)',
  SERVER: 'server (coming soon)',
  UNIVERSAL: 'universal (coming soon)',
  REACT_COMPONENT_LIBRARY: 'react component library (coming soon)'
};

const generators = {
  [projectTypes.UNIVERSAL]: 'generator-yoshi-universal',
  [projectTypes.FULLSTACK]: 'generator-yoshi-fullstack',
  [projectTypes.CLIENT]: 'generator-yoshi-web',
  [projectTypes.NODE_LIBRARY]: 'generator-yoshi-library',
  [projectTypes.SERVER]: 'generator-yoshi-node',
  [projectTypes.REACT_COMPONENT_LIBRARY]: 'generator-yoshi-component-library'
};

module.exports = yeoman.Base.extend({
  constructor: function () { // eslint-disable-line object-shorthand
    yeoman.Base.apply(this, arguments);
  },

  initializing() {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    const pkg = require('../../package.json');
    if (pkg.version !== '1.0.0') {
      const done = this.async();
      const notifier = updateNotifier({
        pkg,
        updateCheckInterval: 1,
        callback: (error, update) => {
          if (update && update.type !== 'latest') {
            notifier.update = update;
            notifier.notify();
            process.exit();
          } else if (fs.readdirSync(process.cwd()).length) {
            console.log('You can only generate a project in an empty directory.');
            process.exit();
          } else {
            done();
          }
        }
      });
    }
  },

  prompting: {
    askForProjectName() {
      const nameOpts = {
        name: 'name',
        message: 'Project Name',
        default: path.basename(process.cwd()),
        filter: _.kebabCase,
        validate: validations.notEmpty
      };

      return askName(nameOpts, this)
        .then(options => Object.assign(this.options, options));
    },
    askFor() {
      const prompts = [
        {
          name: 'authorName',
          message: 'Author name',
          default: this.user.git.name(),
          store: true
        },
        {
          name: 'authorEmail',
          message: 'Author email',
          default: this.user.git.email(),
          store: true
        },
        {
          type: 'list',
          name: 'projectsType',
          message: 'Which project do you want to create?',
          choices: [
            {name: 'Fullstack', value: projectTypes.FULLSTACK},
            {name: 'Universal', value: projectTypes.UNIVERSAL},
            {name: 'Client', value: projectTypes.CLIENT},
            {name: 'Node Library', value: projectTypes.NODE_LIBRARY},
            {name: 'Server', value: projectTypes.SERVER},
            {name: 'React Component Library', value: projectTypes.REACT_COMPONENT_LIBRARY}
          ]
        }
      ];

      return this.prompt(prompts)
        .then(options => Object.assign(this.options, options));
    }
  },

  writing() {
    const options = this.options;
    const childGeneratorName = generators[options.projectsType];

    this.composeWith(childGeneratorName, {options}, {
      local: require.resolve(childGeneratorName),
      link: 'strong'
    });
  }
});
