import { useEffect, useRef } from "react";

export default function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle system for constellation
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
      opacity: number;
    }> = [];

    // Initialize particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    let animationId: number;
    const isDark =
      document.documentElement.classList.contains("dark") ||
      (window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    const animate = () => {
      // Clear canvas with very subtle background to maintain trail effect
      ctx.fillStyle = isDark
        ? "rgba(13, 17, 23, 0.02)"
        : "rgba(248, 250, 251, 0.02)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;

        // Bounce off edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.z < 0 || particle.z > 100) particle.vz *= -1;

        // Depth-based sizing
        const depthScale = (particle.z + 50) / 150;
        const screenSize = particle.size * (0.5 + depthScale);

        // Depth-based opacity
        const opacity = particle.opacity * (0.3 + depthScale * 0.7);

        // Draw particle with glow
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          screenSize * 3
        );

        const glowColor = isDark ? "rgba(0, 255, 216" : "rgba(0, 200, 184";
        gradient.addColorStop(0, `${glowColor}, ${opacity * 0.8})`);
        gradient.addColorStop(0.5, `${glowColor}, ${opacity * 0.4})`);
        gradient.addColorStop(1, `${glowColor}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(
          particle.x - screenSize * 2,
          particle.y - screenSize * 2,
          screenSize * 4,
          screenSize * 4
        );

        // Draw core with better light mode visibility
        ctx.fillStyle = isDark
          ? `rgba(238, 253, 249, ${opacity})`
          : `rgba(0, 200, 184, ${opacity * 0.6})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, screenSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections to nearby particles
        particles.forEach((other, otherIndex) => {
          if (otherIndex <= index) return;

          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const lineOpacity = (1 - distance / 150) * opacity * (isDark ? 0.3 : 0.4);
            ctx.strokeStyle = isDark
              ? `rgba(0, 255, 216, ${lineOpacity})`
              : `rgba(0, 200, 184, ${lineOpacity})`;
            ctx.lineWidth = isDark ? 0.5 : 0.8;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 opacity-50 dark:opacity-25"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
