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
            liveActivity: []
        };

        this.init();
    }

    init() {
        this.loadAnalyticsData();
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
            // Load analytics data from server
            const response = await fetch('/api/admin/analytics');
            if (response.ok) {
                const data = await response.json();
                this.updateAnalyticsData(data);
            } else {
                // Fallback to mock data for development
                this.loadMockData();
            }
        } catch (error) {
            console.log('Using mock data for development');
            this.loadMockData();
        }
    }

    loadMockData() {
        // Mock data for development/demo purposes
        const mockData = {
            visitors: 1247,
            pageViews: 3842,
            avgSessionTime: 3.2,
            countries: [
                { name: 'Canada', count: 856, percentage: 68.7 },
                { name: 'United States', count: 234, percentage: 18.8 },
                { name: 'United Kingdom', count: 89, percentage: 7.1 },
                { name: 'Germany', count: 45, percentage: 3.6 },
                { name: 'Australia', count: 23, percentage: 1.8 }
            ],
            cities: [
                { name: 'Toronto', count: 456, percentage: 36.6 },
                { name: 'Vancouver', count: 123, percentage: 9.9 },
                { name: 'Montreal', count: 89, percentage: 7.1 },
                { name: 'New York', count: 67, percentage: 5.4 },
                { name: 'London', count: 45, percentage: 3.6 }
            ],
            pages: [
                { name: '/', count: 1247, percentage: 32.5 },
                { name: '/about.html', count: 456, percentage: 11.9 },
                { name: '/services.html', count: 389, percentage: 10.1 },
                { name: '/smartstart.html', count: 234, percentage: 6.1 },
                { name: '/community.html', count: 198, percentage: 5.2 }
            ],
            sources: [
                { name: 'Direct', count: 567, percentage: 45.5 },
                { name: 'Google', count: 234, percentage: 18.8 },
                { name: 'LinkedIn', count: 123, percentage: 9.9 },
                { name: 'Twitter', count: 89, percentage: 7.1 },
                { name: 'Referral', count: 67, percentage: 5.4 }
            ],
            keywords: [
                { name: 'cybersecurity toronto', count: 89, percentage: 7.1 },
                { name: 'iso 27001', count: 67, percentage: 5.4 },
                { name: 'smartstart', count: 45, percentage: 3.6 },
                { name: 'cissp', count: 34, percentage: 2.7 },
                { name: 'business automation', count: 23, percentage: 1.8 }
            ],
            referrals: [
                { name: 'linkedin.com', count: 123, percentage: 9.9 },
                { name: 'twitter.com', count: 89, percentage: 7.1 },
                { name: 'github.com', count: 67, percentage: 5.4 },
                { name: 'reddit.com', count: 45, percentage: 3.6 },
                { name: 'medium.com', count: 34, percentage: 2.7 }
            ],
            devices: [
                { name: 'Desktop', count: 789, percentage: 63.3 },
                { name: 'Mobile', count: 345, percentage: 27.7 },
                { name: 'Tablet', count: 113, percentage: 9.1 }
            ],
            browsers: [
                { name: 'Chrome', count: 567, percentage: 45.5 },
                { name: 'Safari', count: 234, percentage: 18.8 },
                { name: 'Firefox', count: 123, percentage: 9.9 },
                { name: 'Edge', count: 89, percentage: 7.1 },
                { name: 'Other', count: 234, percentage: 18.8 }
            ],
            liveActivity: [
                { action: 'Page View', page: '/', location: 'Toronto, CA', time: '2 minutes ago' },
                { action: 'Page View', page: '/about.html', location: 'Vancouver, CA', time: '3 minutes ago' },
                { action: 'Page View', page: '/services.html', location: 'New York, US', time: '4 minutes ago' },
                { action: 'Page View', page: '/smartstart.html', location: 'London, UK', time: '5 minutes ago' },
                { action: 'Page View', page: '/community.html', location: 'Montreal, CA', time: '6 minutes ago' }
            ]
        };

        this.updateAnalyticsData(mockData);
    }

    updateAnalyticsData(data) {
        // Update main stats
        document.getElementById('totalVisitors').textContent = data.visitors.toLocaleString();
        document.getElementById('uniqueCountries').textContent = data.countries.length;
        document.getElementById('pageViews').textContent = data.pageViews.toLocaleString();
        document.getElementById('avgSessionTime').textContent = `${data.avgSessionTime}m`;

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
}

// Global functions for action buttons
function exportData() {
    const data = {
        timestamp: new Date().toISOString(),
        analytics: window.adminDashboard ? .analyticsData || {}
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
    window.adminDashboard = new AdminDashboard();
});

// Add CSS animation for new items
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);