#!/usr/bin/env node

/**
 * Comprehensive CRUD Journey Test
 * Tests the complete 11-step journey with full database CRUD operations
 */

const https = require('https');

const API_BASE = 'https://smartstart-api.onrender.com';
const TEST_USER = {
    email: 'test-crud@smartstart.com',
    password: 'testcrud123',
    firstName: 'Test',
    lastName: 'User'
};

let authToken = '';
let userId = '';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'smartstart-api.onrender.com',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ status: res.statusCode, data: response });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Test functions
async function testRegistration() {
    console.log('\n🔐 Testing Registration...');
    const response = await makeRequest('POST', '/api/auth/register', TEST_USER);

    if (response.status === 201 || (response.status === 200 && response.data.success)) {
        console.log('✅ Registration successful');
        authToken = response.data.data ? .token || response.data.token;
        userId = response.data.data ? .user ? .id || response.data.user ? .id;
        return true;
    } else if (response.status === 400 && response.data.message && response.data.message.includes('already exists')) {
        console.log('ℹ️  User already exists, testing login...');
        return await testLogin();
    } else {
        console.log('❌ Registration failed:', response.data);
        return false;
    }
}

async function testLogin() {
    console.log('\n🔑 Testing Login...');
    const response = await makeRequest('POST', '/api/auth/login', {
        email: TEST_USER.email,
        password: TEST_USER.password
    });

    if (response.status === 200) {
        console.log('✅ Login successful');
        authToken = response.data.data ? .token || response.data.token;
        userId = response.data.data ? .user ? .id || response.data.user ? .id;
        return true;
    } else {
        console.log('❌ Login failed:', response.data);
        return false;
    }
}

async function testJourneyProgress() {
    console.log('\n📊 Testing Journey Progress...');
    const response = await makeRequest('GET', `/api/journey-state/progress/${userId}`, null, {
        'Cookie': `auth-token=${authToken}`
    });

    if (response.status === 200) {
        console.log('✅ Journey progress retrieved');
        console.log(`   Progress: ${response.data.data.progress.percentage}%`);
        console.log(`   Completed: ${response.data.data.progress.completedStages}/${response.data.data.progress.totalStages}`);
        return response.data.data;
    } else {
        console.log('❌ Journey progress failed:', response.data);
        return null;
    }
}

async function testStageStart(stageId) {
    console.log(`\n🚀 Testing Stage Start: ${stageId}...`);
    const response = await makeRequest('POST', '/api/journey-state/start', {
        userId,
        stageId
    }, {
        'Cookie': `auth-token=${authToken}`
    });

    if (response.status === 200) {
        console.log(`✅ Stage ${stageId} started successfully`);
        return response.data.data;
    } else {
        console.log(`❌ Stage ${stageId} start failed:`, response.data);
        return null;
    }
}

async function testStageComplete(stageId) {
    console.log(`\n✅ Testing Stage Complete: ${stageId}...`);
    const response = await makeRequest('POST', '/api/journey-state/complete', {
        userId,
        stageId
    }, {
        'Cookie': `auth-token=${authToken}`
    });

    if (response.status === 200) {
        console.log(`✅ Stage ${stageId} completed successfully`);
        return response.data.data;
    } else {
        console.log(`❌ Stage ${stageId} completion failed:`, response.data);
        if (response.data.data && response.data.data.failedGates) {
            console.log('   Failed gates:', response.data.data.failedGates.map(g => ({
                gate: g.gateName,
                type: g.gateType,
                reason: g.details ? .error || 'Not passed'
            })));
        }
        return null;
    }
}

async function testDatabaseCRUD() {
    console.log('\n💾 Testing Database CRUD Operations...');

    // Test creating a venture
    console.log('   Creating venture...');
    const ventureResponse = await makeRequest('POST', '/api/ventures', {
        name: 'Test Venture',
        purpose: 'Testing CRUD operations',
        region: 'US'
    }, {
        'Cookie': `auth-token=${authToken}`
    });

    if (ventureResponse.status === 200 || ventureResponse.status === 201) {
        console.log('   ✅ Venture created');
    } else {
        console.log('   ❌ Venture creation failed:', ventureResponse.data);
    }

    // Test creating a team member
    console.log('   Creating team member...');
    const teamResponse = await makeRequest('POST', '/api/team', {
        userId: userId,
        role: 'FOUNDER',
        permissions: ['READ', 'WRITE']
    }, {
        'Cookie': `auth-token=${authToken}`
    });

    if (teamResponse.status === 200 || teamResponse.status === 201) {
        console.log('   ✅ Team member created');
    } else {
        console.log('   ❌ Team member creation failed:', teamResponse.data);
    }
}

async function testAllJourneyStages() {
    console.log('\n🎯 Testing All 11 Journey Stages...');

    const stages = [
        'stage_1', 'stage_2', 'stage_3', 'stage_4', 'stage_5',
        'stage_6', 'stage_7', 'stage_8', 'stage_9', 'stage_10', 'stage_11'
    ];

    for (const stageId of stages) {
        console.log(`\n--- Testing ${stageId} ---`);

        // Start stage
        const startResult = await testStageStart(stageId);
        if (!startResult) {
            console.log(`   ⚠️  Could not start ${stageId}, skipping...`);
            continue;
        }

        // Try to complete stage (will fail if gates not met)
        const completeResult = await testStageComplete(stageId);
        if (completeResult) {
            console.log(`   ✅ ${stageId} completed successfully`);
        } else {
            console.log(`   ⚠️  ${stageId} completion blocked by gates (expected for some stages)`);
        }

        // Small delay between stages
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function testAPIEndpoints() {
    console.log('\n🌐 Testing API Endpoints...');

    const endpoints = [
        { method: 'GET', path: '/api/auth/me', name: 'Get Current User' },
        { method: 'GET', path: '/api/journey-state/progress/' + userId, name: 'Journey Progress' },
        { method: 'GET', path: '/api/ventures', name: 'List Ventures' },
        { method: 'GET', path: '/api/team', name: 'List Team' },
        { method: 'GET', path: '/api/projects', name: 'List Projects' }
    ];

    for (const endpoint of endpoints) {
        const response = await makeRequest(endpoint.method, endpoint.path, null, {
            'Cookie': `auth-token=${authToken}`
        });

        if (response.status === 200) {
            console.log(`   ✅ ${endpoint.name}: ${response.status}`);
        } else {
            console.log(`   ❌ ${endpoint.name}: ${response.status} - ${response.data.message || 'Error'}`);
        }
    }
}

async function runComprehensiveTest() {
    console.log('🚀 Starting Comprehensive CRUD Journey Test');
    console.log('==========================================');

    try {
        // Step 1: Authentication
        const authSuccess = await testRegistration();
        if (!authSuccess) {
            console.log('❌ Authentication failed, aborting test');
            return;
        }

        // Step 2: Test journey progress
        const journeyData = await testJourneyProgress();
        if (!journeyData) {
            console.log('❌ Could not retrieve journey data, aborting test');
            return;
        }

        // Step 3: Test database CRUD operations
        await testDatabaseCRUD();

        // Step 4: Test API endpoints
        await testAPIEndpoints();

        // Step 5: Test all journey stages
        await testAllJourneyStages();

        // Step 6: Final journey status
        console.log('\n📈 Final Journey Status:');
        const finalStatus = await testJourneyProgress();
        if (finalStatus) {
            console.log(`   Progress: ${finalStatus.progress.percentage}%`);
            console.log(`   Completed: ${finalStatus.progress.completedStages}/${finalStatus.progress.totalStages}`);
            console.log(`   In Progress: ${finalStatus.progress.inProgressStages}`);
        }

        console.log('\n🎉 Comprehensive CRUD Journey Test Completed!');

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run the test
runComprehensiveTest();