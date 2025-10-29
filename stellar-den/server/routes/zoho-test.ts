import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Schema for contact form data
const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  message: z.string().min(1, 'Message is required'),
  company: z.string().optional(),
  phone: z.string().optional(),
  service: z.string().optional(),
});

// Schema for email sending
const emailSchema = z.object({
  to: z.string().email('Invalid recipient email format'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
  from: z.string().email('Invalid sender email format').optional(),
});

// Schema for calendar event
const calendarEventSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  startDateTime: z.string().datetime('Invalid start date/time format'),
  endDateTime: z.string().datetime('Invalid end date/time format'),
  attendees: z.array(z.string().email('Invalid attendee email format')).min(1, 'At least one attendee is required'),
  description: z.string().optional(),
  location: z.string().optional(),
});

// TEST MODE ENDPOINTS (No OAuth required)

// 1. Test Contact Form (Simulated)
router.post('/test/contact', async (req, res) => {
  try {
    const validatedData = contactFormSchema.parse(req.body);
    
    // Simulate processing
    console.log('📧 TEST MODE: Contact form received:', validatedData);
    
    // Simulate email sending
    console.log('📧 TEST MODE: Email would be sent to:', validatedData.email);
    console.log('📧 TEST MODE: Subject: Thank you for your inquiry!');
    console.log('📧 TEST MODE: Body: Dear ' + validatedData.name + ', thank you for contacting us...');
    
    // Simulate CRM lead creation
    console.log('📊 TEST MODE: CRM lead would be created for:', validatedData.name);
    
    res.json({ 
      success: true, 
      message: 'Contact form processed successfully (TEST MODE)',
      data: {
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company,
        service: validatedData.service,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ success: false, error: 'Failed to process contact form' });
  }
});

// 2. Test Email Sending (Simulated)
router.post('/test/email', async (req, res) => {
  try {
    const validatedData = emailSchema.parse(req.body);
    
    // Simulate email sending
    console.log('📧 TEST MODE: Email would be sent:', {
      to: validatedData.to,
      subject: validatedData.subject,
      body: validatedData.body,
      from: validatedData.from || 'noreply@alicesolutionsgroup.com'
    });
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully (TEST MODE)',
      data: {
        to: validatedData.to,
        subject: validatedData.subject,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

// 3. Test Calendar Event (Simulated)
router.post('/test/calendar', async (req, res) => {
  try {
    const validatedData = calendarEventSchema.parse(req.body);
    
    // Simulate calendar event creation
    console.log('📅 TEST MODE: Calendar event would be created:', {
      title: validatedData.title,
      startDateTime: validatedData.startDateTime,
      endDateTime: validatedData.endDateTime,
      attendees: validatedData.attendees,
      description: validatedData.description,
      location: validatedData.location
    });
    
    res.json({ 
      success: true, 
      message: 'Calendar event created successfully (TEST MODE)',
      data: {
        title: validatedData.title,
        startDateTime: validatedData.startDateTime,
        endDateTime: validatedData.endDateTime,
        attendees: validatedData.attendees,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ success: false, error: 'Failed to create calendar event' });
  }
});

// 4. Test Status Check
router.get('/test/status', (req, res) => {
  res.json({
    success: true,
    message: 'Zoho integration test endpoints are working',
    mode: 'TEST MODE (No OAuth required)',
    endpoints: {
      contact: 'POST /api/zoho/test/contact',
      email: 'POST /api/zoho/test/email',
      calendar: 'POST /api/zoho/test/calendar',
      status: 'GET /api/zoho/test/status'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
