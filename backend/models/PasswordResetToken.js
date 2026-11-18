'use strict';

const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetTokenSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  token:     { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true }
});

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

passwordResetTokenSchema.statics.generate = function (userId) {
  const raw = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return { raw, doc: { user: userId, token: hashed, expiresAt } };
};

passwordResetTokenSchema.statics.verify = async function (rawToken) {
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
  return this.findOne({ token: hashed, expiresAt: { $gt: new Date() } });
};

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
