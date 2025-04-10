import { useState, useEffect } from "react";
import { useGameEngine } from "@/lib/gameEngine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const InventoryPage = () => {
  const { game, updateGameState } = useGameEngine();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  // Check if character is created
  useEffect(() => {
    if (!game.characterCreated) {
      setLocation("/character");
    }
  }, [game.characterCreated, setLocation]);

  // Use herb function
  const useHerb = (herbId: string) => {
    // Ensure inventory structure exists
    if (!game.inventory || !game.inventory.herbs) {
      updateGameState(state => ({
        ...state,
        inventory: {
          ...state.inventory,
          herbs: {},
          weapons: {},
          apparel: {}
        }
      }));
      toast({
        title: "Inventory Error",
        description: "Inventory was incorrectly initialized. The issue has been fixed.",
        variant: "destructive"
      });
      return;
    }
    
    const herb = game.inventory.herbs[herbId];
    if (!herb || herb.quantity <= 0) return;
    
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
            toast({
              title: "Herb Used",
              description: `Recovered ${value} Qi energy from ${herb.name}.`
            });
            break;
          case "healing":
            newState.health = Math.min(state.health + value, state.maxHealth);
            toast({
              title: "Herb Used",
              description: `Recovered ${value} Health from ${herb.name}.`
            });
            break;
          case "attribute-boost":
            // Initialize attributes if not present
            if (!newState.attributes) {
              newState.attributes = {
                strength: 10,
                agility: 10,
                endurance: 10,
                intelligence: 10,
                perception: 10
              };
            }
            
            // For now, just boost all attributes by the value
            Object.keys(newState.attributes).forEach(attr => {
              newState.attributes[attr as keyof typeof newState.attributes] += 1;
            });
            
            toast({
              title: "Herb Used",
              description: `All attributes increased by 1 from ${herb.name}.`
            });
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
  };

  // Equip/Unequip weapon
  const toggleEquipWeapon = (itemId: string) => {
    // Check if inventory is properly initialized
    if (!game.inventory || !game.inventory.weapons) {
      updateGameState(state => ({
        ...state,
        inventory: {
          ...state.inventory,
          herbs: state.inventory?.herbs || {},
          weapons: {},
          apparel: state.inventory?.apparel || {}
        }
      }));
      toast({
        title: "Inventory Error",
        description: "Weapons inventory was incorrectly initialized. The issue has been fixed.",
        variant: "destructive"
      });
      return;
    }
    
    const item = game.inventory.weapons[itemId];
    if (!item) return;
    
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
      
      // If equipping, unequip any other weapon of the same type
      if (!item.equipped) {
        Object.entries(newState.inventory.weapons).forEach(([id, weapon]) => {
          if (id !== itemId && weapon.type === item.type && weapon.equipped) {
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
  };
  
  // Equip/Unequip apparel
  const toggleEquipApparel = (itemId: string) => {
    // Check if inventory is properly initialized
    if (!game.inventory || !game.inventory.apparel) {
      updateGameState(state => ({
        ...state,
        inventory: {
          ...state.inventory,
          herbs: state.inventory?.herbs || {},
          weapons: state.inventory?.weapons || {},
          apparel: {}
        }
      }));
      toast({
        title: "Inventory Error",
        description: "Apparel inventory was incorrectly initialized. The issue has been fixed.",
        variant: "destructive"
      });
      return;
    }
    
    const item = game.inventory.apparel[itemId];
    if (!item) return;
    
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
      
      // If equipping, unequip any other apparel of same type
      if (!item.equipped) {
        Object.entries(newState.inventory.apparel).forEach(([id, apparel]) => {
          if (id !== itemId && apparel.type === item.type && apparel.equipped) {
            newState.inventory.apparel[id].equipped = false;
          }
        });
        
        toast({
          title: "Apparel Equipped",
          description: `${item.name} has been equipped.`
        });
      } else {
        toast({
          title: "Apparel Unequipped",
          description: `${item.name} has been unequipped.`
        });
      }
      
      // Update player stats based on equipped items
      recalculatePlayerStats(newState);
      
      return newState;
    });
  };

  // Recalculate player stats based on equipped items
  const recalculatePlayerStats = (state: typeof game) => {
    // Base stats
    let attack = 10;
    let defense = 5;
    let maxHealth = 100;
    
    // Add attribute bonuses
    attack += Math.floor(state.attributes.strength * 0.5);
    defense += Math.floor(state.attributes.endurance * 0.3);
    maxHealth += state.attributes.endurance * 10;
    
    // Add weapon bonuses
    if (state.inventory?.weapons) {
      Object.values(state.inventory.weapons).forEach(item => {
        if (item.equipped) {
          Object.entries(item.stats).forEach(([stat, value]) => {
            switch (stat) {
              case "attack":
                attack += value;
                break;
              case "defense":
                defense += value;
                break;
              case "health":
                maxHealth += value;
                break;
            }
          });
        }
      });
    }
    
    // Add apparel bonuses
    if (state.inventory?.apparel) {
      Object.values(state.inventory.apparel).forEach(item => {
        if (item.equipped) {
          Object.entries(item.stats).forEach(([stat, value]) => {
            switch (stat) {
              case "attack":
                attack += value;
                break;
              case "defense":
                defense += value;
                break;
              case "health":
                maxHealth += value;
                break;
            }
          });
        }
      });
    }
    
    // Update stats
    state.attack = attack;
    state.defense = defense;
    state.maxHealth = maxHealth;
    
    // Ensure health doesn't exceed max health
    if (state.health > state.maxHealth) {
      state.health = state.maxHealth;
    }
    
    return state;
  };

  // Count items by category - safely handle potential undefined values
  const itemCounts = {
    herbs: game.inventory && game.inventory.herbs ? Object.keys(game.inventory.herbs).length : 0,
    equipment: (
      (game.inventory?.weapons ? Object.keys(game.inventory.weapons).length : 0) +
      (game.inventory?.apparel ? Object.keys(game.inventory.apparel).length : 0)
    ),
    equipped: (
      (game.inventory?.weapons ? Object.values(game.inventory.weapons).filter(item => item.equipped).length : 0) +
      (game.inventory?.apparel ? Object.values(game.inventory.apparel).filter(item => item.equipped).length : 0)
    )
  };

  return (
    <div className="min-h-screen bg-scroll py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-serif text-primary mb-2">
            <i className="fas fa-archive mr-2"></i>
            Inventory
          </h1>
          <p className="text-gray-700">Manage your spiritual items, herbs, and equipment</p>
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
            <Card className="bg-white shadow-md mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <div className="flex items-center mb-1">
                      <i className="fas fa-gem text-amber-500 mr-2"></i>
                      <span className="font-medium">Spiritual Stones</span>
                    </div>
                    <p className="text-xl">{game.spiritualStones || 0}</p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex items-center mb-1">
                      <i className="fas fa-leaf text-green-500 mr-2"></i>
                      <span className="font-medium">Herbs</span>
                    </div>
                    <p className="text-xl">{itemCounts.herbs} types</p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                    <div className="flex items-center mb-1">
                      <i className="fas fa-gavel text-purple-500 mr-2"></i>
                      <span className="font-medium">Equipment</span>
                    </div>
                    <p className="text-xl">{itemCounts.equipment} items</p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-center mb-1">
                      <i className="fas fa-shield-alt text-green-600 mr-2"></i>
                      <span className="font-medium">Equipped</span>
                    </div>
                    <p className="text-xl">{itemCounts.equipped} items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="herbs">Herbs</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
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
              </TabsContent>
              
              <TabsContent value="herbs">
                <Card className="bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Herbs Collection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!game.inventory?.herbs || Object.keys(game.inventory.herbs).length === 0 ? (
                      <p className="text-center text-gray-500 py-4">
                        You have not collected any herbs yet. Explore the world to gather herbs.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(game.inventory.herbs).map(([herbId, herb]) => (
                          <div 
                            key={herbId}
                            className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium">{herb.name}</h3>
                                <p className="text-xs text-gray-600">Quality: {Array(herb.quality).fill("★").join("")}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">Quantity: {herb.quantity}</p>
                              </div>
                            </div>
                            
                            <p className="text-sm mb-2">{herb.description}</p>
                            <div className="mb-3">
                              <h4 className="text-xs font-medium mb-1">Effects:</h4>
                              <ul className="text-xs space-y-1">
                                {Object.entries(herb.effects).map(([effect, value]) => (
                                  <li key={effect} className="flex items-center">
                                    <span className={`mr-1 ${
                                      effect === "qi-recovery" ? "text-blue-500" : 
                                      effect === "healing" ? "text-red-500" : 
                                      "text-amber-500"
                                    }`}>
                                      <i className={`fas fa-${
                                        effect === "qi-recovery" ? "fire-alt" : 
                                        effect === "healing" ? "heart" : 
                                        "star"
                                      } mr-1`}></i>
                                    </span>
                                    {effect === "qi-recovery" && `Recover ${value} Qi when consumed`}
                                    {effect === "healing" && `Restore ${value} Health when consumed`}
                                    {effect === "attribute-boost" && `Permanently boost all attributes by ${value}`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <Button 
                              size="sm" 
                              onClick={() => useHerb(herbId)}
                              className="w-full"
                            >
                              Use Herb
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="equipment">
                <Card className="bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Equipment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Check if we have any weapons or apparel */}
                    {(!game.inventory?.weapons || Object.keys(game.inventory.weapons).length === 0) && 
                     (!game.inventory?.apparel || Object.keys(game.inventory.apparel).length === 0) ? (
                      <p className="text-center text-gray-500 py-4">
                        You have not found any equipment yet. Visit the shop to purchase equipment.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Render weapons */}
                        {game.inventory?.weapons && Object.entries(game.inventory.weapons).map(([itemId, item]) => (
                          <div 
                            key={itemId}
                            className={`border ${item.equipped ? 'border-primary' : 'border-gray-200'} rounded-md p-3 hover:bg-gray-50 transition-colors`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium flex items-center">
                                  <i className="fas fa-khanda mr-2 text-primary"></i>
                                  {item.name}
                                  {item.equipped && (
                                    <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded">
                                      Equipped
                                    </span>
                                  )}
                                </h3>
                                <p className="text-xs text-gray-600 capitalize">
                                  Weapon • {item.type} • {item.rarity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">Level {item.level}</p>
                              </div>
                            </div>
                            
                            <p className="text-sm mb-2">{item.description}</p>
                            <div className="mb-3">
                              <h4 className="text-xs font-medium mb-1">Stats:</h4>
                              <ul className="text-xs space-y-1">
                                {Object.entries(item.stats).map(([stat, value]) => (
                                  <li key={stat} className="capitalize flex items-center">
                                    <span className={`mr-1 ${
                                      stat === "attack" ? "text-red-500" : 
                                      stat === "defense" ? "text-blue-500" : 
                                      stat === "critChance" ? "text-amber-500" :
                                      stat === "dodgeChance" ? "text-green-500" :
                                      stat === "maxHealth" ? "text-pink-500" :
                                      "text-purple-500"
                                    }`}>
                                      <i className={`fas fa-${
                                        stat === "attack" ? "fist-raised" : 
                                        stat === "defense" ? "shield-alt" : 
                                        stat === "critChance" ? "crosshairs" :
                                        stat === "dodgeChance" ? "wind" :
                                        stat === "maxHealth" ? "heart" :
                                        "star"
                                      } mr-1`}></i>
                                    </span>
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
                            >
                              {item.equipped ? "Unequip" : "Equip"}
                            </Button>
                          </div>
                        ))}

                        {/* Render apparel */}
                        {game.inventory?.apparel && Object.entries(game.inventory.apparel).map(([itemId, item]) => (
                          <div 
                            key={itemId}
                            className={`border ${item.equipped ? 'border-primary' : 'border-gray-200'} rounded-md p-3 hover:bg-gray-50 transition-colors`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium flex items-center">
                                  <i className="fas fa-tshirt mr-2 text-primary"></i>
                                  {item.name}
                                  {item.equipped && (
                                    <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded">
                                      Equipped
                                    </span>
                                  )}
                                </h3>
                                <p className="text-xs text-gray-600 capitalize">
                                  Apparel • {item.type} • {item.rarity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">Level {item.level}</p>
                              </div>
                            </div>
                            
                            <p className="text-sm mb-2">{item.description}</p>
                            <div className="mb-3">
                              <h4 className="text-xs font-medium mb-1">Stats:</h4>
                              <ul className="text-xs space-y-1">
                                {Object.entries(item.stats).map(([stat, value]) => (
                                  <li key={stat} className="capitalize flex items-center">
                                    <span className={`mr-1 ${
                                      stat === "attack" ? "text-red-500" : 
                                      stat === "defense" ? "text-blue-500" : 
                                      stat === "critChance" ? "text-amber-500" :
                                      stat === "dodgeChance" ? "text-green-500" :
                                      stat === "maxHealth" ? "text-pink-500" :
                                      "text-purple-500"
                                    }`}>
                                      <i className={`fas fa-${
                                        stat === "attack" ? "fist-raised" : 
                                        stat === "defense" ? "shield-alt" : 
                                        stat === "critChance" ? "crosshairs" :
                                        stat === "dodgeChance" ? "wind" :
                                        stat === "maxHealth" ? "heart" :
                                        "star"
                                      } mr-1`}></i>
                                    </span>
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
                            >
                              {item.equipped ? "Unequip" : "Equip"}
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