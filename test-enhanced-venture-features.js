#!/usr/bin/env node
/**
 * Enhanced Venture Features Test Suite
 * Tests all the new venture management features including BUZ tokens, file uploads, collaboration, and gamification
 */

const https = require('https');
const fs = require('fs');

// Test configuration
const config = {
  baseUrl: 'https://smartstart-python-brain.onrender.com',
  testUserId: 'test-user-001',
  testVentureId: 'test-venture-001'
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test runner
async function runTest(testName, testFunction) {
  testResults.total++;
  console.log(`\n🧪 Running test: ${testName}`);
  
  try {
    await testFunction();
    testResults.passed++;
    testResults.details.push({ name: testName, status: 'PASSED', error: null });
    console.log(`✅ ${testName} - PASSED`);
  } catch (error) {
    testResults.failed++;
    testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
    console.log(`❌ ${testName} - FAILED: ${error.message}`);
  }
}

// Test functions
async function testVentureCreationWithBuzTokens() {
  const ventureData = {
    name: 'Test Enhanced Venture',
    description: 'A test venture with BUZ token integration',
    industry: 'Technology',
    tier: 'T1',
    ownerUserId: config.testUserId,
    stage: 'idea',
    teamSize: 1,
    maxTeamSize: 5,
    rewardType: 'hybrid',
    equityPercentage: 15,
    cashAmount: 50000,
    isPublic: true,
    allowApplications: true,
    tags: ['test', 'enhanced', 'buz-tokens'],
    files: []
  };

  const response = await makeRequest(`${config.baseUrl}/api/ventures/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: ventureData
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(`Expected status 200/201, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`Venture creation failed: ${response.data.error}`);
  }

  if (!response.data.venture) {
    throw new Error('No venture data returned');
  }

  if (!response.data.buzTokens) {
    throw new Error('No BUZ token information returned');
  }

  console.log(`   💰 BUZ Tokens: ${response.data.buzTokens.awarded} awarded, ${response.data.buzTokens.spent} spent`);
  console.log(`   🚀 Venture ID: ${response.data.venture.id}`);
}

async function testVentureDiscovery() {
  const response = await makeRequest(`${config.baseUrl}/api/ventures?search=test&industry=Technology&sortBy=newest`);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`Venture discovery failed: ${response.data.error}`);
  }

  if (!Array.isArray(response.data.ventures)) {
    throw new Error('Ventures should be an array');
  }

  console.log(`   📊 Found ${response.data.ventures.length} ventures`);
}

async function testVentureDetails() {
  const response = await makeRequest(`${config.baseUrl}/api/ventures/${config.testVentureId}`);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`Venture details failed: ${response.data.error}`);
  }

  if (!response.data.venture) {
    throw new Error('No venture details returned');
  }

  console.log(`   📋 Venture: ${response.data.venture.name}`);
  console.log(`   👥 Team: ${response.data.venture.teamSize}/${response.data.venture.maxTeamSize}`);
}

async function testVentureApplication() {
  const applicationData = {
    userId: config.testUserId,
    role: 'Frontend Developer',
    message: 'I am excited to join this venture and contribute to its success!',
    skills: ['React', 'TypeScript', 'Next.js'],
    experience: '5 years'
  };

  const response = await makeRequest(`${config.baseUrl}/api/ventures/${config.testVentureId}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: applicationData
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(`Expected status 200/201, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`Application failed: ${response.data.error}`);
  }

  if (!response.data.application) {
    throw new Error('No application data returned');
  }

  console.log(`   📝 Application ID: ${response.data.application.id}`);
  console.log(`   💰 BUZ Reward: ${response.data.buzTokens?.awarded || 0} tokens`);
}

async function testFileUpload() {
  // Mock file data
  const fileData = {
    name: 'test-pitch-deck.pdf',
    type: 'application/pdf',
    content: Buffer.from('Mock PDF content').toString('base64'),
    userId: config.testUserId
  };

  const response = await makeRequest(`${config.baseUrl}/api/ventures/${config.testVentureId}/files/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: fileData
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(`Expected status 200/201, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`File upload failed: ${response.data.error}`);
  }

  if (!response.data.file) {
    throw new Error('No file data returned');
  }

  console.log(`   📁 File: ${response.data.file.name}`);
  console.log(`   💰 BUZ Cost: ${response.data.buzTokens?.spent || 0} tokens`);
}

async function testBuzTokenBalance() {
  const response = await makeRequest(`${config.baseUrl}/api/ventures/${config.testVentureId}/buz/balance?userId=${config.testUserId}`);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`BUZ balance check failed: ${response.data.error}`);
  }

  if (typeof response.data.balance !== 'number') {
    throw new Error('Balance should be a number');
  }

  console.log(`   💎 BUZ Balance: ${response.data.balance}`);
}

async function testVentureAnalytics() {
  const response = await makeRequest(`${config.baseUrl}/api/ventures/${config.testVentureId}/analytics`);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`Analytics failed: ${response.data.error}`);
  }

  if (!response.data.analytics) {
    throw new Error('No analytics data returned');
  }

  console.log(`   📊 Views: ${response.data.analytics.views}`);
  console.log(`   📝 Applications: ${response.data.analytics.applications}`);
  console.log(`   ❤️ Likes: ${response.data.analytics.likes}`);
}

async function testVentureLike() {
  const likeData = {
    userId: config.testUserId,
    action: 'like'
  };

  const response = await makeRequest(`${config.baseUrl}/api/ventures/${config.testVentureId}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: likeData
  });

  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`Like failed: ${response.data.error}`);
  }

  console.log(`   ❤️ Likes: ${response.data.likes}`);
}

async function testHealthCheck() {
  const response = await makeRequest(`${config.baseUrl}/api/ventures/health`);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`Health check failed: ${response.data.error}`);
  }

  if (response.data.service !== 'Enhanced Venture API') {
    throw new Error('Wrong service name returned');
  }

  console.log(`   🏥 Service: ${response.data.service}`);
  console.log(`   📊 Status: ${response.data.status}`);
  console.log(`   🔢 Version: ${response.data.version}`);
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Enhanced Venture Features Test Suite');
  console.log('=' .repeat(60));
  
  // Core functionality tests
  await runTest('Health Check', testHealthCheck);
  await runTest('Venture Creation with BUZ Tokens', testVentureCreationWithBuzTokens);
  await runTest('Venture Discovery', testVentureDiscovery);
  await runTest('Venture Details', testVentureDetails);
  
  // Collaboration tests
  await runTest('Venture Application', testVentureApplication);
  await runTest('File Upload', testFileUpload);
  
  // BUZ token tests
  await runTest('BUZ Token Balance', testBuzTokenBalance);
  
  // Analytics tests
  await runTest('Venture Analytics', testVentureAnalytics);
  await runTest('Venture Like', testVentureLike);
  
  // Print results
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.details
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   • ${test.name}: ${test.error}`);
      });
  }
  
  console.log('\n🎉 Enhanced Venture Features Test Suite Complete!');
  
  // Save results to file
  const resultsFile = 'test-results-enhanced-venture.json';
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      total: testResults.total,
      successRate: (testResults.passed / testResults.total) * 100
    },
    details: testResults.details
  }, null, 2));
  
  console.log(`📁 Results saved to: ${resultsFile}`);
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});
