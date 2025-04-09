import { useState, useEffect } from "react";
import { useGameEngine } from "@/lib/gameEngine";
import { LOCATIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type ActivityStatus = "idle" | "exploring" | "gathering" | "training" | "complete";

const MapPage = () => {
  const { game, updateGameState } = useGameEngine();
  const [location, setLocation] = useLocation();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [activityStatus, setActivityStatus] = useState<ActivityStatus>("idle");
  const [activityProgress, setActivityProgress] = useState(0);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  
  // Check if character is created
  useEffect(() => {
    if (!game.characterCreated) {
      setLocation("/character");
    } else {
      // Set initial selected location from game state
      setSelectedLocation(game.exploration.currentArea);
    }
  }, [game.characterCreated, game.exploration.currentArea, setLocation]);

  // Activity progress simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activityStatus !== "idle" && activityStatus !== "complete") {
      interval = setInterval(() => {
        setActivityProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            setActivityStatus("complete");
            completeActivity();
            return 100;
          }
          return newProgress;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activityStatus]);

  // Start activity at location
  const startActivity = (activity: string) => {
    if (!selectedLocation) return;
    
    setSelectedActivity(activity);
    setActivityProgress(0);
    setActivityLog([`You begin ${activity} at ${LOCATIONS[selectedLocation as keyof typeof LOCATIONS].name}...`]);
    
    // Set activity type based on activity name
    if (activity.includes("explore")) {
      setActivityStatus("exploring");
    } else if (activity.includes("gather") || activity.includes("mine")) {
      setActivityStatus("gathering");
    } else {
      setActivityStatus("training");
    }
  };

  // Complete current activity and receive rewards
  const completeActivity = () => {
    if (!selectedLocation || !selectedActivity) return;
    
    // Update activity log
    setActivityLog((prev) => [
      ...prev,
      `You completed ${selectedActivity} at ${LOCATIONS[selectedLocation as keyof typeof LOCATIONS].name}.`
    ]);
    
    // Generate rewards based on activity type
    const rewards: any = {
      // Spiritual stones and chance for cultivation insights
      "explore": {
        spiritualStones: Math.floor(Math.random() * 10) + 5,
        cultivationProgress: Math.floor(Math.random() * 20) + 10,
        attributeProgress: {
          perception: Math.floor(Math.random() * 3) + 1
        }
      },
      // Herbs for alchemy
      "gather-herbs": {
        herbs: {
          id: `herb-${Math.floor(Math.random() * 5) + 1}`,
          name: ["Spirit Grass", "Cloud Mushroom", "Dragon Blood Flower", "Star Essence Fruit", "Jade Dew Leaf"][Math.floor(Math.random() * 5)],
          quantity: Math.floor(Math.random() * 3) + 1,
          quality: Math.floor(Math.random() * 3) + 1,
          effects: { "qi-recovery": 10 * (Math.floor(Math.random() * 3) + 1) }
        }
      },
      // Spiritual stones
      "mine-spiritual-stones": {
        spiritualStones: Math.floor(Math.random() * 30) + 20
      },
      // Training attributes
      "train": {
        attributeProgress: {
          strength: Math.floor(Math.random() * 3) + 1,
          agility: Math.floor(Math.random() * 3) + 1
        }
      },
      // Meditation for qi and cultivation progress
      "meditate": {
        energy: Math.floor(Math.random() * 50) + 25,
        cultivationProgress: Math.floor(Math.random() * 30) + 15
      },
      // Study for intelligence
      "study": {
        attributeProgress: {
          intelligence: Math.floor(Math.random() * 3) + 1
        }
      }
    };
    
    // Default is explore rewards
    let activityRewards = rewards.explore;
    
    // Match the activity with the reward type
    Object.keys(rewards).forEach(key => {
      if (selectedActivity.includes(key)) {
        activityRewards = rewards[key];
      }
    });
    
    // Update game state with rewards
    updateGameState(state => {
      const newState = { ...state };
      
      // Ensure required objects exist
      if (!newState.exploration) {
        newState.exploration = {
          currentArea: selectedLocation || "sect",
          discoveredAreas: { "sect": true },
          completedChallenges: {},
          dailyTasksCompleted: {}
        };
      }
      
      if (!newState.exploration.discoveredAreas) {
        newState.exploration.discoveredAreas = { "sect": true };
      }
      
      if (!newState.exploration.dailyTasksCompleted) {
        newState.exploration.dailyTasksCompleted = {};
      }
      
      if (!newState.inventory) {
        newState.inventory = {
          spiritualStones: 0,
          herbs: {},
          equipment: {}
        };
      }
      
      if (!newState.inventory.herbs) {
        newState.inventory.herbs = {};
      }
      
      if (!newState.attributes) {
        newState.attributes = {
          strength: 10,
          agility: 10,
          endurance: 10,
          intelligence: 10,
          perception: 10
        };
      }
      
      // Update discovered areas
      if (selectedActivity && selectedActivity.includes("explore")) {
        newState.exploration.discoveredAreas[selectedLocation] = true;
      }
      
      // Add spiritual stones
      if (activityRewards.spiritualStones) {
        newState.inventory.spiritualStones += activityRewards.spiritualStones;
        setActivityLog(prev => [...prev, `Found ${activityRewards.spiritualStones} spiritual stones.`]);
      }
      
      // Add herbs
      if (activityRewards.herbs) {
        const herb = activityRewards.herbs;
        if (!newState.inventory.herbs[herb.id]) {
          newState.inventory.herbs[herb.id] = herb;
        } else {
          newState.inventory.herbs[herb.id].quantity += herb.quantity;
        }
        setActivityLog(prev => [...prev, `Gathered ${herb.quantity} ${herb.name} (Quality: ${herb.quality}).`]);
      }
      
      // Add energy (qi)
      if (activityRewards.energy) {
        const newEnergy = Math.min(newState.energy + activityRewards.energy, newState.maxCultivationProgress);
        newState.energy = newEnergy;
        setActivityLog(prev => [...prev, `Recovered ${activityRewards.energy} Qi energy.`]);
      }
      
      // Add cultivation progress
      if (activityRewards.cultivationProgress) {
        const newProgress = Math.min(newState.cultivationProgress + activityRewards.cultivationProgress, newState.maxCultivationProgress);
        newState.cultivationProgress = newProgress;
        setActivityLog(prev => [...prev, `Gained ${activityRewards.cultivationProgress} cultivation progress.`]);
      }
      
      // Add attribute progress
      if (activityRewards.attributeProgress) {
        Object.entries(activityRewards.attributeProgress).forEach(([attr, value]) => {
          if (newState.attributes[attr as keyof typeof newState.attributes] !== undefined) {
            newState.attributes[attr as keyof typeof newState.attributes] += value as number;
            setActivityLog(prev => [...prev, `Improved ${attr} attribute by ${value}.`]);
          }
        });
      }
      
      // Mark activity as completed
      if (selectedActivity) {
        newState.exploration.dailyTasksCompleted[`${selectedLocation}-${selectedActivity}`] = true;
      }
      
      // Update current area
      newState.exploration.currentArea = selectedLocation;
      
      return newState;
    });
  };

  // Reset activities
  const finishActivity = () => {
    setActivityStatus("idle");
    setSelectedActivity(null);
    setActivityProgress(0);
  };

  // Travel to location
  const travelToLocation = (locationId: string) => {
    setSelectedLocation(locationId);
    setActivityStatus("idle");
    setActivityLog([`You arrive at ${LOCATIONS[locationId as keyof typeof LOCATIONS].name}.`]);
    
    // Update game state
    updateGameState(state => ({
      ...state,
      exploration: {
        ...state.exploration,
        currentArea: locationId
      }
    }));
    
    toast({
      title: "Location Changed",
      description: `You have traveled to ${LOCATIONS[locationId as keyof typeof LOCATIONS].name}.`
    });
  };

  return (
    <div className="min-h-screen bg-scroll py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-serif text-primary mb-2">
            <i className="fas fa-map-marked-alt mr-2"></i>
            World Map
          </h1>
          <p className="text-gray-700">Explore locations and discover treasures in the cultivation world</p>
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
            {/* Map Locations */}
            <div className="mb-8">
              <h2 className="text-xl font-medium mb-4">Locations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(LOCATIONS).map(([locationId, locationData]) => (
                  <Card 
                    key={locationId}
                    className={`bg-white shadow-md cursor-pointer transition-all ${
                      selectedLocation === locationId ? "ring-2 ring-primary" : ""
                    } ${
                      game.cultivationLevel < locationData.requiredLevel ? "opacity-60" : ""
                    }`}
                    onClick={() => {
                      if (game.cultivationLevel >= locationData.requiredLevel) {
                        travelToLocation(locationId);
                      } else {
                        toast({
                          title: "Area Locked",
                          description: `You need to reach cultivation level ${locationData.requiredLevel} to travel here.`,
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <i className={`fas fa-${locationId === 'sect' ? 'home' : 
                                        locationId === 'forest' ? 'tree' : 
                                        locationId === 'mountain' ? 'mountain' : 
                                        locationId === 'city' ? 'city' : 
                                        locationId === 'ruins' ? 'dungeon' : 
                                        'map-marker-alt'} mr-2`}></i>
                        {locationData.name}
                        
                        {game.cultivationLevel < locationData.requiredLevel && (
                          <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded">
                            Lvl {locationData.requiredLevel}
                          </span>
                        )}
                        
                        {game.exploration.discoveredAreas[locationId] && (
                          <span className="ml-auto text-xs text-green-600">
                            <i className="fas fa-check-circle"></i>
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{locationData.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Selected Location Activities */}
            {selectedLocation && activityStatus === "idle" && (
              <Card className="bg-white shadow-md mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {LOCATIONS[selectedLocation as keyof typeof LOCATIONS].name} - Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {LOCATIONS[selectedLocation as keyof typeof LOCATIONS].activities.map((activity) => {
                      const isCompleted = game.exploration.dailyTasksCompleted?.[`${selectedLocation}-${activity}`];
                      return (
                        <Button
                          key={activity}
                          onClick={() => startActivity(activity)}
                          variant={isCompleted ? "outline" : "default"}
                          className="justify-start"
                          disabled={isCompleted}
                        >
                          <i className={`fas fa-${
                            activity.includes('explore') ? 'search' :
                            activity.includes('gather') ? 'leaf' :
                            activity.includes('mine') ? 'gem' :
                            activity.includes('train') ? 'dumbbell' :
                            activity.includes('meditate') ? 'om' :
                            activity.includes('study') ? 'book' :
                            activity.includes('hunt') ? 'crosshairs' :
                            activity.includes('trade') ? 'exchange-alt' :
                            'tasks'
                          } mr-2`}></i>
                          {activity.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          {isCompleted && <span className="ml-auto text-xs text-green-600">Completed</span>}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation("/game")}
                    className="ml-auto"
                  >
                    Return to Cultivation
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {/* Activity in Progress */}
            {activityStatus !== "idle" && (
              <Card className="bg-white shadow-md mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedActivity?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Activity progress bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-primary h-4 rounded-full transition-all duration-200"
                        style={{ width: `${activityProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-center text-sm mt-2">
                      {activityStatus === "complete" ? "Complete!" : `${activityProgress}%`}
                    </div>
                  </div>
                  
                  {/* Activity log */}
                  <div className="bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto mb-4">
                    {activityLog.map((log, index) => (
                      <p key={index} className="text-sm mb-1">{log}</p>
                    ))}
                  </div>
                  
                  {activityStatus === "complete" && (
                    <Button onClick={finishActivity} className="w-full">
                      Continue Exploring
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MapPage;