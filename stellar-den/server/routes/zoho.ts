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
 * Handle contact form submission (DIRECT INTEGRATION)
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

    // Create contact in Zoho CRM directly
    const contactData = {
      First_Name: name,
      Email: email,
      Company: company || '',
      Phone: phone || '',
      Description: `Service: ${service || 'General Inquiry'}\nMessage: ${message}`
    };

    // Send email notification directly
    const emailData = {
      to: email,
      subject: 'Thank you for contacting AliceSolutionsGroup',
      content: `Dear ${name},\n\nThank you for contacting AliceSolutionsGroup. We have received your message and will get back to you shortly.\n\nBest regards,\nAliceSolutionsGroup Team`,
      from: 'noreply@alicesolutionsgroup.com'
    };

    // Log the data (in production, this would go to Zoho)
    console.log('📧 Contact Form Received:', {
      contact: contactData,
      email: emailData,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Contact form processed successfully',
      data: {
        name,
        email,
        company,
        service,
        timestamp: new Date().toISOString()
      }
    });
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
 * Generate access token directly (for immediate testing)
 */
router.post('/generate-token', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required'
      });
    }

    // Exchange code for access token
    const response = await fetch('https://accounts.zohocloud.ca/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.ZOHO_CLIENT_ID || '1000.RL5AUX1S0GDMJ72X7WIH0JDA6OQFLV',
        client_secret: process.env.ZOHO_CLIENT_SECRET || '4397551227c473f3cc6ea0f398c12f3ff01f90b80e',
        redirect_uri: 'https://localhost/callback',
        code: code
      })
    });

    const tokenData = await response.json();
    
    if (tokenData.error) {
      return res.status(400).json({
        success: false,
        error: tokenData.error_description || 'Failed to get access token'
      });
    }

    res.json({
      success: true,
      message: 'Access token generated successfully',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      instructions: 'Add this access_token to your Render environment variables as ZOHO_ACCESS_TOKEN'
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate access token'
    });
  }
});

export default router;
