/**
 * Ultra-Smooth Hero Animations
 * Single, seamless transition that flows like silk
 */

class SmoothHero {
    constructor() {
        this.heroTitle = document.querySelector('.hero-title');
        this.heroTagline = document.querySelector('.hero-tagline');
        this.heroDescription = document.querySelector('.vision-description');
        this.currentIndex = 0;
        this.isAnimating = false;
        
        // Content variations - all synchronized
        this.contentSets = [
            {
                title: "Help people and businesses <span class='underline'>grow differently</span>",
                tagline: "Secure. Build. Grow.",
                description: "We integrate cybersecurity & ISO certifications, the SmartStart venture incubator, and automation/AI to deliver structured, transparent outcomes."
            },
            {
                title: "Transform ideas into <span class='underline'>successful ventures</span>",
                tagline: "Innovation. Security. Growth.",
                description: "From military-grade security protocols to cutting-edge venture building, we provide comprehensive solutions for modern businesses."
            },
            {
                title: "Secure, build, and <span class='underline'>scale together</span>",
                tagline: "Smart. Secure. Scalable.",
                description: "Combining decades of enterprise experience with innovative automation and AI to accelerate your business transformation."
            },
            {
                title: "Where innovation meets <span class='underline'>cybersecurity</span>",
                tagline: "Future-Ready Solutions.",
                description: "Structured collaboration meets advanced technology to create sustainable growth and competitive advantage."
            },
            {
                title: "Building the future of <span class='underline'>smart business</span>",
                tagline: "Transforming Business Vision.",
                description: "Where proven methodologies, advanced security, and innovative incubation converge to build tomorrow's success stories."
            },
            {
                title: "From concept to <span class='underline'>market leader</span>",
                tagline: "Proven. Professional. Powerful.",
                description: "Transforming traditional business models through integrated technology solutions and strategic security frameworks."
            },
            {
                title: "Structured growth with <span class='underline'>military precision</span>",
                tagline: "Excellence in Every Venture.",
                description: "Empowering entrepreneurs with the tools, knowledge, and structure needed to build successful, secure enterprises."
            }
        ];
        
        this.init();
    }
    
    init() {
        if (!this.heroTitle || !this.heroTagline || !this.heroDescription) return;
        
        // Set up ultra-smooth CSS transitions
        this.setupSmoothTransitions();
        
        // Start the seamless animation loop
        setTimeout(() => {
            this.startSeamlessLoop();
        }, 3000);
    }
    
    setupSmoothTransitions() {
        // Add CSS for ultra-smooth transitions
        const style = document.createElement('style');
        style.textContent = `
            .hero-title, .hero-tagline, .vision-description {
                transition: all 1.2s cubic-bezier(0.23, 1, 0.32, 1);
                will-change: opacity, transform;
            }
            
            .hero-fade-out {
                opacity: 0 !important;
                transform: translateY(-20px) scale(0.98) !important;
            }
            
            .hero-fade-in {
                opacity: 1 !important;
                transform: translateY(0) scale(1) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    async startSeamlessLoop() {
        while (true) {
            await this.delay(12000); // 12 seconds between changes
            
            if (!this.isAnimating) {
                await this.seamlessTransition();
            }
        }
    }
    
    async seamlessTransition() {
        this.isAnimating = true;
        
        // Step 1: Fade out all elements simultaneously
        this.heroTitle.classList.add('hero-fade-out');
        this.heroTagline.classList.add('hero-fade-out');
        this.heroDescription.classList.add('hero-fade-out');
        
        // Wait for fade out to complete
        await this.delay(1200);
        
        // Step 2: Change all content simultaneously
        this.currentIndex = (this.currentIndex + 1) % this.contentSets.length;
        const newContent = this.contentSets[this.currentIndex];
        
        this.heroTitle.innerHTML = newContent.title;
        this.heroTagline.textContent = newContent.tagline;
        this.heroDescription.textContent = newContent.description;
        
        // Step 3: Fade in all elements simultaneously
        this.heroTitle.classList.remove('hero-fade-out');
        this.heroTagline.classList.remove('hero-fade-out');
        this.heroDescription.classList.remove('hero-fade-out');
        
        // Wait for fade in to complete
        await this.delay(1200);
        
        this.isAnimating = false;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SmoothHero();
});

// Export for potential use in other scripts
window.SmoothHero = SmoothHero;
