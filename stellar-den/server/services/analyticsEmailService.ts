/**
 * DAILY ANALYTICS EMAIL SERVICE
 * Sends daily SEO and website analytics reports via email
 */

import { emailService } from './emailService.js';
import axios from 'axios';

interface AnalyticsSummary {
  date: string;
  totalVisitors: number;
  totalPageViews: number;
  uniqueVisitors: number;
  topPages: Array<{ path: string; views: number }>;
  referrers: Array<{ source: string; visitors: number }>;
  devices: { desktop: number; mobile: number; tablet: number };
  countries: Array<{ country: string; visitors: number }>;
}

class AnalyticsEmailService {
  private analyticsApiUrl: string;

  constructor() {
    this.analyticsApiUrl = process.env.VITE_ANALYTICS_API_URL || process.env.ANALYTICS_API_URL || 'http://localhost:4000';
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
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      return null;
    }
  }

  generateEmailHtml(summary: AnalyticsSummary): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #2f5aae; border-bottom: 3px solid #2f5aae; padding-bottom: 10px; }
          h2 { color: #2f5aae; margin-top: 30px; }
          .stat { background: #f4f5f7; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .stat-label { font-weight: bold; color: #666; }
          .stat-value { font-size: 24px; color: #2f5aae; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #2f5aae; color: white; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📊 Daily Website Analytics Report</h1>
          <p><strong>Date:</strong> ${summary.date}</p>

          <div class="stat">
            <div class="stat-label">Total Visitors</div>
            <div class="stat-value">${summary.totalVisitors.toLocaleString()}</div>
          </div>

          <div class="stat">
            <div class="stat-label">Total Page Views</div>
            <div class="stat-value">${summary.totalPageViews.toLocaleString()}</div>
          </div>

          <div class="stat">
            <div class="stat-label">Unique Visitors</div>
            <div class="stat-value">${summary.uniqueVisitors.toLocaleString()}</div>
          </div>

          <h2>🔥 Top Pages</h2>
          <table>
            <thead>
              <tr>
                <th>Page</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              ${summary.topPages.map(page => `
                <tr>
                  <td>${page.path}</td>
                  <td>${page.views.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>🌍 Traffic Sources</h2>
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

          <h2>📱 Devices</h2>
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

          <h2>🌎 Top Countries</h2>
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

          <div class="footer">
            <p>This is an automated daily report from AliceSolutions Group Analytics Hub.</p>
            <p>View full analytics: <a href="${process.env.SITE_URL || 'https://alicesolutionsgroup.com'}/admin/analytics">Dashboard</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendDailyReport(date: Date = new Date()): Promise<{ success: boolean; error?: string }> {
    try {
      const summary = await this.getDailyAnalytics(date);

      if (!summary) {
        // Fallback: Create summary from available data
        const fallbackSummary: AnalyticsSummary = {
          date: date.toISOString().split('T')[0],
          totalVisitors: 0,
          totalPageViews: 0,
          uniqueVisitors: 0,
          topPages: [],
          referrers: [],
          devices: { desktop: 0, mobile: 0, tablet: 0 },
          countries: [],
        };

        const html = this.generateEmailHtml(fallbackSummary);
        const result = await emailService.sendEmail({
          to: 'udi.shkolnik@alicesolutionsgroup.com',
          subject: `Daily Analytics Report - ${date.toISOString().split('T')[0]}`,
          html: html.replace('0', 'No data available'),
        });

        return { success: result.success, error: result.error };
      }

      const html = this.generateEmailHtml(summary);
      const result = await emailService.sendEmail({
        to: 'udi.shkolnik@alicesolutionsgroup.com',
        subject: `📊 Daily Analytics Report - ${summary.date}`,
        html,
      });

      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Failed to send daily analytics report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const analyticsEmailService = new AnalyticsEmailService();

