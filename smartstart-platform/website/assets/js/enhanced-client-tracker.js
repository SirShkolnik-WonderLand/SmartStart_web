// Enhanced Client Tracker - Capture Everything About Potential Clients
class EnhancedClientTracker {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.clientData = {};
        this.init();
    }

    init() {
        this.collectClientData();
        this.trackClientJourney();
        this.setupFormTracking();
        this.setupCTATracking();
    }

    generateSessionId() {
        return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    collectClientData() {
        // Collect comprehensive client information
        this.clientData = {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            
            // Device Information
            device: {
                type: this.getDeviceType(),
                brand: this.getDeviceBrand(),
                model: this.getDeviceModel(),
                os: navigator.platform,
                osVersion: this.getOSVersion(),
                browser: this.getBrowser(),
                browserVersion: this.getBrowserVersion(),
                screen: {
                    width: screen.width,
                    height: screen.height,
                    colorDepth: screen.colorDepth,
                    pixelDepth: screen.pixelDepth,
                    orientation: screen.orientation?.type || 'unknown'
                },
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            },

            // Network Information
            network: {
                connectionType: navigator.connection?.effectiveType || 'unknown',
                downlink: navigator.connection?.downlink || 'unknown',
                rtt: navigator.connection?.rtt || 'unknown',
                saveData: navigator.connection?.saveData || false
            },

            // Location Information (from timezone)
            location: {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timezoneOffset: new Date().getTimezoneOffset(),
                language: navigator.language,
                languages: navigator.languages,
                locale: navigator.language
            },

            // Capabilities
            capabilities: {
                cookieEnabled: navigator.cookieEnabled,
                doNotTrack: navigator.doNotTrack,
                javaEnabled: navigator.javaEnabled(),
                onLine: navigator.onLine,
                pdfViewerEnabled: navigator.pdfViewerEnabled || false,
                webdriver: navigator.webdriver || false
            },

            // Performance
            performance: {
                deviceMemory: navigator.deviceMemory || 'unknown',
                hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
                maxTouchPoints: navigator.maxTouchPoints || 0
            },

            // Fingerprint
            fingerprint: this.generateFingerprint(),

            // User Agent
            userAgent: navigator.userAgent,

            // Referrer
            referrer: document.referrer,

            // Current Page
            page: {
                url: window.location.href,
                path: window.location.pathname,
                title: document.title,
                hostname: window.location.hostname
            }
        };

        // Send to server for IP and geographic tracking
        this.sendClientData();
    }

    getDeviceType() {
        const ua = navigator.userAgent.toLowerCase();
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
        if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) return 'mobile';
        return 'desktop';
    }

    getDeviceBrand() {
        const ua = navigator.userAgent;
        if (/iPhone/.test(ua)) return 'Apple';
        if (/iPad/.test(ua)) return 'Apple';
        if (/Macintosh/.test(ua)) return 'Apple';
        if (/Windows/.test(ua)) return 'Microsoft';
        if (/Android/.test(ua)) return 'Android';
        if (/Linux/.test(ua)) return 'Linux';
        return 'Unknown';
    }

    getDeviceModel() {
        const ua = navigator.userAgent;
        if (/iPhone/.test(ua)) return 'iPhone';
        if (/iPad/.test(ua)) return 'iPad';
        if (/Macintosh/.test(ua)) return 'Mac';
        if (/Windows/.test(ua)) return 'Windows PC';
        if (/Android/.test(ua)) return 'Android Device';
        return 'Unknown';
    }

    getOSVersion() {
        const ua = navigator.userAgent;
        const version = ua.match(/(?:OS|Version)[\s\/:]([\d_]+)/);
        return version ? version[1].replace(/_/g, '.') : 'unknown';
    }

    getBrowser() {
        const ua = navigator.userAgent;
        if (/Chrome/.test(ua) && !/Edge|Edg/.test(ua)) return 'Chrome';
        if (/Firefox/.test(ua)) return 'Firefox';
        if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari';
        if (/Edge|Edg/.test(ua)) return 'Edge';
        if (/Opera|OPR/.test(ua)) return 'Opera';
        return 'Unknown';
    }

    getBrowserVersion() {
        const ua = navigator.userAgent;
        const version = ua.match(/(?:Chrome|Firefox|Safari|Edge|Opera|Version)[\s\/:]([\d.]+)/);
        return version ? version[1] : 'unknown';
    }

    generateFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Client Fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');
        
        return btoa(fingerprint).substring(0, 32);
    }

    async sendClientData() {
        try {
            await fetch('/api/admin/track-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.clientData)
            });
        } catch (error) {
            console.error('Error sending client data:', error);
        }
    }

    trackClientJourney() {
        // Track page navigation
        let lastPage = window.location.pathname;
        
        setInterval(() => {
            if (window.location.pathname !== lastPage) {
                this.trackPageChange(lastPage, window.location.pathname);
                lastPage = window.location.pathname;
            }
        }, 1000);

        // Track time on page
        this.trackTimeOnPage();
    }

    trackPageChange(from, to) {
        const data = {
            sessionId: this.sessionId,
            from,
            to,
            timestamp: new Date().toISOString()
        };

        fetch('/api/admin/track-client', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'page_change', data })
        });
    }

    trackTimeOnPage() {
        const startTime = Date.now();
        
        // Track every 30 seconds
        setInterval(() => {
            const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
            
            if (timeOnPage % 30 === 0) {
                const data = {
                    sessionId: this.sessionId,
                    timeOnPage,
                    timestamp: new Date().toISOString()
                };

                fetch('/api/admin/track-client', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'time_on_page', data })
                });
            }
        }, 1000);
    }

    setupFormTracking() {
        // Track all form interactions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formData = {
                sessionId: this.sessionId,
                formId: form.id || 'unknown',
                formAction: form.action || 'unknown',
                formMethod: form.method || 'unknown',
                timestamp: new Date().toISOString()
            };

            fetch('/api/admin/track-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'form_submit', data: formData })
            });
        });

        // Track form field interactions
        document.addEventListener('focus', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                const fieldData = {
                    sessionId: this.sessionId,
                    fieldId: e.target.id || 'unknown',
                    fieldName: e.target.name || 'unknown',
                    fieldType: e.target.type || 'unknown',
                    timestamp: new Date().toISOString()
                };

                fetch('/api/admin/track-client', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'field_focus', data: fieldData })
                });
            }
        }, true);
    }

    setupCTATracking() {
        // Track all CTA button clicks
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Check if it's a CTA button
            if (target.classList.contains('cta-button') || 
                target.classList.contains('cta') ||
                target.textContent.toLowerCase().includes('book') ||
                target.textContent.toLowerCase().includes('contact') ||
                target.textContent.toLowerCase().includes('call') ||
                target.textContent.toLowerCase().includes('email')) {
                
                const ctaData = {
                    sessionId: this.sessionId,
                    ctaText: target.textContent.trim(),
                    ctaId: target.id || 'unknown',
                    ctaClass: target.className,
                    ctaHref: target.href || 'unknown',
                    timestamp: new Date().toISOString()
                };

                fetch('/api/admin/track-client', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'cta_click', data: ctaData })
                });
            }
        });
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.clientTracker = new EnhancedClientTracker();
    });
} else {
    window.clientTracker = new EnhancedClientTracker();
}

