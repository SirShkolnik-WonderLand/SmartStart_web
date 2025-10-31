/**
 * LEAD GENERATION REPORT SERVICE
 * Generates and sends daily lead generation reports
 */

import { emailService } from './emailService.js';
import { leadTrackingService, LeadAnalytics } from './leadTrackingService.js';

class LeadGenerationReportService {
  private siteUrl: string;

  constructor() {
    this.siteUrl = process.env.SITE_URL || 'https://alicesolutionsgroup.com';
  }

  generateLeadReportHtml(analytics: LeadAnalytics, date: Date): string {
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const leadsTrend = analytics.leadsChange >= 0 ? '📈' : '📉';
    const leadsColor = analytics.leadsChange >= 0 ? '#10b981' : '#ef4444';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { font-size: 28px; margin-bottom: 10px; }
          .header p { opacity: 0.9; font-size: 14px; }
          .content { padding: 30px; }
          .stat-card { background: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 15px 0; border-radius: 4px; }
          .stat-value { font-size: 36px; font-weight: bold; color: #111827; margin: 10px 0; }
          .stat-label { color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          .stat-change { font-size: 14px; margin-top: 5px; }
          .stat-change.positive { color: #10b981; }
          .stat-change.negative { color: #ef4444; }
          .section { margin: 30px 0; }
          .section-title { font-size: 20px; font-weight: bold; color: #111827; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background-color: #f9fafb; font-weight: 600; color: #374151; font-size: 14px; }
          td { color: #6b7280; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
          .badge-success { background-color: #d1fae5; color: #065f46; }
          .badge-info { background-color: #dbeafe; color: #1e40af; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
          .footer a { color: #10b981; text-decoration: none; }
          .highlight-box { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 20px; border-radius: 8px; margin: 20px 0; }
          .highlight-box h3 { color: #1e40af; margin-bottom: 10px; }
          .highlight-box p { color: #1e3a8a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💼 Daily Lead Generation Report</h1>
            <p>${formattedDate}</p>
          </div>
          
          <div class="content">
            <div class="stat-card">
              <div class="stat-label">Total Leads Today</div>
              <div class="stat-value">${analytics.totalLeads}</div>
              ${analytics.totalLeadsPreviousDay > 0 ? `
              <div class="stat-change ${analytics.leadsChange >= 0 ? 'positive' : 'negative'}">
                ${leadsTrend} ${analytics.leadsChange >= 0 ? '+' : ''}${analytics.leadsChange} (${analytics.leadsChangePercent >= 0 ? '+' : ''}${analytics.leadsChangePercent.toFixed(1)}%) vs yesterday
              </div>
              ` : ''}
            </div>

            ${analytics.leadsByService.length > 0 ? `
            <div class="section">
              <h2 class="section-title">🎯 Leads by Service</h2>
              <table>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Leads</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  ${analytics.leadsByService.map(item => `
                    <tr>
                      <td><strong>${item.service}</strong></td>
                      <td>${item.count}</td>
                      <td>${item.percent.toFixed(1)}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${analytics.leadsBySource.length > 0 ? `
            <div class="section">
              <h2 class="section-title">📈 Leads by Source</h2>
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Leads</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  ${analytics.leadsBySource.map(item => `
                    <tr>
                      <td><strong>${item.source}</strong></td>
                      <td>${item.count}</td>
                      <td>${item.percent.toFixed(1)}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${analytics.leadsByBudget.length > 0 ? `
            <div class="section">
              <h2 class="section-title">💰 Budget Distribution</h2>
              <table>
                <thead>
                  <tr>
                    <th>Budget Range</th>
                    <th>Leads</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  ${analytics.leadsByBudget.map(item => `
                    <tr>
                      <td>${item.budget}</td>
                      <td>${item.count}</td>
                      <td>${item.percent.toFixed(1)}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${analytics.leadsByTimeline.length > 0 ? `
            <div class="section">
              <h2 class="section-title">⏰ Timeline Distribution</h2>
              <table>
                <thead>
                  <tr>
                    <th>Timeline</th>
                    <th>Leads</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  ${analytics.leadsByTimeline.map(item => `
                    <tr>
                      <td>${item.timeline}</td>
                      <td>${item.count}</td>
                      <td>${item.percent.toFixed(1)}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${analytics.topConvertingPages.length > 0 ? `
            <div class="section">
              <h2 class="section-title">🏆 Top Converting Pages</h2>
              <table>
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Leads</th>
                  </tr>
                </thead>
                <tbody>
                  ${analytics.topConvertingPages.map(item => `
                    <tr>
                      <td><a href="${this.siteUrl}${item.page}" style="color: #10b981; text-decoration: none;">${item.page}</a></td>
                      <td>${item.leads}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${analytics.mailingListSignups > 0 ? `
            <div class="highlight-box">
              <h3>📬 Mailing List Signups</h3>
              <p><strong>${analytics.mailingListSignups}</strong> new subscribers (${analytics.mailingListSignupRate.toFixed(1)}% of leads)</p>
            </div>
            ` : ''}

            ${analytics.newLeads.length > 0 ? `
            <div class="section">
              <h2 class="section-title">✨ Latest Leads</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Service</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  ${analytics.newLeads.map(lead => `
                    <tr>
                      <td><strong>${lead.name}</strong></td>
                      <td>${lead.email}</td>
                      <td>${lead.service || 'General'}</td>
                      <td>${new Date(lead.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>This is an automated daily lead generation report from AliceSolutions Group.</p>
            <p><a href="${this.siteUrl}">Visit Website</a> | <a href="${this.siteUrl}/contact">Contact Form</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendDailyLeadReport(date: Date = new Date()): Promise<{ success: boolean; error?: string }> {
    try {
      const analytics = await leadTrackingService.getLeadAnalytics(date);

      if (analytics.totalLeads === 0 && analytics.totalLeadsPreviousDay === 0) {
        // Skip report if no leads today or yesterday
        return { success: true };
      }

      const html = this.generateLeadReportHtml(analytics, date);
      const result = await emailService.sendEmail({
        to: 'udi.shkolnik@alicesolutionsgroup.com',
        subject: `💼 Daily Lead Report - ${analytics.totalLeads} Lead${analytics.totalLeads !== 1 ? 's' : ''} - ${date.toISOString().split('T')[0]}`,
        html,
      });

      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Failed to send daily lead report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const leadGenerationReportService = new LeadGenerationReportService();

