/**
 * PRIVACY UTILITIES
 * GDPR-compliant data handling
 */

import crypto from 'crypto';

/**
 * Hash IP address for privacy
 * Uses SHA-256 with salt for one-way hashing
 */
export function hashIP(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'analytics-hub-salt-change-in-production';
  return crypto
    .createHash('sha256')
    .update(ip + salt)
    .digest('hex')
    .substring(0, 64);
}

/**
 * Anonymize IP address (keep country-level precision)
 * IPv4: 192.168.1.1 → 192.168.0.0
 * IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334 → 2001:0db8:85a3:0000::
 */
export function anonymizeIP(ip: string): string {
  if (isIPv4(ip)) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.0.0`;
  } else if (isIPv6(ip)) {
    const parts = ip.split(':');
    return `${parts.slice(0, 4).join(':')}::`;
  }
  return ip;
}

/**
 * Check if IP is IPv4
 */
function isIPv4(ip: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
}

/**
 * Check if IP is IPv6
 */
function isIPv6(ip: string): boolean {
  return /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/.test(ip);
}

/**
 * Generate anonymous visitor ID from fingerprint
 */
export function generateAnonymousId(fingerprint: {
  userAgent?: string;
  language?: string;
  timezone?: string;
  screenResolution?: string;
  colorDepth?: string;
}): string {
  const data = JSON.stringify(fingerprint);
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 64);
}

/**
 * Generate session ID (random)
 */
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Sanitize user input for XSS prevention
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extract referrer domain (for privacy)
 */
export function extractReferrerDomain(referrer: string): string | null {
  try {
    const url = new URL(referrer);
    return url.hostname;
  } catch {
    return null;
  }
}

/**
 * Check if data retention period expired
 */
export function isDataExpired(date: Date, retentionDays: number = 90): boolean {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() - retentionDays);
  return date < expiryDate;
}

/**
 * Redact sensitive data from object
 */
export function redactSensitiveData(data: any): any {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'apiKey', 'email'];
  
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const redacted = { ...data };
  
  for (const key of Object.keys(redacted)) {
    if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }

  return redacted;
}

/**
 * Parse device info (stub - will be implemented in deviceParser.ts)
 */
export function parseDeviceInfo(userAgent: string): any {
  // Placeholder - will use ua-parser-js
  return {
    type: 'desktop',
    browser: 'Chrome',
    os: 'Windows',
  };
}

/**
 * Parse location (stub - will be implemented in geoip.ts)
 */
export function parseLocation(ip: string): any {
  // Placeholder - will use geoip-lite
  return {
    countryCode: 'CA',
    countryName: 'Canada',
    city: 'Toronto',
  };
}
