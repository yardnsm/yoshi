'use strict';
const {inTeamCity, isProduction} = require('../lib/utils');

const productionPattern = `[hash:base64:5]`;
const devPattern = `[path][name]__[local]__${productionPattern}`;
const isShortCSSFT = (process.env.SHORT_CSS_PATTERN === 'true');

module.exports = ((inTeamCity() || isProduction()) && isShortCSSFT) ? productionPattern : devPattern;
