import { useState, useEffect } from "react";
import { useGameEngine } from "@/lib/gameEngine";
import { SECTS } from "@/lib/constants";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const CharacterInfo = () => {
  const { game } = useGameEngine();
  const [currentTab, setCurrentTab] = useState('stats');
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-200 text-gray-800';
      case 'uncommon': return 'bg-green-100 text-green-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      case 'mythic': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Calculate total attribute bonuses from equipped items
  const calculateEquipmentBonuses = () => {
    const bonuses: Record<string, number> = {
      strength: 0,
      agility: 0,
      endurance: 0,
      intelligence: 0,
      perception: 0,
      attack: 0,
      defense: 0,
      maxHealth: 0,
      critChance: 0,
      dodgeChance: 0
    };
    
    // Process weapons
    Object.values(game.inventory.weapons || {}).forEach(weapon => {
      if (weapon.equipped) {
        Object.entries(weapon.stats).forEach(([stat, value]) => {
          if (bonuses[stat] !== undefined) {
            bonuses[stat] += value;
          }
        });
      }
    });
    
    // Process apparel
    Object.values(game.inventory.apparel || {}).forEach(apparel => {
      if (apparel.equipped) {
        Object.entries(apparel.stats).forEach(([stat, value]) => {
          if (bonuses[stat] !== undefined) {
            bonuses[stat] += value;
          }
        });
      }
    });
    
    return bonuses;
  };
  
  const bonuses = calculateEquipmentBonuses();
  
  // Get equipped items
  const getEquippedItems = () => {
    const equippedWeapons = Object.values(game.inventory.weapons || {}).filter(w => w.equipped);
    const equippedApparel = Object.values(game.inventory.apparel || {}).filter(a => a.equipped);
    return [...equippedWeapons, ...equippedApparel];
  };
  
  const equippedItems = getEquippedItems();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-serif mb-6 text-center text-primary">
        <span className="font-['Ma_Shan_Zheng'] text-amber-500 mr-2">修士</span>
        {game.characterName}'s Profile
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Character Overview Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <i className={`fas fa-user-circle mr-2`}></i> 
              {game.characterName}
            </CardTitle>
            <CardDescription>
              {SECTS[game.sect as keyof typeof SECTS]?.name || "Unknown Sect"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Cultivation Rank: {game.cultivationLevel}</span>
                  <span className="text-sm">{game.cultivationProgress}/{game.maxCultivationProgress}</span>
                </div>
                <Progress value={(game.cultivationProgress / game.maxCultivationProgress) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Health</span>
                  <span className="text-sm">{Math.floor(game.health)}/{game.maxHealth}</span>
                </div>
                <Progress value={(game.health / game.maxHealth) * 100} className="h-2 bg-gray-200" 
                  style={{color: 'rgb(220, 38, 38)'}} />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium text-amber-600">Gold:</span> 
                  <span className="ml-2">{formatNumber(game.gold)}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-600">Qi Stones:</span> 
                  <span className="ml-2">{formatNumber(game.spiritualStones)}</span>
                </div>
                <div>
                  <span className="font-medium text-green-600">Qi Energy:</span> 
                  <span className="ml-2">{formatNumber(Math.floor(game.energy))}</span>
                </div>
                <div>
                  <span className="font-medium text-purple-600">Realm:</span> 
                  <span className="ml-2">{game.realm}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Character Details Tabs */}
        <Card className="lg:col-span-2">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stats">
                  <i className="fas fa-chart-bar mr-2"></i> Attributes & Stats
                </TabsTrigger>
                <TabsTrigger value="equipment">
                  <i className="fas fa-shield-alt mr-2"></i> Equipment
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="stats">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Attributes</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Strength:</span>
                        <span>
                          {game.attributes.strength}
                          {bonuses.strength > 0 && <span className="text-green-600 ml-1">+{bonuses.strength}</span>}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Agility:</span>
                        <span>
                          {game.attributes.agility}
                          {bonuses.agility > 0 && <span className="text-green-600 ml-1">+{bonuses.agility}</span>}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Endurance:</span>
                        <span>
                          {game.attributes.endurance}
                          {bonuses.endurance > 0 && <span className="text-green-600 ml-1">+{bonuses.endurance}</span>}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Intelligence:</span>
                        <span>
                          {game.attributes.intelligence}
                          {bonuses.intelligence > 0 && <span className="text-green-600 ml-1">+{bonuses.intelligence}</span>}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Perception:</span>
                        <span>
                          {game.attributes.perception}
                          {bonuses.perception > 0 && <span className="text-green-600 ml-1">+{bonuses.perception}</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <h3 className="text-lg font-medium">Combat Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Attack:</span>
                        <span>
                          {Math.floor(game.attack)}
                          {bonuses.attack > 0 && <span className="text-green-600 ml-1">+{bonuses.attack}</span>}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Defense:</span>
                        <span>
                          {Math.floor(game.defense)}
                          {bonuses.defense > 0 && <span className="text-green-600 ml-1">+{bonuses.defense}</span>}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Health:</span>
                        <span>
                          {game.maxHealth}
                          {bonuses.maxHealth > 0 && <span className="text-green-600 ml-1">+{bonuses.maxHealth}</span>}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Crit Chance:</span>
                        <span>
                          {game.critChance}%
                          {bonuses.critChance > 0 && <span className="text-green-600 ml-1">+{bonuses.critChance}%</span>}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dodge Chance:</span>
                        <span>
                          {game.dodgeChance}%
                          {bonuses.dodgeChance > 0 && <span className="text-green-600 ml-1">+{bonuses.dodgeChance}%</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="equipment">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Equipped Items</h3>
                  {equippedItems.length > 0 ? (
                    <div className="space-y-3">
                      {equippedItems.map(item => (
                        <div key={item.id} className="flex items-start border-b border-gray-200 pb-3">
                          <div className="h-10 w-10 flex-shrink-0 bg-primary/10 rounded-md flex items-center justify-center">
                            <i className={`fas fa-${item.type === 'sword' ? 'khanda' : 'tshirt'} text-primary`}></i>
                          </div>
                          <div className="ml-3 flex-grow">
                            <div className="flex justify-between">
                              <div>
                                <span className="font-medium">{item.name}</span>
                                <Badge className={`ml-2 ${getRarityColor(item.rarity)}`}>
                                  {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                                </Badge>
                              </div>
                              <span className="text-sm text-gray-500">Level {item.level}</span>
                            </div>
                            <div className="mt-1 text-sm">
                              {Object.entries(item.stats).map(([stat, value]) => (
                                <span key={stat} className="mr-3">
                                  <span className="capitalize">{stat}:</span> +{value}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <i className="fas fa-box-open text-4xl mb-2"></i>
                      <p>No items equipped yet</p>
                      <p className="text-sm mt-2">Visit the shop or inventory to equip items</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

const CharacterCreation = () => {
  const { game, updateGameState } = useGameEngine();
  const [characterName, setCharacterName] = useState<string>("");
  const [selectedSect, setSelectedSect] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Create character function
  const handleCreateCharacter = () => {
    if (!characterName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your character.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSect) {
      toast({
        title: "Sect Required",
        description: "Please select a sect to join.",
        variant: "destructive",
      });
      return;
    }

    // Apply sect benefits and create character
    updateGameState((state) => {
      // Get the benefit function for the selected sect
      const sectData = SECTS[selectedSect as keyof typeof SECTS];
      const updatedState = sectData.benefits.effect(state);
      
      // Set character creation data
      updatedState.characterCreated = true;
      updatedState.characterName = characterName;
      updatedState.sect = selectedSect;
      
      // Initialize core objects if they don't exist
      if (!updatedState.martialArts) {
        updatedState.martialArts = {};
      }
      
      if (!updatedState.attributes) {
        updatedState.attributes = {
          strength: 10,
          agility: 10,
          endurance: 10,
          intelligence: 10,
          perception: 10
        };
      }
      
      if (!updatedState.inventory) {
        updatedState.inventory = {
          spiritualStones: 0,
          herbs: {},
          equipment: {}
        };
      }
      
      if (!updatedState.exploration) {
        updatedState.exploration = {
          currentArea: "sect",
          discoveredAreas: { "sect": true },
          completedChallenges: {},
          dailyTasksCompleted: {}
        };
      }
      
      // Initialize or reset HP system
      updatedState.health = 100;
      updatedState.maxHealth = 100;
      updatedState.defense = 5;
      updatedState.attack = 10;
      updatedState.critChance = 5;
      updatedState.dodgeChance = 5;
      
      // Calculate starting HP based on endurance (10 HP per point)
      if (updatedState.attributes.endurance) {
        updatedState.maxHealth = 50 + (updatedState.attributes.endurance * 5);
        updatedState.health = updatedState.maxHealth; // Start with full health
      }
      
      // Calculate starting attack based on strength
      if (updatedState.attributes.strength) {
        updatedState.attack = 5 + (updatedState.attributes.strength * 0.5);
      }
      
      // Calculate defense based on endurance
      if (updatedState.attributes.endurance) {
        updatedState.defense = 2 + (updatedState.attributes.endurance * 0.3);
      }
      
      // Add initial martial arts for the character
      // Every character starts with Basic Palm Strike
      updatedState.martialArts["palm-strike"] = {
        id: "palm-strike",
        name: "Azure Dragon Palm",
        chineseName: "青龙掌",
        description: "A basic yet powerful palm technique that channels Qi to strike opponents.",
        level: 1,
        maxLevel: 10,
        unlocked: true,
        damage: 15,
        cost: 5,
        cooldown: 2,
        type: "attack",
        attributeScaling: "strength"
      };
      
      return updatedState;
    });

    toast({
      title: "Character Created",
      description: `Welcome, ${characterName} of the ${SECTS[selectedSect as keyof typeof SECTS].name}!`,
    });

    // Redirect to game page
    setLocation("/game");
  };

  return (
    <div className="min-h-screen bg-scroll py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif text-center mb-8 text-primary">
          <span className="font-['Ma_Shan_Zheng'] text-amber-500 mr-2">修士</span>
          Character Creation
        </h1>

        <Card className="bg-white bg-opacity-90 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Your Immortal Identity</CardTitle>
            <CardDescription>
              Choose your name and destiny on the path to immortality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Cultivator Name
              </label>
              <Input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Enter your cultivation name"
                className="w-full"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                Choose wisely, for your name will echo throughout the cultivation world.
              </p>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-serif mb-4 text-center">Choose Your Sect</h2>
        <p className="text-center text-gray-700 mb-6">
          Each sect offers unique benefits that will shape your cultivation journey
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(SECTS).map(([sectId, sect]) => (
            <Card 
              key={sectId}
              className={`cursor-pointer transition-all ${
                selectedSect === sectId 
                  ? `ring-2 ring-${sect.color.replace('bg-', '')} shadow-lg` 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedSect(sectId)}
            >
              <CardHeader className={`${sect.color} text-white py-3`}>
                <CardTitle className="flex items-center text-lg">
                  <i className={`fas fa-${sect.icon} mr-2`}></i>
                  {sect.name}
                </CardTitle>
                <CardDescription className="text-white/80">
                  <span className="font-['Ma_Shan_Zheng']">{sect.chineseName}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm mb-3">{sect.description}</p>
                <div className="bg-gray-100 p-2 rounded-md">
                  <p className="text-sm font-medium">Benefit:</p>
                  <p className="text-sm">{sect.benefits.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            className="px-8 py-2 text-lg" 
            onClick={handleCreateCharacter}
          >
            Begin Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
};

// Root component for character page
const CharacterPage = () => {
  const { game } = useGameEngine();
  
  // If character is created, show info, otherwise show creation
  return game.characterCreated ? <CharacterInfo /> : <CharacterCreation />;
};

export default CharacterPage;