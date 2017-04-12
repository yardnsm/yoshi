'use strict';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const {parseString} = require('xml2js');

function parseXml(pomXml) {
  return new Promise((resolve, reject) =>
    parseString(pomXml, (err, result) => err ? reject(err) : resolve(result))
  );
}

module.exports.renderTemplate = (templateFileName, data) => {
  const template = fs.readFileSync(templateFileName).toString();
  return Object.keys(data).reduce((template, key) => template.replace(`{{${key}}}`, data[key]), template);
};

module.exports.parseXmlFile = filename => parseXml(fs.readFileSync(filename, 'utf-8'));

module.exports.writeFile = (targetFileName, data) => {
  mkdirp.sync(path.dirname(targetFileName));
  fs.writeFileSync(path.resolve(targetFileName), data);
};
