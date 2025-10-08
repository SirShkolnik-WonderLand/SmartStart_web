// Professional Booking System API
const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// File paths
const BOOKINGS_FILE = path.join(__dirname, 'bookings-data.json');

// GTA timezone configuration
const GTA_TIMEZONE = 'America/Toronto';
const GTA_LOCATIONS = {
    'toronto': { name: 'Toronto', timezone: 'America/Toronto' },
    'mississauga': { name: 'Mississauga', timezone: 'America/Toronto' },
    'vaughan': { name: 'Vaughan', timezone: 'America/Toronto' },
    'markham': { name: 'Markham', timezone: 'America/Toronto' },
    'brampton': { name: 'Brampton', timezone: 'America/Toronto' },
    'oakville': { name: 'Oakville', timezone: 'America/Toronto' }
};

// Service-specific email routing
const serviceEmails = {
    'cissp': 'training@alicesolutionsgroup.com',
    'cism': 'training@alicesolutionsgroup.com', 
    'iso27001': 'training@alicesolutionsgroup.com',
    'corporate': 'corporate@alicesolutionsgroup.com',
    'privacy': 'privacy@alicesolutionsgroup.com',
    'tabletop': 'corporate@alicesolutionsgroup.com',
    'ai-security': 'corporate@alicesolutionsgroup.com',
    'educational': 'education@alicesolutionsgroup.com'
};

// Service-specific workflows
const serviceWorkflows = {
    'cissp': {
        name: 'CISSP Training',
        preparationTime: '7 days',
        materials: ['CISSP Study Guide', 'Practice Tests', 'Domain Checklists'],
        prerequisites: ['5+ years security experience'],
        followUpActions: ['Send study materials', 'Schedule pre-assessment', 'Assign study buddy']
    },
    'cism': {
        name: 'CISM Training',
        preparationTime: '5 days',
        materials: ['CISM Study Guide', 'Governance Templates', 'Risk Assessment Tools'],
        prerequisites: ['3+ years management experience'],
        followUpActions: ['Send governance materials', 'Schedule strategy session', 'Provide case studies']
    },
    'iso27001': {
        name: 'ISO 27001 Lead Auditor',
        preparationTime: '10 days',
        materials: ['ISO 27001 Standard', 'Audit Checklists', 'Compliance Templates'],
        prerequisites: ['Audit experience preferred'],
        followUpActions: ['Send audit materials', 'Schedule mock audit', 'Assign audit partner']
    },
    'corporate': {
        name: 'Corporate Security Awareness',
        preparationTime: '3 days',
        materials: ['Training Modules', 'Assessment Tools', 'Policy Templates'],
        prerequisites: ['None'],
        followUpActions: ['Customize content', 'Schedule pre-training call', 'Send assessment tools']
    },
    'privacy': {
        name: 'PHIPA/PIPEDA Privacy Training',
        preparationTime: '4 days',
        materials: ['Privacy Guidelines', 'Compliance Checklists', 'Incident Response Plans'],
        prerequisites: ['Healthcare/Data handling experience'],
        followUpActions: ['Send privacy materials', 'Schedule compliance review', 'Provide templates']
    },
    'tabletop': {
        name: 'Executive Tabletop Exercises',
        preparationTime: '5 days',
        materials: ['Scenario Library', 'Incident Response Plans', 'Communication Templates'],
        prerequisites: ['Executive/Management role'],
        followUpActions: ['Customize scenarios', 'Schedule briefing', 'Prepare materials']
    },
    'ai-security': {
        name: 'AI Security Training',
        preparationTime: '6 days',
        materials: ['AI Security Framework', 'Risk Assessment Tools', 'Implementation Guides'],
        prerequisites: ['Technical background'],
        followUpActions: ['Send AI materials', 'Schedule technical review', 'Provide frameworks']
    },
    'educational': {
        name: 'Student & Educational Programs',
        preparationTime: '2 days',
        materials: ['Learning Modules', 'Career Guidance', 'Certification Paths'],
        prerequisites: ['Student/Educational status'],
        followUpActions: ['Send learning materials', 'Schedule career session', 'Provide mentorship']
    }
};

// Email templates
const emailTemplates = {
    customer: {
        subject: 'Training Session Confirmed - AliceSolutionsGroup',
        template: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #3b82f6, #9333ea); padding: 2rem; text-align: center;">
                    <h1 style="color: white; margin: 0;">Training Session Confirmed</h1>
                    <p style="color: white; margin: 0.5rem 0 0 0;">AliceSolutionsGroup</p>
                </div>
                
                <div style="padding: 2rem; background: #f8fafc;">
                    <h2 style="color: #1e293b;">Hello {{firstName}},</h2>
                    <p>Thank you for booking a training session with AliceSolutionsGroup. Your session has been confirmed with the following details:</p>
                    
                    <div style="background: white; padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
                        <h3 style="color: #3b82f6; margin-top: 0;">Session Details</h3>
                        <p><strong>Service:</strong> {{serviceName}}</p>
                        <p><strong>Date:</strong> {{date}}</p>
                        <p><strong>Time:</strong> {{time}}</p>
                        <p><strong>Location:</strong> {{location}}</p>
                        <p><strong>Participants:</strong> {{participants}}</p>
                        <p><strong>Booking ID:</strong> {{bookingId}}</p>
                    </div>
                    
                    <p>We will contact you within 24 hours to confirm the final details and provide any additional information.</p>
                    
                    <div style="text-align: center; margin: 2rem 0;">
                        <a href="https://alicesolutionsgroup.com" style="background: #3b82f6; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; display: inline-block;">Visit Our Website</a>
                    </div>
                </div>
                
                <div style="background: #1e293b; color: white; padding: 1rem; text-align: center; font-size: 0.9rem;">
                    <p>© 2025 AliceSolutionsGroup. All rights reserved.</p>
                    <p>Toronto, ON | <a href="mailto:udi.shkolnik@alicesolutionsgroup.com" style="color: #3b82f6;">udi.shkolnik@alicesolutionsgroup.com</a></p>
                </div>
            </div>
        `
    },
    admin: {
        subject: 'New Training Booking - {{serviceName}}',
        template: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #dc2626; padding: 2rem; text-align: center;">
                    <h1 style="color: white; margin: 0;">New Training Booking</h1>
                    <p style="color: white; margin: 0.5rem 0 0 0;">AliceSolutionsGroup Admin</p>
                </div>
                
                <div style="padding: 2rem; background: #f8fafc;">
                    <h2 style="color: #1e293b;">New Booking Received</h2>
                    
                    <div style="background: white; padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
                        <h3 style="color: #dc2626; margin-top: 0;">Booking Details</h3>
                        <p><strong>Service:</strong> {{serviceName}}</p>
                        <p><strong>Date:</strong> {{date}}</p>
                        <p><strong>Time:</strong> {{time}}</p>
                        <p><strong>Location:</strong> {{location}}</p>
                        <p><strong>Participants:</strong> {{participants}}</p>
                        <p><strong>Booking ID:</strong> {{bookingId}}</p>
                    </div>
                    
                    <div style="background: white; padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
                        <h3 style="color: #dc2626; margin-top: 0;">Contact Information</h3>
                        <p><strong>Name:</strong> {{firstName}} {{lastName}}</p>
                        <p><strong>Email:</strong> {{email}}</p>
                        <p><strong>Phone:</strong> {{phone}}</p>
                        <p><strong>Company:</strong> {{company}}</p>
                        <p><strong>Notes:</strong> {{notes}}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 2rem 0;">
                        <a href="https://alicesolutionsgroup.com/admin" style="background: #dc2626; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; display: inline-block;">View in Admin Panel</a>
                    </div>
                </div>
            </div>
        `
    }
};

// Email transporter configuration
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER || 'udi.shkolnik@alicesolutionsgroup.com',
            pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD
        }
    });
};

// Template replacement function
const replaceTemplate = (template, data) => {
    let result = template;
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, data[key] || '');
    });
    return result;
};

// Save booking to file
const saveBooking = async (bookingData) => {
    try {
        const bookingsDir = path.join(__dirname, 'bookings');
        await fs.mkdir(bookingsDir, { recursive: true });
        
        const filename = `${bookingData.bookingId}.json`;
        const filepath = path.join(bookingsDir, filename);
        
        await fs.writeFile(filepath, JSON.stringify(bookingData, null, 2));
        
        // Also append to daily log
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(bookingsDir, `${today}.log`);
        const logEntry = `${new Date().toISOString()} - ${bookingData.bookingId} - ${bookingData.service.name} - ${bookingData.contact.email}\n`;
        
        await fs.appendFile(logFile, logEntry);
        
        return true;
    } catch (error) {
        console.error('Error saving booking:', error);
        return false;
    }
};

// Send confirmation emails
const sendEmails = async (bookingData) => {
    const transporter = createTransporter();
    
    try {
        // Prepare email data
        const emailData = {
            firstName: bookingData.contact.firstName,
            lastName: bookingData.contact.lastName,
            serviceName: bookingData.service.name,
            date: new Date(bookingData.date).toLocaleDateString('en-CA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: bookingData.time,
            location: bookingData.contact.location || 'To be confirmed',
            participants: bookingData.contact.participants,
            bookingId: bookingData.bookingId,
            email: bookingData.contact.email,
            phone: bookingData.contact.phone,
            company: bookingData.contact.company || 'N/A',
            notes: bookingData.contact.notes || 'None'
        };
        
        // Send customer confirmation
        const customerEmail = {
            from: process.env.SMTP_USER || 'udi.shkolnik@alicesolutionsgroup.com',
            to: bookingData.contact.email,
            subject: emailTemplates.customer.subject,
            html: replaceTemplate(emailTemplates.customer.template, emailData)
        };
        
        await transporter.sendMail(customerEmail);
        
        // Send admin notification
        const adminEmail = {
            from: process.env.SMTP_USER || 'udi.shkolnik@alicesolutionsgroup.com',
            to: serviceEmails[bookingData.service.type] || 'udi.shkolnik@alicesolutionsgroup.com',
            subject: replaceTemplate(emailTemplates.admin.subject, emailData),
            html: replaceTemplate(emailTemplates.admin.template, emailData)
        };
        
        await transporter.sendMail(adminEmail);
        
        return true;
    } catch (error) {
        console.error('Error sending emails:', error);
        return false;
    }
};

// API Routes

// Create new booking
router.post('/bookings', async (req, res) => {
    try {
        const bookingData = req.body;
        
        // Validate required fields
        const requiredFields = ['service', 'date', 'time', 'contact'];
        for (const field of requiredFields) {
            if (!bookingData[field]) {
                return res.status(400).json({
                    error: `Missing required field: ${field}`
                });
            }
        }
        
        // Save booking
        const saved = await saveBooking(bookingData);
        if (!saved) {
            return res.status(500).json({
                error: 'Failed to save booking'
            });
        }
        
        // Send emails
        const emailsSent = await sendEmails(bookingData);
        if (!emailsSent) {
            console.warn('Emails failed to send for booking:', bookingData.bookingId);
        }
        
        // Execute service-specific workflow
        await executeServiceWorkflow(bookingData.service.type, bookingData);
        
        // Track analytics
        if (req.analyticsTracker) {
            req.analyticsTracker.trackEvent('booking_created', {
                service: bookingData.service.type,
                value: bookingData.service.price,
                bookingId: bookingData.bookingId
            });
        }
        
        res.json({
            success: true,
            bookingId: bookingData.bookingId,
            message: 'Booking created successfully'
        });
        
    } catch (error) {
        console.error('Booking API error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Get booking by ID
router.get('/bookings/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const filepath = path.join(__dirname, 'bookings', `${bookingId}.json`);
        
        const bookingData = await fs.readFile(filepath, 'utf8');
        res.json(JSON.parse(bookingData));
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Booking not found' });
        } else {
            console.error('Error retrieving booking:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Get all bookings (admin only)
router.get('/admin/bookings', async (req, res) => {
    try {
        const bookingsDir = path.join(__dirname, 'bookings');
        const files = await fs.readdir(bookingsDir);
        
        const bookings = [];
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filepath = path.join(bookingsDir, file);
                const bookingData = await fs.readFile(filepath, 'utf8');
                bookings.push(JSON.parse(bookingData));
            }
        }
        
        // Sort by date (newest first)
        bookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        res.json(bookings);
        
    } catch (error) {
        console.error('Error retrieving bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update booking status
router.put('/bookings/:bookingId/status', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status, notes } = req.body;
        
        const filepath = path.join(__dirname, 'bookings', `${bookingId}.json`);
        const bookingData = JSON.parse(await fs.readFile(filepath, 'utf8'));
        
        bookingData.status = status;
        bookingData.statusNotes = notes;
        bookingData.updatedAt = new Date().toISOString();
        
        await fs.writeFile(filepath, JSON.stringify(bookingData, null, 2));
        
        res.json({ success: true, message: 'Booking status updated' });
        
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get booking statistics
router.get('/admin/stats', async (req, res) => {
    try {
        const bookingsDir = path.join(__dirname, 'bookings');
        const files = await fs.readdir(bookingsDir);
        
        const stats = {
            total: 0,
            byService: {},
            byMonth: {},
            byStatus: {}
        };
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filepath = path.join(bookingsDir, file);
                const bookingData = JSON.parse(await fs.readFile(filepath, 'utf8'));
                
                stats.total++;
                
                // By service
                const service = bookingData.service.type;
                stats.byService[service] = (stats.byService[service] || 0) + 1;
                
                // By month
                const month = new Date(bookingData.timestamp).toISOString().substr(0, 7);
                stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
                
                // By status
                const status = bookingData.status || 'pending';
                stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
            }
        }
        
        res.json(stats);
        
    } catch (error) {
        console.error('Error retrieving stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Customer portal endpoints
router.get('/customer/bookings', async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ error: 'Email parameter is required' });
        }
        
        const bookingsData = await fs.readFile(BOOKINGS_FILE, 'utf8');
        const { bookings } = JSON.parse(bookingsData);
        
        const customerBookings = bookings.filter(booking => 
            booking.email.toLowerCase() === email.toLowerCase()
        );
        
        res.json({ bookings: customerBookings });
    } catch (error) {
        console.error('Error fetching customer bookings:', error);
        res.status(404).json({ error: 'No bookings found for this email' });
    }
});

router.post('/customer/bookings/:id/confirm', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        
        const bookingsData = await fs.readFile(BOOKINGS_FILE, 'utf8');
        const data = JSON.parse(bookingsData);
        
        const booking = data.bookings.find(b => b.id === id && b.email.toLowerCase() === email.toLowerCase());
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        if (booking.status !== 'pending') {
            return res.status(400).json({ error: 'Only pending bookings can be confirmed' });
        }
        
        booking.status = 'confirmed';
        booking.confirmedAt = new Date().toISOString();
        
        await fs.writeFile(BOOKINGS_FILE, JSON.stringify(data, null, 2));
        
        // Send confirmation email
        await sendBookingConfirmation(booking);
        
        res.json({ success: true, message: 'Booking confirmed successfully' });
    } catch (error) {
        console.error('Error confirming booking:', error);
        res.status(500).json({ error: 'Failed to confirm booking' });
    }
});

router.post('/customer/bookings/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        
        const bookingsData = await fs.readFile(BOOKINGS_FILE, 'utf8');
        const data = JSON.parse(bookingsData);
        
        const booking = data.bookings.find(b => b.id === id && b.email.toLowerCase() === email.toLowerCase());
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        if (booking.status === 'completed') {
            return res.status(400).json({ error: 'Completed bookings cannot be cancelled' });
        }
        
        booking.status = 'cancelled';
        booking.cancelledAt = new Date().toISOString();
        
        await fs.writeFile(BOOKINGS_FILE, JSON.stringify(data, null, 2));
        
        // Send cancellation email
        await sendBookingCancellation(booking);
        
        res.json({ success: true, message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
});

// Email functions for customer actions
async function sendBookingConfirmation(booking) {
    const serviceEmail = serviceEmails[booking.service];
    
    const customerHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center;">
                <h1>Booking Confirmed</h1>
                <p>AliceSolutionsGroup</p>
            </div>
            
            <div style="padding: 20px; background: #f8fafc;">
                <h2>Your Training Session is Confirmed!</h2>
                <p>Thank you for confirming your training session. Here are the details:</p>
                
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>Service:</strong> ${getServiceName(booking.service)}</p>
                    <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${booking.time}</p>
                    <p><strong>Booking ID:</strong> ${booking.id}</p>
                </div>
                
                <h3>What's Next?</h3>
                <p>You will receive additional preparation materials and session details via email within 24 hours.</p>
                
                <h3>Need to Make Changes?</h3>
                <p>Visit your <a href="https://alicesolutionsgroup.com/customer-portal.html?email=${booking.email}">Customer Portal</a> to manage your booking.</p>
                
                <h3>Contact Information</h3>
                <p>For questions, contact: ${serviceEmail}</p>
            </div>
        </div>
    `;
    
    try {
        await transporter.sendMail({
            from: 'noreply@alicesolutionsgroup.com',
            to: booking.email,
            subject: 'Training Session Confirmed - AliceSolutionsGroup',
            html: customerHtml
        });
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
}

async function sendBookingCancellation(booking) {
    const serviceEmail = serviceEmails[booking.service];
    
    const customerHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; text-align: center;">
                <h1>Booking Cancelled</h1>
                <p>AliceSolutionsGroup</p>
            </div>
            
            <div style="padding: 20px; background: #f8fafc;">
                <h2>Your Training Session Has Been Cancelled</h2>
                <p>Your booking has been successfully cancelled. Here are the details:</p>
                
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>Service:</strong> ${getServiceName(booking.service)}</p>
                    <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${booking.time}</p>
                    <p><strong>Booking ID:</strong> ${booking.id}</p>
                    <p><strong>Cancelled:</strong> ${new Date(booking.cancelledAt).toLocaleString()}</p>
                </div>
                
                <h3>Need to Reschedule?</h3>
                <p>We'd be happy to help you reschedule your training session. Visit our <a href="https://alicesolutionsgroup.com/booking.html">booking page</a> to schedule a new session.</p>
                
                <h3>Contact Information</h3>
                <p>For questions or to reschedule, contact: ${serviceEmail}</p>
                
                <p style="margin-top: 20px; color: #64748b; font-size: 0.9rem;">
                    Thank you for considering AliceSolutionsGroup for your cybersecurity training needs.
                </p>
            </div>
        </div>
    `;
    
    try {
        await transporter.sendMail({
            from: 'noreply@alicesolutionsgroup.com',
            to: booking.email,
            subject: 'Training Session Cancelled - AliceSolutionsGroup',
            html: customerHtml
        });
    } catch (error) {
        console.error('Error sending cancellation email:', error);
    }
}

function getServiceName(serviceKey) {
    const serviceNames = {
        'cissp': 'CISSP Training',
        'cism': 'CISM Training',
        'iso27001': 'ISO 27001 Lead Auditor',
        'corporate': 'Corporate Security Awareness',
        'privacy': 'PHIPA/PIPEDA Privacy Training',
        'tabletop': 'Executive Tabletop Exercises',
        'ai-security': 'AI Security Training',
        'educational': 'Student & Educational Programs'
    };
    
    return serviceNames[serviceKey] || serviceKey;
}

// Service-specific workflow execution
async function executeServiceWorkflow(serviceType, bookingData) {
    try {
        const workflow = serviceWorkflows[serviceType];
        if (!workflow) {
            console.warn(`No workflow defined for service: ${serviceType}`);
            return;
        }
        
        console.log(`Executing workflow for ${workflow.name}:`);
        
        // Log workflow actions for admin tracking
        const workflowLog = {
            service: serviceType,
            bookingId: bookingData.bookingId,
            customerEmail: bookingData.contact.email,
            workflow: workflow,
            executedAt: new Date().toISOString(),
            status: 'initiated'
        };
        
        // Save workflow log
        await saveWorkflowLog(workflowLog);
        
        // Execute follow-up actions based on service type
        for (const action of workflow.followUpActions) {
            await executeWorkflowAction(action, workflow, bookingData);
        }
        
        console.log(`Workflow completed for ${workflow.name}`);
        
    } catch (error) {
        console.error(`Error executing workflow for ${serviceType}:`, error);
    }
}

// Execute individual workflow actions
async function executeWorkflowAction(action, workflow, bookingData) {
    try {
        console.log(`Executing action: ${action}`);
        
        // Action-specific logic
        if (action.includes('Send')) {
            await scheduleMaterialDelivery(workflow.materials, bookingData);
        } else if (action.includes('Schedule')) {
            await scheduleFollowUpMeeting(workflow.name, bookingData);
        } else if (action.includes('Assign')) {
            await assignResources(workflow.name, bookingData);
        } else if (action.includes('Customize')) {
            await customizeContent(workflow.name, bookingData);
        } else if (action.includes('Provide')) {
            await provideTemplates(workflow.materials, bookingData);
        }
        
        // Log action completion
        await logWorkflowAction(action, bookingData.bookingId, 'completed');
        
    } catch (error) {
        console.error(`Error executing action ${action}:`, error);
        await logWorkflowAction(action, bookingData.bookingId, 'failed');
    }
}

// Helper functions for workflow actions
async function scheduleMaterialDelivery(materials, bookingData) {
    // Schedule material delivery based on preparation time
    const workflow = serviceWorkflows[bookingData.service.type];
    const preparationDays = parseInt(workflow.preparationTime);
    
    console.log(`Scheduling delivery of ${materials.join(', ')} for ${bookingData.contact.email}`);
    // In a real implementation, this would integrate with email scheduling or task management
}

async function scheduleFollowUpMeeting(serviceName, bookingData) {
    console.log(`Scheduling follow-up meeting for ${serviceName} with ${bookingData.contact.email}`);
    // In a real implementation, this would integrate with calendar systems
}

async function assignResources(serviceName, bookingData) {
    console.log(`Assigning resources for ${serviceName} to ${bookingData.contact.email}`);
    // In a real implementation, this would assign instructors, materials, etc.
}

async function customizeContent(serviceName, bookingData) {
    console.log(`Customizing content for ${serviceName} based on ${bookingData.contact.email} requirements`);
    // In a real implementation, this would customize training materials
}

async function provideTemplates(materials, bookingData) {
    console.log(`Providing templates: ${materials.join(', ')} to ${bookingData.contact.email}`);
    // In a real implementation, this would send relevant templates
}

// Workflow logging functions
async function saveWorkflowLog(workflowLog) {
    try {
        const logFile = path.join(__dirname, 'workflow-logs.json');
        let logs = [];
        
        try {
            const existingLogs = await fs.readFile(logFile, 'utf8');
            logs = JSON.parse(existingLogs);
        } catch (error) {
            // File doesn't exist yet, start with empty array
        }
        
        logs.push(workflowLog);
        
        await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
        console.log(`Workflow log saved for ${workflowLog.service}`);
        
    } catch (error) {
        console.error('Error saving workflow log:', error);
    }
}

async function logWorkflowAction(action, bookingId, status) {
    try {
        const logFile = path.join(__dirname, 'workflow-logs.json');
        let logs = [];
        
        try {
            const existingLogs = await fs.readFile(logFile, 'utf8');
            logs = JSON.parse(existingLogs);
        } catch (error) {
            // File doesn't exist yet
        }
        
        // Find the latest log for this booking
        const bookingLog = logs.find(log => log.bookingId === bookingId);
        if (bookingLog) {
            if (!bookingLog.actions) {
                bookingLog.actions = [];
            }
            
            bookingLog.actions.push({
                action: action,
                status: status,
                timestamp: new Date().toISOString()
            });
            
            // Update the log
            const logIndex = logs.findIndex(log => log.bookingId === bookingId);
            logs[logIndex] = bookingLog;
            
            await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
        }
        
    } catch (error) {
        console.error('Error logging workflow action:', error);
    }
}

// Advanced reporting and analytics endpoints
router.get('/analytics/overview', async (req, res) => {
    try {
        const bookingsData = await fs.readFile(BOOKINGS_FILE, 'utf8');
        const { bookings } = JSON.parse(bookingsData);
        
        // Calculate comprehensive analytics
        const analytics = {
            totalBookings: bookings.length,
            bookingsByMonth: getBookingsByMonth(bookings),
            bookingsByService: getBookingsByService(bookings),
            bookingsByStatus: getBookingsByStatus(bookings),
            conversionRates: getConversionRates(bookings),
            popularTimeSlots: getPopularTimeSlots(bookings),
            customerRetention: getCustomerRetention(bookings),
            revenueProjections: getRevenueProjections(bookings),
            trends: getBookingTrends(bookings),
            topCustomers: getTopCustomers(bookings)
        };
        
        res.json(analytics);
        
    } catch (error) {
        console.error('Error generating analytics:', error);
        res.status(500).json({ error: 'Failed to generate analytics' });
    }
});

// Analytics helper functions
function getBookingsByMonth(bookings) {
    const monthlyData = {};
    bookings.forEach(booking => {
        const month = new Date(booking.date).toISOString().slice(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    return monthlyData;
}

function getBookingsByService(bookings) {
    const serviceData = {};
    bookings.forEach(booking => {
        serviceData[booking.service] = (serviceData[booking.service] || 0) + 1;
    });
    return serviceData;
}

function getBookingsByStatus(bookings) {
    const statusData = {};
    bookings.forEach(booking => {
        statusData[booking.status] = (statusData[booking.status] || 0) + 1;
    });
    return statusData;
}

function getConversionRates(bookings) {
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    
    return {
        confirmationRate: totalBookings > 0 ? (confirmedBookings / totalBookings * 100).toFixed(2) : 0,
        completionRate: totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(2) : 0,
        cancellationRate: totalBookings > 0 ? ((bookings.filter(b => b.status === 'cancelled').length / totalBookings) * 100).toFixed(2) : 0
    };
}

function getPopularTimeSlots(bookings) {
    const timeSlotData = {};
    bookings.forEach(booking => {
        timeSlotData[booking.time] = (timeSlotData[booking.time] || 0) + 1;
    });
    
    return Object.entries(timeSlotData)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .reduce((obj, [time, count]) => {
            obj[time] = count;
            return obj;
        }, {});
}

function getCustomerRetention(bookings) {
    const customerBookings = {};
    bookings.forEach(booking => {
        if (!customerBookings[booking.email]) {
            customerBookings[booking.email] = 0;
        }
        customerBookings[booking.email]++;
    });
    
    const totalCustomers = Object.keys(customerBookings).length;
    const returningCustomers = Object.values(customerBookings).filter(count => count > 1).length;
    
    return {
        totalCustomers,
        returningCustomers,
        retentionRate: totalCustomers > 0 ? (returningCustomers / totalCustomers * 100).toFixed(2) : 0
    };
}

function getRevenueProjections(bookings) {
    const servicePrices = {
        'cissp': 2500, 'cism': 2200, 'iso27001': 2800, 'corporate': 1500,
        'privacy': 1800, 'tabletop': 2000, 'ai-security': 2000, 'educational': 0
    };
    
    let totalRevenue = 0;
    const revenueByService = {};
    
    bookings.forEach(booking => {
        const price = servicePrices[booking.service] || 0;
        if (booking.status === 'confirmed' || booking.status === 'completed') {
            totalRevenue += price;
            revenueByService[booking.service] = (revenueByService[booking.service] || 0) + price;
        }
    });
    
    return {
        totalRevenue,
        revenueByService,
        averageBookingValue: bookings.length > 0 ? (totalRevenue / bookings.length).toFixed(2) : 0
    };
}

function getBookingTrends(bookings) {
    const last30Days = bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return bookingDate >= thirtyDaysAgo;
    });
    
    const previous30Days = bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return bookingDate >= sixtyDaysAgo && bookingDate < thirtyDaysAgo;
    });
    
    const growthRate = previous30Days.length > 0 ? 
        (((last30Days.length - previous30Days.length) / previous30Days.length) * 100).toFixed(2) : 0;
    
    return {
        last30Days: last30Days.length,
        previous30Days: previous30Days.length,
        growthRate: growthRate,
        trend: growthRate > 0 ? 'increasing' : growthRate < 0 ? 'decreasing' : 'stable'
    };
}

function getTopCustomers(bookings) {
    const customerBookings = {};
    bookings.forEach(booking => {
        if (!customerBookings[booking.email]) {
            customerBookings[booking.email] = {
                email: booking.email,
                name: booking.name,
                bookings: 0
            };
        }
        customerBookings[booking.email].bookings++;
    });
    
    return Object.values(customerBookings)
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 10);
}

// Timezone utility functions
function convertToGTATime(date, time, fromTimezone = 'UTC') {
    try {
        // Create date object in the specified timezone
        const dateTimeString = `${date}T${time}:00`;
        const dateObj = new Date(dateTimeString);
        
        // Convert to GTA timezone
        const gtaTime = new Intl.DateTimeFormat('en-CA', {
            timeZone: GTA_TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).formatToParts(dateObj);
        
        return {
            date: `${gtaTime.find(part => part.type === 'year').value}-${gtaTime.find(part => part.type === 'month').value}-${gtaTime.find(part => part.type === 'day').value}`,
            time: `${gtaTime.find(part => part.type === 'hour').value}:${gtaTime.find(part => part.type === 'minute').value}`,
            timezone: GTA_TIMEZONE
        };
    } catch (error) {
        console.error('Error converting timezone:', error);
        return { date, time, timezone: GTA_TIMEZONE };
    }
}

function getGTATimeInfo() {
    const now = new Date();
    const gtaTime = new Intl.DateTimeFormat('en-CA', {
        timeZone: GTA_TIMEZONE,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(now);
    
    return {
        currentTime: gtaTime,
        timezone: GTA_TIMEZONE,
        offset: getTimezoneOffset()
    };
}

function getTimezoneOffset() {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const gta = new Date(utc.toLocaleString("en-US", {timeZone: GTA_TIMEZONE}));
    const offset = (gta.getTime() - utc.getTime()) / (1000 * 60 * 60);
    return offset;
}

function validateGTABusinessHours(date, time) {
    const bookingDateTime = new Date(`${date}T${time}:00`);
    const dayOfWeek = bookingDateTime.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = bookingDateTime.getHours();
    
    // Business hours: Monday-Friday, 8 AM - 6 PM
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const isBusinessHour = hour >= 8 && hour < 18;
    
    return {
        isValid: isWeekday && isBusinessHour,
        reason: !isWeekday ? 'Weekend bookings not available' : !isBusinessHour ? 'Outside business hours (8 AM - 6 PM)' : 'Valid time slot'
    };
}

// Timezone-aware booking validation endpoint
router.get('/timezone/validate', (req, res) => {
    try {
        const { date, time, location } = req.query;
        
        if (!date || !time) {
            return res.status(400).json({ error: 'Date and time are required' });
        }
        
        const validation = validateGTABusinessHours(date, time);
        const gtaTime = convertToGTATime(date, time);
        const timeInfo = getGTATimeInfo();
        
        res.json({
            isValid: validation.isValid,
            reason: validation.reason,
            gtaTime: gtaTime,
            currentGTAInfo: timeInfo,
            location: GTA_LOCATIONS[location] || GTA_LOCATIONS.toronto
        });
        
    } catch (error) {
        console.error('Error validating timezone:', error);
        res.status(500).json({ error: 'Failed to validate timezone' });
    }
});

// Get available time slots with timezone consideration
router.get('/availability/timezone', (req, res) => {
    try {
        const { date, location = 'toronto' } = req.query;
        
        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }
        
        const timeInfo = getGTATimeInfo();
        const locationInfo = GTA_LOCATIONS[location];
        
        // Generate available time slots for GTA business hours
        const availableSlots = generateGTATimeSlots(date, location);
        
        res.json({
            date: date,
            location: locationInfo,
            timezone: timeInfo,
            availableSlots: availableSlots
        });
        
    } catch (error) {
        console.error('Error getting timezone availability:', error);
        res.status(500).json({ error: 'Failed to get availability' });
    }
});

function generateGTATimeSlots(date, location) {
    const slots = [];
    const locationInfo = GTA_LOCATIONS[location];
    
    // Business hours: 8 AM to 6 PM, hourly slots
    for (let hour = 8; hour < 18; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        const validation = validateGTABusinessHours(date, timeString);
        
        slots.push({
            time: timeString,
            available: validation.isValid,
            timezone: locationInfo.timezone,
            location: locationInfo.name
        });
    }
    
    return slots;
}

module.exports = router;
