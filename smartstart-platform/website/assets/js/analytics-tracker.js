// Real Analytics Tracker for Production
class AnalyticsTracker {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.pageViews = [];
        this.init();
    }

    init() {
        this.trackPageView();
        this.setupEventListeners();
        this.trackUserInfo();
        this.trackCoreWebVitals();
        this.trackUserBehavior();

        // Track SEO metrics after page load
        setTimeout(() => {
            this.trackSEOMetrics();
            this.trackMarketingMetrics();
        }, 2000);
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    trackPageView() {
        const pageData = {
            url: window.location.href,
            path: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            language: navigator.language,
            screen: {
                width: screen.width,
                height: screen.height
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        this.pageViews.push(pageData);
        this.sendAnalytics('pageview', pageData);
    }

    trackUserInfo() {
        // Get comprehensive user and device information
        const userInfo = {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),
            deviceMemory: navigator.deviceMemory || 'unknown',
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : 'unknown',
            // Generate device fingerprint
            fingerprint: this.generateDeviceFingerprint()
        };

        // Get IP and location info (with error handling)
        fetch('https://ipapi.co/json/')
            .then(response => {
                if (!response.ok) throw new Error('Location API unavailable');
                return response.json();
            })
            .then(data => {
                userInfo.ip = data.ip;
                userInfo.country = data.country_name;
                userInfo.city = data.city;
                userInfo.region = data.region;
                userInfo.timezone = data.timezone;
                userInfo.isp = data.org;
                userInfo.asn = data.asn;
                userInfo.org = data.org;
                userInfo.postal = data.postal;
                userInfo.latitude = data.latitude;
                userInfo.longitude = data.longitude;

                this.sendAnalytics('userinfo', userInfo);
            })
            .catch(error => {
                console.debug('Location data unavailable in development mode');
                // Still send basic info without IP
                this.sendAnalytics('userinfo', userInfo);
            });
    }

    generateDeviceFingerprint() {
        // Create a unique device fingerprint
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);

        const fingerprint = {
            canvas: canvas.toDataURL(),
            screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            hardware: navigator.hardwareConcurrency || 'unknown',
            memory: navigator.deviceMemory || 'unknown'
        };

        // Create hash of fingerprint
        return btoa(JSON.stringify(fingerprint)).substring(0, 16);
    }

    setupEventListeners() {
        // Track clicks on important elements
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.matches('a[href], button, .cta-button, .nav-link')) {
                this.trackEvent('click', {
                    element: target.tagName,
                    text: target.textContent ? target.textContent.trim() : '',
                    href: target.href,
                    className: target.className,
                    sessionId: this.sessionId,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            this.trackEvent('form_submit', {
                formId: e.target.id,
                formClass: e.target.className,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            });
        });

        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                    this.trackEvent('scroll_depth', {
                        depth: maxScroll,
                        sessionId: this.sessionId,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });

        // Track time on page
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Math.round((Date.now() - this.startTime) / 1000);
            this.trackEvent('session_end', {
                timeOnPage: timeOnPage,
                pageViews: this.pageViews.length,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            });
        });
    }

    trackEvent(eventType, data) {
        this.sendAnalytics(eventType, data);
    }

    async sendAnalytics(eventType, data) {
        try {
            const payload = {
                event: eventType,
                data: data,
                timestamp: new Date().toISOString(),
                url: window.location.href
            };

            // Send to your analytics endpoint
            try {
                await fetch('/api/admin/track', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });
            } catch (error) {
                // Silently handle analytics errors in development
                console.debug('Analytics tracking disabled in development mode');
            }

            // Also send to Google Analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', eventType, data);
            }

        } catch (error) {
            console.log('Analytics tracking error:', error);
        }
    }

    // SEO and Marketing specific tracking
    trackSEOMetrics() {
        const seoData = {
            pageTitle: document.title,
            metaDescription: document.querySelector('meta[name="description"]')?.content,
            h1Count: document.querySelectorAll('h1').length,
            h2Count: document.querySelectorAll('h2').length,
            h3Count: document.querySelectorAll('h3').length,
            imageCount: document.querySelectorAll('img').length,
            linkCount: document.querySelectorAll('a').length,
            internalLinkCount: document.querySelectorAll('a[href^="/"], a[href*="alicesolutionsgroup.com"]').length,
            externalLinkCount: document.querySelectorAll('a[href^="http"]:not([href*="alicesolutionsgroup.com"])').length,
            wordCount: document.body.textContent.split(/\s+/).length,
            loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
            domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
            firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
        };

        this.sendAnalytics('seo_metrics', seoData);
    }

    // Core Web Vitals tracking
    trackCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.sendAnalytics('core_web_vitals', {
                metric: 'LCP',
                value: lastEntry.startTime,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            });
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Interaction to Next Paint (INP) - replaced FID on March 12, 2024
        // Target: INP < 200ms
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                // INP measures responsiveness - time from user interaction to next paint
                const inpValue = entry.processingStart - entry.startTime + entry.duration;
                this.sendAnalytics('core_web_vitals', {
                    metric: 'INP',
                    value: inpValue,
                    sessionId: this.sessionId,
                    timestamp: new Date().toISOString()
                });
            });
        }).observe({ type: 'event', buffered: true, durationThreshold: 40 });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            this.sendAnalytics('core_web_vitals', {
                metric: 'CLS',
                value: clsValue,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            });
        }).observe({ entryTypes: ['layout-shift'] });
    }

    // Advanced user behavior tracking
    trackUserBehavior() {
        // Mouse movement heatmap data
        let mouseMovements = [];
        let lastMouseTime = Date.now();

        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastMouseTime > 100) { // Throttle to every 100ms
                mouseMovements.push({
                    x: e.clientX,
                    y: e.clientY,
                    timestamp: now
                });
                lastMouseTime = now;
            }
        });

        // Send mouse movement data every 30 seconds
        setInterval(() => {
            if (mouseMovements.length > 0) {
                this.sendAnalytics('mouse_movements', {
                    movements: mouseMovements.slice(-50), // Last 50 movements
                    sessionId: this.sessionId,
                    timestamp: new Date().toISOString()
                });
                mouseMovements = [];
            }
        }, 30000);

        // Track focus events (accessibility)
        document.addEventListener('focus', (e) => {
            this.sendAnalytics('focus_event', {
                element: e.target.tagName,
                id: e.target.id,
                className: e.target.className,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            });
        });

        // Track form interactions
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                this.sendAnalytics('form_interaction', {
                    element: e.target.tagName,
                    type: e.target.type,
                    id: e.target.id,
                    sessionId: this.sessionId,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    trackMarketingMetrics() {
        const marketingData = {
            utmSource: this.getUrlParameter('utm_source'),
            utmMedium: this.getUrlParameter('utm_medium'),
            utmCampaign: this.getUrlParameter('utm_campaign'),
            utmTerm: this.getUrlParameter('utm_term'),
            utmContent: this.getUrlParameter('utm_content'),
            referrer: document.referrer,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
        };

        this.sendAnalytics('marketing_metrics', marketingData);
    }

    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsTracker = new AnalyticsTracker();

    // Track SEO metrics after page load
    setTimeout(() => {
        window.analyticsTracker.trackSEOMetrics();
        window.analyticsTracker.trackMarketingMetrics();
    }, 2000);
});

// Export for use in other scripts
window.AnalyticsTracker = AnalyticsTracker;