'use strict';

const {readFileSync} = require('fs');
const {expect} = require('chai');
const tp = require('test-phases');
const updateNodeVersion = require('../index');

describe('Update node version', () => {
  let test;

  beforeEach(() => test = tp.create());
  beforeEach(() => process.chdir(test.tmp));
  afterEach(() => test.teardown());

  it('should update .nvmrc to relevant version as shown in dockerfile', () => {
    const nodeVersion = readFileSync(require.resolve('../templates/.nvmrc'), {encoding: 'utf-8'}).trim();

    test.setup({
      '.nvmrc': '0'
    });

    return updateNodeVersion({inTeamCity: () => false})()
      .then(() => {
        expect(test.content('.nvmrc')).to.equal(nodeVersion);
      });
  });

  it('should create .nvmrc if it does not exist', () => {
    const nodeVersion = readFileSync(require.resolve('../templates/.nvmrc'), {encoding: 'utf-8'}).trim();

    test.setup({});

    return updateNodeVersion({inTeamCity: () => false})()
      .then(() => {
        expect(test.content('.nvmrc')).to.equal(nodeVersion);
      });
  });

  it('should not update .nvmrc if project has a higher version set in .nvmrc', () => {
    test.setup({
      '.nvmrc': '99.0.0'
    });

    return updateNodeVersion({inTeamCity: () => false})()
      .then(() => {
        expect(test.content('.nvmrc')).to.equal('99.0.0');
      });
  });

  it('should not update .nvmrc inside TeamCity', () => {
    test.setup({});

    return updateNodeVersion({inTeamCity: () => true})()
      .then(() => {
        expect(test.list('.nvmrc').length).to.equal(0);
      });
  });
});
