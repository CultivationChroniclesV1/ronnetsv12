import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
  variant?: 'default' | 'breakthrough' | 'cultivation' | 'combat' | 'meditation';
  message?: string;
  subMessage?: string;
}

/**
 * Zen-inspired loading animation with different variants based on game context
 */
export function LoadingAnimation({
  variant = 'default',
  message = 'Gathering Spiritual Energy',
  subMessage = 'Please wait as we cultivate the next page...'
}: LoadingAnimationProps) {
  const [visible, setVisible] = useState(false);
  
  // Animate entrance with longer duration
  useEffect(() => {
    // Show loading for at least 1 second
    const timer = setTimeout(() => setVisible(true), 100);
    
    // Force the component to stay visible for at least 1 second
    const forceShowTimer = setTimeout(() => {
      // Loading animation will be visible for at least 1 second
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(forceShowTimer);
    };
  }, []);
  
  return (
    <div className={cn(
      "fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm transition-all duration-500",
      visible ? "opacity-100" : "opacity-0"
    )}>
      <div className="relative text-center p-8 rounded-lg bg-background/60 backdrop-blur-md shadow-xl border border-primary/20 transition-all duration-500 transform">
        {/* Ambient particles */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className={cn(
                "absolute w-2 h-2 rounded-full",
                variant === 'breakthrough' ? "bg-amber-500" : 
                variant === 'cultivation' ? "bg-emerald-400" :
                variant === 'combat' ? "bg-red-400" :
                variant === 'meditation' ? "bg-blue-400" :
                "bg-primary"
              )}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
                animation: `float-particle ${Math.random() * 5 + 8}s ease-in-out infinite alternate`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
        
        {/* Main loading animation */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Outer ring */}
          <div 
            className={cn(
              "absolute inset-0 rounded-full opacity-80",
              variant === 'breakthrough' ? "border-t-4 border-r-2 border-amber-500" : 
              variant === 'cultivation' ? "border-t-4 border-r-2 border-emerald-400" :
              variant === 'combat' ? "border-t-4 border-r-2 border-red-400" :
              variant === 'meditation' ? "border-t-4 border-r-2 border-blue-400" :
              "border-t-4 border-r-2 border-primary"
            )}
            style={{ animation: 'spin 3s linear infinite' }}
          />
          
          {/* Middle ring */}
          <div 
            className={cn(
              "absolute inset-4 rounded-full opacity-80",
              variant === 'breakthrough' ? "border-r-4 border-l-2 border-amber-400" : 
              variant === 'cultivation' ? "border-r-4 border-l-2 border-emerald-500" :
              variant === 'combat' ? "border-r-4 border-l-2 border-red-500" :
              variant === 'meditation' ? "border-r-4 border-l-2 border-blue-500" :
              "border-r-4 border-l-2 border-primary"
            )}
            style={{ animation: 'spin-reverse 2.5s linear infinite' }}
          />
          
          {/* Inner ring */}
          <div 
            className={cn(
              "absolute inset-8 rounded-full opacity-90",
              variant === 'breakthrough' ? "border-b-4 border-l-2 border-amber-300" : 
              variant === 'cultivation' ? "border-b-4 border-l-2 border-emerald-300" :
              variant === 'combat' ? "border-b-4 border-l-2 border-red-300" :
              variant === 'meditation' ? "border-b-4 border-l-2 border-blue-300" :
              "border-b-4 border-l-2 border-primary"
            )}
            style={{ animation: 'spin 2s linear infinite' }}
          />
          
          {/* Center energy orb */}
          <div className="absolute inset-10 rounded-full bg-gradient-to-br from-white/80 to-primary/50 shadow-inner flex items-center justify-center">
            <div 
              className={cn(
                "w-4 h-4 rounded-full animate-pulse",
                variant === 'breakthrough' ? "bg-amber-400" : 
                variant === 'cultivation' ? "bg-emerald-400" :
                variant === 'combat' ? "bg-red-400" :
                variant === 'meditation' ? "bg-blue-400" :
                "bg-primary"
              )}
            />
          </div>
          
          {/* Lotus petal overlays */}
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="absolute top-1/2 left-1/2 w-8 h-12 -mt-6 -ml-4 opacity-20"
              style={{ 
                transform: `rotate(${i * 45}deg) translateY(-12px)`,
                transformOrigin: 'center bottom',
                animation: `petal-sway 3s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.2}s`
              }}
            >
              <div 
                className={cn(
                  "w-full h-full rounded-t-full",
                  variant === 'breakthrough' ? "bg-amber-200" : 
                  variant === 'cultivation' ? "bg-emerald-200" :
                  variant === 'combat' ? "bg-red-200" :
                  variant === 'meditation' ? "bg-blue-200" :
                  "bg-primary/30"
                )}
              />
            </div>
          ))}
        </div>
        
        {/* Text content */}
        <h3 
          className={cn(
            "text-xl font-serif mb-2 transition-colors",
            variant === 'breakthrough' ? "text-amber-700" : 
            variant === 'cultivation' ? "text-emerald-700" :
            variant === 'combat' ? "text-red-700" :
            variant === 'meditation' ? "text-blue-700" :
            "text-primary"
          )}
        >
          {message}
        </h3>
        <p className="text-foreground/70">{subMessage}</p>
      </div>
    </div>
  );
}

// Add these animations to index.css
export const loadingAnimationCSS = `
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes spin-reverse {
  to { transform: rotate(-360deg); }
}

@keyframes petal-sway {
  0% { transform-origin: center bottom; transform: rotate(var(--rotate)) translateY(-12px) rotate(-5deg); }
  100% { transform-origin: center bottom; transform: rotate(var(--rotate)) translateY(-12px) rotate(5deg); }
}

@keyframes float-particle {
  0% { transform: translate(0, 0); }
  100% { transform: translate(10px, -10px); }
}
`;