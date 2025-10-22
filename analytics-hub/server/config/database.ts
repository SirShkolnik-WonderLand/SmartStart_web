/**
 * DATABASE CONFIGURATION
 * PostgreSQL connection with Drizzle ORM
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import * as schema from '../models/schema.js';

const { Pool } = pg;

// Environment variables
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/analytics_hub';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Create connection pool
export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: IS_PRODUCTION ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Create Drizzle instance
export const db = drizzle(pool, { schema });

// Test connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Run migrations
export async function runMigrations(): Promise<void> {
  try {
    console.log('🔄 Running database migrations...');
    await migrate(db, { migrationsFolder: './server/database/migrations' });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Graceful shutdown
export async function closeDatabase(): Promise<void> {
  try {
    await pool.end();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
  }
}

// Health check
export async function checkHealth(): Promise<{
  healthy: boolean;
  latency: number;
  connections: { total: number; idle: number; waiting: number };
}> {
  const start = Date.now();
  
  try {
    await pool.query('SELECT 1');
    const latency = Date.now() - start;
    
    return {
      healthy: true,
      latency,
      connections: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      },
    };
  } catch (error) {
    return {
      healthy: false,
      latency: -1,
      connections: { total: 0, idle: 0, waiting: 0 },
    };
  }
}

// Query helper with error handling
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (duration > 1000) {
      console.warn(`⚠️  Slow query (${duration}ms): ${text}`);
    }
    
    return result.rows;
  } catch (error) {
    console.error('❌ Query error:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default db;
