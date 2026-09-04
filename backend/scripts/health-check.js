#!/usr/bin/env node

const http = require('http');
const https = require('https');

const config = {
  host: process.env.HEALTH_CHECK_HOST || 'localhost',
  port: process.env.HEALTH_CHECK_PORT || process.env.PORT || 5000,
  path: '/api/health',
  timeout: 5000,
  protocol: process.env.HEALTH_CHECK_PROTOCOL || 'http'
};

const client = config.protocol === 'https' ? https : http;

const options = {
  hostname: config.host,
  port: config.port,
  path: config.path,
  method: 'GET',
  timeout: config.timeout,
  headers: {
    'User-Agent': 'Health-Check/1.0'
  }
};

console.log(`🏥 Health check for ${config.protocol}://${config.host}:${config.port}${config.path}`);

const req = client.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200 && response.success) {
        console.log('✅ Health check passed');
        console.log(`   Status: ${response.message}`);
        console.log(`   Uptime: ${response.uptime}s`);
        console.log(`   Timestamp: ${response.timestamp}`);
        process.exit(0);
      } else {
        console.error('❌ Health check failed');
        console.error(`   Status Code: ${res.statusCode}`);
        console.error(`   Response: ${data}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Health check failed - Invalid JSON response');
      console.error(`   Response: ${data}`);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Health check failed - Connection error');
  console.error(`   Error: ${error.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Health check failed - Timeout');
  req.destroy();
  process.exit(1);
});

req.end(); 