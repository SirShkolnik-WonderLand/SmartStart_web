import { db } from '../config/database.simple.js';
import type { AnalyticsEvent } from '../../shared/types.js';

export async function trackEvent(event: any) {
  try {
    const savedEvent = db.insert('analytics_events', {
      ...event,
      eventType: event.eventType || 'page_view',
      pageUrl: event.pageUrl,
      sessionId: event.sessionId,
    });
    
    // Update session
    updateSession(event.sessionId, event);
    
    return { success: true, eventId: savedEvent.id };
  } catch (error) {
    console.error('Track event error:', error);
    return { success: false, error: 'Failed to track' };
  }
}

export async function trackPageView(data: any) {
  return trackEvent({
    eventType: 'page_view',
    ...data,
  });
}

function updateSession(sessionId: string, event: any) {
  const session = db.findOne('analytics_sessions', s => s.sessionId === sessionId);
  
  if (!session) {
    db.insert('analytics_sessions', {
      sessionId,
      visitorId: event.visitorId,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      pageViews: 1,
      entryPage: event.pageUrl,
      deviceType: event.deviceType,
      countryCode: event.countryCode,
      city: event.city,
    });
  } else {
    db.update('analytics_sessions', s => s.sessionId === sessionId, {
      lastSeen: new Date().toISOString(),
      pageViews: session.pageViews + 1,
    });
  }
}

export async function getActiveVisitors() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const recentEvents = db.find('analytics_events', e => e.createdAt > fiveMinutesAgo);
  
  const sessions = new Set(recentEvents.map(e => e.sessionId));
  const pages = recentEvents
    .filter(e => e.eventType === 'page_view')
    .reduce((acc: any, e) => {
      const existing = acc.find((p: any) => p.url === e.pageUrl);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ url: e.pageUrl, title: e.pageTitle, count: 1 });
      }
      return acc;
    }, []);

  return {
    activeVisitors: sessions.size,
    activeSessions: sessions.size,
    activePages: pages,
  };
}

export async function getRecentEvents(limit = 50) {
  const events = db.read('analytics_events');
  return events.slice(-limit).reverse();
}

export function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateVisitorId(fingerprint: any) {
  return Math.random().toString(36).substring(2);
}
