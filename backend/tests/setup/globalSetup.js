'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.JWT_SECRET  = 'test-secret-do-not-use-in-production';
  process.env.NODE_ENV    = 'test';
  global.__MONGOD__ = mongod;
};
