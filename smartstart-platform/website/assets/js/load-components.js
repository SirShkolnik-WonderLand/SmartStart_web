// Component Loader for Navbar and Footer
// This file loads the shared navbar and footer on all pages

function loadNavbar() {
    fetch('/includes/navbar.html')
        .then(response => response.text())
        .then(data => {
            const headerContainer = document.getElementById('header');
            if (headerContainer) {
                // Create header structure that matches existing CSS
                headerContainer.innerHTML = `
                    <header class="global-header">
                        <div class="header-content">
                            <div class="logo">
                                <a href="/index.html" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 1rem;">
                                    <img src="/assets/images/AliceSolutionsGroup-logo-owl-rabbit-fox.png" alt="AliceSolutionsGroup" style="height: 50px; width: auto;">
                                    <span style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">AliceSolutionsGroup</span>
                                </a>
                            </div>
                            ${data}
                            <div class="header-actions" style="display: flex; gap: 1rem; align-items: center;">
                                <a href="/booking.html" class="cta-button primary">Book Training</a>
                                <a href="/customer-portal.html" class="cta-button secondary">Portal</a>
                            </div>
                            <button class="mobile-menu-toggle" aria-label="Toggle menu" style="display: none;">
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        </div>
                    </header>
                `;
            }
        })
        .catch(error => console.error('Error loading navbar:', error));
}

function loadFooter() {
    fetch('/includes/footer.html')
        .then(response => response.text())
        .then(data => {
            const footerContainer = document.getElementById('footer');
            if (footerContainer) {
                footerContainer.innerHTML = data;
            }
        })
        .catch(error => console.error('Error loading footer:', error));
}

// Export functions for use in pages
if (typeof window !== 'undefined') {
    window.loadNavbar = loadNavbar;
    window.loadFooter = loadFooter;
}