import React, { useState, useEffect, useRef } from 'react';
import { getAchievementAnimationClass } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface AchievementAnimationProps {
  type: 'unlock' | 'levelUp' | 'breakthrough' | 'legendary';
  title: string;
  description: string;
  icon?: string;
  onComplete?: () => void;
  className?: string;
}

/**
 * Zen-inspired achievement animation component
 * Used to display notifications for achievements, level ups, breakthroughs, etc.
 */
export function AchievementAnimation({
  type,
  title,
  description,
  icon = 'trophy',
  onComplete,
  className
}: AchievementAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [particleCount, setParticleCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  
  // Animation timing
  useEffect(() => {
    // Show for 3 seconds, then fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
      
      // After fade out, call onComplete
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  // Create particles animation
  useEffect(() => {
    if (!containerRef.current || !particlesRef.current) return;
    
    // Generate random particles
    const container = containerRef.current;
    const particles = particlesRef.current;
    const count = type === 'legendary' ? 50 : type === 'breakthrough' ? 35 : 20;
    
    setParticleCount(count);
    
    // Animate particles
    const particleElements = particles.children;
    for (let i = 0; i < particleElements.length; i++) {
      const particle = particleElements[i] as HTMLElement;
      
      // Random position, size, and animation delay
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 80;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const scale = 0.5 + Math.random() * 0.5;
      const delay = Math.random() * 0.5;
      
      // Apply styles
      particle.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      particle.style.opacity = (0.2 + Math.random() * 0.8).toString();
      particle.style.animationDelay = `${delay}s`;
    }
    
  }, [type]);
  
  // Get appropriate animation class
  const animationClass = getAchievementAnimationClass(type);
  
  // Set color based on achievement type
  const bgColor = type === 'legendary' 
    ? 'bg-amber-500 border-amber-300' 
    : type === 'breakthrough' 
      ? 'bg-violet-500 border-violet-300' 
      : type === 'levelUp' 
        ? 'bg-blue-500 border-blue-300' 
        : 'bg-green-500 border-green-300';
  
  // Create particle elements
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push(
      <div 
        key={i} 
        className="absolute w-2 h-2 rounded-full bg-white/80 opacity-0 animate-particle"
      />
    );
  }
  
  return (
    <div 
      className={cn(
        "fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-500",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
      ref={containerRef}
    >
      <div 
        className={cn(
          "relative flex items-center px-4 py-3 rounded-lg border shadow-lg text-white",
          bgColor,
          animationClass
        )}
      >
        {/* Icon */}
        <div className="mr-3 text-xl">
          <i className={`fas fa-${icon}`}></i>
        </div>
        
        {/* Content */}
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm opacity-90">{description}</p>
        </div>
        
        {/* Particles container */}
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          ref={particlesRef}
        >
          {particles}
        </div>
      </div>
    </div>
  );
}