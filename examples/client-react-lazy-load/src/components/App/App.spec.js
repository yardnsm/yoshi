import 'jsdom-global/register';
import React from 'react';
import {mount} from 'enzyme';
import tp from 'trier-promise';
import App from './App';

describe('App', () => {
  let wrapper;

  afterEach(() => wrapper.detach());

  beforeEach(() => {
    jest.useFakeTimers();
    wrapper = mount(
      <App/>, {attachTo: document.createElement('div')}
    );
  });

  it('should show <Loading />', () =>
    expect(hasLoading(wrapper)).toBeTruthy());

  it('should hide <Dashboard />', () =>
    expect(hasDashboard(wrapper)).toBeFalsy());

  describe('and 200ms has passed', () => {
    beforeEach(() => {
      jest.runTimersToTime(200);
      jest.useRealTimers();
    });

    it('should hide <Loading />', () =>
      eventually(() => expect(hasLoading(wrapper)).toBeFalsy()));

    it('should show <Dashboard />', () =>
      eventually(() => expect(hasDashboard(wrapper)).toBeTruthy()));
  });

  function hasDashboard(wrapper) {
    return wrapper.find('[data-hook="dashboard"]').length > 0;
  }

  function hasLoading(wrapper) {
    return wrapper.find('[data-hook="loading"]').length > 0;
  }
});

function eventually(action) {
  return tp({
    action,
    timeout: 10000,
    interval: 200
  });
}
