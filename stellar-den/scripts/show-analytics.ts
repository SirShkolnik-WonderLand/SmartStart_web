/**
 * QUICK ANALYTICS DATA FETCHER
 * Fetches and displays current website analytics and lead data
 */

import { enhancedAnalyticsEmailService } from '../server/services/enhancedAnalyticsEmailService.js';
import { leadTrackingService } from '../server/services/leadTrackingService.js';
import { analyticsStorage } from '../server/services/analyticsStorage.js';

async function showAnalyticsData() {
  console.log('🔍 FETCHING WEBSITE ANALYTICS DATA...\n');
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  try {
    // Fetch traffic analytics
    console.log('📊 TRAFFIC ANALYTICS:');
    console.log('─'.repeat(60));
    const trafficData = await enhancedAnalyticsEmailService.getDailyAnalytics(today);
    
    if (trafficData) {
      console.log(`✅ Data found for ${todayStr}`);
      console.log('');
      console.log(`👥 Total Visitors: ${trafficData.totalVisitors || 0}`);
      console.log(`📄 Total Page Views: ${trafficData.totalPageViews || 0}`);
      console.log(`🔢 Unique Visitors: ${trafficData.uniqueVisitors || 0}`);
      console.log('');
      
      if (trafficData.topPages && trafficData.topPages.length > 0) {
        console.log('🔥 TOP PAGES:');
        trafficData.topPages.slice(0, 10).forEach((page: any, index: number) => {
          console.log(`   ${index + 1}. ${page.path} - ${page.views} views`);
        });
        console.log('');
      }
      
      if (trafficData.referrers && trafficData.referrers.length > 0) {
        console.log('🌍 TRAFFIC SOURCES:');
        trafficData.referrers.forEach((ref: any) => {
          console.log(`   ${ref.source || 'Direct'}: ${ref.visitors} visitors`);
        });
        console.log('');
      }
      
      if (trafficData.devices) {
        console.log('📱 DEVICES:');
        console.log(`   Desktop: ${trafficData.devices.desktop || 0}`);
        console.log(`   Mobile: ${trafficData.devices.mobile || 0}`);
        console.log(`   Tablet: ${trafficData.devices.tablet || 0}`);
        console.log('');
      }
      
      if (trafficData.countries && trafficData.countries.length > 0) {
        console.log('🌎 TOP COUNTRIES:');
        trafficData.countries.slice(0, 10).forEach((country: any) => {
          console.log(`   ${country.country}: ${country.visitors} visitors`);
        });
        console.log('');
      }
    } else {
      console.log('⚠️  No traffic data available for today');
      console.log('   (Reports may not have run yet, or Analytics Hub needs authentication)');
      console.log('');
    }
    
    // Fetch lead analytics
    console.log('💼 LEAD GENERATION DATA:');
    console.log('─'.repeat(60));
    const leadAnalytics = await leadTrackingService.getLeadAnalytics(today);
    
    console.log(`📋 Total Leads Today: ${leadAnalytics.totalLeads}`);
    console.log(`📋 Leads Yesterday: ${leadAnalytics.totalLeadsPreviousDay}`);
    
    if (leadAnalytics.leadsChange !== 0) {
      const trend = leadAnalytics.leadsChange >= 0 ? '📈' : '📉';
      console.log(`   ${trend} Change: ${leadAnalytics.leadsChange >= 0 ? '+' : ''}${leadAnalytics.leadsChange} (${leadAnalytics.leadsChangePercent >= 0 ? '+' : ''}${leadAnalytics.leadsChangePercent.toFixed(1)}%)`);
    }
    console.log('');
    
    if (leadAnalytics.totalLeads > 0) {
      if (leadAnalytics.leadsByService.length > 0) {
        console.log('🎯 LEADS BY SERVICE:');
        leadAnalytics.leadsByService.forEach((item: any) => {
          console.log(`   ${item.service}: ${item.count} (${item.percent.toFixed(1)}%)`);
        });
        console.log('');
      }
      
      if (leadAnalytics.leadsBySource.length > 0) {
        console.log('📊 LEADS BY SOURCE:');
        leadAnalytics.leadsBySource.forEach((item: any) => {
          console.log(`   ${item.source}: ${item.count} (${item.percent.toFixed(1)}%)`);
        });
        console.log('');
      }
      
      if (leadAnalytics.topConvertingPages.length > 0) {
        console.log('🔥 TOP CONVERTING PAGES:');
        leadAnalytics.topConvertingPages.forEach((page: any, index: number) => {
          console.log(`   ${index + 1}. ${page.page}: ${page.leads} leads`);
        });
        console.log('');
      }
      
      if (leadAnalytics.newLeads.length > 0) {
        console.log('🆕 RECENT LEADS (Last 10):');
        leadAnalytics.newLeads.forEach((lead: any, index: number) => {
          const date = new Date(lead.timestamp).toLocaleString();
          console.log(`   ${index + 1}. ${lead.name} (${lead.email})`);
          console.log(`      Service: ${lead.service || 'N/A'}`);
          console.log(`      From: ${lead.pageUrl}`);
          console.log(`      Time: ${date}`);
          console.log('');
        });
      }
    } else {
      console.log('📭 No leads yet today');
      console.log('');
    }
    
    // Show all stored leads
    console.log('📚 ALL STORED LEADS:');
    console.log('─'.repeat(60));
    const allLeads = analyticsStorage.getAllLeads();
    console.log(`Total Leads Stored: ${allLeads.length}`);
    
    if (allLeads.length > 0) {
      console.log('');
      console.log('📋 Recent Leads:');
      allLeads.slice(-10).reverse().forEach((lead: any, index: number) => {
        const date = new Date(lead.timestamp).toLocaleString();
        console.log(`   ${index + 1}. ${lead.name} (${lead.email})`);
        console.log(`      Company: ${lead.company || 'N/A'}`);
        console.log(`      Service: ${lead.service || 'N/A'}`);
        console.log(`      Budget: ${lead.budget || 'N/A'}`);
        console.log(`      Timeline: ${lead.timeline || 'N/A'}`);
        console.log(`      Source: ${lead.pageUrl}`);
        console.log(`      Date: ${date}`);
        console.log('');
      });
    }
    
    console.log('✅ Analytics data fetch complete!');
    
  } catch (error: any) {
    console.error('❌ Error fetching analytics:', error.message);
    console.error(error.stack);
  }
}

showAnalyticsData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

