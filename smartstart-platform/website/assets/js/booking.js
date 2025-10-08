// Professional Booking System JavaScript

class BookingSystem {
    constructor() {
        this.currentStep = 1;
        this.selectedService = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.bookingData = {};
        
        this.init();
    }
    
    init() {
        console.log('BookingSystem init started');
        this.setupEventListeners();
        this.handleUrlParameters();
        this.generateCalendar();
        this.generateTimeSlots();
        console.log('BookingSystem init completed');
    }
    
    handleUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const serviceParam = urlParams.get('service');
        
        if (serviceParam) {
            // Pre-select service if specified in URL
            const serviceCard = document.querySelector(`[data-service="${serviceParam}"]`);
            if (serviceCard) {
                this.selectService(serviceCard);
            }
        }
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Service selection
        const serviceCards = document.querySelectorAll('.service-card');
        console.log('Found service cards:', serviceCards.length);
        serviceCards.forEach(card => {
            card.addEventListener('click', (e) => {
                console.log('Service card clicked:', e.currentTarget.dataset.service);
                this.selectService(e.currentTarget);
            });
        });
        
        // Step navigation
        const nextButton1 = document.getElementById('next-step-1');
        console.log('Next button 1 found:', !!nextButton1);
        nextButton1?.addEventListener('click', () => this.nextStep());
        
        document.getElementById('back-step-2')?.addEventListener('click', () => this.prevStep());
        document.getElementById('next-step-2')?.addEventListener('click', () => this.nextStep());
        document.getElementById('back-step-3')?.addEventListener('click', () => this.prevStep());
        document.getElementById('submit-booking')?.addEventListener('click', () => this.submitBooking());
        
        // Calendar navigation
        document.getElementById('prev-month')?.addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('next-month')?.addEventListener('click', () => this.changeMonth(1));
        
        // Form validation
        document.getElementById('booking-form')?.addEventListener('input', () => this.validateForm());
        
        console.log('Event listeners setup complete');
    }
    
    selectService(card) {
        // Remove previous selection
        document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection to clicked card
        card.classList.add('selected');
        this.selectedService = card.dataset.service;
        
        // Enable next button and update styling
        const nextButton = document.getElementById('next-step-1');
        nextButton.disabled = false;
        nextButton.style.opacity = '1';
        nextButton.style.cursor = 'pointer';
        
        // Store service data
        this.bookingData.service = {
            type: this.selectedService,
            name: card.querySelector('h3').textContent,
            price: card.querySelector('.service-price').textContent
        };
        
        console.log('Service selected:', this.bookingData.service);
    }
    
    nextStep() {
        console.log('Next step clicked, current step:', this.currentStep);
        if (this.currentStep < 4) {
            this.currentStep++;
            this.updateStepDisplay();
            console.log('Moved to step:', this.currentStep);
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }
    
    updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.booking-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        document.getElementById(`step-${this.currentStep}`).classList.add('active');
        
        // Update step-specific functionality
        if (this.currentStep === 2) {
            this.generateCalendar();
        }
    }
    
    generateCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        if (!calendarGrid) return;
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Get first day of month and number of days
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Clear calendar
        calendarGrid.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = day;
            header.style.fontWeight = '600';
            header.style.color = 'var(--accent-primary)';
            calendarGrid.appendChild(header);
        });
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day available';
            dayElement.textContent = day;
            dayElement.dataset.day = day;
            dayElement.dataset.date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            // Check if date is in the past
            const date = new Date(currentYear, currentMonth, day);
            if (date < now.setHours(0, 0, 0, 0)) {
                dayElement.classList.remove('available');
                dayElement.classList.add('unavailable');
            } else {
                dayElement.addEventListener('click', () => this.selectDate(dayElement));
            }
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    selectDate(dayElement) {
        // Remove previous selection
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Add selection to clicked day
        dayElement.classList.add('selected');
        this.selectedDate = dayElement.dataset.date;
        
        // Enable next button
        document.getElementById('next-step-2').disabled = false;
        
        // Store date data
        this.bookingData.date = this.selectedDate;
        
        // Regenerate time slots for selected date
        this.generateTimeSlots();
    }
    
    generateTimeSlots() {
        const timeSlotsContainer = document.getElementById('time-slots');
        if (!timeSlotsContainer) return;
        
        // Available time slots (9 AM to 5 PM, 1-hour slots)
        const timeSlots = [
            '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
            '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
        ];
        
        // Clear existing slots
        timeSlotsContainer.innerHTML = '';
        
        timeSlots.forEach(time => {
            const slotElement = document.createElement('div');
            slotElement.className = 'time-slot available';
            slotElement.textContent = time;
            slotElement.dataset.time = time;
            
            // Randomly mark some slots as unavailable (simulate existing bookings)
            if (Math.random() < 0.3) {
                slotElement.classList.remove('available');
                slotElement.classList.add('unavailable');
            } else {
                slotElement.addEventListener('click', () => this.selectTime(slotElement));
            }
            
            timeSlotsContainer.appendChild(slotElement);
        });
    }
    
    selectTime(timeElement) {
        // Remove previous selection
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Add selection to clicked time
        timeElement.classList.add('selected');
        this.selectedTime = timeElement.dataset.time;
        
        // Store time data
        this.bookingData.time = this.selectedTime;
    }
    
    changeMonth(direction) {
        // This would update the calendar to show next/previous month
        // For now, we'll just regenerate the current month
        this.generateCalendar();
    }
    
    validateForm() {
        const form = document.getElementById('booking-form');
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
            }
        });
        
        // Enable/disable submit button
        const submitBtn = document.getElementById('submit-booking');
        if (submitBtn) {
            submitBtn.disabled = !isValid;
        }
    }
    
    async submitBooking() {
        const form = document.getElementById('booking-form');
        const formData = new FormData(form);
        
        // Collect all form data
        const bookingData = {
            ...this.bookingData,
            contact: {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                company: formData.get('company'),
                location: formData.get('location'),
                participants: formData.get('participants'),
                notes: formData.get('notes'),
                newsletter: formData.get('newsletter') === 'on'
            },
            timestamp: new Date().toISOString(),
            bookingId: this.generateBookingId()
        };
        
        try {
            // Show loading state
            const submitBtn = document.getElementById('submit-booking');
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
            
            // Send booking data to server
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });
            
            if (response.ok) {
                // Store booking data for confirmation
                this.bookingData = bookingData;
                this.showConfirmation();
            } else {
                throw new Error('Booking failed');
            }
            
        } catch (error) {
            console.error('Booking error:', error);
            alert('There was an error processing your booking. Please try again or contact us directly.');
            
            // Reset button
            submitBtn.textContent = 'Book Training Session';
            submitBtn.disabled = false;
        }
    }
    
    showConfirmation() {
        this.currentStep = 4;
        this.updateStepDisplay();
        
        // Populate booking details
        const detailsContainer = document.getElementById('booking-details');
        if (detailsContainer) {
            detailsContainer.innerHTML = `
                <h3>Booking Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">${this.bookingData.service.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${this.formatDate(this.bookingData.date)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${this.bookingData.time}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${this.bookingData.contact.location || 'To be confirmed'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Participants:</span>
                    <span class="detail-value">${this.bookingData.contact.participants}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Contact:</span>
                    <span class="detail-value">${this.bookingData.contact.firstName} ${this.bookingData.contact.lastName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${this.bookingData.contact.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${this.bookingData.contact.phone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Booking ID:</span>
                    <span class="detail-value">${this.bookingData.bookingId}</span>
                </div>
                <div class="customer-portal-link">
                    <h4>Manage Your Booking</h4>
                    <p>Visit your <a href="customer-portal.html?email=${this.bookingData.contact.email}" class="portal-link">Customer Portal</a> to view and manage your training sessions.</p>
                </div>
            `;
        }
        
        // Track booking completion
        if (typeof analyticsTracker !== 'undefined') {
            analyticsTracker.trackEvent('booking_completed', {
                service: this.bookingData.service.type,
                value: this.bookingData.service.price,
                bookingId: this.bookingData.bookingId
            });
        }
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-CA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    generateBookingId() {
        return 'ASG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
}

// Initialize booking system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BookingSystem();
});

// Service-specific email routing
const serviceEmails = {
    'cissp': 'training@alicesolutionsgroup.com',
    'cism': 'training@alicesolutionsgroup.com',
    'iso27001': 'training@alicesolutionsgroup.com',
    'corporate': 'corporate@alicesolutionsgroup.com',
    'privacy': 'privacy@alicesolutionsgroup.com',
    'educational': 'education@alicesolutionsgroup.com'
};

// Export for use in other scripts
window.BookingSystem = BookingSystem;
window.serviceEmails = serviceEmails;
