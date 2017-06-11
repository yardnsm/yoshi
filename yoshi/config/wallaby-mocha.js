module.exports = function (wallaby) {
  const wallabyCommon = require('./wallaby-common')(wallaby);
  wallabyCommon.testFramework = 'mocha';
  wallabyCommon.setup = () => {
    require('babel-polyfill');
    const mocha = wallaby.testFramework;
    mocha.timeout(30000);
    process.env.IN_WALLABY = true;
    require('yoshi/config/mocha-setup');
  };
  return wallabyCommon;
};
