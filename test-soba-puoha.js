#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://smartstart-api.onrender.com';

// Helper to make HTTPS requests
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
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
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

// Test data for SOBA
const sobaTestData = {
    subscriber_legal_name: "Test Company Inc.",
    effective_date: "2025-09-04",
    project_domain: "testcompany.ca",
    seats_count: 2,
    seats: [{
            full_name: "John Doe",
            local_part: "john.doe",
            role: "Engineer",
            intune_ready: "Y",
            start_date: "2025-09-04"
        },
        {
            full_name: "Jane Smith",
            local_part: "jane.smith",
            role: "PM",
            intune_ready: "Y",
            start_date: "2025-09-15"
        }
    ],
    billing_email: "billing@testcompany.ca",
    billing_address: "123 Test St, Toronto, ON",
    payment_token_ref: "tok_test_123456789",
    proration_choice: "Y",
    accept_non_refundable: "Y",
    accept_security_baseline: "Y",
    accept_ptsa_binding: "Y",
    tenantId: "test_tenant_001"
};

// Test data for PUOHA
const puohaTestData = {
    project_owner_legal_name: "Test Ventures Ltd.",
    project_id: "test-project-001",
    effective_date: "2025-09-04",
    baseline: {
        m365_on: "Y",
        entra_mfa_on: "Y",
        intune_defender_on: "Y",
        github_org_on: "Y",
        cicd_secrets_on: "Y",
        backups_logs_on: "Y",
        dlp_on: "Y"
    },
    residency: "CA",
    render_monthly_est_cad: "50.00",
    gh_monthly_est_cad: "25.00",
    sec_monthly_or_oneoff_cad: "100.00",
    mon_monthly_est_cad: "30.00",
    other_monthly_est_cad: "15.00",
    payer_entity: "Test Ventures Ltd.",
    billing_email: "billing@testventures.ca",
    payment_token_ref: "tok_test_987654321",
    agree_recurring: "Y"
};

async function testHealth() {
    console.log('🔍 Testing health endpoint...');
    const result = await makeRequest('GET', '/health');
    if (result.status === 200 && result.data.status === 'healthy') {
        console.log('✅ Health check passed');
        return true;
    } else {
        console.log('❌ Health check failed:', result);
        return false;
    }
}

async function testSOBAWithoutAuth() {
    console.log('🔍 Testing SOBA endpoint without auth (should fail)...');
    const result = await makeRequest('POST', '/api/documents/issue/soba', sobaTestData);
    if (result.status === 401 && result.data.message === 'Access token required') {
        console.log('✅ SOBA auth check passed');
        return true;
    } else {
        console.log('❌ SOBA auth check failed:', result);
        return false;
    }
}

async function testPUOHAWithoutAuth() {
    console.log('🔍 Testing PUOHA endpoint without auth (should fail)...');
    const result = await makeRequest('POST', '/api/documents/issue/puoha', puohaTestData);
    if (result.status === 401 && result.data.message === 'Access token required') {
        console.log('✅ PUOHA auth check passed');
        return true;
    } else {
        console.log('❌ PUOHA auth check failed:', result);
        return false;
    }
}

async function testTemplatesEndpoint() {
    console.log('🔍 Testing templates endpoint...');
    const result = await makeRequest('GET', '/api/documents/templates');
    if (result.status === 200 && result.data.success) {
        console.log('✅ Templates endpoint working');
        console.log(`   Found ${result.data.data.totalTemplates} templates`);
        return true;
    } else {
        console.log('❌ Templates endpoint failed:', result);
        return false;
    }
}

async function testStatsEndpoint() {
    console.log('🔍 Testing stats endpoint...');
    const result = await makeRequest('GET', '/api/documents/stats');
    if (result.status === 200 && result.data.success) {
        console.log('✅ Stats endpoint working');
        console.log(`   Total documents: ${result.data.data.totalDocuments}`);
        return true;
    } else {
        console.log('❌ Stats endpoint failed:', result);
        return false;
    }
}

async function testValidationErrors() {
    console.log('🔍 Testing validation errors...');

    // Test invalid SOBA data
    const invalidSOBA = {...sobaTestData, subscriber_legal_name: "" };
    const sobaResult = await makeRequest('POST', '/api/documents/issue/soba', invalidSOBA);
    if (sobaResult.status === 401) {
        console.log('✅ SOBA validation properly gated by auth');
    } else {
        console.log('❌ SOBA validation issue:', sobaResult);
    }

    // Test invalid PUOHA data  
    const invalidPUOHA = {...puohaTestData, project_owner_legal_name: "" };
    const puohaResult = await makeRequest('POST', '/api/documents/issue/puoha', invalidPUOHA);
    if (puohaResult.status === 401) {
        console.log('✅ PUOHA validation properly gated by auth');
    } else {
        console.log('❌ PUOHA validation issue:', puohaResult);
    }
}

async function runAllTests() {
    console.log('🚀 Starting SOBA/PUOHA Implementation Tests\n');

    const tests = [
        testHealth,
        testSOBAWithoutAuth,
        testPUOHAWithoutAuth,
        testTemplatesEndpoint,
        testStatsEndpoint,
        testValidationErrors
    ];

    let passed = 0;
    let total = tests.length;

    for (const test of tests) {
        try {
            const result = await test();
            if (result) passed++;
        } catch (error) {
            console.log('❌ Test error:', error.message);
        }
        console.log('');
    }

    console.log(`📊 Test Results: ${passed}/${total} tests passed`);

    if (passed === total) {
        console.log('🎉 All tests passed! SOBA/PUOHA implementation is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Check the output above for details.');
    }

    console.log('\n📝 Next steps:');
    console.log('1. Test with valid authentication token');
    console.log('2. Verify file creation in server/Contracts/ directories');
    console.log('3. Test document signing flow');
    console.log('4. Verify event emission');
}

// Run the tests
runAllTests().catch(console.error);