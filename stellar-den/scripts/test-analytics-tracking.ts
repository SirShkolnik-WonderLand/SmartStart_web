/**
 * TEST ANALYTICS TRACKING
 * Simulates pageviews to verify tracking is working
 */

import axios from 'axios';

const ANALYTICS_API_URL = 'https://analytics-hub-server.onrender.com';

async function testTracking() {
  console.log('🧪 TESTING ANALYTICS TRACKING...\n');
  
  const testPages = [
    { url: 'https://alicesolutionsgroup.com/', title: 'Homepage' },
    { url: 'https://alicesolutionsgroup.com/services', title: 'Services' },
    { url: 'https://alicesolutionsgroup.com/contact', title: 'Contact' },
    { url: 'https://alicesolutionsgroup.com/smartstart', title: 'SmartStart' },
    { url: 'https://alicesolutionsgroup.com/iso-studio', title: 'ISO Studio' },
  ];
  
  for (const page of testPages) {
    try {
      const sessionId = `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      console.log(`📄 Tracking: ${page.title}`);
      
      const response = await axios.post(`${ANALYTICS_API_URL}/api/v1/pageview`, {
        sessionId,
        pageUrl: page.url,
        pageTitle: page.title,
        referrer: 'https://test.com',
      }, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });
      
      if (response.data?.success) {
        console.log(`   ✅ Success: Event ID ${response.data.eventId || 'N/A'}\n`);
      } else {
        console.log(`   ⚠️  Response: ${JSON.stringify(response.data)}\n`);
      }
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('✅ Test complete!');
  console.log('\n📊 Check Analytics Hub dashboard to verify events were recorded.');
}

testTracking()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

