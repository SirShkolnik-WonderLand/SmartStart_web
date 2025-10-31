/**
 * UNIFIED DAILY REPORTS CRON SCHEDULER
 * Schedules all daily email reports at appropriate times
 */

import cron from 'node-cron';
import { enhancedAnalyticsEmailService } from '../services/enhancedAnalyticsEmailService.js';
import { leadGenerationReportService } from '../services/leadGenerationReportService.js';

export function startDailyReportsCron() {
  // Daily Traffic & SEO Report at 8:00 AM EST
  const trafficCronSchedule = process.env.TRAFFIC_REPORT_CRON || '0 8 * * *'; // 8 AM daily
  
  console.log('📅 Daily Traffic Report scheduled:', trafficCronSchedule);

  cron.schedule(trafficCronSchedule, async () => {
    console.log('📊 Running daily traffic & SEO report...');
    try {
      const result = await enhancedAnalyticsEmailService.sendDailyTrafficReport();
      if (result.success) {
        console.log('✅ Daily traffic report sent successfully');
      } else {
        console.error('❌ Failed to send daily traffic report:', result.error);
      }
    } catch (error) {
      console.error('❌ Daily traffic report cron error:', error);
    }
  });

  // Daily Lead Generation Report at 9:00 AM EST (1 hour after traffic report)
  const leadCronSchedule = process.env.LEAD_REPORT_CRON || '0 9 * * *'; // 9 AM daily
  
  console.log('📅 Daily Lead Report scheduled:', leadCronSchedule);

  cron.schedule(leadCronSchedule, async () => {
    console.log('💼 Running daily lead generation report...');
    try {
      const result = await leadGenerationReportService.sendDailyLeadReport();
      if (result.success) {
        console.log('✅ Daily lead report sent successfully');
      } else {
        console.error('❌ Failed to send daily lead report:', result.error);
      }
    } catch (error) {
      console.error('❌ Daily lead report cron error:', error);
    }
  });

  console.log('✅ All daily reports cron jobs started');
  console.log('   - Traffic Report: 8:00 AM daily');
  console.log('   - Lead Report: 9:00 AM daily');
}

/**
 * Manual trigger functions for testing
 */
export async function triggerDailyTrafficReport() {
  console.log('📊 Manually triggering daily traffic report...');
  return await enhancedAnalyticsEmailService.sendDailyTrafficReport();
}

export async function triggerDailyLeadReport() {
  console.log('💼 Manually triggering daily lead report...');
  return await leadGenerationReportService.sendDailyLeadReport();
}

