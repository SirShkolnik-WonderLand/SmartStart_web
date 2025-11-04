/**
 * CHECK DATA STORAGE
 * Script to verify what data actually exists in storage
 */

import { analyticsStorage } from '../server/services/analyticsStorage.js';
import { leadTrackingService } from '../server/services/leadTrackingService.js';

async function checkData() {
  console.log('🔍 Checking Data Storage...\n');

  // Check all leads
  const allLeads = analyticsStorage.getAllLeads();
  console.log(`📋 Total Leads in Storage: ${allLeads.length}`);
  
  if (allLeads.length > 0) {
    console.log('\n📊 Recent Leads (last 10):');
    allLeads.slice(-10).forEach((lead, idx) => {
      console.log(`  ${idx + 1}. ${lead.name} (${lead.email}) - ${new Date(lead.timestamp).toLocaleDateString()}`);
      console.log(`     Service: ${lead.service || 'N/A'}, Source: ${lead.referrer || 'N/A'}`);
    });
  } else {
    console.log('⚠️  No leads found in storage!');
  }

  // Check last 7 days
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const last7DaysLeads = analyticsStorage.getLeads(sevenDaysAgo, endOfToday);
  console.log(`\n📅 Leads in Last 7 Days: ${last7DaysLeads.length}`);

  if (last7DaysLeads.length > 0) {
    console.log('\n📊 Leads by Day:');
    const leadsByDay: Record<string, number> = {};
    last7DaysLeads.forEach(lead => {
      const date = new Date(lead.timestamp).toISOString().split('T')[0];
      leadsByDay[date] = (leadsByDay[date] || 0) + 1;
    });
    Object.entries(leadsByDay).sort().forEach(([date, count]) => {
      console.log(`  ${date}: ${count} lead(s)`);
    });
  }

  // Check daily summaries
  const summaries = analyticsStorage.getDailySummaries(sevenDaysAgo, endOfToday);
  console.log(`\n📈 Daily Summaries (Last 7 Days): ${summaries.length}`);
  
  if (summaries.length > 0) {
    summaries.forEach(summary => {
      console.log(`  ${summary.date}: ${summary.totalVisitors} visitors, ${summary.totalPageViews} pageviews, ${summary.totalLeads} leads`);
    });
  } else {
    console.log('⚠️  No daily summaries found!');
  }

  // Test lead analytics
  console.log('\n🔍 Testing Lead Analytics...');
  const leadAnalytics = await leadTrackingService.getLeadAnalytics(today);
  console.log(`  Total Leads Today: ${leadAnalytics.totalLeads}`);
  console.log(`  Total Leads Yesterday: ${leadAnalytics.totalLeadsPreviousDay}`);
  console.log(`  Leads by Service:`, leadAnalytics.leadsByService.slice(0, 5));
  console.log(`  Leads by Source:`, leadAnalytics.leadsBySource.slice(0, 5));
}

checkData()
  .then(() => {
    console.log('\n✅ Data check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error checking data:', error);
    process.exit(1);
  });

