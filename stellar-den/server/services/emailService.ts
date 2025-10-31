/**
 * EMAIL SERVICE - SMTP Fallback
 * Uses Zoho Mail SMTP for reliable email delivery
 */

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private createTransporter() {
    if (this.transporter) return this.transporter;

    // Zoho Mail SMTP settings (from your screenshot: smtp.zohocloud.ca)
    // Port 465 uses SSL, Port 587 uses TLS
    const smtpPort = parseInt(process.env.SMTP_PORT || '465');
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.zohocloud.ca',
      port: smtpPort,
      secure: smtpPort === 465, // SSL for 465, TLS for 587
      auth: {
        user: process.env.SMTP_USER || process.env.SMTP_EMAIL || 'support@alicesolutionsgroup.com',
        pass: process.env.SMTP_PASSWORD || process.env.SMTP_APP_PASSWORD, // App password from Zoho Mail
      },
    };

    this.transporter = nodemailer.createTransport(smtpConfig);
    return this.transporter;
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const transporter = this.createTransporter();
      
      const mailOptions = {
        from: options.from || `"AliceSolutions Group" <${process.env.SMTP_USER || 'support@alicesolutionsgroup.com'}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      console.log(`📧 Attempting to send email to: ${options.to}`);
      console.log(`📧 SMTP Config: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('❌ SMTP email error:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          code: (error as any).code,
          command: (error as any).command,
          response: (error as any).response,
        });
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendContactNotification(formData: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    service?: string;
    message: string;
  }): Promise<{ success: boolean }> {
    const adminEmailHtml = `
      <h2>New Website Contact</h2>
      <p><strong>Name:</strong> ${formData.name}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Company:</strong> ${formData.company || 'Not provided'}</p>
      <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
      <p><strong>Service:</strong> ${formData.service || 'General inquiry'}</p>
      <p><strong>Message:</strong></p>
      <p>${formData.message}</p>
      <hr />
      <p><em>Submitted via alicesolutionsgroup.com</em></p>
    `;

    const result = await this.sendEmail({
      to: 'udi.shkolnik@alicesolutionsgroup.com',
      subject: `New Contact: ${formData.name}${formData.service ? ' - ' + formData.service : ''}`,
      html: adminEmailHtml,
    });

    if (result.success) {
      // Send auto-reply
      const autoReplyHtml = `
        <h2>Thanks for reaching out!</h2>
        <p>Hi ${formData.name},</p>
        <p>We received your message and will get back to you within 24-48 hours.</p>
        <p><strong>Your message:</strong></p>
        <p>${formData.message}</p>
        <hr />
        <p>Best regards,<br/>
        AliceSolutions Group</p>
      `;

      await this.sendEmail({
        to: formData.email,
        subject: 'We received your message – AliceSolutions Group',
        html: autoReplyHtml,
      });
    }

    return { success: result.success };
  }
}

export const emailService = new EmailService();

