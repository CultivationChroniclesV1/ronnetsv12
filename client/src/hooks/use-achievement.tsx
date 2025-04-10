import { useState, useEffect, useCallback } from 'react';
import { AchievementAnimation } from '@/components/achievement-animation';
import { useGameEngine } from '@/lib/gameEngine';
import { ACHIEVEMENTS } from '@/lib/constants';

type AchievementType = 'unlock' | 'levelUp' | 'breakthrough' | 'legendary';

interface AchievementToShow {
  id: string;
  title: string;
  description: string;
  type: AchievementType;
  icon?: string;
}

/**
 * Custom hook for tracking and displaying achievements
 * Monitors the game state for new achievements, level ups, and breakthroughs
 */
export function useAchievement() {
  const { game } = useGameEngine();
  const [achievementQueue, setAchievementQueue] = useState<AchievementToShow[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<AchievementToShow | null>(null);
  const [prevAchievements, setPrevAchievements] = useState<Record<string, boolean>>({});
  const [prevLevel, setPrevLevel] = useState(game.cultivationLevel);
  
  // Process achievements from the queue
  useEffect(() => {
    if (achievementQueue.length > 0 && !currentAchievement) {
      // Show the next achievement
      setCurrentAchievement(achievementQueue[0]);
      // Remove it from the queue
      setAchievementQueue(prev => prev.slice(1));
    }
  }, [achievementQueue, currentAchievement]);
  
  // Dismiss the current achievement
  const dismissAchievement = useCallback(() => {
    setCurrentAchievement(null);
  }, []);
  
  // Check for new achievements
  useEffect(() => {
    // Clone previous achievements for comparison
    const newAchievements: AchievementToShow[] = [];
    
    // Check each achievement
    Object.keys(game.achievements).forEach(id => {
      const achievement = game.achievements[id];
      const wasEarned = prevAchievements[id];
      
      // If newly earned
      if (achievement.earned && !wasEarned) {
        const achievementData = ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS];
        if (achievementData) {
          newAchievements.push({
            id,
            title: achievementData.name,
            description: achievementData.description,
            type: 'unlock',
            icon: achievementData.icon
          });
        }
      }
    });
    
    // Check for level up
    if (game.cultivationLevel > prevLevel) {
      newAchievements.push({
        id: `level-up-${game.cultivationLevel}`,
        title: 'Cultivation Level Up!',
        description: `You have reached cultivation level ${game.cultivationLevel}`,
        type: 'levelUp',
        icon: 'level-up-alt'
      });
    }
    
    // Add new achievements to queue
    if (newAchievements.length > 0) {
      setAchievementQueue(prev => [...prev, ...newAchievements]);
    }
    
    // Update previous state
    const newPrevAchievements: Record<string, boolean> = {};
    Object.keys(game.achievements).forEach(id => {
      newPrevAchievements[id] = game.achievements[id].earned;
    });
    setPrevAchievements(newPrevAchievements);
    setPrevLevel(game.cultivationLevel);
    
  }, [game.achievements, game.cultivationLevel, prevAchievements, prevLevel]);
  
  // Function to manually trigger achievements (for breakthroughs, etc.)
  const triggerAchievement = useCallback((achievement: AchievementToShow) => {
    setAchievementQueue(prev => [...prev, achievement]);
  }, []);
  
  // Function to trigger a breakthrough achievement
  const triggerBreakthrough = useCallback((newRealm: string, newStage: number) => {
    const achievement: AchievementToShow = {
      id: `breakthrough-${Date.now()}`,
      title: 'Breakthrough!',
      description: `You have advanced to ${newRealm.charAt(0).toUpperCase() + newRealm.slice(1)} Realm, Stage ${newStage}`,
      type: 'breakthrough',
      icon: 'fire'
    };
    
    triggerAchievement(achievement);
  }, [triggerAchievement]);
  
  return {
    currentAchievement,
    dismissAchievement,
    triggerAchievement,
    triggerBreakthrough,
    AchievementDisplay: currentAchievement ? (
      <AchievementAnimation
        type={currentAchievement.type}
        title={currentAchievement.title}
        description={currentAchievement.description}
        icon={currentAchievement.icon}
        onComplete={dismissAchievement}
      />
    ) : null
  };
}