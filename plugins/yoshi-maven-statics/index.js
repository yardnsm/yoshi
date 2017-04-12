'use strict';

const path = require('path');
const {renderTemplate, parseXmlFile, writeFile} = require('./utils');

module.exports = ({projectConfig}) => {
  function createMavenTarGz() {
    const clientProjectName = projectConfig.clientProjectName();

    let templateFileName;
    let templateData = {};

    if (clientProjectName) {
      templateFileName = path.join(__dirname, './templates/nbuild.tar.gz.xml');
      templateData = {'client-project': clientProjectName};
    } else {
      templateFileName = path.join(__dirname, './templates/tar.gz.xml');
      templateData = {staticsDir: projectConfig.clientFilesPath()};
    }

    const template = renderTemplate(templateFileName, templateData);

    return parseXmlFile(path.resolve('pom.xml'))
      .then(pom => {
        const tarGZLocation = pom.project.build[0].plugins[0].plugin[0].configuration[0].descriptors[0].descriptor[0];
        writeFile(tarGZLocation, template);
      })
      .catch(() => {});
  }

  return createMavenTarGz;
};
