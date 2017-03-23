'use strict';

// const {expect} = require('chai');
// const stripAnsi = require('strip-ansi');
// const intercept = require('intercept-stdout');
// const proxyquire = require('proxyquire');
// const tp = require('test-phases');
// // const fedopsSync = require('../index');

// const fedopsJson = JSON.stringify({
//   app_name: 'your-unique-app-name', // eslint-disable-line camelcase
//   interactions: {
//     'my-interaction-one': {},
//     'my-interaction-two': {},
//     'my-interaction-three': {}
//   }
// }, null, 2);

describe('fedops sync', () => {
//   let test;
//   let cleanup;
//   let stdout = '';

//   const mockGrafanaApiSuccess = {
//     sync: () => Promise.resolve()
//   };

//   const mockGrafanaApiFailure = {
//     sync: () => Promise.reject({
//       status: 'status',
//       response: {
//         text: 'response text'
//       }
//     })
//   };

//   before(() => cleanup = intercept(s => {
//     stdout += stripAnsi(s);
//   }));
//   beforeEach(() => test = tp.create());
//   beforeEach(() => process.chdir(test.tmp));

//   afterEach(() => test.teardown());
//   afterEach(() => stdout = '');
//   after(() => cleanup());

//   it('should do nothing when outside of CI', () => {
//     const fedopsSync = proxyquire('../index', {
//       'fedops-grafana-api': mockGrafanaApiSuccess
//     });

//     test.setup({
//       'fedops.json': fedopsJson
//     });

//     return fedopsSync({inTeamCity: () => false})();
//   });

//   it('should do nothing when there is no fedops.json file', () => {
//     const fedopsSync = proxyquire('../index', {
//       'fedops-grafana-api': mockGrafanaApiSuccess
//     });

//     test.setup({});

//     return fedopsSync({inTeamCity: () => true})();
//   });

//   it('should do nothing when the fedops.json file is invalid', () => {
//     const fedopsSync = proxyquire('../index', {
//       'fedops-grafana-api': mockGrafanaApiSuccess
//     });

//     test.setup({
//       'fedops.json': `
//         {
//           "invalid": json
//         }
//         `
//     });

//     return fedopsSync({inTeamCity: () => true})();
//   });

//   it('should display a success message if grafana sync is successful', () => {
//     const fedopsSync = proxyquire('../index', {
//       'fedops-grafana-api': mockGrafanaApiSuccess
//     });

//     test.setup({
//       'fedops.json': fedopsJson
//     });

//     return fedopsSync({inTeamCity: () => true})()
//       .then(() => {
//         expect(stdout).to.contain('Fedops: sync succeeded');
//       });
//   });

//   it('should display a failure message if grafana sync failed', () => {
//     const fedopsSync = proxyquire('../index', {
//       'fedops-grafana-api': mockGrafanaApiFailure
//     });

//     test.setup({
//       'fedops.json': fedopsJson
//     });

//     return fedopsSync({inTeamCity: () => true})()
//       .then(() => {
//         expect(stdout).to.contain('grafana sync failure: status status message: response text');
//       });
//   });
});
