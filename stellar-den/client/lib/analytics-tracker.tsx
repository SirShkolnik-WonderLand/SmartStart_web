/**
 * ANALYTICS INTEGRATION FOR STELLAR-DEN
 * Connects to Analytics Hub for tracking
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Analytics Hub configuration
const ANALYTICS_CONFIG = {
  apiUrl: import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:4000',
  autoTrack: true,
  trackOutbound: true,
  trackScroll: true,
};

/**
 * Initialize Analytics Hub
 */
export function initAnalytics() {
  // Set configuration
  (window as any).analyticsHubConfig = ANALYTICS_CONFIG;

  // Load tracker script
  const script = document.createElement('script');
  script.src = `${ANALYTICS_CONFIG.apiUrl}/tracker.min.js`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  console.log('✅ Analytics Hub initialized');
}

/**
 * React Hook: Track page views on route change
 */
export function useAnalyticsPageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Wait for analytics to be ready
    const checkAnalytics = setInterval(() => {
      if ((window as any).analyticsHub) {
        (window as any).analyticsHub.trackPageView();
        clearInterval(checkAnalytics);
      }
    }, 100);

    return () => clearInterval(checkAnalytics);
  }, [location.pathname]);
}

/**
 * Track custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if ((window as any).analyticsHub) {
    (window as any).analyticsHub.trackEvent(eventName, properties);
  }
}

/**
 * Track conversion
 */
export function trackConversion(goalName: string, value?: number) {
  if ((window as any).analyticsHub) {
    (window as any).analyticsHub.trackConversion(goalName, value);
  }
}

/**
 * Track button click
 */
export function trackClick(element: HTMLElement) {
  if ((window as any).analyticsHub) {
    (window as any).analyticsHub.trackClick(element);
  }
}

// Example usage in components:
// 
// import { trackEvent, trackConversion } from '@/lib/analytics-tracker';
// 
// function ContactForm() {
//   const handleSubmit = () => {
//     trackConversion('Contact Form Submit', 100);
//   };
// }
// 
// function CTAButton() {
//   const handleClick = () => {
//     trackEvent('CTA Clicked', {
//       button: 'Book a Call',
//       location: 'Hero Section'
//     });
//   };
// }
