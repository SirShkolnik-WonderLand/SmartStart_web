/**
 * Animated Background Particles
 * Creates floating particles and moving background effects
 */

class AnimatedBackground {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }
    
    createCanvas() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'animated-bg';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        this.canvas.style.opacity = '0.6';
        
        // Set canvas size
        this.resizeCanvas();
        
        // Add to body
        document.body.appendChild(this.canvas);
        
        // Get context
        this.ctx = this.canvas.getContext('2d');
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 12000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 1.2,
                vy: (Math.random() - 0.5) * 1.2,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.7 + 0.2,
                color: this.getRandomColor(),
                pulseSpeed: Math.random() * 0.02 + 0.01,
                pulsePhase: Math.random() * Math.PI * 2
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
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.particles = [];
            this.createParticles();
        });
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach((particle, index) => {
            // Update pulse phase for breathing effect
            particle.pulsePhase += particle.pulseSpeed;
            
            // Update position with smooth movement
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Add subtle wave motion
            const waveX = Math.sin(particle.pulsePhase) * 0.3;
            const waveY = Math.cos(particle.pulsePhase * 0.7) * 0.3;
            particle.x += waveX;
            particle.y += waveY;
            
            // Mouse interaction
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) {
                const force = (120 - distance) / 120;
                particle.x -= dx * force * 0.015;
                particle.y -= dy * force * 0.015;
            }
            
            // Wrap around edges smoothly
            if (particle.x < -20) particle.x = this.canvas.width + 20;
            if (particle.x > this.canvas.width + 20) particle.x = -20;
            if (particle.y < -20) particle.y = this.canvas.height + 20;
            if (particle.y > this.canvas.height + 20) particle.y = -20;
            
            // Calculate pulsing opacity
            const pulseOpacity = particle.opacity * (0.6 + 0.4 * Math.sin(particle.pulsePhase));
            
            // Draw particle with enhanced glow
            this.ctx.save();
            
            // Outer glow
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = particle.color + '0.4)';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + '0.1)';
            this.ctx.fill();
            
            // Main particle
            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = particle.color + '0.6)';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + pulseOpacity + ')';
            this.ctx.fill();
            
            // Inner bright core
            this.ctx.shadowBlur = 6;
            this.ctx.shadowColor = particle.color + '0.8)';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 0.4, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + '0.9)';
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
                
                if (distance < 150) {
                    const opacity = (150 - distance) / 150 * 0.15;
                    const gradient = this.ctx.createLinearGradient(
                        this.particles[i].x, this.particles[i].y,
                        this.particles[j].x, this.particles[j].y
                    );
                    gradient.addColorStop(0, this.particles[i].color + opacity + ')');
                    gradient.addColorStop(1, this.particles[j].color + opacity + ')');
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = 1.5;
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
    // Add animated background to all pages
    window.animatedBackground = new AnimatedBackground();
});

// Export for potential use
window.AnimatedBackground = AnimatedBackground;
