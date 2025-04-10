import React, { useState, useEffect } from 'react';
import { useGameEngine } from '@/lib/gameEngine';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { ENEMIES, LOCATIONS } from '@/lib/constants';

// Interface for quests
interface Quest {
  id: string;
  name: string;
  description: string;
  objective: string;
  type: 'sect' | 'main' | 'side' | 'hidden' | 'daily' | 'weekly';
  progress: number;
  target: number;
  rewards: {
    gold: number;
    spiritualStones: number;
    experience: number;
    items: string[];
  };
  deadline?: string;
  completed: boolean;
  location?: string;
  enemyType?: string;
  guide?: string;
}

// Function to generate quests with detailed guidance
const generateQuests = (cultivationRank: number): Quest[] => {
  const questTypes = ['sect', 'main', 'side', 'daily', 'weekly'];
  
  // We'll focus on specific types of quests with clear objectives
  const availableEnemies = Object.keys(ENEMIES);
  const availableLocations = Object.keys(LOCATIONS);
  
  // Filter locations based on player's rank to prevent quests for locked areas
  const accessibleLocations = availableLocations.filter(loc => {
    const locationData = LOCATIONS[loc as keyof typeof LOCATIONS];
    return !locationData.requiredLevel || cultivationRank >= locationData.requiredLevel;
  });
  
  if (accessibleLocations.length === 0) {
    // Ensure we always have at least one location (usually sect grounds)
    accessibleLocations.push('sect');
  }
  
  const quests: Quest[] = [];
  
  for (let i = 0; i < 5; i++) {
    const questType = questTypes[Math.floor(Math.random() * questTypes.length)];
    // We'll only create kill, gather and training quests for better tracking
    const objectiveTypes = ['kill', 'gather', 'train'];
    const objectiveType = objectiveTypes[Math.floor(Math.random() * objectiveTypes.length)];
    
    let target = 0;
    let questName = '';
    let questDesc = '';
    let objectiveDesc = '';
    let rewardGold = 0;
    let rewardStones = 0;
    let rewardExp = 0;
    let location = '';
    let enemyType = '';
    let guide = '';
    
    // Generate a unique timestamp for each quest
    const uniqueTimestamp = Date.now() + i;
    
    switch (objectiveType) {
      case 'kill':
        // Pick a random accessible location first
        location = accessibleLocations[Math.floor(Math.random() * accessibleLocations.length)];
        const locationName = LOCATIONS[location as keyof typeof LOCATIONS].name;
        
        // Pick an enemy type appropriate for this location
        // In a real implementation, you'd have a mapping of locations to enemy types
        enemyType = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        const enemyName = ENEMIES[enemyType as keyof typeof ENEMIES].name;
        
        target = 5 + Math.floor(Math.random() * 5); // Reduced variance for better balance
        questName = `Hunt ${enemyName}s in ${locationName}`;
        questDesc = `The sect requires you to eliminate ${target} ${enemyName}s that have been causing trouble in ${locationName}.`;
        objectiveDesc = `Defeat ${target} ${enemyName}s in ${locationName}`;
        rewardGold = 50 * cultivationRank;
        rewardStones = Math.floor(cultivationRank / 5) + 1;
        rewardExp = 20 * cultivationRank;
        
        // Specific guidance with location and enemy type
        guide = `Go to the Combat page and select the ${locationName} hunting ground. Specifically hunt for ${enemyName}s in this area. Each successful defeat of this enemy type in this location will count toward your quest progress.`;
        break;
        
      case 'gather':
        location = accessibleLocations[Math.floor(Math.random() * accessibleLocations.length)];
        const gatherLocationName = LOCATIONS[location as keyof typeof LOCATIONS].name;
        
        // Always set to 1 for gather quests as requested (gather once, then claim)
        target = 1;
        questName = `Gather Resources from ${gatherLocationName}`;
        questDesc = `The sect needs specific resources that can only be found in ${gatherLocationName} for crafting spiritual tools.`;
        objectiveDesc = `Gather resources from ${gatherLocationName}`;
        rewardGold = 40 * cultivationRank;
        rewardStones = Math.floor(cultivationRank / 6) + 1;
        rewardExp = 15 * cultivationRank;
        
        // Location-specific gathering instructions with clear "gather once, then claim" pattern
        guide = `Go to the Map page and select ${gatherLocationName}. Click the "Gather Resources" button once and wait for the gathering process to complete. After gathering once, return here to claim your reward. Higher cultivation ranks yield better quality resources.`;
        break;
        
      case 'train':
        target = 5 + Math.floor(Math.random() * 3); // Reduced variance
        questName = 'Sect Training Mission';
        questDesc = `The sect master has assigned you to complete ${target} training sessions to refine your cultivation technique and demonstrate your diligence.`;
        objectiveDesc = `Complete ${target} training sessions`;
        rewardGold = 30 * cultivationRank;
        rewardStones = Math.floor(cultivationRank / 7) + 1;
        rewardExp = 25 * cultivationRank;
        
        // Detailed training instructions
        guide = `Go to the main cultivation page and click the "Cultivate" button ${target} times to perform manual cultivation. Each successful session will count toward your goal. For faster results, ensure you have unlocked more efficient cultivation techniques through the upgrades section.`;
        break;
    }
    
    quests.push({
      id: `quest-${i}-${uniqueTimestamp}`, // Using uniqueTimestamp to ensure ID uniqueness
      name: questName,
      description: questDesc,
      objective: objectiveDesc,
      type: questType as any,
      progress: 0, // Start with 0 progress
      target: target,
      rewards: {
        gold: rewardGold,
        spiritualStones: rewardStones,
        experience: rewardExp,
        items: []
      },
      completed: false,
      location: location || undefined,
      enemyType: enemyType || undefined,
      guide: guide
    });
  }
  
  return quests;
};

export default function SectQuests() {
  const { game, updateGameState } = useGameEngine();
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  
  useEffect(() => {
    // Load quests from game state or generate new ones if none exist
    if (game.exploration.activeQuests.length === 0) {
      const newQuests = generateQuests(game.cultivationLevel);
      setActiveQuests(newQuests);
      
      // Save the generated quests to the game state
      updateGameState(state => ({
        ...state,
        exploration: {
          ...state.exploration,
          activeQuests: newQuests as any
        }
      }));
    } else {
      // Get existing quests but ensure they all have guides
      const existingQuests = [...game.exploration.activeQuests] as Quest[];
      let needsUpdate = false;
      
      // Check for and add missing guides to existing quests
      const updatedQuests = existingQuests.map(quest => {
        // If quest already has a guide, return it as is
        if (quest.guide) return quest;
        
        // Otherwise, generate appropriate guide based on quest type
        let guide = '';
        needsUpdate = true;
        
        if (quest.objective.toLowerCase().includes('defeat') || quest.objective.toLowerCase().includes('hunt')) {
          guide = `Go to the Combat page and select an appropriate hunting ground for the enemy type. Defeat them in combat and your progress will update automatically after each victory.`;
          
          // More specific guides based on enemy type if available
          if (quest.enemyType) {
            if (['beast', 'wolf', 'fox'].includes(quest.enemyType)) {
              guide = `Go to the Combat page and select the Spirit Forest hunting ground. This area has the highest concentration of these creatures. Defeat them in combat and your progress will update automatically.`;
            } else if (['bandit', 'rogue-cultivator'].includes(quest.enemyType)) {
              guide = `Go to the Combat page and select the City Outskirts hunting ground. This is where these enemies are most commonly found. Defeat them and your progress will automatically update after each victory.`;
            }
          }
        } 
        else if (quest.objective.toLowerCase().includes('gather')) {
          guide = `Go to the Map page and select the appropriate location. Click the "Gather Resources" button and wait for the gathering process to complete. Each successful gathering session will count toward your quest target.`;
          
          if (quest.location) {
            const locationName = LOCATIONS[quest.location as keyof typeof LOCATIONS]?.name || quest.location;
            guide = `Go to the Map page and select ${locationName}. Click the "Gather Resources" button and wait for the gathering process to complete. Each successful gathering session will count toward your quest target.`;
          }
        }
        else if (quest.objective.toLowerCase().includes('training') || quest.objective.toLowerCase().includes('train')) {
          guide = `Go to the main cultivation page and click the "Cultivate" button multiple times to perform manual cultivation. Each successful session will count toward your goal. For faster results, ensure you have unlocked more efficient cultivation techniques through the upgrades section.`;
        }
        else if (quest.objective.toLowerCase().includes('explore')) {
          let locationText = 'the appropriate location';
          if (quest.location) {
            const locationName = LOCATIONS[quest.location as keyof typeof LOCATIONS]?.name || quest.location;
            locationText = locationName;
          }
          guide = `Go to the Map page and select ${locationText}. Click on the "Explore" button and wait for the exploration to complete. Full exploration will count as completing this quest.`;
        }
        else if (quest.objective.toLowerCase().includes('breakthrough')) {
          guide = `Go to the main cultivation page. Fill your cultivation bar to maximum by using the "Cultivate" button repeatedly. Once your energy is at maximum, click the "Attempt Breakthrough" button. Success chance increases with higher stats and proper equipment. This quest completes when you advance to the next cultivation level.`;
        }
        
        return {
          ...quest,
          guide
        };
      });
      
      // Only update game state if guides were actually added to prevent infinite update loop
      if (needsUpdate) {
        updateGameState(state => ({
          ...state,
          exploration: {
            ...state.exploration,
            activeQuests: updatedQuests as any
          }
        }));
      } else {
        // Just update the local state without triggering a game state update
        setActiveQuests(existingQuests);
      }
    }
  // Remove game.exploration.activeQuests from dependency array to prevent infinite updates
  }, [game.cultivationLevel, updateGameState]);
  
  const completeQuest = (quest: Quest) => {
    if (quest.progress < quest.target) {
      toast({
        title: "Quest Incomplete",
        description: "You have not met the objective requirements yet.",
        variant: "destructive"
      });
      return;
    }
    
    // Update the game state to complete the quest and give rewards
    updateGameState(state => {
      // Generate a new quest to replace the completed one
      const newQuest = generateQuests(state.cultivationLevel)[0];
      
      // Add quest ID to completed quests
      const completedQuests = [...state.exploration.completedQuests, quest.id];
      
      // Apply rewards
      return {
        ...state,
        gold: state.gold + quest.rewards.gold,
        spiritualStones: state.spiritualStones + quest.rewards.spiritualStones,
        cultivationProgress: Math.min(
          state.cultivationProgress + quest.rewards.experience,
          state.maxCultivationProgress
        ),
        // Replace the completed quest with a new one
        exploration: {
          ...state.exploration,
          activeQuests: [
            ...state.exploration.activeQuests.filter((q: any) => q.id !== quest.id),
            newQuest
          ],
          completedQuests
        }
      };
    });
    
    toast({
      title: "Quest Completed",
      description: `You have completed "${quest.name}" and received your rewards.`,
      variant: "default"
    });
    
    // Update the local state to reflect changes
    setActiveQuests(prev => [
      ...prev.filter(q => q.id !== quest.id),
      generateQuests(game.cultivationLevel)[0]
    ]);
  };
  
  const getQuestTypeColor = (type: string) => {
    switch (type) {
      case 'sect': return 'bg-blue-100 text-blue-800';
      case 'main': return 'bg-purple-100 text-purple-800';
      case 'side': return 'bg-green-100 text-green-800';
      case 'daily': return 'bg-amber-100 text-amber-800';
      case 'weekly': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (!game.characterCreated) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Character Required</CardTitle>
            <CardDescription>
              You need to create a character before accessing sect quests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please go to the Character page to create your character first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-serif mb-6 text-center text-primary">
        <i className="fas fa-tasks mr-2"></i> Sect Quests
      </h1>
      
      <div className="mb-6 p-4 rounded-lg bg-primary/5 flex justify-between items-center">
        <div>
          <span className="font-semibold text-primary">Active Quests:</span> 
          <span className="ml-2">{activeQuests.length}</span>
        </div>
        <div>
          <span className="font-semibold text-primary">Completed Quests:</span> 
          <span className="ml-2">{game.exploration.completedQuests.length}</span>
        </div>
      </div>
      
      {activeQuests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeQuests.map(quest => (
            <Card key={quest.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-serif">{quest.name}</CardTitle>
                  <Badge className={getQuestTypeColor(quest.type)}>
                    {quest.type.charAt(0).toUpperCase() + quest.type.slice(1)}
                  </Badge>
                </div>
                <CardDescription>{quest.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Objective: {quest.objective}</span>
                      <span>
                        {quest.progress}/{quest.target}
                      </span>
                    </div>
                    <Progress value={(quest.progress / quest.target) * 100} />
                  </div>
                  
                  {quest.guide && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm">
                      <h4 className="font-medium mb-1">How to complete:</h4>
                      <p>{quest.guide}</p>
                    </div>
                  )}
                  
                  <div className="bg-primary/5 p-3 rounded-md text-sm">
                    <h4 className="font-medium mb-2">Rewards:</h4>
                    <div className="space-y-1">
                      {quest.rewards.gold > 0 && <div className="flex items-center">
                        <i className="fas fa-coins text-amber-500 mr-2"></i>
                        <span>{quest.rewards.gold} Gold</span>
                      </div>}
                      
                      {quest.rewards.spiritualStones > 0 && <div className="flex items-center">
                        <i className="fas fa-gem text-blue-500 mr-2"></i>
                        <span>{quest.rewards.spiritualStones} Qi Stones</span>
                      </div>}
                      
                      {quest.rewards.experience > 0 && <div className="flex items-center">
                        <i className="fas fa-fire text-red-500 mr-2"></i>
                        <span>{quest.rewards.experience} Rank Experience</span>
                      </div>}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-0">
                <Button 
                  onClick={() => completeQuest(quest)}
                  disabled={quest.progress < quest.target}
                >
                  Complete Quest
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No active quests available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}