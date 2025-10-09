// Customer Portal JavaScript
class CustomerPortal {
    constructor() {
        this.customerEmail = null;
        this.bookings = [];
        this.filteredBookings = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkUrlParameters();
    }

    setupEventListeners() {
        // Search button
        document.getElementById('searchBookings').addEventListener('click', () => {
            this.searchCustomerBookings();
        });

        // Enter key on email input
        document.getElementById('customerEmail').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchCustomerBookings();
            }
        });

        // Filter controls
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('serviceFilter').addEventListener('change', () => {
            this.applyFilters();
        });
    }

    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const emailParam = urlParams.get('email');

        if (emailParam) {
            document.getElementById('customerEmail').value = emailParam;
            this.searchCustomerBookings();
        }
    }

    async searchCustomerBookings() {
        const email = document.getElementById('customerEmail').value.trim();

        if (!email || !this.isValidEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        this.customerEmail = email;
        this.showLoading();

        try {
            const response = await fetch(`/api/customer/bookings?email=${encodeURIComponent(email)}`);

            if (response.ok) {
                const data = await response.json();
                this.bookings = data.bookings || [];
                this.filteredBookings = [...this.bookings];
                this.displayBookings();
                this.updateSummary();
                this.showBookingsSection();
            } else if (response.status === 404) {
                this.showNoBookings();
            } else {
                throw new Error('Failed to fetch bookings');
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            this.showError('Failed to load bookings. Please try again.');
        }
    }

    displayBookings() {
        const bookingsList = document.getElementById('bookingsList');

        if (this.filteredBookings.length === 0) {
            bookingsList.innerHTML = '<div class="no-data">No bookings found with current filters</div>';
            return;
        }

        bookingsList.innerHTML = this.filteredBookings.map(booking => this.createBookingItem(booking)).join('');
    }

    createBookingItem(booking) {
        const status = booking.status || 'pending';
        const statusClass = status.toLowerCase();
        const serviceName = this.getServiceName(booking.service ? .type || booking.service);
        const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <div class="booking-item">
                <div class="booking-info">
                    <div class="booking-service">${serviceName}</div>
                    <div class="booking-details">
                        <span>📅 ${formattedDate}</span>
                        <span>🕐 ${booking.time}</span>
                        <span>🆔 ${booking.bookingId}</span>
                        <span>👤 ${booking.contact?.firstName || ''} ${booking.contact?.lastName || ''}</span>
                    </div>
                </div>
                <div class="booking-actions">
                    <span class="booking-status ${statusClass}">${status}</span>
                    ${this.getActionButtons(booking)}
                </div>
            </div>
        `;
    }

    getActionButtons(booking) {
        const buttons = [];
        const status = booking.status || 'pending';
        const bookingId = booking.bookingId;

        if (status === 'pending') {
            buttons.push(`<button class="action-button primary" onclick="customerPortal.confirmBooking('${bookingId}')">Confirm</button>`);
            buttons.push(`<button class="action-button" onclick="customerPortal.cancelBooking('${bookingId}')">Cancel</button>`);
        } else if (status === 'confirmed') {
            buttons.push(`<button class="action-button" onclick="customerPortal.rescheduleBooking('${bookingId}')">Reschedule</button>`);
            buttons.push(`<button class="action-button" onclick="customerPortal.cancelBooking('${bookingId}')">Cancel</button>`);
        } else if (status === 'completed') {
            buttons.push(`<button class="action-button" onclick="customerPortal.downloadCertificate('${bookingId}')">Certificate</button>`);
        }

        buttons.push(`<button class="action-button" onclick="customerPortal.viewDetails('${bookingId}')">Details</button>`);

        return buttons.join('');
    }

    getServiceName(serviceKey) {
        const serviceNames = {
            'cissp': 'CISSP Training',
            'cism': 'CISM Training',
            'iso27001': 'ISO 27001 Lead Auditor',
            'corporate': 'Corporate Security Awareness',
            'privacy': 'PHIPA/PIPEDA Privacy Training',
            'tabletop': 'Executive Tabletop Exercises',
            'ai-security': 'AI Security Training',
            'educational': 'Student & Educational Programs'
        };

        return serviceNames[serviceKey] || serviceKey;
    }

    applyFilters() {
        const statusFilter = document.getElementById('statusFilter').value;
        const serviceFilter = document.getElementById('serviceFilter').value;

        this.filteredBookings = this.bookings.filter(booking => {
            const status = booking.status || 'pending';
            const serviceType = booking.service ? .type || booking.service;
            const statusMatch = statusFilter === 'all' || status === statusFilter;
            const serviceMatch = serviceFilter === 'all' || serviceType === serviceFilter;

            return statusMatch && serviceMatch;
        });

        this.displayBookings();
    }

    updateSummary() {
        const totalBookings = this.bookings.length;
        const confirmedBookings = this.bookings.filter(b => (b.status || 'pending') === 'confirmed').length;
        const pendingBookings = this.bookings.filter(b => (b.status || 'pending') === 'pending').length;
        const completedSessions = this.bookings.filter(b => (b.status || 'pending') === 'completed').length;

        document.getElementById('totalBookings').textContent = totalBookings;
        document.getElementById('confirmedBookings').textContent = confirmedBookings;
        document.getElementById('pendingBookings').textContent = pendingBookings;
        document.getElementById('completedSessions').textContent = completedSessions;
    }

    showBookingsSection() {
        document.getElementById('bookingsSection').style.display = 'block';
        document.getElementById('resourcesSection').style.display = 'block';

        // Scroll to bookings section
        document.getElementById('bookingsSection').scrollIntoView({
            behavior: 'smooth'
        });
    }

    showNoBookings() {
        const bookingsList = document.getElementById('bookingsList');
        bookingsList.innerHTML = `
            <div class="no-data">
                <h3>No bookings found</h3>
                <p>We couldn't find any bookings for this email address.</p>
                <p>Please check your email address or <a href="booking.html">make a new booking</a>.</p>
            </div>
        `;

        this.showBookingsSection();
    }

    showError(message) {
        const bookingsList = document.getElementById('bookingsList');
        bookingsList.innerHTML = `
            <div class="no-data">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    showLoading() {
        const bookingsList = document.getElementById('bookingsList');
        bookingsList.innerHTML = '<div class="loading">Searching for your bookings...</div>';
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Booking Actions
    async confirmBooking(bookingId) {
        try {
            const response = await fetch(`/api/customer/bookings/${bookingId}/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: this.customerEmail })
            });

            if (response.ok) {
                this.showSuccess('Booking confirmed successfully!');
                this.searchCustomerBookings(); // Refresh the list
            } else {
                throw new Error('Failed to confirm booking');
            }
        } catch (error) {
            this.showError('Failed to confirm booking. Please contact support.');
        }
    }

    async cancelBooking(bookingId) {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            const response = await fetch(`/api/customer/bookings/${bookingId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: this.customerEmail })
            });

            if (response.ok) {
                this.showSuccess('Booking cancelled successfully!');
                this.searchCustomerBookings(); // Refresh the list
            } else {
                throw new Error('Failed to cancel booking');
            }
        } catch (error) {
            this.showError('Failed to cancel booking. Please contact support.');
        }
    }

    rescheduleBooking(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
            // Redirect to booking page with pre-filled data
            const params = new URLSearchParams({
                service: booking.service,
                reschedule: 'true',
                bookingId: bookingId
            });
            window.location.href = `booking.html?${params.toString()}`;
        }
    }

    downloadCertificate(bookingId) {
        // Placeholder for certificate download
        alert('Certificate download feature coming soon!');
    }

    viewDetails(bookingId) {
            const booking = this.bookings.find(b => b.id === bookingId);
            if (booking) {
                const details = `
                Booking ID: ${booking.id}
                Service: ${this.getServiceName(booking.service)}
                Date: ${new Date(booking.date).toLocaleDateString()}
                Time: ${booking.time}
                Status: ${booking.status}
                Email: ${booking.email}
                Phone: ${booking.phone}
                Created: ${new Date(booking.createdAt).toLocaleString()}
                ${booking.notes ? `Notes: ${booking.notes}` : ''}
            `;
            
            alert(details);
        }
    }
    
    showSuccess(message) {
        // Simple success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
}

// Global functions
function openLiveChat() {
    alert('Live chat feature coming soon! For now, please email support@alicesolutionsgroup.com');
}

// Initialize customer portal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.customerPortal = new CustomerPortal();
});