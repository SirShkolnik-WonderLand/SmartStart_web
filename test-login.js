// Simple test script to verify login flow
const fetch = require('node-fetch');

async function testLogin() {
    try {
        console.log('🧪 Testing SmartStart Login Flow...\n');

        // Test 1: API Health Check
        console.log('1️⃣ Testing API Health...');
        const healthResponse = await fetch('http://localhost:3001/health');
        const healthData = await healthResponse.json();
        console.log(`   ✅ API Health: ${healthData.ok ? 'OK' : 'FAILED'}\n`);

        // Test 2: Login API
        console.log('2️⃣ Testing Login API...');
        const loginResponse = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@smartstart.com',
                password: 'admin123'
            })
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log(`   ✅ Login Successful: ${loginData.user.email} (${loginData.user.role})`);
            console.log(`   🔑 Token: ${loginData.token.substring(0, 20)}...\n`);

            // Test 3: Protected Endpoint
            console.log('3️⃣ Testing Protected Endpoint...');
            const meResponse = await fetch('http://localhost:3001/me', {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`
                }
            });

            if (meResponse.ok) {
                const meData = await meResponse.json();
                console.log(`   ✅ Protected Route: ${meData.email} (${meData.role})`);
            } else {
                console.log(`   ❌ Protected Route Failed: ${meResponse.status}`);
            }

        } else {
            console.log(`   ❌ Login Failed: ${loginResponse.status}`);
        }

        // Test 4: Web App Accessibility
        console.log('\n4️⃣ Testing Web App...');
        const webResponse = await fetch('http://localhost:3000/login');
        if (webResponse.ok) {
            console.log('   ✅ Web App: Login page accessible');
        } else {
            console.log(`   ❌ Web App: ${webResponse.status}`);
        }

        console.log('\n🎉 Test Complete!');

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
}

testLogin();