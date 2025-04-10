import { useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { getThemeForPath, getBackgroundClasses, transitions } from '@/lib/animations';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Page transition component that wraps around the content of each page
 * It handles smooth transitions between pages and applies the correct theme
 */
export function PageTransition({ children }: PageTransitionProps) {
  const [location] = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousLocation, setPreviousLocation] = useState(location);
  const [content, setContent] = useState<ReactNode>(children);
  
  const theme = getThemeForPath(location);
  const bgClasses = getBackgroundClasses(theme);
  
  // Handle location changes
  useEffect(() => {
    if (location !== previousLocation) {
      // Start animation
      setIsAnimating(true);
      
      // After animation out completes, update content
      const timer = setTimeout(() => {
        setContent(children);
        setPreviousLocation(location);
        
        // After a small delay, start animating back in
        setTimeout(() => {
          setIsAnimating(false);
        }, 50);
      }, transitions.pageTransition);
      
      return () => clearTimeout(timer);
    }
  }, [location, previousLocation, children]);
  
  // Apply transition classes
  const transitionClass = isAnimating
    ? 'opacity-0 translate-y-4'
    : 'opacity-100 translate-y-0';
    
  return (
    <div className={`min-h-screen ${bgClasses}`}>
      <div 
        className={`transition-all duration-1000 ease-in-out ${transitionClass}`}
        style={{ 
          willChange: 'opacity, transform',
          transitionDuration: `${transitions.pageTransition}ms`
        }}
      >
        {content}
      </div>
    </div>
  );
}

/**
 * PageContent component that adds delayed animation to individual page content
 * Use this to wrap content within a page for staggered animations
 */
export function PageContent({ children, delay = 0 }: { children: ReactNode, delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div 
      className={`transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {children}
    </div>
  );
}