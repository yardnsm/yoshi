'use strict';

const {expect} = require('chai');
const tp = require('test-phases');
const mavenStatics = require('../index');

const pom = `
  <?xml version="1.0" encoding="UTF-8"?>
  <project>
      <build>
          <plugins>
              <plugin>
                  <configuration>
                      <descriptors>
                          <descriptor>maven/assembly/tar.gz.xml</descriptor>
                      </descriptors>
                  </configuration>
              </plugin>
          </plugins>
      </build>
  </project>`;

const packageJson = (yoshiConfig = {}, dependencies = {}) => JSON.stringify({
  name: 'a',
  version: '1.0.4',
  yoshi: yoshiConfig,
  scripts: {
    build: 'echo npm-run-build',
    test: 'echo Testing with Mocha'
  },
  dependencies
}, null, 2);

describe('Clean', () => {
  let test;
  let task;

  beforeEach(() => test = tp.create());
  beforeEach(() => process.chdir(test.tmp));
  afterEach(() => test.teardown());

  it('should create tar.gz.xml based on client project name', () => {
    test.setup({
      'pom.xml': pom
    });

    const task = mavenStatics({
      projectConfig: {
        clientProjectName: () => 'some-client-proj'
      }
    });

    return task()
      .then(() => {
        expect(test.content('maven/assembly/tar.gz.xml').replace(/\s/g, '')).to.contain(`
          <assembly xmlns="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.0"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.0 http://maven.apache.org/xsd/assembly-1.1.0.xsd">
              <id>wix-angular</id>
              <baseDirectory>/</baseDirectory>
              <formats>
                  <format>tar.gz</format>
              </formats>
              <fileSets>
                  <fileSet>
                      <directory>\${project.basedir}/node_modules/some-client-proj/dist</directory>
                      <outputDirectory>/</outputDirectory>
                      <includes>
                          <include>*</include>
                          <include>*/**</include>
                      </includes>
                  </fileSet>
              </fileSets>
          </assembly>
        `.replace(/\s/g, ''));
      });
  });

  it('should create tar.gz.xml for universal app, using default directory for statics', () => {
    test.setup({
      'package.json': packageJson(),
      'pom.xml': pom
    });

    const task = mavenStatics({
      projectConfig: {
        clientProjectName: () => undefined,
        clientFilesPath: () => 'dist/statics'
      }
    });

    return task()
      .then(() => {
        expect(test.content('maven/assembly/tar.gz.xml').replace(/\s/g, '')).to.contain(`
          <assembly xmlns="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.0"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.0 http://maven.apache.org/xsd/assembly-1.1.0.xsd">
              <id>wix-angular</id>
              <baseDirectory>/</baseDirectory>
              <formats>
                  <format>tar.gz</format>
              </formats>
              <fileSets>
                  <fileSet>
                  <directory>\${project.basedir}/dist/statics</directory>
                      <outputDirectory>/</outputDirectory>
                      <includes>
                          <include>*</include>
                          <include>*/**</include>
                      </includes>
                  </fileSet>
              </fileSets>
          </assembly>
        `.replace(/\s/g, ''));
      });
  });

  it('should not fail if there is no "tarGZLocation"', () => {
    test.setup({
      'pom.xml': `
        <?xml version="1.0" encoding="UTF-8"?>
        <project>
        </project>
      `
    });

    const task = mavenStatics({
      projectConfig: {
        clientProjectName: () => undefined,
        clientFilesPath: () => 'dist/statics'
      }
    });

    return task();
  });
});
