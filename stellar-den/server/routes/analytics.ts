/**
 * ANALYTICS DATA API
 * Endpoints to query visitor and lead data
 */

import { Router, Request, Response } from 'express';
import { analyticsStorage } from '../services/analyticsStorage.js';
import { enhancedAnalyticsEmailService } from '../services/enhancedAnalyticsEmailService.js';
import { leadTrackingService } from '../services/leadTrackingService.js';

const router = Router();

/**
 * GET /api/analytics/leads
 * Get all leads or leads for a date range
 */
router.get('/leads', async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

    const leads = analyticsStorage.getLeads(startDate, endDate);
    
    return res.json({
      success: true,
      count: leads.length,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      leads: leads.map(lead => ({
        id: lead.id,
        timestamp: lead.timestamp,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        service: lead.service,
        pageUrl: lead.pageUrl,
        referrer: lead.referrer,
        budget: lead.budget,
        timeline: lead.timeline,
        mailingList: lead.mailingList
      }))
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch leads'
    });
  }
});

/**
 * GET /api/analytics/stats
 * Get summary statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLeads = analyticsStorage.getLeads(today, tomorrow);
    const allLeads = analyticsStorage.getAllLeads();
    
    // Get today's analytics (if available)
    let todayAnalytics = null;
    try {
      todayAnalytics = await enhancedAnalyticsEmailService.getDailyAnalytics(today);
    } catch (error) {
      // Analytics Hub might not be accessible - that's ok
    }

    return res.json({
      success: true,
      date: today.toISOString().split('T')[0],
      stats: {
        totalLeads: allLeads.length,
        todayLeads: todayLeads.length,
        leadsByService: todayLeads.reduce((acc, lead) => {
          const service = lead.service || 'Unknown';
          acc[service] = (acc[service] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        leadsBySource: todayLeads.reduce((acc, lead) => {
          const source = lead.referrer ? new URL(lead.referrer).hostname : 'Direct';
          acc[source] = (acc[source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      analytics: todayAnalytics ? {
        totalVisitors: todayAnalytics.totalVisitors,
        totalPageViews: todayAnalytics.totalPageViews,
        uniqueVisitors: todayAnalytics.uniqueVisitors,
        activeVisitors: todayAnalytics.activeVisitors
      } : {
        message: 'Analytics Hub data not available (authentication required)'
      },
      recentLeads: todayLeads.slice(-10).reverse().map(lead => ({
        name: lead.name,
        email: lead.email,
        service: lead.service,
        timestamp: lead.timestamp,
        pageUrl: lead.pageUrl
      }))
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

/**
 * GET /api/analytics/pages
 * Get top pages from analytics (if available)
 */
router.get('/pages', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const analytics = await enhancedAnalyticsEmailService.getDailyAnalytics(today);
    
    if (!analytics) {
      return res.json({
        success: true,
        message: 'No analytics data available',
        pages: []
      });
    }

    return res.json({
      success: true,
      date: analytics.date,
      pages: analytics.topPages.slice(0, 20).map(page => ({
        path: page.path,
        views: page.views,
        uniqueVisitors: page.uniqueVisitors,
        avgTimeOnPage: page.avgTimeOnPage,
        bounceRate: page.bounceRate
      }))
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return res.json({
      success: true,
      message: 'Analytics Hub not accessible',
      pages: []
    });
  }
});

export default router;

