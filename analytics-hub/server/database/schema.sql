-- ============================================================================
-- ANALYTICS HUB - DATABASE SCHEMA
-- Self-hosted analytics for AliceSolutions
-- ============================================================================

-- Drop existing tables (for clean setup)
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS analytics_sessions CASCADE;
DROP TABLE IF EXISTS analytics_goals CASCADE;
DROP TABLE IF EXISTS analytics_pages CASCADE;
DROP TABLE IF EXISTS analytics_sources CASCADE;
DROP TABLE IF EXISTS seo_metrics CASCADE;
DROP TABLE IF EXISTS system_health CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS email_reports CASCADE;

-- ============================================================================
-- CORE ANALYTICS TABLES
-- ============================================================================

-- Analytics Events: Every user interaction
CREATE TABLE analytics_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Event Information
  event_type VARCHAR(50) NOT NULL,          -- page_view, click, form_submit, scroll, etc.
  event_name VARCHAR(100),                  -- button_name, form_name, link_text
  event_value DECIMAL(10,2),                -- monetary value (for conversions)
  event_category VARCHAR(50),               -- engagement, conversion, navigation
  
  -- Page Information
  page_url TEXT NOT NULL,
  page_title VARCHAR(255),
  page_path VARCHAR(500),
  page_referrer TEXT,
  page_query_params JSONB,
  
  -- Session & Visitor
  session_id VARCHAR(64) NOT NULL,          -- Anonymous session identifier
  visitor_id VARCHAR(64),                   -- Persistent visitor (hashed fingerprint)
  is_new_visitor BOOLEAN DEFAULT TRUE,
  is_returning BOOLEAN DEFAULT FALSE,
  
  -- UTM Campaign Tracking
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  
  -- Device & Browser
  device_type VARCHAR(20),                  -- mobile, desktop, tablet
  device_vendor VARCHAR(50),
  device_model VARCHAR(50),
  browser VARCHAR(50),
  browser_version VARCHAR(20),
  browser_engine VARCHAR(50),
  os VARCHAR(50),
  os_version VARCHAR(20),
  screen_width INT,
  screen_height INT,
  viewport_width INT,
  viewport_height INT,
  pixel_ratio DECIMAL(3,2),
  
  -- Location (Privacy-Safe - City Level Only)
  ip_hash VARCHAR(64),                      -- Hashed IP for privacy
  country_code VARCHAR(2),
  country_name VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  timezone VARCHAR(50),
  language VARCHAR(10),
  
  -- Engagement Metrics
  time_on_page INT,                         -- seconds
  scroll_depth INT,                         -- percentage (0-100)
  max_scroll INT,                           -- max scroll reached
  clicks_on_page INT DEFAULT 0,
  
  -- Custom Properties (Flexible)
  properties JSONB,
  
  -- Performance Metrics
  page_load_time INT,                       -- milliseconds
  dom_interactive INT,
  dom_complete INT
);

CREATE INDEX idx_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_events_visitor_id ON analytics_events(visitor_id);
CREATE INDEX idx_events_page_url ON analytics_events USING HASH(page_url);
CREATE INDEX idx_events_utm_source ON analytics_events(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX idx_events_device_type ON analytics_events(device_type);
CREATE INDEX idx_events_country ON analytics_events(country_code) WHERE country_code IS NOT NULL;

-- ============================================================================
-- SESSIONS: Visitor sessions aggregated
-- ============================================================================

CREATE TABLE analytics_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id VARCHAR(64) UNIQUE NOT NULL,
  visitor_id VARCHAR(64),
  
  -- Session Timing
  first_seen TIMESTAMP NOT NULL,
  last_seen TIMESTAMP NOT NULL,
  session_duration INT DEFAULT 0,           -- seconds
  
  -- Pages
  entry_page TEXT,
  entry_page_title VARCHAR(255),
  exit_page TEXT,
  exit_page_title VARCHAR(255),
  page_views INT DEFAULT 0,
  unique_pages_viewed INT DEFAULT 0,
  
  -- Engagement
  total_clicks INT DEFAULT 0,
  total_scroll DECIMAL(5,2) DEFAULT 0,      -- average scroll depth
  engaged BOOLEAN DEFAULT FALSE,            -- >30s or >2 pages
  bounced BOOLEAN DEFAULT FALSE,            -- single page, <10s
  
  -- Conversion
  converted BOOLEAN DEFAULT FALSE,
  conversion_type VARCHAR(50),
  conversion_goal_id INT,
  conversion_value DECIMAL(10,2),
  conversion_at TIMESTAMP,
  
  -- Source Attribution
  referrer TEXT,
  referrer_domain VARCHAR(255),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  
  -- Device Info
  device_type VARCHAR(20),
  browser VARCHAR(50),
  os VARCHAR(50),
  
  -- Location
  country_code VARCHAR(2),
  country_name VARCHAR(100),
  city VARCHAR(100),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX idx_sessions_visitor_id ON analytics_sessions(visitor_id);
CREATE INDEX idx_sessions_first_seen ON analytics_sessions(first_seen DESC);
CREATE INDEX idx_sessions_converted ON analytics_sessions(converted) WHERE converted = TRUE;
CREATE INDEX idx_sessions_utm_source ON analytics_sessions(utm_source) WHERE utm_source IS NOT NULL;

-- ============================================================================
-- CONVERSION GOALS: Track what matters
-- ============================================================================

CREATE TABLE analytics_goals (
  id SERIAL PRIMARY KEY,
  goal_name VARCHAR(100) UNIQUE NOT NULL,
  goal_slug VARCHAR(100) UNIQUE NOT NULL,
  goal_description TEXT,
  
  -- Goal Configuration
  goal_type VARCHAR(50) NOT NULL,           -- event, page_view, form_submit, time_on_page
  goal_trigger TEXT NOT NULL,               -- URL pattern, event name, or condition
  goal_value DECIMAL(10,2) DEFAULT 0,       -- monetary value
  
  -- Statistics
  total_conversions INT DEFAULT 0,
  total_value DECIMAL(12,2) DEFAULT 0,
  last_conversion TIMESTAMP,
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goals_active ON analytics_goals(active) WHERE active = TRUE;
CREATE INDEX idx_goals_slug ON analytics_goals(goal_slug);

-- ============================================================================
-- PAGE ANALYTICS: Daily aggregates per page
-- ============================================================================

CREATE TABLE analytics_pages (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  page_url TEXT NOT NULL,
  page_title VARCHAR(255),
  page_path VARCHAR(500),
  
  -- Traffic Metrics
  views INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,
  unique_sessions INT DEFAULT 0,
  
  -- Engagement Metrics
  avg_time_on_page INT DEFAULT 0,           -- seconds
  avg_scroll_depth DECIMAL(5,2) DEFAULT 0,  -- percentage
  total_clicks INT DEFAULT 0,
  
  -- Bounce & Exit
  bounces INT DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,       -- percentage
  exits INT DEFAULT 0,
  exit_rate DECIMAL(5,2) DEFAULT 0,         -- percentage
  
  -- Conversions
  conversions INT DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,   -- percentage
  conversion_value DECIMAL(12,2) DEFAULT 0,
  
  -- Sources
  organic_views INT DEFAULT 0,
  direct_views INT DEFAULT 0,
  referral_views INT DEFAULT 0,
  social_views INT DEFAULT 0,
  
  -- Performance
  avg_load_time INT DEFAULT 0,              -- milliseconds
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(date, page_url)
);

CREATE INDEX idx_pages_date ON analytics_pages(date DESC);
CREATE INDEX idx_pages_url ON analytics_pages USING HASH(page_url);
CREATE INDEX idx_pages_views ON analytics_pages(views DESC);

-- ============================================================================
-- TRAFFIC SOURCES: Daily aggregates by source
-- ============================================================================

CREATE TABLE analytics_sources (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  
  -- Source Classification
  source_type VARCHAR(50) NOT NULL,         -- organic, direct, referral, social, email, paid
  source_name VARCHAR(255),                 -- google, facebook, email-campaign-1
  source_medium VARCHAR(100),
  referrer_domain VARCHAR(255),
  
  -- Campaign Tracking
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  utm_term VARCHAR(100),
  
  -- Metrics
  visitors INT DEFAULT 0,
  sessions INT DEFAULT 0,
  page_views INT DEFAULT 0,
  bounces INT DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Engagement
  avg_session_duration INT DEFAULT 0,
  avg_pages_per_session DECIMAL(5,2) DEFAULT 0,
  
  -- Conversions
  conversions INT DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  conversion_value DECIMAL(12,2) DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(date, source_type, source_name, utm_campaign)
);

CREATE INDEX idx_sources_date ON analytics_sources(date DESC);
CREATE INDEX idx_sources_type ON analytics_sources(source_type);
CREATE INDEX idx_sources_visitors ON analytics_sources(visitors DESC);

-- ============================================================================
-- SEO METRICS: Daily SEO health snapshots
-- ============================================================================

CREATE TABLE seo_metrics (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  
  -- Google Search Console Data
  total_clicks INT DEFAULT 0,
  total_impressions BIGINT DEFAULT 0,
  avg_ctr DECIMAL(5,2) DEFAULT 0,           -- percentage
  avg_position DECIMAL(5,2) DEFAULT 0,
  
  -- Top Keywords (top 20)
  top_keywords JSONB,                       -- [{keyword, position, clicks, impressions}]
  
  -- Top Pages (top 20)
  top_pages JSONB,                          -- [{url, clicks, impressions, ctr}]
  
  -- Backlinks (if tracking)
  total_backlinks INT DEFAULT 0,
  referring_domains INT DEFAULT 0,
  new_backlinks INT DEFAULT 0,
  lost_backlinks INT DEFAULT 0,
  
  -- Core Web Vitals
  lcp_score DECIMAL(5,2),                   -- Largest Contentful Paint (seconds)
  inp_score DECIMAL(5,2),                   -- Interaction to Next Paint (ms)
  cls_score DECIMAL(5,4),                   -- Cumulative Layout Shift
  fcp_score DECIMAL(5,2),                   -- First Contentful Paint (seconds)
  ttfb_score DECIMAL(5,2),                  -- Time to First Byte (seconds)
  
  -- Page Speed Scores
  mobile_performance_score INT,             -- 0-100
  desktop_performance_score INT,            -- 0-100
  mobile_accessibility_score INT,
  desktop_accessibility_score INT,
  
  -- Indexing
  indexed_pages INT DEFAULT 0,
  crawl_errors INT DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seo_date ON seo_metrics(date DESC);

-- ============================================================================
-- SYSTEM HEALTH: Uptime & performance monitoring
-- ============================================================================

CREATE TABLE system_health (
  id BIGSERIAL PRIMARY KEY,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Uptime
  is_up BOOLEAN DEFAULT TRUE,
  status_code INT,
  response_time INT,                        -- milliseconds
  
  -- Errors
  error_count INT DEFAULT 0,
  error_rate DECIMAL(5,2) DEFAULT 0,        -- percentage
  error_details JSONB,
  
  -- Security Events
  blocked_ips INT DEFAULT 0,
  suspicious_requests INT DEFAULT 0,
  rate_limit_hits INT DEFAULT 0,
  
  -- Performance
  cpu_usage DECIMAL(5,2),                   -- percentage
  memory_usage DECIMAL(5,2),                -- percentage
  disk_usage DECIMAL(5,2),                  -- percentage
  
  -- Analytics Stats
  events_today INT DEFAULT 0,
  sessions_today INT DEFAULT 0,
  active_visitors INT DEFAULT 0,
  
  -- Metadata
  server_location VARCHAR(50),
  server_version VARCHAR(20)
);

CREATE INDEX idx_health_checked_at ON system_health(checked_at DESC);
CREATE INDEX idx_health_is_up ON system_health(is_up);

-- ============================================================================
-- ADMIN USERS: Dashboard authentication
-- ============================================================================

CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin',         -- admin, viewer, analyst
  
  -- Permissions
  can_export BOOLEAN DEFAULT TRUE,
  can_edit_goals BOOLEAN DEFAULT TRUE,
  can_manage_users BOOLEAN DEFAULT FALSE,
  
  -- Activity
  last_login TIMESTAMP,
  last_login_ip VARCHAR(45),
  login_count INT DEFAULT 0,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_email ON admin_users(email);
CREATE INDEX idx_admin_active ON admin_users(active) WHERE active = TRUE;

-- ============================================================================
-- EMAIL REPORTS: Scheduled report history
-- ============================================================================

CREATE TABLE email_reports (
  id SERIAL PRIMARY KEY,
  report_type VARCHAR(50) NOT NULL,         -- daily, weekly, monthly, custom
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  
  -- Recipients
  sent_to VARCHAR(255) NOT NULL,
  sent_by_user_id INT REFERENCES admin_users(id),
  
  -- Content
  subject VARCHAR(255),
  report_data JSONB,                        -- Full report data
  
  -- Status
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  
  -- Metadata
  file_url TEXT,                            -- PDF attachment URL
  file_size INT                             -- bytes
);

CREATE INDEX idx_reports_sent_at ON email_reports(sent_at DESC);
CREATE INDEX idx_reports_type ON email_reports(report_type);

-- ============================================================================
-- VIEWS: Pre-calculated for dashboard
-- ============================================================================

-- Real-time Active Visitors (last 5 minutes)
CREATE OR REPLACE VIEW realtime_visitors AS
SELECT 
  COUNT(DISTINCT session_id) as active_visitors,
  COUNT(DISTINCT visitor_id) as unique_visitors,
  COUNT(*) as total_events,
  array_agg(DISTINCT page_url ORDER BY page_url) FILTER (WHERE page_url IS NOT NULL) as active_pages
FROM analytics_events
WHERE created_at > NOW() - INTERVAL '5 minutes';

-- Today's Stats
CREATE OR REPLACE VIEW today_stats AS
SELECT
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(DISTINCT visitor_id) as total_visitors,
  COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
  COUNT(*) FILTER (WHERE event_type = 'conversion') as conversions,
  ROUND(AVG(time_on_page) FILTER (WHERE time_on_page > 0), 0) as avg_session_duration,
  ROUND(AVG(scroll_depth) FILTER (WHERE scroll_depth > 0), 1) as avg_scroll_depth
FROM analytics_events
WHERE DATE(created_at) = CURRENT_DATE;

-- ============================================================================
-- FUNCTIONS: Useful database functions
-- ============================================================================

-- Function to clean old data (GDPR compliance - keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days';
  DELETE FROM analytics_sessions WHERE first_seen < NOW() - INTERVAL '90 days';
  DELETE FROM system_health WHERE checked_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to update session on new event
CREATE OR REPLACE FUNCTION update_session_on_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_sessions (
    session_id, visitor_id, first_seen, last_seen, page_views,
    entry_page, entry_page_title, device_type, browser, os,
    country_code, country_name, city,
    utm_source, utm_medium, utm_campaign,
    referrer, referrer_domain
  )
  VALUES (
    NEW.session_id, NEW.visitor_id, NEW.created_at, NEW.created_at, 1,
    NEW.page_url, NEW.page_title, NEW.device_type, NEW.browser, NEW.os,
    NEW.country_code, NEW.country_name, NEW.city,
    NEW.utm_source, NEW.utm_medium, NEW.utm_campaign,
    NEW.page_referrer, 
    CASE 
      WHEN NEW.page_referrer IS NOT NULL 
      THEN substring(NEW.page_referrer from 'https?://([^/]+)')
      ELSE NULL
    END
  )
  ON CONFLICT (session_id) DO UPDATE SET
    last_seen = NEW.created_at,
    page_views = analytics_sessions.page_views + 1,
    session_duration = EXTRACT(EPOCH FROM (NEW.created_at - analytics_sessions.first_seen))::INT,
    updated_at = NEW.created_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update sessions
CREATE TRIGGER trigger_update_session_on_event
AFTER INSERT ON analytics_events
FOR EACH ROW
WHEN (NEW.event_type = 'page_view')
EXECUTE FUNCTION update_session_on_event();

-- ============================================================================
-- SEED DATA: Create default admin user
-- ============================================================================

-- Default admin user (password: ChangeThisPassword123!)
-- Hash generated with bcrypt, rounds=10
INSERT INTO admin_users (email, password_hash, name, role, active)
VALUES (
  'udi.shkolnik@alicesolutionsgroup.com',
  '$2b$10$YourHashedPasswordHere',  -- Will be set by setup script
  'Udi Shkolnik',
  'admin',
  TRUE
);

-- Default conversion goals
INSERT INTO analytics_goals (goal_name, goal_slug, goal_description, goal_type, goal_trigger, goal_value, active)
VALUES
  ('Contact Form Submit', 'contact-form', 'User submitted the contact form', 'event', 'contact_form_submit', 100.00, TRUE),
  ('ISO Studio Demo Request', 'iso-demo', 'User requested ISO Studio demo', 'event', 'iso_demo_request', 250.00, TRUE),
  ('SmartStart Application', 'smartstart-apply', 'User applied to SmartStart program', 'event', 'smartstart_application', 500.00, TRUE),
  ('Newsletter Signup', 'newsletter', 'User signed up for newsletter', 'event', 'newsletter_signup', 10.00, TRUE),
  ('Book a Call', 'book-call', 'User clicked Book a Call button', 'event', 'book_call_click', 200.00, TRUE);

-- ============================================================================
-- INDEXES: Additional performance indexes
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX idx_events_date_type ON analytics_events(DATE(created_at), event_type);
CREATE INDEX idx_events_session_time ON analytics_events(session_id, created_at);
CREATE INDEX idx_sessions_date_converted ON analytics_sessions(DATE(first_seen), converted);

-- ============================================================================
-- GRANTS: Security permissions (adjust for your setup)
-- ============================================================================

-- If using specific user for app (recommended for production)
-- CREATE USER analytics_app WITH PASSWORD 'secure_password';
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO analytics_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO analytics_app;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Verify schema creation
SELECT 
  table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
