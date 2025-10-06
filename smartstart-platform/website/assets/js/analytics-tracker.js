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
        // Get IP and location info (this would be done server-side in production)
        fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(data => {
                const userInfo = {
                    ip: data.ip,
                    country: data.country_name,
                    city: data.city,
                    region: data.region,
                    timezone: data.timezone,
                    isp: data.org,
                    sessionId: this.sessionId,
                    timestamp: new Date().toISOString()
                };
                this.sendAnalytics('userinfo', userInfo);
            })
            .catch(error => {
                console.log('Could not fetch location data:', error);
                // Fallback to basic tracking
                this.sendAnalytics('userinfo', {
                    sessionId: this.sessionId,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                });
            });
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
