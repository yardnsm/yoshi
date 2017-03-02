'use strict';

const generators = require('yeoman-generator');

const clientProjectTypes = {
  ANGULAR1: 'angular1',
  ANGULAR2: 'angular2',
  REACT: 'react'
};

module.exports = generators.Base.extend({
  constructor: function () { // eslint-disable-line object-shorthand
    generators.Base.apply(this, arguments);

    this.option('generateInto', {
      type: String,
      required: false,
      defaults: '',
      desc: 'Relocate the location of the generated files.'
    });
  },

  prompting: {
    askProjectType() {
      const done = this.async();
      const clientProjectsTypePrompt = {
        type: 'list',
        name: 'clientProjectsType',
        message: 'Which client project do you want to create?',
        choices: [
          {name: 'React', value: clientProjectTypes.REACT},
          {name: 'Angular1 (coming soon)', value: clientProjectTypes.ANGULAR1},
          {name: 'Angular2 (coming soon)', value: clientProjectTypes.ANGULAR2}
        ]
      };
      this.prompt(clientProjectsTypePrompt).then(opts => {
        this.options = Object.assign({}, this.options, opts);
        done();
      });
    }
  },

  writing: {
    package() {
      const pkg = {
        name: this.options.name,
        version: '1.0.0',
        homepage: '',
        author: {
          name: this.options.authorName,
          email: this.options.authorEmail,
          url: ''
        },
        scripts: {
          start: 'yoshi start --entry-point=./test/fakes/start-fake-server.js',
          pretest: 'wix-node-build lint && yoshi build',
          build: ':',
          test: 'yoshi test'
        },
        devDependencies: {
          express: '^4.13.4',
          'require-reload': '^0.2.2',
          velocity: '^0.7.2',
          yoshi: 'latest'
        }
      };

      this.fs.extendJSON(this.destinationPath(this.options.generateInto, 'package.json'), pkg);
    }
  },

  default: {
    compose() {
      if (this.options.clientProjectsType === clientProjectTypes.REACT) {
        this.composeWith('wix-web:react', {
          options: {
            generateInto: this.options.generateInto
          }
        }, {
          local: require.resolve('../react')
        });
      }
    }
  }
});
