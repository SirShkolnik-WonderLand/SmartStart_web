/**
 * ZOHO INTEGRATION SERVICE
 * Connect to Zoho APIs for email, calendar, and CRM functionality
 */

import axios, { AxiosInstance } from 'axios';

interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
}

interface ZohoToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface ZohoContact {
  First_Name: string;
  Last_Name: string;
  Email: string;
  Phone?: string;
  Company?: string;
  Lead_Source: string;
}

interface ZohoEmail {
  to: string;
  subject: string;
  content: string;
  from?: string;
}

export class ZohoService {
  private config: ZohoConfig;
  private api: AxiosInstance;
  private token: ZohoToken | null = null;

  constructor() {
    this.config = {
      clientId: process.env.ZOHO_CLIENT_ID || '1000.RL5AUX1S0GDMJ72X7WIH0JDA6OQFLV',
      clientSecret: process.env.ZOHO_CLIENT_SECRET || '4397551227c473f3cc6ea0f398c12f3ff01f90b80e',
      redirectUri: 'https://alicesolutionsgroup.com/callback',
      scope: 'ZohoCRM.modules.ALL,ZohoMail.messages.CREATE,ZohoCalendar.events.CREATE'
    };

    this.api = axios.create({
      baseURL: 'https://www.zohoapis.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope,
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.zoho.com/oauth/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<ZohoToken> {
    try {
      const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', {
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code: code
      });

      this.token = response.data;
      return this.token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw new Error('Failed to authenticate with Zoho');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<ZohoToken> {
    if (!this.token?.refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', {
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.token.refresh_token
      });

      this.token = { ...this.token, ...response.data };
      return this.token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw new Error('Failed to refresh Zoho token');
    }
  }

  /**
   * Create contact in Zoho CRM
   */
  async createContact(contact: ZohoContact): Promise<any> {
    await this.ensureValidToken();

    try {
      const response = await this.api.post('/crm/v2/Contacts', {
        data: [contact]
      }, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${this.token!.access_token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to create contact:', error);
      throw new Error('Failed to create contact in Zoho CRM');
    }
  }

  /**
   * Send email via Zoho Mail
   */
  async sendEmail(email: ZohoEmail): Promise<any> {
    await this.ensureValidToken();

    try {
      const response = await this.api.post('/mail/v1/messages', {
        toAddress: email.to,
        subject: email.subject,
        content: email.content,
        fromAddress: email.from || 'noreply@alicesolutionsgroup.com'
      }, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${this.token!.access_token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email via Zoho Mail');
    }
  }

  /**
   * Create calendar event
   */
  async createEvent(event: any): Promise<any> {
    await this.ensureValidToken();

    try {
      const response = await this.api.post('/calendar/v1/events', event, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${this.token!.access_token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Ensure we have a valid access token
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.token) {
      throw new Error('No Zoho token available. Please authenticate first.');
    }

    // Check if token is expired (with 5 minute buffer)
    const now = Date.now();
    const expiresAt = this.token.expires_in * 1000;
    
    if (now >= expiresAt - 300000) { // 5 minutes before expiry
      await this.refreshToken();
    }
  }

  /**
   * Handle contact form submission
   */
  async handleContactForm(formData: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    service?: string;
    message: string;
  }): Promise<{ success: boolean; contactId?: string; emailSent?: boolean }> {
    try {
      // Create contact in CRM
      const contactData: ZohoContact = {
        First_Name: formData.name.split(' ')[0] || formData.name,
        Last_Name: formData.name.split(' ').slice(1).join(' ') || '',
        Email: formData.email,
        Phone: formData.phone,
        Company: formData.company,
        Lead_Source: 'Website Contact Form'
      };

      const contactResult = await this.createContact(contactData);
      const contactId = contactResult.data?.[0]?.details?.id;

      // Send notification email
      const emailContent = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Company:</strong> ${formData.company || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
        <p><strong>Service:</strong> ${formData.service || 'General inquiry'}</p>
        <p><strong>Message:</strong></p>
        <p>${formData.message}</p>
        <hr>
        <p><em>Submitted via alicesolutionsgroup.com contact form</em></p>
      `;

      const emailResult = await this.sendEmail({
        to: 'udi.shkolnik@alicesolutionsgroup.com',
        subject: `New Contact: ${formData.name} - ${formData.service || 'General Inquiry'}`,
        content: emailContent
      });

      // Send auto-reply to customer
      const autoReplyContent = `
        <h2>Thank you for contacting AliceSolutions Group!</h2>
        <p>Hi ${formData.name},</p>
        <p>Thank you for reaching out to us. We've received your message and will get back to you within 24-48 hours.</p>
        <p><strong>Your inquiry:</strong></p>
        <p>${formData.message}</p>
        <hr>
        <p>Best regards,<br>
        Udi Shkolnik<br>
        AliceSolutions Group<br>
        <a href="mailto:udi.shkolnik@alicesolutionsgroup.com">udi.shkolnik@alicesolutionsgroup.com</a></p>
      `;

      await this.sendEmail({
        to: formData.email,
        subject: 'Thank you for contacting AliceSolutions Group',
        content: autoReplyContent
      });

      return {
        success: true,
        contactId,
        emailSent: true
      };

    } catch (error) {
      console.error('Failed to handle contact form:', error);
      return {
        success: false
      };
    }
  }
}

// Export singleton instance
export const zohoService = new ZohoService();
