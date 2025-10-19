// Lazy Loading for Images and Background Images
(function() {
    'use strict';

    // Check if Intersection Observer is supported
    if ('IntersectionObserver' in window) {
        // Lazy load regular images
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));

        // Lazy load background images
        const lazyBackgrounds = document.querySelectorAll('[data-bg]');
        const backgroundObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    element.style.backgroundImage = `url(${element.dataset.bg})`;
                    element.classList.add('loaded');
                    backgroundObserver.unobserve(element);
                }
            });
        });

        lazyBackgrounds.forEach(bg => backgroundObserver.observe(bg));
    } else {
        // Fallback for browsers without Intersection Observer
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
        });

        const lazyBackgrounds = document.querySelectorAll('[data-bg]');
        lazyBackgrounds.forEach(bg => {
            bg.style.backgroundImage = `url(${bg.dataset.bg})`;
            bg.classList.add('loaded');
        });
    }

    // Add loading="lazy" attribute to all images without it
    document.addEventListener('DOMContentLoaded', function() {
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            // Only add lazy loading to images below the fold
            if (img.getBoundingClientRect().top > window.innerHeight) {
                img.setAttribute('loading', 'lazy');
            }
        });
    });
})();

