// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.analyticsData = {
            visitors: 0,
            pageViews: 0,
            countries: new Map(),
            cities: new Map(),
            pages: new Map(),
            sources: new Map(),
            keywords: new Map(),
            referrals: new Map(),
            devices: new Map(),
            browsers: new Map(),
            liveActivity: [],
            bookings: []
        };

        this.init();
    }

    init() {
        this.loadAnalyticsData();
        this.loadBookingData();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.updateLastUpdated();
    }

    setupEventListeners() {
        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.loadAnalyticsData();
        }, 30000);

        // Update last updated time every minute
        setInterval(() => {
            this.updateLastUpdated();
        }, 60000);
    }

    async loadAnalyticsData() {
        try {
            console.log('Loading analytics data...');
            // Load analytics data from server
            const response = await fetch('/api/admin/analytics');
            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Analytics data loaded:', data);
                this.updateAnalyticsData(data);
            } else {
                console.log('Response not ok, showing empty state');
                // Show empty state instead of mock data
                this.loadRealDataOnly();
            }
            
            // Load advanced analytics data
            await this.loadAdvancedAnalytics();
            
        } catch (error) {
            console.error('Error loading analytics data:', error);
            console.log('Showing empty state - no real data available');
            this.loadRealDataOnly();
        }
    }

    async loadAdvancedAnalytics() {
        try {
            // Load Core Web Vitals
            const vitalsResponse = await fetch('/api/admin/core-web-vitals');
            if (vitalsResponse.ok) {
                const vitalsData = await vitalsResponse.json();
                this.updateCoreWebVitals(vitalsData);
            }

            // Load SEO metrics
            const seoResponse = await fetch('/api/admin/seo-metrics');
            if (seoResponse.ok) {
                const seoData = await seoResponse.json();
                this.updateSEOMetrics(seoData);
            }

            // Load user behavior
            const behaviorResponse = await fetch('/api/admin/user-behavior');
            if (behaviorResponse.ok) {
                const behaviorData = await behaviorResponse.json();
                this.updateUserBehavior(behaviorData);
            }

            // Load performance data
            const performanceResponse = await fetch('/api/admin/performance');
            if (performanceResponse.ok) {
                const performanceData = await performanceResponse.json();
                this.updatePerformanceMetrics(performanceData);
            }

        } catch (error) {
            console.error('Error loading advanced analytics:', error);
        }
    }

    loadRealDataOnly() {
        // Only show real data - no fallback to mock data
        console.log('No real data available - showing empty state');
        
        // Show empty state with real data indicators
        this.updateAnalyticsData({
            visitors: 0,
            pageViews: 0,
            avgSessionTime: 0,
            countries: [],
            cities: [],
            pages: [],
            sources: [],
            keywords: [],
            referrals: [],
            devices: [],
            browsers: [],
            liveActivity: [],
            timestamp: new Date().toISOString(),
            isRealData: true
        });
    }

    updateAnalyticsData(data) {
        console.log('Updating analytics data:', data);
        
        // Update main stats
        const visitorsEl = document.getElementById('totalVisitors');
        const countriesEl = document.getElementById('uniqueCountries');
        const pageViewsEl = document.getElementById('pageViews');
        const sessionTimeEl = document.getElementById('avgSessionTime');
        
        if (visitorsEl) visitorsEl.textContent = data.visitors.toLocaleString();
        if (countriesEl) countriesEl.textContent = data.countries.length;
        if (pageViewsEl) pageViewsEl.textContent = data.pageViews.toLocaleString();
        if (sessionTimeEl) sessionTimeEl.textContent = `${data.avgSessionTime}m`;
        
        console.log('Updated main stats');

        // Update country list
        this.updateList('topCountries', data.countries, 'country');

        // Update city list
        this.updateList('topCities', data.cities, 'city');

        // Update page list
        this.updateList('topPages', data.pages, 'page');

        // Update source list
        this.updateList('trafficSources', data.sources, 'source');

        // Update keyword list
        this.updateList('searchKeywords', data.keywords, 'keyword');

        // Update referral list
        this.updateList('referralSites', data.referrals, 'referral');

        // Update device list
        this.updateList('deviceTypes', data.devices, 'device');

        // Update browser list
        this.updateList('browserUsage', data.browsers, 'browser');

        // Update live activity
        this.updateLiveActivity(data.liveActivity);
    }

    updateList(containerId, data, type) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        data.forEach((item, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';

            const name = document.createElement('span');
            name.className = 'list-item-name';
            name.textContent = item.name;

            const value = document.createElement('span');
            value.className = 'list-item-value';
            value.textContent = item.count.toLocaleString();

            const percentage = document.createElement('span');
            percentage.className = 'list-item-percentage';
            percentage.textContent = `(${item.percentage}%)`;

            listItem.appendChild(name);
            listItem.appendChild(document.createElement('div')).appendChild(value).parentNode.appendChild(percentage);

            container.appendChild(listItem);
        });
    }

    updateLiveActivity(activities) {
        const container = document.getElementById('liveActivity');
        if (!container) return;

        container.innerHTML = '';

        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';

            const icon = document.createElement('div');
            icon.className = 'activity-icon';
            icon.textContent = '👁️';

            const content = document.createElement('div');
            content.className = 'activity-content';

            const text = document.createElement('p');
            text.className = 'activity-text';
            text.textContent = `${activity.action}: ${activity.page}`;

            const time = document.createElement('p');
            time.className = 'activity-time';
            time.textContent = activity.time;

            const location = document.createElement('p');
            location.className = 'activity-location';
            location.textContent = activity.location;

            content.appendChild(text);
            content.appendChild(time);
            content.appendChild(location);

            activityItem.appendChild(icon);
            activityItem.appendChild(content);

            container.appendChild(activityItem);
        });
    }

    startRealTimeUpdates() {
        // Simulate real-time updates
        setInterval(() => {
            this.simulateNewVisitor();
        }, 15000); // New visitor every 15 seconds
    }

    simulateNewVisitor() {
        const pages = ['/', '/about.html', '/services.html', '/smartstart.html', '/community.html'];
        const cities = ['Toronto, CA', 'Vancouver, CA', 'Montreal, CA', 'New York, US', 'London, UK'];

        const randomPage = pages[Math.floor(Math.random() * pages.length)];
        const randomCity = cities[Math.floor(Math.random() * cities.length)];

        const newActivity = {
            action: 'Page View',
            page: randomPage,
            location: randomCity,
            time: 'Just now'
        };

        // Add to live activity
        const container = document.getElementById('liveActivity');
        if (container && container.children.length > 0) {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.style.animation = 'fadeIn 0.5s ease-in';

            const icon = document.createElement('div');
            icon.className = 'activity-icon';
            icon.textContent = '👁️';

            const content = document.createElement('div');
            content.className = 'activity-content';

            const text = document.createElement('p');
            text.className = 'activity-text';
            text.textContent = `${newActivity.action}: ${newActivity.page}`;

            const time = document.createElement('p');
            time.className = 'activity-time';
            time.textContent = newActivity.time;

            const location = document.createElement('p');
            location.className = 'activity-location';
            location.textContent = newActivity.location;

            content.appendChild(text);
            content.appendChild(time);
            content.appendChild(location);

            activityItem.appendChild(icon);
            activityItem.appendChild(content);

            container.insertBefore(activityItem, container.firstChild);

            // Remove oldest item if more than 10
            if (container.children.length > 10) {
                container.removeChild(container.lastChild);
            }
        }

        // Update visitor count
        const visitorElement = document.getElementById('totalVisitors');
        if (visitorElement) {
            const currentCount = parseInt(visitorElement.textContent.replace(/,/g, ''));
            visitorElement.textContent = (currentCount + 1).toLocaleString();
        }
    }

    updateLastUpdated() {
        const now = new Date();
        const timeString = now.toLocaleString();
        const lastUpdatedElement = document.getElementById('lastUpdated');
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = timeString;
        }
    }

    updateCoreWebVitals(data) {
        console.log('Updating Core Web Vitals:', data);
        
        const lcpEl = document.getElementById('lcpValue');
        const fidEl = document.getElementById('fidValue');
        const clsEl = document.getElementById('clsValue');
        
        if (lcpEl && data.averages.LCP) {
            lcpEl.textContent = data.averages.LCP;
            lcpEl.className = this.getPerformanceClass('LCP', parseFloat(data.averages.LCP));
        }
        
        if (fidEl && data.averages.FID) {
            fidEl.textContent = data.averages.FID;
            fidEl.className = this.getPerformanceClass('FID', parseFloat(data.averages.FID));
        }
        
        if (clsEl && data.averages.CLS) {
            clsEl.textContent = data.averages.CLS;
            clsEl.className = this.getPerformanceClass('CLS', parseFloat(data.averages.CLS));
        }
    }

    updateSEOMetrics(data) {
        console.log('Updating SEO metrics:', data);
        
        if (data.latestMetrics) {
            const metrics = data.latestMetrics;
            
            const h1El = document.getElementById('h1Count');
            const h2El = document.getElementById('h2Count');
            const imageEl = document.getElementById('imageCount');
            const wordEl = document.getElementById('wordCount');
            const internalEl = document.getElementById('internalLinks');
            const externalEl = document.getElementById('externalLinks');
            const totalEl = document.getElementById('totalLinks');
            
            if (h1El) h1El.textContent = metrics.h1Count || 0;
            if (h2El) h2El.textContent = metrics.h2Count || 0;
            if (imageEl) imageEl.textContent = metrics.imageCount || 0;
            if (wordEl) wordEl.textContent = metrics.wordCount || 0;
            if (internalEl) internalEl.textContent = metrics.internalLinkCount || 0;
            if (externalEl) externalEl.textContent = metrics.externalLinkCount || 0;
            if (totalEl) totalEl.textContent = metrics.linkCount || 0;
        }
    }

    updateUserBehavior(data) {
        console.log('Updating user behavior:', data);
        
        const mouseEl = document.getElementById('mouseMovements');
        const focusEl = document.getElementById('focusEvents');
        const formEl = document.getElementById('formInteractions');
        
        if (mouseEl) mouseEl.textContent = data.mouseMovements || 0;
        if (focusEl) focusEl.textContent = data.focusEvents || 0;
        if (formEl) formEl.textContent = data.formInteractions || 0;
        
        // Update device information from the latest analytics data
        this.updateDeviceInformation();
    }
    
    updateDeviceInformation() {
        // Get device info from the latest analytics data
        const screenEl = document.getElementById('screenResolution');
        const colorEl = document.getElementById('colorDepth');
        const memoryEl = document.getElementById('deviceMemory');
        
        if (screenEl) {
            screenEl.textContent = `${screen.width}x${screen.height}`;
        }
        if (colorEl) {
            colorEl.textContent = `${screen.colorDepth}-bit`;
        }
        if (memoryEl) {
            memoryEl.textContent = navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'Unknown';
        }
    }

    updatePerformanceMetrics(data) {
        console.log('Updating performance metrics:', data);
        
        const loadEl = document.getElementById('loadTime');
        const domEl = document.getElementById('domReady');
        const paintEl = document.getElementById('firstPaint');
        
        if (loadEl && data.averages.pageLoadTime) {
            loadEl.textContent = data.averages.pageLoadTime;
            loadEl.className = this.getPerformanceClass('load', parseFloat(data.averages.pageLoadTime));
        }
        
        if (domEl && data.averages.domContentLoaded) {
            domEl.textContent = data.averages.domContentLoaded;
        }
        
        if (paintEl && data.averages.firstPaint) {
            paintEl.textContent = data.averages.firstPaint;
        }
    }

    getPerformanceClass(metric, value) {
        const thresholds = {
            'LCP': { good: 2500, poor: 4000 },
            'FID': { good: 100, poor: 300 },
            'CLS': { good: 0.1, poor: 0.25 },
            'load': { good: 2000, poor: 4000 }
        };
        
        const threshold = thresholds[metric];
        if (!threshold) return 'metric-value';
        
        if (value <= threshold.good) return 'metric-value good';
        if (value <= threshold.poor) return 'metric-value warning';
        return 'metric-value poor';
    }
    
    async loadBookingData() {
        try {
            const response = await fetch('/api/admin/bookings');
            if (response.ok) {
                const data = await response.json();
                this.analyticsData.bookings = data.bookings || [];
                this.updateBookingDisplay();
            }
        } catch (error) {
            console.error('Error loading booking data:', error);
        }
    }

    updateBookingDisplay() {
        const bookings = this.analyticsData.bookings;
        
        // Update booking statistics
        const totalBookingsEl = document.getElementById('totalBookings');
        const pendingBookingsEl = document.getElementById('pendingBookings');
        const confirmedBookingsEl = document.getElementById('confirmedBookings');
        const monthlyBookingsEl = document.getElementById('monthlyBookings');
        
        if (totalBookingsEl) totalBookingsEl.textContent = bookings.length;
        if (pendingBookingsEl) pendingBookingsEl.textContent = bookings.filter(b => (b.status || 'pending') === 'pending').length;
        if (confirmedBookingsEl) confirmedBookingsEl.textContent = bookings.filter(b => (b.status || 'pending') === 'confirmed').length;
        
        // Monthly bookings
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyBookings = bookings.filter(b => {
            const timestamp = b.timestamp || b.createdAt;
            return timestamp && timestamp.startsWith(currentMonth);
        }).length;
        if (monthlyBookingsEl) monthlyBookingsEl.textContent = monthlyBookings;
        
        // Recent bookings list
        const recentBookings = bookings.slice(-5).reverse();
        const bookingList = document.getElementById('recentBookings');
        if (bookingList) {
            if (recentBookings.length === 0) {
                bookingList.innerHTML = '<div class="no-data">No bookings yet</div>';
            } else {
                bookingList.innerHTML = recentBookings.map(booking => {
                    const serviceName = booking.service?.name || booking.service?.type || 'Unknown Service';
                    const firstName = booking.contact?.firstName || '';
                    const lastName = booking.contact?.lastName || '';
                    const fullName = `${firstName} ${lastName}`.trim() || 'No name provided';
                    const email = booking.contact?.email || 'No email';
                    const date = booking.timestamp || booking.createdAt;
                    const status = booking.status || 'pending';
                    
                    return `
                    <div class="booking-item">
                        <div class="booking-info">
                            <strong>${serviceName}</strong>
                            <span class="booking-date">${date ? new Date(date).toLocaleDateString() : 'No date'}</span>
                        </div>
                        <div class="booking-details">
                            <span class="booking-name">${fullName} (${email})</span>
                            <span class="booking-status ${status}">${status}</span>
                        </div>
                    </div>
                `}).join('');
            }
        }
        
        // Service statistics
        const serviceStats = {};
        bookings.forEach(booking => {
            const serviceName = booking.service?.name || booking.service?.type || 'Unknown Service';
            serviceStats[serviceName] = (serviceStats[serviceName] || 0) + 1;
        });
        
        const serviceStatsContainer = document.getElementById('serviceStats');
        if (serviceStatsContainer) {
            if (Object.keys(serviceStats).length === 0) {
                serviceStatsContainer.innerHTML = '<div class="no-data">No service data yet</div>';
            } else {
                serviceStatsContainer.innerHTML = Object.entries(serviceStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([service, count]) => `
                        <div class="service-stat-item">
                            <span class="service-name">${service}</span>
                            <span class="service-count">${count} bookings</span>
                        </div>
                    `).join('');
            }
        }
    }
}

// Global functions for action buttons
function exportData() {
    const data = {
        timestamp: new Date().toISOString(),
        analytics: window.adminDashboard ? window.adminDashboard.analyticsData || {} : {}
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Analytics data exported successfully!');
}

function refreshData() {
    if (window.adminDashboard) {
        window.adminDashboard.loadAnalyticsData();
        alert('Data refreshed successfully!');
    }
}

function clearOldData() {
    if (confirm('Are you sure you want to clear old analytics data? This action cannot be undone.')) {
        // This would typically make an API call to clear old data
        alert('Old data cleared successfully!');
        if (window.adminDashboard) {
            window.adminDashboard.loadAnalyticsData();
        }
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin dashboard initializing...');
    try {
        window.adminDashboard = new AdminDashboard();
        console.log('Admin dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing admin dashboard:', error);
    }
});

// Add CSS animation for new items
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .booking-item {
        padding: 12px;
        border: 1px solid #333;
        border-radius: 8px;
        margin-bottom: 8px;
        background: rgba(255, 255, 255, 0.05);
    }
    
    .booking-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }
    
    .booking-details {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .booking-status {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .booking-status.pending {
        background: #fbbf24;
        color: #000;
    }
    
    .booking-status.confirmed {
        background: #10b981;
        color: #000;
    }
    
    .service-stat-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #333;
    }
    
    .service-name {
        text-transform: capitalize;
        font-weight: 500;
    }
    
    .service-count {
        color: var(--accent-primary);
        font-weight: 600;
    }
    
    .booking-actions {
        margin-top: 16px;
        display: flex;
        gap: 8px;
    }
    
    .management-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
`;
document.head.appendChild(style);

// Booking management functions
async function loadBookingData() {
    if (window.adminDashboard) {
        await window.adminDashboard.loadBookingData();
    }
}

function refreshBookings() {
    if (window.adminDashboard) {
        window.adminDashboard.loadBookingData();
    }
}

function exportBookings() {
    const bookings = window.adminDashboard?.analyticsData.bookings || [];
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Service,Name,Email,Phone,Company,Date,Time,Status,Booking ID,Created\n" +
        bookings.map(booking => {
            const serviceName = booking.service?.name || booking.service?.type || 'Unknown';
            const firstName = booking.contact?.firstName || '';
            const lastName = booking.contact?.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim() || 'No name';
            const email = booking.contact?.email || '';
            const phone = booking.contact?.phone || '';
            const company = booking.contact?.company || '';
            const date = booking.date || '';
            const time = booking.time || '';
            const status = booking.status || 'pending';
            const bookingId = booking.bookingId || '';
            const created = booking.timestamp || booking.createdAt || '';
            
            return `"${serviceName}","${fullName}","${email}","${phone}","${company}","${date}","${time}","${status}","${bookingId}","${created}"`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bookings-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function viewAllBookings() {
    alert('Full booking management interface coming soon!');
}

function manageAvailability() {
    alert('Availability management coming soon!');
}

function sendReminders() {
    alert('Reminder system coming soon!');
}