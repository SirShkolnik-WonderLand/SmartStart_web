#!/usr/bin/env node

/**
 * Generate test analytics data for development
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample data
const sampleEvents = [
  {
    id: 'evt_001',
    eventType: 'pageview',
    eventName: 'page_view',
    pageUrl: 'http://localhost:8080/',
    pageTitle: 'AliceSolutions - Cybersecurity & Venture Studio',
    sessionId: 'sess_001',
    userId: null,
    properties: {
      referrer: 'https://google.com',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      screenResolution: '1920x1080',
      language: 'en-US',
      timezone: 'America/Toronto'
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    country: 'CA',
    city: 'Toronto',
    deviceType: 'desktop',
    browser: 'Chrome',
    os: 'macOS'
  },
  {
    id: 'evt_002',
    eventType: 'pageview',
    eventName: 'page_view',
    pageUrl: 'http://localhost:8080/services',
    pageTitle: 'Services - AliceSolutions',
    sessionId: 'sess_001',
    userId: null,
    properties: {
      referrer: 'http://localhost:8080/',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      screenResolution: '1920x1080',
      language: 'en-US',
      timezone: 'America/Toronto'
    },
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours ago
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    country: 'CA',
    city: 'Toronto',
    deviceType: 'desktop',
    browser: 'Chrome',
    os: 'macOS'
  },
  {
    id: 'evt_003',
    eventType: 'custom',
    eventName: 'cta_click',
    pageUrl: 'http://localhost:8080/services',
    pageTitle: 'Services - AliceSolutions',
    sessionId: 'sess_001',
    userId: null,
    properties: {
      ctaType: 'contact',
      ctaText: 'Book a Strategy Call',
      referrer: 'http://localhost:8080/',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      screenResolution: '1920x1080',
      language: 'en-US',
      timezone: 'America/Toronto'
    },
    timestamp: new Date(Date.now() - 1.4 * 60 * 60 * 1000).toISOString(), // 1.4 hours ago
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    country: 'CA',
    city: 'Toronto',
    deviceType: 'desktop',
    browser: 'Chrome',
    os: 'macOS'
  },
  {
    id: 'evt_004',
    eventType: 'pageview',
    eventName: 'page_view',
    pageUrl: 'http://localhost:8080/smartstart',
    pageTitle: 'SmartStart Hub - AliceSolutions',
    sessionId: 'sess_002',
    userId: null,
    properties: {
      referrer: 'https://linkedin.com',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      screenResolution: '375x812',
      language: 'en-US',
      timezone: 'America/Toronto'
    },
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    country: 'CA',
    city: 'Markham',
    deviceType: 'mobile',
    browser: 'Safari',
    os: 'iOS'
  },
  {
    id: 'evt_005',
    eventType: 'conversion',
    eventName: 'goal_completed',
    pageUrl: 'http://localhost:8080/smartstart',
    pageTitle: 'SmartStart Hub - AliceSolutions',
    sessionId: 'sess_002',
    userId: null,
    properties: {
      goalName: 'smartstart_signup',
      goalValue: 98.80,
      referrer: 'https://linkedin.com',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      screenResolution: '375x812',
      language: 'en-US',
      timezone: 'America/Toronto'
    },
    timestamp: new Date(Date.now() - 0.9 * 60 * 60 * 1000).toISOString(), // 54 minutes ago
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    country: 'CA',
    city: 'Markham',
    deviceType: 'mobile',
    browser: 'Safari',
    os: 'iOS'
  },
  {
    id: 'evt_006',
    eventType: 'pageview',
    eventName: 'page_view',
    pageUrl: 'http://localhost:8080/iso-studio',
    pageTitle: 'ISO Studio - AliceSolutions',
    sessionId: 'sess_003',
    userId: null,
    properties: {
      referrer: 'https://google.com/search?q=iso+27001+consultant+toronto',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      screenResolution: '1366x768',
      language: 'en-US',
      timezone: 'America/Toronto'
    },
    timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(), // 30 minutes ago
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    country: 'CA',
    city: 'Mississauga',
    deviceType: 'desktop',
    browser: 'Chrome',
    os: 'Windows'
  }
];

const sampleSessions = [
  {
    id: 'sess_001',
    userId: null,
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 1.3 * 60 * 60 * 1000).toISOString(),
    duration: 42 * 60 * 1000, // 42 minutes
    pageViews: 2,
    events: 3,
    conversions: 0,
    country: 'CA',
    city: 'Toronto',
    deviceType: 'desktop',
    browser: 'Chrome',
    os: 'macOS',
    referrer: 'https://google.com',
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  },
  {
    id: 'sess_002',
    userId: null,
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 0.8 * 60 * 60 * 1000).toISOString(),
    duration: 12 * 60 * 1000, // 12 minutes
    pageViews: 1,
    events: 2,
    conversions: 1,
    country: 'CA',
    city: 'Markham',
    deviceType: 'mobile',
    browser: 'Safari',
    os: 'iOS',
    referrer: 'https://linkedin.com',
    utmSource: 'linkedin',
    utmMedium: 'social',
    utmCampaign: 'smartstart_promo',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    id: 'sess_003',
    userId: null,
    startTime: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 0.3 * 60 * 60 * 1000).toISOString(),
    duration: 12 * 60 * 1000, // 12 minutes
    pageViews: 1,
    events: 1,
    conversions: 0,
    country: 'CA',
    city: 'Mississauga',
    deviceType: 'desktop',
    browser: 'Chrome',
    os: 'Windows',
    referrer: 'https://google.com/search?q=iso+27001+consultant+toronto',
    utmSource: 'google',
    utmMedium: 'organic',
    utmCampaign: null,
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
];

const sampleGoals = [
  {
    id: 'goal_001',
    name: 'SmartStart Signup',
    slug: 'smartstart_signup',
    description: 'User signs up for SmartStart membership',
    type: 'conversion',
    value: 98.80,
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'goal_002',
    name: 'Contact Form Submission',
    slug: 'contact_form',
    description: 'User submits contact form',
    type: 'conversion',
    value: 0,
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'goal_003',
    name: 'ISO Studio Demo',
    slug: 'iso_demo',
    description: 'User requests ISO Studio demo',
    type: 'conversion',
    value: 0,
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write sample data
fs.writeFileSync(
  path.join(dataDir, 'analytics_events.json'),
  JSON.stringify(sampleEvents, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'analytics_sessions.json'),
  JSON.stringify(sampleSessions, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'analytics_goals.json'),
  JSON.stringify(sampleGoals, null, 2)
);

console.log('✅ Test data generated successfully!');
console.log(`📊 Events: ${sampleEvents.length}`);
console.log(`👥 Sessions: ${sampleSessions.length}`);
console.log(`🎯 Goals: ${sampleGoals.length}`);
console.log(`📁 Data directory: ${dataDir}`);
