/**
 * SEND 7-DAY SUMMARY REPORT
 * Generates and sends a comprehensive 7-day analytics and lead report
 */

import { enhancedAnalyticsEmailService } from '../server/services/enhancedAnalyticsEmailService.js';
import { leadGenerationReportService } from '../server/services/leadGenerationReportService.js';
import { emailService } from '../server/services/emailService.js';
import { leadTrackingService } from '../server/services/leadTrackingService.js';
import { analyticsStorage } from '../server/services/analyticsStorage.js';

interface DaySummary {
  date: string;
  visitors: number;
  pageViews: number;
  leads: number;
}

export async function generate7DayReport() {
  console.log('📊 Generating 7-Day Summary Report...\n');

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const daySummaries: DaySummary[] = [];
  let totalVisitors = 0;
  let totalPageViews = 0;
  let totalLeads = 0;

  // Collect data for each of the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dateStr = date.toISOString().split('T')[0];
    
    // Get analytics for this day
    const analytics = await enhancedAnalyticsEmailService.getDailyAnalytics(date);
    
    // Get leads for this day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const dayLeads = analyticsStorage.getLeads(startOfDay, endOfDay);
    
    const visitors = analytics?.totalVisitors || 0;
    const pageViews = analytics?.totalPageViews || 0;
    const leads = dayLeads.length;
    
    daySummaries.push({
      date: dateStr,
      visitors,
      pageViews,
      leads
    });
    
    totalVisitors += visitors;
    totalPageViews += pageViews;
    totalLeads += leads;
  }

  // Get leads for the entire 7-day period
  const startOfPeriod = new Date(sevenDaysAgo);
  startOfPeriod.setHours(0, 0, 0, 0);
  const endOfPeriod = new Date(today);
  endOfPeriod.setHours(23, 59, 59, 999);
  
  const allLeads = analyticsStorage.getLeads(startOfPeriod, endOfPeriod);
  
  // Aggregate lead analytics for the entire period
  const leadAnalytics = aggregateLeadAnalytics(allLeads);

  // Generate HTML report
  const reportHtml = generateReportHtml(daySummaries, totalVisitors, totalPageViews, totalLeads, leadAnalytics);

  // Send email
  const result = await emailService.sendEmail({
    to: 'udi.shkolnik@alicesolutionsgroup.com',
    subject: `📊 7-Day Summary Report - ${sevenDaysAgo.toLocaleDateString()} to ${today.toLocaleDateString()}`,
    html: reportHtml
  });

  if (result.success) {
    console.log('✅ 7-Day Summary Report sent successfully!');
    console.log(`   Total Visitors: ${totalVisitors.toLocaleString()}`);
    console.log(`   Total Page Views: ${totalPageViews.toLocaleString()}`);
    console.log(`   Total Leads: ${totalLeads}`);
  } else {
    console.error('❌ Failed to send report:', result.error);
  }

  return result;
}

function aggregateLeadAnalytics(leads: any[]): any {
  const totalLeads = leads.length;
  
  // Aggregate by service
  const serviceCounts: Record<string, number> = {};
  leads.forEach(lead => {
    const service = lead.service || 'Not specified';
    serviceCounts[service] = (serviceCounts[service] || 0) + 1;
  });
  const leadsByService = Object.entries(serviceCounts)
    .map(([service, count]) => ({
      service,
      count,
      percent: (count / totalLeads) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  // Aggregate by source
  const sourceCounts: Record<string, number> = {};
  leads.forEach(lead => {
    let source = lead.referrer || 'Direct';
    if (source.includes('google.com') || source.includes('google.ca')) source = 'Google';
    else if (source.includes('bing.com')) source = 'Bing';
    else if (source.includes('linkedin.com')) source = 'LinkedIn';
    else if (source.includes('twitter.com') || source.includes('x.com')) source = 'Twitter';
    else if (source.includes('facebook.com')) source = 'Facebook';
    else if (source.includes('alicesolutionsgroup.com')) source = 'Internal';
    else if (source.includes('Learn More:')) source = source; // Keep Learn More context
    else if (source !== 'Direct') source = 'Referral';
    
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });
  const leadsBySource = Object.entries(sourceCounts)
    .map(([source, count]) => ({
      source,
      count,
      percent: (count / totalLeads) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalLeads,
    leadsByService,
    leadsBySource,
    newLeads: leads.slice(-10).reverse(), // Last 10 leads, most recent first
  };
}

function generateReportHtml(
  daySummaries: DaySummary[],
  totalVisitors: number,
  totalPageViews: number,
  totalLeads: number,
  leadAnalytics: any
): string {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .content { padding: 30px; }
        .stat-card { background: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 15px 0; border-radius: 4px; }
        .stat-value { font-size: 36px; font-weight: bold; color: #111827; margin: 10px 0; }
        .stat-label { color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        .section { margin: 30px 0; }
        .section-title { font-size: 20px; font-weight: bold; color: #111827; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f9fafb; font-weight: 600; color: #374151; font-size: 14px; }
        td { color: #6b7280; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
        .footer a { color: #667eea; text-decoration: none; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .day-row { background: #f9fafb; }
        .day-row:hover { background: #f3f4f6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 7-Day Summary Report</h1>
          <p>${sevenDaysAgo.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        
        <div class="content">
          <!-- Summary Stats -->
          <div class="section">
            <h2 class="section-title">📈 Overall Summary</h2>
            <div class="grid">
              <div class="stat-card">
                <div class="stat-label">Total Visitors</div>
                <div class="stat-value">${totalVisitors.toLocaleString()}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Page Views</div>
                <div class="stat-value">${totalPageViews.toLocaleString()}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Leads</div>
                <div class="stat-value">${totalLeads}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Avg Daily Visitors</div>
                <div class="stat-value">${Math.round(totalVisitors / 7).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <!-- Daily Breakdown -->
          <div class="section">
            <h2 class="section-title">📅 Daily Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Visitors</th>
                  <th>Page Views</th>
                  <th>Leads</th>
                </tr>
              </thead>
              <tbody>
                ${daySummaries.map(day => `
                  <tr class="day-row">
                    <td><strong>${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong></td>
                    <td>${day.visitors.toLocaleString()}</td>
                    <td>${day.pageViews.toLocaleString()}</td>
                    <td>${day.leads}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          ${leadAnalytics.totalLeads > 0 ? `
          <!-- Lead Breakdown -->
          <div class="section">
            <h2 class="section-title">💼 Lead Breakdown (Last 7 Days)</h2>
            
            ${leadAnalytics.leadsByService.length > 0 ? `
            <h3 style="font-size: 16px; margin: 15px 0 10px 0; color: #374151;">Leads by Service</h3>
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Leads</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${leadAnalytics.leadsByService.slice(0, 10).map((item: any) => `
                  <tr>
                    <td><strong>${item.service}</strong></td>
                    <td>${item.count}</td>
                    <td>${item.percent.toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ` : ''}

            ${leadAnalytics.leadsBySource.length > 0 ? `
            <h3 style="font-size: 16px; margin: 20px 0 10px 0; color: #374151;">Leads by Source</h3>
            <table>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Leads</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${leadAnalytics.leadsBySource.slice(0, 10).map((item: any) => `
                  <tr>
                    <td><strong>${item.source}</strong></td>
                    <td>${item.count}</td>
                    <td>${item.percent.toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ` : ''}
          </div>
          ` : ''}

          ${leadAnalytics.newLeads && leadAnalytics.newLeads.length > 0 ? `
          <!-- Recent Leads -->
          <div class="section">
            <h2 class="section-title">📋 Recent Leads (Last 10)</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Service</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                ${leadAnalytics.newLeads.slice(0, 10).map((lead: any) => `
                  <tr>
                    <td>${new Date(lead.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td><strong>${lead.name}</strong></td>
                    <td>${lead.email}</td>
                    <td>${lead.service || 'General'}</td>
                    <td>${lead.referrer || 'Direct'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>This is a 7-day summary report from AliceSolutions Group Analytics Hub.</p>
          <p><a href="https://alicesolutionsgroup.com">Visit Website</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Run the report
generate7DayReport()
  .then(() => {
    console.log('\n✅ Report generation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error generating report:', error);
    process.exit(1);
  });

