#!/usr/bin/env tsx

/**
 * DATABASE MIGRATION SCRIPT
 * Run this to create all PostgreSQL tables
 */

import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://analytics_admin:SJdw5MwKpb1sh01Bz02G4jKyj3PjQbH3@dpg-d3s9sch5pdvs73eds9m0-a/analytics_hub_zrqh';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Read the schema.sql file
    const schemaPath = path.join(__dirname, '..', 'server', 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schemaSQL);
    
    console.log('✅ Database migrations completed successfully!');
    console.log('📊 All analytics tables have been created.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
runMigrations();
