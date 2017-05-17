import {expect} from 'chai';
import axios from 'axios';
import {getTestBaseUrl} from '../test-common';
import {beforeAndAfter} from '../environment';

const axiosInstance = axios.create({
  baseURL: getTestBaseUrl(),
  adapter: require('axios/lib/adapters/http')
});

describe('When rendering', () => {

  beforeAndAfter();

  it('should display a title', async () => {
    const response = await axiosInstance.get('/');
    expect(response.data).to.contain('Wix Full Stack Project Boilerplate');
  });
});
