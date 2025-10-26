/**
 * AUTH SERVICE
 * Authentication service for PostgreSQL database
 */

import { db } from '../config/database.js';
import { adminUsers } from '../models/schema.js';
import { eq } from 'drizzle-orm';
import type { AdminUser } from '../../shared/types.js';

// Extended user type for database operations
interface DatabaseUser extends AdminUser {
  password_hash: string;
  lockedUntil?: Date;
  failedLoginAttempts: number;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<DatabaseUser | null> {
  try {
    const users = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1);

    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    return {
      id: user.id,
      email: user.email,
      password_hash: user.passwordHash,
      name: user.name || undefined,
      role: user.role as any,
      canExport: true,
      canEditGoals: true,
      canManageUsers: false,
      active: user.active || false,
      emailVerified: user.emailVerified || false,
      twoFactorEnabled: user.twoFactorEnabled || false,
      lockedUntil: user.lockedUntil || undefined,
      lastLogin: user.lastLogin || undefined,
      lastLoginIp: user.lastLoginIp || undefined,
      loginCount: user.loginCount || 0,
      failedLoginAttempts: user.failedLoginAttempts || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as DatabaseUser;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

/**
 * Update user
 */
export async function updateUser(
  userId: number,
  updates: Partial<Pick<DatabaseUser, 'lastLogin' | 'lastLoginIp' | 'loginCount' | 'failedLoginAttempts' | 'lockedUntil'>>
): Promise<boolean> {
  try {
    await db
      .update(adminUsers)
      .set({
        lastLogin: updates.lastLogin ? new Date(updates.lastLogin) : undefined,
        lastLoginIp: updates.lastLoginIp,
        loginCount: updates.loginCount || 0,
        failedLoginAttempts: updates.failedLoginAttempts || 0,
        lockedUntil: updates.lockedUntil ? new Date(updates.lockedUntil) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, userId));

    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
}

/**
 * Create admin user (for initial setup)
 */
export async function createAdminUser(
  email: string,
  passwordHash: string,
  name?: string
): Promise<DatabaseUser | null> {
  try {
    const result = await db
      .insert(adminUsers)
      .values({
        email,
        passwordHash,
        name: name || 'Admin',
        role: 'admin',
        active: true,
        loginCount: 0,
        failedLoginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const user = result[0];
    return {
      id: user.id,
      email: user.email,
      password_hash: user.passwordHash,
      name: user.name || undefined,
      role: user.role as any,
      canExport: true,
      canEditGoals: true,
      canManageUsers: false,
      active: user.active || false,
      emailVerified: user.emailVerified || false,
      twoFactorEnabled: user.twoFactorEnabled || false,
      lockedUntil: user.lockedUntil || undefined,
      lastLogin: user.lastLogin || undefined,
      lastLoginIp: user.lastLoginIp || undefined,
      loginCount: user.loginCount || 0,
      failedLoginAttempts: user.failedLoginAttempts || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as DatabaseUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return null;
  }
}
