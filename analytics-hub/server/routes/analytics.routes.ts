/**
 * ANALYTICS API ROUTES
 * Public endpoints for tracking events (no authentication required)
 */

import { Router, type Request, Response } from 'express';
import { trackEvent, trackPageView, generateSessionId, generateVisitorId } from '../services/eventTracker.js';
import { parseUserAgent, isBot, getDeviceCategory } from '../utils/deviceParser.js';
import { getLocationFromIP } from '../utils/geoip.js';
import { hashIP, sanitizeInput, isValidUrl } from '../utils/privacy.js';
import type { TrackEventRequest } from '../../shared/types.js';

const router = Router();

/**
 * POST /api/v1/event
 * Track any analytics event
 */
router.post('/event', async (req: Request, res: Response) => {
  try {
    const eventData: TrackEventRequest = req.body;
    
    if (!eventData.event) {
      return res.status(400).json({
        success: false,
        error: 'Missing event data',
      });
    }

    const event = eventData.event;
    const userAgent = req.get('user-agent') || '';
    const ip = req.ip || req.connection.remoteAddress || '';

    // Filter out bots
    if (isBot(userAgent)) {
      return res.status(200).json({
        success: true,
        message: 'Bot traffic ignored',
      });
    }

    // Validate URL
    if (!isValidUrl(event.pageUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page URL',
      });
    }

    // Parse device info from user-agent
    const deviceInfo = parseUserAgent(userAgent);

    // Get location from IP (privacy-safe, city-level only)
    const location = getLocationFromIP(ip);

    // Merge data
    const enrichedEvent = {
      ...event,
      // Device info
      deviceType: getDeviceCategory(deviceInfo),
      deviceVendor: deviceInfo.deviceVendor,
      deviceModel: deviceInfo.deviceModel,
      browser: deviceInfo.browser,
      browserVersion: deviceInfo.browserVersion,
      browserEngine: deviceInfo.browserEngine,
      os: deviceInfo.os,
      osVersion: deviceInfo.osVersion,
      // Location info
      ipHash: hashIP(ip),
      countryCode: location?.countryCode,
      countryName: location?.countryName,
      region: location?.region,
      city: location?.city,
      timezone: location?.timezone,
      // Sanitize inputs
      pageTitle: event.pageTitle ? sanitizeInput(event.pageTitle) : undefined,
      eventName: event.eventName ? sanitizeInput(event.eventName) : undefined,
    };

    // Track the event
    const result = await trackEvent(enrichedEvent);

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.status(200).json({
      success: true,
      eventId: result.eventId,
    });
  } catch (error) {
    console.error('Error in /event endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/v1/pageview
 * Track page view (convenience endpoint)
 */
router.post('/pageview', async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      visitorId,
      pageUrl,
      pageTitle,
      referrer,
      utmParams,
      performance,
    } = req.body;

    if (!sessionId || !pageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, pageUrl',
      });
    }

    const userAgent = req.get('user-agent') || '';
    const ip = req.ip || '';

    // Filter bots
    if (isBot(userAgent)) {
      return res.status(200).json({
        success: true,
        message: 'Bot traffic ignored',
      });
    }

    // Validate URL
    if (!isValidUrl(pageUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page URL',
      });
    }

    // Parse device and location
    const deviceInfo = parseUserAgent(userAgent);
    const location = getLocationFromIP(ip);

    // Track page view
    const result = await trackPageView({
      sessionId,
      visitorId,
      pageUrl,
      pageTitle: pageTitle ? sanitizeInput(pageTitle) : undefined,
      referrer: referrer ? sanitizeInput(referrer) : undefined,
      utmParams,
      deviceInfo,
      location,
      performance,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in /pageview endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/v1/conversion
 * Track conversion event
 */
router.post('/conversion', async (req: Request, res: Response) => {
  try {
    const { sessionId, goalName, goalValue, pageUrl } = req.body;

    if (!sessionId || !goalName || !pageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, goalName, pageUrl',
      });
    }

    const userAgent = req.get('user-agent') || '';
    const ip = req.ip || '';

    // Filter bots
    if (isBot(userAgent)) {
      return res.status(200).json({
        success: true,
        message: 'Bot traffic ignored',
      });
    }

    // Track conversion as an event
    const result = await trackEvent({
      eventType: 'conversion',
      eventName: sanitizeInput(goalName),
      eventValue: goalValue,
      eventCategory: 'conversion',
      sessionId,
      pageUrl,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in /conversion endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/v1/click
 * Track button/link click
 */
router.post('/click', async (req: Request, res: Response) => {
  try {
    const { sessionId, pageUrl, elementId, elementText, elementHref } = req.body;

    if (!sessionId || !pageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, pageUrl',
      });
    }

    // Track click as an event
    const result = await trackEvent({
      eventType: 'click',
      eventName: elementText || elementId || 'unknown',
      eventCategory: 'interaction',
      sessionId,
      pageUrl,
      properties: {
        elementId: elementId ? sanitizeInput(elementId) : undefined,
        elementText: elementText ? sanitizeInput(elementText) : undefined,
        elementHref: elementHref ? sanitizeInput(elementHref) : undefined,
      },
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in /click endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/v1/session/new
 * Generate new session ID (helper endpoint)
 */
router.get('/session/new', (req: Request, res: Response) => {
  try {
    const sessionId = generateSessionId();
    return res.status(200).json({
      success: true,
      sessionId,
    });
  } catch (error) {
    console.error('Error generating session ID:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate session ID',
    });
  }
});

/**
 * GET /api/v1/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

/**
 * POST /api/v1/migrate
 * Temporary endpoint to run database migrations (no auth required)
 * This should be removed after initial setup
 */
router.post('/migrate', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Running database migrations...');
    
    // Read the schema.sql file
    const fs = await import('fs');
    const path = await import('path');
    const schemaPath = path.join(process.cwd(), 'server', 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    const { pool } = await import('../config/database.js');
    await pool.query(schemaSQL);
    
    console.log('✅ Database migrations completed successfully');
    return res.status(200).json({
      success: true,
      message: 'Database migrations completed successfully'
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Migration failed',
      details: error.message
    });
  }
});

export default router;
