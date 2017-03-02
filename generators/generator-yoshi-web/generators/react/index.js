'use strict';

const generators = require('yeoman-generator');

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

  writing: {
    templates() {
      this.fs.copy(
        this.templatePath('**/*'),
        this.destinationPath(this.options.generateInto),
        {globOptions: {dot: true}}
      );
      this.fs.move(
        this.destinationPath(this.options.generateInto, '_gitignore'),
        this.destinationPath(this.options.generateInto, '.gitignore')
      );
    },
    package() {
      this.fs.extendJSON(this.destinationPath(this.options.generateInto, 'package.json'), {
        dependencies: {
          'babel-polyfill': '^6.9.1',
          react: '^15.3.2',
          'react-dom': '^15.3.2'
        },
        devDependencies: {
          'babel-preset-react': '^6.5.0',
          'babel-preset-stage-0': '^6.5.0',
          'babel-preset-es2015': '^6.9.0',
          'react-addons-test-utils': '^15.3.2',
          'express-session': '^1.14.2',
          'jsdom-global': '^2.1.0',
          enzyme: '^2.3.0',
          chai: '^3.5.0'
        },
        babel: {
          presets: ['react', 'es2015', 'stage-0']
        },
        eslintConfig: {
          extends: 'wix/react',
        }
      });
    }
  }
});
