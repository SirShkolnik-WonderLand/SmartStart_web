/**
 * EVENT TRACKER SERVICE
 * Process and store analytics events
 */

import { db } from '../config/database.js';
import { analyticsEvents, analyticsSessions, analyticsGoals } from '../models/schema.js';
import { eq, and, gte, sql } from 'drizzle-orm';
import type { AnalyticsEvent } from '../../shared/types.js';
import { parseDeviceInfo, parseLocation, hashIP } from '../utils/privacy.js';
import crypto from 'crypto';

/**
 * Track a new analytics event
 */
export async function trackEvent(event: Omit<AnalyticsEvent, 'id' | 'createdAt'>): Promise<{
  success: boolean;
  eventId?: number;
  error?: string;
}> {
  try {
    // Validate required fields
    if (!event.eventType || !event.pageUrl || !event.sessionId) {
      return {
        success: false,
        error: 'Missing required fields: eventType, pageUrl, sessionId',
      };
    }

    // Insert event into database
    const [insertedEvent] = await db
      .insert(analyticsEvents)
      .values({
        eventType: event.eventType,
        eventName: event.eventName,
        eventValue: event.eventValue?.toString(),
        eventCategory: event.eventCategory,
        
        pageUrl: event.pageUrl,
        pageTitle: event.pageTitle,
        pagePath: extractPath(event.pageUrl),
        pageReferrer: event.pageReferrer,
        pageQueryParams: event.pageQueryParams,
        
        sessionId: event.sessionId,
        visitorId: event.visitorId,
        isNewVisitor: event.isNewVisitor,
        isReturning: event.isReturning,
        
        utmSource: event.utmSource,
        utmMedium: event.utmMedium,
        utmCampaign: event.utmCampaign,
        utmTerm: event.utmTerm,
        utmContent: event.utmContent,
        
        deviceType: event.deviceType,
        deviceVendor: event.deviceVendor,
        deviceModel: event.deviceModel,
        browser: event.browser,
        browserVersion: event.browserVersion,
        os: event.os,
        osVersion: event.osVersion,
        screenWidth: event.screenWidth,
        screenHeight: event.screenHeight,
        viewportWidth: event.properties?.viewportWidth,
        viewportHeight: event.properties?.viewportHeight,
        
        countryCode: event.countryCode,
        countryName: event.countryName,
        region: event.properties?.region,
        city: event.city,
        timezone: event.timezone,
        language: event.language,
        
        timeOnPage: event.timeOnPage,
        scrollDepth: event.scrollDepth,
        maxScroll: event.properties?.maxScroll,
        clicksOnPage: event.clicksOnPage,
        
        properties: event.properties,
        
        pageLoadTime: event.pageLoadTime,
        domInteractive: event.domInteractive,
        domComplete: event.domComplete,
      })
      .returning({ id: analyticsEvents.id });

    // Check if this is a conversion event
    if (event.eventType === 'conversion' && event.eventName) {
      await processConversion(event.sessionId, event.eventName, event.eventValue);
    }

    // Update session (handled by trigger, but we can also do it manually for more control)
    await updateSession(event.sessionId, event);

    return {
      success: true,
      eventId: insertedEvent.id,
    };
  } catch (error) {
    console.error('Error tracking event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track event',
    };
  }
}

/**
 * Track a page view (convenience wrapper)
 */
export async function trackPageView(data: {
  sessionId: string;
  visitorId?: string;
  pageUrl: string;
  pageTitle?: string;
  referrer?: string;
  utmParams?: Record<string, string>;
  deviceInfo?: any;
  location?: any;
  performance?: any;
}): Promise<{ success: boolean; error?: string }> {
  const event: Omit<AnalyticsEvent, 'id' | 'createdAt'> = {
    eventType: 'page_view',
    eventCategory: 'navigation',
    
    sessionId: data.sessionId,
    visitorId: data.visitorId,
    
    pageUrl: data.pageUrl,
    pageTitle: data.pageTitle,
    pagePath: extractPath(data.pageUrl),
    pageReferrer: data.referrer,
    
    utmSource: data.utmParams?.utm_source,
    utmMedium: data.utmParams?.utm_medium,
    utmCampaign: data.utmParams?.utm_campaign,
    utmTerm: data.utmParams?.utm_term,
    utmContent: data.utmParams?.utm_content,
    
    deviceType: data.deviceInfo?.type,
    browser: data.deviceInfo?.browser,
    browserVersion: data.deviceInfo?.browserVersion,
    os: data.deviceInfo?.os,
    osVersion: data.deviceInfo?.osVersion,
    screenWidth: data.deviceInfo?.screenWidth,
    screenHeight: data.deviceInfo?.screenHeight,
    
    countryCode: data.location?.countryCode,
    countryName: data.location?.countryName,
    city: data.location?.city,
    timezone: data.location?.timezone,
    language: data.location?.language,
    
    pageLoadTime: data.performance?.pageLoadTime,
    domInteractive: data.performance?.domInteractive,
    domComplete: data.performance?.domComplete,
  };

  return trackEvent(event);
}

/**
 * Update session on new event
 */
async function updateSession(
  sessionId: string,
  event: Omit<AnalyticsEvent, 'id' | 'createdAt'>
): Promise<void> {
  try {
    // Check if session exists
    const existingSession = await db
      .select()
      .from(analyticsSessions)
      .where(eq(analyticsSessions.sessionId, sessionId))
      .limit(1);

    const now = new Date();

    if (existingSession.length === 0) {
      // Create new session
      await db.insert(analyticsSessions).values({
        sessionId,
        visitorId: event.visitorId,
        firstSeen: now,
        lastSeen: now,
        sessionDuration: 0,
        entryPage: event.pageUrl,
        entryPageTitle: event.pageTitle,
        pageViews: 1,
        uniquePagesViewed: 1,
        deviceType: event.deviceType,
        browser: event.browser,
        os: event.os,
        countryCode: event.countryCode,
        countryName: event.countryName,
        city: event.city,
        referrer: event.pageReferrer,
        referrerDomain: event.pageReferrer ? extractDomain(event.pageReferrer) : null,
        utmSource: event.utmSource,
        utmMedium: event.utmMedium,
        utmCampaign: event.utmCampaign,
        utmTerm: event.utmTerm,
        utmContent: event.utmContent,
      });
    } else {
      // Update existing session
      const session = existingSession[0];
      const firstSeen = session.firstSeen;
      const sessionDuration = Math.floor((now.getTime() - firstSeen.getTime()) / 1000);

      await db
        .update(analyticsSessions)
        .set({
          lastSeen: now,
          sessionDuration,
          pageViews: session.pageViews + 1,
          exitPage: event.pageUrl,
          exitPageTitle: event.pageTitle,
          updatedAt: now,
          // Engaged if >30s or >2 pages
          engaged: sessionDuration > 30 || session.pageViews + 1 > 2,
          // Bounced if single page and <10s
          bounced: session.pageViews === 1 && sessionDuration < 10,
        })
        .where(eq(analyticsSessions.sessionId, sessionId));
    }
  } catch (error) {
    console.error('Error updating session:', error);
  }
}

/**
 * Process conversion event
 */
async function processConversion(
  sessionId: string,
  goalName: string,
  goalValue?: number
): Promise<void> {
  try {
    // Find matching goal
    const goal = await db
      .select()
      .from(analyticsGoals)
      .where(eq(analyticsGoals.goalName, goalName))
      .limit(1);

    if (goal.length === 0) {
      console.warn(`Goal not found: ${goalName}`);
      return;
    }

    const goalId = goal[0].id;
    const value = goalValue || goal[0].goalValue ? parseFloat(goal[0].goalValue as string) : 0;

    // Update session with conversion
    await db
      .update(analyticsSessions)
      .set({
        converted: true,
        conversionType: goalName,
        conversionGoalId: goalId,
        conversionValue: value.toString(),
        conversionAt: new Date(),
      })
      .where(eq(analyticsSessions.sessionId, sessionId));

    // Update goal statistics
    await db
      .update(analyticsGoals)
      .set({
        totalConversions: sql`${analyticsGoals.totalConversions} + 1`,
        totalValue: sql`${analyticsGoals.totalValue} + ${value}`,
        lastConversion: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(analyticsGoals.id, goalId));
  } catch (error) {
    console.error('Error processing conversion:', error);
  }
}

/**
 * Get real-time visitor count (last 5 minutes)
 */
export async function getActiveVisitors(): Promise<{
  activeVisitors: number;
  activeSessions: number;
  activePages: { url: string; title?: string; count: number }[];
}> {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Count unique sessions in last 5 minutes
    const result = await db
      .select({
        activeSessions: sql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})`,
        activeVisitors: sql<number>`COUNT(DISTINCT ${analyticsEvents.visitorId})`,
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, fiveMinutesAgo));

    // Get active pages
    const pagesResult = await db
      .select({
        url: analyticsEvents.pageUrl,
        title: analyticsEvents.pageTitle,
        count: sql<number>`COUNT(*)`,
      })
      .from(analyticsEvents)
      .where(
        and(
          gte(analyticsEvents.createdAt, fiveMinutesAgo),
          eq(analyticsEvents.eventType, 'page_view')
        )
      )
      .groupBy(analyticsEvents.pageUrl, analyticsEvents.pageTitle)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    return {
      activeVisitors: Number(result[0]?.activeVisitors || 0),
      activeSessions: Number(result[0]?.activeSessions || 0),
      activePages: pagesResult.map((p) => ({
        url: p.url,
        title: p.title || undefined,
        count: Number(p.count),
      })),
    };
  } catch (error) {
    console.error('Error getting active visitors:', error);
    return {
      activeVisitors: 0,
      activeSessions: 0,
      activePages: [],
    };
  }
}

/**
 * Get recent events (for activity feed)
 */
export async function getRecentEvents(limit: number = 50): Promise<AnalyticsEvent[]> {
  try {
    const events = await db
      .select()
      .from(analyticsEvents)
      .orderBy(sql`${analyticsEvents.createdAt} DESC`)
      .limit(limit);

    return events.map((e) => ({
      id: e.id.toString(),
      createdAt: e.createdAt,
      eventType: e.eventType as any,
      eventName: e.eventName || undefined,
      eventValue: e.eventValue ? parseFloat(e.eventValue) : undefined,
      eventCategory: (e.eventCategory as any) || undefined,
      pageUrl: e.pageUrl,
      pageTitle: e.pageTitle || undefined,
      pagePath: e.pagePath || undefined,
      pageReferrer: e.pageReferrer || undefined,
      sessionId: e.sessionId,
      visitorId: e.visitorId || undefined,
      deviceType: (e.deviceType as any) || undefined,
      browser: e.browser || undefined,
      os: e.os || undefined,
      countryCode: e.countryCode || undefined,
      countryName: e.countryName || undefined,
      city: e.city || undefined,
      timeOnPage: e.timeOnPage || undefined,
      scrollDepth: e.scrollDepth || undefined,
    }));
  } catch (error) {
    console.error('Error getting recent events:', error);
    return [];
  }
}

/**
 * Extract path from URL
 */
function extractPath(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    return url;
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * Generate visitor ID from fingerprint
 */
export function generateVisitorId(fingerprint: {
  userAgent?: string;
  language?: string;
  timezone?: string;
  screenResolution?: string;
}): string {
  const data = JSON.stringify(fingerprint);
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 64);
}

/**
 * Generate session ID
 */
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}
