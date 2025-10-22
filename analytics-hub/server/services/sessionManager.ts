/**
 * SESSION MANAGER SERVICE
 * Manage visitor sessions and analytics
 */

import { db } from '../config/database.js';
import { analyticsSessions, analyticsEvents } from '../models/schema.js';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import type { AnalyticsSession, DateRange } from '../../shared/types.js';

/**
 * Get session by ID
 */
export async function getSession(sessionId: string): Promise<AnalyticsSession | null> {
  try {
    const sessions = await db
      .select()
      .from(analyticsSessions)
      .where(eq(analyticsSessions.sessionId, sessionId))
      .limit(1);

    if (sessions.length === 0) {
      return null;
    }

    const session = sessions[0];
    return mapSessionFromDb(session);
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get sessions by visitor ID
 */
export async function getVisitorSessions(visitorId: string): Promise<AnalyticsSession[]> {
  try {
    const sessions = await db
      .select()
      .from(analyticsSessions)
      .where(eq(analyticsSessions.visitorId, visitorId))
      .orderBy(desc(analyticsSessions.firstSeen))
      .limit(100);

    return sessions.map(mapSessionFromDb);
  } catch (error) {
    console.error('Error getting visitor sessions:', error);
    return [];
  }
}

/**
 * Get sessions for date range
 */
export async function getSessionsInRange(dateRange: DateRange): Promise<AnalyticsSession[]> {
  try {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    const sessions = await db
      .select()
      .from(analyticsSessions)
      .where(
        and(
          gte(analyticsSessions.firstSeen, startDate),
          lte(analyticsSessions.firstSeen, endDate)
        )
      )
      .orderBy(desc(analyticsSessions.firstSeen))
      .limit(1000);

    return sessions.map(mapSessionFromDb);
  } catch (error) {
    console.error('Error getting sessions in range:', error);
    return [];
  }
}

/**
 * Get session statistics
 */
export async function getSessionStats(dateRange?: DateRange): Promise<{
  totalSessions: number;
  totalVisitors: number;
  avgSessionDuration: number;
  avgPagesPerSession: number;
  bounceRate: number;
  conversionRate: number;
  totalConversions: number;
}> {
  try {
    let query = db.select().from(analyticsSessions);

    if (dateRange) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      query = query.where(
        and(
          gte(analyticsSessions.firstSeen, startDate),
          lte(analyticsSessions.firstSeen, endDate)
        )
      ) as any;
    }

    const sessions = await query;

    const totalSessions = sessions.length;
    const totalVisitors = new Set(sessions.map((s) => s.visitorId).filter(Boolean)).size;
    const totalBounces = sessions.filter((s) => s.bounced).length;
    const totalConversions = sessions.filter((s) => s.converted).length;
    const avgSessionDuration =
      sessions.reduce((sum, s) => sum + (s.sessionDuration || 0), 0) / (totalSessions || 1);
    const avgPagesPerSession =
      sessions.reduce((sum, s) => sum + (s.pageViews || 0), 0) / (totalSessions || 1);
    const bounceRate = (totalBounces / (totalSessions || 1)) * 100;
    const conversionRate = (totalConversions / (totalSessions || 1)) * 100;

    return {
      totalSessions,
      totalVisitors,
      avgSessionDuration: Math.round(avgSessionDuration),
      avgPagesPerSession: Math.round(avgPagesPerSession * 10) / 10,
      bounceRate: Math.round(bounceRate * 10) / 10,
      conversionRate: Math.round(conversionRate * 10) / 10,
      totalConversions,
    };
  } catch (error) {
    console.error('Error getting session stats:', error);
    return {
      totalSessions: 0,
      totalVisitors: 0,
      avgSessionDuration: 0,
      avgPagesPerSession: 0,
      bounceRate: 0,
      conversionRate: 0,
      totalConversions: 0,
    };
  }
}

/**
 * Get top traffic sources
 */
export async function getTopSources(
  dateRange?: DateRange,
  limit: number = 10
): Promise<Array<{
  source: string;
  medium: string;
  sessions: number;
  conversions: number;
  conversionRate: number;
}>> {
  try {
    let query = db.select().from(analyticsSessions);

    if (dateRange) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      query = query.where(
        and(
          gte(analyticsSessions.firstSeen, startDate),
          lte(analyticsSessions.firstSeen, endDate)
        )
      ) as any;
    }

    const sessions = await query;

    // Group by source and medium
    const sourceGroups = new Map<
      string,
      { sessions: number; conversions: number }
    >();

    sessions.forEach((session) => {
      const source = session.utmSource || 'direct';
      const medium = session.utmMedium || 'none';
      const key = `${source}|${medium}`;

      const existing = sourceGroups.get(key) || { sessions: 0, conversions: 0 };
      existing.sessions++;
      if (session.converted) {
        existing.conversions++;
      }
      sourceGroups.set(key, existing);
    });

    // Convert to array and sort
    const results = Array.from(sourceGroups.entries())
      .map(([key, data]) => {
        const [source, medium] = key.split('|');
        return {
          source,
          medium,
          sessions: data.sessions,
          conversions: data.conversions,
          conversionRate: (data.conversions / data.sessions) * 100,
        };
      })
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, limit);

    return results;
  } catch (error) {
    console.error('Error getting top sources:', error);
    return [];
  }
}

/**
 * Get device breakdown
 */
export async function getDeviceBreakdown(dateRange?: DateRange): Promise<Array<{
  deviceType: string;
  count: number;
  percentage: number;
}>> {
  try {
    let query = db.select().from(analyticsSessions);

    if (dateRange) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      query = query.where(
        and(
          gte(analyticsSessions.firstSeen, startDate),
          lte(analyticsSessions.firstSeen, endDate)
        )
      ) as any;
    }

    const sessions = await query;
    const total = sessions.length;

    // Count by device type
    const deviceCounts = new Map<string, number>();
    sessions.forEach((session) => {
      const device = session.deviceType || 'unknown';
      deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1);
    });

    return Array.from(deviceCounts.entries())
      .map(([deviceType, count]) => ({
        deviceType,
        count,
        percentage: Math.round((count / total) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error getting device breakdown:', error);
    return [];
  }
}

/**
 * Get geographic distribution
 */
export async function getGeographicData(dateRange?: DateRange): Promise<Array<{
  countryCode: string;
  countryName: string;
  city?: string;
  count: number;
  percentage: number;
}>> {
  try {
    let query = db.select().from(analyticsSessions);

    if (dateRange) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      query = query.where(
        and(
          gte(analyticsSessions.firstSeen, startDate),
          lte(analyticsSessions.firstSeen, endDate)
        )
      ) as any;
    }

    const sessions = await query;
    const total = sessions.length;

    // Group by country and city
    const locationCounts = new Map<string, { countryCode: string; countryName: string; city?: string; count: number }>();
    
    sessions.forEach((session) => {
      if (!session.countryCode) return;
      
      const key = `${session.countryCode}|${session.city || ''}`;
      const existing = locationCounts.get(key);
      
      if (existing) {
        existing.count++;
      } else {
        locationCounts.set(key, {
          countryCode: session.countryCode,
          countryName: session.countryName || session.countryCode,
          city: session.city || undefined,
          count: 1,
        });
      }
    });

    return Array.from(locationCounts.values())
      .map((loc) => ({
        ...loc,
        percentage: Math.round((loc.count / total) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error getting geographic data:', error);
    return [];
  }
}

/**
 * Map database session to AnalyticsSession type
 */
function mapSessionFromDb(dbSession: any): AnalyticsSession {
  return {
    id: dbSession.id.toString(),
    sessionId: dbSession.sessionId,
    visitorId: dbSession.visitorId || undefined,
    firstSeen: dbSession.firstSeen,
    lastSeen: dbSession.lastSeen,
    sessionDuration: dbSession.sessionDuration || 0,
    entryPage: dbSession.entryPage || undefined,
    entryPageTitle: dbSession.entryPageTitle || undefined,
    exitPage: dbSession.exitPage || undefined,
    exitPageTitle: dbSession.exitPageTitle || undefined,
    pageViews: dbSession.pageViews || 0,
    uniquePagesViewed: dbSession.uniquePagesViewed || 0,
    totalClicks: dbSession.totalClicks || 0,
    totalScroll: dbSession.totalScroll ? parseFloat(dbSession.totalScroll) : 0,
    engaged: dbSession.engaged || false,
    bounced: dbSession.bounced || false,
    converted: dbSession.converted || false,
    conversionType: dbSession.conversionType || undefined,
    conversionValue: dbSession.conversionValue ? parseFloat(dbSession.conversionValue) : undefined,
    conversionAt: dbSession.conversionAt || undefined,
    referrer: dbSession.referrer || undefined,
    referrerDomain: dbSession.referrerDomain || undefined,
    utmSource: dbSession.utmSource || undefined,
    utmMedium: dbSession.utmMedium || undefined,
    utmCampaign: dbSession.utmCampaign || undefined,
    deviceType: dbSession.deviceType || undefined,
    browser: dbSession.browser || undefined,
    os: dbSession.os || undefined,
    countryCode: dbSession.countryCode || undefined,
    city: dbSession.city || undefined,
  };
}
