'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/whatdoio-user-data';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-whatdoio-user-data';
exports.PORT = process.env.PORT || 8080;

exports.JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';