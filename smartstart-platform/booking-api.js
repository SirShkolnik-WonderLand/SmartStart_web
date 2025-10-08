// Professional Booking System API
const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// File paths
const BOOKINGS_FILE = path.join(__dirname, 'bookings-data.json');

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
    return nodemailer.createTransporter({
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

module.exports = router;
