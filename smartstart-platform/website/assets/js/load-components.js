// Component Loader for Header and Footer
// This file loads the shared header and footer on all pages

function loadNavbar() {
    // Determine which navbar to load based on current page location
    const currentPath = window.location.pathname;
    let navbarPath = '/includes/navbar.html';
    let logoPath = '/assets/images/AliceSolutionsGroup-logo-owl-rabbit-fox.png';
    let homePath = '/index.html';

    if (currentPath.includes('/locations/')) {
        navbarPath = '../includes/navbar-subdir.html';
        logoPath = '../assets/images/AliceSolutionsGroup-logo-owl-rabbit-fox.png';
        homePath = '../index.html';
    } else if (currentPath.includes('/community/')) {
        navbarPath = '../includes/navbar-community.html';
        logoPath = '../assets/images/AliceSolutionsGroup-logo-owl-rabbit-fox.png';
        homePath = '../index.html';
    }

    fetch(navbarPath)
        .then(response => response.text())
        .then(data => {
            const headerContainer = document.getElementById('header');
            if (headerContainer) {
                // Create thin header structure
                headerContainer.innerHTML = `
                    <header class="global-header">
                        <div class="header-content">
                            <div class="logo">
                                <a href="${homePath}" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 1rem;">
                                    <img src="${logoPath}" alt="AliceSolutionsGroup" style="height: 40px; width: auto;">
                                    <span style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">AliceSolutionsGroup</span>
                                </a>
                            </div>
                            ${data}
                        </div>
                    </header>
                `;

                // Initialize mobile menu toggle after navbar is loaded
                const mobileToggle = document.querySelector('.mobile-menu-toggle');
                const navMenu = document.querySelector('.nav-menu');

                if (mobileToggle && navMenu) {
                    mobileToggle.addEventListener('click', function() {
                        navMenu.classList.toggle('active');
                        mobileToggle.classList.toggle('active');
                    });
                }
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