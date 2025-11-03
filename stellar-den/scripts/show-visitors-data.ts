#!/usr/bin/env tsx
/**
 * Show current visitor and analytics data
 * Run: pnpm tsx scripts/show-visitors-data.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import axios from 'axios';

const ANALYTICS_API_URL = process.env.ANALYTICS_API_URL || process.env.VITE_ANALYTICS_API_URL || 'https://analytics-hub-server.onrender.com';
const ADMIN_EMAIL = 'udi.shkolnik@alicesolutionsgroup.com';
const ADMIN_PASSWORD = process.env.ANALYTICS_ADMIN_PASSWORD || '';

async function authenticate() {
  try {
    // Try simple login endpoint first
    const loginResponse = await axios.post(`${ANALYTICS_API_URL}/api/auth/simple-login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (loginResponse.data?.token || loginResponse.data?.apiKey) {
      return loginResponse.data.token || loginResponse.data.apiKey;
    }
  } catch (error) {
    console.log('Simple login not available, trying API key...');
  }

  // Fallback: use API key if available
  if (process.env.ANALYTICS_API_KEY) {
    return process.env.ANALYTICS_API_KEY;
  }

  return null;
}

async function getAnalyticsData(token: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Get overview
    const overviewResponse = await axios.get(`${ANALYTICS_API_URL}/api/admin/stats/overview`, {
      headers
    });

    return overviewResponse.data?.data || overviewResponse.data;
  } catch (error: any) {
    console.error('❌ Error fetching analytics:', error.message);
    return null;
  }
}

async function getRecentPageviews(token: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await axios.get(`${ANALYTICS_API_URL}/api/admin/analytics/pages?limit=20`, {
      headers
    });

    return response.data?.data || response.data;
  } catch (error) {
    return null;
  }
}

async function getStoredLeads() {
  try {
    const leadsPath = join(process.cwd(), 'server', 'data', 'analytics', 'leads.json');
    const leadsData = JSON.parse(readFileSync(leadsPath, 'utf-8'));
    return leadsData.leads || [];
  } catch (error) {
    return [];
  }
}

async function main() {
  console.log('🔍 Fetching visitor and analytics data...\n');

  // Authenticate
  const token = await authenticate();
  if (!token && !ADMIN_PASSWORD) {
    console.log('⚠️  No authentication available. Trying without auth...\n');
  }

  // Get Analytics Hub data
  console.log('📊 Analytics Hub Data:');
  console.log('─'.repeat(50));
  const analyticsData = await getAnalyticsData(token);
  
  if (analyticsData) {
    console.log('✅ Total Visitors:', analyticsData.totalVisitors || 0);
    console.log('✅ Total Pageviews:', analyticsData.totalPageviews || 0);
    console.log('✅ Unique Visitors:', analyticsData.uniqueVisitors || 0);
    console.log('✅ Total Sessions:', analyticsData.totalSessions || 0);
    console.log('✅ Avg Session Duration:', analyticsData.avgSessionDuration || 0, 'seconds');
    console.log('✅ Bounce Rate:', analyticsData.bounceRate || 0, '%');
    console.log('✅ Active Visitors (Now):', analyticsData.activeVisitors || 0);
  } else {
    console.log('❌ No analytics data available from Analytics Hub API');
    console.log('   Check: Analytics Hub server is running and accessible');
    console.log('   URL:', ANALYTICS_API_URL);
  }

  // Get recent pageviews
  console.log('\n📄 Recent Pageviews (Top 10):');
  console.log('─'.repeat(50));
  const pageviews = await getRecentPageviews(token);
  if (pageviews) {
    const pages = pageviews.pages || pageviews.data || (Array.isArray(pageviews) ? pageviews : []);
    if (pages.length > 0) {
      pages.slice(0, 10).forEach((page: any, index: number) => {
        console.log(`${index + 1}. ${page.url || page.page_url || page.pagePath || 'Unknown'}`);
        console.log(`   Views: ${page.views || page.pageViews || 0}, Visitors: ${page.uniqueVisitors || page.unique_visitors || 0}`);
      });
    } else {
      console.log('❌ No pageview data available');
    }
  } else {
    console.log('❌ No pageview data available');
  }

  // Get stored leads
  console.log('\n💼 Stored Leads:');
  console.log('─'.repeat(50));
  const leads = await getStoredLeads();
  if (leads.length > 0) {
    console.log(`✅ Total Leads: ${leads.length}`);
    console.log('\nRecent Leads:');
    leads.slice(-10).reverse().forEach((lead: any, index: number) => {
      console.log(`${index + 1}. ${lead.name || 'Unknown'} (${lead.email || 'No email'})`);
      console.log(`   Service: ${lead.service || 'N/A'}, Date: ${lead.timestamp || 'N/A'}`);
      console.log(`   Page: ${lead.pageUrl || 'N/A'}`);
    });
  } else {
    console.log('❌ No leads found in storage');
  }

  console.log('\n' + '─'.repeat(50));
  console.log('\n💡 To trigger reports manually:');
  console.log('   curl -X POST https://alicesolutionsgroup.com/api/zoho/reports/traffic');
  console.log('   curl -X POST https://alicesolutionsgroup.com/api/zoho/reports/leads');
  console.log('\n📧 Reports sent to: udi.shkolnik@alicesolutionsgroup.com');
  console.log('   Schedule: Traffic Report 8:00 AM, Lead Report 9:00 AM EST');
}

main().catch(console.error);

