const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE = 'https://smartstart-api.onrender.com';

async function testAPIs() {
  console.log('🧪 Testing all APIs...\n');
  
  try {
    // Test 1: Ventures API
    console.log('1️⃣ Testing Ventures API...');
    const venturesResponse = await fetch(`${API_BASE}/api/ventures/list/all`);
    const venturesData = await venturesResponse.json();
    
    if (venturesResponse.ok) {
      console.log('   ✅ Ventures API working');
      console.log(`   📊 Found ${venturesData.ventures?.length || 0} ventures`);
      if (venturesData.ventures?.length > 0) {
        console.log(`   🚀 First venture: ${venturesData.ventures[0].name}`);
      }
    } else {
      console.log('   ❌ Ventures API failed:', venturesData.message);
    }
    console.log('');
    
    // Test 2: Subscription API (with test user ID)
    console.log('2️⃣ Testing Subscription API...');
    const testUserId = 'cmf99w3mt00008on0yd7i7fym';
    const subscriptionResponse = await fetch(`${API_BASE}/api/subscriptions/status/${testUserId}`);
    const subscriptionData = await subscriptionResponse.json();
    
    if (subscriptionResponse.ok) {
      console.log('   ✅ Subscription API working');
      console.log(`   💳 Subscription status: ${subscriptionData.data?.status || 'No subscription'}`);
    } else {
      console.log('   ❌ Subscription API failed:', subscriptionData.message);
    }
    console.log('');
    
    // Test 3: Legal Pack API
    console.log('3️⃣ Testing Legal Pack API...');
    const legalPackResponse = await fetch(`${API_BASE}/api/legal-pack`);
    const legalPackData = await legalPackResponse.json();
    
    if (legalPackResponse.ok) {
      console.log('   ✅ Legal Pack API working');
      console.log(`   📋 Found ${legalPackData.data?.length || 0} legal packs`);
    } else {
      console.log('   ❌ Legal Pack API failed:', legalPackData.message);
    }
    console.log('');
    
    // Test 4: Billing Plans API
    console.log('4️⃣ Testing Billing Plans API...');
    const billingResponse = await fetch(`${API_BASE}/api/billing/plans`);
    const billingData = await billingResponse.json();
    
    if (billingResponse.ok) {
      console.log('   ✅ Billing Plans API working');
      console.log(`   💰 Found ${billingData.data?.length || 0} billing plans`);
    } else {
      console.log('   ❌ Billing Plans API failed:', billingData.message);
    }
    console.log('');
    
    // Test 5: Health Check
    console.log('5️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE}/api/ventures/health`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('   ✅ Health Check working');
      console.log(`   🏥 Status: ${healthData.status || 'Unknown'}`);
    } else {
      console.log('   ❌ Health Check failed:', healthData.message);
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ Error testing APIs:', error.message);
  }
}

testAPIs();
