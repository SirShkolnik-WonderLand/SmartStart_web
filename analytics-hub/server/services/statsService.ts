/**
 * STATS SERVICE
 * Calculate dashboard statistics and metrics
 */

import { db } from '../config/database.js';
import { analyticsEvents, analyticsSessions, analyticsPages } from '../models/schema.js';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import type { DashboardStats, PageStats, SourceStats, DateRange } from '../../shared/types.js';

/**
 * Get dashboard overview stats
 */
export async function getDashboardStats(dateRange: DateRange): Promise<DashboardStats> {
  try {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    // Current period stats
    const currentStats = await getStatsForPeriod(startDate, endDate);

    // Previous period stats (for comparison)
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = new Date(startDate);
    const previousStats = await getStatsForPeriod(prevStartDate, prevEndDate);

    // Calculate changes (percentage)
    const visitorsChange = calculateChange(currentStats.totalVisitors, previousStats.totalVisitors);
    const sessionsChange = calculateChange(currentStats.totalSessions, previousStats.totalSessions);
    const pageViewsChange = calculateChange(currentStats.totalPageViews, previousStats.totalPageViews);
    const conversionsChange = calculateChange(currentStats.totalConversions, previousStats.totalConversions);

    // Get active visitors (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeVisitorsResult = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})`,
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, fiveMinutesAgo));

    const activeVisitors = Number(activeVisitorsResult[0]?.count || 0);

    // Get active pages
    const activePagesResult = await db
      .select({
        url: analyticsEvents.pageUrl,
      })
      .from(analyticsEvents)
      .where(
        and(
          gte(analyticsEvents.createdAt, fiveMinutesAgo),
          eq(analyticsEvents.eventType, 'page_view')
        )
      )
      .groupBy(analyticsEvents.pageUrl)
      .limit(10);

    const activePages = activePagesResult.map((p) => p.url);

    return {
      totalVisitors: currentStats.totalVisitors,
      totalSessions: currentStats.totalSessions,
      totalPageViews: currentStats.totalPageViews,
      totalConversions: currentStats.totalConversions,
      
      visitorsChange,
      sessionsChange,
      pageViewsChange,
      conversionsChange,
      
      avgSessionDuration: currentStats.avgSessionDuration,
      avgPagesPerSession: currentStats.avgPagesPerSession,
      bounceRate: currentStats.bounceRate,
      conversionRate: currentStats.conversionRate,
      
      activeVisitors,
      activePages,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return getEmptyDashboardStats();
  }
}

/**
 * Get stats for a specific period
 */
async function getStatsForPeriod(startDate: Date, endDate: Date): Promise<{
  totalVisitors: number;
  totalSessions: number;
  totalPageViews: number;
  totalConversions: number;
  avgSessionDuration: number;
  avgPagesPerSession: number;
  bounceRate: number;
  conversionRate: number;
}> {
  // Get all sessions in period
  const sessions = await db
    .select()
    .from(analyticsSessions)
    .where(
      and(
        gte(analyticsSessions.firstSeen, startDate),
        lte(analyticsSessions.firstSeen, endDate)
      )
    );

  // Get all events in period
  const eventsResult = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(analyticsEvents)
    .where(
      and(
        gte(analyticsEvents.createdAt, startDate),
        lte(analyticsEvents.createdAt, endDate),
        eq(analyticsEvents.eventType, 'page_view')
      )
    );

  const totalSessions = sessions.length;
  const totalVisitors = new Set(sessions.map((s) => s.visitorId).filter(Boolean)).size;
  const totalPageViews = Number(eventsResult[0]?.count || 0);
  const totalConversions = sessions.filter((s) => s.converted).length;
  const totalBounces = sessions.filter((s) => s.bounced).length;

  const avgSessionDuration =
    sessions.reduce((sum, s) => sum + (s.sessionDuration || 0), 0) / (totalSessions || 1);
  const avgPagesPerSession =
    sessions.reduce((sum, s) => sum + (s.pageViews || 0), 0) / (totalSessions || 1);
  const bounceRate = (totalBounces / (totalSessions || 1)) * 100;
  const conversionRate = (totalConversions / (totalSessions || 1)) * 100;

  return {
    totalVisitors,
    totalSessions,
    totalPageViews,
    totalConversions,
    avgSessionDuration: Math.round(avgSessionDuration),
    avgPagesPerSession: Math.round(avgPagesPerSession * 10) / 10,
    bounceRate: Math.round(bounceRate * 10) / 10,
    conversionRate: Math.round(conversionRate * 10) / 10,
  };
}

/**
 * Get top pages
 */
export async function getTopPages(
  dateRange: DateRange,
  limit: number = 20
): Promise<PageStats[]> {
  try {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    const pages = await db
      .select()
      .from(analyticsPages)
      .where(
        and(
          gte(analyticsPages.date, startDate.toISOString().split('T')[0]),
          lte(analyticsPages.date, endDate.toISOString().split('T')[0])
        )
      )
      .orderBy(desc(analyticsPages.views))
      .limit(limit);

    return pages.map((p) => ({
      url: p.pageUrl,
      title: p.pageTitle || undefined,
      views: p.views || 0,
      uniqueVisitors: p.uniqueVisitors || 0,
      avgTimeOnPage: p.avgTimeOnPage || 0,
      bounceRate: p.bounceRate ? parseFloat(p.bounceRate) : 0,
      exitRate: p.exitRate ? parseFloat(p.exitRate) : 0,
      conversions: p.conversions || 0,
      conversionRate: p.conversionRate ? parseFloat(p.conversionRate) : 0,
    }));
  } catch (error) {
    console.error('Error getting top pages:', error);
    return [];
  }
}

/**
 * Get traffic over time (for charts)
 */
export async function getTrafficOverTime(
  dateRange: DateRange,
  interval: 'hour' | 'day' | 'week' | 'month' = 'day'
): Promise<Array<{ date: string; visitors: number; sessions: number; pageViews: number }>> {
  try {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    // Determine SQL date truncation based on interval
    const truncFunction = {
      hour: sql`date_trunc('hour', ${analyticsSessions.firstSeen})`,
      day: sql`date_trunc('day', ${analyticsSessions.firstSeen})`,
      week: sql`date_trunc('week', ${analyticsSessions.firstSeen})`,
      month: sql`date_trunc('month', ${analyticsSessions.firstSeen})`,
    }[interval];

    const result = await db
      .select({
        date: truncFunction,
        sessions: sql<number>`COUNT(*)`,
        visitors: sql<number>`COUNT(DISTINCT ${analyticsSessions.visitorId})`,
      })
      .from(analyticsSessions)
      .where(
        and(
          gte(analyticsSessions.firstSeen, startDate),
          lte(analyticsSessions.firstSeen, endDate)
        )
      )
      .groupBy(truncFunction)
      .orderBy(truncFunction);

    // Get page views for each period
    const pageViewsResult = await db
      .select({
        date: truncFunction,
        pageViews: sql<number>`COUNT(*)`,
      })
      .from(analyticsEvents)
      .where(
        and(
          gte(analyticsEvents.createdAt, startDate),
          lte(analyticsEvents.createdAt, endDate),
          eq(analyticsEvents.eventType, 'page_view')
        )
      )
      .groupBy(truncFunction)
      .orderBy(truncFunction);

    // Merge results
    const pageViewsMap = new Map(
      pageViewsResult.map((p) => [
        new Date(p.date as any).toISOString(),
        Number(p.pageViews),
      ])
    );

    return result.map((r) => {
      const dateStr = new Date(r.date as any).toISOString();
      return {
        date: formatDate(new Date(r.date as any), interval),
        visitors: Number(r.visitors),
        sessions: Number(r.sessions),
        pageViews: pageViewsMap.get(dateStr) || 0,
      };
    });
  } catch (error) {
    console.error('Error getting traffic over time:', error);
    return [];
  }
}

/**
 * Calculate percentage change
 */
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/**
 * Format date based on interval
 */
function formatDate(date: Date, interval: 'hour' | 'day' | 'week' | 'month'): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: { month: 'short', day: 'numeric', hour: '2-digit' },
    day: { month: 'short', day: 'numeric' },
    week: { month: 'short', day: 'numeric' },
    month: { year: 'numeric', month: 'short' },
  }[interval];

  return date.toLocaleDateString('en-US', options);
}

/**
 * Get empty dashboard stats (fallback)
 */
function getEmptyDashboardStats(): DashboardStats {
  return {
    totalVisitors: 0,
    totalSessions: 0,
    totalPageViews: 0,
    totalConversions: 0,
    visitorsChange: 0,
    sessionsChange: 0,
    pageViewsChange: 0,
    conversionsChange: 0,
    avgSessionDuration: 0,
    avgPagesPerSession: 0,
    bounceRate: 0,
    conversionRate: 0,
    activeVisitors: 0,
    activePages: [],
  };
}
