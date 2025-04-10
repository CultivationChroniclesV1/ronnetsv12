import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useGameEngine } from '@/lib/gameEngine';
import { setContext, setPage, setRealm } from '@/lib/moodManager';

// Define available mood contexts
export type MoodContextType = 
  | 'idle' 
  | 'cultivating' 
  | 'breakthrough' 
  | 'combat' 
  | 'low-health' 
  | 'victory' 
  | 'meditation';

interface MoodProviderContextType {
  currentMood: MoodContextType;
  setMood: (mood: MoodContextType) => void;
  isMoodPulsing: boolean;
  // Shortcut helpers for common actions:
  startCultivating: () => void;
  startMeditation: () => void;
  triggerBreakthrough: () => void;
  celebrateVictory: () => void;
  resetToIdle: () => void;
}

const MoodContext = createContext<MoodProviderContextType>({
  currentMood: 'idle',
  setMood: () => {},
  isMoodPulsing: false,
  startCultivating: () => {},
  startMeditation: () => {},
  triggerBreakthrough: () => {},
  celebrateVictory: () => {},
  resetToIdle: () => {}
});

interface MoodProviderProps {
  children: ReactNode;
}

export function MoodProvider({ children }: MoodProviderProps) {
  const [location] = useLocation();
  const { game } = useGameEngine();
  const [currentMood, setCurrentMood] = useState<MoodContextType>('idle');
  const [isMoodPulsing, setIsMoodPulsing] = useState(false);
  
  // Update the mood in the moodManager when it changes
  useEffect(() => {
    setContext(currentMood);
    
    // Check if the current mood should pulse
    setIsMoodPulsing(['cultivating', 'breakthrough', 'combat', 'low-health', 'victory', 'meditation'].includes(currentMood));
  }, [currentMood]);
  
  // Update page-based mood when location changes
  useEffect(() => {
    if (location) {
      setPage(location);
      
      // Some pages automatically set specific moods
      if (location === '/combat') {
        setCurrentMood('combat');
      } else if (location === '/game') {
        setCurrentMood('cultivating');
      } else {
        setCurrentMood('idle');
      }
    }
  }, [location]);
  
  // Update realm-based mood when realm changes
  useEffect(() => {
    setRealm(game.realm);
  }, [game.realm]);
  
  // In combat, update mood based on energy
  useEffect(() => {
    if (location === '/combat') {
      // Use energy as an indicator of health in combat
      const energy = game.energy;
      const maxStorage = 1000; // Use a fixed value for simplicity
      
      if (typeof energy === 'number') {
        const energyPercentage = energy / maxStorage;
        
        if (energyPercentage < 0.3) {
          setCurrentMood('low-health');
        } else {
          setCurrentMood('combat');
        }
      }
    }
  }, [location, game.energy]);
  
  // Helper functions for common mood changes
  const startCultivating = () => setCurrentMood('cultivating');
  const startMeditation = () => setCurrentMood('meditation');
  const triggerBreakthrough = () => setCurrentMood('breakthrough');
  const celebrateVictory = () => setCurrentMood('victory');
  const resetToIdle = () => setCurrentMood('idle');
  
  const contextValue = {
    currentMood,
    setMood: setCurrentMood,
    isMoodPulsing,
    startCultivating,
    startMeditation,
    triggerBreakthrough,
    celebrateVictory,
    resetToIdle
  };
  
  return (
    <MoodContext.Provider value={contextValue}>
      {children}
    </MoodContext.Provider>
  );
}

// Custom hook for using the mood context
export const useMood = () => {
  return useContext(MoodContext);
};