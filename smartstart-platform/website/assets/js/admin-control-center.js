// ADMIN CONTROL CENTER - Complete System Monitoring
class AdminControlCenter {
    constructor() {
        this.data = {
            analytics: {},
            bookings: [],
            emails: [],
            securityTests: [],
            search: {},
            seo: {},
            system: {}
        };
        this.init();
    }

    init() {
        this.loadAllData();
        this.setupRealTimeUpdates();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Auto-refresh every 30 seconds
        setInterval(() => this.loadAllData(), 30000);
        
        // Refresh button
        document.getElementById('refresh-all')?.addEventListener('click', () => {
            this.loadAllData();
            this.showNotification('Data refreshed', 'success');
        });
    }

    setupRealTimeUpdates() {
        // Real-time booking updates
        setInterval(() => this.loadBookingData(), 60000);
        
        // Real-time email monitoring
        setInterval(() => this.loadEmailData(), 60000);
        
        // Real-time security test monitoring
        setInterval(() => this.loadSecurityTestData(), 60000);
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.loadAnalyticsData(),
                this.loadBookingData(),
                this.loadEmailData(),
                this.loadSecurityTestData(),
                this.loadSearchData(),
                this.loadSEOData(),
                this.loadSystemData()
            ]);
            this.updateLastUpdated();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // ANALYTICS - Who goes to what page
    async loadAnalyticsData() {
        try {
            const response = await fetch('/api/admin/analytics');
            if (response.ok) {
                const data = await response.json();
                this.data.analytics = data;
                this.displayAnalytics();
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    displayAnalytics() {
        // Total visitors
        document.getElementById('total-visitors')?.textContent = this.data.analytics.totalVisitors || 0;
        document.getElementById('unique-visitors')?.textContent = this.data.analytics.uniqueVisitors || 0;
        document.getElementById('page-views')?.textContent = this.data.analytics.pageViews || 0;

        // Top pages
        const topPages = this.data.analytics.topPages || [];
        const topPagesContainer = document.getElementById('top-pages');
        if (topPagesContainer) {
            topPagesContainer.innerHTML = topPages.slice(0, 10).map((page, index) => `
                <div class="page-item">
                    <span class="page-rank">${index + 1}</span>
                    <span class="page-name">${page.path}</span>
                    <span class="page-views">${page.views} views</span>
                </div>
            `).join('');
        }

        // Geographic data
        const countries = this.data.analytics.topCountries || [];
        const countriesContainer = document.getElementById('top-countries');
        if (countriesContainer) {
            countriesContainer.innerHTML = countries.slice(0, 5).map(country => `
                <div class="country-item">
                    <span class="country-name">${country.country}</span>
                    <span class="country-visitors">${country.visitors} visitors</span>
                </div>
            `).join('');
        }

        // Live activity
        const liveActivity = this.data.analytics.liveActivity || [];
        const liveContainer = document.getElementById('live-activity');
        if (liveContainer) {
            liveContainer.innerHTML = liveActivity.slice(0, 5).map(activity => `
                <div class="activity-item">
                    <span class="activity-page">${activity.page}</span>
                    <span class="activity-time">${this.formatTime(activity.timestamp)}</span>
                </div>
            `).join('');
        }
    }

    // BOOKINGS - Meeting system
    async loadBookingData() {
        try {
            const response = await fetch('/api/bookings');
            if (response.ok) {
                const data = await response.json();
                this.data.bookings = data.bookings || [];
                this.displayBookings();
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
        }
    }

    displayBookings() {
        const bookings = this.data.bookings;
        
        // Booking stats
        document.getElementById('total-bookings')?.textContent = bookings.length;
        document.getElementById('confirmed-bookings')?.textContent = bookings.filter(b => b.status === 'confirmed').length;
        document.getElementById('pending-bookings')?.textContent = bookings.filter(b => b.status === 'pending').length;
        document.getElementById('cancelled-bookings')?.textContent = bookings.filter(b => b.status === 'cancelled').length;

        // Recent bookings
        const recentBookings = bookings.slice(0, 10);
        const bookingsContainer = document.getElementById('recent-bookings');
        if (bookingsContainer) {
            bookingsContainer.innerHTML = recentBookings.map(booking => `
                <div class="booking-item">
                    <div class="booking-header">
                        <span class="booking-id">#${booking.bookingId}</span>
                        <span class="booking-status status-${booking.status}">${booking.status}</span>
                    </div>
                    <div class="booking-details">
                        <span class="booking-service">${booking.service?.name || 'N/A'}</span>
                        <span class="booking-date">${this.formatDate(booking.date)}</span>
                    </div>
                    <div class="booking-contact">
                        <span class="booking-name">${booking.contact?.firstName} ${booking.contact?.lastName}</span>
                        <span class="booking-email">${booking.contact?.email}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // EMAILS - Email system monitoring
    async loadEmailData() {
        try {
            const response = await fetch('/api/admin/emails');
            if (response.ok) {
                const data = await response.json();
                this.data.emails = data.emails || [];
                this.displayEmails();
            }
        } catch (error) {
            console.error('Error loading emails:', error);
        }
    }

    displayEmails() {
        const emails = this.data.emails;
        
        // Email stats
        document.getElementById('total-emails')?.textContent = emails.length;
        document.getElementById('sent-emails')?.textContent = emails.filter(e => e.status === 'sent').length;
        document.getElementById('failed-emails')?.textContent = emails.filter(e => e.status === 'failed').length;

        // Recent emails
        const recentEmails = emails.slice(0, 10);
        const emailsContainer = document.getElementById('recent-emails');
        if (emailsContainer) {
            emailsContainer.innerHTML = recentEmails.map(email => `
                <div class="email-item">
                    <div class="email-header">
                        <span class="email-to">To: ${email.to}</span>
                        <span class="email-status status-${email.status}">${email.status}</span>
                    </div>
                    <div class="email-subject">${email.subject}</div>
                    <div class="email-time">${this.formatTime(email.timestamp)}</div>
                </div>
            `).join('');
        }
    }

    // SECURITY TESTS - Quiestioneer monitoring
    async loadSecurityTestData() {
        try {
            const response = await fetch('/api/admin/security-tests');
            if (response.ok) {
                const data = await response.json();
                this.data.securityTests = data.tests || [];
                this.displaySecurityTests();
            }
        } catch (error) {
            console.error('Error loading security tests:', error);
        }
    }

    displaySecurityTests() {
        const tests = this.data.securityTests;
        
        // Security test stats
        document.getElementById('total-tests')?.textContent = tests.length;
        document.getElementById('completed-tests')?.textContent = tests.filter(t => t.status === 'completed').length;
        document.getElementById('in-progress-tests')?.textContent = tests.filter(t => t.status === 'in_progress').length;

        // Recent tests
        const recentTests = tests.slice(0, 10);
        const testsContainer = document.getElementById('recent-tests');
        if (testsContainer) {
            testsContainer.innerHTML = recentTests.map(test => `
                <div class="test-item">
                    <div class="test-header">
                        <span class="test-mode">${test.mode || 'standard'}</span>
                        <span class="test-status status-${test.status}">${test.status}</span>
                    </div>
                    <div class="test-details">
                        <span class="test-score">Score: ${test.score || 0}/36</span>
                        <span class="test-tier">Tier: ${test.tier || 'N/A'}</span>
                    </div>
                    <div class="test-contact">
                        <span class="test-email">${test.email || 'Anonymous'}</span>
                        <span class="test-time">${this.formatTime(test.timestamp)}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // SEARCH - Search analytics
    async loadSearchData() {
        try {
            const response = await fetch('/api/admin/search-analytics');
            if (response.ok) {
                const data = await response.json();
                this.data.search = data;
                this.displaySearchAnalytics();
            }
        } catch (error) {
            console.error('Error loading search analytics:', error);
        }
    }

    displaySearchAnalytics() {
        const search = this.data.search;
        
        // Search stats
        document.getElementById('total-searches')?.textContent = search.totalSearches || 0;
        document.getElementById('unique-searches')?.textContent = search.uniqueSearches || 0;
        document.getElementById('no-results')?.textContent = search.noResults || 0;

        // Top searches
        const topSearches = search.topSearches || [];
        const searchesContainer = document.getElementById('top-searches');
        if (searchesContainer) {
            searchesContainer.innerHTML = topSearches.slice(0, 10).map(searchTerm => `
                <div class="search-item">
                    <span class="search-term">${searchTerm.term}</span>
                    <span class="search-count">${searchTerm.count} searches</span>
                </div>
            `).join('');
        }
    }

    // SEO - SEO metrics
    async loadSEOData() {
        try {
            const response = await fetch('/api/admin/seo-metrics');
            if (response.ok) {
                const data = await response.json();
                this.data.seo = data;
                this.displaySEOMetrics();
            }
        } catch (error) {
            console.error('Error loading SEO metrics:', error);
        }
    }

    displaySEOMetrics() {
        const seo = this.data.seo;
        
        // SEO stats
        document.getElementById('total-pages')?.textContent = seo.totalPages || 0;
        document.getElementById('indexed-pages')?.textContent = seo.indexedPages || 0;
        document.getElementById('avg-word-count')?.textContent = seo.avgWordCount || 0;
        document.getElementById('avg-load-time')?.textContent = `${seo.avgLoadTime || 0}ms`;
    }

    // SYSTEM - System health
    async loadSystemData() {
        try {
            const response = await fetch('/api/admin/system-health');
            if (response.ok) {
                const data = await response.json();
                this.data.system = data;
                this.displaySystemHealth();
            }
        } catch (error) {
            console.error('Error loading system health:', error);
        }
    }

    displaySystemHealth() {
        const system = this.data.system;
        
        // System stats
        document.getElementById('server-status')?.textContent = system.status || 'unknown';
        document.getElementById('uptime')?.textContent = system.uptime || 'N/A';
        document.getElementById('memory-usage')?.textContent = system.memoryUsage || 'N/A';
        document.getElementById('cpu-usage')?.textContent = system.cpuUsage || 'N/A';
    }

    // Utility functions
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
        return date.toLocaleDateString();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    updateLastUpdated() {
        const now = new Date();
        document.getElementById('last-updated')?.textContent = now.toLocaleTimeString();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminControlCenter = new AdminControlCenter();
});

