'use strict';

module.exports.errors = {
  MISSING_PREFIX: 'missing "com.wixpress." prefix',
  EMPTY: 'this field is obligatory',
  INVALID_EMAIL: 'invalid emaill adress (has to be wix email address)'
};

module.exports.keywords = text => {
  return text.split(/\s*,\s*/g);
};

module.exports.notEmpty = text => {
  if (text.length <= 0) {
    return module.exports.errors.EMPTY;
  }

  return true;
};

module.exports.wixEmail = text => {
  if (!/^[a-z0-9](\.?[a-z0-9]){1,}@wix\.com$/.test(text)) {
    return module.exports.errors.INVALID_EMAIL;
  }

  return true;
};
