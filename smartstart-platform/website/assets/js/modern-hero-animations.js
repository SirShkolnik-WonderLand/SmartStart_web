/**
 * Modern Hero Animations for 2025
 * Provides dynamic text changes and modern micro-interactions
 */

class ModernHeroAnimations {
    constructor() {
        this.heroTitle = document.querySelector('.hero-title');
        this.heroTagline = document.querySelector('.hero-tagline');
        this.heroDescription = document.querySelector('.vision-description');
        this.currentTitleIndex = 0;
        this.currentTaglineIndex = 0;
        this.currentDescriptionIndex = 0;
        this.isAnimating = false;
        this.animationSpeed = 10000; // 10 second intervals
        
        // Modern title variations with enhanced styling
        this.titleVariations = [
            "Help people and businesses <span class='underline neon-text'>grow differently</span>",
            "Transform ideas into <span class='underline neon-text'>successful ventures</span>",
            "Secure, build, and <span class='underline neon-text'>scale together</span>",
            "Where innovation meets <span class='underline neon-text'>cybersecurity</span>",
            "Building the future of <span class='underline neon-text'>smart business</span>",
            "From concept to <span class='underline neon-text'>market leader</span>",
            "Structured growth with <span class='underline neon-text'>military precision</span>"
        ];
        
        // Dynamic taglines with typewriter effect
        this.taglineVariations = [
            "Secure. Build. Grow.",
            "Innovation. Security. Growth.",
            "Smart. Secure. Scalable.",
            "Future-Ready Solutions.",
            "Transforming Business Vision.",
            "Proven. Professional. Powerful.",
            "Excellence in Every Venture."
        ];
        
        // Dynamic descriptions with floating transitions
        this.descriptionVariations = [
            "We integrate cybersecurity & ISO certifications, the SmartStart venture incubator, and automation/AI to deliver structured, transparent outcomes.",
            "From military-grade security protocols to cutting-edge venture building, we provide comprehensive solutions for modern businesses.",
            "Combining decades of enterprise experience with innovative automation and AI to accelerate your business transformation.",
            "Structured collaboration meets advanced technology to create sustainable growth and competitive advantage.",
            "Where proven methodologies, advanced security, and innovative incubation converge to build tomorrow's success stories.",
            "Transforming traditional business models through integrated technology solutions and strategic security frameworks.",
            "Empowering entrepreneurs with the tools, knowledge, and structure needed to build successful, secure enterprises."
        ];
        
        this.init();
    }
    
    init() {
        if (!this.heroTitle || !this.heroTagline || !this.heroDescription) return;
        
        // Add CSS for neon text effects
        this.addNeonTextStyles();
        
        // Start synchronized animations after initial load
        setTimeout(() => {
            this.startSynchronizedAnimations();
            this.addParallaxEffects();
        }, 3000);
    }
    
    addNeonTextStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .neon-text {
                color: var(--neon-green);
                text-shadow: 0 0 10px var(--neon-green-glow), 0 0 20px var(--neon-green-glow);
                animation: neonPulse 2s ease-in-out infinite alternate;
            }
            
            @keyframes neonPulse {
                from { 
                    text-shadow: 0 0 10px var(--neon-green-glow), 0 0 20px var(--neon-green-glow);
                }
                to { 
                    text-shadow: 0 0 20px rgba(0, 255, 136, 0.8), 0 0 30px rgba(0, 255, 136, 0.6);
                }
            }
            
            .floating-text {
                animation: floatText 3s ease-in-out infinite;
            }
            
            @keyframes floatText {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    async startSynchronizedAnimations() {
        // Start all animations in perfect sync
        setInterval(async () => {
            if (!this.isAnimating) {
                await this.synchronizedChange();
            }
        }, this.animationSpeed);
    }
    
    async synchronizedChange() {
        this.isAnimating = true;
        
        // Simple, elegant transitions - no overwhelming effects
        await Promise.all([
            this.animateTitleChange(),
            this.animateTaglineChange(),
            this.animateDescriptionChange()
        ]);
        
        this.isAnimating = false;
    }
    
    async animateTitleChange() {
        // Elegant fade out
        this.heroTitle.style.transition = 'all 0.4s ease-in-out';
        this.heroTitle.style.opacity = '0';
        this.heroTitle.style.transform = 'translateY(-10px)';
        
        await this.delay(400);
        
        // Change content
        this.currentTitleIndex = (this.currentTitleIndex + 1) % this.titleVariations.length;
        this.heroTitle.innerHTML = this.titleVariations[this.currentTitleIndex];
        
        // Smooth fade in
        this.heroTitle.style.opacity = '1';
        this.heroTitle.style.transform = 'translateY(0)';
        
        await this.delay(400);
    }
    
    async animateTaglineChange() {
        this.currentTaglineIndex = (this.currentTaglineIndex + 1) % this.taglineVariations.length;
        
        // Simple typewriter effect
        await this.typewriterEffect(this.heroTagline, this.taglineVariations[this.currentTaglineIndex]);
    }
    
    async animateDescriptionChange() {
        this.currentDescriptionIndex = (this.currentDescriptionIndex + 1) % this.descriptionVariations.length;
        
        // Simple fade transition
        this.heroDescription.style.transition = 'all 0.4s ease-in-out';
        this.heroDescription.style.opacity = '0';
        this.heroDescription.style.transform = 'translateY(10px)';
        
        await this.delay(400);
        
        // Change content
        this.heroDescription.textContent = this.descriptionVariations[this.currentDescriptionIndex];
        
        // Fade in
        this.heroDescription.style.opacity = '1';
        this.heroDescription.style.transform = 'translateY(0)';
        
        await this.delay(400);
    }
    
    async typewriterEffect(element, text) {
        // Clear and prepare for typewriter
        element.style.opacity = '0';
        await this.delay(200);
        
        element.textContent = '';
        element.style.opacity = '1';
        
        // Enhanced typewriter with neon cursor effect
        for (let i = 0; i <= text.length; i++) {
            const currentText = text.slice(0, i);
            element.innerHTML = currentText + '<span class="typewriter-cursor">|</span>';
            
            // Add neon glow to cursor
            const cursor = element.querySelector('.typewriter-cursor');
            if (cursor) {
                cursor.style.color = 'var(--neon-green)';
                cursor.style.textShadow = '0 0 10px var(--neon-green-glow)';
                cursor.style.animation = 'blink 1s infinite';
            }
            
            // Vary typing speed for natural feel
            const delay = i === 0 ? 200 : (Math.random() * 80 + 40);
            await this.delay(delay);
        }
        
        // Remove cursor after completion
        setTimeout(() => {
            element.textContent = text;
        }, 500);
    }
    
    addParallaxEffects() {
        // Add subtle parallax to hero elements
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            
            if (this.heroTitle) {
                this.heroTitle.style.transform = `translateY(${parallax * 0.1}px)`;
            }
            
            if (this.heroTagline) {
                this.heroTagline.style.transform = `translateY(${parallax * 0.05}px)`;
            }
        });
    }
    
    // Add hover effects to buttons
    addButtonEffects() {
        const buttons = document.querySelectorAll('.cta-button');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-3px) scale(1.02)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    // Add floating particles effect
    createFloatingParticles() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(99, 102, 241, ${Math.random() * 0.5 + 0.2});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 10}s infinite linear;
                pointer-events: none;
            `;
            hero.appendChild(particle);
        }
        
        // Add CSS for floating animation
        if (!document.querySelector('#floating-particles-style')) {
            const style = document.createElement('style');
            style.id = 'floating-particles-style';
            style.textContent = `
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const heroAnimations = new ModernHeroAnimations();
    heroAnimations.addButtonEffects();
    heroAnimations.createFloatingParticles();
});

// Export for potential use in other scripts
window.ModernHeroAnimations = ModernHeroAnimations;
