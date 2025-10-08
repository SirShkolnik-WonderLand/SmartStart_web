// Component Loader for Header and Footer
// This file loads the shared header and footer on all pages

function loadNavbar() {
    fetch('/includes/navbar.html')
        .then(response => response.text())
        .then(data => {
            const headerContainer = document.getElementById('header');
            if (headerContainer) {
                // Create thin header structure
                headerContainer.innerHTML = `
                    <header class="global-header">
                        <div class="header-content">
                            <div class="logo">
                                <a href="/index.html" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 1rem;">
                                    <img src="/assets/images/AliceSolutionsGroup-logo-owl-rabbit-fox.png" alt="AliceSolutionsGroup" style="height: 40px; width: auto;">
                                    <span style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">AliceSolutionsGroup</span>
                                </a>
                            </div>
                            ${data}
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