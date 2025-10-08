// Component Loader for Navbar and Footer
// This file loads the shared navbar and footer on all pages

function loadNavbar() {
    fetch('/includes/navbar.html')
        .then(response => response.text())
        .then(data => {
            const headerContainer = document.getElementById('header');
            if (headerContainer) {
                // Create header structure
                headerContainer.innerHTML = `
                    <header class="header">
                        <div class="header-container">
                            <div class="header-left">
                                <a href="/index.html" class="logo">
                                    <img src="/assets/images/AliceSolutionsGroup-logo-owl-rabbit-fox.png" alt="AliceSolutionsGroup" class="logo-img">
                                    <span class="logo-text">AliceSolutionsGroup</span>
                                </a>
                            </div>
                            <div class="header-center">
                                ${data}
                            </div>
                            <div class="header-right">
                                <a href="/booking.html" class="btn btn-primary">Book Training</a>
                                <a href="/customer-portal.html" class="btn btn-secondary">Portal</a>
                            </div>
                            <button class="mobile-menu-toggle" aria-label="Toggle menu">
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