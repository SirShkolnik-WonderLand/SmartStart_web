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

        // Get IP and location info
        fetch('https://ipapi.co/json/')
            .then(response => response.json())
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
                console.log('Could not fetch location data:', error);
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
                    text: target.textContent?.trim(),
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
            await fetch('/api/admin/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

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
            imageCount: document.querySelectorAll('img').length,
            linkCount: document.querySelectorAll('a').length,
            wordCount: document.body.textContent.split(/\s+/).length,
            loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
        };

        this.sendAnalytics('seo_metrics', seoData);
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
