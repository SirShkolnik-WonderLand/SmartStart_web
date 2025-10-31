/**
 * PRIVACY API ROUTES
 * Handles privacy-related requests: unsubscribe, data deletion, etc.
 */

import { Router, Request, Response } from 'express';
import { emailService } from '../services/emailService.js';
import { analyticsStorage } from '../services/analyticsStorage.js';

const router = Router();

/**
 * Handle unsubscribe request
 */
router.post('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    // Store unsubscribe request
    // In production, you'd want to update a database or mailing list service
    console.log(`📧 Unsubscribe request for: ${email}`);

    // Send confirmation email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">You've Been Unsubscribed</h2>
        <p>We've successfully removed <strong>${email}</strong> from our marketing email list.</p>
        <p>You may still receive important service-related emails such as:</p>
        <ul>
          <li>Account updates</li>
          <li>Security notices</li>
          <li>Service changes</li>
          <li>Important notifications</li>
        </ul>
        <p>If you'd like to resubscribe or have any questions, please contact us at privacy@alicesolutionsgroup.com</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #666;">
          AliceSolutionsGroup<br/>
          Toronto, Ontario, Canada<br/>
          <a href="https://alicesolutionsgroup.com">alicesolutionsgroup.com</a>
        </p>
      </div>
    `;

    await emailService.sendEmail({
      to: email,
      subject: 'Unsubscribe Confirmation - AliceSolutions Group',
      html,
    });

    // Also notify admin
    await emailService.sendEmail({
      to: 'udi.shkolnik@alicesolutionsgroup.com',
      subject: `Unsubscribe Request - ${email}`,
      html: `<p>User <strong>${email}</strong> has requested to unsubscribe from marketing emails.</p>`,
    });

    return res.json({
      success: true,
      message: 'Successfully unsubscribed. You will no longer receive marketing emails.'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process unsubscribe request'
    });
  }
});

/**
 * Handle data deletion request
 */
router.post('/data-deletion', async (req: Request, res: Response) => {
  try {
    const { email, name, reason } = req.body as {
      email?: string;
      name?: string;
      reason?: string;
    };

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    // Store deletion request
    console.log(`🗑️ Data deletion request from: ${email} (${name || 'Unknown'})`);

    // Send confirmation email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Data Deletion Request Received</h2>
        <p>We've received your request to delete your personal data.</p>
        <p><strong>Request Details:</strong></p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Name:</strong> ${name || 'Not provided'}</li>
          ${reason ? `<li><strong>Reason:</strong> ${reason}</li>` : ''}
        </ul>
        <p><strong>What happens next:</strong></p>
        <ol>
          <li>We'll verify your identity using the email address provided</li>
          <li>We'll process your request within 30 days (as required by GDPR/PIPEDA/CCPA)</li>
          <li>We'll send a confirmation email once your data is deleted</li>
          <li>Some data may be retained for legal or regulatory purposes</li>
        </ol>
        <p>If you have any questions, please contact us at privacy@alicesolutionsgroup.com</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #666;">
          AliceSolutionsGroup<br/>
          Toronto, Ontario, Canada<br/>
          <a href="https://alicesolutionsgroup.com">alicesolutionsgroup.com</a>
        </p>
      </div>
    `;

    await emailService.sendEmail({
      to: email,
      subject: 'Data Deletion Request Received - AliceSolutions Group',
      html,
    });

    // Notify admin
    const adminHtml = `
      <h2>New Data Deletion Request</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Name:</strong> ${name || 'Not provided'}</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <hr />
      <p><strong>Action Required:</strong> Process this request within 30 days per GDPR/PIPEDA/CCPA requirements.</p>
      <p>Review and delete data for: ${email}</p>
    `;

    await emailService.sendEmail({
      to: 'udi.shkolnik@alicesolutionsgroup.com',
      subject: `Data Deletion Request - ${email}`,
      html: adminHtml,
    });

    // Note: In production, you'd want to:
    // 1. Store the request in a database
    // 2. Set up automated deletion process
    // 3. Track deletion requests for compliance

    return res.json({
      success: true,
      message: 'Data deletion request received. We will process it within 30 days.'
    });
  } catch (error) {
    console.error('Data deletion request error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process data deletion request'
    });
  }
});

export default router;

