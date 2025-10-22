/**
 * GEOIP UTILITIES
 * IP to location lookup (privacy-safe, city-level only)
 */

import geoip from 'geoip-lite';

export interface LocationInfo {
  countryCode: string;
  countryName: string;
  region?: string;
  city?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

// Country code to country name mapping (top countries)
const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  IN: 'India',
  JP: 'Japan',
  CN: 'China',
  BR: 'Brazil',
  MX: 'Mexico',
  ES: 'Spain',
  IT: 'Italy',
  NL: 'Netherlands',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  PL: 'Poland',
  RU: 'Russia',
  // Add more as needed
};

/**
 * Get location from IP address
 */
export function getLocationFromIP(ip: string): LocationInfo | null {
  try {
    // Handle localhost/private IPs
    if (isPrivateIP(ip) || ip === '::1' || ip === '127.0.0.1') {
      return {
        countryCode: 'XX',
        countryName: 'Local',
        city: 'Localhost',
      };
    }

    const geo = geoip.lookup(ip);

    if (!geo) {
      return null;
    }

    return {
      countryCode: geo.country,
      countryName: COUNTRY_NAMES[geo.country] || geo.country,
      region: geo.region,
      city: geo.city,
      timezone: geo.timezone,
      latitude: geo.ll[0],
      longitude: geo.ll[1],
    };
  } catch (error) {
    console.error('Error looking up IP:', error);
    return null;
  }
}

/**
 * Check if IP is private/local
 */
function isPrivateIP(ip: string): boolean {
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^fc00:/,
    /^fe80:/,
  ];

  return privateRanges.some((range) => range.test(ip));
}

/**
 * Get timezone from location
 */
export function getTimezoneFromLocation(location: LocationInfo): string {
  return location.timezone || 'UTC';
}

/**
 * Format location for display
 */
export function formatLocation(location: LocationInfo): string {
  const parts: string[] = [];
  
  if (location.city) {
    parts.push(location.city);
  }
  
  if (location.region && location.city !== location.region) {
    parts.push(location.region);
  }
  
  parts.push(location.countryName);

  return parts.join(', ');
}

/**
 * Get country flag emoji from country code
 */
export function getCountryFlag(countryCode: string): string {
  if (countryCode === 'XX') return '🌐';
  if (countryCode.length !== 2) return '🌍';
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
}

/**
 * Get distance between two coordinates (Haversine formula)
 */
export function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
