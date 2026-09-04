'use strict';

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      console.error('MONGODB_URI is not set. Cannot start in production without a database.');
      process.exit(1);
    }
    console.warn('MONGODB_URI not set – running WITHOUT a database (development only).');
    console.warn('Data will not persist. Set MONGODB_URI in .env to enable persistence.');
    return null;
  }

  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
