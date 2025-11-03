/**
 * TEST REPORT SYSTEM
 * Manual test script to verify daily reports are working
 */

import { enhancedAnalyticsEmailService } from '../server/services/enhancedAnalyticsEmailService.js';
import { leadGenerationReportService } from '../server/services/leadGenerationReportService.js';

async function testReports() {
  console.log('🧪 Testing Daily Reports System...\n');

  // Test 1: Traffic Report
  console.log('📊 Test 1: Traffic Report');
  console.log('─'.repeat(50));
  try {
    const trafficResult = await enhancedAnalyticsEmailService.sendDailyTrafficReport();
    if (trafficResult.success) {
      console.log('✅ Traffic report sent successfully!\n');
    } else {
      console.error('❌ Traffic report failed:', trafficResult.error);
      console.log('\n');
    }
  } catch (error) {
    console.error('❌ Traffic report error:', error);
    console.log('\n');
  }

  // Test 2: Lead Report
  console.log('💼 Test 2: Lead Report');
  console.log('─'.repeat(50));
  try {
    const leadResult = await leadGenerationReportService.sendDailyLeadReport();
    if (leadResult.success) {
      console.log('✅ Lead report sent successfully!\n');
    } else {
      console.error('❌ Lead report failed:', leadResult.error);
      console.log('\n');
    }
  } catch (error) {
    console.error('❌ Lead report error:', error);
    console.log('\n');
  }

  console.log('✅ Testing complete!');
  console.log('📧 Check your email: udi.shkolnik@alicesolutionsgroup.com');
}

testReports().catch(console.error);

