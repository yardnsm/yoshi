import {expect} from 'chai';
import 'babel-polyfill';
import {beforeAndAfter} from '../environment';

describe('React application', () => {
  beforeAndAfter();

  describe('open page', () => {
    it('should display title', async () => {
      await browser.get('/');
      expect(await $('h2').getText()).to.eql('Hello World!');
    });
  });
});
