'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/whatdoio-user-data';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-whatdoio-user-data';
exports.PORT = process.env.PORT || 8080;

// have dev secret key here
  // production key is on heroku