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
  totalSessions: number;
  bounceRate?: number;
  avgSessionDuration?: number;
  avgPagesPerSession?: number;
  topPages: Array<{ path: string; views: number; uniqueVisitors?: number; avgTimeOnPage?: number; bounceRate?: number }>;
  referrers: Array<{ source: string; visitors: number; sessions?: number; bounceRate?: number }>;
  devices: { desktop: number; mobile: number; tablet: number };
  countries: Array<{ country: string; visitors: number; sessions?: number }>;
  browsers?: Array<{ browser: string; count: number; percentage: number }>;
  operatingSystems?: Array<{ os: string; count: number; percentage: number }>;
  entryPages?: Array<{ page: string; entries: number; percentage: number }>;
  exitPages?: Array<{ page: string; exits: number; percentage: number }>;
  hourlyTraffic?: Array<{ hour: number; visitors: number; pageViews: number }>;
  activeVisitors?: number;
  conversionRate?: number;
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
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      // Get authentication token first
      let token = process.env.ANALYTICS_API_KEY;
      if (!token) {
        // Try to get token from simple-login endpoint
        try {
          const loginResponse = await axios.post(`${this.analyticsApiUrl}/simple-login`, {
            email: 'udi.shkolnik@alicesolutionsgroup.com',
            password: process.env.ANALYTICS_ADMIN_PASSWORD || 'test123'
          });
          if (loginResponse.data?.success && loginResponse.data?.token) {
            token = loginResponse.data.token;
          }
        } catch (loginError) {
          console.error('Failed to authenticate with Analytics Hub:', loginError);
        }
      }
      
      // Fetch analytics from Analytics Hub API using correct endpoint
      const response = await axios.get(`${this.analyticsApiUrl}/api/admin/stats/overview`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        },
      });

      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        
        // Fetch additional data in parallel
        const [pagesRes, sourcesRes, devicesRes, locationsRes, trendsRes, realtimeRes] = await Promise.allSettled([
          axios.get(`${this.analyticsApiUrl}/api/admin/analytics/pages`, {
            params: { startDate: startDate.toISOString(), endDate: endDate.toISOString(), limit: 20 },
            headers: { 'Authorization': token ? `Bearer ${token}` : undefined },
          }),
          axios.get(`${this.analyticsApiUrl}/api/admin/analytics/sources`, {
            params: { startDate: startDate.toISOString(), endDate: endDate.toISOString(), limit: 15 },
            headers: { 'Authorization': token ? `Bearer ${token}` : undefined },
          }),
          axios.get(`${this.analyticsApiUrl}/api/admin/analytics/devices`, {
            params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
            headers: { 'Authorization': token ? `Bearer ${token}` : undefined },
          }),
          axios.get(`${this.analyticsApiUrl}/api/admin/analytics/locations`, {
            params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
            headers: { 'Authorization': token ? `Bearer ${token}` : undefined },
          }),
          axios.get(`${this.analyticsApiUrl}/api/admin/stats/trends`, {
            params: { startDate: startDate.toISOString(), endDate: endDate.toISOString(), interval: 'hour' },
            headers: { 'Authorization': token ? `Bearer ${token}` : undefined },
          }),
          axios.get(`${this.analyticsApiUrl}/api/admin/stats/realtime`, {
            headers: { 'Authorization': token ? `Bearer ${token}` : undefined },
          }),
        ]);
        
        // Parse top pages with additional metrics
        const topPages = pagesRes.status === 'fulfilled' && pagesRes.value.data?.success
          ? pagesRes.value.data.data.map((p: any) => ({
              path: p.page_url || p.pagePath || p.url || '',
              views: p.views || p.pageViews || 0,
              uniqueVisitors: p.unique_visitors || p.uniqueVisitors || 0,
              avgTimeOnPage: p.avg_time_on_page || p.avgTimeOnPage || 0,
              bounceRate: p.bounce_rate || p.bounceRate || 0,
            }))
          : [];
        
        // Parse referrers/sources with additional metrics
        const referrers = sourcesRes.status === 'fulfilled' && sourcesRes.value.data?.success
          ? sourcesRes.value.data.data.map((s: any) => ({
              source: s.source_name || s.source || 'Direct',
              visitors: s.visitors || s.count || 0,
              sessions: s.sessions || 0,
              bounceRate: s.bounce_rate || s.bounceRate || 0,
            }))
          : [];
        
        // Parse devices
        const devicesData = devicesRes.status === 'fulfilled' && devicesRes.value.data?.success
          ? devicesRes.value.data.data.reduce((acc: any, d: any) => {
              const type = (d.device_type || d.device || 'unknown').toLowerCase();
              const count = d.visitors || d.count || 0;
              if (type.includes('mobile') || type.includes('phone')) acc.mobile += count;
              else if (type.includes('tablet')) acc.tablet += count;
              else if (type.includes('desktop') || type.includes('pc')) acc.desktop += count;
              return acc;
            }, { desktop: 0, mobile: 0, tablet: 0 })
          : { desktop: 0, mobile: 0, tablet: 0 };
        
        // Parse countries
        const countries = locationsRes.status === 'fulfilled' && locationsRes.value.data?.success
          ? locationsRes.value.data.data.map((l: any) => ({
              country: l.country_name || l.country || 'Unknown',
              visitors: l.visitors || l.count || 0,
              sessions: l.sessions || 0,
            }))
          : [];
        
        // Parse browsers and OS from devices data
        const browsersMap = new Map<string, number>();
        const osMap = new Map<string, number>();
        if (devicesRes.status === 'fulfilled' && devicesRes.value.data?.success) {
          devicesRes.value.data.data.forEach((d: any) => {
            const browser = d.browser || 'Unknown';
            const os = d.os || 'Unknown';
            const count = d.visitors || d.count || 0;
            browsersMap.set(browser, (browsersMap.get(browser) || 0) + count);
            osMap.set(os, (osMap.get(os) || 0) + count);
          });
        }
        const totalDeviceCount = Array.from(browsersMap.values()).reduce((a, b) => a + b, 0);
        const browsers = Array.from(browsersMap.entries())
          .map(([browser, count]) => ({
            browser,
            count,
            percentage: totalDeviceCount > 0 ? (count / totalDeviceCount) * 100 : 0,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        
        const operatingSystems = Array.from(osMap.entries())
          .map(([os, count]) => ({
            os,
            count,
            percentage: totalDeviceCount > 0 ? (count / totalDeviceCount) * 100 : 0,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        
        // Parse hourly traffic trends
        const hourlyTraffic: Array<{ hour: number; visitors: number; pageViews: number }> = [];
        if (trendsRes.status === 'fulfilled' && trendsRes.value.data?.success && trendsRes.value.data.data) {
          trendsRes.value.data.data.forEach((trend: any) => {
            const date = new Date(trend.date || trend.timestamp);
            const hour = date.getHours();
            hourlyTraffic.push({
              hour,
              visitors: trend.visitors || trend.count || 0,
              pageViews: trend.pageViews || 0,
            });
          });
        }
        
        // Get active visitors
        const activeVisitors = realtimeRes.status === 'fulfilled' && realtimeRes.value.data?.success
          ? realtimeRes.value.data.data.activeVisitors || 0
          : 0;
        
        // Note: Conversion rate will be calculated after getting lead analytics
        return {
          date: dateStr,
          totalVisitors: data.totalVisitors || data.uniqueVisitors || 0,
          totalPageViews: data.totalPageViews || data.pageViews || 0,
          uniqueVisitors: data.uniqueVisitors || data.totalVisitors || 0,
          totalSessions: data.totalSessions || 0,
          avgSessionDuration: data.avgSessionDuration || 0,
          avgPagesPerSession: data.avgPagesPerSession || 0,
          bounceRate: data.bounceRate || 0,
          topPages,
          referrers,
          devices: devicesData,
          countries,
          browsers,
          operatingSystems,
          hourlyTraffic,
          activeVisitors,
        };
      }

      return null;
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error.message);
      if (error.response) {
        console.error('API Error:', error.response.status, error.response.data);
      }
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
                
                <div class="stat-card">
                  <div class="stat-label">Total Sessions</div>
                  <div class="stat-value">${summary.totalSessions.toLocaleString()}</div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-label">Avg Session Duration</div>
                  <div class="stat-value">${Math.round(summary.avgSessionDuration || 0)}s</div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-label">Avg Pages/Session</div>
                  <div class="stat-value">${(summary.avgPagesPerSession || 0).toFixed(1)}</div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-label">Bounce Rate</div>
                  <div class="stat-value">${(summary.bounceRate || 0).toFixed(1)}%</div>
                </div>
                
                ${summary.activeVisitors ? `
                <div class="stat-card">
                  <div class="stat-label">Active Visitors Now</div>
                  <div class="stat-value">${summary.activeVisitors}</div>
                </div>
                ` : ''}
                
                ${leadAnalytics.totalLeads > 0 ? `
                <div class="stat-card">
                  <div class="stat-label">Conversion Rate</div>
                  <div class="stat-value">${((leadAnalytics.totalLeads / summary.totalVisitors) * 100).toFixed(2)}%</div>
                </div>
                ` : ''}
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
                    <th>Unique Visitors</th>
                    ${summary.topPages[0]?.avgTimeOnPage ? '<th>Avg Time</th>' : ''}
                    ${summary.topPages[0]?.bounceRate !== undefined ? '<th>Bounce Rate</th>' : ''}
                  </tr>
                </thead>
                <tbody>
                  ${summary.topPages.slice(0, 15).map(page => `
                    <tr>
                      <td><a href="${this.siteUrl}${page.path}" style="color: #667eea; text-decoration: none;">${page.path}</a></td>
                      <td>${page.views.toLocaleString()}</td>
                      <td>${(page.uniqueVisitors || 0).toLocaleString()}</td>
                      ${page.avgTimeOnPage ? `<td>${Math.round(page.avgTimeOnPage)}s</td>` : ''}
                      ${page.bounceRate !== undefined ? `<td>${page.bounceRate.toFixed(1)}%</td>` : ''}
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
                    ${summary.referrers[0]?.sessions ? '<th>Sessions</th>' : ''}
                    ${summary.referrers[0]?.bounceRate !== undefined ? '<th>Bounce Rate</th>' : ''}
                  </tr>
                </thead>
                <tbody>
                  ${summary.referrers.map(ref => `
                    <tr>
                      <td>${ref.source || 'Direct'}</td>
                      <td>${ref.visitors.toLocaleString()}</td>
                      ${ref.sessions ? `<td>${ref.sessions.toLocaleString()}</td>` : ''}
                      ${ref.bounceRate !== undefined ? `<td>${ref.bounceRate.toFixed(1)}%</td>` : ''}
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
                    ${summary.countries[0]?.sessions ? '<th>Sessions</th>' : ''}
                  </tr>
                </thead>
                <tbody>
                  ${summary.countries.slice(0, 15).map(country => `
                    <tr>
                      <td>${country.country}</td>
                      <td>${country.visitors.toLocaleString()}</td>
                      ${country.sessions ? `<td>${country.sessions.toLocaleString()}</td>` : ''}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${summary.browsers && summary.browsers.length > 0 ? `
            <div class="section">
              <h2 class="section-title">🌐 Browsers</h2>
              <table>
                <thead>
                  <tr>
                    <th>Browser</th>
                    <th>Users</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  ${summary.browsers.map(browser => `
                    <tr>
                      <td><strong>${browser.browser}</strong></td>
                      <td>${browser.count.toLocaleString()}</td>
                      <td>${browser.percentage.toFixed(1)}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${summary.operatingSystems && summary.operatingSystems.length > 0 ? `
            <div class="section">
              <h2 class="section-title">💻 Operating Systems</h2>
              <table>
                <thead>
                  <tr>
                    <th>OS</th>
                    <th>Users</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  ${summary.operatingSystems.map(os => `
                    <tr>
                      <td><strong>${os.os}</strong></td>
                      <td>${os.count.toLocaleString()}</td>
                      <td>${os.percentage.toFixed(1)}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${summary.hourlyTraffic && summary.hourlyTraffic.length > 0 ? `
            <div class="section">
              <h2 class="section-title">🕐 Hourly Traffic Pattern</h2>
              <table>
                <thead>
                  <tr>
                    <th>Hour</th>
                    <th>Visitors</th>
                    <th>Page Views</th>
                  </tr>
                </thead>
                <tbody>
                  ${summary.hourlyTraffic.map(hour => `
                    <tr>
                      <td><strong>${hour.hour}:00</strong></td>
                      <td>${hour.visitors.toLocaleString()}</td>
                      <td>${hour.pageViews.toLocaleString()}</td>
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

