// Component Loader for Header and Footer
// This file loads the shared header and footer on all pages with proper path resolution

function getPathDepth() {
    const currentPath = window.location.pathname;
    // Remove leading slash and split by /
    const parts = currentPath.split('/').filter(part => part && part !== 'index.html');
    // Return depth (0 for root, 1 for /about.html, 2 for /services/cybersecurity.html)
    return parts.length;
}

function getBasePath() {
    const depth = getPathDepth();
    if (depth === 0) return '';
    return '../'.repeat(depth);
}

function loadNavbar() {
    const basePath = getBasePath();
    const navbarPath = basePath + 'includes/navbar.html';
    const logoPath = basePath + 'assets/images/AliceSolutionsGroup-logo-owl-rabbit-fox.png';
    const homePath = basePath + 'index.html';

    fetch(navbarPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load navbar: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const headerContainer = document.getElementById('header');
            if (headerContainer) {
                // Create professional header structure
                headerContainer.innerHTML = `
                    <header class="global-header">
                        <div class="header-content">
                            <div class="logo">
                                <a href="${homePath}" aria-label="AliceSolutionsGroup Home">
                                    <img src="${logoPath}" alt="AliceSolutionsGroup Logo" width="40" height="40">
                                    <span>AliceSolutionsGroup</span>
                                </a>
                            </div>
                            ${data}
                        </div>
                    </header>
                `;

                // Initialize mobile menu toggle after navbar is loaded
                initializeMobileMenu();
                
                // Update all navigation links to use correct paths
                updateNavigationPaths(basePath);
            }
        })
        .catch(error => {
            console.error('Error loading navbar:', error);
            // Fallback: create basic header
            const headerContainer = document.getElementById('header');
            if (headerContainer) {
                headerContainer.innerHTML = `
                    <header class="global-header">
                        <div class="header-content">
                            <div class="logo">
                                <a href="${homePath}">
                                    <img src="${logoPath}" alt="AliceSolutionsGroup" width="40" height="40">
                                    <span>AliceSolutionsGroup</span>
                                </a>
                            </div>
                        </div>
                    </header>
                `;
            }
        });
}

function updateNavigationPaths(basePath) {
    // Update all navigation links to use correct relative paths
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.startsWith('//') && !href.startsWith('http')) {
            // Convert absolute path to relative path
            link.setAttribute('href', basePath + href.substring(1));
        }
    });
}

function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileToggle && navMenu) {
        // Remove any existing listeners
        const newToggle = mobileToggle.cloneNode(true);
        mobileToggle.parentNode.replaceChild(newToggle, mobileToggle);
        
        newToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            navMenu.classList.toggle('active');
            newToggle.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !newToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                newToggle.classList.remove('active');
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                newToggle.classList.remove('active');
            }
        });

        // Close menu when clicking a link
        const navLinks = navMenu.querySelectorAll('.nav-link, .dropdown-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                newToggle.classList.remove('active');
            });
        });
    }
}

function loadFooter() {
    const basePath = getBasePath();
    const footerPath = basePath + 'includes/footer.html';

    fetch(footerPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load footer: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const footerContainer = document.getElementById('footer');
            if (footerContainer) {
                footerContainer.innerHTML = data;
                
                // Update all footer links to use correct paths
                updateFooterPaths(basePath);
            }
        })
        .catch(error => {
            console.error('Error loading footer:', error);
            // Fallback: create basic footer
            const footerContainer = document.getElementById('footer');
            if (footerContainer) {
                footerContainer.innerHTML = `
                    <footer class="global-footer">
                        <div class="footer-container">
                            <div class="footer-bottom">
                                <div class="footer-bottom-content">
                                    <p>&copy; 2025 AliceSolutionsGroup. All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                    </footer>
                `;
            }
        });
}

function updateFooterPaths(basePath) {
    // Update all footer links and images to use correct relative paths
    const footer = document.getElementById('footer');
    if (!footer) return;

    // Update links
    const footerLinks = footer.querySelectorAll('a[href^="/"]');
    footerLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('//') && !href.startsWith('http')) {
            link.setAttribute('href', basePath + href.substring(1));
        }
    });

    // Update images
    const footerImages = footer.querySelectorAll('img[src^="/"]');
    footerImages.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('//') && !src.startsWith('http')) {
            img.setAttribute('src', basePath + src.substring(1));
        }
    });
}

// Export functions for use in pages
if (typeof window !== 'undefined') {
    window.loadNavbar = loadNavbar;
    window.loadFooter = loadFooter;
}