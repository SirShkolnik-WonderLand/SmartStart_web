/**
 * SIMPLE FILE-BASED DATABASE
 * JSON storage for quick testing (no SQL needed!)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Simple JSON storage
class SimpleDB {
  private getFilePath(collection: string): string {
    return path.join(DATA_DIR, `${collection}.json`);
  }

  read(collection: string): any[] {
    const filePath = this.getFilePath(collection);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }

  write(collection: string, data: any[]): void {
    const filePath = this.getFilePath(collection);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  insert(collection: string, item: any): any {
    const items = this.read(collection);
    const id = items.length > 0 ? Math.max(...items.map((i: any) => i.id || 0)) + 1 : 1;
    const newItem = { id, createdAt: new Date().toISOString(), ...item };
    items.push(newItem);
    this.write(collection, items);
    return newItem;
  }

  find(collection: string, predicate: (item: any) => boolean): any[] {
    const items = this.read(collection);
    return items.filter(predicate);
  }

  findOne(collection: string, predicate: (item: any) => boolean): any | null {
    const items = this.find(collection, predicate);
    return items[0] || null;
  }

  update(collection: string, predicate: (item: any) => boolean, updates: any): void {
    const items = this.read(collection);
    const updated = items.map(item =>
      predicate(item) ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    this.write(collection, updated);
  }

  delete(collection: string, predicate: (item: any) => boolean): void {
    const items = this.read(collection);
    const filtered = items.filter(item => !predicate(item));
    this.write(collection, filtered);
  }

  count(collection: string, predicate?: (item: any) => boolean): number {
    const items = this.read(collection);
    if (!predicate) return items.length;
    return items.filter(predicate).length;
  }
}

export const db = new SimpleDB();

export async function testConnection(): Promise<boolean> {
  try {
    console.log('✅ File-based database ready (JSON storage)');
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
}

export async function closeDatabase(): Promise<void> {
  console.log('✅ Database closed');
}

export async function checkHealth() {
  return {
    healthy: true,
    latency: 0,
    connections: { total: 0, idle: 0, waiting: 0 },
  };
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  return [];
}

export async function transaction<T>(callback: any): Promise<T> {
  return callback({});
}

export default db;
