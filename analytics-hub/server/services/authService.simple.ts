import { db } from '../config/database.simple.js';
import crypto from 'crypto';

// Simple hash for testing (use bcrypt in production)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Initialize admin user
function initAdmin() {
  const users = db.read('users');
  if (users.length === 0) {
    const email = process.env.ADMIN_EMAIL || 'udi.shkolnik@alicesolutionsgroup.com';
    const password = process.env.ADMIN_PASSWORD || 'DevPassword123!';
    const hash = hashPassword(password);
    
    db.insert('users', {
      email,
      password_hash: hash,
      name: 'Udi Shkolnik',
      role: 'admin',
      active: true,
      canExport: true,
      canEditGoals: true,
      canManageUsers: true,
      loginCount: 0,
    });
    
    console.log(`✅ Admin user created: ${email}`);
  }
}

initAdmin();

export async function findUserByEmail(email: string) {
  return db.findOne('users', u => u.email === email);
}

export async function updateUser(userId: number, updates: any) {
  db.update('users', u => u.id === userId, updates);
}
