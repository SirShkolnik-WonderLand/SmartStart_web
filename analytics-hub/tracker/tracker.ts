/**
 * ANALYTICS HUB TRACKER
 * Lightweight tracking script (<5KB minified)
 * Privacy-first, no cookies, async loading
 */

(function () {
  'use strict';

  // Configuration
  const API_URL = window.analyticsHubConfig?.apiUrl || 'http://localhost:4000';
  const AUTO_TRACK = window.analyticsHubConfig?.autoTrack !== false;
  const TRACK_OUTBOUND = window.analyticsHubConfig?.trackOutbound !== false;
  const TRACK_SCROLL = window.analyticsHubConfig?.trackScroll !== false;

  // Session & Visitor IDs (stored in sessionStorage/localStorage)
  let sessionId: string;
  let visitorId: string;
  let pageLoadTime: number;

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize tracker
   */
  function init(): void {
    pageLoadTime = Date.now();
    
    // Get or create session ID (expires with session)
    sessionId = sessionStorage.getItem('ah_session') || generateId();
    sessionStorage.setItem('ah_session', sessionId);

    // Get or create visitor ID (persistent)
    visitorId = localStorage.getItem('ah_visitor') || generateFingerprint();
    localStorage.setItem('ah_visitor', visitorId);

    // Auto-track page view if enabled
    if (AUTO_TRACK) {
      trackPageView();
    }

    // Track page unload (time on page)
    window.addEventListener('beforeunload', handlePageUnload);

    // Track scroll depth if enabled
    if (TRACK_SCROLL) {
      trackScrollDepth();
    }

    // Track outbound links if enabled
    if (TRACK_OUTBOUND) {
      trackOutboundLinks();
    }
  }

  // ============================================================================
  // TRACKING FUNCTIONS
  // ============================================================================

  /**
   * Track page view
   */
  function trackPageView(): void {
    const pageData = getPageData();
    const performance = getPerformanceData();
    const utmParams = getUTMParams();

    send('/api/v1/pageview', {
      sessionId,
      visitorId,
      pageUrl: pageData.url,
      pageTitle: pageData.title,
      referrer: pageData.referrer,
      utmParams,
      performance,
    });
  }

  /**
   * Track custom event
   */
  function trackEvent(eventName: string, properties?: Record<string, any>): void {
    const pageData = getPageData();

    send('/api/v1/event', {
      event: {
        eventType: 'custom',
        eventName,
        eventCategory: 'interaction',
        sessionId,
        visitorId,
        pageUrl: pageData.url,
        pageTitle: pageData.title,
        properties,
      },
    });
  }

  /**
   * Track conversion
   */
  function trackConversion(goalName: string, value?: number): void {
    const pageData = getPageData();

    send('/api/v1/conversion', {
      sessionId,
      goalName,
      goalValue: value,
      pageUrl: pageData.url,
    });
  }

  /**
   * Track button/link click
   */
  function trackClick(element: HTMLElement): void {
    const pageData = getPageData();
    const elementId = element.id;
    const elementText = element.textContent?.trim().substring(0, 100);
    const elementHref = (element as HTMLAnchorElement).href;

    send('/api/v1/click', {
      sessionId,
      pageUrl: pageData.url,
      elementId,
      elementText,
      elementHref,
    });
  }

  // ============================================================================
  // AUTO-TRACKING
  // ============================================================================

  /**
   * Track scroll depth
   */
  function trackScrollDepth(): void {
    const milestones = [25, 50, 75, 100];
    const reached = new Set<number>();
    let maxScroll = 0;

    function checkScroll() {
      const scrollPercent = getScrollPercent();
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
      }

      milestones.forEach((milestone) => {
        if (scrollPercent >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          trackEvent(`Scroll ${milestone}%`, { scrollDepth: milestone });
        }
      });
    }

    // Throttled scroll handler
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /**
   * Track outbound links
   */
  function trackOutboundLinks(): void {
    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Check if outbound link
      if (href.startsWith('http') && !href.includes(window.location.hostname)) {
        trackEvent('Outbound Click', {
          url: href,
          text: target.textContent?.trim().substring(0, 100),
        });
      }
    });
  }

  /**
   * Handle page unload (track time on page)
   */
  function handlePageUnload(): void {
    const timeOnPage = Math.round((Date.now() - pageLoadTime) / 1000);
    const scrollDepth = getScrollPercent();

    // Use sendBeacon for reliable tracking on page unload
    const pageData = getPageData();
    const data = JSON.stringify({
      event: {
        eventType: 'page_view',
        eventCategory: 'engagement',
        sessionId,
        visitorId,
        pageUrl: pageData.url,
        timeOnPage,
        scrollDepth,
      },
    });

    navigator.sendBeacon(`${API_URL}/api/v1/event`, data);
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Get current page data
   */
  function getPageData() {
    return {
      url: window.location.href,
      title: document.title,
      path: window.location.pathname,
      referrer: document.referrer,
    };
  }

  /**
   * Get performance data
   */
  function getPerformanceData() {
    if (!window.performance || !window.performance.timing) {
      return {};
    }

    const timing = window.performance.timing;
    const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
    const domInteractive = timing.domInteractive - timing.navigationStart;
    const domComplete = timing.domComplete - timing.navigationStart;

    return {
      pageLoadTime,
      domInteractive,
      domComplete,
    };
  }

  /**
   * Get UTM parameters from URL
   */
  function getUTMParams(): Record<string, string> | undefined {
    const params = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string> = {};

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((key) => {
      const value = params.get(key);
      if (value) {
        utmParams[key] = value;
      }
    });

    return Object.keys(utmParams).length > 0 ? utmParams : undefined;
  }

  /**
   * Get scroll percentage
   */
  function getScrollPercent(): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    return scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
  }

  /**
   * Generate random ID
   */
  function generateId(): string {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  /**
   * Generate visitor fingerprint (privacy-safe)
   */
  function generateFingerprint(): string {
    const data = [
      navigator.userAgent,
      navigator.language,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      `${screen.width}x${screen.height}`,
      window.devicePixelRatio,
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36) + generateId();
  }

  /**
   * Send data to analytics API
   */
  function send(endpoint: string, data: any): void {
    const url = `${API_URL}${endpoint}`;

    // Use sendBeacon if available (more reliable)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    } else {
      // Fallback to fetch (async, non-blocking)
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch((error) => {
        console.error('Analytics tracking error:', error);
      });
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  // Expose tracking functions globally
  window.analyticsHub = {
    trackEvent,
    trackConversion,
    trackClick,
    trackPageView,
    getSessionId: () => sessionId,
    getVisitorId: () => visitorId,
  };

  // ============================================================================
  // AUTO-INIT
  // ============================================================================

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// TypeScript declarations for window
declare global {
  interface Window {
    analyticsHub: {
      trackEvent: (eventName: string, properties?: Record<string, any>) => void;
      trackConversion: (goalName: string, value?: number) => void;
      trackClick: (element: HTMLElement) => void;
      trackPageView: () => void;
      getSessionId: () => string;
      getVisitorId: () => string;
    };
    analyticsHubConfig?: {
      apiUrl?: string;
      autoTrack?: boolean;
      trackOutbound?: boolean;
      trackScroll?: boolean;
    };
  }
}

export {};
