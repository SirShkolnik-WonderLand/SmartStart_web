/**
 * ENHANCED ANALYTICS EMAIL SERVICE
 * Sends comprehensive daily SEO and website analytics reports via email
 * Includes comparisons with previous day and week
 */

import { emailService } from './emailService.js';
import { analyticsStorage } from './analyticsStorage.js';
import { leadTrackingService } from './leadTrackingService.js';
import axios from 'axios';

interface AnalyticsSummary {
  date: string;
  totalVisitors: number;
  totalPageViews: number;
  uniqueVisitors: number;
  bounceRate?: number;
  avgSessionDuration?: number;
  topPages: Array<{ path: string; views: number }>;
  referrers: Array<{ source: string; visitors: number }>;
  devices: { desktop: number; mobile: number; tablet: number };
  countries: Array<{ country: string; visitors: number }>;
}

interface ComparisonData {
  previousDay: AnalyticsSummary | null;
  previousWeek: AnalyticsSummary | null;
  change: {
    visitors: number;
    visitorsPercent: number;
    pageViews: number;
    pageViewsPercent: number;
  };
}

class EnhancedAnalyticsEmailService {
  private analyticsApiUrl: string;
  private siteUrl: string;

  constructor() {
    this.analyticsApiUrl = process.env.VITE_ANALYTICS_API_URL || process.env.ANALYTICS_API_URL || 'https://analytics-hub-server.onrender.com';
    this.siteUrl = process.env.SITE_URL || 'https://alicesolutionsgroup.com';
  }

  async getDailyAnalytics(date: Date = new Date()): Promise<AnalyticsSummary | null> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // Fetch analytics from Analytics Hub API
      const response = await axios.get(`${this.analyticsApiUrl}/api/admin/reports/daily`, {
        params: { date: dateStr },
        headers: {
          'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY || ''}`,
        },
      });

      if (response.data?.success) {
        return {
          date: dateStr,
          ...response.data.data,
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      return null;
    }
  }

  async getComparisonData(currentSummary: AnalyticsSummary, date: Date): Promise<ComparisonData> {
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    
    const previousWeek = new Date(date);
    previousWeek.setDate(previousWeek.getDate() - 7);

    const previousDaySummary = await this.getDailyAnalytics(previousDay);
    const previousWeekSummary = await this.getDailyAnalytics(previousWeek);

    const visitorsChange = previousDaySummary 
      ? currentSummary.totalVisitors - previousDaySummary.totalVisitors
      : 0;
    const visitorsChangePercent = previousDaySummary && previousDaySummary.totalVisitors > 0
      ? (visitorsChange / previousDaySummary.totalVisitors) * 100
      : 0;

    const pageViewsChange = previousDaySummary
      ? currentSummary.totalPageViews - previousDaySummary.totalPageViews
      : 0;
    const pageViewsChangePercent = previousDaySummary && previousDaySummary.totalPageViews > 0
      ? (pageViewsChange / previousDaySummary.totalPageViews) * 100
      : 0;

    return {
      previousDay: previousDaySummary,
      previousWeek: previousWeekSummary,
      change: {
        visitors: visitorsChange,
        visitorsPercent: visitorsChangePercent,
        pageViews: pageViewsChange,
        pageViewsPercent: pageViewsChangePercent,
      },
    };
  }

  generateTrafficReportHtml(summary: AnalyticsSummary, comparison: ComparisonData, leadAnalytics: any): string {
    const date = new Date(summary.date);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const visitorsTrend = comparison.change.visitors >= 0 ? '📈' : '📉';
    const visitorsColor = comparison.change.visitors >= 0 ? '#10b981' : '#ef4444';
    const pageViewsTrend = comparison.change.pageViews >= 0 ? '📈' : '📉';
    const pageViewsColor = comparison.change.pageViews >= 0 ? '#10b981' : '#ef4444';

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
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { font-size: 28px; margin-bottom: 10px; }
          .header p { opacity: 0.9; font-size: 14px; }
          .content { padding: 30px; }
          .stat-card { background: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 15px 0; border-radius: 4px; }
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
          .badge-danger { background-color: #fee2e2; color: #991b1b; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
          .footer a { color: #667eea; text-decoration: none; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
          .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin: 20px 0; }
          .highlight-box h3 { color: #92400e; margin-bottom: 10px; }
          .highlight-box p { color: #78350f; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Daily Website Analytics Report</h1>
            <p>${formattedDate}</p>
          </div>
          
          <div class="content">
            ${leadAnalytics.totalLeads > 0 ? `
            <div class="highlight-box">
              <h3>🎯 ${leadAnalytics.totalLeads} New Lead${leadAnalytics.totalLeads > 1 ? 's' : ''} Today!</h3>
              <p>${leadAnalytics.leadsChange >= 0 ? '+' : ''}${leadAnalytics.leadsChange} vs yesterday (${leadAnalytics.leadsChangePercent >= 0 ? '+' : ''}${leadAnalytics.leadsChangePercent.toFixed(1)}%)</p>
            </div>
            ` : ''}

            <div class="section">
              <h2 class="section-title">📈 Traffic Overview</h2>
              <div class="grid">
                <div class="stat-card">
                  <div class="stat-label">Total Visitors</div>
                  <div class="stat-value">${summary.totalVisitors.toLocaleString()}</div>
                  ${comparison.previousDay ? `
                  <div class="stat-change ${comparison.change.visitors >= 0 ? 'positive' : 'negative'}">
                    ${visitorsTrend} ${comparison.change.visitors >= 0 ? '+' : ''}${comparison.change.visitors} (${comparison.change.visitorsPercent >= 0 ? '+' : ''}${comparison.change.visitorsPercent.toFixed(1)}%) vs yesterday
                  </div>
                  ` : ''}
                </div>
                
                <div class="stat-card">
                  <div class="stat-label">Page Views</div>
                  <div class="stat-value">${summary.totalPageViews.toLocaleString()}</div>
                  ${comparison.previousDay ? `
                  <div class="stat-change ${comparison.change.pageViews >= 0 ? 'positive' : 'negative'}">
                    ${pageViewsTrend} ${comparison.change.pageViews >= 0 ? '+' : ''}${comparison.change.pageViews} (${comparison.change.pageViewsPercent >= 0 ? '+' : ''}${comparison.change.pageViewsPercent.toFixed(1)}%) vs yesterday
                  </div>
                  ` : ''}
                </div>
                
                <div class="stat-card">
                  <div class="stat-label">Unique Visitors</div>
                  <div class="stat-value">${summary.uniqueVisitors.toLocaleString()}</div>
                </div>
              </div>
            </div>

            ${summary.topPages.length > 0 ? `
            <div class="section">
              <h2 class="section-title">🔥 Top Pages</h2>
              <table>
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Views</th>
                  </tr>
                </thead>
                <tbody>
                  ${summary.topPages.slice(0, 10).map(page => `
                    <tr>
                      <td><a href="${this.siteUrl}${page.path}" style="color: #667eea; text-decoration: none;">${page.path}</a></td>
                      <td>${page.views.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${summary.referrers.length > 0 ? `
            <div class="section">
              <h2 class="section-title">🌍 Traffic Sources</h2>
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Visitors</th>
                  </tr>
                </thead>
                <tbody>
                  ${summary.referrers.map(ref => `
                    <tr>
                      <td>${ref.source || 'Direct'}</td>
                      <td>${ref.visitors.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            <div class="section">
              <h2 class="section-title">📱 Devices</h2>
              <table>
                <tbody>
                  <tr>
                    <td><strong>Desktop</strong></td>
                    <td>${summary.devices.desktop.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td><strong>Mobile</strong></td>
                    <td>${summary.devices.mobile.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td><strong>Tablet</strong></td>
                    <td>${summary.devices.tablet.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            ${summary.countries.length > 0 ? `
            <div class="section">
              <h2 class="section-title">🌎 Top Countries</h2>
              <table>
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Visitors</th>
                  </tr>
                </thead>
                <tbody>
                  ${summary.countries.slice(0, 10).map(country => `
                    <tr>
                      <td>${country.country}</td>
                      <td>${country.visitors.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>This is an automated daily report from AliceSolutions Group Analytics Hub.</p>
            <p><a href="${this.siteUrl}">Visit Website</a> | <a href="${this.siteUrl}/admin/analytics">View Dashboard</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendDailyTrafficReport(date: Date = new Date()): Promise<{ success: boolean; error?: string }> {
    try {
      const summary = await this.getDailyAnalytics(date);
      
      if (!summary) {
        console.log('No analytics data available for date:', date.toISOString().split('T')[0]);
        return { success: false, error: 'No analytics data available' };
      }

      const comparison = await this.getComparisonData(summary, date);
      const leadAnalytics = await leadTrackingService.getLeadAnalytics(date);

      // Store summary for future comparisons
      await analyticsStorage.storeDailySummary({
        date: summary.date,
        totalVisitors: summary.totalVisitors,
        totalPageViews: summary.totalPageViews,
        uniqueVisitors: summary.uniqueVisitors,
        totalLeads: leadAnalytics.totalLeads,
        conversionRate: leadAnalytics.conversionRate,
        topPages: summary.topPages,
        referrers: summary.referrers,
        devices: summary.devices,
        countries: summary.countries,
        leadsByService: leadAnalytics.leadsByService.reduce((acc, item) => {
          acc[item.service] = item.count;
          return acc;
        }, {} as Record<string, number>),
        leadsBySource: leadAnalytics.leadsBySource.reduce((acc, item) => {
          acc[item.source] = item.count;
          return acc;
        }, {} as Record<string, number>),
      });

      const html = this.generateTrafficReportHtml(summary, comparison, leadAnalytics);
      const result = await emailService.sendEmail({
        to: 'udi.shkolnik@alicesolutionsgroup.com',
        subject: `📊 Daily Analytics Report - ${summary.date}`,
        html,
      });

      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Failed to send daily traffic report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const enhancedAnalyticsEmailService = new EnhancedAnalyticsEmailService();

