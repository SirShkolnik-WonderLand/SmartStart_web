#!/usr/bin/env node

const https = require('https');

// Simulate the frontend API service
class MockApiService {
    constructor() {
        this.API_BASE = 'https://smartstart-api.onrender.com';
    }

    async fetchWithAuth(endpoint) {
        return new Promise((resolve, reject) => {
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1ZGktc3VwZXItYWRtaW4tMDAxIiwiZW1haWwiOiJ1ZGkuYWRtaW5AYWxpY2Vzb2x1dGlvbnNncm91cC5jb20iLCJuYW1lIjoiVWRpIFNoa29sbmlrIiwicm9sZSI6IlNVUEVSX0FETUlOIiwiaWF0IjoxNzM2ODQ0MDAwLCJleHAiOjE3MzY5MzA0MDB9.mock-signature';

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
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve({ success: true, data: jsonData });
                        } else {
                            reject(new Error(`API Error: ${res.statusCode}`));
                        }
                    } catch (e) {
                        reject(new Error('JSON Parse Error'));
                    }
                });
            });

            req.on('error', (err) => {
                reject(err);
            });

            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Timeout'));
            });

            req.end();
        });
    }

    async getCurrentUser() {
        try {
            console.log('🔄 Calling getCurrentUser...');
            const response = await this.fetchWithAuth('/api/auth/me');
            console.log('📥 getCurrentUser response:', JSON.stringify(response, null, 2));

            // Handle both response formats: { success: true, user: {...} } and { success: true, data: { user: {...} } }
            const responseData = response;
            const user = responseData.user || response.data ? .user;

            if (response.success && user) {
                console.log('✅ User found:', user.name);
                return { success: true, data: user };
            } else {
                throw new Error('Invalid response from /api/auth/me');
            }
        } catch (error) {
            console.error('❌ getCurrentUser error:', error.message);
            throw error;
        }
    }

    async getAnalytics() {
        try {
            console.log('🔄 Calling getAnalytics...');
            const response = await this.fetchWithAuth('/api/dashboard/');
            console.log('📥 getAnalytics response:', response.success ? 'SUCCESS' : 'FAILED');
            return response;
        } catch (error) {
            console.error('❌ getAnalytics error:', error.message);
            return { success: false, error: 'Failed to load analytics' };
        }
    }
}

async function testDashboardSimulation() {
    console.log('🧪 Testing Dashboard Frontend Simulation...\n');

    const apiService = new MockApiService();

    try {
        console.log('🔄 Starting dashboard data load...');

        // Test getCurrentUser
        const userResponse = await apiService.getCurrentUser();
        console.log('👤 User response success:', userResponse.success);

        if (userResponse.success && userResponse.data) {
            console.log('✅ User data loaded successfully:', userResponse.data.name);
        } else {
            console.warn('⚠️ User data failed to load');
        }

        // Test getAnalytics
        const analyticsResponse = await apiService.getAnalytics();
        console.log('📊 Analytics response success:', analyticsResponse.success);

        console.log('\n✅ Dashboard simulation completed successfully!');

    } catch (error) {
        console.error('❌ Dashboard simulation failed:', error.message);
    }
}

testDashboardSimulation().catch(console.error);