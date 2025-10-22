#!/usr/bin/env node

/**
 * INITIALIZE LOCAL DATABASE (SQLite)
 * Quick setup for local testing
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Initializing Analytics Hub local database...\n');

// Create database
const dbPath = join(__dirname, '..', 'analytics.db');
const db = new Database(dbPath);

console.log('📁 Database file:', dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// ============================================================================
// CREATE TABLES
// ============================================================================

console.log('\n📊 Creating tables...');

// Analytics Events
db.exec(`
  CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    event_type TEXT NOT NULL,
    event_name TEXT,
    event_value REAL,
    page_url TEXT NOT NULL,
    page_title TEXT,
    session_id TEXT NOT NULL,
    visitor_id TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    country_code TEXT,
    city TEXT,
    time_on_page INTEGER,
    scroll_depth INTEGER
  )
`);

db.exec(`CREATE INDEX IF NOT EXISTS idx_events_created_at ON analytics_events(created_at)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id)`);

console.log('✅ analytics_events table created');

// Analytics Sessions
db.exec(`
  CREATE TABLE IF NOT EXISTS analytics_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    visitor_id TEXT,
    first_seen DATETIME NOT NULL,
    last_seen DATETIME NOT NULL,
    session_duration INTEGER DEFAULT 0,
    entry_page TEXT,
    page_views INTEGER DEFAULT 0,
    converted INTEGER DEFAULT 0,
    device_type TEXT,
    browser TEXT,
    country_code TEXT,
    city TEXT,
    utm_source TEXT,
    utm_medium TEXT
  )
`);

console.log('✅ analytics_sessions table created');

// Analytics Goals
db.exec(`
  CREATE TABLE IF NOT EXISTS analytics_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_name TEXT UNIQUE NOT NULL,
    goal_slug TEXT UNIQUE NOT NULL,
    goal_type TEXT NOT NULL,
    goal_trigger TEXT NOT NULL,
    goal_value REAL DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('✅ analytics_goals table created');

// Admin Users
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'admin',
    can_export INTEGER DEFAULT 1,
    can_edit_goals INTEGER DEFAULT 1,
    can_manage_users INTEGER DEFAULT 0,
    last_login DATETIME,
    login_count INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('✅ admin_users table created');

// ============================================================================
// SEED DATA
// ============================================================================

console.log('\n🌱 Seeding data...');

// Create admin user
const adminEmail = 'udi.shkolnik@alicesolutionsgroup.com';
const adminPassword = 'DevPassword123!';
const adminName = 'Udi Shkolnik';

const passwordHash = bcrypt.hashSync(adminPassword, 10);

const insertAdmin = db.prepare(`
  INSERT OR REPLACE INTO admin_users (email, password_hash, name, role, active)
  VALUES (?, ?, ?, ?, ?)
`);

insertAdmin.run(adminEmail, passwordHash, adminName, 'admin', 1);

console.log('✅ Admin user created:');
console.log(`   Email: ${adminEmail}`);
console.log(`   Password: ${adminPassword}`);

// Create default goals
const goals = [
  ['Contact Form Submit', 'contact-form', 'event', 'contact_form_submit', 100],
  ['ISO Studio Demo', 'iso-demo', 'event', 'iso_demo_request', 250],
  ['SmartStart Application', 'smartstart-apply', 'event', 'smartstart_application', 500],
  ['Newsletter Signup', 'newsletter', 'event', 'newsletter_signup', 10],
  ['Book a Call', 'book-call', 'event', 'book_call_click', 200],
];

const insertGoal = db.prepare(`
  INSERT OR REPLACE INTO analytics_goals (goal_name, goal_slug, goal_type, goal_trigger, goal_value)
  VALUES (?, ?, ?, ?, ?)
`);

goals.forEach(([name, slug, type, trigger, value]) => {
  insertGoal.run(name, slug, type, trigger, value);
});

console.log(`✅ ${goals.length} conversion goals created`);

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n✅ LOCAL DATABASE READY!\n');
console.log('📊 Database Stats:');
console.log(`   Tables: 4`);
console.log(`   Admin Users: 1`);
console.log(`   Goals: ${goals.length}`);
console.log(`   Events: 0 (ready to track!)`);

console.log('\n🚀 Next steps:');
console.log('   1. npm run dev:server  (start analytics server)');
console.log('   2. cd client && npm run dev  (start dashboard)');
console.log('   3. Open http://localhost:5173/login');
console.log(`   4. Login with: ${adminEmail}`);
console.log(`   5. Password: ${adminPassword}`);

console.log('\n🎉 Ready to track analytics!\n');

db.close();
