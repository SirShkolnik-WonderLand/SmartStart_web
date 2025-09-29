/**
 * Modern Scroll Animations for 2025
 * Provides smooth scroll reveals and parallax effects
 */

class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.init();
    }
    
    init() {
        this.setupScrollReveal();
        this.setupParallaxEffects();
        this.setupSmoothScrolling();
    }
    
    setupScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    
                    // Add stagger effect for multiple elements
                    const siblings = Array.from(entry.target.parentNode.children);
                    const index = siblings.indexOf(entry.target);
                    
                    setTimeout(() => {
                        entry.target.style.animationDelay = `${index * 0.1}s`;
                    }, 100);
                }
            });
        }, this.observerOptions);
        
        // Observe all sections and cards
        const elementsToAnimate = document.querySelectorAll('.section, .card, .hero-content');
        elementsToAnimate.forEach(el => {
            el.classList.add('scroll-reveal');
            observer.observe(el);
        });
    }
    
    setupParallaxEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            // Parallax for hero background
            const hero = document.querySelector('.hero');
            if (hero) {
                hero.style.transform = `translateY(${rate}px)`;
            }
            
            // Parallax for cards
            const cards = document.querySelectorAll('.card');
            cards.forEach((card, index) => {
                const cardRate = scrolled * (0.1 + index * 0.05);
                card.style.transform = `translateY(${cardRate}px)`;
            });
        });
    }
    
    setupSmoothScrolling() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // Add loading animation
    addLoadingAnimation() {
        const loader = document.createElement('div');
        loader.className = 'page-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <p>Loading...</p>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: var(--bg-primary);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                transition: opacity 0.5s ease;
            }
            
            .loader-content {
                text-align: center;
                color: var(--text-primary);
            }
            
            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid var(--glass-border);
                border-top: 3px solid var(--accent-primary);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(loader);
        
        // Remove loader when page is loaded
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.remove();
                }, 500);
            }, 1000);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScrollAnimations();
});

// Export for potential use in other scripts
window.ScrollAnimations = ScrollAnimations;
