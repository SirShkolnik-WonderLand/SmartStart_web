/**
 * DRIZZLE ORM SCHEMA
 * Type-safe database models matching PostgreSQL schema
 */

import {
  pgTable,
  serial,
  bigserial,
  varchar,
  text,
  integer,
  bigint,
  decimal,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ANALYTICS EVENTS
// ============================================================================

export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    createdAt: timestamp('created_at').defaultNow().notNull(),

    // Event info
    eventType: varchar('event_type', { length: 50 }).notNull(),
    eventName: varchar('event_name', { length: 100 }),
    eventValue: decimal('event_value', { precision: 10, scale: 2 }),
    eventCategory: varchar('event_category', { length: 50 }),

    // Page info
    pageUrl: text('page_url').notNull(),
    pageTitle: varchar('page_title', { length: 255 }),
    pagePath: varchar('page_path', { length: 500 }),
    pageReferrer: text('page_referrer'),
    pageQueryParams: jsonb('page_query_params'),

    // Session & Visitor
    sessionId: varchar('session_id', { length: 64 }).notNull(),
    visitorId: varchar('visitor_id', { length: 64 }),
    isNewVisitor: boolean('is_new_visitor').default(true),
    isReturning: boolean('is_returning').default(false),

    // UTM
    utmSource: varchar('utm_source', { length: 100 }),
    utmMedium: varchar('utm_medium', { length: 100 }),
    utmCampaign: varchar('utm_campaign', { length: 100 }),
    utmTerm: varchar('utm_term', { length: 100 }),
    utmContent: varchar('utm_content', { length: 100 }),

    // Device
    deviceType: varchar('device_type', { length: 20 }),
    deviceVendor: varchar('device_vendor', { length: 50 }),
    deviceModel: varchar('device_model', { length: 50 }),
    browser: varchar('browser', { length: 50 }),
    browserVersion: varchar('browser_version', { length: 20 }),
    browserEngine: varchar('browser_engine', { length: 50 }),
    os: varchar('os', { length: 50 }),
    osVersion: varchar('os_version', { length: 20 }),
    screenWidth: integer('screen_width'),
    screenHeight: integer('screen_height'),
    viewportWidth: integer('viewport_width'),
    viewportHeight: integer('viewport_height'),
    pixelRatio: decimal('pixel_ratio', { precision: 3, scale: 2 }),

    // Location
    ipHash: varchar('ip_hash', { length: 64 }),
    countryCode: varchar('country_code', { length: 2 }),
    countryName: varchar('country_name', { length: 100 }),
    region: varchar('region', { length: 100 }),
    city: varchar('city', { length: 100 }),
    timezone: varchar('timezone', { length: 50 }),
    language: varchar('language', { length: 10 }),

    // Engagement
    timeOnPage: integer('time_on_page'),
    scrollDepth: integer('scroll_depth'),
    maxScroll: integer('max_scroll'),
    clicksOnPage: integer('clicks_on_page').default(0),

    // Custom properties
    properties: jsonb('properties'),

    // Performance
    pageLoadTime: integer('page_load_time'),
    domInteractive: integer('dom_interactive'),
    domComplete: integer('dom_complete'),
  },
  (table) => ({
    createdAtIdx: index('idx_events_created_at').on(table.createdAt),
    eventTypeIdx: index('idx_events_event_type').on(table.eventType),
    sessionIdIdx: index('idx_events_session_id').on(table.sessionId),
    visitorIdIdx: index('idx_events_visitor_id').on(table.visitorId),
    utmSourceIdx: index('idx_events_utm_source').on(table.utmSource),
    deviceTypeIdx: index('idx_events_device_type').on(table.deviceType),
    countryIdx: index('idx_events_country').on(table.countryCode),
  })
);

// ============================================================================
// SESSIONS
// ============================================================================

export const analyticsSessions = pgTable(
  'analytics_sessions',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    sessionId: varchar('session_id', { length: 64 }).notNull().unique(),
    visitorId: varchar('visitor_id', { length: 64 }),

    // Timing
    firstSeen: timestamp('first_seen').notNull(),
    lastSeen: timestamp('last_seen').notNull(),
    sessionDuration: integer('session_duration').default(0),

    // Pages
    entryPage: text('entry_page'),
    entryPageTitle: varchar('entry_page_title', { length: 255 }),
    exitPage: text('exit_page'),
    exitPageTitle: varchar('exit_page_title', { length: 255 }),
    pageViews: integer('page_views').default(0),
    uniquePagesViewed: integer('unique_pages_viewed').default(0),

    // Engagement
    totalClicks: integer('total_clicks').default(0),
    totalScroll: decimal('total_scroll', { precision: 5, scale: 2 }).default('0'),
    engaged: boolean('engaged').default(false),
    bounced: boolean('bounced').default(false),

    // Conversion
    converted: boolean('converted').default(false),
    conversionType: varchar('conversion_type', { length: 50 }),
    conversionGoalId: integer('conversion_goal_id'),
    conversionValue: decimal('conversion_value', { precision: 10, scale: 2 }),
    conversionAt: timestamp('conversion_at'),

    // Source
    referrer: text('referrer'),
    referrerDomain: varchar('referrer_domain', { length: 255 }),
    utmSource: varchar('utm_source', { length: 100 }),
    utmMedium: varchar('utm_medium', { length: 100 }),
    utmCampaign: varchar('utm_campaign', { length: 100 }),
    utmTerm: varchar('utm_term', { length: 100 }),
    utmContent: varchar('utm_content', { length: 100 }),

    // Device
    deviceType: varchar('device_type', { length: 20 }),
    browser: varchar('browser', { length: 50 }),
    os: varchar('os', { length: 50 }),

    // Location
    countryCode: varchar('country_code', { length: 2 }),
    countryName: varchar('country_name', { length: 100 }),
    city: varchar('city', { length: 100 }),

    // Metadata
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    sessionIdIdx: index('idx_sessions_session_id').on(table.sessionId),
    visitorIdIdx: index('idx_sessions_visitor_id').on(table.visitorId),
    firstSeenIdx: index('idx_sessions_first_seen').on(table.firstSeen),
    convertedIdx: index('idx_sessions_converted').on(table.converted),
    utmSourceIdx: index('idx_sessions_utm_source').on(table.utmSource),
  })
);

// ============================================================================
// CONVERSION GOALS
// ============================================================================

export const analyticsGoals = pgTable('analytics_goals', {
  id: serial('id').primaryKey(),
  goalName: varchar('goal_name', { length: 100 }).notNull().unique(),
  goalSlug: varchar('goal_slug', { length: 100 }).notNull().unique(),
  goalDescription: text('goal_description'),

  // Configuration
  goalType: varchar('goal_type', { length: 50 }).notNull(),
  goalTrigger: text('goal_trigger').notNull(),
  goalValue: decimal('goal_value', { precision: 10, scale: 2 }).default('0'),

  // Statistics
  totalConversions: integer('total_conversions').default(0),
  totalValue: decimal('total_value', { precision: 12, scale: 2 }).default('0'),
  lastConversion: timestamp('last_conversion'),

  // Status
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// PAGE ANALYTICS
// ============================================================================

export const analyticsPages = pgTable(
  'analytics_pages',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    date: date('date').notNull(),
    pageUrl: text('page_url').notNull(),
    pageTitle: varchar('page_title', { length: 255 }),
    pagePath: varchar('page_path', { length: 500 }),

    // Traffic
    views: integer('views').default(0),
    uniqueVisitors: integer('unique_visitors').default(0),
    uniqueSessions: integer('unique_sessions').default(0),

    // Engagement
    avgTimeOnPage: integer('avg_time_on_page').default(0),
    avgScrollDepth: decimal('avg_scroll_depth', { precision: 5, scale: 2 }).default('0'),
    totalClicks: integer('total_clicks').default(0),

    // Bounce & Exit
    bounces: integer('bounces').default(0),
    bounceRate: decimal('bounce_rate', { precision: 5, scale: 2 }).default('0'),
    exits: integer('exits').default(0),
    exitRate: decimal('exit_rate', { precision: 5, scale: 2 }).default('0'),

    // Conversions
    conversions: integer('conversions').default(0),
    conversionRate: decimal('conversion_rate', { precision: 5, scale: 2 }).default('0'),
    conversionValue: decimal('conversion_value', { precision: 12, scale: 2 }).default('0'),

    // Sources
    organicViews: integer('organic_views').default(0),
    directViews: integer('direct_views').default(0),
    referralViews: integer('referral_views').default(0),
    socialViews: integer('social_views').default(0),

    // Performance
    avgLoadTime: integer('avg_load_time').default(0),

    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    dateIdx: index('idx_pages_date').on(table.date),
    viewsIdx: index('idx_pages_views').on(table.views),
    uniquePageDateIdx: uniqueIndex('unique_page_date').on(table.date, table.pageUrl),
  })
);

// ============================================================================
// TRAFFIC SOURCES
// ============================================================================

export const analyticsSources = pgTable(
  'analytics_sources',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    date: date('date').notNull(),

    // Source
    sourceType: varchar('source_type', { length: 50 }).notNull(),
    sourceName: varchar('source_name', { length: 255 }),
    sourceMedium: varchar('source_medium', { length: 100 }),
    referrerDomain: varchar('referrer_domain', { length: 255 }),

    // Campaign
    utmCampaign: varchar('utm_campaign', { length: 100 }),
    utmContent: varchar('utm_content', { length: 100 }),
    utmTerm: varchar('utm_term', { length: 100 }),

    // Metrics
    visitors: integer('visitors').default(0),
    sessions: integer('sessions').default(0),
    pageViews: integer('page_views').default(0),
    bounces: integer('bounces').default(0),
    bounceRate: decimal('bounce_rate', { precision: 5, scale: 2 }).default('0'),

    // Engagement
    avgSessionDuration: integer('avg_session_duration').default(0),
    avgPagesPerSession: decimal('avg_pages_per_session', { precision: 5, scale: 2 }).default('0'),

    // Conversions
    conversions: integer('conversions').default(0),
    conversionRate: decimal('conversion_rate', { precision: 5, scale: 2 }).default('0'),
    conversionValue: decimal('conversion_value', { precision: 12, scale: 2 }).default('0'),

    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    dateIdx: index('idx_sources_date').on(table.date),
    typeIdx: index('idx_sources_type').on(table.sourceType),
    visitorsIdx: index('idx_sources_visitors').on(table.visitors),
  })
);

// ============================================================================
// SEO METRICS
// ============================================================================

export const seoMetrics = pgTable('seo_metrics', {
  id: serial('id').primaryKey(),
  date: date('date').notNull().unique(),

  // Google Search Console
  totalClicks: integer('total_clicks').default(0),
  totalImpressions: bigint('total_impressions', { mode: 'number' }).default(0),
  avgCtr: decimal('avg_ctr', { precision: 5, scale: 2 }).default('0'),
  avgPosition: decimal('avg_position', { precision: 5, scale: 2 }).default('0'),

  // Keywords & Pages
  topKeywords: jsonb('top_keywords'),
  topPages: jsonb('top_pages'),

  // Backlinks
  totalBacklinks: integer('total_backlinks').default(0),
  referringDomains: integer('referring_domains').default(0),
  newBacklinks: integer('new_backlinks').default(0),
  lostBacklinks: integer('lost_backlinks').default(0),

  // Core Web Vitals
  lcpScore: decimal('lcp_score', { precision: 5, scale: 2 }),
  inpScore: decimal('inp_score', { precision: 5, scale: 2 }),
  clsScore: decimal('cls_score', { precision: 5, scale: 4 }),
  fcpScore: decimal('fcp_score', { precision: 5, scale: 2 }),
  ttfbScore: decimal('ttfb_score', { precision: 5, scale: 2 }),

  // Page Speed
  mobilePerformanceScore: integer('mobile_performance_score'),
  desktopPerformanceScore: integer('desktop_performance_score'),
  mobileAccessibilityScore: integer('mobile_accessibility_score'),
  desktopAccessibilityScore: integer('desktop_accessibility_score'),

  // Indexing
  indexedPages: integer('indexed_pages').default(0),
  crawlErrors: integer('crawl_errors').default(0),

  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// SYSTEM HEALTH
// ============================================================================

export const systemHealth = pgTable('system_health', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  checkedAt: timestamp('checked_at').defaultNow(),

  // Uptime
  isUp: boolean('is_up').default(true),
  statusCode: integer('status_code'),
  responseTime: integer('response_time'),

  // Errors
  errorCount: integer('error_count').default(0),
  errorRate: decimal('error_rate', { precision: 5, scale: 2 }).default('0'),
  errorDetails: jsonb('error_details'),

  // Security
  blockedIps: integer('blocked_ips').default(0),
  suspiciousRequests: integer('suspicious_requests').default(0),
  rateLimitHits: integer('rate_limit_hits').default(0),

  // Performance
  cpuUsage: decimal('cpu_usage', { precision: 5, scale: 2 }),
  memoryUsage: decimal('memory_usage', { precision: 5, scale: 2 }),
  diskUsage: decimal('disk_usage', { precision: 5, scale: 2 }),

  // Analytics Stats
  eventsToday: integer('events_today').default(0),
  sessionsToday: integer('sessions_today').default(0),
  activeVisitors: integer('active_visitors').default(0),

  // Metadata
  serverLocation: varchar('server_location', { length: 50 }),
  serverVersion: varchar('server_version', { length: 20 }),
});

// ============================================================================
// ADMIN USERS
// ============================================================================

export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }),
  role: varchar('role', { length: 20 }).default('admin'),

  // Permissions
  canExport: boolean('can_export').default(true),
  canEditGoals: boolean('can_edit_goals').default(true),
  canManageUsers: boolean('can_manage_users').default(false),

  // Activity
  lastLogin: timestamp('last_login'),
  lastLoginIp: varchar('last_login_ip', { length: 45 }),
  loginCount: integer('login_count').default(0),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),

  // Status
  active: boolean('active').default(true),
  emailVerified: boolean('email_verified').default(false),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorSecret: varchar('two_factor_secret', { length: 255 }),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// EMAIL REPORTS
// ============================================================================

export const emailReports = pgTable('email_reports', {
  id: serial('id').primaryKey(),
  reportType: varchar('report_type', { length: 50 }).notNull(),
  reportPeriodStart: date('report_period_start').notNull(),
  reportPeriodEnd: date('report_period_end').notNull(),

  // Recipients
  sentTo: varchar('sent_to', { length: 255 }).notNull(),
  sentByUserId: integer('sent_by_user_id'),

  // Content
  subject: varchar('subject', { length: 255 }),
  reportData: jsonb('report_data'),

  // Status
  sentAt: timestamp('sent_at').defaultNow(),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),

  // Metadata
  fileUrl: text('file_url'),
  fileSize: integer('file_size'),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const sessionsRelations = relations(analyticsSessions, ({ many }) => ({
  events: many(analyticsEvents),
}));

export const eventsRelations = relations(analyticsEvents, ({ one }) => ({
  session: one(analyticsSessions, {
    fields: [analyticsEvents.sessionId],
    references: [analyticsSessions.sessionId],
  }),
}));

export const goalsRelations = relations(analyticsGoals, ({ many }) => ({
  conversions: many(analyticsSessions),
}));

// ============================================================================
// EXPORT SCHEMA
// ============================================================================

export const schema = {
  analyticsEvents,
  analyticsSessions,
  analyticsGoals,
  analyticsPages,
  analyticsSources,
  seoMetrics,
  systemHealth,
  adminUsers,
  emailReports,
  sessionsRelations,
  eventsRelations,
  goalsRelations,
};
