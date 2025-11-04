/**
 * TEST COMPREHENSIVE REPORT
 * Test the comprehensive report generation locally
 */

import { comprehensiveDailyReportService } from '../server/services/comprehensiveDailyReportService.js';
import { analyticsStorage } from '../server/services/analyticsStorage.js';

async function testReport() {
  console.log('🧪 Testing Comprehensive Daily Report\n');
  console.log('='.repeat(60));
  
  // Show what data exists first
  const allLeads = analyticsStorage.getAllLeads();
  console.log(`\n📋 Total leads in storage: ${allLeads.length}`);
  
  if (allLeads.length > 0) {
    console.log('\nAll leads:');
    allLeads.forEach((lead, idx) => {
      console.log(`  ${idx + 1}. ${lead.name} (${lead.email}) - ${lead.timestamp}`);
    });
  }
  
  // Test today's report
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Generating report for TODAY:');
  const todayReport = await comprehensiveDailyReportService.generateDailyReport(new Date(), false);
  console.log(`  Total Leads: ${todayReport.leads.totalLeads}`);
  console.log(`  Total Visitors: ${todayReport.traffic.totalVisitors}`);
  console.log(`  Total Page Views: ${todayReport.traffic.totalPageViews}`);
  
  // Test with showAllData (last 30 days)
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Generating report with ALL DATA (last 30 days):');
  const allDataReport = await comprehensiveDailyReportService.generateDailyReport(new Date(), true);
  console.log(`  Total Leads: ${allDataReport.leads.totalLeads}`);
  console.log(`  Total Visitors: ${allDataReport.traffic.totalVisitors}`);
  console.log(`  Total Page Views: ${allDataReport.traffic.totalPageViews}`);
  
  if (allDataReport.leads.totalLeads > todayReport.leads.totalLeads) {
    console.log('\n✅ Found more leads with showAllData=true!');
    console.log('   This confirms leads exist but are outside today\'s date range.');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Test complete!');
}

testReport()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

