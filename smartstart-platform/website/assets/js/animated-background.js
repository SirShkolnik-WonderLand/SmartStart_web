/**
 * Animated Background Particles - Fixed Version
 * Creates smooth floating particles and moving background effects
 */

class AnimatedBackground {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.time = 0;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.createCanvas();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }
    
    createCanvas() {
        // Remove existing canvas if it exists
        const existingCanvas = document.getElementById('animated-bg');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        
        // Create new canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'animated-bg';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        this.canvas.style.opacity = '0.8';
        
        // Set canvas size
        this.resizeCanvas();
        
        // Add to body
        document.body.appendChild(this.canvas);
        
        // Get context
        this.ctx = this.canvas.getContext('2d');
        
        // Enable smooth rendering
        this.ctx.imageSmoothingEnabled = true;
    }
    
    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
    }
    
    createParticles() {
        const particleCount = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 8000), 150);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.6 + 0.2,
                color: this.getRandomColor(),
                life: Math.random() * 100,
                maxLife: 100
            });
        }
    }
    
    getRandomColor() {
        const colors = [
            'rgba(59, 130, 246, ', // Blue
            'rgba(147, 51, 234, ', // Purple
            'rgba(16, 185, 129, ', // Green
            'rgba(236, 72, 153, ', // Pink
            'rgba(245, 158, 11, ', // Yellow
            'rgba(239, 68, 68, '   // Red
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    bindEvents() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.particles = [];
            this.createParticles();
        });
        
        // Handle mouse movement
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Handle mouse leave
        document.addEventListener('mouseleave', () => {
            this.mouseX = window.innerWidth / 2;
            this.mouseY = window.innerHeight / 2;
        });
    }
    
    animate() {
        this.time += 0.01;
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Update and draw particles
        this.particles.forEach((particle, index) => {
            // Update position with smooth movement
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Add subtle wave motion
            particle.x += Math.sin(this.time + particle.y * 0.01) * 0.1;
            particle.y += Math.cos(this.time + particle.x * 0.01) * 0.1;
            
            // Mouse interaction
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                const force = (150 - distance) / 150;
                particle.x -= dx * force * 0.02;
                particle.y -= dy * force * 0.02;
            }
            
            // Wrap around edges smoothly
            if (particle.x < -10) particle.x = window.innerWidth + 10;
            if (particle.x > window.innerWidth + 10) particle.x = -10;
            if (particle.y < -10) particle.y = window.innerHeight + 10;
            if (particle.y > window.innerHeight + 10) particle.y = -10;
            
            // Update particle life for breathing effect
            particle.life += 0.5;
            if (particle.life > particle.maxLife) particle.life = 0;
            
            const lifeRatio = particle.life / particle.maxLife;
            const pulseOpacity = particle.opacity * (0.5 + 0.5 * Math.sin(lifeRatio * Math.PI * 2));
            
            // Draw particle with glow
            this.ctx.save();
            
            // Outer glow
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = particle.color + '0.3)';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + '0.1)';
            this.ctx.fill();
            
            // Main particle
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = particle.color + '0.5)';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + pulseOpacity + ')';
            this.ctx.fill();
            
            this.ctx.restore();
        });
        
        // Draw connections between nearby particles
        this.drawConnections();
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    const opacity = (120 - distance) / 120 * 0.15;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only add animated background to home page
    if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) {
        // Small delay to ensure other scripts don't interfere
        setTimeout(() => {
            try {
                window.animatedBackground = new AnimatedBackground();
                console.log('✅ Animated background initialized successfully');
            } catch (error) {
                console.error('❌ Error initializing animated background:', error);
            }
        }, 100);
    }
});

// Export for potential use
window.AnimatedBackground = AnimatedBackground;