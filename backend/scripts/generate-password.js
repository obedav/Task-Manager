#!/usr/bin/env node

const bcrypt = require('bcryptjs');

async function generatePasswordHash() {
  const password = 'password123';
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // Test verification
    const isValid = await bcrypt.compare(password, hash);
    console.log('Verification test:', isValid ? '✅ PASS' : '❌ FAIL');
    
    return hash;
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generatePasswordHash(); 