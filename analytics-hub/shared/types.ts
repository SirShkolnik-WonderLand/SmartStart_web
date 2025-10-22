/**
 * SHARED TYPES - Analytics Hub
 * Used by both server and client for type safety
 */

// ============================================================================
// ANALYTICS EVENTS
// ============================================================================

export type EventType =
  | 'page_view'
  | 'click'
  | 'form_start'
  | 'form_submit'
  | 'scroll'
  | 'conversion'
  | 'download'
  | 'video_play'
  | 'video_complete'
  | 'custom';

export type EventCategory = 'engagement' | 'conversion' | 'navigation' | 'interaction';

export interface AnalyticsEvent {
  id?: string;
  createdAt?: Date;
  
  // Event info
  eventType: EventType;
  eventName?: string;
  eventValue?: number;
  eventCategory?: EventCategory;
  
  // Page info
  pageUrl: string;
  pageTitle?: string;
  pagePath?: string;
  pageReferrer?: string;
  pageQueryParams?: Record<string, string>;
  
  // Session
  sessionId: string;
  visitorId?: string;
  isNewVisitor?: boolean;
  isReturning?: boolean;
  
  // UTM
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  
  // Device
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  deviceVendor?: string;
  deviceModel?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  screenWidth?: number;
  screenHeight?: number;
  
  // Location
  countryCode?: string;
  countryName?: string;
  city?: string;
  timezone?: string;
  language?: string;
  
  // Engagement
  timeOnPage?: number;
  scrollDepth?: number;
  clicksOnPage?: number;
  
  // Custom properties
  properties?: Record<string, any>;
  
  // Performance
  pageLoadTime?: number;
  domInteractive?: number;
  domComplete?: number;
}

// ============================================================================
// SESSIONS
// ============================================================================

export interface AnalyticsSession {
  id?: string;
  sessionId: string;
  visitorId?: string;
  
  firstSeen: Date;
  lastSeen: Date;
  sessionDuration: number;
  
  entryPage?: string;
  entryPageTitle?: string;
  exitPage?: string;
  exitPageTitle?: string;
  pageViews: number;
  uniquePagesViewed: number;
  
  totalClicks: number;
  totalScroll: number;
  engaged: boolean;
  bounced: boolean;
  
  converted: boolean;
  conversionType?: string;
  conversionValue?: number;
  conversionAt?: Date;
  
  referrer?: string;
  referrerDomain?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  
  deviceType?: string;
  browser?: string;
  os?: string;
  countryCode?: string;
  city?: string;
}

// ============================================================================
// CONVERSION GOALS
// ============================================================================

export type GoalType = 'event' | 'page_view' | 'form_submit' | 'time_on_page' | 'scroll_depth';

export interface ConversionGoal {
  id?: number;
  goalName: string;
  goalSlug: string;
  goalDescription?: string;
  goalType: GoalType;
  goalTrigger: string;
  goalValue: number;
  totalConversions: number;
  totalValue: number;
  lastConversion?: Date;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export interface DashboardStats {
  // Overview
  totalVisitors: number;
  totalSessions: number;
  totalPageViews: number;
  totalConversions: number;
  
  // Comparisons (vs previous period)
  visitorsChange: number;        // percentage
  sessionsChange: number;
  pageViewsChange: number;
  conversionsChange: number;
  
  // Engagement
  avgSessionDuration: number;    // seconds
  avgPagesPerSession: number;
  bounceRate: number;            // percentage
  conversionRate: number;        // percentage
  
  // Current
  activeVisitors: number;
  activePages: string[];
}

export interface RealtimeStats {
  activeVisitors: number;
  activeSessions: number;
  activePages: { url: string; title?: string; count: number }[];
  recentEvents: AnalyticsEvent[];
  topCountries: { code: string; name: string; count: number }[];
  topDevices: { type: string; count: number }[];
}

export interface PageStats {
  url: string;
  title?: string;
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  exitRate: number;
  conversions: number;
  conversionRate: number;
}

export interface SourceStats {
  sourceType: string;
  sourceName: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  conversionRate: number;
  conversionValue: number;
}

export interface DeviceStats {
  deviceType: string;
  count: number;
  percentage: number;
  bounceRate: number;
  conversionRate: number;
}

export interface LocationStats {
  countryCode: string;
  countryName: string;
  city?: string;
  visitors: number;
  sessions: number;
  conversions: number;
  percentage: number;
}

// ============================================================================
// SEO METRICS
// ============================================================================

export interface SEOMetrics {
  date: Date;
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
  topKeywords: KeywordMetric[];
  topPages: PageMetric[];
  totalBacklinks: number;
  referringDomains: number;
  coreWebVitals: {
    lcp: number;
    inp: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  pageSpeed: {
    mobile: number;
    desktop: number;
  };
}

export interface KeywordMetric {
  keyword: string;
  position: number;
  clicks: number;
  impressions: number;
  ctr: number;
  change: number;  // position change
}

export interface PageMetric {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

// ============================================================================
// SYSTEM HEALTH
// ============================================================================

export interface SystemHealth {
  id?: string;
  checkedAt: Date;
  isUp: boolean;
  statusCode?: number;
  responseTime: number;
  errorCount: number;
  errorRate: number;
  errorDetails?: any;
  blockedIps: number;
  suspiciousRequests: number;
  rateLimitHits: number;
  cpuUsage?: number;
  memoryUsage?: number;
  eventsToday: number;
  sessionsToday: number;
  activeVisitors: number;
}

// ============================================================================
// ADMIN USERS
// ============================================================================

export type UserRole = 'admin' | 'viewer' | 'analyst';

export interface AdminUser {
  id?: number;
  email: string;
  name?: string;
  role: UserRole;
  canExport: boolean;
  canEditGoals: boolean;
  canManageUsers: boolean;
  lastLogin?: Date;
  lastLoginIp?: string;
  loginCount: number;
  active: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// API REQUESTS & RESPONSES
// ============================================================================

// Event Tracking Request
export interface TrackEventRequest {
  event: Omit<AnalyticsEvent, 'id' | 'createdAt'>;
  timestamp?: string;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: Omit<AdminUser, 'password'>;
  message?: string;
}

// Dashboard API Response
export interface DashboardResponse {
  success: boolean;
  data?: DashboardStats;
  error?: string;
}

export interface RealtimeResponse {
  success: boolean;
  data?: RealtimeStats;
  error?: string;
}

export interface PagesResponse {
  success: boolean;
  data?: PageStats[];
  total?: number;
  page?: number;
  pageSize?: number;
  error?: string;
}

export interface SourcesResponse {
  success: boolean;
  data?: SourceStats[];
  total?: number;
  error?: string;
}

// Date Range for queries
export interface DateRange {
  startDate: string;  // ISO string
  endDate: string;    // ISO string
  compare?: boolean;  // Compare with previous period
}

// Chart Data
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

// Funnel Data
export interface FunnelStep {
  name: string;
  value: number;
  percentage: number;
  dropOff?: number;
  dropOffPercentage?: number;
}

// Export Options
export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  dateRange: DateRange;
  include: {
    events?: boolean;
    sessions?: boolean;
    pages?: boolean;
    sources?: boolean;
    seo?: boolean;
  };
}

// ============================================================================
// WEBSOCKET EVENTS (for real-time updates)
// ============================================================================

export type WebSocketEvent =
  | 'visitor:new'
  | 'visitor:active'
  | 'visitor:left'
  | 'conversion:new'
  | 'page:view'
  | 'stats:update';

export interface WebSocketMessage {
  event: WebSocketEvent;
  data: any;
  timestamp: string;
}

// ============================================================================
// FILTERS & QUERY OPTIONS
// ============================================================================

export interface AnalyticsFilter {
  dateRange?: DateRange;
  page?: string;
  source?: string;
  deviceType?: string;
  browser?: string;
  country?: string;
  city?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  converted?: boolean;
}

export interface QueryOptions {
  filter?: AnalyticsFilter;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  groupBy?: string;
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isApiError(response: any): response is ApiError {
  return response && response.success === false && typeof response.error === 'string';
}

export function isValidEventType(type: string): type is EventType {
  return ['page_view', 'click', 'form_start', 'form_submit', 'scroll', 'conversion', 'download', 'video_play', 'video_complete', 'custom'].includes(type);
}

export function isValidGoalType(type: string): type is GoalType {
  return ['event', 'page_view', 'form_submit', 'time_on_page', 'scroll_depth'].includes(type);
}

export function isValidUserRole(role: string): role is UserRole {
  return ['admin', 'viewer', 'analyst'].includes(role);
}
