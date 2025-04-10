import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { getThemeForPath, pageThemes, getParticleStyle } from '@/lib/animations';

// Number of particles to display
const PARTICLE_COUNT = 40;

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'circle' | 'square' | 'triangle';
}

/**
 * Background particles that change based on the current page theme
 * Adds subtle zen-inspired floating elements to enhance the wuxia atmosphere
 */
export function BackgroundParticles() {
  const [location] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = getThemeForPath(location);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();
  const themeRef = useRef(theme);
  
  // Generate particles when theme changes
  useEffect(() => {
    themeRef.current = theme;
    
    if (!canvasRef.current) return;
    
    // Generate new particles when theme changes
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Resize canvas to match window
    const resize = () => {
      if (canvas && window) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    
    // Initial resize
    resize();
    
    // Resize on window change
    window.addEventListener('resize', resize);
    
    // Generate new particles
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Create random particle
      newParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 10 + 2,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.5,
        shape: Math.random() > 0.7 
          ? 'triangle' 
          : Math.random() > 0.5 
            ? 'square' 
            : 'circle'
      });
    }
    
    setParticles(newParticles);
    
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [theme]);
  
  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || particles.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      if (!canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get current theme's particle color
      const themeKey = themeRef.current;
      const currentTheme = pageThemes[themeKey];
      const particleColor = currentTheme.particleColor;
      const animationType = currentTheme.animationType;
      
      // Update and draw particles
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Update position based on animation type
          let newX = particle.x;
          let newY = particle.y;
          
          if (animationType === 'float') {
            // Standard floating movement
            newX += particle.speedX;
            newY += particle.speedY;
          } else if (animationType === 'spiral') {
            // Spiral movement
            const angle = Date.now() * 0.001 * particle.speedX;
            const radius = 50 * particle.size / 10;
            newX += Math.cos(angle) * 0.3;
            newY += Math.sin(angle) * 0.3;
          } else if (animationType === 'flame') {
            // Rising flame-like movement
            newX += particle.speedX * 1.2;
            newY -= (Math.random() * 0.5 + 0.2); // Always moving upward
          } else if (animationType === 'pulse') {
            // Pulsing movement
            const pulse = Math.sin(Date.now() * 0.001) * 0.5 + 0.5;
            newX += particle.speedX * pulse;
            newY += particle.speedY * pulse;
          } else {
            // Default behavior for other types
            newX += particle.speedX;
            newY += particle.speedY;
          }
          
          // Wrap around screen edges
          if (newX > canvas.width) newX = 0;
          if (newX < 0) newX = canvas.width;
          if (newY > canvas.height) newY = 0;
          if (newY < 0) newY = canvas.height;
          
          // Update rotation
          const newRotation = (particle.rotation + particle.rotationSpeed) % 360;
          
          // Draw the particle
          ctx.save();
          ctx.translate(newX, newY);
          ctx.rotate((newRotation * Math.PI) / 180);
          ctx.fillStyle = particleColor;
          ctx.globalAlpha = particle.opacity;
          
          // Draw different shapes
          if (particle.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (particle.shape === 'square') {
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
          } else if (particle.shape === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(0, -particle.size / 2);
            ctx.lineTo(particle.size / 2, particle.size / 2);
            ctx.lineTo(-particle.size / 2, particle.size / 2);
            ctx.closePath();
            ctx.fill();
          }
          
          ctx.restore();
          
          return {
            ...particle,
            x: newX,
            y: newY,
            rotation: newRotation
          };
        })
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={getParticleStyle(theme)}
    />
  );
}