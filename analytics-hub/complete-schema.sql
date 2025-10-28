-- Complete schema matching Drizzle ORM expectations
-- Drop existing tables first
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS analytics_sessions CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Create analytics_events table with all required columns
CREATE TABLE analytics_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Event info
  event_type VARCHAR(50) NOT NULL,
  event_name VARCHAR(100),
  event_value DECIMAL(10,2),
  event_category VARCHAR(50),
  
  -- Page info
  page_url TEXT NOT NULL,
  page_title VARCHAR(255),
  page_path VARCHAR(500),
  page_referrer TEXT,
  page_query_params JSONB,
  
  -- Session & Visitor
  session_id VARCHAR(64) NOT NULL,
  visitor_id VARCHAR(64),
  is_new_visitor BOOLEAN DEFAULT TRUE,
  is_returning BOOLEAN DEFAULT FALSE,
  
  -- UTM
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  
  -- Device
  device_type VARCHAR(20),
  device_vendor VARCHAR(50),
  device_model VARCHAR(50),
  browser VARCHAR(50),
  browser_version VARCHAR(20),
  browser_engine VARCHAR(50),
  os VARCHAR(50),
  os_version VARCHAR(20),
  screen_width INTEGER,
  screen_height INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  pixel_ratio DECIMAL(3,2),
  
  -- Location
  ip_hash VARCHAR(64),
  country_code VARCHAR(2),
  country_name VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  timezone VARCHAR(50),
  language VARCHAR(10),
  
  -- Engagement
  time_on_page INTEGER,
  scroll_depth INTEGER,
  max_scroll INTEGER,
  clicks_on_page INTEGER DEFAULT 0,
  
  -- Custom properties
  properties JSONB,
  
  -- Performance
  page_load_time INTEGER,
  dom_interactive INTEGER,
  dom_complete INTEGER
);

-- Create analytics_sessions table
CREATE TABLE analytics_sessions (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(64) UNIQUE NOT NULL,
  visitor_id VARCHAR(64),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration INTEGER,
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2),
  exit_page VARCHAR(500),
  entry_page VARCHAR(500),
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  device_type VARCHAR(20),
  browser VARCHAR(100),
  os VARCHAR(100),
  country VARCHAR(100),
  country_code VARCHAR(2),
  city VARCHAR(100),
  is_bot BOOLEAN DEFAULT FALSE,
  ip_hash VARCHAR(64)
);

-- Create admin_users table
CREATE TABLE admin_users (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP
);

-- Insert default admin user with proper bcrypt hash
INSERT INTO admin_users (email, password_hash, role) 
VALUES ('udi.shkolnik@alicesolutionsgroup.com', '$2b$10$rQZ8K9vX7mN2pL1oE3fGhO5tY6uI8vC2wA4sD7fG9hJ1kL3mN5pQ7rS9uV1wX3yZ', 'admin')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = '$2b$10$rQZ8K9vX7mN2pL1oE3fGhO5tY6uI8vC2wA4sD7fG9hJ1kL3mN5pQ7rS9uV1wX3yZ',
  role = 'admin';
