import { useEffect, useState } from 'react';
import { useGameEngine } from '@/lib/gameEngine';
import { setContext } from '@/lib/moodManager';

/**
 * MoodController component
 * 
 * This component adds mood transition effects to specific game actions
 * Changes background colors based on gameplay events like breakthrough, cultivation, etc.
 */
export function MoodController() {
  const { game, isInitialized } = useGameEngine();
  const [lastRealmStage, setLastRealmStage] = useState(game.realmStage);
  const [lastRealm, setLastRealm] = useState(game.realm);
  const [lastEnergy, setLastEnergy] = useState(game.energy);
  
  // Check for breakthrough
  useEffect(() => {
    if (isInitialized) {
      // Detect realm progression
      if (game.realm !== lastRealm || game.realmStage !== lastRealmStage) {
        // A breakthrough happened!
        setContext('breakthrough');
        
        // After a while, return to normal state
        const timer = setTimeout(() => {
          setContext('idle');
        }, 3000);
        
        // Update stored values
        setLastRealm(game.realm);
        setLastRealmStage(game.realmStage);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isInitialized, game.realm, game.realmStage, lastRealm, lastRealmStage]);
  
  // Check for active cultivation
  useEffect(() => {
    if (isInitialized) {
      // Detect active cultivation (energy increasing significantly)
      if (game.energy > lastEnergy + 10) {
        setContext('cultivating');
        
        // Update stored energy value
        setLastEnergy(game.energy);
      } 
      // Small changes should be ignored to avoid flickering
      else if (Math.abs(game.energy - lastEnergy) > 1) {
        setLastEnergy(game.energy);
      }
    }
  }, [isInitialized, game.energy, lastEnergy]);
  
  // This component doesn't render anything visible
  return null;
}