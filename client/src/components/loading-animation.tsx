import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
  type?: 'qi' | 'lotus' | 'sword' | 'scroll' | 'simple';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

/**
 * Wuxia-themed loading animation component
 * Different types of animations for different contexts
 */
export function LoadingAnimation({
  type = 'qi',
  size = 'md',
  text = 'Loading...',
  className
}: LoadingAnimationProps) {
  // Size mapping
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }[size];
  
  // Text size mapping
  const textSizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];
  
  // Get the appropriate loading animation based on type
  const renderLoadingAnimation = () => {
    switch (type) {
      case 'qi':
        return <QiEnergyLoader size={sizeClass} />;
      case 'lotus':
        return <LotusLoader size={sizeClass} />;
      case 'sword':
        return <SwordLoader size={sizeClass} />;
      case 'scroll':
        return <ScrollLoader size={sizeClass} />;
      case 'simple':
      default:
        return <SimpleLoader size={sizeClass} />;
    }
  };
  
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {renderLoadingAnimation()}
      {text && (
        <div className={cn("mt-4 text-center font-serif opacity-80", textSizeClass)}>
          {text}
        </div>
      )}
    </div>
  );
}

// Qi Energy Loader (swirling energy)
function QiEnergyLoader({ size }: { size: string }) {
  const [dots, setDots] = useState<JSX.Element[]>([]);
  
  useEffect(() => {
    const newDots = [];
    const totalDots = 12;
    
    for (let i = 0; i < totalDots; i++) {
      const rotateClass = `rotate-[${(i * 30)}deg]`;
      const delayClass = `animation-delay-${i * 100}`;
      
      newDots.push(
        <div 
          key={i}
          className={cn(
            "absolute w-2 h-2 rounded-full bg-primary",
            "opacity-0 animate-qi-pulse",
            rotateClass,
            delayClass
          )}
          style={{
            transform: `rotate(${i * 30}deg) translateY(-120%)`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      );
    }
    
    setDots(newDots);
  }, []);
  
  return (
    <div className={cn("relative flex items-center justify-center", size)}>
      <div className="absolute w-full h-full rounded-full border-4 border-primary/20 animate-pulse" />
      <div className="absolute w-1/2 h-1/2 bg-primary/10 rounded-full animate-ping" />
      {dots}
    </div>
  );
}

// Lotus Flower Loader
function LotusLoader({ size }: { size: string }) {
  return (
    <div className={cn("relative", size)}>
      {/* Lotus petals */}
      {[...Array(8)].map((_, i) => (
        <div 
          key={i}
          className="absolute inset-0 animate-lotus-petal"
          style={{
            transform: `rotate(${i * 45}deg)`,
            animationDelay: `${i * 0.125}s`
          }}
        >
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1/2 bg-primary/80 rounded-full origin-bottom"
          />
        </div>
      ))}
      
      {/* Center of the lotus */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1/4 h-1/4 rounded-full bg-amber-400 animate-pulse" />
      </div>
    </div>
  );
}

// Sword Loader (rotating swords)
function SwordLoader({ size }: { size: string }) {
  return (
    <div className={cn("relative", size)}>
      {/* Three rotating swords */}
      {[...Array(3)].map((_, i) => (
        <div 
          key={i}
          className="absolute inset-0 animate-sword-rotate"
          style={{
            animationDelay: `${i * 0.33}s`
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3/4 bg-gray-300">
            {/* Sword handle */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-700 rounded-full" />
            {/* Sword blade */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 border-t-4 border-l-4 border-r-4 border-gray-300" style={{ transform: 'translateX(-50%) rotate(45deg)' }} />
          </div>
        </div>
      ))}
      
      {/* Center point */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1/6 h-1/6 rounded-full bg-primary animate-ping" />
      </div>
    </div>
  );
}

// Scroll Loader (unrolling scroll)
function ScrollLoader({ size }: { size: string }) {
  return (
    <div className={cn("relative", size)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3/4 h-1/2 bg-amber-100 rounded-lg relative overflow-hidden animate-scroll-unroll">
          {/* Scroll content lines */}
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="absolute left-4 h-0.5 bg-gray-400 animate-scroll-line"
              style={{
                top: `${30 + i * 15}%`,
                width: `${70 - i * 10}%`,
                animationDelay: `${0.2 + i * 0.1}s`
              }}
            />
          ))}
          
          {/* Scroll rollers */}
          <div className="absolute top-0 left-0 w-2 h-full bg-amber-700 rounded-l-lg" />
          <div className="absolute top-0 right-0 w-2 h-full bg-amber-700 rounded-r-lg" />
        </div>
      </div>
    </div>
  );
}

// Simple Loader (spinning circle with pulse)
function SimpleLoader({ size }: { size: string }) {
  return (
    <div className={cn("relative", size)}>
      <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
      <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
      <div className="absolute inset-0 m-auto w-1/3 h-1/3 bg-primary/30 rounded-full animate-ping" />
    </div>
  );
}