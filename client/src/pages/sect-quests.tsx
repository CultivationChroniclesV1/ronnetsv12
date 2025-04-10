import { useState, useEffect } from "react";
import { useGameEngine } from "@/lib/gameEngine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

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

export default function SectQuests() {
  const { game, updateGameState } = useGameEngine();
  const [location, setLocation] = useLocation();
  const [quests, setQuests] = useState<Quest[]>([]);
  
  // Check if character is created
  useEffect(() => {
    if (!game.characterCreated) {
      setLocation("/character");
    } else {
      // Generate quests based on player level if none exist
      generateQuests();
    }
  }, [game.characterCreated, setLocation]);
  
  // Generate a set of quests based on player level
  const generateQuests = () => {
    const playerLevel = game.cultivationLevel;
    const newQuests: Quest[] = [];
    
    // Add cultivation quests
    newQuests.push({
      id: `cultivation-${Date.now()}`,
      name: "Cultivation Insight",
      description: "Meditate and gain cultivation insights",
      objective: "Accumulate Qi energy",
      type: "sect",
      progress: 0,
      target: playerLevel * 100,
      rewards: {
        gold: playerLevel * 20,
        spiritualStones: Math.ceil(playerLevel / 2),
        experience: playerLevel * 15,
        items: []
      },
      completed: false,
      requiredLevel: 1
    });
    
    // Add combat quests based on player level
    const enemyTypes = ['beast', 'wolf', 'bear', 'snake', 'tiger', 'eagle', 'bandit'];
    const randomEnemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    newQuests.push({
      id: `combat-${Date.now()}`,
      name: `Hunt ${capitalizeFirst(randomEnemyType)}s`,
      description: `The sect needs you to hunt ${randomEnemyType}s that are threatening nearby villages`,
      objective: `Defeat ${randomEnemyType}s in combat`,
      type: "sect",
      progress: 0,
      target: Math.max(3, Math.floor(playerLevel / 2)),
      rewards: {
        gold: playerLevel * 30,
        spiritualStones: Math.ceil(playerLevel / 3) + 1,
        experience: playerLevel * 20,
        items: []
      },
      completed: false,
      requiredLevel: 1,
      enemyType: randomEnemyType
    });
    
    // Add breakthrough quest for higher levels
    if (playerLevel >= 5) {
      newQuests.push({
        id: `breakthrough-${Date.now()}`,
        name: "Realm Breakthrough",
        description: "Achieve a breakthrough in your cultivation to progress to the next stage",
        objective: "Perform a successful breakthrough",
        type: "sect",
        progress: 0,
        target: 1,
        rewards: {
          gold: playerLevel * 50,
          spiritualStones: playerLevel,
          experience: playerLevel * 30,
          items: []
        },
        completed: false,
        requiredLevel: 5
      });
    }
    
    // Add resource gathering quest
    const locations = ['forest', 'mountain', 'ruins', 'jade-valley', 'poison-marsh'];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    newQuests.push({
      id: `gather-${Date.now()}`,
      name: "Resource Gathering",
      description: `Collect resources from ${formatLocationName(randomLocation)} for the sect's alchemists`,
      objective: `Gather resources from ${formatLocationName(randomLocation)}`,
      type: "sect",
      progress: 0,
      target: Math.max(2, Math.floor(playerLevel / 3)),
      rewards: {
        gold: playerLevel * 25,
        spiritualStones: Math.ceil(playerLevel / 4),
        experience: playerLevel * 18,
        items: []
      },
      completed: false,
      requiredLevel: 2,
      location: randomLocation
    });
    
    // Add additional random quests based on player level
    for (let i = 0; i < Math.min(10, playerLevel); i++) {
      const questTypes = [
        {
          name: "Herb Collection",
          description: "Collect rare herbs for the sect's alchemy division",
          objective: "Gather special herbs",
          rewards: {
            gold: playerLevel * 15 + Math.floor(Math.random() * 20),
            spiritualStones: Math.max(1, Math.floor(playerLevel / 5)),
            experience: playerLevel * 12,
            items: []
          }
        },
        {
          name: "Sect Defense",
          description: "Help defend the sect grounds from intruders",
          objective: "Patrol the sect grounds",
          rewards: {
            gold: playerLevel * 20 + Math.floor(Math.random() * 15),
            spiritualStones: Math.max(1, Math.floor(playerLevel / 4)),
            experience: playerLevel * 18,
            items: []
          }
        },
        {
          name: "Knowledge Seeking",
          description: "Study ancient texts in the sect library",
          objective: "Study cultivation techniques",
          rewards: {
            gold: playerLevel * 10 + Math.floor(Math.random() * 10),
            spiritualStones: Math.max(1, Math.floor(playerLevel / 3)),
            experience: playerLevel * 25,
            items: []
          }
        },
        {
          name: "Artifact Refinement",
          description: "Assist the sect's artifact refinement division",
          objective: "Help refine artifacts",
          rewards: {
            gold: playerLevel * 25 + Math.floor(Math.random() * 30),
            spiritualStones: Math.max(2, Math.floor(playerLevel / 2)),
            experience: playerLevel * 15,
            items: []
          }
        },
        {
          name: "Elder's Request",
          description: "Complete a special request from a sect elder",
          objective: "Fulfill the elder's request",
          rewards: {
            gold: playerLevel * 40 + Math.floor(Math.random() * 25),
            spiritualStones: Math.max(3, Math.floor(playerLevel / 2)),
            experience: playerLevel * 22,
            items: []
          }
        }
      ];
      
      const randomQuest = questTypes[Math.floor(Math.random() * questTypes.length)];
      
      newQuests.push({
        id: `additional-${i}-${Date.now()}`,
        name: randomQuest.name,
        description: randomQuest.description,
        objective: randomQuest.objective,
        type: "sect",
        progress: 0,
        target: Math.max(1, Math.floor(playerLevel / 3)) + Math.floor(Math.random() * 3),
        rewards: randomQuest.rewards,
        completed: false,
        requiredLevel: Math.max(1, Math.floor(i / 2))
      });
    }
    
    // Filter to only show quests appropriate for player level
    const filteredQuests = newQuests.filter(quest => 
      quest.requiredLevel === undefined || quest.requiredLevel <= playerLevel
    );
    
    // Limit to 15 quests maximum
    const finalQuests = filteredQuests.slice(0, 15);
    
    setQuests(finalQuests);
  };
  
  // Progress a quest
  const progressQuest = (quest: Quest) => {
    if (quest.completed) return;
    
    const newProgress = Math.min(quest.progress + 1, quest.target);
    const updatedQuest = { ...quest, progress: newProgress };
    
    if (newProgress >= quest.target) {
      updatedQuest.completed = true;
      toast({
        title: "Quest Completed!",
        description: `You have completed "${quest.name}"`,
        variant: "default"
      });
    } else {
      toast({
        title: "Quest Progress",
        description: `${newProgress}/${quest.target} ${quest.objective}`,
        variant: "default"
      });
    }
    
    setQuests(quests.map(q => q.id === quest.id ? updatedQuest : q));
  };
  
  // Complete a quest and claim rewards
  const completeQuest = (quest: Quest) => {
    if (!quest.completed) return;
    
    // Update game state with rewards
    updateGameState(state => ({
      ...state,
      gold: state.gold + quest.rewards.gold,
      spiritualStones: state.spiritualStones + quest.rewards.spiritualStones,
      cultivationProgress: state.cultivationProgress + quest.rewards.experience
    }));
    
    toast({
      title: "Rewards Claimed",
      description: `You gained ${quest.rewards.gold} gold, ${quest.rewards.spiritualStones} spiritual stones, and ${quest.rewards.experience} cultivation experience.`,
      variant: "default"
    });
    
    // Remove the completed quest
    setQuests(quests.filter(q => q.id !== quest.id));
    
    // If few quests remain, generate more
    if (quests.length <= 5) {
      generateQuests();
    }
  };
  
  // Generate a replacement quest when one is completed
  const generateReplacementQuest = () => {
    const playerLevel = game.cultivationLevel;
    const questTypes = [
      "Cultivation Insight",
      "Monster Hunt",
      "Resource Gathering",
      "Sect Defense",
      "Artifact Refinement",
      "Knowledge Seeking"
    ];
    
    const randomType = questTypes[Math.floor(Math.random() * questTypes.length)];
    const newQuest: Quest = {
      id: `quest-${Date.now()}`,
      name: randomType,
      description: `A new task from the sect: ${randomType.toLowerCase()}`,
      objective: `Complete the ${randomType.toLowerCase()} task`,
      type: "sect",
      progress: 0,
      target: Math.max(1, Math.floor(playerLevel / 2)) + Math.floor(Math.random() * 3),
      rewards: {
        gold: playerLevel * 20 + Math.floor(Math.random() * 30),
        spiritualStones: Math.max(1, Math.floor(playerLevel / 3)),
        experience: playerLevel * 15 + Math.floor(Math.random() * 10),
        items: []
      },
      completed: false,
      requiredLevel: Math.max(1, playerLevel - 2)
    };
    
    setQuests([...quests, newQuest]);
  };

  return (
    <div className="min-h-screen bg-scroll py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-serif text-primary mb-2">
            <i className="fas fa-tasks mr-2"></i>
            Sect Quests
          </h1>
          <p className="text-gray-700">Complete tasks to earn rewards and gain favor with your sect</p>
        </div>

        {!game.characterCreated ? (
          <Card className="bg-white bg-opacity-90 shadow-lg text-center p-6">
            <p>Please create your character first.</p>
            <Button className="mt-4" onClick={() => setLocation("/character")}>
              Create Character
            </Button>
          </Card>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-medium">Available Quests</h2>
                <p className="text-sm text-gray-600">Showing {quests.length} quests</p>
              </div>
              <Button onClick={generateQuests}>
                <i className="fas fa-sync-alt mr-2"></i> Refresh Quests
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {quests.length === 0 ? (
                <Card className="bg-white shadow-md text-center p-6">
                  <p>No quests available. Generate new quests to get started.</p>
                </Card>
              ) : (
                quests.map(quest => (
                  <Card key={quest.id} className={`bg-white shadow-md transition-all ${quest.completed ? "border-green-300 border-2" : ""}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg flex items-center">
                          {quest.name}
                          {quest.completed && (
                            <Badge className="ml-2 bg-green-100 text-green-800">
                              <i className="fas fa-check mr-1"></i> Completed
                            </Badge>
                          )}
                        </CardTitle>
                        <Badge className="bg-primary/10 text-primary">
                          {quest.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{quest.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress: {quest.objective}</span>
                          <span>{quest.progress} / {quest.target}</span>
                        </div>
                        <Progress value={(quest.progress / quest.target) * 100} className="h-2" />
                      </div>
                      
                      <div className="bg-yellow-50 p-3 rounded-md">
                        <h4 className="font-medium mb-1">Rewards</h4>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center">
                            <i className="fas fa-coins text-amber-500 mr-1"></i>
                            <span>{quest.rewards.gold} Gold</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-gem text-blue-500 mr-1"></i>
                            <span>{quest.rewards.spiritualStones} Stones</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-fire text-red-500 mr-1"></i>
                            <span>{quest.rewards.experience} Exp</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      {quest.completed ? (
                        <Button onClick={() => completeQuest(quest)} className="w-full">
                          <i className="fas fa-trophy mr-2"></i> Claim Rewards
                        </Button>
                      ) : (
                        <>
                          <div className="text-sm text-gray-600">
                            {quest.requiredLevel && (
                              <span className="mr-4">Required Level: {quest.requiredLevel}</span>
                            )}
                            {quest.location && (
                              <span className="mr-4">Location: {formatLocationName(quest.location)}</span>
                            )}
                            {quest.enemyType && (
                              <span>Target: {capitalizeFirst(quest.enemyType)}</span>
                            )}
                          </div>
                          <Button onClick={() => progressQuest(quest)}>
                            <i className="fas fa-play mr-2"></i> Progress Quest
                          </Button>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Helper functions
function formatLocationName(location: string): string {
  const names: Record<string, string> = {
    'forest': 'Spirit Forest',
    'mountain': 'Azure Mountains',
    'ruins': 'Ancient Ruins',
    'jade-valley': 'Jade Valley',
    'poison-marsh': 'Poison Marsh',
    'flame-desert': 'Flame Desert',
    'frozen-peak': 'Frozen Peak'
  };
  
  return names[location] || location;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}