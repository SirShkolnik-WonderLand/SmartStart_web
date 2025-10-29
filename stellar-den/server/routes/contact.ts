/**
 * CONTACT FORM API ROUTES
 * Handle contact form submissions with email notifications
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import nodemailer from 'nodemailer';

// Contact form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  company: z.string().max(200, 'Company name too long').optional(),
  phone: z.string().max(20, 'Phone number too long').optional(),
  service: z.string().max(100, 'Service selection too long').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
  source: z.string().max(100, 'Source too long').optional(),
  utm_source: z.string().max(100, 'UTM source too long').optional(),
  utm_medium: z.string().max(100, 'UTM medium too long').optional(),
  utm_campaign: z.string().max(100, 'UTM campaign too long').optional()
});

// Email configuration
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // You can change this to your preferred email service
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Send notification email to you
const sendNotificationEmail = async (formData: any) => {
  const transporter = createEmailTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: 'udi.shkolnik@alicesolutionsgroup.com',
    subject: `New Contact Form Submission from ${formData.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Contact Form Submission</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Contact Information</h3>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
          ${formData.company ? `<p><strong>Company:</strong> ${formData.company}</p>` : ''}
          ${formData.phone ? `<p><strong>Phone:</strong> ${formData.phone}</p>` : ''}
          ${formData.service ? `<p><strong>Service Interest:</strong> ${formData.service}</p>` : ''}
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Message</h3>
          <p style="white-space: pre-wrap;">${formData.message}</p>
        </div>
        
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Tracking Information</h3>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Source:</strong> ${formData.source || 'Website Contact Form'}</p>
          ${formData.utm_source ? `<p><strong>UTM Source:</strong> ${formData.utm_source}</p>` : ''}
          ${formData.utm_medium ? `<p><strong>UTM Medium:</strong> ${formData.utm_medium}</p>` : ''}
          ${formData.utm_campaign ? `<p><strong>UTM Campaign:</strong> ${formData.utm_campaign}</p>` : ''}
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            This email was sent from your website contact form at alicesolutionsgroup.com
          </p>
        </div>
      </div>
    `
  };
  
  return await transporter.sendMail(mailOptions);
};

// Send confirmation email to the customer
const sendConfirmationEmail = async (formData: any) => {
  const transporter = createEmailTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: formData.email,
    subject: 'Thank you for contacting Alice Solutions Group',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Thank You for Your Interest!</h2>
        
        <p>Dear ${formData.name},</p>
        
        <p>Thank you for reaching out to Alice Solutions Group. We've received your message and will get back to you within 24-48 hours.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">What happens next?</h3>
          <ul style="color: #475569;">
            <li>We'll review your inquiry within 24 hours</li>
            <li>Our team will prepare a personalized response</li>
            <li>We'll contact you via email or phone to discuss your needs</li>
            <li>If applicable, we'll schedule a consultation call</li>
          </ul>
        </div>
        
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Our Services</h3>
          <p style="color: #475569; margin: 0;">
            • Cybersecurity & Compliance<br>
            • Automation & AI Solutions<br>
            • Advisory & Audits<br>
            • SmartStart Ecosystem Development
          </p>
        </div>
        
        <p>If you have any urgent questions, please don't hesitate to reach out directly at <a href="mailto:udi.shkolnik@alicesolutionsgroup.com">udi.shkolnik@alicesolutionsgroup.com</a></p>
        
        <p>Best regards,<br>
        <strong>Udi Shkolnik</strong><br>
        Alice Solutions Group</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            Alice Solutions Group | Toronto, Ontario, Canada<br>
            <a href="https://alicesolutionsgroup.com">alicesolutionsgroup.com</a>
          </p>
        </div>
      </div>
    `
  };
  
  return await transporter.sendMail(mailOptions);
};

// Main contact form submission handler
export const submitContactForm = async (req: Request, res: Response) => {
  try {
    // Validate the form data
    const validatedData = contactFormSchema.parse(req.body);
    
    // Add timestamp and IP
    const formData = {
      ...validatedData,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown'
    };
    
    // Send notification email to you
    await sendNotificationEmail(formData);
    
    // Send confirmation email to the customer
    await sendConfirmationEmail(formData);
    
    // Log the submission (you could also save to database)
    console.log('✅ Contact form submitted:', {
      name: formData.name,
      email: formData.email,
      company: formData.company,
      service: formData.service,
      timestamp: formData.timestamp
    });
    
    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24-48 hours.',
      timestamp: formData.timestamp
    });
    
  } catch (error) {
    console.error('❌ Contact form error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid form data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to send message. Please try again or contact us directly.',
      message: 'If this problem persists, please email us directly at udi.shkolnik@alicesolutionsgroup.com'
    });
  }
};

// Newsletter signup handler
export const subscribeNewsletter = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Valid email address is required'
      });
    }
    
    // Here you could integrate with your email marketing service
    // For now, we'll just log it and send a confirmation
    console.log('📧 Newsletter signup:', { email, name, timestamp: new Date().toISOString() });
    
    res.status(200).json({
      success: true,
      message: 'Thank you for subscribing to our newsletter!'
    });
    
  } catch (error) {
    console.error('❌ Newsletter signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to subscribe. Please try again.'
    });
  }
};
