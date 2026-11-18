'use strict';

const mongoose = require('mongoose');

const revokedTokenSchema = new mongoose.Schema({
  token:     { type: String, required: true, index: true },
  expiresAt: { type: Date,   required: true }
});

// MongoDB TTL index — automatically removes documents after expiresAt
revokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RevokedToken', revokedTokenSchema);
