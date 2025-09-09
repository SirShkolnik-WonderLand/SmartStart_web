#!/usr/bin/env node

/**
 * SmartStart Private Umbrella System - Test Runner
 * Runs comprehensive tests for the umbrella system
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🌂 SmartStart Private Umbrella System - Test Runner');
console.log('==================================================\n');

// Test configuration
const testConfig = {
  testFile: path.join(__dirname, 'umbrella-system.test.js'),
  timeout: 30000, // 30 seconds
  verbose: true
};

// Test categories
const testCategories = [
  {
    name: 'Database Schema Tests',
    description: 'Testing database models and relationships'
  },
  {
    name: 'Umbrella Service Tests',
    description: 'Testing core umbrella service functionality'
  },
  {
    name: 'State Machine Tests',
    description: 'Testing umbrella state machine workflows'
  },
  {
    name: 'API Endpoint Tests',
    description: 'Testing REST API endpoints'
  },
  {
    name: 'Integration Tests',
    description: 'Testing end-to-end workflows'
  },
  {
    name: 'Performance Tests',
    description: 'Testing system performance and scalability'
  }
];

// Run tests
async function runTests() {
  try {
    console.log('🚀 Starting umbrella system tests...\n');

    // Check if Jest is available
    try {
      execSync('npx jest --version', { stdio: 'pipe' });
    } catch (error) {
      console.log('📦 Installing Jest for testing...');
      execSync('npm install --save-dev jest supertest', { stdio: 'inherit' });
    }

    // Run the tests
    console.log('🧪 Running comprehensive test suite...\n');
    
    const testCommand = `npx jest ${testConfig.testFile} --verbose --timeout=${testConfig.timeout}`;
    execSync(testCommand, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    console.log('\n✅ All tests completed successfully!');
    console.log('🎉 Umbrella system is ready for production!');

  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure database is running and accessible');
    console.log('2. Check environment variables are set correctly');
    console.log('3. Verify all dependencies are installed');
    console.log('4. Check database schema is up to date');
    
    process.exit(1);
  }
}

// Test summary
function printTestSummary() {
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  testCategories.forEach((category, index) => {
    console.log(`${index + 1}. ${category.name}`);
    console.log(`   ${category.description}`);
  });
  
  console.log('\n🎯 Expected Results:');
  console.log('- All database operations should succeed');
  console.log('- State machine transitions should be valid');
  console.log('- API endpoints should return correct responses');
  console.log('- Integration workflows should complete successfully');
  console.log('- Performance tests should meet benchmarks');
}

// Main execution
async function main() {
  printTestSummary();
  
  console.log('\n⏳ Starting test execution in 3 seconds...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await runTests();
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n🛑 Test execution interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test execution terminated');
  process.exit(0);
});

// Run the tests
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testConfig,
  testCategories
};
