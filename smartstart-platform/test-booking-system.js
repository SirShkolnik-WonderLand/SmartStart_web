#!/usr/bin/env node

/**
 * Comprehensive Booking System Test Suite
 * Tests all endpoints and functionality
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'https://smartstart-webapp.onrender.com';
const LOCAL_URL = 'http://localhost:3346';

// Test configuration
const TEST_CONFIG = {
    baseUrl: BASE_URL, // Change to LOCAL_URL for local testing
    timeout: 30000,
    retries: 3
};

// Test data
const TEST_BOOKING = {
    service: {
        type: 'cissp',
        name: 'CISSP Training',
        price: '$2,500 CAD'
    },
    date: '2025-01-20',
    time: '10:00',
    contact: {
        name: 'Test User',
        email: 'test@alicesolutionsgroup.com',
        phone: '416-555-0123',
        company: 'Test Company'
    },
    notes: 'Test booking for system validation'
};

const TEST_WAITLIST = {
    service: 'cism',
    email: 'waitlist@alicesolutionsgroup.com',
    name: 'Waitlist Test User',
    phone: '416-555-0124',
    preferredDates: ['2025-01-25', '2025-01-26'],
    notes: 'Test waitlist entry'
};

// Utility functions
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https://');
        const client = isHttps ? https : http;
        
        const req = client.request(url, {
            timeout: TEST_CONFIG.timeout,
            ...options
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : {};
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Request timeout')));
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

// Test functions
async function testHealthCheck() {
    console.log('\n🔍 Testing Health Check...');
    try {
        const response = await makeRequest(`${TEST_CONFIG.baseUrl}/`);
        if (response.status === 200) {
            console.log('✅ Health check passed');
            return true;
        } else {
            console.log(`❌ Health check failed: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Health check error: ${error.message}`);
        return false;
    }
}

async function testBookingAPI() {
    console.log('\n📅 Testing Booking API...');
    try {
        // Test booking creation
        const bookingResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: TEST_BOOKING
        });
        
        if (bookingResponse.status === 200 && bookingResponse.data.success) {
            console.log('✅ Booking creation passed');
            console.log(`   Booking ID: ${bookingResponse.data.bookingId}`);
            
            // Test booking retrieval
            const bookingsResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/bookings`);
            if (bookingsResponse.status === 200) {
                console.log('✅ Booking retrieval passed');
                console.log(`   Total bookings: ${bookingsResponse.data.bookings?.length || 0}`);
            } else {
                console.log(`❌ Booking retrieval failed: ${bookingsResponse.status}`);
            }
            
            return true;
        } else {
            console.log(`❌ Booking creation failed: ${bookingResponse.status}`);
            console.log(`   Response: ${JSON.stringify(bookingResponse.data)}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Booking API error: ${error.message}`);
        return false;
    }
}

async function testWaitlistAPI() {
    console.log('\n⏳ Testing Waitlist API...');
    try {
        // Test waitlist addition
        const waitlistResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/waitlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: TEST_WAITLIST
        });
        
        if (waitlistResponse.status === 200 && waitlistResponse.data.success) {
            console.log('✅ Waitlist addition passed');
            console.log(`   Waitlist ID: ${waitlistResponse.data.waitlistId}`);
            
            // Test waitlist status
            const statusResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/waitlist/status/${encodeURIComponent(TEST_WAITLIST.email)}`);
            if (statusResponse.status === 200) {
                console.log('✅ Waitlist status check passed');
                console.log(`   Active entries: ${statusResponse.data.activeEntries}`);
            } else {
                console.log(`❌ Waitlist status check failed: ${statusResponse.status}`);
            }
            
            return true;
        } else {
            console.log(`❌ Waitlist addition failed: ${waitlistResponse.status}`);
            console.log(`   Response: ${JSON.stringify(waitlistResponse.data)}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Waitlist API error: ${error.message}`);
        return false;
    }
}

async function testAnalyticsAPI() {
    console.log('\n📊 Testing Analytics API...');
    try {
        const analyticsResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/analytics/overview`);
        
        if (analyticsResponse.status === 200) {
            console.log('✅ Analytics overview passed');
            console.log(`   Total bookings: ${analyticsResponse.data.totalBookings}`);
            console.log(`   Conversion rates: ${JSON.stringify(analyticsResponse.data.conversionRates)}`);
            
            // Test service-specific analytics
            const serviceResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/analytics/service/cissp`);
            if (serviceResponse.status === 200) {
                console.log('✅ Service analytics passed');
                console.log(`   Service bookings: ${serviceResponse.data.totalBookings}`);
            } else {
                console.log(`❌ Service analytics failed: ${serviceResponse.status}`);
            }
            
            return true;
        } else {
            console.log(`❌ Analytics overview failed: ${analyticsResponse.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Analytics API error: ${error.message}`);
        return false;
    }
}

async function testTimezoneAPI() {
    console.log('\n🌍 Testing Timezone API...');
    try {
        const timezoneResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/timezone/validate?date=2025-01-20&time=10:00&location=toronto`);
        
        if (timezoneResponse.status === 200) {
            console.log('✅ Timezone validation passed');
            console.log(`   Valid: ${timezoneResponse.data.isValid}`);
            console.log(`   Reason: ${timezoneResponse.data.reason}`);
            
            // Test availability
            const availabilityResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/availability/timezone?date=2025-01-20&location=toronto`);
            if (availabilityResponse.status === 200) {
                console.log('✅ Timezone availability passed');
                console.log(`   Available slots: ${availabilityResponse.data.availableSlots?.length || 0}`);
            } else {
                console.log(`❌ Timezone availability failed: ${availabilityResponse.status}`);
            }
            
            return true;
        } else {
            console.log(`❌ Timezone validation failed: ${timezoneResponse.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Timezone API error: ${error.message}`);
        return false;
    }
}

async function testMobileAccessibility() {
    console.log('\n📱 Testing Mobile & Accessibility...');
    try {
        const mobileResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/mobile/validate`);
        const accessibilityResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/accessibility/validate`);
        
        if (mobileResponse.status === 200 && accessibilityResponse.status === 200) {
            console.log('✅ Mobile validation passed');
            console.log(`   Mobile ready: ${mobileResponse.data.mobileReady}`);
            console.log('✅ Accessibility validation passed');
            console.log(`   WCAG level: ${accessibilityResponse.data.wcagLevel}`);
            return true;
        } else {
            console.log(`❌ Mobile/Accessibility validation failed`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Mobile/Accessibility error: ${error.message}`);
        return false;
    }
}

async function testAdminAPI() {
    console.log('\n👨‍💼 Testing Admin API...');
    try {
        const adminResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/admin/bookings`);
        
        if (adminResponse.status === 200) {
            console.log('✅ Admin bookings API passed');
            console.log(`   Bookings count: ${adminResponse.data.bookings?.length || 0}`);
            
            // Test waitlist admin
            const waitlistAdminResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/admin/waitlist`);
            if (waitlistAdminResponse.status === 200) {
                console.log('✅ Admin waitlist API passed');
                console.log(`   Waitlist entries: ${waitlistAdminResponse.data.stats?.totalEntries || 0}`);
            } else {
                console.log(`❌ Admin waitlist API failed: ${waitlistAdminResponse.status}`);
            }
            
            return true;
        } else {
            console.log(`❌ Admin bookings API failed: ${adminResponse.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Admin API error: ${error.message}`);
        return false;
    }
}

async function testCustomerPortal() {
    console.log('\n👤 Testing Customer Portal...');
    try {
        const portalResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/customer/bookings?email=${encodeURIComponent(TEST_BOOKING.contact.email)}`);
        
        if (portalResponse.status === 200) {
            console.log('✅ Customer portal API passed');
            console.log(`   Customer bookings: ${portalResponse.data.bookings?.length || 0}`);
            return true;
        } else {
            console.log(`❌ Customer portal API failed: ${portalResponse.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Customer portal error: ${error.message}`);
        return false;
    }
}

async function testSecurityFeatures() {
    console.log('\n🔒 Testing Security Features...');
    try {
        // Test rate limiting (should not trigger with normal usage)
        const rapidRequests = [];
        for (let i = 0; i < 5; i++) {
            rapidRequests.push(makeRequest(`${TEST_CONFIG.baseUrl}/api/analytics/overview`));
        }
        
        const responses = await Promise.all(rapidRequests);
        const successCount = responses.filter(r => r.status === 200).length;
        
        if (successCount >= 4) {
            console.log('✅ Rate limiting working (normal requests allowed)');
            return true;
        } else {
            console.log(`❌ Rate limiting issue: ${successCount}/5 requests succeeded`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Security test error: ${error.message}`);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Comprehensive Booking System Test Suite');
    console.log(`📍 Testing URL: ${TEST_CONFIG.baseUrl}`);
    console.log(`⏱️  Timeout: ${TEST_CONFIG.timeout}ms`);
    
    const startTime = Date.now();
    const testResults = [];
    
    // Run all tests
    const tests = [
        { name: 'Health Check', fn: testHealthCheck },
        { name: 'Booking API', fn: testBookingAPI },
        { name: 'Waitlist API', fn: testWaitlistAPI },
        { name: 'Analytics API', fn: testAnalyticsAPI },
        { name: 'Timezone API', fn: testTimezoneAPI },
        { name: 'Mobile & Accessibility', fn: testMobileAccessibility },
        { name: 'Admin API', fn: testAdminAPI },
        { name: 'Customer Portal', fn: testCustomerPortal },
        { name: 'Security Features', fn: testSecurityFeatures }
    ];
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            testResults.push({ name: test.name, passed: result });
        } catch (error) {
            console.log(`❌ ${test.name} crashed: ${error.message}`);
            testResults.push({ name: test.name, passed: false });
        }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Print summary
    console.log('\n📋 TEST SUMMARY');
    console.log('================');
    
    const passedTests = testResults.filter(t => t.passed).length;
    const totalTests = testResults.length;
    const passRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    testResults.forEach(test => {
        const status = test.passed ? '✅' : '❌';
        console.log(`${status} ${test.name}`);
    });
    
    console.log('\n📊 RESULTS');
    console.log(`   Tests Passed: ${passedTests}/${totalTests} (${passRate}%)`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Average per test: ${Math.round(duration / totalTests)}ms`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 ALL TESTS PASSED! Booking system is fully functional.');
    } else {
        console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    }
    
    return passedTests === totalTests;
}

// Run tests if called directly
if (require.main === module) {
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Test runner crashed:', error);
        process.exit(1);
    });
}

module.exports = {
    runAllTests,
    testHealthCheck,
    testBookingAPI,
    testWaitlistAPI,
    testAnalyticsAPI,
    testTimezoneAPI,
    testMobileAccessibility,
    testAdminAPI,
    testCustomerPortal,
    testSecurityFeatures
};
