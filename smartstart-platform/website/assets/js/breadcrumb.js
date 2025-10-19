// Breadcrumb Navigation Loader
function loadBreadcrumb(breadcrumbData) {
    const breadcrumbNav = document.querySelector('.breadcrumb-nav .breadcrumb-list');
    
    if (!breadcrumbNav || !breadcrumbData) return;
    
    // Clear existing breadcrumbs (except Home)
    const homeItem = breadcrumbNav.querySelector('.breadcrumb-item');
    breadcrumbNav.innerHTML = '';
    breadcrumbNav.appendChild(homeItem);
    
    // Add breadcrumb items
    breadcrumbData.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'breadcrumb-item';
        li.setAttribute('itemprop', 'itemListElement');
        li.setAttribute('itemscope', '');
        li.setAttribute('itemtype', 'https://schema.org/ListItem');
        
        const a = document.createElement('a');
        a.href = item.url;
        a.className = 'breadcrumb-link';
        a.setAttribute('itemprop', 'item');
        
        const span = document.createElement('span');
        span.setAttribute('itemprop', 'name');
        span.textContent = item.name;
        
        const meta = document.createElement('meta');
        meta.setAttribute('itemprop', 'position');
        meta.setAttribute('content', (index + 2).toString());
        
        a.appendChild(span);
        li.appendChild(a);
        li.appendChild(meta);
        breadcrumbNav.appendChild(li);
    });
}

// Auto-generate breadcrumbs from page data attributes
document.addEventListener('DOMContentLoaded', function() {
    const pageData = document.querySelector('[data-page-breadcrumbs]');
    
    if (pageData) {
        try {
            const breadcrumbData = JSON.parse(pageData.getAttribute('data-page-breadcrumbs'));
            loadBreadcrumb(breadcrumbData);
        } catch (e) {
            console.error('Error parsing breadcrumb data:', e);
        }
    }
});

