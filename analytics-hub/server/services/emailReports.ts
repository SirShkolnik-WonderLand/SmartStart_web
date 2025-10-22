/**
 * EMAIL REPORTS SERVICE
 * Generate and send scheduled analytics reports via email
 */

import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { format } from 'date-fns';
import path from 'path';

interface ReportConfig {
  email: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  includeCharts?: boolean;
  includeTrends?: boolean;
  includeGoals?: boolean;
}

interface ReportData {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  overview: {
    totalVisitors: number;
    totalSessions: number;
    totalPageViews: number;
    totalConversions: number;
    conversionRate: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  topPages: Array<{
    url: string;
    pageViews: number;
    visitors: number;
  }>;
  topSources: Array<{
    source: string;
    sessions: number;
  }>;
  devices: Array<{
    deviceType: string;
    count: number;
    percentage: number;
  }>;
}

export class EmailReportsService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Generate PDF report
   */
  async generatePDF(data: ReportData): Promise<string> {
    const outputPath = path.join(process.cwd(), 'reports', `analytics-${Date.now()}.pdf`);
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const stream = createWriteStream(outputPath);

      doc.pipe(stream);

      // Title
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('Analytics Report', { align: 'center' });

      doc.moveDown();

      // Date range
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Period: ${format(new Date(data.dateRange.startDate), 'MMM dd, yyyy')} - ${format(new Date(data.dateRange.endDate), 'MMM dd, yyyy')}`, 
               { align: 'center' });

      doc.moveDown(2);

      // Overview section
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Overview', { underline: true });

      doc.moveDown();
      doc.fontSize(12)
         .font('Helvetica');

      const overviewData = [
        ['Total Visitors', data.overview.totalVisitors.toLocaleString()],
        ['Total Sessions', data.overview.totalSessions.toLocaleString()],
        ['Page Views', data.overview.totalPageViews.toLocaleString()],
        ['Conversions', data.overview.totalConversions.toLocaleString()],
        ['Conversion Rate', `${data.overview.conversionRate.toFixed(2)}%`],
        ['Bounce Rate', `${data.overview.bounceRate.toFixed(2)}%`],
        ['Avg. Session Duration', `${Math.floor(data.overview.avgSessionDuration / 60)}m ${data.overview.avgSessionDuration % 60}s`],
      ];

      overviewData.forEach(([label, value]) => {
        doc.text(`${label}: `, { continued: true })
           .font('Helvetica-Bold')
           .text(value);
        doc.font('Helvetica');
      });

      doc.moveDown(2);

      // Top Pages
      if (data.topPages.length > 0) {
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('Top Pages', { underline: true });

        doc.moveDown();
        doc.fontSize(10)
           .font('Helvetica');

        data.topPages.slice(0, 10).forEach((page, index) => {
          doc.text(`${index + 1}. ${page.url}`, { continued: true })
             .font('Helvetica-Bold')
             .text(` - ${page.pageViews} views (${page.visitors} visitors)`);
          doc.font('Helvetica');
        });

        doc.moveDown(2);
      }

      // Top Sources
      if (data.topSources.length > 0) {
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('Top Traffic Sources', { underline: true });

        doc.moveDown();
        doc.fontSize(10)
           .font('Helvetica');

        data.topSources.slice(0, 10).forEach((source, index) => {
          doc.text(`${index + 1}. ${source.source}`, { continued: true })
             .font('Helvetica-Bold')
             .text(` - ${source.sessions} sessions`);
          doc.font('Helvetica');
        });

        doc.moveDown(2);
      }

      // Device Breakdown
      if (data.devices.length > 0) {
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('Device Breakdown', { underline: true });

        doc.moveDown();
        doc.fontSize(10)
           .font('Helvetica');

        data.devices.forEach((device) => {
          doc.text(`${device.deviceType}: `, { continued: true })
             .font('Helvetica-Bold')
             .text(`${device.count} (${device.percentage.toFixed(1)}%)`);
          doc.font('Helvetica');
        });
      }

      // Footer
      doc.moveDown(3);
      doc.fontSize(8)
         .text('Generated by Analytics Hub - AliceSolutions Group', { align: 'center' });
      doc.text(`Report generated on ${format(new Date(), 'PPpp')}`, { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  /**
   * Send email report
   */
  async sendReport(config: ReportConfig, data: ReportData): Promise<boolean> {
    try {
      // Generate PDF
      const pdfPath = await this.generatePDF(data);

      // Prepare email
      const subject = this.getEmailSubject(config.frequency, data.dateRange);
      const html = this.getEmailHTML(data);

      // Send email
      const info = await this.transporter.sendMail({
        from: `"Analytics Hub" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: config.email,
        subject,
        html,
        attachments: [
          {
            filename: `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
            path: pdfPath,
          },
        ],
      });

      console.log('✅ Email report sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email report:', error);
      return false;
    }
  }

  /**
   * Get email subject
   */
  private getEmailSubject(frequency: string, dateRange: { startDate: string; endDate: string }): string {
    const period = format(new Date(dateRange.endDate), 'MMM dd, yyyy');
    return `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Analytics Report - ${period}`;
  }

  /**
   * Get email HTML
   */
  private getEmailHTML(data: ReportData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4a90e2 0%, #1de0c1 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
          .header h1 { margin: 0; font-size: 28px; }
          .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0; }
          .stat-card { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 32px; font-weight: bold; color: #4a90e2; margin: 10px 0; }
          .stat-label { font-size: 14px; color: #666; }
          .section { margin: 30px 0; }
          .section-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #4a90e2; padding-bottom: 5px; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Analytics Report</h1>
            <p>${format(new Date(data.dateRange.startDate), 'MMM dd')} - ${format(new Date(data.dateRange.endDate), 'MMM dd, yyyy')}</p>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-label">Total Visitors</div>
              <div class="stat-value">${data.overview.totalVisitors.toLocaleString()}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Page Views</div>
              <div class="stat-value">${data.overview.totalPageViews.toLocaleString()}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Conversions</div>
              <div class="stat-value">${data.overview.totalConversions}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Conversion Rate</div>
              <div class="stat-value">${data.overview.conversionRate.toFixed(1)}%</div>
            </div>
          </div>

          ${data.topPages.length > 0 ? `
          <div class="section">
            <div class="section-title">🔝 Top Pages</div>
            <ol>
              ${data.topPages.slice(0, 5).map(page => 
                `<li><strong>${page.url}</strong> - ${page.pageViews} views</li>`
              ).join('')}
            </ol>
          </div>
          ` : ''}

          ${data.topSources.length > 0 ? `
          <div class="section">
            <div class="section-title">🌐 Top Traffic Sources</div>
            <ol>
              ${data.topSources.slice(0, 5).map(source => 
                `<li><strong>${source.source}</strong> - ${source.sessions} sessions</li>`
              ).join('')}
            </ol>
          </div>
          ` : ''}

          <div class="footer">
            <p>This report was automatically generated by <strong>Analytics Hub</strong></p>
            <p>AliceSolutions Group | www.alicesolutionsgroup.com</p>
            <p>Generated on ${format(new Date(), 'PPpp')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Schedule periodic reports
   */
  async scheduleReports(configs: ReportConfig[]): Promise<void> {
    // TODO: Implement cron-based scheduling
    console.log('📧 Email reports scheduling configured for:', configs.length, 'recipients');
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email transporter is ready');
      return true;
    } catch (error) {
      console.error('❌ Email transporter failed:', error);
      return false;
    }
  }
}

export const emailReportsService = new EmailReportsService();
