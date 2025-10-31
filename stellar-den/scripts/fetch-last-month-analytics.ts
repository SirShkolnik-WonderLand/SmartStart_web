/**
 * ANALYTICS DATA FETCHER
 * Fetches last month's analytics data from Analytics Hub
 */

import axios from 'axios';

const ANALYTICS_API_URL = 'https://analytics-hub-server.onrender.com';

async function login() {
  try {
    const response = await axios.post(`${ANALYTICS_API_URL}/simple-login`, {
      email: 'udi.shkolnik@alicesolutionsgroup.com',
      password: 'test123'
    });
    
    if (response.data?.success && response.data?.token) {
      return response.data.token;
    }
    return null;
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
}

async function fetchAnalyticsData(token: string) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  const startDateStr = startDate.toISOString();
  const endDateStr = endDate.toISOString();
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  console.log('📊 FETCHING LAST 30 DAYS OF ANALYTICS DATA...\n');
  console.log(`📅 Date Range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}\n`);
  
  try {
    // Overview Stats
    console.log('📊 OVERVIEW STATISTICS:');
    console.log('─'.repeat(60));
    const overview = await axios.get(`${ANALYTICS_API_URL}/api/admin/stats/overview`, {
      params: { startDate: startDateStr, endDate: endDateStr },
      headers
    });
    
    if (overview.data?.success && overview.data?.data) {
      const stats = overview.data.data;
      console.log(`👥 Total Visitors: ${stats.totalVisitors || 0}`);
      console.log(`📄 Total Page Views: ${stats.totalPageViews || 0}`);
      console.log(`🔢 Unique Visitors: ${stats.uniqueVisitors || 0}`);
      console.log(`⏱️  Avg Session Duration: ${stats.avgSessionDuration || 0}s`);
      console.log(`📈 Conversions: ${stats.conversions || 0}`);
      console.log('');
    } else {
      console.log('⚠️  No overview data available');
      console.log('');
    }
    
    // Top Pages
    console.log('🔥 TOP PAGES (Last 30 Days):');
    console.log('─'.repeat(60));
    const pages = await axios.get(`${ANALYTICS_API_URL}/api/admin/analytics/pages`, {
      params: { startDate: startDateStr, endDate: endDateStr, limit: 20 },
      headers
    });
    
    if (pages.data?.success && pages.data?.data?.length > 0) {
      pages.data.data.slice(0, 15).forEach((page: any, index: number) => {
        const url = page.page_url || page.pagePath || page.url || 'N/A';
        const views = page.views || page.pageViews || 0;
        console.log(`   ${index + 1}. ${url}: ${views} views`);
      });
    } else {
      console.log('   No page data available');
    }
    console.log('');
    
    // Traffic Sources
    console.log('🌍 TRAFFIC SOURCES (Last 30 Days):');
    console.log('─'.repeat(60));
    const sources = await axios.get(`${ANALYTICS_API_URL}/api/admin/analytics/sources`, {
      params: { startDate: startDateStr, endDate: endDateStr, limit: 15 },
      headers
    });
    
    if (sources.data?.success && sources.data?.data?.length > 0) {
      sources.data.data.forEach((source: any) => {
        const name = source.source_name || source.source || 'Unknown';
        const visitors = source.visitors || source.count || 0;
        console.log(`   ${name}: ${visitors} visitors`);
      });
    } else {
      console.log('   No source data available');
    }
    console.log('');
    
    // Geographic Data
    console.log('🌎 TOP COUNTRIES (Last 30 Days):');
    console.log('─'.repeat(60));
    const locations = await axios.get(`${ANALYTICS_API_URL}/api/admin/analytics/locations`, {
      params: { startDate: startDateStr, endDate: endDateStr },
      headers
    });
    
    if (locations.data?.success && locations.data?.data?.length > 0) {
      locations.data.data.slice(0, 15).forEach((loc: any) => {
        const country = loc.country_name || loc.country || 'Unknown';
        const visitors = loc.visitors || loc.count || 0;
        console.log(`   ${country}: ${visitors} visitors`);
      });
    } else {
      console.log('   No geographic data available');
    }
    console.log('');
    
    // Device Breakdown
    console.log('📱 DEVICES (Last 30 Days):');
    console.log('─'.repeat(60));
    const devices = await axios.get(`${ANALYTICS_API_URL}/api/admin/analytics/devices`, {
      params: { startDate: startDateStr, endDate: endDateStr },
      headers
    });
    
    if (devices.data?.success && devices.data?.data?.length > 0) {
      devices.data.data.forEach((device: any) => {
        const type = device.device_type || device.device || 'Unknown';
        const count = device.visitors || device.count || 0;
        console.log(`   ${type}: ${count}`);
      });
    } else {
      console.log('   No device data available');
    }
    console.log('');
    
    // Traffic Trends
    console.log('📈 TRAFFIC TRENDS (Last 30 Days):');
    console.log('─'.repeat(60));
    const trends = await axios.get(`${ANALYTICS_API_URL}/api/admin/stats/trends`, {
      params: { startDate: startDateStr, endDate: endDateStr, interval: 'day' },
      headers
    });
    
    if (trends.data?.success && trends.data?.data?.length > 0) {
      console.log('   Daily Breakdown:');
      trends.data.data.slice(-10).forEach((trend: any) => {
        const date = new Date(trend.date || trend.timestamp).toLocaleDateString();
        const visitors = trend.visitors || trend.count || 0;
        console.log(`   ${date}: ${visitors} visitors`);
      });
    } else {
      console.log('   No trend data available');
    }
    console.log('');
    
    console.log('✅ Analytics data fetch complete!');
    
  } catch (error: any) {
    console.error('❌ Error fetching analytics:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run
(async () => {
  const token = await login();
  if (token) {
    await fetchAnalyticsData(token);
  } else {
    console.error('❌ Failed to authenticate');
  }
  process.exit(0);
})();

