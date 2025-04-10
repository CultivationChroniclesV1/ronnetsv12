import { useState, useEffect } from "react";
import { useGameEngine } from "@/lib/gameEngine";
import { SECTS, REALMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

export default function CharacterInfo() {
  const { game, updateGameState } = useGameEngine();
  const [location, setLocation] = useLocation();
  // Implement tabs for different character information sections
  const [activeTab, setActiveTab] = useState("overview");

  // Check if character is created
  useEffect(() => {
    if (!game.characterCreated) {
      setLocation("/character");
    }
  }, [game.characterCreated, setLocation]);

  // Display equipped items by slot
  const getEquippedItems = () => {
    const equippedItems: Record<string, any> = {};
    
    // Check weapons
    Object.values(game.inventory.weapons).forEach(weapon => {
      if (weapon.equipped) {
        equippedItems.weapon = weapon;
      }
    });
    
    // Check apparel items
    Object.values(game.inventory.apparel).forEach(item => {
      if (item.equipped) {
        equippedItems[item.type] = item;
      }
    });
    
    return equippedItems;
  };

  const equippedItems = getEquippedItems();
  const currentRealm = REALMS[game.realm as keyof typeof REALMS];
  
  // Calculate total stats from base attributes and equipment
  const calculateTotalStats = () => {
    const totalStats = {
      strength: game.attributes.strength,
      agility: game.attributes.agility,
      endurance: game.attributes.endurance,
      intelligence: game.attributes.intelligence,
      perception: game.attributes.perception,
      attack: game.attack,
      defense: game.defense,
      critChance: game.critChance,
      dodgeChance: game.dodgeChance,
      maxHealth: game.maxHealth
    };
    
    // Add equipment bonuses
    Object.values(equippedItems).forEach(item => {
      if (item && item.stats) {
        Object.entries(item.stats).forEach(([stat, value]) => {
          if (stat in totalStats) {
            totalStats[stat as keyof typeof totalStats] += value as number;
          }
        });
      }
    });
    
    return totalStats;
  };
  
  const totalStats = calculateTotalStats();

  return (
    <div className="min-h-screen bg-scroll py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-serif text-primary mb-2">Character Information</h1>
          <p className="text-gray-700">Review your cultivation progress and equipment</p>
        </div>

        {!game.characterCreated ? (
          <Card className="bg-white bg-opacity-90 shadow-lg text-center p-6">
            <p>Please create your character first.</p>
            <Button className="mt-4" onClick={() => setLocation("/character")}>
              Create Character
            </Button>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Character Overview</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {/* Character Basic Info Card */}
              <Card className="bg-white shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-serif">{game.characterName}</CardTitle>
                      <CardDescription>
                        {SECTS[game.sect as keyof typeof SECTS]?.name || "Unaffiliated"} Disciple
                      </CardDescription>
                    </div>
                    <Badge className={currentRealm.color + " text-white"}>
                      {currentRealm.name} ({game.realmStage}/{game.realmMaxStage})
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Cultivation Level</span>
                          <span className="font-medium">{game.cultivationLevel}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Cultivation Progress</span>
                          <span className="font-medium">{Math.floor(game.cultivationProgress)} / {game.maxCultivationProgress}</span>
                        </div>
                        <Progress value={(game.cultivationProgress / game.maxCultivationProgress) * 100} className="h-2 mb-4" />
                        
                        <div className="flex justify-between text-sm mb-1">
                          <span>Health</span>
                          <span className="font-medium">{Math.floor(game.health)} / {game.maxHealth}</span>
                        </div>
                        <Progress value={(game.health / game.maxHealth) * 100} className="h-2 [&>div]:bg-red-500 mb-4" />
                        
                        <div className="flex justify-between text-sm mb-1">
                          <span>Qi Energy</span>
                          <span className="font-medium">{Math.floor(game.energy)} / {game.maxCultivationProgress}</span>
                        </div>
                        <Progress value={(game.energy / game.maxCultivationProgress) * 100} className="h-2 [&>div]:bg-cyan-500" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                          <div className="flex items-center mb-1">
                            <i className="fas fa-coins text-amber-500 mr-2"></i>
                            <span className="font-medium">Gold</span>
                          </div>
                          <p className="text-xl">{game.gold}</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                          <div className="flex items-center mb-1">
                            <i className="fas fa-gem text-blue-500 mr-2"></i>
                            <span className="font-medium">Spiritual Stones</span>
                          </div>
                          <p className="text-xl">{game.spiritualStones}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-lg mb-3">Attributes</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm font-medium mb-1">Strength</p>
                          <div className="flex justify-between items-center">
                            <Progress value={(totalStats.strength / 30) * 100} className="h-2 w-3/4 [&>div]:bg-red-500" />
                            <span className="text-sm">{totalStats.strength}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Agility</p>
                          <div className="flex justify-between items-center">
                            <Progress value={(totalStats.agility / 30) * 100} className="h-2 w-3/4 [&>div]:bg-green-500" />
                            <span className="text-sm">{totalStats.agility}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Endurance</p>
                          <div className="flex justify-between items-center">
                            <Progress value={(totalStats.endurance / 30) * 100} className="h-2 w-3/4 [&>div]:bg-yellow-500" />
                            <span className="text-sm">{totalStats.endurance}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Intelligence</p>
                          <div className="flex justify-between items-center">
                            <Progress value={(totalStats.intelligence / 30) * 100} className="h-2 w-3/4 [&>div]:bg-blue-500" />
                            <span className="text-sm">{totalStats.intelligence}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Perception</p>
                          <div className="flex justify-between items-center">
                            <Progress value={(totalStats.perception / 30) * 100} className="h-2 w-3/4 [&>div]:bg-purple-500" />
                            <span className="text-sm">{totalStats.perception}</span>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-lg mt-4 mb-3">Combat Stats</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm font-medium mb-1">Attack</p>
                          <p className="text-base">{totalStats.attack}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Defense</p>
                          <p className="text-base">{totalStats.defense}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Crit Chance</p>
                          <p className="text-base">{totalStats.critChance}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Dodge Chance</p>
                          <p className="text-base">{totalStats.dodgeChance}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="equipment">
              {/* Equipment Section */}
              <Card className="bg-white shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle>Equipped Items</CardTitle>
                  <CardDescription>Your current gear affects your combat capabilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-md p-4">
                      <h3 className="font-medium text-lg mb-3 flex items-center">
                        <i className="fas fa-sword mr-2 text-primary"></i> Weapon
                      </h3>
                      {equippedItems.weapon ? (
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{equippedItems.weapon.name}</p>
                              <p className="text-sm text-gray-600">{equippedItems.weapon.description}</p>
                            </div>
                            <Badge className={getRarityColor(equippedItems.weapon.rarity)}>
                              {capitalizeFirst(equippedItems.weapon.rarity)}
                            </Badge>
                          </div>
                          <div className="mt-2 border-t border-gray-100 pt-2">
                            <div className="grid grid-cols-2 gap-1 text-sm">
                              {Object.entries(equippedItems.weapon.stats).map(([stat, value]) => (
                                <div key={stat}>
                                  <span className="font-medium capitalize">{stat}:</span> +{String(value)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No weapon equipped</p>
                      )}
                    </div>

                    <div className="border border-gray-200 rounded-md p-4">
                      <h3 className="font-medium text-lg mb-3 flex items-center">
                        <i className="fas fa-tshirt mr-2 text-primary"></i> Armor
                      </h3>
                      {equippedItems.armor ? (
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{equippedItems.armor.name}</p>
                              <p className="text-sm text-gray-600">{equippedItems.armor.description}</p>
                            </div>
                            <Badge className={getRarityColor(equippedItems.armor.rarity)}>
                              {capitalizeFirst(equippedItems.armor.rarity)}
                            </Badge>
                          </div>
                          <div className="mt-2 border-t border-gray-100 pt-2">
                            <div className="grid grid-cols-2 gap-1 text-sm">
                              {Object.entries(equippedItems.armor.stats).map(([stat, value]) => (
                                <div key={stat}>
                                  <span className="font-medium capitalize">{stat}:</span> +{String(value)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No armor equipped</p>
                      )}
                    </div>
                    
                    {/* Additional equipment slots could be added here */}
                    {["robe", "belt", "boots", "gloves", "hat", "accessory"].map(slotType => (
                      equippedItems[slotType] && (
                        <div key={slotType} className="border border-gray-200 rounded-md p-4">
                          <h3 className="font-medium text-lg mb-3 flex items-center">
                            <i className={`fas fa-${getItemIcon(slotType)} mr-2 text-primary`}></i> {capitalizeFirst(slotType)}
                          </h3>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{equippedItems[slotType].name}</p>
                              <p className="text-sm text-gray-600">{equippedItems[slotType].description}</p>
                            </div>
                            <Badge className={getRarityColor(equippedItems[slotType].rarity)}>
                              {capitalizeFirst(equippedItems[slotType].rarity)}
                            </Badge>
                          </div>
                          <div className="mt-2 border-t border-gray-100 pt-2">
                            <div className="grid grid-cols-2 gap-1 text-sm">
                              {Object.entries(equippedItems[slotType].stats).map(([stat, value]) => (
                                <div key={stat}>
                                  <span className="font-medium capitalize">{stat}:</span> +{String(value)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getRarityColor(rarity: string) {
  switch (rarity) {
    case 'common': return 'bg-gray-200 text-gray-800';
    case 'uncommon': return 'bg-green-100 text-green-800';
    case 'rare': return 'bg-blue-100 text-blue-800';
    case 'epic': return 'bg-purple-100 text-purple-800';
    case 'legendary': return 'bg-yellow-100 text-yellow-800';
    case 'mythic': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getItemIcon(type: string) {
  switch (type) {
    case 'robe': return 'tshirt';
    case 'belt': return 'band-aid';
    case 'boots': return 'boot';
    case 'gloves': return 'mitten';
    case 'hat': return 'hat-wizard';
    case 'accessory': return 'ring';
    default: return 'question';
  }
}