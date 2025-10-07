// Footer Newsletter Signup Handler
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.querySelector('.newsletter-signup');
    const newsletterInput = document.querySelector('.newsletter-input');
    const newsletterBtn = document.querySelector('.newsletter-btn');

    if (newsletterForm && newsletterInput && newsletterBtn) {
        // Handle newsletter signup
        newsletterBtn.addEventListener('click', function(e) {
            e.preventDefault();

            const email = newsletterInput.value.trim();

            if (!email) {
                showMessage('Please enter your email address.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Simulate newsletter signup (replace with actual API call)
            newsletterBtn.textContent = 'Subscribing...';
            newsletterBtn.disabled = true;

            setTimeout(() => {
                showMessage('Thank you for subscribing! You\'ll receive our latest insights soon.', 'success');
                newsletterInput.value = '';
                newsletterBtn.textContent = 'Subscribe';
                newsletterBtn.disabled = false;
            }, 1500);
        });

        // Handle Enter key press
        newsletterInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                newsletterBtn.click();
            }
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showMessage(message, type) {
        // Remove existing message
        const existingMessage = document.querySelector('.newsletter-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageEl = document.createElement('div');
        messageEl.className = `newsletter-message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            margin-top: 0.5rem;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.85rem;
            text-align: center;
            ${type === 'success' 
                ? 'background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2);' 
                : 'background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);'
            }
        `;

        // Insert after newsletter form
        newsletterForm.parentNode.insertBefore(messageEl, newsletterForm.nextSibling);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }
});