import { useState, useEffect } from "react";
import { useGameEngine } from "@/lib/gameEngine";
import { ENEMIES, MARTIAL_ARTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type Enemy = {
  id: string;
  name: string;
  description: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
};

type CombatStatus = "idle" | "fighting" | "victory" | "defeat";

const CombatPage = () => {
  const { game, updateGameState } = useGameEngine();
  const [location, setLocation] = useLocation();
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [combatStatus, setCombatStatus] = useState<CombatStatus>("idle");
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("forest");
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  // Check if character is created
  useEffect(() => {
    if (!game.characterCreated) {
      setLocation("/character");
    }
  }, [game.characterCreated, setLocation]);

  // Handle cooldown timers
  useEffect(() => {
    if (combatStatus === "fighting" && Object.keys(cooldowns).length > 0) {
      const timer = setInterval(() => {
        setCooldowns(prev => {
          const updated = { ...prev };
          let changed = false;
          
          Object.keys(updated).forEach(key => {
            if (updated[key] > 0) {
              updated[key] -= 1;
              changed = true;
            }
          });
          
          return changed ? updated : prev;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [cooldowns, combatStatus]);

  // Start combat with an enemy
  const startCombat = (enemyId: string) => {
    const enemyData = ENEMIES[enemyId as keyof typeof ENEMIES];
    const newEnemy: Enemy = {
      id: enemyId,
      name: enemyData.name,
      description: enemyData.description,
      health: enemyData.health,
      maxHealth: enemyData.health,
      attack: enemyData.attack,
      defense: enemyData.defense
    };
    
    setEnemy(newEnemy);
    setCombatStatus("fighting");
    setCombatLog([`You encounter a ${enemyData.name}!`]);
    
    // Initialize cooldowns
    const initialCooldowns: Record<string, number> = {};
    Object.keys(game.martialArts).forEach(id => initialCooldowns[id] = 0);
    setCooldowns(initialCooldowns);
  };

  // Use a martial arts technique
  const useTechnique = (techniqueId: string) => {
    if (!enemy || combatStatus !== "fighting") return;
    if (cooldowns[techniqueId] > 0) {
      setCombatLog(prev => [...prev, `${game.martialArts[techniqueId].name} is still on cooldown!`]);
      return;
    }
    
    const technique = game.martialArts[techniqueId];
    
    // Check if enough qi
    if (game.energy < technique.cost) {
      setCombatLog(prev => [...prev, "Not enough Qi to use this technique!"]);
      return;
    }
    
    // Apply cooldown
    setCooldowns(prev => ({
      ...prev,
      [techniqueId]: technique.cooldown
    }));
    
    // Calculate damage based on attribute scaling
    const attributeValue = game.attributes[technique.attributeScaling];
    let damage = technique.damage;
    
    // Attribute scaling (10% damage per point above 10)
    if (attributeValue > 10) {
      damage += damage * ((attributeValue - 10) * 0.1);
    }
    
    // Apply technique level bonus (10% per level)
    damage += damage * ((technique.level - 1) * 0.1);
    
    // Apply enemy defense
    damage = Math.max(1, damage - enemy.defense);
    
    // Round to integer
    damage = Math.floor(damage);
    
    // Update enemy health
    const newEnemyHealth = Math.max(0, enemy.health - damage);
    
    // Update combat log
    setCombatLog(prev => [
      ...prev, 
      `You use ${technique.name} and deal ${damage} damage to ${enemy.name}!`
    ]);
    
    // Update game state (reduce qi)
    updateGameState(state => ({
      ...state,
      energy: Math.max(0, state.energy - technique.cost)
    }));
    
    // Update enemy
    setEnemy(prev => prev ? {
      ...prev,
      health: newEnemyHealth
    } : null);
    
    // Check if enemy defeated
    if (newEnemyHealth <= 0) {
      handleVictory();
      return;
    }
    
    // Enemy attacks back after a short delay
    setTimeout(() => {
      if (combatStatus === "fighting") {
        enemyAttack();
      }
    }, 500);
  };

  // Enemy attack logic
  const enemyAttack = () => {
    if (!enemy || combatStatus !== "fighting") return;
    
    // Calculate damage
    let damage = Math.max(1, enemy.attack - game.defense);
    
    // Apply dodge chance
    if (Math.random() * 100 < game.dodgeChance) {
      setCombatLog(prev => [...prev, `You dodged ${enemy.name}'s attack!`]);
      return;
    }
    
    // Update player health
    const newHealth = Math.max(0, game.health - damage);
    
    // Update combat log
    setCombatLog(prev => [
      ...prev, 
      `${enemy.name} attacks you for ${damage} damage!`
    ]);
    
    // Update game state
    updateGameState(state => ({
      ...state,
      health: newHealth
    }));
    
    // Check if player defeated
    if (newHealth <= 0) {
      handleDefeat();
    }
  };

  // Handle player victory
  const handleVictory = () => {
    if (!enemy) return;
    
    setCombatStatus("victory");
    
    // Get enemy rewards
    const enemyData = ENEMIES[enemy.id as keyof typeof ENEMIES];
    const rewards = enemyData.rewards;
    
    // Add rewards to log
    setCombatLog(prev => [
      ...prev,
      `You defeated the ${enemy.name}!`,
      `Gained ${rewards.experience} cultivation experience and ${rewards.spiritualStones} spiritual stones.`
    ]);
    
    // Update game state with rewards
    updateGameState(state => {
      // Calculate new cultivation progress
      const newProgress = state.cultivationProgress + rewards.experience;
      const overflowProgress = Math.max(0, newProgress - state.maxCultivationProgress);
      
      return {
        ...state,
        // Add stones to inventory
        inventory: {
          ...state.inventory,
          spiritualStones: state.inventory.spiritualStones + rewards.spiritualStones
        },
        // Add cultivation progress
        cultivationProgress: Math.min(state.maxCultivationProgress, newProgress),
        // If health is less than 50%, heal a bit
        health: state.health < state.maxHealth * 0.5 
          ? Math.min(state.maxHealth, state.health + Math.floor(state.maxHealth * 0.2))
          : state.health
      };
    });
  };

  // Handle player defeat
  const handleDefeat = () => {
    setCombatStatus("defeat");
    
    setCombatLog(prev => [
      ...prev,
      "You have been defeated!",
      "You retreat to recover your strength..."
    ]);
    
    // Update game state - recover some health
    updateGameState(state => ({
      ...state,
      health: Math.floor(state.maxHealth * 0.3) // Recover to 30% health
    }));
  };

  // Reset combat to select new enemy
  const resetCombat = () => {
    setCombatStatus("idle");
    setEnemy(null);
    setCombatLog([]);
  };

  // Return to cultivation
  const returnToSect = () => {
    setLocation("/game");
  };

  // Current available techniques
  const availableTechniques = Object.entries(game.martialArts)
    .filter(([id, technique]) => technique.unlocked);

  // Filter enemies by area
  const getAreaEnemies = () => {
    // This is a simple implementation - in a real game,
    // different areas would have different enemy lists
    const enemies = {
      "forest": ["beast"],
      "city": ["bandit"],
      "ruins": ["guardian", "demon"]
    };
    
    return (enemies as any)[selectedArea] || ["beast"];
  };

  return (
    <div className="min-h-screen bg-scroll py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-serif text-primary mb-2">
            <i className="fas fa-fist-raised mr-2"></i>
            Combat Training
          </h1>
          <p className="text-gray-700">Test your martial prowess against various opponents</p>
        </div>

        {!game.characterCreated ? (
          <Card className="bg-white bg-opacity-90 shadow-lg text-center p-6">
            <p>Please create your character first.</p>
            <Button className="mt-4" onClick={() => setLocation("/character")}>
              Create Character
            </Button>
          </Card>
        ) : combatStatus === "idle" ? (
          <>
            {/* Area Selection */}
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-4">Select Hunting Ground</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${selectedArea === "forest" ? "ring-2 ring-green-500" : ""}`}
                  onClick={() => setSelectedArea("forest")}
                >
                  <CardHeader className="bg-green-600 text-white py-3">
                    <CardTitle className="text-lg flex items-center">
                      <i className="fas fa-tree mr-2"></i> Spirit Forest
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm">A mystical forest with spiritual beasts.</p>
                    <p className="text-xs mt-2 text-gray-600">Recommended for new cultivators</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all ${selectedArea === "city" ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => setSelectedArea("city")}
                >
                  <CardHeader className="bg-blue-600 text-white py-3">
                    <CardTitle className="text-lg flex items-center">
                      <i className="fas fa-city mr-2"></i> City Outskirts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm">Encounter bandits and rogue cultivators.</p>
                    <p className="text-xs mt-2 text-gray-600">Medium difficulty challenges</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all ${selectedArea === "ruins" ? "ring-2 ring-purple-500" : ""}`}
                  onClick={() => setSelectedArea("ruins")}
                >
                  <CardHeader className="bg-purple-600 text-white py-3">
                    <CardTitle className="text-lg flex items-center">
                      <i className="fas fa-dungeon mr-2"></i> Ancient Ruins
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm">Face guardians and demons of the ruins.</p>
                    <p className="text-xs mt-2 text-gray-600">For advanced cultivators only</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Enemy Selection */}
            <h2 className="text-xl font-medium mb-4">Choose Your Opponent</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {getAreaEnemies().map((enemyId) => {
                const enemyData = ENEMIES[enemyId as keyof typeof ENEMIES];
                return (
                  <Card key={enemyId} className="bg-white shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg">{enemyData.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{enemyData.description}</p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="font-medium">Health</p>
                          <p>{enemyData.health}</p>
                        </div>
                        <div>
                          <p className="font-medium">Attack</p>
                          <p>{enemyData.attack}</p>
                        </div>
                        <div>
                          <p className="font-medium">Defense</p>
                          <p>{enemyData.defense}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => startCombat(enemyId)}
                        className="w-full"
                      >
                        Challenge
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            
            <div className="text-center mt-8">
              <Button 
                variant="outline" 
                onClick={returnToSect}
              >
                Return to Sect
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Combat UI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Player Stats */}
              <Card className="bg-white shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{game.characterName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Health</span>
                      <span>{game.health} / {game.maxHealth}</span>
                    </div>
                    <Progress 
                      value={(game.health / game.maxHealth) * 100} 
                      className="h-2" 
                      indicatorColor="bg-red-500"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Qi</span>
                      <span>{Math.floor(game.energy)} / {game.maxCultivationProgress}</span>
                    </div>
                    <Progress 
                      value={(game.energy / game.maxCultivationProgress) * 100} 
                      className="h-2"
                      indicatorColor="bg-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm mt-4">
                    <div>
                      <p className="font-medium">Attack</p>
                      <p>{game.attack}</p>
                    </div>
                    <div>
                      <p className="font-medium">Defense</p>
                      <p>{game.defense}</p>
                    </div>
                    <div>
                      <p className="font-medium">Crit Chance</p>
                      <p>{game.critChance}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Enemy Stats */}
              {enemy && (
                <Card className="bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{enemy.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Health</span>
                        <span>{enemy.health} / {enemy.maxHealth}</span>
                      </div>
                      <Progress 
                        value={(enemy.health / enemy.maxHealth) * 100} 
                        className="h-2"
                        indicatorColor="bg-red-500"
                      />
                    </div>
                    
                    <p className="text-sm mb-4">{enemy.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">Attack</p>
                        <p>{enemy.attack}</p>
                      </div>
                      <div>
                        <p className="font-medium">Defense</p>
                        <p>{enemy.defense}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Combat Log */}
            <Card className="bg-white shadow-md mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Combat Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 overflow-y-auto p-2 bg-gray-50 rounded text-sm">
                  {combatLog.map((log, index) => (
                    <p key={index} className="mb-1">{log}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Combat Actions */}
            {combatStatus === "fighting" && (
              <Card className="bg-white shadow-md mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Martial Techniques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableTechniques.map(([id, technique]) => (
                      <Button
                        key={id}
                        onClick={() => useTechnique(id)}
                        disabled={cooldowns[id] > 0 || game.energy < technique.cost}
                        className="justify-start"
                        variant={cooldowns[id] > 0 ? "outline" : "default"}
                      >
                        <span className="truncate mr-2">{technique.name}</span>
                        {cooldowns[id] > 0 && <span className="text-xs">({cooldowns[id]}s)</span>}
                        <span className="ml-auto text-xs">Cost: {technique.cost} Qi</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Combat Result Buttons */}
            {(combatStatus === "victory" || combatStatus === "defeat") && (
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={resetCombat}
                  className="px-6"
                >
                  Find New Opponent
                </Button>
                <Button 
                  variant="outline" 
                  onClick={returnToSect}
                >
                  Return to Sect
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CombatPage;