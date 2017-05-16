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
      const copy = (from, to) => {
        this.fs.copy(
          this.templatePath(from),
          this.destinationPath(this.options.generateInto, to)
        );
      };

      const copyTpl = (from, to) => {
        this.fs.copyTpl(
          this.templatePath(from),
          this.destinationPath(this.options.generateInto, to),
          this.options
        );
      };

      copy('src/index.ejs', 'src/index.ejs');
      copyTpl('src/client.js', 'src/client.js');
      copyTpl('src/server.js', 'src/server.js');
      copyTpl('.vscode/**/*', '.vscode');
      copyTpl('src/components/**/*', 'src/components');

      copy('test/browser/**/*', 'test/browser');
      copy('test/it/**/*', 'test/it');
      copy('test/e2e/**/*', 'test/e2e');
      copy('test/environment.js', 'test/environment.js');
      copyTpl('test/mocha-setup.js', 'test/mocha-setup.js');
      copy('test/test-common.js', 'test/test-common.js');

      copy('gitignore', '.gitignore');
      copy('.nvmrc', '.nvmrc');
      copy('index.js', 'index.js');
      copy('wallaby.js', 'wallaby.js');
      copy('protractor.conf.js', 'protractor.conf.js');
    },

    package() {
      this.fs.extendJSON(this.destinationPath(this.options.generateInto, 'package.json'), {
        name: this.options.name,
        version: '1.0.0',
        homepage: '',
        private: true,
        author: {
          name: this.options.authorName,
          email: this.options.authorEmail,
          url: ''
        },
        scripts: {
          start: 'yoshi start',
          pretest: 'yoshi lint && yoshi build',
          build: ':',
          test: 'yoshi test',
          release: 'yoshi release'
        },
        devDependencies: {
          'babel-preset-es2015': '^6.9.0',
          'babel-preset-react': '^6.5.0',
          'babel-preset-stage-0': '^6.5.0',
          'react-addons-test-utils': '^15.3.2',
          'react-test-renderer': '^15.5.4',
          chai: '^3.5.0',
          enzyme: '^2.3.0',
          jsdom: '^10.1.0',
          'jsdom-global': '^3.0.2',
          nock: '^8.0.0',
          yoshi: 'latest'
        },
        dependencies: {
          axios: '^0.16.1',
          'babel-polyfill': '^6.9.1',
          bluebird: '^3.4.7',
          ejs: '^2.5.6',
          express: '^4.13.4',
          react: '^15.3.2',
          'react-dom': '^15.3.2',
        },
        babel: {
          presets: ['react', 'es2015', 'stage-0']
        },
        eslintConfig: {
          extends: 'wix/react'
        }
      });
    }
  }
});
