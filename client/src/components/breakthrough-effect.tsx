import { useEffect, useState } from 'react';
import { useGameEngine } from '@/lib/gameEngine';
import { useMood } from '@/components/mood-provider';
import { playSfx } from '@/lib/audioManager';

/**
 * BreakthroughEffect component
 * 
 * Creates a visual effect when player achieves a breakthrough
 * Particles and energy bursts for realm/level advancement
 */
export function BreakthroughEffect() {
  const { game } = useGameEngine();
  const { triggerBreakthrough } = useMood();
  const [prevRealm, setPrevRealm] = useState(game.realm);
  const [prevRealmStage, setPrevRealmStage] = useState(game.realmStage);
  const [prevLevel, setPrevLevel] = useState(game.cultivationLevel);
  const [isActive, setIsActive] = useState(false);
  const [rayCount, setRayCount] = useState(12);
  
  // Check for breakthrough events
  useEffect(() => {
    // Detect realm change (major breakthrough)
    if (game.realm !== prevRealm) {
      triggerBreakthrough();
      setIsActive(true);
      setRayCount(24);
      playSfx('breakthrough');
      
      const timer = setTimeout(() => {
        setIsActive(false);
      }, 3000);
      
      setPrevRealm(game.realm);
      setPrevRealmStage(game.realmStage);
      
      return () => clearTimeout(timer);
    }
    // Detect realm stage change (medium breakthrough) 
    else if (game.realmStage !== prevRealmStage) {
      triggerBreakthrough();
      setIsActive(true);
      setRayCount(18);
      playSfx('breakthrough');
      
      const timer = setTimeout(() => {
        setIsActive(false);
      }, 2500);
      
      setPrevRealmStage(game.realmStage);
      
      return () => clearTimeout(timer);
    }
    // Detect level change (minor breakthrough)
    else if (game.cultivationLevel !== prevLevel && game.cultivationLevel > prevLevel) {
      triggerBreakthrough();
      setIsActive(true);
      setRayCount(12);
      playSfx('breakthrough');
      
      const timer = setTimeout(() => {
        setIsActive(false);
      }, 2000);
      
      setPrevLevel(game.cultivationLevel);
      
      return () => clearTimeout(timer);
    }
  }, [game.realm, game.realmStage, game.cultivationLevel, prevRealm, prevRealmStage, prevLevel, triggerBreakthrough]);
  
  // Create light rays for the breakthrough effect
  const rays = Array.from({ length: rayCount }, (_, i) => {
    const angle = (i / rayCount) * 360;
    const length = Math.random() * 50 + 100; // 100-150px
    
    return {
      angle,
      length,
      width: Math.random() * 2 + 1, // 1-3px
      opacity: Math.random() * 0.3 + 0.7, // 70-100% opacity
    };
  });
  
  if (!isActive) return null;
  
  return (
    <div className={`breakthrough-effect ${isActive ? 'active' : ''}`}>
      <div className="breakthrough-circle" />
      <div className="breakthrough-rays">
        {rays.map((ray, index) => (
          <div 
            key={index}
            className="breakthrough-ray"
            style={{
              height: `${ray.length}px`,
              width: `${ray.width}px`,
              transform: `rotate(${ray.angle}deg) translateY(-50%)`,
              opacity: ray.opacity
            }}
          />
        ))}
      </div>
    </div>
  );
}