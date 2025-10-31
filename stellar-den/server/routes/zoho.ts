/**
 * ZOHO INTEGRATION ROUTES
 * API endpoints for Zoho CRM, Mail, and Calendar integration
 */

import { Router, Request, Response } from 'express';
import { zohoService } from '../services/zohoService.js';

const router = Router();

/**
 * Get Zoho OAuth authorization URL
 */
router.get('/auth-url', (req: Request, res: Response) => {
  try {
    const authUrl = zohoService.getAuthUrl();
    res.json({
      success: true,
      authUrl,
      message: 'Visit this URL to authorize Zoho access'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate auth URL'
    });
  }
});

/**
 * Handle OAuth callback
 */
router.post('/auth/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required'
      });
    }

    const token = await zohoService.getAccessToken(code);
    
    res.json({
      success: true,
      message: 'Zoho authentication successful',
      token: {
        access_token: token.access_token,
        expires_in: token.expires_in,
        token_type: token.token_type
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to authenticate with Zoho'
    });
  }
});

/**
 * Handle contact form submission (Enhanced Email Templates)
 * - Sends rich notification to admin with all lead data
 * - Sends service-specific auto-reply to client
 * - Auto-captures: pageUrl, referrer, geolocation, timestamp
 */
router.post('/contact', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      company,
      phone,
      service,
      message,
      // Enhanced fields
      mailingList,
      budget,
      timeline,
      companySize,
      industry,
      howDidYouHear,
      // Auto-captured lead source data
      pageUrl,
      referrer,
      timestamp,
      userAgent,
      geolocation
    } = req.body as {
      name?: string;
      email?: string;
      company?: string;
      phone?: string;
      service?: string;
      message?: string;
      mailingList?: boolean;
      budget?: string;
      timeline?: string;
      companySize?: string;
      industry?: string;
      howDidYouHear?: string;
      pageUrl?: string;
      referrer?: string;
      timestamp?: string;
      userAgent?: string;
      geolocation?: { timezone?: string; country?: string; region?: string; city?: string };
    };

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required'
      });
    }

    // Extract additional geolocation from request headers if available
    const requestGeo = {
      timezone: req.headers['x-timezone'] as string || geolocation?.timezone,
      // IP-based geolocation could be added here using a service
    };

    // Use enhanced email template service
    const { emailTemplateService } = await import('../services/emailTemplateService.js');
    
    const contactData = {
      name,
      email,
      company: company || undefined,
      phone: phone || undefined,
      service: service || undefined,
      message,
      mailingList: mailingList || false,
      budget: budget || undefined,
      timeline: timeline || undefined,
      companySize: companySize || undefined,
      industry: industry || undefined,
      howDidYouHear: howDidYouHear || undefined,
      pageUrl: pageUrl || req.headers.referer || 'Unknown',
      referrer: referrer || req.headers.referer || 'Direct',
    };

    // Send admin notification with all data
    const adminResult = await emailTemplateService.sendAdminNotification(contactData);
    
    if (!adminResult.success) {
      console.error('Admin email failed:', adminResult.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send notification. Please try again later.',
      });
    }

    // Send client auto-reply
    const clientResult = await emailTemplateService.sendClientAutoReply(contactData);
    
    if (!clientResult.success) {
      console.error('Client email failed:', clientResult.error);
      // Don't fail the request if client email fails, admin got notified
    }

    return res.json({
      success: true,
      message: 'Message sent successfully. We\'ll get back to you soon!'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send emails. Please try again later or contact us directly.'
    });
  }
});

/**
 * Create calendar event
 */
router.post('/calendar/event', async (req: Request, res: Response) => {
  try {
    const { title, startTime, endTime, description, attendees } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Title, start time, and end time are required'
      });
    }

    const event = {
      title,
      startTime,
      endTime,
      description,
      attendees: attendees || []
    };

    const result = await zohoService.createEvent(event);

    res.json({
      success: true,
      message: 'Calendar event created successfully',
      eventId: result.id
    });
  } catch (error) {
    console.error('Calendar event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create calendar event'
    });
  }
});

/**
 * Send email
 */
router.post('/email/send', async (req: Request, res: Response) => {
  try {
    const { to, subject, content, from } = req.body;

    if (!to || !subject || !content) {
      return res.status(400).json({
        success: false,
        error: 'To, subject, and content are required'
      });
    }

    const result = await zohoService.sendEmail({
      to,
      subject,
      content,
      from
    });

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.id
    });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email'
    });
  }
});

/**
 * Test Zoho connection
 */
router.get('/test', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Zoho service is configured',
      clientId: process.env.ZOHO_CLIENT_ID ? 'Configured' : 'Not configured',
      clientSecret: process.env.ZOHO_CLIENT_SECRET ? 'Configured' : 'Not configured',
      accessToken: process.env.ZOHO_ACCESS_TOKEN ? 'Configured' : 'Not configured'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Zoho service test failed'
    });
  }
});

/**
 * Simple test endpoint
 */
router.get('/test-contact', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Contact endpoint is working',
    timestamp: new Date().toISOString()
  });
});

/**
 * Get working access token (SIMPLIFIED)
 */
router.get('/get-token', (req: Request, res: Response) => {
  try {
    // Since you have working credentials, let's create a simple solution
    // You can get your access token directly from Zoho API Console or use a refresh token
    
    res.json({
      success: true,
      message: 'To get your access token:',
      instructions: [
        '1. Go to your Zoho API Console',
        '2. Find your "Z Contracts Automation" application', 
        '3. Look for "Access Token" or "Refresh Token"',
        '4. Copy the access token',
        '5. Add it to Render environment variables as ZOHO_ACCESS_TOKEN',
        '6. Or use the refresh token to generate a new access token'
      ],
      clientId: process.env.ZOHO_CLIENT_ID || '1000.RL5AUX1S0GDMJ72X7WIH0JDA6OQFLV',
      clientSecret: process.env.ZOHO_CLIENT_SECRET ? 'Configured' : 'Not configured',
      currentToken: process.env.ZOHO_ACCESS_TOKEN ? 'Configured' : 'Not configured'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get token info'
    });
  }
});

/**
 * Manual trigger for daily analytics report (for testing)
 */
router.post('/analytics/report', async (req: Request, res: Response) => {
  try {
    const { analyticsEmailService } = await import('../services/analyticsEmailService.js');
    const result = await analyticsEmailService.sendDailyReport();
    
    if (result.success) {
      return res.json({
        success: true,
        message: 'Analytics report sent successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to send report'
      });
    }
  } catch (error) {
    console.error('Analytics report error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate analytics report'
    });
  }
});

export default router;
