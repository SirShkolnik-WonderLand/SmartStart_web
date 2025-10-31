/**
 * COMPREHENSIVE ANALYTICS CHECK
 * Tests entire analytics system after 2 hours
 */

import axios from 'axios';

const ANALYTICS_API_URL = 'https://analytics-hub-server.onrender.com';

async function login() {
  try {
    const response = await axios.post(`${ANALYTICS_API_URL}/simple-login`, {
      email: 'udi.shkolnik@alicesolutionsgroup.com',
      password: 'test123'
    });
    return response.data?.success ? response.data.token : null;
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
}

async function comprehensiveCheck() {
  console.log('🔍 COMPREHENSIVE ANALYTICS SYSTEM CHECK');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const token = await login();
  if (!token) {
    console.error('❌ Failed to authenticate');
    return;
  }
  
  const headers = { 'Authorization': `Bearer ${token}` };
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last2h = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  
  try {
    // 1. Check server health
    console.log('1️⃣  SERVER HEALTH CHECK:');
    console.log('─'.repeat(60));
    const health = await axios.get(`${ANALYTICS_API_URL}/health`);
    console.log(`   Status: ${health.data.status}`);
    console.log(`   Version: ${health.data.version}`);
    console.log(`   Timestamp: ${health.data.timestamp}\n`);
    
    // 2. Check last 24 hours
    console.log('2️⃣  LAST 24 HOURS DATA:');
    console.log('─'.repeat(60));
    const overview24h = await axios.get(`${ANALYTICS_API_URL}/api/admin/stats/overview`, {
      params: { startDate: last24h.toISOString(), endDate: now.toISOString() },
      headers
    });
    
    if (overview24h.data?.success) {
      const data = overview24h.data.data;
      console.log(`   👥 Total Visitors: ${data.totalVisitors || 0}`);
      console.log(`   📄 Total Page Views: ${data.totalPageViews || 0}`);
      console.log(`   🔢 Total Sessions: ${data.totalSessions || 0}`);
      console.log(`   ⏱️  Avg Session Duration: ${data.avgSessionDuration || 0}s`);
      console.log(`   📊 Bounce Rate: ${data.bounceRate || 0}%`);
      console.log(`   🟢 Active Visitors: ${data.activeVisitors || 0}\n`);
    } else {
      console.log('   ⚠️  No data available\n');
    }
    
    // 3. Check last 2 hours
    console.log('3️⃣  LAST 2 HOURS DATA:');
    console.log('─'.repeat(60));
    const overview2h = await axios.get(`${ANALYTICS_API_URL}/api/admin/stats/overview`, {
      params: { startDate: last2h.toISOString(), endDate: now.toISOString() },
      headers
    });
    
    if (overview2h.data?.success) {
      const data = overview2h.data.data;
      console.log(`   👥 Visitors: ${data.totalVisitors || 0}`);
      console.log(`   📄 Page Views: ${data.totalPageViews || 0}`);
      console.log(`   🔢 Sessions: ${data.totalSessions || 0}\n`);
    } else {
      console.log('   ⚠️  No data available\n');
    }
    
    // 4. Check recent events
    console.log('4️⃣  RECENT EVENTS (Last 20):');
    console.log('─'.repeat(60));
    const realtime = await axios.get(`${ANALYTICS_API_URL}/api/admin/stats/realtime`, { headers });
    
    if (realtime.data?.success && realtime.data.data?.recentEvents?.length > 0) {
      const events = realtime.data.data.recentEvents.slice(0, 10);
      events.forEach((event: any, index: number) => {
        const time = new Date(event.createdAt).toLocaleString();
        const page = event.pageUrl || event.pagePath || 'N/A';
        const type = event.eventType || 'unknown';
        console.log(`   ${index + 1}. [${time}] ${type} - ${page}`);
      });
      console.log(`\n   Total events in database: ${realtime.data.data.recentEvents.length}\n`);
    } else {
      console.log('   ⚠️  No recent events found\n');
    }
    
    // 5. Check top pages today
    console.log('5️⃣  TOP PAGES TODAY:');
    console.log('─'.repeat(60));
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const pages = await axios.get(`${ANALYTICS_API_URL}/api/admin/analytics/pages`, {
      params: { startDate: todayStart.toISOString(), endDate: now.toISOString(), limit: 10 },
      headers
    });
    
    if (pages.data?.success && pages.data.data?.length > 0) {
      pages.data.data.slice(0, 10).forEach((page: any, index: number) => {
        const url = page.page_url || page.pagePath || page.url || 'N/A';
        const views = page.views || page.pageViews || 0;
        console.log(`   ${index + 1}. ${url}: ${views} views`);
      });
    } else {
      console.log('   ⚠️  No page data available');
    }
    console.log('');
    
    // 6. Check traffic sources
    console.log('6️⃣  TRAFFIC SOURCES TODAY:');
    console.log('─'.repeat(60));
    const sources = await axios.get(`${ANALYTICS_API_URL}/api/admin/analytics/sources`, {
      params: { startDate: todayStart.toISOString(), endDate: now.toISOString(), limit: 10 },
      headers
    });
    
    if (sources.data?.success && sources.data.data?.length > 0) {
      sources.data.data.forEach((source: any) => {
        const name = source.source_name || source.source || 'Unknown';
        const visitors = source.visitors || source.count || 0;
        console.log(`   ${name}: ${visitors} visitors`);
      });
    } else {
      console.log('   ⚠️  No source data available');
    }
    console.log('');
    
    // 7. Test sending a pageview
    console.log('7️⃣  TESTING TRACKING ENDPOINT:');
    console.log('─'.repeat(60));
    try {
      const testResponse = await axios.post(`${ANALYTICS_API_URL}/api/v1/pageview`, {
        sessionId: `test-${Date.now()}`,
        pageUrl: 'https://alicesolutionsgroup.com/test-check',
        pageTitle: 'Analytics System Check',
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (testResponse.data?.success) {
        console.log('   ✅ Tracking endpoint is working!');
        console.log(`   Event ID: ${testResponse.data.eventId || 'N/A'}\n`);
      } else {
        console.log('   ⚠️  Tracking endpoint returned:', testResponse.data);
      }
    } catch (error: any) {
      console.log(`   ❌ Tracking endpoint error: ${error.message}\n`);
    }
    
    // Summary
    console.log('📊 SUMMARY:');
    console.log('─'.repeat(60));
    const hasData = overview24h.data?.success && (overview24h.data.data.totalVisitors > 0 || overview24h.data.data.totalPageViews > 0);
    
    if (hasData) {
      console.log('   ✅ Analytics system is collecting data!');
      console.log(`   ✅ ${overview24h.data.data.totalVisitors} visitors in last 24h`);
      console.log(`   ✅ ${overview24h.data.data.totalPageViews} page views in last 24h`);
    } else {
      console.log('   ⚠️  No data collected yet');
      console.log('   ⚠️  Possible issues:');
      console.log('      - Tracker not loading on website');
      console.log('      - Cookie consent blocking analytics');
      console.log('      - Events not being sent');
    }
    console.log('');
    
  } catch (error: any) {
    console.error('❌ Error during check:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

comprehensiveCheck()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

