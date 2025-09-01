#!/usr/bin/env node

const axios = require('axios');

const SERVICES = {
  api: 'https://smartstart-api.onrender.com',
  web: 'https://smartstart-platform.onrender.com',
  storage: 'https://smartstart-storage.onrender.com',
  monitor: 'https://smartstart-monitor.onrender.com',
  database: 'https://smartstart-database.onrender.com'
};

const checkService = async (name, url) => {
  try {
    console.log(`🔍 Checking ${name} service...`);
    const response = await axios.get(`${url}/api/health`, { timeout: 10000 });
    console.log(`✅ ${name}: ${response.status} - ${response.data.status || 'OK'}`);
    return { name, status: 'healthy', data: response.data };
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return { name, status: 'unhealthy', error: error.message };
  }
};

const checkAllServices = async () => {
  console.log('🚀 SmartStart Platform Deployment Status Check\n');
  
  const results = [];
  
  for (const [name, url] of Object.entries(SERVICES)) {
    const result = await checkService(name, url);
    results.push(result);
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Summary:');
  const healthy = results.filter(r => r.status === 'healthy').length;
  const total = results.length;
  
  console.log(`✅ Healthy: ${healthy}/${total}`);
  console.log(`❌ Unhealthy: ${total - healthy}/${total}`);
  
  if (healthy === total) {
    console.log('\n🎉 All services are healthy! Deployment successful!');
  } else {
    console.log('\n⚠️  Some services are not responding. Check deployment logs.');
  }
  
  return results;
};

// Run the check
checkAllServices().catch(console.error);
