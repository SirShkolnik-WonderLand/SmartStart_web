import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// User data directory
const USERS_DIR = path.join(__dirname, "../../data/users");

// Ensure users directory exists
if (!fs.existsSync(USERS_DIR)) {
  fs.mkdirSync(USERS_DIR, { recursive: true });
}

export interface User {
  id: string;
  email: string;
  secret: string; // TOTP secret (stored securely for code verification)
  secretBackedUp: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  authenticated: boolean;
  expiresAt: number;
}

/**
 * Generate a unique user ID
 */
function generateUserId(): string {
  return `user_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Get user file path
 */
function getUserFilePath(userId: string): string {
  return path.join(USERS_DIR, `${userId}.json`);
}

/**
 * Get user data file path (separate from auth)
 */
function getUserDataFilePath(userId: string): string {
  return path.join(USERS_DIR, `${userId}_data.json`);
}

/**
 * Initialize TOTP for a new user
 */
export async function initializeTOTP(email: string): Promise<{
  secret: string;
  qrCodeUrl: string;
  userId: string;
}> {
  // Check if user already exists
  const existingUser = findUserByEmail(email);
  // Only prevent re-initialization if user has a valid secret
  if (existingUser && existingUser.secret && existingUser.secretBackedUp) {
    throw new Error("User already registered. Please verify your code instead.");
  }
  
  // If user exists but has no secret (corrupted or deleted), allow re-initialization
  if (existingUser && !existingUser.secret) {
    console.log(`[AUTH] User exists but has no secret, re-initializing: ${email}`);
  }

  // If user exists but has no secret (shouldn't happen, but handle it)
  const userId = existingUser?.id || generateUserId();
  
  console.log(`[AUTH] Initializing TOTP for email: ${email}, userId: ${userId}`);
  
  const secret = speakeasy.generateSecret({
    name: `ISO Studio (${email})`,
    issuer: "AliceSolutions Group",
    length: 32,
  });

  if (!secret.base32) {
    throw new Error("Failed to generate TOTP secret");
  }

  console.log(`[AUTH] Generated secret: ${secret.base32.substring(0, 10)}...`);

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "");

  // Save user with secret (kept for verification)
  const user: User = {
    id: userId,
    email,
    secret: secret.base32,
    secretBackedUp: existingUser?.secretBackedUp || false,
    createdAt: existingUser?.createdAt || new Date().toISOString(),
  };

  saveUser(user);
  console.log(`[AUTH] User saved: ${userId}`);

  return {
    secret: secret.base32,
    qrCodeUrl,
    userId,
  };
}

/**
 * Verify TOTP code
 */
export function verifyTOTP(userId: string, token: string): boolean {
  const user = getUser(userId);
  if (!user || !user.secret) {
    console.error(`[AUTH] Cannot verify: user=${!!user}, secret=${!!user?.secret}`);
    return false;
  }

  // Clean token (remove spaces, ensure it's 6 digits)
  const cleanToken = token.toString().replace(/\s/g, '').slice(0, 6);
  
  if (cleanToken.length !== 6 || !/^\d+$/.test(cleanToken)) {
    console.error(`[AUTH] Invalid token format: ${token} -> ${cleanToken}`);
    return false;
  }

  try {
    const verified = speakeasy.totp.verify({
      secret: user.secret,
      encoding: "base32",
      token: cleanToken,
      window: 2, // Allow 2 time steps before/after (90 seconds total)
    });

    console.log(`[AUTH] TOTP verification result: ${verified} for token: ${cleanToken}`);

    if (verified) {
      // Update last login
      user.lastLogin = new Date().toISOString();
      saveUser(user);
    }

    return verified;
  } catch (error: any) {
    console.error(`[AUTH] Error in TOTP verification:`, error);
    return false;
  }
}

/**
 * Confirm secret backup (mark as backed up, but keep secret for verification)
 * Note: We keep the secret stored securely to verify future logins
 */
export function confirmSecretBackup(userId: string): void {
  const user = getUser(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.secretBackedUp = true;
  // Keep secret stored (securely) for future verification
  // The secret is already in the user's authenticator app, but we need it
  // on the server to verify the codes they generate
  saveUser(user);
}

/**
 * Find user by email
 */
export function findUserByEmail(email: string): User | null {
  try {
    const files = fs.readdirSync(USERS_DIR);
    for (const file of files) {
      if (file.endsWith("_data.json")) continue; // Skip data files
      
      const filePath = path.join(USERS_DIR, file);
      const userData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      
      if (userData.email === email) {
        return userData;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get user by ID
 */
export function getUser(userId: string): User | null {
  try {
    const filePath = getUserFilePath(userId);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    return null;
  }
}

/**
 * Save user
 */
function saveUser(user: User): void {
  const filePath = getUserFilePath(user.id);
  fs.writeFileSync(filePath, JSON.stringify(user, null, 2), "utf-8");
  
  // Set secure file permissions (read/write for owner only)
  try {
    fs.chmodSync(filePath, 0o600);
  } catch (error) {
    // Ignore chmod errors on Windows
  }
}

/**
 * Save user assessment data
 */
export function saveUserAssessmentData(userId: string, data: any): void {
  const filePath = getUserDataFilePath(userId);
  const userData = {
    userId,
    data,
    updatedAt: new Date().toISOString(),
  };
  
  fs.writeFileSync(filePath, JSON.stringify(userData, null, 2), "utf-8");
  
  // Set secure file permissions
  try {
    fs.chmodSync(filePath, 0o600);
  } catch (error) {
    // Ignore chmod errors on Windows
  }
}

/**
 * Get user assessment data
 */
export function getUserAssessmentData(userId: string): any | null {
  try {
    const filePath = getUserDataFilePath(userId);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const userData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return userData.data || null;
  } catch (error) {
    return null;
  }
}

/**
 * Create authentication session
 */
export function createAuthSession(userId: string, email: string): AuthSession {
  return {
    userId,
    email,
    authenticated: true,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
}

/**
 * Verify session
 */
export function verifySession(session: AuthSession): boolean {
  return session.authenticated && session.expiresAt > Date.now();
}

