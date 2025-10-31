/**
 * DAILY ANALYTICS CRON JOB
 * Schedules daily email reports at 8 AM EST
 */

import cron from 'node-cron';
import { analyticsEmailService } from './services/analyticsEmailService.js';

export function startDailyAnalyticsCron() {
  // Run daily at 8:00 AM EST (13:00 UTC during EST, 12:00 UTC during EDT)
  // Adjust timezone as needed: '0 8 * * *' for 8 AM server time
  const cronSchedule = process.env.ANALYTICS_CRON_SCHEDULE || '0 8 * * *'; // 8 AM daily
  
  console.log('📅 Daily analytics cron job scheduled:', cronSchedule);

  cron.schedule(cronSchedule, async () => {
    console.log('📊 Running daily analytics report...');
    try {
      const result = await analyticsEmailService.sendDailyReport();
      if (result.success) {
        console.log('✅ Daily analytics report sent successfully');
      } else {
        console.error('❌ Failed to send daily analytics report:', result.error);
      }
    } catch (error) {
      console.error('❌ Daily analytics cron error:', error);
    }
  });

  // Also allow manual trigger via API endpoint
  console.log('✅ Daily analytics cron job started');
}

