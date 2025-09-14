#!/usr/bin/env node

const https = require('https');

const API_BASE = 'https://smartstart-api.onrender.com';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1ZGktc3VwZXItYWRtaW4tMDAxIiwiZW1haWwiOiJ1ZGkuYWRtaW5AYWxpY2Vzb2x1dGlvbnNncm91cC5jb20iLCJuYW1lIjoiVWRpIFNoa29sbmlrIiwicm9sZSI6IlNVUEVSX0FETUlOIiwiaWF0IjoxNzM2ODQ0MDAwLCJleHAiOjE3MzY5MzA0MDB9.mock-signature';

async function testApiCall(endpoint, description) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'smartstart-api.onrender.com',
            port: 443,
            path: endpoint,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log(`✅ ${description}: ${res.statusCode} - ${jsonData.success ? 'SUCCESS' : 'FAILED'}`);
                    if (!jsonData.success) {
                        console.log(`   Error: ${jsonData.error}`);
                    }
                    resolve({ success: jsonData.success, status: res.statusCode, data: jsonData });
                } catch (e) {
                    console.log(`❌ ${description}: ${res.statusCode} - JSON Parse Error`);
                    console.log(`   Response: ${data.substring(0, 200)}...`);
                    resolve({ success: false, status: res.statusCode, error: 'JSON Parse Error' });
                }
            });
        });

        req.on('error', (err) => {
            console.log(`❌ ${description}: ERROR - ${err.message}`);
            resolve({ success: false, error: err.message });
        });

        req.setTimeout(10000, () => {
            console.log(`⏰ ${description}: TIMEOUT`);
            req.destroy();
            resolve({ success: false, error: 'Timeout' });
        });

        req.end();
    });
}

async function testDashboardApis() {
    console.log('🧪 Testing Dashboard API Endpoints...\n');

    const tests = [
        { endpoint: '/api/auth/me', description: 'Get Current User' },
        { endpoint: '/api/dashboard/', description: 'Get Analytics' },
        { endpoint: '/api/v1/buz/supply', description: 'Get BUZ Supply' },
        { endpoint: '/api/v1/buz/balance/udi-super-admin-001', description: 'Get BUZ Balance' },
        { endpoint: '/api/journey/status/udi-super-admin-001', description: 'Get Journey Status' },
        { endpoint: '/api/legal-signing/status/udi-super-admin-001', description: 'Get Legal Pack Status' },
        { endpoint: '/api/subscriptions/user/udi-super-admin-001', description: 'Get Subscription Status' },
        { endpoint: '/api/v1/ventures/list/all', description: 'Get Ventures' },
        { endpoint: '/api/contracts', description: 'Get Offers/Contracts' }
    ];

    const results = [];
    for (const test of tests) {
        const result = await testApiCall(test.endpoint, test.description);
        results.push({...test, result });
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between requests
    }

    console.log('\n📊 Summary:');
    const successful = results.filter(r => r.result.success).length;
    const failed = results.filter(r => !r.result.success).length;
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);

    if (failed > 0) {
        console.log('\n❌ Failed endpoints:');
        results.filter(r => !r.result.success).forEach(r => {
            console.log(`   - ${r.description}: ${r.result.error || 'Unknown error'}`);
        });
    }
}

testDashboardApis().catch(console.error);