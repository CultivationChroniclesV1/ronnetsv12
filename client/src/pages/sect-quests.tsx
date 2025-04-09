import React, { useState, useEffect } from 'react';
import { useGameEngine } from '@/lib/gameEngine';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  requiredLevel?: number;
  location?: string;
  enemyType?: string;
}

// Function to generate quests
const generateQuests = (cultivationLevel: number): Quest[] => {
  const questTypes = ['sect', 'main', 'side', 'daily', 'weekly'];
  const objectiveTypes = ['kill', 'gather', 'train', 'explore', 'breakthrough'];
  
  // Available enemies and locations based on game content
  const availableEnemies = Object.keys(ENEMIES);
  const availableLocations = Object.keys(LOCATIONS);
  
  const quests: Quest[] = [];
  
  for (let i = 0; i < 15; i++) {
    const questType = questTypes[Math.floor(Math.random() * questTypes.length)];
    const objectiveType = objectiveTypes[Math.floor(Math.random() * objectiveTypes.length)];
    const requiredLevel = Math.max(1, cultivationLevel - 3 + Math.floor(Math.random() * 6));
    let target = 0;
    let questName = '';
    let questDesc = '';
    let objectiveDesc = '';
    let rewardGold = 0;
    let rewardStones = 0;
    let rewardExp = 0;
    let location = '';
    let enemyType = '';
    
    switch (objectiveType) {
      case 'kill':
        enemyType = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        target = 5 + Math.floor(Math.random() * 10);
        questName = `Hunt ${ENEMIES[enemyType as keyof typeof ENEMIES].name}s`;
        questDesc = `The sect requires you to eliminate ${target} ${ENEMIES[enemyType as keyof typeof ENEMIES].name}s that have been causing trouble.`;
        objectiveDesc = `Defeat ${target} ${ENEMIES[enemyType as keyof typeof ENEMIES].name}s`;
        rewardGold = 50 * requiredLevel;
        rewardStones = Math.floor(requiredLevel / 5) + 1;
        rewardExp = 20 * requiredLevel;
        break;
        
      case 'gather':
        location = availableLocations[Math.floor(Math.random() * availableLocations.length)];
        target = 3 + Math.floor(Math.random() * 5);
        questName = `Gather Resources from ${LOCATIONS[location as keyof typeof LOCATIONS].name}`;
        questDesc = `The sect needs specific resources that can be found in ${LOCATIONS[location as keyof typeof LOCATIONS].name}.`;
        objectiveDesc = `Gather ${target} resources from ${LOCATIONS[location as keyof typeof LOCATIONS].name}`;
        rewardGold = 40 * requiredLevel;
        rewardStones = Math.floor(requiredLevel / 6) + 1;
        rewardExp = 15 * requiredLevel;
        break;
        
      case 'train':
        target = 5 + Math.floor(Math.random() * 5);
        questName = 'Sect Training Mission';
        questDesc = `Complete ${target} training sessions to improve your cultivation technique.`;
        objectiveDesc = `Complete ${target} training sessions`;
        rewardGold = 30 * requiredLevel;
        rewardStones = Math.floor(requiredLevel / 7) + 1;
        rewardExp = 25 * requiredLevel;
        break;
        
      case 'explore':
        location = availableLocations[Math.floor(Math.random() * availableLocations.length)];
        target = 1;
        questName = `Explore ${LOCATIONS[location as keyof typeof LOCATIONS].name}`;
        questDesc = `The sect elders want you to explore ${LOCATIONS[location as keyof typeof LOCATIONS].name} and report back your findings.`;
        objectiveDesc = `Fully explore ${LOCATIONS[location as keyof typeof LOCATIONS].name}`;
        rewardGold = 60 * requiredLevel;
        rewardStones = Math.floor(requiredLevel / 4) + 1;
        rewardExp = 30 * requiredLevel;
        break;
        
      case 'breakthrough':
        target = 1;
        questName = 'Cultivation Breakthrough';
        questDesc = 'The sect elders believe you are ready for a breakthrough in your cultivation. Show them your progress.';
        objectiveDesc = 'Achieve a cultivation breakthrough';
        rewardGold = 100 * requiredLevel;
        rewardStones = Math.floor(requiredLevel / 3) + 2;
        rewardExp = 50 * requiredLevel;
        break;
    }
    
    quests.push({
      id: `quest-${i}`,
      name: questName,
      description: questDesc,
      objective: objectiveDesc,
      type: questType as any,
      progress: Math.floor(Math.random() * (target + 1)),
      target: target,
      rewards: {
        gold: rewardGold,
        spiritualStones: rewardStones,
        experience: rewardExp,
        items: []
      },
      completed: false,
      requiredLevel: requiredLevel,
      location: location || undefined,
      enemyType: enemyType || undefined
    });
  }
  
  return quests;
};

export default function SectQuests() {
  const { game, updateGameState } = useGameEngine();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  
  useEffect(() => {
    // Load quests from game state or generate new ones if none exist
    if (game.exploration.activeQuests.length === 0) {
      const newQuests = generateQuests(game.cultivationLevel);
      setQuests(newQuests);
      
      // Save the generated quests to the game state
      updateGameState(state => ({
        ...state,
        exploration: {
          ...state.exploration,
          activeQuests: newQuests as any
        }
      }));
    } else {
      setQuests(game.exploration.activeQuests as any);
    }
  }, [game.exploration.activeQuests, game.cultivationLevel, updateGameState]);
  
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
      // Mark the quest as completed
      const updatedQuests = state.exploration.activeQuests.map((q: any) => 
        q.id === quest.id ? { ...q, completed: true } : q
      );
      
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
        exploration: {
          ...state.exploration,
          activeQuests: [
            ...updatedQuests.filter((q: any) => q.id !== quest.id),
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
    setQuests(prev => [
      ...prev.filter(q => q.id !== quest.id).map(q => q),
      generateQuests(game.cultivationLevel)[0]
    ]);
  };
  
  const progressQuest = (quest: Quest) => {
    if (quest.progress >= quest.target) {
      toast({
        title: "Quest Objective Met",
        description: "You have already met the objective. Claim your reward!",
        variant: "default"
      });
      return;
    }
    
    // Update the quest progress
    updateGameState(state => {
      const updatedQuests = state.exploration.activeQuests.map((q: any) => 
        q.id === quest.id ? { ...q, progress: q.progress + 1 } : q
      );
      
      return {
        ...state,
        exploration: {
          ...state.exploration,
          activeQuests: updatedQuests
        }
      };
    });
    
    // Update local state
    setQuests(prev => 
      prev.map(q => q.id === quest.id ? { ...q, progress: q.progress + 1 } : q)
    );
    
    toast({
      title: "Quest Progress",
      description: `You have made progress on "${quest.name}".`,
      variant: "default"
    });
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
  
  const activeQuests = quests.filter(q => !q.completed);
  const completedQuests = quests.filter(q => q.completed);
  
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
        <div>
          <span className="font-semibold text-primary">Cultivation Level:</span> 
          <span className="ml-2">{game.cultivationLevel}</span>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="active">
            <i className="fas fa-hourglass-half mr-2"></i> Active Quests
          </TabsTrigger>
          <TabsTrigger value="completed">
            <i className="fas fa-check-circle mr-2"></i> Completed Quests
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
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
                      
                      <div className="bg-primary/5 p-3 rounded-md text-sm">
                        <h4 className="font-medium mb-2">Rewards:</h4>
                        <div className="space-y-1">
                          {quest.rewards.gold > 0 && <div className="flex items-center">
                            <i className="fas fa-coins text-amber-500 mr-2"></i>
                            <span>{quest.rewards.gold} Gold</span>
                          </div>}
                          
                          {quest.rewards.spiritualStones > 0 && <div className="flex items-center">
                            <i className="fas fa-gem text-blue-500 mr-2"></i>
                            <span>{quest.rewards.spiritualStones} Spiritual Stones</span>
                          </div>}
                          
                          {quest.rewards.experience > 0 && <div className="flex items-center">
                            <i className="fas fa-fire text-red-500 mr-2"></i>
                            <span>{quest.rewards.experience} Cultivation Experience</span>
                          </div>}
                        </div>
                      </div>
                      
                      {quest.requiredLevel && (
                        <div className="text-sm">
                          <span className="font-medium">Required Level:</span>
                          <span className={`ml-2 ${game.cultivationLevel < quest.requiredLevel ? 'text-red-500' : ''}`}>
                            {quest.requiredLevel}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button 
                      variant="outline"
                      onClick={() => progressQuest(quest)}
                      disabled={quest.progress >= quest.target}
                    >
                      Progress
                    </Button>
                    <Button 
                      onClick={() => completeQuest(quest)}
                      disabled={quest.progress < quest.target}
                    >
                      Complete
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
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {game.exploration.completedQuests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedQuests.map(quest => (
                <Card key={quest.id} className="overflow-hidden opacity-70">
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
                          <span className="text-green-600 font-medium">
                            Completed
                          </span>
                        </div>
                        <Progress value={100} className="bg-green-100" />
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-md text-sm">
                        <h4 className="font-medium mb-2">Rewards Claimed:</h4>
                        <div className="space-y-1">
                          {quest.rewards.gold > 0 && <div className="flex items-center">
                            <i className="fas fa-coins text-amber-500 mr-2"></i>
                            <span>{quest.rewards.gold} Gold</span>
                          </div>}
                          
                          {quest.rewards.spiritualStones > 0 && <div className="flex items-center">
                            <i className="fas fa-gem text-blue-500 mr-2"></i>
                            <span>{quest.rewards.spiritualStones} Spiritual Stones</span>
                          </div>}
                          
                          {quest.rewards.experience > 0 && <div className="flex items-center">
                            <i className="fas fa-fire text-red-500 mr-2"></i>
                            <span>{quest.rewards.experience} Cultivation Experience</span>
                          </div>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">You haven't completed any quests yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}