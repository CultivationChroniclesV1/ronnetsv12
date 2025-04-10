import { useState, useEffect } from "react";
import { useGameEngine } from "@/lib/gameEngine";
import { ENEMIES, MARTIAL_ARTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Enemy = {
  id: string;
  name: string;
  description: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
};

// Define the possible reward structure
type EnemyRewards = {
  experience: number;
  spiritualStones: number;
  gold?: number;
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
  
  // Add health regeneration system (5% of max HP every 2 seconds during combat)
  useEffect(() => {
    // Setup HP regeneration only during combat
    if (combatStatus === "fighting") {
      const healthRegenInterval = setInterval(() => {
        if (game.health < game.maxHealth) {
          const regenAmount = Math.ceil(game.maxHealth * 0.05); // 5% of max health
          updateGameState(state => ({
            ...state,
            health: Math.min(state.maxHealth, state.health + regenAmount)
          }));
          
          // Log health regeneration only if significant amount
          if (regenAmount > 10) {
            setCombatLog(prev => [...prev, `You recovered ${regenAmount} health from natural regeneration.`]);
          }
        }
      }, 2000); // Every 2 seconds as requested
      
      // Cleanup interval on unmount or when combat ends
      return () => clearInterval(healthRegenInterval);
    }
  }, [game.maxHealth, combatStatus, game.health]);

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
  
  // Get the location difficulty multiplier
  const getLocationDifficultyMultiplier = (area: string): number => {
    const locationDifficulty: Record<string, number> = {
      "forest": 1,      // Base level difficulty
      "city": 2,        // 2x as difficult as forest
      "mountain": 3,    // 3x as difficult as forest
      "poison-marsh": 4, // 4x as difficult as forest
      "jade-valley": 5, // 5x as difficult as forest
      "ruins": 6,       // 6x as difficult as forest
      "flame-desert": 8, // 8x as difficult as forest
      "frozen-peak": 10  // 10x as difficult as forest
    };
    
    return locationDifficulty[area] || 1;
  };
  
  // Generate a unique name for the enemy based on its type and random modifiers
  const generateUniqueEnemyName = (baseEnemyId: string, baseEnemyName: string): string => {
    // Arrays of modifiers to create unique enemy names
    const prefixes = [
      "Elder", "Young", "Ancient", "Ferocious", "Deadly", "Savage", "Venomous", "Spiritual", 
      "Corrupted", "Wild", "Fierce", "Enraged", "Wounded", "Giant", "Tiny", "Starving",
      "Shadow", "Blood", "Jade", "Golden", "Azure", "Crimson", "Obsidian", "Verdant"
    ];
    
    const suffixes = [
      "of the Forest", "of the Mountains", "of the Valley", "Hunter", "Stalker", 
      "Killer", "Predator", "Champion", "Alpha", "Omega", "Matriarch", "Patriarch",
      "Lord", "Master", "King", "Queen", "Guardian", "Protector", "Slayer"
    ];
    
    // Specific name templates for certain enemy types
    const specialNames: Record<string, string[]> = {
      "wolf": ["Moonfang", "Shadowpelt", "Nighthowler", "Steelclaw", "Frostbite", "Bloodmaw"],
      "snake": ["Venomfang", "Slitherlash", "Poisontail", "Deathcoil", "Stonescale"],
      "bear": ["Ironhide", "Thunderpaw", "Bonecrusher", "Mountainshaker", "Honeyseeker"],
      "tiger": ["Razorstripe", "Bloodstreak", "Shadowclaw", "Emberfur", "Stormpouncer"],
      "eagle": ["Skyrender", "Stormwing", "Talonshriek", "Cloudrider", "Windcutter"],
      "bandit": ["Red Blade", "Silent Shadow", "Black Dagger", "Night Phantom", "Cutthroat"],
      "demon": ["Soul Harvester", "Dream Eater", "Blood Thirster", "Mind Breaker", "Flesh Ripper"]
    };
    
    // 50% chance to use a special name if available
    if (specialNames[baseEnemyId] && Math.random() > 0.5) {
      const specialName = specialNames[baseEnemyId][Math.floor(Math.random() * specialNames[baseEnemyId].length)];
      return `${specialName} the ${baseEnemyName}`;
    }
    
    // Otherwise create a random name with prefix/suffix
    const prefix = Math.random() > 0.3 ? prefixes[Math.floor(Math.random() * prefixes.length)] : "";
    const suffix = Math.random() > 0.3 ? suffixes[Math.floor(Math.random() * suffixes.length)] : "";
    
    if (prefix && suffix) {
      return `${prefix} ${baseEnemyName} ${suffix}`;
    } else if (prefix) {
      return `${prefix} ${baseEnemyName}`;
    } else if (suffix) {
      return `${baseEnemyName} ${suffix}`;
    } else {
      // If no modifiers were selected, add "Wild" prefix to ensure some uniqueness
      return `Wild ${baseEnemyName}`;
    }
  };

  // Start combat with the selected enemy
  const startCombat = (enemyId: string) => {
    const enemyData = ENEMIES[enemyId as keyof typeof ENEMIES];
    
    // Get the multiplier for the current area
    const multiplier = getLocationDifficultyMultiplier(selectedArea);
    
    // Generate a unique enemy name
    const uniqueName = generateUniqueEnemyName(enemyId, enemyData.name);
    
    // Create the enemy with stats scaled by location difficulty
    // For enemy HP we scale it much higher to make combat more challenging
    // Beginners should have 500-800 HP, then intermediate 2x more, advanced 2x again
    const baseHealth = enemyData.health;
    const scaledBaseHealth = baseHealth >= 50 && baseHealth <= 100 ? 
                            Math.floor(500 + Math.random() * 300) : // Beginner enemies (500-800 HP)
                            baseHealth; // Keep any other values as a fallback
                            
    const hpMultiplier = multiplier <= 2 ? 1 : // Beginner areas (use base 500-800)
                         multiplier <= 5 ? 2 : // Intermediate areas (2x)
                         4; // Advanced areas (4x = 2x intermediate)
    
    const newEnemy: Enemy = {
      id: enemyId,
      name: uniqueName,
      description: enemyData.description,
      health: Math.round(scaledBaseHealth * hpMultiplier),
      maxHealth: Math.round(scaledBaseHealth * hpMultiplier),
      attack: Math.round(enemyData.attack * multiplier * 5), // Significantly increased damage scaling
      defense: Math.round(enemyData.defense * multiplier)
    };
    
    setEnemy(newEnemy);
    setCombatStatus("fighting");
    setCombatLog([`You encounter ${uniqueName}!`]);
    
    // Initialize cooldowns
    const initialCooldowns: Record<string, number> = {};
    Object.keys(game.martialArts).forEach(id => initialCooldowns[id] = 0);
    setCooldowns(initialCooldowns);
  };

  // Define herb type interface
  interface Herb {
    id: string;
    name: string;
    description: string;
    quality: number;
    quantity: number;
    value: number;
    icon: string;
    effects: Record<string, number>;
  }

  // Generate random herb drops based on enemy and location
  const generateHerbDrops = (): Herb | null => {
    // Chance to drop a herb (60%)
    if (Math.random() > 0.4) {
      // Basic herb types
      const herbTypes: Herb[] = [
        {
          id: "minor-healing-herb",
          name: "Minor Healing Herb",
          description: "A common herb with minor healing properties",
          quality: 1,
          quantity: 1,
          value: 10,
          icon: "leaf-oak",
          effects: { "healing": 20 }
        },
        {
          id: "qi-replenishing-grass",
          name: "Qi Replenishing Grass",
          description: "A plant that helps restore spiritual energy",
          quality: 1,
          quantity: 1,
          value: 15,
          icon: "sprout",
          effects: { "qi-recovery": 15 }
        },
        {
          id: "spirit-mushroom",
          name: "Spirit Mushroom",
          description: "A mushroom that enhances spiritual perception",
          quality: 2,
          quantity: 1,
          value: 25,
          icon: "flower",
          effects: { "qi-recovery": 25 }
        },
        {
          id: "blood-flower",
          name: "Blood Flower",
          description: "A rare flower that can rapidly restore health",
          quality: 3,
          quantity: 1,
          value: 50,
          icon: "flower-lotus",
          effects: { "healing": 50 }
        },
        {
          id: "five-element-fruit",
          name: "Five Element Fruit",
          description: "A rare fruit that enhances all attributes",
          quality: 4,
          quantity: 1,
          value: 100,
          icon: "gem",
          effects: { "attribute-boost": 1 }
        }
      ];
      
      // Determine herb quality based on location difficulty
      const multiplier = getLocationDifficultyMultiplier(selectedArea);
      let herbPool = herbTypes;
      
      // Filter herbs based on difficulty
      if (multiplier >= 5) {
        // Higher difficulty areas can drop better herbs
        herbPool = herbTypes.filter(herb => herb.quality >= 2);
      } else if (multiplier >= 3) {
        // Medium difficulty areas drop mid-tier herbs
        herbPool = herbTypes.filter(herb => herb.quality >= 1 && herb.quality <= 3);
      } else {
        // Lowest areas only drop basic herbs
        herbPool = herbTypes.filter(herb => herb.quality <= 2);
      }
      
      // Select a random herb
      const selectedHerb = herbPool[Math.floor(Math.random() * herbPool.length)];
      
      // Amount can vary based on difficulty
      const amount = Math.floor(Math.random() * multiplier) + 1;
      
      return {
        ...selectedHerb,
        quantity: amount
      };
    }
    
    return null;
  };

  // Handle player victory
  const handleVictory = () => {
    if (!enemy) return;
    
    setCombatStatus("victory");
    
    // Get enemy rewards
    const enemyData = ENEMIES[enemy.id as keyof typeof ENEMIES];
    const rewards = enemyData.rewards as EnemyRewards;
    
    // Get location multiplier to scale rewards
    const multiplier = getLocationDifficultyMultiplier(selectedArea);
    
    // Scale rewards based on location difficulty
    const scaledExperience = Math.round(rewards.experience * (multiplier * 0.7)); // Scale experience a bit less
    const scaledSpiritualStones = Math.round(rewards.spiritualStones * multiplier);
    const scaledGold = rewards.gold ? Math.round(rewards.gold * multiplier) : 0;
    
    // Generate herb drops
    const herbDrop = generateHerbDrops();
    
    // Add rewards to log
    setCombatLog(prev => {
      const rewardText = [
        `You defeated ${enemy.name}!`,
        `Gained ${scaledExperience} cultivation experience and ${scaledSpiritualStones} spiritual stones.`
      ];
      
      // Add gold reward to log if it exists
      if (scaledGold > 0) {
        rewardText.push(`Earned ${scaledGold} gold coins.`);
      }
      
      // Add herb drop to log if any
      if (herbDrop) {
        rewardText.push(`Found ${herbDrop.quantity} ${herbDrop.name}!`);
      }
      
      return [...prev, ...rewardText];
    });
    
    // Update game state with rewards
    updateGameState(state => {
      // Calculate new cultivation progress
      const newProgress = state.cultivationProgress + scaledExperience;
      
      // Prepare updated state
      const updatedState = {
        ...state,
        // Add spiritual stones
        spiritualStones: state.spiritualStones + scaledSpiritualStones,
        // Add gold
        gold: state.gold + scaledGold,
        // Add cultivation progress
        cultivationProgress: Math.min(state.maxCultivationProgress, newProgress),
        // If health is less than 50%, heal a bit
        health: state.health < state.maxHealth * 0.5 
          ? Math.min(state.maxHealth, state.health + Math.floor(state.maxHealth * 0.2))
          : state.health
      };
      
      // Add herb to inventory if one was dropped
      if (herbDrop) {
        // Ensure inventory and herbs collection exists
        if (!updatedState.inventory) {
          updatedState.inventory = {
            resources: {},
            herbs: {},
            weapons: {},
            apparel: {},
            artifacts: {}
          };
        }
        
        if (!updatedState.inventory.herbs) {
          updatedState.inventory.herbs = {};
        }
        
        // Check if herb already exists in inventory
        if (updatedState.inventory.herbs[herbDrop.id]) {
          // Increase quantity
          updatedState.inventory.herbs[herbDrop.id].quantity += herbDrop.quantity;
        } else {
          // Add new herb
          updatedState.inventory.herbs[herbDrop.id] = herbDrop;
        }
      }
      
      return updatedState;
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

  // Define area types for TypeScript type safety
  type AreaName = 
    | "forest" 
    | "city" 
    | "mountain" 
    | "poison-marsh"
    | "jade-valley" 
    | "ruins" 
    | "frozen-peak" 
    | "thunder-peak" 
    | "flame-desert" 
    | "great-river" 
    | "tiger-mountain" 
    | "dragon-volcano";

  // Define level requirements for each area - Scaled up to level 100
  const getAreaRequirements = (): Record<AreaName, number> => {
    return {
      "forest": 1,           // Beginners
      "city": 5,             // Level 5+
      "mountain": 10,        // Level 10+
      "poison-marsh": 15,    // Level 15+
      "jade-valley": 20,     // Level 20+
      "ruins": 25,           // Level 25+
      "frozen-peak": 30,     // Level 30+
      "thunder-peak": 40,    // Level 40+
      "flame-desert": 50,    // Level 50+
      "great-river": 65,     // Level 65+
      "tiger-mountain": 80,  // Level 80+
      "dragon-volcano": 100  // Level 100+
    };
  };
  
  // Check if player meets level requirements for an area
  const canAccessArea = (area: string): boolean => {
    const requirements = getAreaRequirements();
    // Type guard to ensure area is a valid key
    const isValidArea = (x: string): x is AreaName => 
      Object.keys(requirements).includes(x);
    
    if (isValidArea(area)) {
      return game.cultivationLevel >= requirements[area];
    }
    return true; // Default to accessible if area name is unknown
  };
  
  // Get area display style based on player access
  const getAreaDisplayStyle = (area: string) => {
    if (canAccessArea(area)) {
      return {
        opacity: 1,
        filter: "none",
        cursor: "pointer",
        position: "relative" as const
      };
    } else {
      return {
        opacity: 0.7,
        filter: "blur(1px)",
        cursor: "not-allowed",
        position: "relative" as const
      };
    }
  };

  // Handle area selection with level check
  const handleAreaSelection = (area: string) => {
    if (canAccessArea(area)) {
      setSelectedArea(area);
    } else {
      const requirements = getAreaRequirements();
      // Type guard to ensure area is a valid key for toast message
      const isValidArea = (x: string): x is AreaName => 
        Object.keys(requirements).includes(x);
      
      const requiredLevel = isValidArea(area) 
        ? requirements[area] 
        : 1;
        
      toast({
        title: "Area Locked",
        description: `You need to be at least level ${requiredLevel} to access this area.`,
        variant: "destructive"
      });
    }
  };

  // Function to use herbs during combat
  const useHerb = (herbId: string) => {
    if (!game.inventory?.herbs || !game.inventory.herbs[herbId]) {
      setCombatLog(prev => [...prev, "This herb is not in your inventory!"]);
      return;
    }
    
    const herb = game.inventory.herbs[herbId];
    
    if (herb.quantity <= 0) {
      setCombatLog(prev => [...prev, `You don't have any ${herb.name} left!`]);
      return;
    }
    
    // Apply herb effects
    updateGameState(state => {
      const updatedState = {...state};
      
      // Healing herbs
      if (herb.effects.healing) {
        const healAmount = Math.ceil(state.maxHealth * (herb.effects.healing / 100));
        updatedState.health = Math.min(state.maxHealth, state.health + healAmount);
        setCombatLog(prev => [...prev, `You used ${herb.name} and recovered ${healAmount} health!`]);
      }
      
      // Qi recovery herbs
      if (herb.effects["qi-recovery"]) {
        // Use the regular energy cap as the maxEnergy
        const qiAmount = Math.ceil(state.energy * 2 * (herb.effects["qi-recovery"] / 100));
        updatedState.energy = Math.min(state.energy * 2, state.energy + qiAmount);
        setCombatLog(prev => [...prev, `You used ${herb.name} and recovered ${qiAmount} Qi!`]);
      }
      
      // Attribute boost (not implemented in detail here)
      if (herb.effects["attribute-boost"]) {
        setCombatLog(prev => [...prev, `You used ${herb.name} and temporarily boosted your attributes!`]);
      }
      
      // Update inventory
      if (!updatedState.inventory) {
        updatedState.inventory = {
          resources: {},
          herbs: {},
          weapons: {},
          apparel: {},
          artifacts: {}
        };
      }
      if (!updatedState.inventory.herbs) updatedState.inventory.herbs = {};
      
      // Decrement quantity
      updatedState.inventory.herbs[herbId] = {
        ...herb,
        quantity: herb.quantity - 1
      };
      
      // Remove herb if quantity is 0
      if (updatedState.inventory.herbs[herbId].quantity <= 0) {
        delete updatedState.inventory.herbs[herbId];
      }
      
      return updatedState;
    });
  };
  
  // Current available techniques
  const availableTechniques = Object.entries(game.martialArts)
    .filter(([id, technique]) => technique.unlocked);
    
  // Available herbs that can be used in combat
  const availableHerbs = game.inventory?.herbs ? 
    Object.entries(game.inventory.herbs)
      .filter(([_, herb]) => herb.quantity > 0)
    : [];

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
                      className={`transition-all ${selectedArea === "forest" ? "ring-2 ring-green-500" : ""} ${canAccessArea("forest") ? "cursor-pointer" : "cursor-not-allowed"}`}
                      onClick={() => handleAreaSelection("forest")}
                      style={getAreaDisplayStyle("forest")}
                    >
                      <CardHeader className="bg-green-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-tree mr-2"></i> Spirit Forest
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">A mystical forest with spiritual beasts.</p>
                        <p className="text-xs mt-2 text-gray-600">Level 1+ required</p>
                      </CardContent>
                      {!canAccessArea("forest") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md">
                          <i className="fas fa-lock text-4xl text-white opacity-80"></i>
                        </div>
                      )}
                    </Card>
                    
                    <Card 
                      className={`transition-all ${selectedArea === "city" ? "ring-2 ring-blue-500" : ""} ${canAccessArea("city") ? "cursor-pointer" : "cursor-not-allowed"}`}
                      onClick={() => handleAreaSelection("city")}
                      style={getAreaDisplayStyle("city")}
                    >
                      <CardHeader className="bg-blue-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-city mr-2"></i> City Outskirts
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">Encounter bandits and rogue cultivators.</p>
                        <p className="text-xs mt-2 text-gray-600">Level 5+ required</p>
                      </CardContent>
                      {!canAccessArea("city") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md">
                          <i className="fas fa-lock text-4xl text-white opacity-80"></i>
                        </div>
                      )}
                    </Card>
                    
                    <Card 
                      className={`transition-all ${selectedArea === "mountain" ? "ring-2 ring-yellow-500" : ""} ${canAccessArea("mountain") ? "cursor-pointer" : "cursor-not-allowed"}`}
                      onClick={() => handleAreaSelection("mountain")}
                      style={getAreaDisplayStyle("mountain")}
                    >
                      <CardHeader className="bg-yellow-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-mountain mr-2"></i> Azure Mountains
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">Home to powerful beasts and flying creatures.</p>
                        <p className="text-xs mt-2 text-gray-600">Level 10+ required</p>
                      </CardContent>
                      {!canAccessArea("mountain") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md">
                          <i className="fas fa-lock text-4xl text-white opacity-80"></i>
                        </div>
                      )}
                    </Card>
                    
                    <Card 
                      className={`transition-all ${selectedArea === "poison-marsh" ? "ring-2 ring-green-700" : ""} ${canAccessArea("poison-marsh") ? "cursor-pointer" : "cursor-not-allowed"}`}
                      onClick={() => handleAreaSelection("poison-marsh")}
                      style={getAreaDisplayStyle("poison-marsh")}
                    >
                      <CardHeader className="bg-green-700 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-skull-crossbones mr-2"></i> Poison Marsh
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">A dangerous swamp filled with venomous creatures.</p>
                        <p className="text-xs mt-2 text-gray-600">Level 5+ required</p>
                      </CardContent>
                      {!canAccessArea("poison-marsh") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md">
                          <i className="fas fa-lock text-4xl text-white opacity-80"></i>
                        </div>
                      )}
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="intermediate">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card 
                      className={`transition-all ${selectedArea === "jade-valley" ? "ring-2 ring-emerald-500" : ""} ${canAccessArea("jade-valley") ? "cursor-pointer" : "cursor-not-allowed"}`}
                      onClick={() => handleAreaSelection("jade-valley")}
                      style={getAreaDisplayStyle("jade-valley")}
                    >
                      <CardHeader className="bg-emerald-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-gem mr-2"></i> Jade Valley
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">A valley rich with jade essence and mineral spirits.</p>
                        <p className="text-xs mt-2 text-gray-600">Level 20+ required</p>
                      </CardContent>
                      {!canAccessArea("jade-valley") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md">
                          <i className="fas fa-lock text-4xl text-white opacity-80"></i>
                        </div>
                      )}
                    </Card>
                    
                    <Card 
                      className={`transition-all ${selectedArea === "ruins" ? "ring-2 ring-purple-500" : ""} ${canAccessArea("ruins") ? "cursor-pointer" : "cursor-not-allowed"}`}
                      onClick={() => handleAreaSelection("ruins")}
                      style={getAreaDisplayStyle("ruins")}
                    >
                      <CardHeader className="bg-purple-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-dungeon mr-2"></i> Ancient Ruins
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">Face guardians and demons of the ruins.</p>
                        <p className="text-xs mt-2 text-gray-600">Level 25+ required</p>
                      </CardContent>
                      {!canAccessArea("ruins") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md">
                          <i className="fas fa-lock text-4xl text-white opacity-80"></i>
                        </div>
                      )}
                    </Card>
                    
                    <Card 
                      className={`transition-all ${selectedArea === "frozen-peak" ? "ring-2 ring-blue-300" : ""} ${canAccessArea("frozen-peak") ? "cursor-pointer" : "cursor-not-allowed"}`}
                      onClick={() => handleAreaSelection("frozen-peak")}
                      style={getAreaDisplayStyle("frozen-peak")}
                    >
                      <CardHeader className="bg-blue-400 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-snowflake mr-2"></i> Frozen Peak
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">A mountaintop covered in eternal ice with frost spirits.</p>
                        <p className="text-xs mt-2 text-gray-600">Level 10+ required</p>
                      </CardContent>
                      {!canAccessArea("frozen-peak") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md">
                          <i className="fas fa-lock text-4xl text-white opacity-80"></i>
                        </div>
                      )}
                    </Card>
                    
                    <Card 
                      className={`transition-all ${selectedArea === "thunder-peak" ? "ring-2 ring-indigo-500" : ""} ${canAccessArea("thunder-peak") ? "cursor-pointer" : "cursor-not-allowed"}`}
                      onClick={() => handleAreaSelection("thunder-peak")}
                      style={getAreaDisplayStyle("thunder-peak")}
                    >
                      <CardHeader className="bg-indigo-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-bolt mr-2"></i> Thunder Peak
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">A high mountain constantly struck by lightning.</p>
                        <p className="text-xs mt-2 text-gray-600">Level 40+ required</p>
                      </CardContent>
                      {!canAccessArea("thunder-peak") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md">
                          <i className="fas fa-lock text-4xl text-white opacity-80"></i>
                        </div>
                      )}
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card 
                      className={`transition-all ${selectedArea === "flame-desert" ? "ring-2 ring-red-500" : ""} ${canAccessArea("flame-desert") ? "cursor-pointer" : "cursor-not-allowed"}`}
                      onClick={() => handleAreaSelection("flame-desert")}
                      style={getAreaDisplayStyle("flame-desert")}
                    >
                      <CardHeader className="bg-red-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-fire mr-2"></i> Flame Desert
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">A scorching desert with fire elementals and beasts.</p>
                        <p className="text-xs mt-2 text-gray-600">Level 50+ required</p>
                      </CardContent>
                      {!canAccessArea("flame-desert") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md">
                          <i className="fas fa-lock text-4xl text-white opacity-80"></i>
                        </div>
                      )}
                    </Card>
                    
                    <Card 
                      className={`transition-all ${selectedArea === "great-river" ? "ring-2 ring-blue-500" : ""} ${canAccessArea("great-river") ? "cursor-pointer" : "cursor-not-allowed"}`}
                      onClick={() => handleAreaSelection("great-river")}
                      style={getAreaDisplayStyle("great-river")}
                    >
                      <CardHeader className="bg-blue-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-water mr-2"></i> Great River
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">Home to powerful water creatures including dragons.</p>
                        <p className="text-xs mt-2 text-gray-600">Level 65+ required</p>
                      </CardContent>
                      {!canAccessArea("great-river") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md">
                          <i className="fas fa-lock text-4xl text-white opacity-80"></i>
                        </div>
                      )}
                    </Card>
                    
                    <Card 
                      className={`transition-all ${selectedArea === "tiger-mountain" ? "ring-2 ring-amber-500" : ""} ${canAccessArea("tiger-mountain") ? "cursor-pointer" : "cursor-not-allowed"}`}
                      onClick={() => handleAreaSelection("tiger-mountain")}
                      style={getAreaDisplayStyle("tiger-mountain")}
                    >
                      <CardHeader className="bg-amber-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-paw mr-2"></i> Tiger Mountain
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">The domain of ancient tiger spirits with great power.</p>
                        <p className="text-xs mt-2 text-gray-600">Level 80+ required</p>
                      </CardContent>
                      {!canAccessArea("tiger-mountain") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md">
                          <i className="fas fa-lock text-4xl text-white opacity-80"></i>
                        </div>
                      )}
                    </Card>
                    
                    <Card 
                      className={`transition-all ${selectedArea === "dragon-volcano" ? "ring-2 ring-rose-500" : ""} ${canAccessArea("dragon-volcano") ? "cursor-pointer" : "cursor-not-allowed"}`}
                      onClick={() => handleAreaSelection("dragon-volcano")}
                      style={getAreaDisplayStyle("dragon-volcano")}
                    >
                      <CardHeader className="bg-rose-600 text-white py-3">
                        <CardTitle className="text-lg flex items-center">
                          <i className="fas fa-dragon mr-2"></i> Dragon Volcano
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm">The lair of the Fire Dragon King. Extremely dangerous.</p>
                        <p className="text-xs mt-2 text-gray-600">Level 100+ required</p>
                        <p className="text-xs mt-1 text-red-500 font-semibold">Boss Location</p>
                      </CardContent>
                      {!canAccessArea("dragon-volcano") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md">
                          <i className="fas fa-lock text-4xl text-white opacity-80"></i>
                        </div>
                      )}
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
                <Card className="bg-white shadow-md animate-slide-in-left relative overflow-hidden">
                  <div className={`absolute inset-0 bg-red-500 opacity-20 ${combatStatus === "fighting" ? "animate-pulse-slow" : ""}`}></div>
                  <CardHeader className="pb-2 relative">
                    <CardTitle className="text-lg flex items-center">
                      <span className="inline-block w-5 h-5 mr-2 rounded-full bg-red-500 animate-pulse-slow"></span>
                      {enemy.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold text-red-600">Health</span>
                        <span className="animate-pulse-slow">{enemy.health} / {enemy.maxHealth}</span>
                      </div>
                      <Progress 
                        value={(enemy.health / enemy.maxHealth) * 100} 
                        className="h-2 [&>div]:bg-red-500 [&>div]:animate-pulse-slow"
                      />
                    </div>
                    
                    <p className="text-sm mb-4 italic">{enemy.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-red-50 p-2 rounded-md shadow-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <p className="font-medium text-red-700">Attack</p>
                        <p className="text-lg font-bold">{enemy.attack}</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-md shadow-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
                        <p className="font-medium text-blue-700">Defense</p>
                        <p className="text-lg font-bold">{enemy.defense}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Combat Log */}
            <Card className="bg-white shadow-md mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle className="text-lg flex items-center">
                  <span className="inline-block w-4 h-4 mr-2 rounded-full bg-primary animate-ping-slow"></span>
                  Combat Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 overflow-y-auto p-3 bg-gray-50 rounded shadow-inner text-sm">
                  {combatLog.map((log, index) => {
                    // Style different types of log messages differently
                    let className = "mb-2 transition-opacity animate-fade-in";
                    
                    if (log.includes("encounter")) {
                      className += " text-purple-700 font-semibold";
                    } else if (log.includes("defeated")) {
                      className += " text-green-700 font-semibold";
                    } else if (log.includes("defeated!") || log.includes("been defeated")) {
                      className += " text-red-700 font-semibold";
                    } else if (log.includes("use") && log.includes("technique")) {
                      className += " text-blue-700";
                    } else if (log.includes("deal")) {
                      className += " text-orange-700";
                    } else if (log.includes("recovered") || log.includes("healing")) {
                      className += " text-green-700";
                    } else if (log.includes("Gained")) {
                      className += " text-green-700 font-medium";
                    } else if (log.includes("cooldown")) {
                      className += " text-gray-500 italic";
                    }
                    
                    return (
                      <p key={index} className={className} style={{ animationDelay: `${0.1 * (combatLog.length - index)}s` }}>
                        {log}
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Combat Actions */}
            {combatStatus === "fighting" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Martial Techniques Card */}
                <Card className="bg-white shadow-md mb-6 animate-slide-in-bottom" style={{ animationDelay: '0.5s' }}>
                  <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle className="text-lg flex items-center">
                      <span className="inline-block w-4 h-4 mr-2 rounded-full bg-primary animate-pulse-slow"></span>
                      Martial Techniques
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      {availableTechniques.map(([id, technique], index) => (
                        <Button
                          key={id}
                          onClick={() => useTechnique(id)}
                          disabled={cooldowns[id] > 0 || game.energy < technique.cost}
                          className={`justify-start relative overflow-hidden transition-all transform hover:scale-105 ${cooldowns[id] > 0 ? 'opacity-70' : 'animate-bounce-soft hover:shadow-md'}`}
                          style={{ 
                            animationDelay: `${0.2 * index}s`,
                            animationDuration: '4s'
                          }}
                          variant={cooldowns[id] > 0 ? "outline" : "default"}
                        >
                          {cooldowns[id] > 0 && (
                            <div className="absolute inset-0 bg-gray-200 bg-opacity-40 flex items-center justify-center">
                              <span className="font-bold text-xl text-primary animate-pulse-slow">{cooldowns[id]}s</span>
                            </div>
                          )}
                          <span className="truncate mr-2 font-medium">{technique.name}</span>
                          <span className="ml-auto text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                            {technique.cost} Qi
                          </span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Herbs Card */}
                <Card className="bg-white shadow-md mb-6 animate-slide-in-bottom" style={{ animationDelay: '0.7s' }}>
                  <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-green-100">
                    <CardTitle className="text-lg flex items-center">
                      <span className="inline-block w-4 h-4 mr-2 rounded-full bg-green-500 animate-pulse-slow"></span>
                      Herbs & Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {availableHerbs.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {availableHerbs.map(([id, herb], index) => {
                          // Determine herb type and assign color
                          let herbColor = "green";
                          let herbEffect = "Healing";
                          
                          if (herb.effects["qi-recovery"]) {
                            herbColor = "blue";
                            herbEffect = "Qi Recovery";
                          } else if (herb.effects["attribute-boost"]) {
                            herbColor = "purple";
                            herbEffect = "Attribute Boost";
                          }
                          
                          return (
                            <Button
                              key={id}
                              onClick={() => useHerb(id)}
                              className={`justify-start relative overflow-hidden transition-all transform hover:scale-105 hover:shadow-md animate-fade-in`}
                              style={{ animationDelay: `${0.2 * index + 0.5}s` }}
                              variant="outline"
                            >
                              <div className={`absolute top-0 left-0 h-full w-1 bg-${herbColor}-500`}></div>
                              <div className="flex items-center w-full">
                                <div className={`mr-3 h-8 w-8 rounded-full bg-${herbColor}-100 flex items-center justify-center text-${herbColor}-600 animate-pulse-slow`}>
                                  <span className="text-lg">🌿</span>
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">{herb.name}</div>
                                  <div className="text-xs text-gray-500">{herbEffect}</div>
                                </div>
                                <div className={`ml-auto px-2 py-1 rounded-full bg-${herbColor}-100 text-${herbColor}-600 text-xs font-medium`}>
                                  x{herb.quantity}
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                        <div className="text-6xl mb-4 animate-bounce-soft">🌱</div>
                        <p className="text-gray-500 text-sm">
                          No herbs available yet. Defeat enemies to find herbs!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
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