'use strict';

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const PLANS = {
  pro:  { priceId: process.env.STRIPE_PRO_PRICE_ID,  name: 'Pro',  amount: 999  },
  team: { priceId: process.env.STRIPE_TEAM_PRICE_ID, name: 'Team', amount: 2499 }
};

const getOrCreateCustomer = async (user) => {
  let sub = await Subscription.findOne({ user: user._id });
  if (sub?.stripeCustomerId) return sub.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user._id.toString() }
  });

  if (!sub) {
    sub = await Subscription.create({ user: user._id, stripeCustomerId: customer.id });
  } else {
    sub.stripeCustomerId = customer.id;
    await sub.save();
  }
  return customer.id;
};

// GET /api/v1/billing/subscription — current plan info
router.get('/subscription', authenticate, async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id }) || { plan: 'free', status: 'free' };
    res.json({ success: true, subscription: sub });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/billing/checkout — create Stripe Checkout session
router.post('/checkout', authenticate, async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ success: false, message: 'Invalid plan' });
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ success: false, message: 'Billing not configured' });
    }

    const customerId = await getOrCreateCustomer(req.user);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/settings?tab=billing&success=1`,
      cancel_url:  `${process.env.FRONTEND_URL}/settings?tab=billing&canceled=1`,
      metadata: { userId: req.user._id.toString(), plan }
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/billing/portal — Stripe customer portal (manage/cancel)
router.post('/portal', authenticate, async (req, res, next) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ success: false, message: 'Billing not configured' });
    }
    const customerId = await getOrCreateCustomer(req.user);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/settings?tab=billing`
    });
    res.json({ success: true, url: session.url });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/billing/webhook — Stripe webhook (raw body required)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const { type, data } = event;

  try {
    if (type === 'checkout.session.completed') {
      const session = data.object;
      const userId = session.metadata?.userId;
      const plan   = session.metadata?.plan;
      if (userId && plan) {
        const stripeSub = await stripe.subscriptions.retrieve(session.subscription);
        await Subscription.findOneAndUpdate(
          { user: userId },
          {
            stripeSubscriptionId: stripeSub.id,
            stripePriceId: stripeSub.items.data[0].price.id,
            plan, status: 'active',
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000)
          },
          { upsert: true, new: true }
        );
      }
    }

    if (type === 'customer.subscription.updated') {
      const stripeSub = data.object;
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: stripeSub.id },
        {
          status: stripeSub.status,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000)
        }
      );
    }

    if (type === 'customer.subscription.deleted') {
      const stripeSub = data.object;
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: stripeSub.id },
        { plan: 'free', status: 'free', stripeSubscriptionId: null, currentPeriodEnd: null }
      );
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  res.json({ received: true });
});

module.exports = router;
