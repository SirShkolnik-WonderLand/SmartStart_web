/**
 * UTILITY: Auto-capture lead source data
 * Captures page URL, referrer, geolocation, and other metadata
 */

export interface LeadSourceData {
  pageUrl: string;
  referrer: string;
  userAgent: string;
  timestamp: string;
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
  };
}

export async function captureLeadSource(): Promise<LeadSourceData> {
  // Get page URL from browser
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  // Get referrer from browser
  const referrer = typeof window !== 'undefined' ? document.referrer || 'Direct' : 'Direct';
  
  // Get user agent
  const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
  
  // Get geolocation (if available)
  let geolocation: LeadSourceData['geolocation'] | undefined;
  
  if (typeof window !== 'undefined') {
    try {
      // Get timezone
      geolocation = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    } catch (error) {
      // Geolocation not available
    }
  }

  return {
    pageUrl,
    referrer,
    userAgent,
    timestamp: new Date().toISOString(),
    geolocation,
  };
}

