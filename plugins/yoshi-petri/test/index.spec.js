'use strict';

const {expect} = require('chai');
const tp = require('test-phases');
const stripAnsi = require('strip-ansi');
const intercept = require('intercept-stdout');
const petri = require('../index');

describe('Petri', () => {
  let test;
  let task;
  let cleanup;
  let stdout = '';

  before(() => cleanup = intercept(s => {
    stdout += stripAnsi(s);
  }));
  beforeEach(() => test = tp.create());
  beforeEach(() => process.chdir(test.tmp));
  beforeEach(() => task = petri({logIf: a => a, watch: false, statics: () => 'statics'}));

  afterEach(() => test.teardown());
  afterEach(() => stdout = '');
  after(() => cleanup());

  it('should create petri-experiments.json file inside dist/statics folder', () => {
    test.setup({
      'petri-specs/specs.infra.Dummy.json': `
        {
          "specs.infra.Dummy": {
            "scope": "infra",
            "owner": "tomasm@wix.com",
            "onlyForLoggedInUsers": true,
            "testGroups": ["true", "false"]
          }
        }`
    });

    return task()
      .then(() => {
        expect(test.list('statics', '-R')).to.contain('petri-experiments.json');
      });
  });

  it('should not run petri specs if there are no spec files', () => {
    test.setup({
      'petri-specs/dummy.txt': ''
    });

    return task()
      .then(() => {
        expect(stdout).not.to.contain('Building petri specs');
      });
  });

  it.skip('should do nothing if there is no petri-specs installed', () => {
    // TODO: figure out how to simulate module doesn't exist in registry
  });
});
