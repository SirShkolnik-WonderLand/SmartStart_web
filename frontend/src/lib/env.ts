/**
 * Environment configuration for client-side usage
 * This file provides a safe way to access environment variables
 */

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side
    return (process as any).env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  
  // Server-side
  return (process as any).env.NODE_ENV === 'production' 
    ? (process as any).env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com'
    : 'http://localhost:3001';
};

export const isProduction = (): boolean => {
  return (process as any).env.NODE_ENV === 'production';
};

export const isDevelopment = (): boolean => {
  return (process as any).env.NODE_ENV === 'development';
};

// Standardized auth token access for client-only contexts
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  // Prefer a single canonical key; support legacy keys during transition
  const primary = localStorage.getItem('auth-token');
  if (primary) return primary;
  const legacy = localStorage.getItem('token');
  return legacy;
};
