#!/usr/bin/env node

// Environment variable checker for production
const requiredEnvVars = {
  production: [
    'JWT_SECRET',
    'MONGODB_URI',
    'NODE_ENV'
  ],
  staging: [
    'JWT_SECRET',
    'MONGODB_URI',
    'NODE_ENV'
  ],
  development: [
    'JWT_SECRET'
  ]
};

const currentEnv = process.env.NODE_ENV || 'development';
const required = requiredEnvVars[currentEnv] || requiredEnvVars.development;

console.log(`🔍 Checking environment variables for ${currentEnv}...`);

const missing = [];
const weak = [];

required.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    missing.push(varName);
  } else if (varName === 'JWT_SECRET' && value.length < 32) {
    weak.push(`${varName} (too short, should be at least 32 characters)`);
  }
});

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(varName => console.error(`   - ${varName}`));
  console.error('\n💡 Create a .env file with these variables');
  process.exit(1);
}

if (weak.length > 0) {
  console.warn('⚠️  Weak environment variables:');
  weak.forEach(varName => console.warn(`   - ${varName}`));
  console.warn('\n💡 Consider strengthening these for production');
}

console.log('✅ Environment variables check passed'); 