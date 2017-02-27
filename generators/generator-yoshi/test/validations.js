'use strict';

const assert = require('assert');
const validations = require('../generators/app/validations');

describe('validations', () => {
  describe('keywords', () => {
    it('should split text by commas', () => {
      assert.deepEqual(validations.keywords('hello,world,foo,bar'), ['hello', 'world', 'foo', 'bar']);
    });

    it('should strip whitespaces', () => {
      assert.deepEqual(validations.keywords('hello  , world,   foo, bar'), ['hello', 'world', 'foo', 'bar']);
    });
  });

  describe('notEmpty', () => {
    it('should alert for empty strings', () => {
      assert.equal(validations.notEmpty(''), validations.errors.EMPTY);
    });

    it('should return true for anything else', () => {
      assert.equal(validations.notEmpty('hello'), true);
      assert.equal(validations.notEmpty('w'), true);
    });
  });
});
