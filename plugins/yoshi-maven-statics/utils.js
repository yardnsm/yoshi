'use strict';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const {parseString} = require('xml2js');

const parseXml = pomXml => new Promise((resolve, reject) =>
  parseString(pomXml, (err, result) => err ? reject(err) : resolve(result))
);

const readFile = filename => new Promise((resolve, reject) =>
  fs.readFile(filename, 'utf8', (err, result) => err ? reject(err) : resolve(result))
);

module.exports.renderTemplate = (templateFileName, data) => {
  const template = fs.readFileSync(templateFileName).toString();
  return Object.keys(data).reduce((template, key) => template.replace(`{{${key}}}`, data[key]), template);
};

module.exports.parseXmlFile = filename => readFile(filename)
  .then(content => parseXml(content));

module.exports.writeFile = (targetFileName, data) => {
  mkdirp.sync(path.dirname(targetFileName));
  fs.writeFileSync(path.resolve(targetFileName), data);
};
