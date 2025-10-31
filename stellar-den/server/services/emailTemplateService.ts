/**
 * EMAIL TEMPLATE SERVICE
 * Comprehensive, SEO-optimized, context-aware email templates
 */

import { emailService } from './emailService.js';

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  service?: string;
  message: string;
  // Enhanced fields
  mailingList?: boolean;
  pageUrl?: string;
  referrer?: string;
  budget?: string;
  timeline?: string;
  companySize?: string;
  industry?: string;
  howDidYouHear?: string;
}

interface EmailTemplate {
  admin: string;
  client: string;
  subject: {
    admin: string;
    client: string;
  };
}

class EmailTemplateService {
  /**
   * Get service-specific template based on service type
   */
  private getServiceTemplate(service: string): EmailTemplate {
    const baseUrl = process.env.SITE_URL || 'https://alicesolutionsgroup.com';
    
    const templates: Record<string, EmailTemplate> = {
      'Cybersecurity & Compliance': {
        admin: this.getCybersecurityAdminTemplate(),
        client: this.getCybersecurityClientTemplate(),
        subject: {
          admin: '🔐 New Cybersecurity & Compliance Inquiry',
          client: 'Thank You - Cybersecurity & Compliance Consultation Request'
        }
      },
      'Automation & AI': {
        admin: this.getAutomationAdminTemplate(),
        client: this.getAutomationClientTemplate(),
        subject: {
          admin: '⚡ New Automation & AI Project Inquiry',
          client: 'Thank You - Automation & AI Consultation Request'
        }
      },
      'Advisory & Audits': {
        admin: this.getAdvisoryAdminTemplate(),
        client: this.getAdvisoryClientTemplate(),
        subject: {
          admin: '📊 New Advisory & Audit Inquiry',
          client: 'Thank You - Advisory & Audit Consultation Request'
        }
      },
      'SmartStart Ecosystem': {
        admin: this.getSmartStartAdminTemplate(),
        client: this.getSmartStartClientTemplate(),
        subject: {
          admin: '🚀 New SmartStart Ecosystem Inquiry',
          client: 'Welcome to SmartStart Ecosystem - Next Steps'
        }
      },
      'default': {
        admin: this.getDefaultAdminTemplate(),
        client: this.getDefaultClientTemplate(),
        subject: {
          admin: '📧 New Contact Inquiry',
          client: 'Thank You - We Received Your Message'
        }
      }
    };

    return templates[service] || templates['default'];
  }

  /**
   * Generate admin notification email
   */
  async sendAdminNotification(data: ContactFormData): Promise<{ success: boolean }> {
    const template = this.getServiceTemplate(data.service || '');
    const html = this.populateAdminTemplate(template.admin, data);
    
    return await emailService.sendEmail({
      to: 'udi.shkolnik@alicesolutionsgroup.com',
      subject: template.subject.admin + ` - ${data.name}`,
      html
    });
  }

  /**
   * Generate client auto-reply email
   */
  async sendClientAutoReply(data: ContactFormData): Promise<{ success: boolean }> {
    const template = this.getServiceTemplate(data.service || '');
    const html = this.populateClientTemplate(template.client, data);
    
    return await emailService.sendEmail({
      to: data.email,
      subject: template.subject.client,
      html
    });
  }

  /**
   * Populate admin template with data
   */
  private populateAdminTemplate(template: string, data: ContactFormData): string {
    return template
      .replace(/\{\{name\}\}/g, data.name || 'Not provided')
      .replace(/\{\{email\}\}/g, data.email || 'Not provided')
      .replace(/\{\{company\}\}/g, data.company || 'Not provided')
      .replace(/\{\{phone\}\}/g, data.phone || 'Not provided')
      .replace(/\{\{service\}\}/g, data.service || 'General inquiry')
      .replace(/\{\{message\}\}/g, data.message || 'No message provided')
      .replace(/\{\{pageUrl\}\}/g, data.pageUrl || 'Unknown')
      .replace(/\{\{referrer\}\}/g, data.referrer || 'Direct')
      .replace(/\{\{budget\}\}/g, data.budget || 'Not specified')
      .replace(/\{\{timeline\}\}/g, data.timeline || 'Not specified')
      .replace(/\{\{companySize\}\}/g, data.companySize || 'Not specified')
      .replace(/\{\{industry\}\}/g, data.industry || 'Not specified')
      .replace(/\{\{howDidYouHear\}\}/g, data.howDidYouHear || 'Not specified')
      .replace(/\{\{mailingList\}\}/g, data.mailingList ? 'Yes - Subscribed' : 'No')
      .replace(/\{\{timestamp\}\}/g, new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto' }));
  }

  /**
   * Populate client template with data
   */
  private populateClientTemplate(template: string, data: ContactFormData): string {
    return template
      .replace(/\{\{name\}\}/g, data.name || 'there')
      .replace(/\{\{service\}\}/g, data.service || 'your inquiry')
      .replace(/\{\{message\}\}/g, data.message || 'your message');
  }

  // Template generators for each service type
  private getCybersecurityAdminTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Cybersecurity & Compliance Inquiry</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #2f5aae 0%, #1e3a8a 100%); padding: 30px; border-radius: 10px 10px 0 0; color: white; text-align: center;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 700;">🔐 New Cybersecurity Inquiry</h1>
    <p style="margin: 10px 0 0; opacity: 0.9;">ISO 27001 • SOC 2 • HIPAA • PHIPA</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: #f0f9ff; border-left: 4px solid #2f5aae; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
      <h2 style="margin: 0 0 10px; color: #2f5aae; font-size: 20px;">Contact Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 5px 0; font-weight: 600; color: #666; width: 150px;">Name:</td><td style="padding: 5px 0; color: #333;">{{name}}</td></tr>
        <tr><td style="padding: 5px 0; font-weight: 600; color: #666;">Email:</td><td style="padding: 5px 0;"><a href="mailto:{{email}}" style="color: #2f5aae; text-decoration: none;">{{email}}</a></td></tr>
        <tr><td style="padding: 5px 0; font-weight: 600; color: #666;">Company:</td><td style="padding: 5px 0; color: #333;">{{company}}</td></tr>
        <tr><td style="padding: 5px 0; font-weight: 600; color: #666;">Phone:</td><td style="padding: 5px 0; color: #333;">{{phone}}</td></tr>
        <tr><td style="padding: 5px 0; font-weight: 600; color: #666;">Industry:</td><td style="padding: 5px 0; color: #333;">{{industry}}</td></tr>
        <tr><td style="padding: 5px 0; font-weight: 600; color: #666;">Company Size:</td><td style="padding: 5px 0; color: #333;">{{companySize}}</td></tr>
      </table>
    </div>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
      <h2 style="margin: 0 0 10px; color: #d97706; font-size: 20px;">Project Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 5px 0; font-weight: 600; color: #666; width: 150px;">Service:</td><td style="padding: 5px 0; color: #333;"><strong>{{service}}</strong></td></tr>
        <tr><td style="padding: 5px 0; font-weight: 600; color: #666;">Budget:</td><td style="padding: 5px 0; color: #333;">{{budget}}</td></tr>
        <tr><td style="padding: 5px 0; font-weight: 600; color: #666;">Timeline:</td><td style="padding: 5px 0; color: #333;">{{timeline}}</td></tr>
      </table>
    </div>

    <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
      <h2 style="margin: 0 0 10px; color: #333; font-size: 20px;">Message</h2>
      <p style="margin: 0; color: #666; white-space: pre-wrap;">{{message}}</p>
    </div>

    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
      <h2 style="margin: 0 0 10px; color: #059669; font-size: 20px;">Lead Source</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 5px 0; font-weight: 600; color: #666; width: 150px;">Page:</td><td style="padding: 5px 0; color: #333;">{{pageUrl}}</td></tr>
        <tr><td style="padding: 5px 0; font-weight: 600; color: #666;">Referrer:</td><td style="padding: 5px 0; color: #333;">{{referrer}}</td></tr>
        <tr><td style="padding: 5px 0; font-weight: 600; color: #666;">How they heard:</td><td style="padding: 5px 0; color: #333;">{{howDidYouHear}}</td></tr>
        <tr><td style="padding: 5px 0; font-weight: 600; color: #666;">Mailing List:</td><td style="padding: 5px 0; color: #333;">{{mailingList}}</td></tr>
      </table>
    </div>

    <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
      <p style="margin: 0; color: #666; font-size: 14px;">Submitted: {{timestamp}}</p>
      <p style="margin: 10px 0 0; color: #666; font-size: 14px;">via <a href="https://alicesolutionsgroup.com" style="color: #2f5aae; text-decoration: none;">alicesolutionsgroup.com</a></p>
    </div>

    <div style="background: #2f5aae; color: white; padding: 15px; margin-top: 20px; border-radius: 4px; text-align: center;">
      <p style="margin: 0; font-size: 14px;"><strong>Action Required:</strong> Review inquiry and respond within 24-48 hours</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getCybersecurityClientTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You - Cybersecurity Consultation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #2f5aae 0%, #1e3a8a 100%); padding: 40px; border-radius: 10px 10px 0 0; color: white; text-align: center;">
    <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🔐 Thank You, {{name}}!</h1>
    <p style="margin: 15px 0 0; opacity: 0.9; font-size: 16px;">Your Cybersecurity & Compliance Consultation Request</p>
  </div>
  
  <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi {{name}},</p>
    
    <p style="font-size: 16px; color: #666; margin-bottom: 20px;">Thank you for reaching out to AliceSolutions Group regarding <strong>{{service}}</strong>. We've received your inquiry and appreciate your interest in securing your organization's future.</p>

    <div style="background: #f0f9ff; border-left: 4px solid #2f5aae; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <h2 style="margin: 0 0 15px; color: #2f5aae; font-size: 20px;">🔒 What Happens Next?</h2>
      <ul style="margin: 0; padding-left: 20px; color: #666;">
        <li style="margin-bottom: 10px;">Our cybersecurity experts will review your inquiry within <strong>24-48 hours</strong></li>
        <li style="margin-bottom: 10px;">We'll assess your specific needs for ISO 27001, SOC 2, HIPAA, or PHIPA compliance</li>
        <li style="margin-bottom: 10px;">You'll receive a personalized response with next steps and recommendations</li>
        <li style="margin-bottom: 10px;">If needed, we'll schedule a complimentary consultation call</li>
      </ul>
    </div>

    <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <h2 style="margin: 0 0 15px; color: #333; font-size: 20px;">📋 Your Inquiry</h2>
      <p style="margin: 0; color: #666; white-space: pre-wrap; font-style: italic;">{{message}}</p>
    </div>

    <div style="background: linear-gradient(135deg, #2f5aae 0%, #1e3a8a 100%); padding: 25px; margin: 30px 0; border-radius: 8px; text-align: center;">
      <h2 style="margin: 0 0 15px; color: white; font-size: 22px;">🎯 Why Choose AliceSolutions Group?</h2>
      <div style="color: white; text-align: left; max-width: 500px; margin: 0 auto;">
        <p style="margin: 10px 0;">✅ <strong>CISSP & CISM Certified</strong> - 15+ years of cybersecurity expertise</p>
        <p style="margin: 10px 0;">✅ <strong>ISO 27001 Lead Auditor</strong> - Proven track record with 100+ projects</p>
        <p style="margin: 10px 0;">✅ <strong>Ontario-Focused</strong> - Deep understanding of PHIPA/PIPEDA compliance</p>
        <p style="margin: 10px 0;">✅ <strong>Results-Driven</strong> - From startups to enterprises, we deliver</p>
      </div>
    </div>

    <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 30px;">
      <h2 style="margin: 0 0 15px; color: #333; font-size: 20px;">📚 While You Wait</h2>
      <p style="color: #666; margin-bottom: 15px;">Explore our resources to learn more about cybersecurity:</p>
      <ul style="margin: 0; padding-left: 20px; color: #666;">
        <li style="margin-bottom: 8px;"><a href="https://alicesolutionsgroup.com/services" style="color: #2f5aae; text-decoration: none;">View Our Services</a></li>
        <li style="margin-bottom: 8px;"><a href="https://alicesolutionsgroup.com/iso-studio" style="color: #2f5aae; text-decoration: none;">Try ISO Studio - Free Security Assessment</a></li>
        <li style="margin-bottom: 8px;"><a href="https://alicesolutionsgroup.com/resources" style="color: #2f5aae; text-decoration: none;">Browse Resources & Guides</a></li>
      </ul>
    </div>

    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0; color: #059669; font-weight: 600;">⏱️ Response Time: We'll get back to you within 24-48 hours</p>
    </div>

    <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb;">
      <p style="margin: 0 0 10px; color: #666; font-size: 16px;">Best regards,</p>
      <p style="margin: 0; color: #2f5aae; font-size: 18px; font-weight: 700;">Udi Shkolnik</p>
      <p style="margin: 5px 0; color: #666; font-size: 14px;">Founder & CISO</p>
      <p style="margin: 5px 0; color: #666; font-size: 14px;">AliceSolutions Group</p>
      <p style="margin: 15px 0 0;">
        <a href="mailto:udi.shkolnik@alicesolutionsgroup.com" style="color: #2f5aae; text-decoration: none;">udi.shkolnik@alicesolutionsgroup.com</a>
      </p>
      <p style="margin: 15px 0 0;">
        <a href="https://alicesolutionsgroup.com" style="color: #2f5aae; text-decoration: none; font-weight: 600;">alicesolutionsgroup.com</a>
      </p>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #999; font-size: 12px;">
        This email was sent to {{email}} because you submitted a contact form on alicesolutionsgroup.com<br>
        <a href="#" style="color: #999; text-decoration: underline;">Unsubscribe</a> | <a href="https://alicesolutionsgroup.com/privacy" style="color: #999; text-decoration: underline;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Additional template methods for other services...
  private getAutomationAdminTemplate(): string {
    return this.getCybersecurityAdminTemplate().replace('🔐 New Cybersecurity Inquiry', '⚡ New Automation & AI Inquiry');
  }

  private getAutomationClientTemplate(): string {
    return this.getCybersecurityClientTemplate().replace('Cybersecurity & Compliance', 'Automation & AI').replace('🔐', '⚡');
  }

  private getAdvisoryAdminTemplate(): string {
    return this.getCybersecurityAdminTemplate().replace('🔐 New Cybersecurity Inquiry', '📊 New Advisory & Audit Inquiry');
  }

  private getAdvisoryClientTemplate(): string {
    return this.getCybersecurityClientTemplate().replace('Cybersecurity & Compliance', 'Advisory & Audits').replace('🔐', '📊');
  }

  private getSmartStartAdminTemplate(): string {
    return this.getCybersecurityAdminTemplate().replace('🔐 New Cybersecurity Inquiry', '🚀 New SmartStart Ecosystem Inquiry');
  }

  private getSmartStartClientTemplate(): string {
    return this.getCybersecurityClientTemplate().replace('Cybersecurity & Compliance', 'SmartStart Ecosystem').replace('🔐', '🚀');
  }

  private getDefaultAdminTemplate(): string {
    return this.getCybersecurityAdminTemplate().replace('🔐 New Cybersecurity Inquiry', '📧 New Contact Inquiry');
  }

  private getDefaultClientTemplate(): string {
    return this.getCybersecurityClientTemplate().replace('Cybersecurity & Compliance', 'your inquiry').replace('🔐', '📧');
  }
}

export const emailTemplateService = new EmailTemplateService();

