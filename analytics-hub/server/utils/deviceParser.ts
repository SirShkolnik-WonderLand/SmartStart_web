/**
 * DEVICE PARSER
 * Parse user-agent strings to extract device, browser, and OS information
 */

import UAParser from 'ua-parser-js';

export interface DeviceInfo {
  // Device
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  deviceVendor?: string;
  deviceModel?: string;
  
  // Browser
  browser: string;
  browserVersion?: string;
  browserEngine?: string;
  
  // OS
  os: string;
  osVersion?: string;
  
  // Screen (if provided)
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  pixelRatio?: number;
}

/**
 * Parse user-agent string
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Determine device type
  let deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown' = 'unknown';
  
  if (result.device.type) {
    if (result.device.type === 'mobile') {
      deviceType = 'mobile';
    } else if (result.device.type === 'tablet') {
      deviceType = 'tablet';
    } else {
      deviceType = 'desktop';
    }
  } else {
    // Fallback detection
    if (/mobile/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'tablet';
    } else {
      deviceType = 'desktop';
    }
  }

  return {
    deviceType,
    deviceVendor: result.device.vendor,
    deviceModel: result.device.model,
    
    browser: result.browser.name || 'Unknown',
    browserVersion: result.browser.version,
    browserEngine: result.engine.name,
    
    os: result.os.name || 'Unknown',
    osVersion: result.os.version,
  };
}

/**
 * Detect bot/crawler from user-agent
 */
export function isBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i,
    /crawl/i,
    /spider/i,
    /google/i,
    /bing/i,
    /yahoo/i,
    /duckduckgo/i,
    /baidu/i,
    /yandex/i,
    /facebook/i,
    /twitter/i,
    /linkedin/i,
    /slurp/i,
    /mediapartners/i,
    /semrush/i,
    /ahrefs/i,
    /moz/i,
  ];

  return botPatterns.some((pattern) => pattern.test(userAgent));
}

/**
 * Get browser capabilities from user-agent
 */
export function getBrowserCapabilities(userAgent: string): {
  supportsWebGL: boolean;
  supportsServiceWorker: boolean;
  supportsWebSocket: boolean;
  supportsTouchEvents: boolean;
} {
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const browserName = browser.name?.toLowerCase() || '';
  const browserVersion = parseFloat(browser.version || '0');

  // Modern browsers support these features
  const isModern =
    (browserName.includes('chrome') && browserVersion >= 90) ||
    (browserName.includes('firefox') && browserVersion >= 88) ||
    (browserName.includes('safari') && browserVersion >= 14) ||
    (browserName.includes('edge') && browserVersion >= 90);

  return {
    supportsWebGL: isModern,
    supportsServiceWorker: isModern,
    supportsWebSocket: isModern,
    supportsTouchEvents: /mobile|tablet/i.test(userAgent),
  };
}

/**
 * Format device info for display
 */
export function formatDeviceInfo(info: DeviceInfo): string {
  const parts: string[] = [];
  
  if (info.browser) {
    parts.push(info.browser);
    if (info.browserVersion) {
      parts.push(info.browserVersion);
    }
  }
  
  if (info.os) {
    parts.push(`on ${info.os}`);
    if (info.osVersion) {
      parts.push(info.osVersion);
    }
  }
  
  if (info.deviceType && info.deviceType !== 'desktop') {
    parts.push(`(${info.deviceType})`);
  }

  return parts.join(' ');
}

/**
 * Get device category for analytics
 */
export function getDeviceCategory(info: DeviceInfo): 'mobile' | 'desktop' | 'tablet' {
  return info.deviceType === 'unknown' ? 'desktop' : info.deviceType;
}
