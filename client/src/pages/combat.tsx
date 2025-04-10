import { useState, useEffect } from "react";
import { useGameEngine } from "@/lib/gameEngine";
import { ENEMIES, MARTIAL_ARTS, RESOURCES, RESOURCE_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

// Helper function to determine location difficulty scaling
function getLocationDifficultyScale(locationId: string) {
  // Define difficulty tiers
  const locationTiers = {
    // Beginner areas (low difficulty)
    "forest": { healthMultiplier: 1.0, attackMultiplier: 1.0, defenseMultiplier: 1.0, tier: "beginner" },
    "city": { healthMultiplier: 1.1, attackMultiplier: 1.05, defenseMultiplier: 1.0, tier: "beginner" },
    "mountain": { healthMultiplier: 1.2, attackMultiplier: 1.1, defenseMultiplier: 1.05, tier: "beginner" },
    "poison-marsh": { healthMultiplier: 1.3, attackMultiplier: 1.2, defenseMultiplier: 1.1, tier: "beginner" },
    
    // Intermediate areas (medium difficulty)
    "jade-valley": { healthMultiplier: 1.5, attackMultiplier: 1.3, defenseMultiplier: 1.2, tier: "intermediate" },
    "ruins": { healthMultiplier: 1.7, attackMultiplier: 1.4, defenseMultiplier: 1.3, tier: "intermediate" },
    "frozen-peak": { healthMultiplier: 1.9, attackMultiplier: 1.5, defenseMultiplier: 1.4, tier: "intermediate" },
    "thunder-peak": { healthMultiplier: 2.0, attackMultiplier: 1.6, defenseMultiplier: 1.5, tier: "intermediate" },
    
    // Advanced areas (high difficulty)
    "flame-desert": { healthMultiplier: 2.2, attackMultiplier: 1.8, defenseMultiplier: 1.6, tier: "advanced" },
    "great-river": { healthMultiplier: 2.5, attackMultiplier: 2.0, defenseMultiplier: 1.8, tier: "advanced" },
    "void-rift": { healthMultiplier: 2.8, attackMultiplier: 2.2, defenseMultiplier: 2.0, tier: "advanced" },
    "dragon-volcano": { healthMultiplier: 3.0, attackMultiplier: 2.5, defenseMultiplier: 2.2, tier: "advanced" },
  };
  
  // Return the scaling for the location or default beginner scaling
  return (locationTiers as any)[locationId] || 
    { healthMultiplier: 1.0, attackMultiplier: 1.0, defenseMultiplier: 1.0, tier: "beginner" };
}

// Helper function to get area difficulty description
function getAreaDifficultyDescription(locationId: string) {
  const scale = getLocationDifficultyScale(locationId);
  
  switch(scale.tier) {
    case "beginner":
      return "relatively weak, suitable for your current level";
    case "intermediate":
      return "tougher than normal, with enhanced physical abilities";
    case "advanced":
      return "extremely powerful, with formidable strength and resilience";
    default:
      return "of average strength";
  }
}

// Helper function to get healing herbs from inventory
function getHealingHerbs(inventory: any) {
  if (!inventory || !inventory.herbs) return [];
  
  // Filter herbs with healing effects
  return Object.entries(inventory.herbs)
    .filter(([id, herb]: [string, any]) => {
      const herbData = RESOURCES[id as keyof typeof RESOURCES];
      return herbData && herbData.effects && herbData.effects.health;
    })
    .map(([id, herb]: [string, any]) => ({
      id,
      count: herb.quantity || 0, // Use quantity instead of count
      data: RESOURCES[id as keyof typeof RESOURCES]
    }))
    .filter(herb => herb.count > 0)
    .sort((a, b) => a.data.effects.health - b.data.effects.health); // Sort by healing amount
}

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
  const [showHerbPanel, setShowHerbPanel] = useState<boolean>(false);
  const [herbAnimating, setHerbAnimating] = useState<string | null>(null);
  const [attackAnimation, setAttackAnimation] = useState<string | null>(null);
  const [damageEffect, setDamageEffect] = useState<boolean>(false);
  const [attackTarget, setAttackTarget] = useState<"player" | "enemy" | null>(null);

  // Check if character is created
  useEffect(() => {
    if (!game.characterCreated) {
      setLocation("/character");
    }
  }, [game.characterCreated, setLocation]);

  // Handle cooldown timers
  // Handle cooldowns and health regeneration
  useEffect(() => {
    if (combatStatus === "fighting") {
      // Main combat timer that runs every second
      const timer = setInterval(() => {
        // Process cooldowns
        if (Object.keys(cooldowns).length > 0) {
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
        }
        
        // Health regeneration (5% of max HP every 2 seconds)
        // Using a counter to only regenerate every other second
        if (enemy && game.health < game.maxHealth) {
          // Only regenerate on even seconds (every 2s)
          const currentTime = Date.now();
          if (Math.floor(currentTime / 2000) % 2 === 0) {
            const regenAmount = Math.ceil(game.maxHealth * 0.05); // 5% of max health
            const newHealth = Math.min(game.maxHealth, game.health + regenAmount);
            
            if (newHealth > game.health) {
              updateGameState(state => ({
                ...state,
                health: newHealth
              }));
              
              // Add regeneration message to combat log
              setCombatLog(prev => [
                ...prev,
                `You regenerate ${regenAmount} health through qi circulation.`
              ].slice(-15)); // Keep only the last 15 messages
            }
          }
        }
      }, 1000); // Run every second
      
      return () => clearInterval(timer);
    }
  }, [combatStatus, cooldowns, enemy, game.health, game.maxHealth, updateGameState]);



  // Use a healing herb during combat
  const useHerb = (herbId: string) => {
    if (combatStatus !== "fighting") {
      setCombatLog(prev => [...prev, "You can only use herbs during combat!"]);
      return;
    }
    
    // Ensure inventory structure exists
    if (!game.inventory || !game.inventory.herbs) {
      toast({
        title: "Inventory Error",
        description: "No herbs found in inventory.",
        variant: "destructive"
      });
      setShowHerbPanel(false);
      return;
    }
    
    // Get herb data
    const herbData = game.inventory.herbs[herbId];
    const herb = RESOURCES[herbId as keyof typeof RESOURCES];
    
    if (!herbData || !herbData.quantity || herbData.quantity <= 0) {
      toast({
        title: "Herb Not Available",
        description: "You don't have any of this herb.",
        variant: "destructive"
      });
      return;
    }
    
    // Set herb animation
    setHerbAnimating(herbId);
    
    // Get healing amount
    const healAmount = herb.effects?.health || 20; // Default to 20 if not specified
    
    // Update player health
    const newHealth = Math.min(game.maxHealth, game.health + healAmount);
    
    // Add to combat log
    setCombatLog(prev => [
      ...prev,
      `You use ${herb.name} and recover ${healAmount} health!`
    ]);
    
    // Update game state
    updateGameState(state => {
      const updatedInventory = { ...state.inventory };
      
      if (!updatedInventory.herbs) {
        updatedInventory.herbs = {};
      }
      
      // Reduce herb quantity
      updatedInventory.herbs[herbId] = {
        ...updatedInventory.herbs[herbId],
        quantity: (updatedInventory.herbs[herbId]?.quantity || 0) - 1
      };
      
      // Remove herb if quantity is 0
      if (updatedInventory.herbs[herbId].quantity <= 0) {
        delete updatedInventory.herbs[herbId];
      }
      
      return {
        ...state,
        health: newHealth,
        inventory: updatedInventory
      };
    });
    
    // Close herb panel and clear animation after a delay
    setTimeout(() => {
      setHerbAnimating(null);
      setShowHerbPanel(false);
    }, 1000);
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
    // Default to strength if attributeScaling is undefined
    const attributeName = technique.attributeScaling || 'strength';
    
    // Ensure attributes object exists and contains the attribute
    const attributeValue = (game.attributes && game.attributes[attributeName]) ? 
                           game.attributes[attributeName] : 10; // Default to 10 if not found
    
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
    
    // Trigger attack animation
    setAttackAnimation(techniqueId);
    setAttackTarget("enemy");
    setDamageEffect(true);
    
    // Update enemy after animation delay
    setTimeout(() => {
      setEnemy(prev => prev ? {
        ...prev,
        health: newEnemyHealth
      } : null);
      
      // Clear animations
      setAttackAnimation(null);
      setDamageEffect(false);
    }, 600);
    
    // Longer delay for attack target to ensure animations play in sequence
    setTimeout(() => {
      setAttackTarget(null);
    }, 700);
    
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
    
    // Trigger enemy attack animation
    setAttackAnimation("enemy-attack");
    setAttackTarget("player");
    setDamageEffect(true);
    
    // Update game state after animation
    setTimeout(() => {
      updateGameState(state => ({
        ...state,
        health: newHealth
      }));
      
      // Clear animations
      setAttackAnimation(null);
      setDamageEffect(false);
    }, 600);
    
    // Longer delay for attack target to ensure animations play in sequence
    setTimeout(() => {
      setAttackTarget(null);
      
      // Check if player defeated
      if (newHealth <= 0) {
        handleDefeat();
      }
    }, 700);
  };
  
  // Start combat with enhanced location difficulty scaling
  const startCombat = (enemyId: string) => {
    const enemyData = ENEMIES[enemyId as keyof typeof ENEMIES];
    
    // Apply location-based difficulty scaling
    const locationScaling = getLocationDifficultyScale(selectedArea);
    
    // Scale enemy stats based on location difficulty
    const scaledHealth = Math.round(enemyData.health * locationScaling.healthMultiplier);
    const scaledAttack = Math.round(enemyData.attack * locationScaling.attackMultiplier);
    const scaledDefense = Math.round(enemyData.defense * locationScaling.defenseMultiplier);
    
    const newEnemy: Enemy = {
      id: enemyId,
      name: enemyData.name,
      description: enemyData.description,
      health: scaledHealth,
      maxHealth: scaledHealth,
      attack: scaledAttack,
      defense: scaledDefense
    };
    
    setEnemy(newEnemy);
    setCombatStatus("fighting");
    setCombatLog([
      `You encounter a ${enemyData.name}!`,
      `This enemy appears ${getAreaDifficultyDescription(selectedArea)}.`
    ]);
    
    // Initialize cooldowns
    const initialCooldowns: Record<string, number> = {};
    Object.keys(game.martialArts).forEach(id => initialCooldowns[id] = 0);
    setCooldowns(initialCooldowns);
  };

  // Handle player victory with item drops
  const handleVictory = () => {
    if (!enemy) return;
    
    setCombatStatus("victory");
    
    // Get enemy rewards
    const enemyData = ENEMIES[enemy.id as keyof typeof ENEMIES];
    const rewards = enemyData.rewards;
    
    // Calculate gold reward based on experience
    const goldReward = Math.floor(rewards.experience * 2);
    
    // Determine herb drops based on enemy and location
    const droppedItems: { id: string, name: string, amount: number }[] = [];
    
    // Random herb drop chance based on location difficulty
    const locationDifficulty = getLocationDifficultyScale(selectedArea);
    const dropChanceMultiplier = locationDifficulty.tier === 'advanced' ? 1.5 : 
                                locationDifficulty.tier === 'intermediate' ? 1.2 : 1.0;
    
    // Potential healing herb drops
    const potentialHerbDrops = [
      { id: 'healing-grass', chance: 0.3 * dropChanceMultiplier, amount: 1 },
      { id: 'blood-lotus', chance: 0.15 * dropChanceMultiplier, amount: 1 },
      { id: 'celestial-peach', chance: 0.05 * dropChanceMultiplier, amount: 1 }
    ];
    
    // Roll for drops
    potentialHerbDrops.forEach(herb => {
      if (Math.random() < herb.chance) {
        const herbData = RESOURCES[herb.id as keyof typeof RESOURCES];
        droppedItems.push({
          id: herb.id,
          name: herbData.name,
          amount: herb.amount
        });
      }
    });
    
    // Add rewards to log
    const rewardLog = [
      `You defeated the ${enemy.name}!`,
      `Gained ${rewards.experience} cultivation experience, ${rewards.spiritualStones} spiritual stones, and ${goldReward} gold.`
    ];
    
    // Add dropped items to log if any
    if (droppedItems.length > 0) {
      rewardLog.push(`The enemy dropped: ${droppedItems.map(item => `${item.amount} ${item.name}`).join(', ')}`);
    }
    
    setCombatLog(prev => [...prev, ...rewardLog]);
    
    // Update game state with rewards and drops
    updateGameState(state => {
      // Calculate new cultivation progress
      const newProgress = state.cultivationProgress + rewards.experience;
      
      // Create updated inventory for herbs
      const updatedInventory = { ...state.inventory };
      
      // Initialize herbs object if it doesn't exist
      if (!updatedInventory.herbs) {
        updatedInventory.herbs = {};
      }
      
      // Add dropped herbs to inventory
      droppedItems.forEach(item => {
        if (!updatedInventory.herbs[item.id]) {
          updatedInventory.herbs[item.id] = { 
            id: item.id,
            name: RESOURCES[item.id as keyof typeof RESOURCES].name,
            description: RESOURCES[item.id as keyof typeof RESOURCES].description,
            quantity: 0,
            icon: RESOURCES[item.id as keyof typeof RESOURCES].icon || "",
            value: RESOURCES[item.id as keyof typeof RESOURCES].value || 0,
            quality: RESOURCES[item.id as keyof typeof RESOURCES].quality || 1,
            effects: RESOURCES[item.id as keyof typeof RESOURCES].effects || {}
          };
        }
        updatedInventory.herbs[item.id].quantity = (updatedInventory.herbs[item.id].quantity || 0) + item.amount;
      });
      
      return {
        ...state,
        // Add spiritual stones directly to the spiritualStones property
        spiritualStones: state.spiritualStones + rewards.spiritualStones,
        // Add gold rewards
        gold: state.gold + goldReward,
        // Add cultivation progress
        cultivationProgress: Math.min(state.maxCultivationProgress, newProgress),
        // Update inventory with herb drops
        inventory: updatedInventory,
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

  // Filter enemies by area and player level
  const getAreaEnemies = () => {
    const playerLevel = game.cultivationLevel;
    
    // Expanded enemy lists by area
    const enemies = {
      // Spirit Forest - various animal and nature spirits
      "forest": playerLevel < 5 ? 
        ["beast", "wolf", "fox"] : 
        playerLevel < 10 ? 
          ["bear", "snake", "tiger", "eagle", "boar", "monkey", "deer"] : 
          ["shadow-wolf", "spirit-ape", "vine-horror"],
      
      // City Outskirts - human and humanoid opponents
      "city": playerLevel < 7 ? 
        ["bandit", "rogue-cultivator"] : 
        ["demonic-cultivator", "ghost-warrior"],
      
      // Ancient Ruins - constructs and ancient entities
      "ruins": playerLevel < 12 ? 
        ["guardian", "tomb-guardian"] : 
        ["demon", "ghost-warrior", "stone-golem"],
      
      // Mountain - larger beasts and elemental entities
      "mountain": playerLevel < 8 ? 
        ["bear", "eagle", "boar"] : 
        playerLevel < 15 ? 
          ["spirit-ape", "thunder-beast", "ancient-tiger"] : 
          ["golden-ape"],
      
      // Jade Valley - mineral and earth entities
      "jade-valley": playerLevel < 10 ? 
        ["jade-serpent"] : 
        ["stone-golem", "giant-centipede"],
      
      // Poison Marsh - toxic and venomous creatures
      "poison-marsh": playerLevel < 8 ? 
        ["snake", "venomous-toad"] : 
        ["vine-horror", "blood-bat"],
        
      // Flame Desert - fire-attuned entities
      "flame-desert": playerLevel < 15 ? 
        ["flame-scorpion"] : 
        ["phoenix-descendant", "fire-dragon-king"],
      
      // Frozen Peak - ice and cold entities
      "frozen-peak": playerLevel < 12 ? 
        ["ice-sprite"] : 
        ["elder-dragon"]
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
              
              <Tabs defaultValue="beginner" className="mb-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="beginner">Beginner Areas</TabsTrigger>
                  <TabsTrigger value="intermediate">Intermediate Areas</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Areas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="beginner">
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
                        <p className="text-xs mt-2 text-gray-600">Levels 3-7 recommended</p>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer transition-all ${selectedArea === "mountain" ? "ring-2 ring-yellow-500" : ""}`}
                      onClick={() => setSelectedArea("mountain")}
                    >
                      <CardHeader className="bg-yellow-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-mountain mr-2"></i> Azure Mountains
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">Home to powerful beasts and flying creatures.</p>
                        <p className="text-xs mt-2 text-gray-600">Levels 4-8 recommended</p>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer transition-all ${selectedArea === "poison-marsh" ? "ring-2 ring-green-700" : ""}`}
                      onClick={() => setSelectedArea("poison-marsh")}
                    >
                      <CardHeader className="bg-green-700 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-skull-crossbones mr-2"></i> Poison Marsh
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">A dangerous swamp filled with venomous creatures.</p>
                        <p className="text-xs mt-2 text-gray-600">Levels 5-10 recommended</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="intermediate">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card 
                      className={`cursor-pointer transition-all ${selectedArea === "jade-valley" ? "ring-2 ring-emerald-500" : ""}`}
                      onClick={() => setSelectedArea("jade-valley")}
                    >
                      <CardHeader className="bg-emerald-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-gem mr-2"></i> Jade Valley
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">A valley rich with jade essence and mineral spirits.</p>
                        <p className="text-xs mt-2 text-gray-600">Levels 6-12 recommended</p>
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
                        <p className="text-xs mt-2 text-gray-600">Levels 10-15 recommended</p>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer transition-all ${selectedArea === "frozen-peak" ? "ring-2 ring-blue-300" : ""}`}
                      onClick={() => setSelectedArea("frozen-peak")}
                    >
                      <CardHeader className="bg-blue-400 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-snowflake mr-2"></i> Frozen Peak
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">A mountaintop covered in eternal ice with frost spirits.</p>
                        <p className="text-xs mt-2 text-gray-600">Levels 12-18 recommended</p>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer transition-all ${selectedArea === "thunder-peak" ? "ring-2 ring-indigo-500" : ""}`}
                      onClick={() => setSelectedArea("thunder-peak")}
                    >
                      <CardHeader className="bg-indigo-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-bolt mr-2"></i> Thunder Peak
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">A high mountain constantly struck by lightning.</p>
                        <p className="text-xs mt-2 text-gray-600">Levels 15-20 recommended</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card 
                      className={`cursor-pointer transition-all ${selectedArea === "flame-desert" ? "ring-2 ring-red-500" : ""}`}
                      onClick={() => setSelectedArea("flame-desert")}
                    >
                      <CardHeader className="bg-red-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-fire mr-2"></i> Flame Desert
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">A scorching desert with fire elementals and beasts.</p>
                        <p className="text-xs mt-2 text-gray-600">Levels 15-25 recommended</p>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer transition-all ${selectedArea === "great-river" ? "ring-2 ring-blue-500" : ""}`}
                      onClick={() => setSelectedArea("great-river")}
                      style={{ opacity: game.cultivationLevel >= 20 ? 1 : 0.5 }}
                    >
                      <CardHeader className="bg-blue-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-water mr-2"></i> Great River
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">Home to powerful water creatures including dragons.</p>
                        <p className="text-xs mt-2 text-gray-600">Levels 20+ required</p>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer transition-all ${selectedArea === "tiger-mountain" ? "ring-2 ring-amber-500" : ""}`}
                      onClick={() => setSelectedArea("tiger-mountain")}
                      style={{ opacity: game.cultivationLevel >= 25 ? 1 : 0.5 }}
                    >
                      <CardHeader className="bg-amber-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-paw mr-2"></i> Tiger Mountain
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">The domain of ancient tiger spirits with great power.</p>
                        <p className="text-xs mt-2 text-gray-600">Levels 25+ required</p>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer transition-all ${selectedArea === "dragon-volcano" ? "ring-2 ring-rose-500" : ""}`}
                      onClick={() => setSelectedArea("dragon-volcano")}
                      style={{ opacity: game.cultivationLevel >= 35 ? 1 : 0.5 }}
                    >
                      <CardHeader className="bg-rose-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-dragon mr-2"></i> Dragon Volcano
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">The lair of the Fire Dragon King. Extremely dangerous.</p>
                        <p className="text-xs mt-2 text-gray-600">Levels 35+ required</p>
                        <p className="text-xs mt-1 text-red-500 font-semibold">Boss Location</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Enemy Selection */}
            <h2 className="text-xl font-medium mb-4">Choose Your Opponent</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {getAreaEnemies().map((enemyId: string) => {
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
              <Card className={`bg-white shadow-md relative ${attackTarget === "player" && "overflow-hidden"}`}>
                {attackTarget === "player" && damageEffect && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-red-500 bg-opacity-30 z-10"
                  />
                )}
                {attackAnimation === "enemy-attack" && attackTarget === "player" && (
                  <motion.div 
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center z-20"
                  >
                    <div className="text-4xl text-red-500 font-bold">💥</div>
                  </motion.div>
                )}
                {herbAnimating && (
                  <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center z-20"
                  >
                    <div className="text-4xl text-green-500 font-bold">🌿</div>
                  </motion.div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>{game.characterName}</span>
                    {/* Herbs button */}
                    {combatStatus === "fighting" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs"
                        onClick={() => setShowHerbPanel(!showHerbPanel)}
                      >
                        <i className="fas fa-leaf text-green-500 mr-1"></i> Herbs
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Herb Selection Panel */}
                  {showHerbPanel && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md"
                    >
                      <h3 className="text-sm font-medium mb-2 text-green-700">Healing Herbs</h3>
                      {getHealingHerbs(game.inventory || {}).length === 0 ? (
                        <p className="text-xs text-gray-500">No healing herbs in inventory</p>
                      ) : (
                        <div className="space-y-2">
                          {getHealingHerbs(game.inventory || {}).map(herb => (
                            <motion.div 
                              key={herb.id}
                              whileHover={{ scale: 1.02 }}
                              className={`p-2 border ${herbAnimating === herb.id ? 'border-green-500 bg-green-100' : 'border-gray-200'} rounded-md cursor-pointer`}
                              onClick={() => useHerb(herb.id)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-sm font-medium">{herb.data.name}</div>
                                  <div className="text-xs text-gray-600">Heals {herb.data.effects.health} HP</div>
                                </div>
                                <div className="text-xs bg-green-100 px-2 py-1 rounded">
                                  {herb.count || 0}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Health</span>
                      <span>{game.health} / {game.maxHealth}</span>
                    </div>
                    <Progress 
                      value={(game.health / game.maxHealth) * 100} 
                      className="h-2 [&>div]:bg-red-500"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Qi</span>
                      <span>{Math.floor(game.energy)} / {game.maxCultivationProgress}</span>
                    </div>
                    <Progress 
                      value={(game.energy / game.maxCultivationProgress) * 100} 
                      className="h-2 [&>div]:bg-blue-500"
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
                <Card className={`bg-white shadow-md relative ${attackTarget === "enemy" && "overflow-hidden"}`}>
                  {attackTarget === "enemy" && damageEffect && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-red-500 bg-opacity-30 z-10"
                    />
                  )}
                  {attackAnimation && attackTarget === "enemy" && (
                    <motion.div 
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 100, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center z-20"
                    >
                      <div className="text-4xl text-primary font-bold">⚔️</div>
                    </motion.div>
                  )}
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
                        className="h-2 [&>div]:bg-red-500"
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