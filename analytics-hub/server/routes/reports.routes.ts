/**
 * REPORTS API ROUTES
 * Endpoints for generating and sending analytics reports
 */

import { Router, Request, Response } from 'express';
import { emailReportsService } from '../services/emailReports.js';

const router = Router();

/**
 * POST /api/admin/reports/send
 * Send an analytics report via email
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { email, frequency, dateRange, data } = req.body;

    if (!email || !data) {
      return res.status(400).json({
        success: false,
        error: 'Email and data are required',
      });
    }

    const success = await emailReportsService.sendReport(
      { email, frequency: frequency || 'weekly' },
      data
    );

    res.json({
      success,
      message: success ? 'Report sent successfully' : 'Failed to send report',
    });
  } catch (error: any) {
    console.error('Error sending report:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send report',
    });
  }
});

/**
 * POST /api/admin/reports/test
 * Test email configuration
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const isConnected = await emailReportsService.testConnection();

    res.json({
      success: isConnected,
      message: isConnected 
        ? 'Email configuration is valid' 
        : 'Email configuration failed',
    });
  } catch (error: any) {
    console.error('Error testing email:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to test email configuration',
    });
  }
});

/**
 * POST /api/admin/reports/schedule
 * Schedule periodic reports
 */
router.post('/schedule', async (req: Request, res: Response) => {
  try {
    const { email, frequency } = req.body;

    if (!email || !frequency) {
      return res.status(400).json({
        success: false,
        error: 'Email and frequency are required',
      });
    }

    // TODO: Store scheduled report configuration in database
    await emailReportsService.scheduleReports([{ email, frequency }]);

    res.json({
      success: true,
      message: `Report scheduled successfully (${frequency})`,
    });
  } catch (error: any) {
    console.error('Error scheduling report:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to schedule report',
    });
  }
});

export default router;
