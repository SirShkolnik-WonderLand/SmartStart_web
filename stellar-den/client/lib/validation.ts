/**
 * Comprehensive Input Validation & Sanitization
 * Production-grade security for all user inputs
 */

import { z } from 'zod';

// Base validation schemas
export const emailSchema = z.string()
  .email('Invalid email format')
  .max(254, 'Email too long')
  .min(5, 'Email too short')
  .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format');

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters')
  .transform(str => str.trim());

export const phoneSchema = z.string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
  .optional();

export const messageSchema = z.string()
  .min(10, 'Message must be at least 10 characters')
  .max(5000, 'Message too long')
  .regex(/^[a-zA-Z0-9\s\.,!?\-_@#$%&*()+=<>:"'`~[\]{}|\\\/;]*$/, 'Message contains invalid characters')
  .transform(str => str.trim());

export const urlSchema = z.string()
  .url('Invalid URL format')
  .max(2048, 'URL too long')
  .regex(/^https?:\/\/(www\.)?[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/.*)?$/, 'Invalid URL format');

// Contact form validation
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name too long')
    .regex(/^[a-zA-Z0-9\s\-'\.&,()]+$/, 'Company name contains invalid characters')
    .transform(str => str.trim())
    .optional(),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject too long')
    .regex(/^[a-zA-Z0-9\s\-'\.!?]+$/, 'Subject contains invalid characters')
    .transform(str => str.trim()),
  message: messageSchema,
  source: z.string()
    .max(100, 'Source too long')
    .optional(),
  utm_source: z.string()
    .max(100, 'UTM source too long')
    .optional(),
  utm_medium: z.string()
    .max(100, 'UTM medium too long')
    .optional(),
  utm_campaign: z.string()
    .max(100, 'UTM campaign too long')
    .optional()
});

// Newsletter signup validation
export const newsletterSchema = z.object({
  email: emailSchema,
  source: z.string()
    .max(100, 'Source too long')
    .optional(),
  interests: z.array(z.string())
    .max(10, 'Too many interests selected')
    .optional()
});

// SmartStart application validation
export const smartStartSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: z.string()
    .min(2, 'Company name required')
    .max(200, 'Company name too long')
    .regex(/^[a-zA-Z0-9\s\-'\.&,()]+$/, 'Company name contains invalid characters')
    .transform(str => str.trim()),
  role: z.string()
    .min(2, 'Role required')
    .max(100, 'Role too long')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Role contains invalid characters')
    .transform(str => str.trim()),
  experience: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  projectDescription: z.string()
    .min(50, 'Project description must be at least 50 characters')
    .max(2000, 'Project description too long')
    .regex(/^[a-zA-Z0-9\s\.,!?\-_@#$%&*()+=<>:"'`~[\]{}|\\\/;]*$/, 'Project description contains invalid characters')
    .transform(str => str.trim()),
  timeline: z.enum(['immediate', '1-3months', '3-6months', '6-12months', 'flexible']),
  budget: z.enum(['under-10k', '10k-50k', '50k-100k', '100k-500k', '500k-plus', 'discuss']),
  source: z.string()
    .max(100, 'Source too long')
    .optional()
});

// ISO Studio form validation
export const isoStudioSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  company: z.string()
    .min(2, 'Company name required')
    .max(200, 'Company name too long')
    .regex(/^[a-zA-Z0-9\s\-'\.&,()]+$/, 'Company name contains invalid characters')
    .transform(str => str.trim()),
  role: z.string()
    .min(2, 'Role required')
    .max(100, 'Role too long')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Role contains invalid characters')
    .transform(str => str.trim()),
  framework: z.enum(['ISO27001', 'CMMC', 'SOC2', 'HIPAA', 'other']),
  currentStatus: z.enum(['not-started', 'in-progress', 'partial', 'near-complete']),
  timeline: z.enum(['immediate', '1-3months', '3-6months', '6-12months', 'flexible']),
  teamSize: z.enum(['1-5', '6-20', '21-50', '51-200', '200-plus']),
  industry: z.string()
    .min(2, 'Industry required')
    .max(100, 'Industry too long')
    .regex(/^[a-zA-Z\s\-'\.&,()]+$/, 'Industry contains invalid characters')
    .transform(str => str.trim()),
  specificNeeds: z.string()
    .max(1000, 'Specific needs too long')
    .regex(/^[a-zA-Z0-9\s\.,!?\-_@#$%&*()+=<>:"'`~[\]{}|\\\/;]*$/, 'Specific needs contains invalid characters')
    .transform(str => str.trim())
    .optional()
});

// Security validation functions
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/script/gi, '') // Remove script tags
    .trim();
}

export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        errors: result.error.errors.map(err => err.message)
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: ['Validation failed']
    };
  }
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return 0;
    return Math.max(0, attempt.resetTime - Date.now());
  }
}

// CSRF protection
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 64;
}

// XSS protection
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// SQL injection protection (for any database queries)
export function sanitizeForSQL(input: string): string {
  return input
    .replace(/['"]/g, '')
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/union/gi, '')
    .replace(/select/gi, '')
    .replace(/insert/gi, '')
    .replace(/update/gi, '')
    .replace(/delete/gi, '')
    .replace(/drop/gi, '')
    .replace(/create/gi, '')
    .replace(/alter/gi, '');
}

// File upload validation
export const fileUploadSchema = z.object({
  name: z.string()
    .min(1, 'File name required')
    .max(255, 'File name too long')
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/, 'Invalid file name'),
  size: z.number()
    .min(1, 'File too small')
    .max(10 * 1024 * 1024, 'File too large (max 10MB)'),
  type: z.string()
    .regex(/^[a-zA-Z0-9\/\-\.]+$/, 'Invalid file type')
    .refine(type => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      return allowedTypes.includes(type);
    }, 'File type not allowed')
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type NewsletterData = z.infer<typeof newsletterSchema>;
export type SmartStartData = z.infer<typeof smartStartSchema>;
export type ISOStudioData = z.infer<typeof isoStudioSchema>;
export type FileUploadData = z.infer<typeof fileUploadSchema>;
