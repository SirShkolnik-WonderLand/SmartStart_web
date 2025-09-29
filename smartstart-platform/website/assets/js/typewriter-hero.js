/**
 * Simple Typewriter Hero Animation
 * Reliable, smooth typewriter effect with new content
 */

class TypewriterHero {
    constructor() {
        this.heroTitle = document.querySelector('.hero-title');
        this.heroTagline = document.querySelector('.hero-tagline');
        this.heroDescription = document.querySelector('.vision-description');
        this.currentIndex = 0;
        this.isAnimating = false;
        
        // Your new hero content combinations
        this.contentSets = [
            {
                title: "Help People and Businesses Grow Differently",
                tagline: "Security, structure, and clarity — from startups to enterprises."
            },
            {
                title: "Build Smarter. Grow Safer.",
                tagline: "Cybersecurity, compliance, and SaaS incubation under one roof."
            },
            {
                title: "From Vision to Secure Reality",
                tagline: "We turn ideas into ventures with ISO-grade foundations."
            },
            {
                title: "Transparency Is Our Superpower",
                tagline: "Making the invisible problems visible — and fixing them."
            },
            {
                title: "Secure Foundations for Bold Ideas",
                tagline: "Where ISO audits meet venture building."
            },
            {
                title: "Your CISO, Your CTO, Your Partner",
                tagline: "Military-grade security and startup agility combined."
            },
            {
                title: "Innovation With Integrity",
                tagline: "We build businesses that last — because they start secure."
            },
            {
                title: "Community. Security. Growth.",
                tagline: "Helping people and businesses grow differently in the GTA and beyond."
            },
            {
                title: "Clarity Creates Confidence",
                tagline: "Audit, automate, and accelerate — the AliceSolutionsGroup way."
            }
        ];
        
        this.init();
    }
    
    init() {
        if (!this.heroTitle || !this.heroTagline) return;
        
        // Start the typewriter loop
        setTimeout(() => {
            this.startTypewriterLoop();
        }, 2000);
    }
    
    async startTypewriterLoop() {
        while (true) {
            await this.typewriterCycle();
            await this.delay(7000); // 7 seconds between changes
        }
    }
    
    async typewriterCycle() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const content = this.contentSets[this.currentIndex];
        
        // Type out title
        await this.typeText(this.heroTitle, content.title);
        await this.delay(500);
        
        // Type out tagline
        await this.typeText(this.heroTagline, content.tagline);
        
        // Move to next content
        this.currentIndex = (this.currentIndex + 1) % this.contentSets.length;
        
        this.isAnimating = false;
    }
    
    async typeText(element, text) {
        // Clear element
        element.textContent = '';
        element.style.opacity = '1';
        
        // Type out character by character
        for (let i = 0; i <= text.length; i++) {
            element.textContent = text.slice(0, i);
            
            // Natural typing speed
            const delay = Math.random() * 50 + 25;
            await this.delay(delay);
        }
        
        // Brief pause at the end
        await this.delay(300);
    }
    
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TypewriterHero();
});

// Export for potential use in other scripts
window.TypewriterHero = TypewriterHero;
