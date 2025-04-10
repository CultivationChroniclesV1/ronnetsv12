import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useGameEngine } from '@/lib/gameEngine';

interface AmbientElement {
  id: number;
  type: 'leaf' | 'petal';
  left: number;
  animationDuration: number;
  delay: number;
  scale: number;
  opacity: number;
  rotation: number;
}

/**
 * AmbientBackground component
 * 
 * Creates floating leaves or petals in the background
 * Different themes for different pages
 */
export function AmbientBackground() {
  const [location] = useLocation();
  const { game } = useGameEngine();
  const [elements, setElements] = useState<AmbientElement[]>([]);
  
  // Generate new ambient elements when location changes
  useEffect(() => {
    // Clear existing elements
    setElements([]);
    
    // Determine element type based on location
    let elementType: 'leaf' | 'petal' = 'leaf';
    
    if (location === '/combat') {
      elementType = 'petal'; // Red petals for combat
    } else if (location.includes('/map')) {
      elementType = 'leaf'; // Green leaves for map
    } else if (location === '/cultivation' || location === '/game') {
      elementType = location === '/cultivation' ? 'petal' : 'leaf';
    } else {
      // Default based on realm
      elementType = ['Qi Condensation', 'Foundation Establishment'].includes(game.realm) 
        ? 'leaf' 
        : 'petal';
    }
    
    // Generate new elements
    const count = Math.floor(Math.random() * 5) + 5; // 5-10 elements
    const newElements: AmbientElement[] = [];
    
    for (let i = 0; i < count; i++) {
      newElements.push({
        id: Date.now() + i,
        type: elementType,
        left: Math.random() * 100, // percentage across screen
        animationDuration: Math.random() * 15 + 10, // 10-25 seconds
        delay: Math.random() * 10, // 0-10 second delay
        scale: Math.random() * 0.5 + 0.5, // 0.5-1 scale
        opacity: Math.random() * 0.3 + 0.2, // 20-50% opacity
        rotation: Math.random() * 360 // random initial rotation
      });
    }
    
    setElements(newElements);
  }, [location, game.realm]);
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((element) => (
        <div
          key={element.id}
          className={element.type === 'leaf' ? 'floating-leaf' : 'floating-petal'}
          style={{
            left: `${element.left}%`,
            top: '-60px',
            transform: `scale(${element.scale}) rotate(${element.rotation}deg)`,
            opacity: element.opacity,
            animationDuration: `${element.animationDuration}s`,
            animationDelay: `${element.delay}s`
          }}
        />
      ))}
    </div>
  );
}