'use strict';

const {expect} = require('chai');
const commonConfig = require('../config/webpack.config.common');
const uniq = require('lodash/uniq');
const buildStoryBookConfig = require('../config/webpack.config.storybook');

describe('Webpack config storybook', () => {

  let originalConfig;
  let resultConfig;

  beforeEach(() => {
    originalConfig = {
      resolve: {
        extensions: ['.js', '.jsx', '.abc']
      },
      module: { }
    };
  });

  beforeEach(() => {
    resultConfig = buildStoryBookConfig(originalConfig);
  });

  describe('Extensions', () => {

    it('should add all the extensions from the common config', () => {
      const expectedExtensions = commonConfig.resolve.extensions;
      expect(resultConfig.resolve.extensions).to.include.members(expectedExtensions);
    });

    it('should NOT add duplicate extensions', () => {
      const uniqueOccurrences = uniq(resultConfig.resolve.extensions).length;
      expect(resultConfig.resolve.extensions.length).to.equal(uniqueOccurrences);
    });

    it('should keep the original extensions', () => {
      expect(resultConfig.resolve.extensions).to.include('.abc');
    });
  });
});
