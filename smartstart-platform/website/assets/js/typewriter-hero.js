/**
 * Simple Typewriter Hero Animation
 * Reliable, smooth typewriter effect with new content
 */

class TypewriterHero {
    constructor() {
        this.heroTitle = document.querySelector('.hero-title');
        this.heroTagline = document.querySelector('.hero-tagline');
        this.currentIndex = 0;
        this.isAnimating = false;
        
        // Hero content combinations without personal names
        this.contentSets = [
            {
                title: "Help people and businesses <span class='underline'>grow differently</span>",
                tagline: "Secure. Build. Grow."
            },
            {
                title: "Build Smarter. Grow Safer.",
                tagline: "Cybersecurity, compliance, and SaaS incubation under one roof"
            },
            {
                title: "From Vision to Secure Reality",
                tagline: "We turn ideas into ventures with ISO-grade foundations"
            },
            {
                title: "Transparency Is Our Superpower",
                tagline: "Making the invisible problems visible — and fixing them"
            },
            {
                title: "Secure Foundations for Bold Ideas",
                tagline: "Where ISO audits meet venture building"
            },
            {
                title: "Your CISO, Your CTO, Your Partner",
                tagline: "Military-grade security and startup agility combined"
            },
            {
                title: "Innovation With Integrity",
                tagline: "We build businesses that last — because they start secure"
            },
            {
                title: "Community. Security. Growth.",
                tagline: "Helping people and businesses grow differently in the GTA and beyond"
            },
            {
                title: "Clarity Creates Confidence",
                tagline: "Audit, automate, and accelerate — the AliceSolutionsGroup way"
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
        await this.typeText(this.heroTitle, content.title, true);
        await this.delay(500);
        
        // Type out tagline
        await this.typeText(this.heroTagline, content.tagline, false);
        
        // Move to next content
        this.currentIndex = (this.currentIndex + 1) % this.contentSets.length;
        
        this.isAnimating = false;
    }
    
    async typeText(element, text, isHTML = false) {
        // Clear element
        if (isHTML) {
            element.innerHTML = '';
        } else {
            element.textContent = '';
        }
        element.style.opacity = '1';
        
        // Type out character by character
        for (let i = 0; i <= text.length; i++) {
            const currentText = text.slice(0, i);
            if (isHTML) {
                element.innerHTML = currentText;
            } else {
                element.textContent = currentText;
            }
            
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
