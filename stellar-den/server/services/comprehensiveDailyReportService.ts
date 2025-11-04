/**
 * COMPREHENSIVE DAILY REPORT SERVICE
 * Generates a complete daily report with ALL website data:
 * - Traffic & Analytics (visitors, pageviews, sources, devices, locations)
 * - Leads (contact forms, Learn More buttons, all sources)
 * - ISO Studio usage (assessments started/completed)
 * - User engagement (button clicks, page interactions)
 * - Conversion metrics
 */

import { emailService } from './emailService.js';
import { analyticsStorage } from './analyticsStorage.js';
import { leadTrackingService } from './leadTrackingService.js';
import { enhancedAnalyticsEmailService } from './enhancedAnalyticsEmailService.js';

interface ComprehensiveReport {
  date: string;
  traffic: {
    totalVisitors: number;
    totalPageViews: number;
    uniqueVisitors: number;
    topPages: Array<{ path: string; views: number }>;
    topSources: Array<{ source: string; visitors: number }>;
    devices: { desktop: number; mobile: number; tablet: number };
    countries: Array<{ country: string; visitors: number }>;
  };
  leads: {
    totalLeads: number;
    leadsByService: Array<{ service: string; count: number }>;
    leadsBySource: Array<{ source: string; count: number }>;
    leadsByPage: Array<{ page: string; count: number }>;
    recentLeads: Array<{ name: string; email: string; service: string; timestamp: string }>;
  };
  isoStudio: {
    assessmentsStarted: number;
    assessmentsCompleted: number;
    usersAuthenticated: number;
  };
  engagement: {
    contactFormsSubmitted: number;
    learnMoreClicks: number;
    consultationRequests: number;
  };
}

class ComprehensiveDailyReportService {
  /**
   * Generate comprehensive daily report
   * If showAllData is true, includes ALL leads regardless of date
   * DEFAULT: showAllData is now true - shows ALL leads, not just today
   */
  async generateDailyReport(date: Date = new Date(), showAllData: boolean = true): Promise<ComprehensiveReport> {
    const dateStr = date.toISOString().split('T')[0];
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // DEFAULT: Get ALL leads from the last 90 days (or all if showAllData)
    // This ensures you see ALL leads, not just today's
    if (showAllData) {
      // Go back 90 days to catch all recent leads
      startOfDay.setDate(startOfDay.getDate() - 90);
      endOfDay.setDate(endOfDay.getDate() + 1); // Include today
      console.log(`[ComprehensiveReport] 📊 Showing ALL data from last 90 days (all leads)`);
    }

    // Get traffic data
    let trafficData = {
      totalVisitors: 0,
      totalPageViews: 0,
      uniqueVisitors: 0,
      topPages: [] as Array<{ path: string; views: number }>,
      topSources: [] as Array<{ source: string; visitors: number }>,
      devices: { desktop: 0, mobile: 0, tablet: 0 },
      countries: [] as Array<{ country: string; visitors: number }>,
    };

    try {
      const analytics = await enhancedAnalyticsEmailService.getDailyAnalytics(date);
      if (analytics) {
        trafficData = {
          totalVisitors: analytics.totalVisitors,
          totalPageViews: analytics.totalPageViews,
          uniqueVisitors: analytics.uniqueVisitors,
          topPages: analytics.topPages || [],
          topSources: analytics.referrers || [],
          devices: analytics.devices || { desktop: 0, mobile: 0, tablet: 0 },
          countries: analytics.countries || [],
        };
      }
    } catch (error) {
      console.error('Failed to fetch traffic data:', error);
    }

    // Get lead data - DEFAULT: Get ALL leads, not just today's
    // Add 12 hours buffer on each side to account for timezone differences
    const startOfDayWithBuffer = new Date(startOfDay);
    startOfDayWithBuffer.setHours(startOfDayWithBuffer.getHours() - 12);
    const endOfDayWithBuffer = new Date(endOfDay);
    endOfDayWithBuffer.setHours(endOfDayWithBuffer.getHours() + 12);
    
    console.log(`[ComprehensiveReport] Fetching leads for report date: ${dateStr}`);
    console.log(`[ComprehensiveReport] Date range: ${startOfDayWithBuffer.toISOString()} to ${endOfDayWithBuffer.toISOString()}`);
    
    // ALWAYS check ALL leads first to see what exists
    const allLeads = analyticsStorage.getAllLeads();
    console.log(`[ComprehensiveReport] 📊 Total leads in storage: ${allLeads.length}`);
    
    if (allLeads.length > 0) {
      const sortedLeads = [...allLeads].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      console.log(`[ComprehensiveReport] Oldest lead: ${sortedLeads[0].timestamp} (${sortedLeads[0].name})`);
      console.log(`[ComprehensiveReport] Newest lead: ${sortedLeads[sortedLeads.length - 1].timestamp} (${sortedLeads[sortedLeads.length - 1].name})`);
    }
    
    // Get leads from the date range (now includes last 90 days by default)
    const leads = analyticsStorage.getLeads(startOfDayWithBuffer, endOfDayWithBuffer);
    
    // If no leads in date range but we have leads, use ALL leads instead
    let finalLeads = leads;
    if (leads.length === 0 && allLeads.length > 0) {
      console.log(`[ComprehensiveReport] ⚠️  No leads in date range, using ALL ${allLeads.length} leads instead`);
      finalLeads = allLeads;
    }
    
    console.log(`[ComprehensiveReport] ✅ Using ${finalLeads.length} leads in report`);
    
    const serviceCounts: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {};
    const pageCounts: Record<string, number> = {};
    
    leads.forEach(lead => {
      // By service
      const service = lead.service || 'General Inquiry';
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;
      
      // By source
      let source = lead.referrer || 'Direct';
      if (source.includes('Learn More:')) {
        source = source; // Keep full context
      } else if (source.includes('google')) source = 'Google';
      else if (source.includes('linkedin')) source = 'LinkedIn';
      else if (source.includes('alicesolutionsgroup.com')) source = 'Internal';
      else if (source !== 'Direct') source = 'Referral';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      
      // By page
      try {
        const url = new URL(lead.pageUrl);
        const page = url.pathname || '/';
        pageCounts[page] = (pageCounts[page] || 0) + 1;
      } catch {
        pageCounts[lead.pageUrl] = (pageCounts[lead.pageUrl] || 0) + 1;
      }
    });

    const leadsByService = Object.entries(serviceCounts)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count);

    const leadsBySource = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    const leadsByPage = Object.entries(pageCounts)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count);

    // Show ALL recent leads (up to 50), sorted by date (newest first)
    const recentLeads = finalLeads
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50)
      .map(lead => ({
      name: lead.name,
      email: lead.email,
      service: lead.service || 'General',
      timestamp: lead.timestamp,
    }));

    // ISO Studio usage (would need to track this separately)
    // For now, we'll estimate from lead data if service includes ISO
    const isoStudio = {
      assessmentsStarted: finalLeads.filter(l => l.service?.includes('ISO') || l.message?.includes('ISO')).length,
      assessmentsCompleted: 0, // Would need separate tracking
      usersAuthenticated: 0, // Would need separate tracking
    };

    // Engagement metrics
    const learnMoreClicks = finalLeads.filter(l => l.referrer?.includes('Learn More:')).length;
    const contactFormsSubmitted = finalLeads.length;
    const consultationRequests = finalLeads.filter(l => 
      l.service?.toLowerCase().includes('consultation') || 
      l.message?.toLowerCase().includes('consultation')
    ).length;

    return {
      date: dateStr,
      traffic: trafficData,
      leads: {
        totalLeads: finalLeads.length,
        leadsByService,
        leadsBySource,
        leadsByPage,
        recentLeads,
      },
      isoStudio,
      engagement: {
        contactFormsSubmitted,
        learnMoreClicks,
        consultationRequests,
      },
    };
  }

  /**
   * Generate HTML report
   */
  generateReportHtml(report: ComprehensiveReport): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
          .container { max-width: 1000px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { font-size: 32px; margin-bottom: 10px; }
          .header p { opacity: 0.9; font-size: 16px; }
          .content { padding: 30px; }
          .section { margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #667eea; }
          .section-title { font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 15px; }
          .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
          .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .stat-value { font-size: 36px; font-weight: bold; color: #667eea; margin: 10px 0; }
          .stat-label { color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; background: white; border-radius: 8px; overflow: hidden; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background-color: #f9fafb; font-weight: 600; color: #374151; }
          tr:hover { background-color: #f9fafb; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Comprehensive Daily Report</h1>
            <p>${new Date(report.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div class="content">
            <!-- Traffic Overview -->
            <div class="section">
              <h2 class="section-title">🌐 Traffic Overview</h2>
              <div class="stat-grid">
                <div class="stat-card">
                  <div class="stat-label">Total Visitors</div>
                  <div class="stat-value">${report.traffic.totalVisitors.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Page Views</div>
                  <div class="stat-value">${report.traffic.totalPageViews.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Unique Visitors</div>
                  <div class="stat-value">${report.traffic.uniqueVisitors.toLocaleString()}</div>
                </div>
              </div>
              
              ${report.traffic.topPages.length > 0 ? `
              <h3 style="margin-top: 20px; color: #374151;">Top Pages</h3>
              <table>
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Views</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.traffic.topPages.slice(0, 10).map(page => `
                    <tr>
                      <td>${page.path}</td>
                      <td><strong>${page.views.toLocaleString()}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ` : ''}
              
              ${report.traffic.topSources.length > 0 ? `
              <h3 style="margin-top: 20px; color: #374151;">Top Sources</h3>
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Visitors</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.traffic.topSources.slice(0, 10).map(source => `
                    <tr>
                      <td>${source.source}</td>
                      <td><strong>${source.visitors.toLocaleString()}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ` : ''}
            </div>

            <!-- Leads Overview -->
            <div class="section">
              <h2 class="section-title">💼 Leads Overview</h2>
              <div class="stat-grid">
                <div class="stat-card">
                  <div class="stat-label">Total Leads</div>
                  <div class="stat-value">${report.leads.totalLeads}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Contact Forms</div>
                  <div class="stat-value">${report.engagement.contactFormsSubmitted}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Learn More Clicks</div>
                  <div class="stat-value">${report.engagement.learnMoreClicks}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Consultation Requests</div>
                  <div class="stat-value">${report.engagement.consultationRequests}</div>
                </div>
              </div>
              
              ${report.leads.leadsByService.length > 0 ? `
              <h3 style="margin-top: 20px; color: #374151;">Leads by Service</h3>
              <table>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.leads.leadsByService.map(item => `
                    <tr>
                      <td>${item.service}</td>
                      <td><strong>${item.count}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ` : ''}
              
              ${report.leads.leadsBySource.length > 0 ? `
              <h3 style="margin-top: 20px; color: #374151;">Leads by Source</h3>
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.leads.leadsBySource.map(item => `
                    <tr>
                      <td>${item.source}</td>
                      <td><strong>${item.count}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ` : ''}
              
              ${report.leads.recentLeads.length > 0 ? `
              <h3 style="margin-top: 20px; color: #374151;">All Leads (${report.leads.recentLeads.length} shown, ${report.leads.totalLeads} total)</h3>
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
                  ${report.leads.recentLeads.map(lead => `
                    <tr>
                      <td>${new Date(lead.timestamp).toLocaleDateString()} ${new Date(lead.timestamp).toLocaleTimeString()}</td>
                      <td><strong>${lead.name}</strong></td>
                      <td>${lead.email}</td>
                      <td>${lead.service}</td>
                      <td>${lead.source || 'Direct'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${report.leads.totalLeads > report.leads.recentLeads.length ? `
              <p style="margin-top: 10px; color: #6b7280; font-size: 14px;">
                Showing ${report.leads.recentLeads.length} most recent leads. Total: ${report.leads.totalLeads} leads.
              </p>
              ` : ''}
              ` : ''}
            </div>

            <!-- ISO Studio -->
            ${report.isoStudio.assessmentsStarted > 0 ? `
            <div class="section">
              <h2 class="section-title">🔒 ISO Studio Activity</h2>
              <div class="stat-grid">
                <div class="stat-card">
                  <div class="stat-label">Assessments Started</div>
                  <div class="stat-value">${report.isoStudio.assessmentsStarted}</div>
                </div>
              </div>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>This is an automated comprehensive daily report from AliceSolutions Group.</p>
            <p><a href="https://alicesolutionsgroup.com">Visit Website</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send comprehensive daily report
   * DEFAULT: showAllData is true - shows ALL leads (last 90 days), not just today
   */
  async sendDailyReport(date: Date = new Date(), showAllData: boolean = true): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📊 Generating comprehensive daily report for ${date.toISOString().split('T')[0]}...`);
      console.log(`📊 Including ALL leads from last 90 days (not just today)`);
      
      const report = await this.generateDailyReport(date, showAllData);
      
      // Add diagnostic info to report if showing zeros
      if (report.leads.totalLeads === 0) {
        const allLeads = analyticsStorage.getAllLeads();
        if (allLeads.length > 0) {
          console.log(`⚠️  Report shows 0 leads but ${allLeads.length} total leads exist in storage!`);
          console.log(`   This might indicate a date filtering issue.`);
        }
      }
      
      const html = this.generateReportHtml(report);
      
      const result = await emailService.sendEmail({
        to: 'udi.shkolnik@alicesolutionsgroup.com',
        subject: `📊 Comprehensive Daily Report - ${report.date} (${report.leads.totalLeads} Leads)`,
        html,
      });

      if (result.success) {
        console.log(`✅ Comprehensive daily report sent successfully for ${report.date}`);
      } else {
        console.error(`❌ Failed to send comprehensive daily report:`, result.error);
      }

      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Failed to send comprehensive daily report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const comprehensiveDailyReportService = new ComprehensiveDailyReportService();

