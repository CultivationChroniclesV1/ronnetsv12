import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getInitialGameState, updateAchievements, getBreakthroughChance, getNextLevelRequirements, getCurrentRealmData } from './gameState';
import { apiRequest } from './queryClient';
import { AUTO_SAVE_INTERVAL } from './constants';
import { toast } from '@/hooks/use-toast';
import { calculateOfflineProgress } from './utils';
import type { GameState } from '@shared/schema';

export interface GameEngineState {
  game: GameState;
  lastTick: number;
  isInitialized: boolean;
  tickInterval: number | null;
  autoSaveInterval: number | null;
  isAutoSaveEnabled: boolean;
  isOfflineProgressEnabled: boolean;
  showNotifications: boolean;
  settingsOpen: boolean;
  
  // Actions
  initialize: () => void;
  startGameLoop: () => void;
  stopGameLoop: () => void;
  manualCultivate: () => void;
  buyUpgrade: (upgradeId: string) => void;
  upgradeSkill: (skillId: string) => void;
  attemptBreakthrough: () => void;
  toggleSettings: () => void;
  toggleAutoSave: () => void;
  toggleOfflineProgress: () => void;
  toggleNotifications: () => void;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
  resetGame: () => void;
  tick: (currentTime: number) => void;
  updateGameState: (updater: (state: GameState) => GameState) => void;
}

export const useGameEngine = create<GameEngineState>()(
  persist(
    (set, get) => ({
      game: getInitialGameState(),
      lastTick: Date.now(),
      isInitialized: false,
      tickInterval: null,
      autoSaveInterval: null,
      isAutoSaveEnabled: true,
      isOfflineProgressEnabled: true,
      showNotifications: true,
      settingsOpen: false,
      
      initialize: () => {
        // Check for offline progress when game starts
        const state = get();
        if (!state.isInitialized) {
          if (state.isOfflineProgressEnabled && state.game.lastSaved) {
            const now = new Date().toISOString();
            const qiGained = calculateOfflineProgress(
              state.game.lastSaved,
              now,
              state.game.energyRate,
              state.game.maxCultivationProgress
            );
            
            if (qiGained > 0) {
              set(state => ({
                game: {
                  ...state.game,
                  energy: Math.min(state.game.energy + qiGained, state.game.maxCultivationProgress),
                  totalQiGenerated: state.game.totalQiGenerated + qiGained,
                  lastOfflineTime: state.game.lastSaved
                }
              }));
              
              // Notify about offline progress
              if (state.showNotifications) {
                toast({
                  title: "Offline Progress",
                  description: `You gained ${Math.floor(qiGained)} Qi while away.`
                });
              }
            }
          }
          
          // Start game loop
          state.startGameLoop();
          set({ isInitialized: true });
        }
      },
      
      startGameLoop: () => {
        // Stop any existing intervals
        const state = get();
        if (state.tickInterval) {
          clearInterval(state.tickInterval);
        }
        if (state.autoSaveInterval) {
          clearInterval(state.autoSaveInterval);
        }
        
        // Set up game loop (10 ticks per second)
        const tickInterval = setInterval(() => {
          const currentTime = Date.now();
          get().tick(currentTime);
        }, 100) as unknown as number;
        
        // Set up auto-save if enabled
        let autoSaveInterval = null;
        if (state.isAutoSaveEnabled) {
          autoSaveInterval = setInterval(() => {
            get().saveGame();
          }, AUTO_SAVE_INTERVAL) as unknown as number;
        }
        
        set({ tickInterval, autoSaveInterval });
      },
      
      stopGameLoop: () => {
        const { tickInterval, autoSaveInterval } = get();
        if (tickInterval) clearInterval(tickInterval);
        if (autoSaveInterval) clearInterval(autoSaveInterval);
        set({ tickInterval: null, autoSaveInterval: null });
      },
      
      tick: (currentTime: number) => {
        const state = get();
        const elapsedSeconds = (currentTime - state.lastTick) / 1000;
        
        // Update energy and other time-based values
        set(state => {
          const qiGained = state.game.energyRate * elapsedSeconds;
          const newEnergy = Math.min(
            state.game.energy + qiGained, 
            state.game.maxCultivationProgress
          );
          
          // Update cultivation progress based on energy gain
          const newCultivationProgress = Math.min(
            state.game.cultivationProgress + (qiGained * 0.1),
            state.game.maxCultivationProgress
          );
          
          // Track highest Qi value
          const highestQi = Math.max(state.game.highestQi, newEnergy);
          
          // Update total cultivation time
          const timeCultivating = state.game.timeCultivating + elapsedSeconds;
          
          return {
            lastTick: currentTime,
            game: {
              ...state.game,
              energy: newEnergy,
              totalQiGenerated: state.game.totalQiGenerated + qiGained,
              cultivationProgress: newCultivationProgress,
              highestQi,
              timeCultivating
            }
          };
        });
        
        // Check for achievements
        const updatedState = updateAchievements(get().game);
        if (updatedState !== get().game) {
          set({ game: updatedState });
          
          // Notify about new achievements
          if (state.showNotifications) {
            const newAchievements = Object.entries(updatedState.achievements)
              .filter(([id, achievement]) => 
                achievement.earned && 
                (!state.game.achievements[id].earned || !state.game.achievements[id])
              );
            
            for (const [id, _] of newAchievements) {
              const achievementName = id.charAt(0).toUpperCase() + id.slice(1)
                .replace(/([A-Z])/g, ' $1')
                .trim();
              
              toast({
                title: "Achievement Unlocked!",
                description: achievementName,
                variant: "default"
              });
            }
          }
        }
      },
      
      manualCultivate: () => {
        set(state => {
          const qiGained = state.game.manualCultivationAmount;
          const newEnergy = Math.min(
            state.game.energy + qiGained, 
            state.game.maxCultivationProgress
          );
          
          return {
            game: {
              ...state.game,
              energy: newEnergy,
              totalQiGenerated: state.game.totalQiGenerated + qiGained,
              timesMeditated: state.game.timesMeditated + 1,
              highestQi: Math.max(state.game.highestQi, newEnergy)
            }
          };
        });
      },
      
      buyUpgrade: (upgradeId: string) => {
        set(state => {
          const upgradeCost = state.game.upgrades[upgradeId].cost;
          
          // Check if player has enough energy
          if (state.game.energy < upgradeCost) {
            if (state.showNotifications) {
              toast({
                title: "Not enough Qi",
                description: "You need more Qi energy for this upgrade.",
                variant: "destructive"
              });
            }
            return state;
          }
          
          // Apply upgrade effects
          const newLevel = state.game.upgrades[upgradeId].level + 1;
          let newGameState = { ...state.game };
          
          newGameState.energy -= upgradeCost;
          
          // Calculate next cost
          newGameState.upgrades[upgradeId] = {
            level: newLevel,
            cost: Math.floor(upgradeCost * 1.5) // Increase cost
          };
          
          // Apply specific upgrade effects
          switch (upgradeId) {
            case 'meridian':
              // Increase Qi capacity by 10% per level
              newGameState.maxCultivationProgress = getNextLevelRequirements(state.game) * (1 + (newLevel * 0.1));
              break;
              
            case 'circulation':
              // Increase passive Qi generation by 0.1 per level
              newGameState.energyRate += 0.1;
              break;
              
            case 'spirit':
              // Increase manual cultivation by 2 per level
              newGameState.manualCultivationAmount += 2;
              break;
              
            case 'breakthrough':
              // Effect is calculated when attempting breakthrough
              break;
          }
          
          if (state.showNotifications) {
            toast({
              title: "Upgrade Purchased",
              description: `You've increased your ${upgradeId} to level ${newLevel}.`
            });
          }
          
          return { game: newGameState };
        });
      },
      
      upgradeSkill: (skillId: string) => {
        set(state => {
          const skillCost = state.game.skills[skillId].cost;
          
          // Check if player has enough energy
          if (state.game.energy < skillCost) {
            if (state.showNotifications) {
              toast({
                title: "Not enough Qi",
                description: "You need more Qi energy to improve this technique.",
                variant: "destructive"
              });
            }
            return state;
          }
          
          // Apply skill upgrade
          const newLevel = state.game.skills[skillId].level + 1;
          let newGameState = { ...state.game };
          
          newGameState.energy -= skillCost;
          
          // Calculate new skill data
          newGameState.skills[skillId] = {
            ...state.game.skills[skillId],
            level: newLevel,
            cost: Math.floor(skillCost * 1.5) // Increase cost
          };
          
          // Apply specific skill effects
          switch (skillId) {
            case 'basic-qi':
            case 'fireheart':
              // Increase Qi rate
              const effectAmount = skillId === 'basic-qi' ? 0.1 : 0.3;
              newGameState.energyRate += effectAmount;
              newGameState.skills[skillId].effect += effectAmount;
              break;
              
            case 'mystic-ice':
              // Effect is calculated when attempting breakthrough
              newGameState.skills[skillId].effect += 0.05;
              break;
          }
          
          if (state.showNotifications) {
            toast({
              title: "Technique Improved",
              description: `You've improved your cultivation technique to level ${newLevel}.`
            });
          }
          
          return { game: newGameState };
        });
      },
      
      attemptBreakthrough: () => {
        set(state => {
          // Check if player has enough energy
          if (state.game.energy < state.game.maxCultivationProgress) {
            if (state.showNotifications) {
              toast({
                title: "Insufficient Qi",
                description: "You need more Qi energy to attempt a breakthrough.",
                variant: "destructive"
              });
            }
            return state;
          }
          
          // Calculate breakthrough chance
          const successChance = getBreakthroughChance(state.game);
          const roll = Math.random() * 100;
          const success = roll <= successChance;
          
          // Consume energy regardless of outcome
          let newGameState = {
            ...state.game,
            energy: state.game.energy - state.game.maxCultivationProgress
          };
          
          if (success) {
            // Successful breakthrough
            newGameState.cultivationLevel += 1;
            newGameState.cultivationProgress = 0;
            newGameState.successfulBreakthroughs += 1;
            
            // Check if advancing realm stage
            if (newGameState.realmStage < newGameState.realmMaxStage) {
              newGameState.realmStage += 1;
            } else {
              // Advance to next realm
              const realmOrder = ['qi', 'foundation', 'core', 'spirit', 'void', 'celestial'];
              const currentRealmIndex = realmOrder.indexOf(state.game.realm);
              
              if (currentRealmIndex < realmOrder.length - 1) {
                const nextRealm = realmOrder[currentRealmIndex + 1];
                newGameState.realm = nextRealm;
                newGameState.realmStage = 1;
              }
            }
            
            // Update max cultivation progress for new level
            newGameState.maxCultivationProgress = getNextLevelRequirements(newGameState);
            
            // Apply meridian expansion upgrade effect
            const meridianLevel = newGameState.upgrades.meridian?.level || 0;
            if (meridianLevel > 0) {
              newGameState.maxCultivationProgress *= (1 + (meridianLevel * 0.1));
            }
            
            if (state.showNotifications) {
              const realmData = getCurrentRealmData(newGameState);
              toast({
                title: "Breakthrough Success!",
                description: `You have advanced to ${realmData.name} stage ${newGameState.realmStage}.`,
                variant: "default"
              });
            }
          } else {
            // Failed breakthrough
            newGameState.failedBreakthroughs += 1;
            newGameState.cultivationProgress = Math.floor(newGameState.cultivationProgress * 0.5);
            
            if (state.showNotifications) {
              toast({
                title: "Breakthrough Failed",
                description: "Your attempt at breakthrough has failed. You've lost some cultivation progress.",
                variant: "destructive"
              });
            }
          }
          
          return { game: newGameState };
        });
      },
      
      toggleSettings: () => {
        set(state => ({ settingsOpen: !state.settingsOpen }));
      },
      
      toggleAutoSave: () => {
        const currentState = get();
        const newAutoSaveState = !currentState.isAutoSaveEnabled;
        
        // Clear existing interval
        if (currentState.autoSaveInterval) {
          clearInterval(currentState.autoSaveInterval);
        }
        
        // Setup new interval if enabled
        let newInterval = null;
        if (newAutoSaveState) {
          newInterval = setInterval(() => {
            get().saveGame();
          }, AUTO_SAVE_INTERVAL) as unknown as number;
        }
        
        set({ 
          isAutoSaveEnabled: newAutoSaveState,
          autoSaveInterval: newInterval
        });
      },
      
      toggleOfflineProgress: () => {
        set(state => ({ isOfflineProgressEnabled: !state.isOfflineProgressEnabled }));
      },
      
      toggleNotifications: () => {
        set(state => ({ showNotifications: !state.showNotifications }));
      },
      
      saveGame: async () => {
        try {
          const state = get();
          
          // Update last saved timestamp
          const gameWithUpdatedTimestamp = {
            ...state.game,
            lastSaved: new Date().toISOString()
          };
          
          set({ game: gameWithUpdatedTimestamp });
          
          // Save to local storage happens automatically via zustand/persist
          
          // Save to server
          await apiRequest('POST', '/api/save', { gameState: gameWithUpdatedTimestamp });
          
          if (state.showNotifications) {
            toast({
              title: "Game Saved",
              description: "Your progress has been saved.",
              variant: "default"
            });
          }
        } catch (error) {
          console.error('Error saving game:', error);
          if (get().showNotifications) {
            toast({
              title: "Save Failed",
              description: "Failed to save your progress to the server.",
              variant: "destructive"
            });
          }
        }
      },
      
      loadGame: async () => {
        try {
          const response = await apiRequest('GET', '/api/load');
          const data = await response.json();
          
          if (data.success && data.gameState) {
            set({ game: data.gameState });
            
            if (get().showNotifications) {
              toast({
                title: "Game Loaded",
                description: "Your saved progress has been loaded.",
                variant: "default"
              });
            }
          }
        } catch (error) {
          console.error('Error loading game:', error);
          // Silent failure - will use local storage version
        }
      },
      
      resetGame: () => {
        if (window.confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
          const newGameState = getInitialGameState();
          set({ game: newGameState });
          
          if (get().showNotifications) {
            toast({
              title: "Game Reset",
              description: "Your progress has been reset.",
              variant: "default"
            });
          }
        }
      },
      
      updateGameState: (updater) => {
        set(state => ({
          game: updater(state.game)
        }));
      }
    }),
    {
      name: 'cultivation-game-storage',
      partialize: (state) => ({ 
        game: state.game,
        isAutoSaveEnabled: state.isAutoSaveEnabled,
        isOfflineProgressEnabled: state.isOfflineProgressEnabled,
        showNotifications: state.showNotifications
      })
    }
  )
);
