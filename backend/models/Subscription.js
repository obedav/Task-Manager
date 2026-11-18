'use strict';

const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  stripeCustomerId:     { type: String, index: true },
  stripeSubscriptionId: { type: String, index: true },
  stripePriceId:        { type: String },
  plan: {
    type: String,
    enum: ['free', 'pro', 'team'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'trialing', 'incomplete', 'free'],
    default: 'free'
  },
  currentPeriodEnd: { type: Date },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  trialEnd: { type: Date }
}, { timestamps: true });

subscriptionSchema.virtual('isActive').get(function () {
  if (this.plan === 'free') return true;
  return ['active', 'trialing'].includes(this.status) &&
    (!this.currentPeriodEnd || this.currentPeriodEnd > new Date());
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
