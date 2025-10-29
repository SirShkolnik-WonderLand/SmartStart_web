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
 * Handle contact form submission
 */
router.post('/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, company, phone, service, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required'
      });
    }

    const result = await zohoService.handleContactForm({
      name,
      email,
      company,
      phone,
      service,
      message
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Contact form submitted successfully',
        contactId: result.contactId,
        emailSent: result.emailSent
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to process contact form'
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
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
    // This would require a valid token to test
    res.json({
      success: true,
      message: 'Zoho service is configured',
      clientId: process.env.ZOHO_CLIENT_ID ? 'Configured' : 'Not configured',
      clientSecret: process.env.ZOHO_CLIENT_SECRET ? 'Configured' : 'Not configured'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Zoho service test failed'
    });
  }
});

export default router;
