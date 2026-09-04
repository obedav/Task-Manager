'use strict';

/**
 * Database seed script – creates a single demo user for local development.
 * Usage: node scripts/seed.js
 *
 * Never run this against a production database with real user data.
 */
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');

const SEED_EMAIL    = process.env.SEED_EMAIL    || 'demo@taskflow.dev';
const SEED_PASSWORD = process.env.SEED_PASSWORD || 'DemoPass@2026!';
const SEED_NAME     = process.env.SEED_NAME     || 'Demo User';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Seed requires a real database connection.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Remove existing seed user (idempotent)
  const existing = await User.findOne({ email: SEED_EMAIL });
  if (existing) {
    await Task.deleteMany({ user: existing._id });
    await User.deleteOne({ _id: existing._id });
    console.log(`Removed existing seed user (${SEED_EMAIL})`);
  }

  const user = await User.create({ name: SEED_NAME, email: SEED_EMAIL, password: SEED_PASSWORD });
  console.log(`Created seed user: ${SEED_EMAIL}`);

  await Task.create([
    { title: 'Read the project README', description: 'Understand the architecture and setup steps', status: 'completed', priority: 'high', progress: 100, user: user._id },
    { title: 'Configure environment variables', description: 'Copy .env.example to .env and fill in values', status: 'in-progress', priority: 'high', progress: 60, user: user._id },
    { title: 'Explore the dashboard', description: 'Try creating and managing tasks', status: 'pending', priority: 'medium', user: user._id }
  ]);
  console.log('Created 3 seed tasks');

  await mongoose.disconnect();
  console.log(`\nSeed complete.\nLogin: ${SEED_EMAIL} / ${SEED_PASSWORD}`);
}

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
