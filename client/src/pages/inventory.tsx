import { useState, useEffect } from "react";
import { useGameEngine } from "@/lib/gameEngine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const InventoryPage = () => {
  const { game, updateGameState } = useGameEngine();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Check if character is created
  useEffect(() => {
    if (!game.characterCreated) {
      setLocation("/character");
    }
  }, [game.characterCreated, setLocation]);

  // Use herb function
  const useHerb = (herbId: string) => {
    setIsLoading(true);
    
    // Ensure inventory structure exists
    if (!game.inventory || !game.inventory.herbs) {
      updateGameState(state => ({
        ...state,
        inventory: {
          ...state.inventory,
          herbs: {},
          weapons: state.inventory?.weapons || {},
          apparel: state.inventory?.apparel || {},
        }
      }));
      toast({
        title: "Inventory Error",
        description: "Inventory was incorrectly initialized. The issue has been fixed.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    const herb = game.inventory.herbs[herbId];
    if (!herb || herb.quantity <= 0) {
      setIsLoading(false);
      return;
    }
    
    // Apply herb effects
    updateGameState(state => {
      const newState = { ...state };
      
      // Ensure health is initialized
      if (typeof newState.health === 'undefined') {
        newState.health = 100;
        newState.maxHealth = 100;
      }
      
      // Process effects
      Object.entries(herb.effects).forEach(([effect, value]) => {
        switch (effect) {
          case "qi-recovery":
            newState.energy = Math.min(state.energy + value, state.maxCultivationProgress);
            break;
          case "health-recovery":
            newState.health = Math.min(state.health + value, state.maxHealth);
            break;
          case "cultivation-boost":
            newState.cultivationProgress = Math.min(state.cultivationProgress + value, state.maxCultivationProgress);
            break;
        }
      });
      
      // Reduce herb quantity
      newState.inventory.herbs[herbId].quantity -= 1;
      
      // Remove herb if quantity is 0
      if (newState.inventory.herbs[herbId].quantity <= 0) {
        delete newState.inventory.herbs[herbId];
      }
      
      return newState;
    });
    
    setTimeout(() => setIsLoading(false), 300);
  };

  // Equip/Unequip weapons
  const toggleEquipWeapon = (itemId: string) => {
    setIsLoading(true);
    
    // Check if inventory is properly initialized
    if (!game.inventory || !game.inventory.weapons) {
      updateGameState(state => ({
        ...state,
        inventory: {
          ...state.inventory,
          herbs: state.inventory?.herbs || {},
          weapons: {},
          apparel: state.inventory?.apparel || {},
        }
      }));
      toast({
        title: "Inventory Error",
        description: "Weapons inventory was incorrectly initialized. The issue has been fixed.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    const item = game.inventory.weapons[itemId];
    if (!item) {
      setIsLoading(false);
      return;
    }
    
    updateGameState(state => {
      const newState = { ...state };
      
      // Initialize health and combat stats if not present
      if (typeof newState.health === 'undefined') {
        newState.health = 100;
        newState.maxHealth = 100;
        newState.attack = 10;
        newState.defense = 5;
        newState.critChance = 5;
        newState.dodgeChance = 5;
      }
      
      // Toggle equipped status
      newState.inventory.weapons[itemId].equipped = !item.equipped;
      
      // If equipping, unequip any other weapon
      if (!item.equipped) {
        Object.entries(newState.inventory.weapons).forEach(([id, weapon]) => {
          if (id !== itemId && weapon.equipped) {
            newState.inventory.weapons[id].equipped = false;
          }
        });
        
        toast({
          title: "Weapon Equipped",
          description: `${item.name} has been equipped.`
        });
      } else {
        toast({
          title: "Weapon Unequipped",
          description: `${item.name} has been unequipped.`
        });
      }
      
      // Update player stats based on equipped items
      recalculatePlayerStats(newState);
      
      return newState;
    });
    
    setTimeout(() => setIsLoading(false), 300);
  };
  
  // Equip/Unequip apparel
  const toggleEquipApparel = (itemId: string) => {
    setIsLoading(true);
    
    // Check if inventory is properly initialized
    if (!game.inventory || !game.inventory.apparel) {
      updateGameState(state => ({
        ...state,
        inventory: {
          ...state.inventory,
          herbs: state.inventory?.herbs || {},
          weapons: state.inventory?.weapons || {},
          apparel: {},
        }
      }));
      toast({
        title: "Inventory Error",
        description: "Apparel inventory was incorrectly initialized. The issue has been fixed.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    const item = game.inventory.apparel[itemId];
    if (!item) {
      setIsLoading(false);
      return;
    }
    
    updateGameState(state => {
      const newState = { ...state };
      
      // Initialize health and combat stats if not present
      if (typeof newState.health === 'undefined') {
        newState.health = 100;
        newState.maxHealth = 100;
        newState.attack = 10;
        newState.defense = 5;
        newState.critChance = 5;
        newState.dodgeChance = 5;
      }
      
      // Toggle equipped status
      newState.inventory.apparel[itemId].equipped = !item.equipped;
      
      // If equipping, unequip any other item of same type
      if (!item.equipped) {
        Object.entries(newState.inventory.apparel).forEach(([id, apparel]) => {
          if (id !== itemId && apparel.type === item.type && apparel.equipped) {
            newState.inventory.apparel[id].equipped = false;
          }
        });
        
        toast({
          title: "Item Equipped",
          description: `${item.name} has been equipped.`
        });
      } else {
        toast({
          title: "Item Unequipped",
          description: `${item.name} has been unequipped.`
        });
      }
      
      // Update player stats based on equipped items
      recalculatePlayerStats(newState);
      
      return newState;
    });
    
    setTimeout(() => setIsLoading(false), 300);
  };

  // Recalculate player stats based on equipped items
  const recalculatePlayerStats = (state: typeof game) => {
    // Base stats
    let attack = 10;
    let defense = 5;
    let maxHealth = 100;
    let critChance = 5;
    let dodgeChance = 5;
    let strength = state.attributes.strength;
    let agility = state.attributes.agility;
    let endurance = state.attributes.endurance;
    let intelligence = state.attributes.intelligence;
    let perception = state.attributes.perception;
    
    // Add attribute bonuses
    attack += Math.floor(strength * 0.5);
    defense += Math.floor(endurance * 0.3);
    maxHealth += endurance * 10;
    critChance += Math.floor(perception * 0.2);
    dodgeChance += Math.floor(agility * 0.2);
    
    // Add weapon bonuses
    Object.values(state.inventory.weapons || {}).forEach(item => {
      if (item.equipped && item.stats) {
        Object.entries(item.stats).forEach(([stat, value]) => {
          switch (stat) {
            case "attack": attack += value as number; break;
            case "defense": defense += value as number; break;
            case "critChance": critChance += value as number; break;
            case "dodgeChance": dodgeChance += value as number; break;
            case "maxHealth": maxHealth += value as number; break;
            case "strength": strength += value as number; break;
            case "agility": agility += value as number; break;
            case "endurance": endurance += value as number; break;
            case "intelligence": intelligence += value as number; break;
            case "perception": perception += value as number; break;
          }
        });
      }
    });
    
    // Add apparel bonuses
    Object.values(state.inventory.apparel || {}).forEach(item => {
      if (item.equipped && item.stats) {
        Object.entries(item.stats).forEach(([stat, value]) => {
          switch (stat) {
            case "attack": attack += value as number; break;
            case "defense": defense += value as number; break;
            case "critChance": critChance += value as number; break;
            case "dodgeChance": dodgeChance += value as number; break;
            case "maxHealth": maxHealth += value as number; break;
            case "strength": strength += value as number; break;
            case "agility": agility += value as number; break;
            case "endurance": endurance += value as number; break;
            case "intelligence": intelligence += value as number; break;
            case "perception": perception += value as number; break;
          }
        });
      }
    });
    
    // Update stats
    state.attack = attack;
    state.defense = defense;
    state.maxHealth = maxHealth;
    state.critChance = critChance;
    state.dodgeChance = dodgeChance;
    
    // Update attributes with bonuses
    state.attributes = {
      strength,
      agility,
      endurance,
      intelligence,
      perception
    };
    
    // Ensure health doesn't exceed max health
    if (state.health > state.maxHealth) {
      state.health = state.maxHealth;
    }
  };
  
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

  return (
    <div className="min-h-screen bg-scroll py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-serif text-primary mb-2">Inventory</h1>
          <p className="text-gray-700">Manage your equipment and resources</p>
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="weapons">Weapons</TabsTrigger>
                <TabsTrigger value="apparel">Apparel</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card className="bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Character Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-sm font-medium mb-1">Health</p>
                        <p className="text-lg">{Math.floor(game.health || 100)} / {game.maxHealth || 100}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Attack</p>
                        <p className="text-lg">{game.attack || 10}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Defense</p>
                        <p className="text-lg">{game.defense || 5}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Crit Chance</p>
                        <p className="text-lg">{game.critChance || 5}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Dodge Chance</p>
                        <p className="text-lg">{game.dodgeChance || 5}%</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="font-medium mb-3">Attributes</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Strength</p>
                          <p className="text-lg">{game.attributes?.strength || 10}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Agility</p>
                          <p className="text-lg">{game.attributes?.agility || 10}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Endurance</p>
                          <p className="text-lg">{game.attributes?.endurance || 10}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Intelligence</p>
                          <p className="text-lg">{game.attributes?.intelligence || 10}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Perception</p>
                          <p className="text-lg">{game.attributes?.perception || 10}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Herbs Section */}
                <Card className="bg-white shadow-md mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Herbs & Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!game.inventory?.herbs || Object.keys(game.inventory.herbs).length === 0 ? (
                      <p className="text-center text-gray-500 py-4">
                        You have not collected any herbs yet. Explore to gather resources.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(game.inventory.herbs).map(([herbId, herb]) => (
                          <div key={herbId} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-medium">{herb.name}</h3>
                              <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                                {herb.quantity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{herb.description}</p>
                            
                            <h4 className="text-xs font-medium mb-1">Effects:</h4>
                            <ul className="text-xs space-y-1 mb-3">
                              {Object.entries(herb.effects).map(([effect, value]) => (
                                <li key={effect} className="capitalize">
                                  {effect.replace(/-/g, ' ')}: +{value}
                                </li>
                              ))}
                            </ul>
                            
                            <Button 
                              size="sm" 
                              onClick={() => useHerb(herbId)}
                              className="w-full"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                  <span>Using...</span>
                                </div>
                              ) : (
                                "Use Herb"
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="weapons">
                <Card className="bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Weapons</CardTitle>
                    <CardDescription>Equip weapons to increase your combat abilities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!game.inventory?.weapons || Object.keys(game.inventory.weapons).length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500 mb-4">
                          You have not found any weapons yet. Visit the Shop to purchase equipment.
                        </p>
                        <Button onClick={() => setLocation('/shop')}>
                          Visit Shop
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(game.inventory.weapons).map(([itemId, item]) => (
                          <div 
                            key={itemId}
                            className={`border ${item.equipped ? 'border-primary' : 'border-gray-200'} rounded-md p-3 hover:bg-gray-50 transition-colors`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium flex items-center">
                                  {item.name}
                                  {item.equipped && (
                                    <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded">
                                      Equipped
                                    </span>
                                  )}
                                </h3>
                                <p className="text-xs text-gray-600 capitalize">
                                  {item.type} • {item.rarity}
                                </p>
                              </div>
                              <Badge className={getRarityColor(item.rarity)}>
                                {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-xs text-gray-600 mb-1">{item.description}</p>
                              <h4 className="text-xs font-medium mb-1">Stats:</h4>
                              <ul className="text-xs space-y-1">
                                {Object.entries(item.stats).map(([stat, value]) => (
                                  <li key={stat} className="capitalize">
                                    {stat}: +{value}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <Button 
                              size="sm" 
                              variant={item.equipped ? "outline" : "default"}
                              onClick={() => toggleEquipWeapon(itemId)}
                              className="w-full"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                  <span>Processing...</span>
                                </div>
                              ) : (
                                item.equipped ? "Unequip" : "Equip"
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="apparel">
                <Card className="bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Apparel</CardTitle>
                    <CardDescription>Equip clothing and armor to enhance your abilities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!game.inventory?.apparel || Object.keys(game.inventory.apparel).length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500 mb-4">
                          You have not found any apparel yet. Visit the Shop to purchase equipment.
                        </p>
                        <Button onClick={() => setLocation('/shop')}>
                          Visit Shop
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(game.inventory.apparel).map(([itemId, item]) => (
                          <div 
                            key={itemId}
                            className={`border ${item.equipped ? 'border-primary' : 'border-gray-200'} rounded-md p-3 hover:bg-gray-50 transition-colors`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium flex items-center">
                                  {item.name}
                                  {item.equipped && (
                                    <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded">
                                      Equipped
                                    </span>
                                  )}
                                </h3>
                                <p className="text-xs text-gray-600 capitalize">
                                  {item.type} • {item.rarity}
                                </p>
                              </div>
                              <Badge className={getRarityColor(item.rarity)}>
                                {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-xs text-gray-600 mb-1">{item.description}</p>
                              <h4 className="text-xs font-medium mb-1">Stats:</h4>
                              <ul className="text-xs space-y-1">
                                {Object.entries(item.stats).map(([stat, value]) => (
                                  <li key={stat} className="capitalize">
                                    {stat}: +{value}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <Button 
                              size="sm" 
                              variant={item.equipped ? "outline" : "default"}
                              onClick={() => toggleEquipApparel(itemId)}
                              className="w-full"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                  <span>Processing...</span>
                                </div>
                              ) : (
                                item.equipped ? "Unequip" : "Equip"
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setLocation("/game")}
              >
                Return to Cultivation
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;