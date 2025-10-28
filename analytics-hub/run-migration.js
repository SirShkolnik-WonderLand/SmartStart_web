#!/usr/bin/env node

/**
 * Direct database migration script
 * Connects to production database and creates tables
 */

import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

// Production database connection
const DATABASE_URL = 'postgresql://analytics_admin:SJdw5MwKpb1sh01Bz02G4jKyj3PjQbH3@dpg-d3s9sch5pdvs73eds9m0-a/analytics_hub_zrqh';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  try {
    console.log('🔄 Connecting to production database...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Read the minimal schema
    const schemaPath = path.join(process.cwd(), 'create-tables.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔄 Running migration...');
    await client.query(schemaSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Tables created: analytics_events, analytics_sessions, admin_users');
    
    // Test the tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'analytics_%'
    `);
    
    console.log('📋 Created tables:', result.rows.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
