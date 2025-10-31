/**
 * QUICK ANALYTICS CHECKER
 * Fetches and displays current website analytics data
 */

import axios from 'axios';

const ANALYTICS_API_URL = process.env.ANALYTICS_API_URL || 'https://analytics-hub-server.onrender.com';
const DATE = process.argv[2] || new Date().toISOString().split('T')[0];

async function fetchAnalytics() {
  try {
    console.log('🔍 Fetching analytics data from:', ANALYTICS_API_URL);
    console.log('📅 Date:', DATE);
    console.log('');

    const response = await axios.get(`${ANALYTICS_API_URL}/api/admin/reports/daily`, {
      params: { date: DATE },
    });

    if (response.data?.success && response.data?.data) {
      const data = response.data.data;
      
      console.log('✅ ANALYTICS DATA FOUND!');
      console.log('');
      console.log('📊 TRAFFIC OVERVIEW:');
      console.log(`   Total Visitors: ${data.totalVisitors || 0}`);
      console.log(`   Total Page Views: ${data.totalPageViews || 0}`);
      console.log(`   Unique Visitors: ${data.uniqueVisitors || 0}`);
      console.log('');

      if (data.topPages && data.topPages.length > 0) {
        console.log('🔥 TOP PAGES:');
        data.topPages.slice(0, 10).forEach((page: any, index: number) => {
          console.log(`   ${index + 1}. ${page.path} - ${page.views} views`);
        });
        console.log('');
      }

      if (data.referrers && data.referrers.length > 0) {
        console.log('🌍 TRAFFIC SOURCES:');
        data.referrers.forEach((ref: any) => {
          console.log(`   ${ref.source || 'Direct'}: ${ref.visitors} visitors`);
        });
        console.log('');
      }

      if (data.devices) {
        console.log('📱 DEVICES:');
        console.log(`   Desktop: ${data.devices.desktop || 0}`);
        console.log(`   Mobile: ${data.devices.mobile || 0}`);
        console.log(`   Tablet: ${data.devices.tablet || 0}`);
        console.log('');
      }

      if (data.countries && data.countries.length > 0) {
        console.log('🌎 TOP COUNTRIES:');
        data.countries.slice(0, 10).forEach((country: any) => {
          console.log(`   ${country.country}: ${country.visitors} visitors`);
        });
        console.log('');
      }

      return data;
    } else {
      console.log('⚠️  No analytics data available for this date');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error fetching analytics:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    return null;
  }
}

// Run
fetchAnalytics()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

