/**
 * UNIFIED DAILY REPORTS CRON SCHEDULER
 * Schedules all daily email reports at appropriate times
 */

import cron from 'node-cron';
import { enhancedAnalyticsEmailService } from '../services/enhancedAnalyticsEmailService.js';
import { leadGenerationReportService } from '../services/leadGenerationReportService.js';
import { comprehensiveDailyReportService } from '../services/comprehensiveDailyReportService.js';

export function startDailyReportsCron() {
  // Daily Traffic & SEO Report at 8:00 AM EST
  const trafficCronSchedule = process.env.TRAFFIC_REPORT_CRON || '0 8 * * *'; // 8 AM daily
  
  console.log('📅 Daily Traffic Report scheduled:', trafficCronSchedule);

  cron.schedule(trafficCronSchedule, async () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 📊 Running daily traffic & SEO report...`);
    try {
      const result = await enhancedAnalyticsEmailService.sendDailyTrafficReport();
      if (result.success) {
        console.log(`[${timestamp}] ✅ Daily traffic report sent successfully`);
      } else {
        console.error(`[${timestamp}] ❌ Failed to send daily traffic report:`, result.error);
        console.error('   Check SMTP configuration and Analytics Hub API');
      }
    } catch (error) {
      console.error(`[${timestamp}] ❌ Daily traffic report cron error:`, error);
      if (error instanceof Error) {
        console.error('   Error details:', error.message);
        console.error('   Stack:', error.stack);
      }
    }
  });

  // Daily Lead Generation Report at 9:00 AM EST (1 hour after traffic report)
  const leadCronSchedule = process.env.LEAD_REPORT_CRON || '0 9 * * *'; // 9 AM daily
  
  console.log('📅 Daily Lead Report scheduled:', leadCronSchedule);

  cron.schedule(leadCronSchedule, async () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 💼 Running daily lead generation report...`);
    try {
      const result = await leadGenerationReportService.sendDailyLeadReport();
      if (result.success) {
        console.log(`[${timestamp}] ✅ Daily lead report sent successfully`);
      } else {
        console.error(`[${timestamp}] ❌ Failed to send daily lead report:`, result.error);
        console.error('   Check SMTP configuration and lead data storage');
      }
    } catch (error) {
      console.error(`[${timestamp}] ❌ Daily lead report cron error:`, error);
      if (error instanceof Error) {
        console.error('   Error details:', error.message);
        console.error('   Stack:', error.stack);
      }
    }
  });

  // Comprehensive Daily Report at 10:00 AM EST (includes everything)
  const comprehensiveCronSchedule = process.env.COMPREHENSIVE_REPORT_CRON || '0 10 * * *'; // 10 AM daily
  
  console.log('📅 Comprehensive Daily Report scheduled:', comprehensiveCronSchedule);

  cron.schedule(comprehensiveCronSchedule, async () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 📊 Running comprehensive daily report (ALL DATA)...`);
    try {
      const result = await comprehensiveDailyReportService.sendDailyReport();
      if (result.success) {
        console.log(`[${timestamp}] ✅ Comprehensive daily report sent successfully`);
      } else {
        console.error(`[${timestamp}] ❌ Failed to send comprehensive daily report:`, result.error);
        console.error('   Check SMTP configuration and data storage');
      }
    } catch (error) {
      console.error(`[${timestamp}] ❌ Comprehensive daily report cron error:`, error);
      if (error instanceof Error) {
        console.error('   Error details:', error.message);
        console.error('   Stack:', error.stack);
      }
    }
  });

  console.log('✅ All daily reports cron jobs started');
  console.log('   - Traffic Report: 8:00 AM daily');
  console.log('   - Lead Report: 9:00 AM daily');
  console.log('   - Comprehensive Report (ALL DATA): 10:00 AM daily');
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

export async function triggerComprehensiveDailyReport() {
  console.log('📊 Manually triggering comprehensive daily report...');
  return await comprehensiveDailyReportService.sendDailyReport();
}

