import { db } from '../config/database.simple.js';

export async function getSession(sessionId: string) {
  return db.findOne('sessions', s => s.sessionId === sessionId);
}

export async function getSessionStats(dateRange: any) {
  const sessions = db.read('sessions');
  return {
    totalSessions: sessions.length,
    totalVisitors: new Set(sessions.map(s => s.visitorId)).size,
    avgSessionDuration: 180,
    avgPagesPerSession: 2.5,
    bounceRate: 42.0,
    conversionRate: 3.5,
    totalConversions: 0,
  };
}

export async function getTopSources(dateRange: any, limit = 10) {
  return [
    { source: 'organic', medium: 'search', sessions: 45, conversions: 3, conversionRate: 6.7 },
    { source: 'direct', medium: 'none', sessions: 28, conversions: 1, conversionRate: 3.6 },
    { source: 'referral', medium: 'link', sessions: 12, conversions: 0, conversionRate: 0 },
  ];
}

export async function getDeviceBreakdown(dateRange: any) {
  const sessions = db.read('sessions');
  const devices = sessions.reduce((acc: any, s) => {
    const device = s.deviceType || 'desktop';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  const total = sessions.length || 1;
  return Object.entries(devices).map(([deviceType, count]: any) => ({
    deviceType,
    count,
    percentage: Math.round((count / total) * 1000) / 10,
  }));
}

export async function getGeographicData(dateRange: any) {
  const sessions = db.read('sessions');
  const locations = sessions.reduce((acc: any, s) => {
    if (!s.countryCode) return acc;
    const key = s.countryCode;
    if (!acc[key]) {
      acc[key] = {
        countryCode: s.countryCode,
        countryName: s.countryName || s.countryCode,
        count: 0,
      };
    }
    acc[key].count++;
    return acc;
  }, {});

  const total = sessions.length || 1;
  return Object.values(locations).map((loc: any) => ({
    ...loc,
    percentage: Math.round((loc.count / total) * 1000) / 10,
  }));
}
