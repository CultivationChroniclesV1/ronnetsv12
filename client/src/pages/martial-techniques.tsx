import React, { useState, useEffect } from 'react';
import { useGameEngine } from '@/lib/gameEngine';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { formatNumber } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// Define the martial technique interface
interface MartialTechnique {
  id: string;
  name: string;
  description: string;
  level: number;
  damage: number;
  cost: number; // Qi cost to use
  cooldown: number; // In seconds
  effect?: {
    type: 'lifesteal' | 'poison' | 'defense' | 'health' | 'crit' | 'dodge';
    value: number; // Percentage or flat value
    duration?: number; // In seconds, if applicable
  };
  attribute?: string; // What attribute it scales with: strength, agility, etc.
  unlocked: boolean;
  requiredLevel: number;
  upgradeCost: {
    gold: number;
    spiritualStones: number;
  };
  icon: string; // CSS class for icon
  tier: 1 | 2 | 3 | 4 | 5; // 1-5 tiers for visual grouping
  baseTechnique?: string; // Required technique to unlock this (technique ID)
  
  // Required for compatibility with existing game engine
  type: "attack" | "defense" | "utility" | "ultimate";
  maxLevel: number;
  attributeScaling: "strength" | "agility" | "endurance" | "intelligence" | "perception";
  lastUsed?: number;
}

// Define the martial techniques data
const MARTIAL_TECHNIQUES: Record<string, MartialTechnique> = {
  // Tier 1 Techniques (Levels 1-10)
  "demonic-palm-technique": {
    id: "demonic-palm-technique",
    name: "Demonic Palm Technique",
    description: "A basic palm strike technique that channels dark Qi into your palm for enhanced power.",
    level: 1,
    damage: 25,
    cost: 10,
    cooldown: 3,
    attribute: "strength",
    unlocked: false,
    requiredLevel: 2,
    upgradeCost: { gold: 50, spiritualStones: 1 },
    icon: "fa-hand-paper",
    tier: 1,
    type: "attack",
    maxLevel: 10,
    attributeScaling: "strength"
  },
  
  // Azure Dragon Palm - Already unlocked as a starting technique
  "azure-dragon-palm": {
    id: "azure-dragon-palm",
    name: "Azure Dragon Palm",
    description: "The foundation technique taught to all disciples. Channels basic Qi into a striking palm.",
    level: 1,
    damage: 20,
    cost: 5,
    cooldown: 2,
    attribute: "strength",
    unlocked: true, // Always unlocked by default
    requiredLevel: 1,
    upgradeCost: { gold: 0, spiritualStones: 0 }, // Can't be upgraded
    icon: "fa-hand-paper",
    tier: 1,
    type: "attack",
    maxLevel: 1, // Cannot be upgraded
    attributeScaling: "strength"
  },
  "serpent-strike": {
    id: "serpent-strike",
    name: "Serpent Strike",
    description: "A quick jab that targets vital points, causing additional damage over time.",
    level: 1,
    damage: 15,
    cost: 15,
    cooldown: 5,
    effect: { type: 'poison', value: 5, duration: 10 },
    type: "attack", attribute: "agility", attributeScaling: "agility",
    unlocked: false,
    requiredLevel: 3,
    upgradeCost: { gold: 100, spiritualStones: 2 },
    icon: "fa-snake",
    tier: 1, maxLevel: 10,
    type: "attack",
    maxLevel: 10,
    attributeScaling: "agility"
  },
  "iron-body-technique": {
    id: "iron-body-technique",
    name: "Iron Body Technique",
    description: "Channels Qi throughout your body to harden your skin against attacks.",
    level: 1,
    damage: 0, // No direct damage
    cost: 20,
    cooldown: 15, type: "utility",
    effect: { type: 'defense', value: 20, duration: 8 },
    type: "defense", attribute: "endurance", attributeScaling: "endurance",
    unlocked: false,
    requiredLevel: 5,
    upgradeCost: { gold: 150, spiritualStones: 3 },
    icon: "fa-shield-alt",
    tier: 1, maxLevel: 10,
    type: "attack",
    maxLevel: 10,
    attributeScaling: "agility"
  },
  "flowing-water-fist": {
    id: "flowing-water-fist",
    name: "Flowing Water Fist",
    description: "A series of fluid punches that are difficult to predict and dodge.",
    level: 1,
    damage: 20,
    cost: 12,
    cooldown: 4,
    attribute: "agility", attributeScaling: "agility",
    unlocked: false,
    requiredLevel: 7,
    upgradeCost: { gold: 200, spiritualStones: 3 },
    icon: "fa-tint",
    tier: 1, maxLevel: 10,
    type: "attack",
    maxLevel: 10,
    attributeScaling: "agility"
  },
  "qi-reinforcement": {
    id: "qi-reinforcement",
    name: "Qi Reinforcement",
    description: "Temporarily enhances your vitality by channeling Qi to strengthen your body.",
    level: 1,
    damage: 0,
    cost: 25,
    cooldown: 20, type: "utility",
    effect: { type: 'health', value: 15, duration: 10 },
    type: "utility", attribute: "endurance", attributeScaling: "endurance",
    unlocked: false,
    requiredLevel: 10,
    upgradeCost: { gold: 250, spiritualStones: 5 },
    icon: "fa-heartbeat",
    tier: 1, maxLevel: 10,
    type: "attack",
    maxLevel: 10,
    attributeScaling: "agility"
  },

  // Tier 2 Techniques (Levels 11-20)
  "five-elements-fist": {
    id: "five-elements-fist",
    name: "Five Elements Fist",
    description: "A powerful fist technique that cycles through the five elements for enhanced damage.",
    level: 1,
    damage: 40,
    cost: 30,
    cooldown: 8,
    attribute: "strength", attributeScaling: "strength",
    unlocked: false,
    requiredLevel: 12,
    upgradeCost: { gold: 400, spiritualStones: 8 },
    icon: "fa-fire",
    tier: 2, maxLevel: 15,
    baseTechnique: "azure-dragon-palm"
  },
  "venomous-snake-hand": {
    id: "venomous-snake-hand",
    name: "Venomous Snake Hand",
    description: "An advanced striking technique that injects Qi-poison into the opponent.",
    level: 1,
    damage: 25,
    cost: 35,
    cooldown: 10,
    effect: { type: 'poison', value: 12, duration: 15 },
    type: "attack", attribute: "agility", attributeScaling: "agility",
    unlocked: false,
    requiredLevel: 15,
    upgradeCost: { gold: 500, spiritualStones: 10 },
    icon: "fa-skull-crossbones",
    tier: 2, maxLevel: 15,
    baseTechnique: "serpent-strike"
  },
  "diamond-body-cultivation": {
    id: "diamond-body-cultivation",
    name: "Diamond Body Cultivation",
    description: "A superior defensive technique that makes your body as hard as diamond.",
    level: 1,
    damage: 10, // Some reflected damage
    cost: 40,
    cooldown: 25,
    effect: { type: 'defense', value: 40, duration: 12 },
    type: "defense", attribute: "endurance", attributeScaling: "endurance",
    unlocked: false,
    requiredLevel: 18,
    upgradeCost: { gold: 600, spiritualStones: 12 },
    icon: "fa-gem",
    tier: 2, maxLevel: 15,
    baseTechnique: "iron-body-technique"
  },
  "windwalker-steps": {
    id: "windwalker-steps",
    name: "Windwalker Steps",
    description: "A movement technique that greatly increases your agility and dodge chance.",
    level: 1,
    damage: 15,
    cost: 30,
    cooldown: 12,
    effect: { type: 'dodge', value: 15, duration: 8 },
    attribute: "agility", attributeScaling: "agility",
    unlocked: false,
    requiredLevel: 20,
    upgradeCost: { gold: 650, spiritualStones: 13 },
    icon: "fa-wind",
    tier: 2, maxLevel: 15,
    baseTechnique: "flowing-water-fist"
  },
  "spirit-gathering-palm": {
    id: "spirit-gathering-palm",
    name: "Spirit Gathering Palm",
    description: "A strike that absorbs the opponent's energy to heal yourself.",
    level: 1,
    damage: 30,
    cost: 35,
    cooldown: 15,
    effect: { type: 'lifesteal', value: 30, duration: 0 }, // Instant effect
    type: "attack", attribute: "intelligence", attributeScaling: "intelligence",
    unlocked: false,
    requiredLevel: 20,
    upgradeCost: { gold: 700, spiritualStones: 14 },
    icon: "fa-hand-sparkles",
    tier: 2
  },

  // Tier 3 Techniques (Levels 21-30)
  "thunderbolt-strike": {
    id: "thunderbolt-strike",
    name: "Thunderbolt Strike",
    description: "Channels Qi into a lightning-fast strike that paralyzes the opponent momentarily.",
    level: 1,
    damage: 60,
    cost: 50,
    cooldown: 20,
    attribute: "strength", attributeScaling: "strength",
    unlocked: false,
    requiredLevel: 22,
    upgradeCost: { gold: 1000, spiritualStones: 20 },
    icon: "fa-bolt",
    tier: 3, maxLevel: 20,
    baseTechnique: "five-elements-fist"
  },
  "dragon-tiger-fist": {
    id: "dragon-tiger-fist",
    name: "Dragon Tiger Fist",
    description: "A legendary martial art that combines the power of the dragon and the ferocity of the tiger.",
    level: 1,
    damage: 75,
    cost: 55,
    cooldown: 18,
    attribute: "strength", attributeScaling: "strength",
    unlocked: false,
    requiredLevel: 25,
    upgradeCost: { gold: 1200, spiritualStones: 24 },
    icon: "fa-dragon",
    tier: 3, maxLevel: 20,
    baseTechnique: "five-elements-fist"
  },
  "meridian-opening-strike": {
    id: "meridian-opening-strike",
    name: "Meridian Opening Strike",
    description: "A precise strike that targets the opponent's meridians, causing them to lose control of their Qi.",
    level: 1,
    damage: 50,
    cost: 60,
    cooldown: 25,
    effect: { type: 'poison', value: 20, duration: 20 },
    type: "attack", attribute: "agility", attributeScaling: "agility",
    unlocked: false,
    requiredLevel: 28,
    upgradeCost: { gold: 1500, spiritualStones: 30 },
    icon: "fa-bullseye",
    tier: 3, maxLevel: 20,
    baseTechnique: "venomous-snake-hand"
  },
  "jade-body-scripture": {
    id: "jade-body-scripture",
    name: "Jade Body Scripture",
    description: "An ancient cultivation technique that transforms your body to be as resilient as jade.",
    level: 1,
    damage: 20, // Some reflected damage
    cost: 70,
    cooldown: 40,
    effect: { type: 'defense', value: 60, duration: 15 },
    type: "defense", attribute: "endurance", attributeScaling: "endurance",
    unlocked: false,
    requiredLevel: 30,
    upgradeCost: { gold: 1800, spiritualStones: 36 },
    icon: "fa-shield-virus",
    tier: 3, maxLevel: 20,
    baseTechnique: "diamond-body-cultivation"
  },
  "immortal-healing-mantra": {
    id: "immortal-healing-mantra",
    name: "Immortal Healing Mantra",
    description: "A healing technique passed down from immortal practitioners that rapidly restores health.",
    level: 1,
    damage: 0,
    cost: 80,
    cooldown: 60, type: "utility", // 1 minute cooldown
    effect: { type: 'health', value: 40, duration: 0 }, // Instant heal
    type: "utility", attribute: "endurance", attributeScaling: "endurance",
    unlocked: false,
    requiredLevel: 30,
    upgradeCost: { gold: 2000, spiritualStones: 40 },
    icon: "fa-heart",
    tier: 3, maxLevel: 20,
    baseTechnique: "qi-reinforcement"
  },

  // Tier 4 Techniques (Levels 31-40)
  "heavenly-thunder-palm": {
    id: "heavenly-thunder-palm",
    name: "Heavenly Thunder Palm",
    description: "A devastating palm technique that harnesses the power of thunder to smite enemies.",
    level: 1,
    damage: 100,
    cost: 100,
    cooldown: 30,
    attribute: "strength", attributeScaling: "strength",
    unlocked: false,
    requiredLevel: 32,
    upgradeCost: { gold: 3000, spiritualStones: 60 },
    icon: "fa-cloud-bolt",
    tier: 4, maxLevel: 25,
    baseTechnique: "thunderbolt-strike"
  },
  "phantom-shadow-steps": {
    id: "phantom-shadow-steps",
    name: "Phantom Shadow Steps",
    description: "A movement technique so fast that it creates afterimages, greatly increasing dodge chance.",
    level: 1,
    damage: 40,
    cost: 90,
    cooldown: 35,
    effect: { type: 'dodge', value: 40, duration: 12 },
    attribute: "agility", attributeScaling: "agility",
    unlocked: false,
    requiredLevel: 35,
    upgradeCost: { gold: 3500, spiritualStones: 70 },
    icon: "fa-ghost",
    tier: 4, maxLevel: 25,
    baseTechnique: "windwalker-steps"
  },
  "soul-devouring-strike": {
    id: "soul-devouring-strike",
    name: "Soul Devouring Strike",
    description: "A forbidden technique that drains the opponent's life force to heal yourself.",
    level: 1,
    damage: 80,
    cost: 120,
    cooldown: 45,
    effect: { type: 'lifesteal', value: 50, duration: 0 },
    type: "attack", attribute: "intelligence", attributeScaling: "intelligence",
    unlocked: false,
    requiredLevel: 38,
    upgradeCost: { gold: 4000, spiritualStones: 80 },
    icon: "fa-skull",
    tier: 4, maxLevel: 25,
    baseTechnique: "spirit-gathering-palm"
  },
  "golden-bell-shield": {
    id: "golden-bell-shield",
    name: "Golden Bell Shield",
    description: "An unmatched defensive technique that forms an impenetrable Qi barrier around your body.",
    level: 1,
    damage: 30, // Reflected damage
    cost: 150,
    cooldown: 60, // 1 minute cooldown
    effect: { type: 'defense', value: 80, duration: 20 },
    type: "defense", attribute: "endurance", attributeScaling: "endurance",
    unlocked: false,
    requiredLevel: 40,
    upgradeCost: { gold: 5000, spiritualStones: 100 },
    icon: "fa-bell",
    tier: 4, maxLevel: 25,
    baseTechnique: "jade-body-scripture"
  },
  "dragon-phoenix-unity": {
    id: "dragon-phoenix-unity",
    name: "Dragon Phoenix Unity",
    description: "A legendary technique that combines offensive and defensive Qi, providing both damage and healing.",
    level: 1,
    damage: 90,
    cost: 180,
    cooldown: 50,
    effect: { type: 'health', value: 25, duration: 0 },
    type: "utility", attribute: "strength", attributeScaling: "strength",
    unlocked: false,
    requiredLevel: 40,
    upgradeCost: { gold: 6000, spiritualStones: 120 },
    icon: "fa-yin-yang",
    tier: 4, maxLevel: 25,
    baseTechnique: "dragon-tiger-fist"
  },

  // Tier 5 Techniques (Levels 41-50)
  "nine-heavens-thunder-technique": {
    id: "nine-heavens-thunder-technique",
    name: "Nine Heavens Thunder Technique",
    description: "The apex of thunder-based techniques, channeling the power of nine heavens to strike the enemy.",
    level: 1,
    damage: 150,
    cost: 200,
    cooldown: 60, // 1 minute cooldown
    attribute: "strength", attributeScaling: "strength",
    unlocked: false,
    requiredLevel: 42,
    upgradeCost: { gold: 8000, spiritualStones: 160 },
    icon: "fa-cloud-showers-heavy",
    tier: 5, maxLevel: 30,
    baseTechnique: "heavenly-thunder-palm"
  },
  "five-elements-divine-palm": {
    id: "five-elements-divine-palm",
    name: "Five Elements Divine Palm",
    description: "The ultimate evolution of the Five Elements Fist, incorporating all five elemental powers into a single strike.",
    level: 1,
    damage: 180,
    cost: 250,
    cooldown: 70,
    attribute: "intelligence", attributeScaling: "intelligence",
    unlocked: false,
    requiredLevel: 45,
    upgradeCost: { gold: 10000, spiritualStones: 200 },
    icon: "fa-hand-sparkles",
    tier: 5, maxLevel: 30,
    baseTechnique: "dragon-phoenix-unity"
  },
  "immortal-phoenix-rebirth": {
    id: "immortal-phoenix-rebirth",
    name: "Immortal Phoenix Rebirth",
    description: "A miraculous healing technique that can bring the practitioner back from the brink of death.",
    level: 1,
    damage: 0,
    cost: 300,
    cooldown: 180, type: "utility", // 3 minutes cooldown
    effect: { type: 'health', value: 80, duration: 0 },
    type: "utility", attribute: "endurance", attributeScaling: "endurance",
    unlocked: false,
    requiredLevel: 48,
    upgradeCost: { gold: 12000, spiritualStones: 240 },
    icon: "fa-dove",
    tier: 5, maxLevel: 30,
    baseTechnique: "immortal-healing-mantra"
  },
  "demonic-sword-path-shadowless-art": {
    id: "demonic-sword-path-shadowless-art",
    name: "Demonic Sword Path: Shadowless Art",
    description: "A forbidden technique from the demonic cultivation path that turns your Qi into invisible sword energy.",
    level: 1,
    damage: 250,
    cost: 350,
    cooldown: 90, // 1.5 minutes cooldown
    effect: { type: 'crit', value: 50, duration: 10 },
    attribute: "agility", attributeScaling: "agility",
    unlocked: false,
    requiredLevel: 50,
    upgradeCost: { gold: 15000, spiritualStones: 300 },
    icon: "fa-khanda",
    tier: 5, maxLevel: 30,
    baseTechnique: "phantom-shadow-steps"
  }
};

export default function MartialTechniquesPage() {
  const { game, updateGameState } = useGameEngine();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<number>(1); // Default to Tier 1
  const [selectedTechnique, setSelectedTechnique] = useState<MartialTechnique | null>(null);
  
  // Automatically add Azure Dragon Palm if it's not already in the player's techniques
  useEffect(() => {
    if (game.characterCreated && !game.martialArts["azure-dragon-palm"]) {
      updateGameState(state => {
        // Create a copy of current martial arts
        const updatedMartialArts = {...state.martialArts};
        
        // Add Azure Dragon Palm as the starter technique
        updatedMartialArts["azure-dragon-palm"] = {
          id: "azure-dragon-palm",
          name: "Azure Dragon Palm",
          description: "The foundation technique taught to all disciples. Channels basic Qi into a striking palm.",
          level: 1,
          damage: 20,
          cost: 5,
          cooldown: 2,
          type: "attack",
          attributeScaling: "strength", 
          unlocked: true, // Already unlocked
          maxLevel: 1
        };
        
        return {
          ...state,
          martialArts: updatedMartialArts
        };
      });
    }
  }, [game.characterCreated]);
  
  // Check if character is created
  if (!game.characterCreated) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Character Required</CardTitle>
            <CardDescription>
              You need to create a character before accessing martial techniques.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please go to the Character page to create your character first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Initialize martial arts in game state if needed
  if (!game.martialArts) {
    updateGameState(state => ({
      ...state,
      martialArts: {
        "azure-dragon-palm": {
          ...MARTIAL_TECHNIQUES["azure-dragon-palm"],
          unlocked: true,
          level: 1
        }
      }
    }));
  }
  
  // Function to check if a technique is available for learning
  const isTechniqueAvailable = (technique: MartialTechnique): boolean => {
    // Azure Dragon Palm is special - it should be treated as upgradeable instead of unlockable
    if (technique.id === "azure-dragon-palm") {
      // Ensure it's treated as already in the martial arts collection
      if (!game.martialArts["azure-dragon-palm"]) {
        // If it doesn't exist yet in the martial arts collection, it should be auto-added
        // This happens in the component rendering or first load
        return false;
      }
      return true;
    }
    
    // Check if player meets level requirement
    if (game.cultivationLevel < technique.requiredLevel) {
      return false;
    }
    
    // Check if player has the base technique if required
    if (technique.baseTechnique && 
        (!game.martialArts[technique.baseTechnique] || 
        !game.martialArts[technique.baseTechnique].unlocked)) {
      return false;
    }
    
    // Check if the technique is already unlocked
    if (game.martialArts[technique.id] && game.martialArts[technique.id].unlocked) {
      return false;
    }
    
    return true;
  };
  
  // Function to unlock a new technique
  const unlockTechnique = (techniqueId: string) => {
    const technique = MARTIAL_TECHNIQUES[techniqueId];
    
    // Check if player can afford it
    if (game.gold < technique.upgradeCost.gold || 
        game.spiritualStones < technique.upgradeCost.spiritualStones) {
      toast({
        title: "Cannot Unlock Technique",
        description: "You don't have enough resources to unlock this technique.",
        variant: "destructive"
      });
      return;
    }
    
    // Update game state to unlock the technique
    updateGameState(state => ({
      ...state,
      gold: state.gold - technique.upgradeCost.gold,
      spiritualStones: state.spiritualStones - technique.upgradeCost.spiritualStones,
      martialArts: {
        ...state.martialArts,
        [techniqueId]: {
          ...technique,
          unlocked: true,
          level: 1
        }
      }
    }));
    
    toast({
      title: "Technique Unlocked",
      description: `You have learned the ${technique.name} technique!`,
      variant: "default"
    });
  };
  
  // Function to upgrade an existing technique
  const upgradeTechnique = (techniqueId: string) => {
    const technique = game.martialArts[techniqueId];
    
    if (!technique || !technique.unlocked) {
      toast({
        title: "Cannot Upgrade",
        description: "You need to unlock this technique first.",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate upgrade cost (increases with level)
    const baseCost = MARTIAL_TECHNIQUES[techniqueId].upgradeCost;
    const currentLevel = technique.level || 1;
    const upgradeCost = {
      gold: Math.floor(baseCost.gold * (1 + currentLevel * 0.5)),
      spiritualStones: Math.floor(baseCost.spiritualStones * (1 + currentLevel * 0.3))
    };
    
    // Check if player can afford the upgrade
    if (game.gold < upgradeCost.gold || game.spiritualStones < upgradeCost.spiritualStones) {
      toast({
        title: "Cannot Upgrade",
        description: "You don't have enough resources to upgrade this technique.",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate new stats
    const baseTechnique = MARTIAL_TECHNIQUES[techniqueId];
    const newLevel = currentLevel + 1;
    const damageIncrease = baseTechnique.damage * 0.2; // 20% more damage per level
    const newDamage = baseTechnique.damage + (damageIncrease * (newLevel - 1));
    
    // Effect scaling if applicable
    let newEffect = technique.effect;
    if (baseTechnique.effect) {
      newEffect = {
        ...baseTechnique.effect,
        value: baseTechnique.effect.value + (baseTechnique.effect.value * 0.1 * (newLevel - 1))
      };
    }
    
    // Update game state
    updateGameState(state => ({
      ...state,
      gold: state.gold - upgradeCost.gold,
      spiritualStones: state.spiritualStones - upgradeCost.spiritualStones,
      martialArts: {
        ...state.martialArts,
        [techniqueId]: {
          ...state.martialArts[techniqueId],
          level: newLevel,
          damage: newDamage,
          effect: newEffect
        }
      }
    }));
    
    toast({
      title: "Technique Upgraded",
      description: `You have upgraded ${technique.name} to level ${newLevel}!`,
      variant: "default"
    });
  };
  
  // Initialize Azure Dragon Palm when component mounts
  useEffect(() => {
    // Ensure Azure Dragon Palm is always available for upgrade (never needs unlocking)
    if (!game.martialArts["azure-dragon-palm"]) {
      const azureDragonPalm = MARTIAL_TECHNIQUES["azure-dragon-palm"];
      updateGameState(state => ({
        ...state,
        martialArts: {
          ...state.martialArts,
          "azure-dragon-palm": {
            ...azureDragonPalm,
            unlocked: true,
            level: 1
          }
        }
      }));
    }
  }, [game.martialArts]);

  // Group techniques by tier
  const getTechniquesByTier = (tier: number) => {
    return Object.values(MARTIAL_TECHNIQUES).filter(technique => technique.tier === tier);
  };
  
  // Check if the player can afford a technique
  const canAfford = (technique: MartialTechnique): boolean => {
    return game.gold >= technique.upgradeCost.gold && 
           game.spiritualStones >= technique.upgradeCost.spiritualStones;
  };
  
  // Render the status of a technique
  const renderTechniqueStatus = (technique: MartialTechnique) => {
    const isUnlocked = game.martialArts[technique.id]?.unlocked || false;
    const isAvailable = isTechniqueAvailable(technique);
    
    if (isUnlocked) {
      const level = game.martialArts[technique.id]?.level || 1;
      return <span className="text-green-500">Level {level}</span>;
    }
    
    if (!isAvailable) {
      return <span className="text-red-500">Locked</span>;
    }
    
    if (!canAfford(technique)) {
      return <span className="text-amber-500">Cannot Afford</span>;
    }
    
    return <span className="text-blue-500">Available</span>;
  };
  
  // Calculate current damage/effect for a technique
  const getCurrentTechniqueStats = (techniqueId: string) => {
    const baseTechnique = MARTIAL_TECHNIQUES[techniqueId];
    const unlockedTechnique = game.martialArts[techniqueId];
    
    if (!unlockedTechnique || !unlockedTechnique.unlocked) {
      return baseTechnique;
    }
    
    const currentLevel = unlockedTechnique.level || 1;
    
    // Calculate scaled damage
    const damageIncrease = baseTechnique.damage * 0.2; // 20% more damage per level
    const currentDamage = baseTechnique.damage + (damageIncrease * (currentLevel - 1));
    
    // Calculate scaled effect if any
    let currentEffect = baseTechnique.effect;
    if (baseTechnique.effect) {
      currentEffect = {
        ...baseTechnique.effect,
        value: baseTechnique.effect.value + (baseTechnique.effect.value * 0.1 * (currentLevel - 1))
      };
    }
    
    return {
      ...baseTechnique,
      damage: Math.floor(currentDamage),
      effect: currentEffect,
      level: currentLevel
    };
  };
  
  // Get formatted effect description
  const getEffectDescription = (effect: MartialTechnique['effect']) => {
    if (!effect) return null;
    
    switch (effect.type) {
      case 'lifesteal':
        return `Heals for ${effect.value}% of damage dealt`;
      case 'poison':
        return `Applies poison dealing ${effect.value} damage over ${effect.duration} seconds`;
      case 'defense':
        return `Increases defense by ${effect.value}% for ${effect.duration} seconds`;
      case 'health':
        return effect.duration ? 
          `Regenerates ${effect.value}% health over ${effect.duration} seconds` :
          `Instantly heals for ${effect.value}% of max health`;
      case 'crit':
        return `Increases critical hit chance by ${effect.value}% for ${effect.duration} seconds`;
      case 'dodge':
        return `Increases dodge chance by ${effect.value}% for ${effect.duration} seconds`;
      default:
        return null;
    }
  };
  
  // Get icon color based on tier
  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return "text-green-500";
      case 2: return "text-blue-500";
      case 3: return "text-purple-500";
      case 4: return "text-amber-500";
      case 5: return "text-red-500";
      default: return "text-gray-500";
    }
  };
  
  const getTierName = (tier: number) => {
    switch (tier) {
      case 1: return "Basic";
      case 2: return "Advanced";
      case 3: return "Profound";
      case 4: return "Earth-Shattering";
      case 5: return "Divine";
      default: return "Unknown";
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-serif mb-6 text-center text-primary">
        <i className="fas fa-fist-raised mr-2"></i> Martial Techniques
      </h1>
      
      <div className="mb-6 p-4 rounded-lg bg-primary/5">
        <div className="flex justify-between mb-4">
          <div>
            <span className="font-semibold text-primary">Gold:</span> 
            <span className="ml-2">{formatNumber(game.gold)}</span>
          </div>
          <div>
            <span className="font-semibold text-primary">Qi Stones:</span> 
            <span className="ml-2">{formatNumber(game.spiritualStones)}</span>
          </div>
          <div>
            <span className="font-semibold text-primary">Cultivation Rank:</span> 
            <span className="ml-2">{game.cultivationLevel}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600">
          Unlock and master martial techniques to gain an advantage in combat. Techniques require specific cultivation levels and may build upon earlier techniques.
        </p>
      </div>
      
      {/* Tier Navigation */}
      <div className="flex mb-6 overflow-x-auto">
        {[1, 2, 3, 4, 5].map(tier => (
          <button
            key={tier}
            onClick={() => setActiveTab(tier)}
            className={`px-4 py-2 mr-2 rounded-t-lg font-medium text-sm flex-shrink-0 ${
              activeTab === tier 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {getTierName(tier)} (Lvl {(tier - 1) * 10 + 1}-{tier * 10})
          </button>
        ))}
      </div>
      
      {/* Technique Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {getTechniquesByTier(activeTab).map(technique => {
          const isUnlocked = game.martialArts[technique.id]?.unlocked || false;
          const isAvailable = isTechniqueAvailable(technique);
          const canAffordIt = canAfford(technique);
          
          return (
            <Card 
              key={technique.id} 
              className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                isUnlocked ? 'border-green-500' :
                isAvailable && canAffordIt ? 'border-blue-500' :
                isAvailable ? 'border-amber-500' : 'border-gray-300'
              }`}
              onClick={() => setSelectedTechnique(technique)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-serif flex items-center">
                    <i className={`fas ${technique.icon} mr-2 ${getTierColor(technique.tier)}`}></i>
                    {technique.name}
                  </CardTitle>
                  <Badge className={
                    isUnlocked ? 'bg-green-100 text-green-800' :
                    isAvailable && canAffordIt ? 'bg-blue-100 text-blue-800' :
                    isAvailable ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                  }>
                    {renderTechniqueStatus(technique)}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {technique.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <i className="fas fa-fist-raised text-red-500 mr-1"></i>
                    <span>Damage: {technique.damage}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-fire-alt text-blue-500 mr-1"></i>
                    <span>Cost: {technique.cost} Qi</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-clock text-purple-500 mr-1"></i>
                    <span>Cooldown: {technique.cooldown}s</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-user-graduate text-amber-500 mr-1"></i>
                    <span>Req Level: {technique.requiredLevel}</span>
                  </div>
                </div>
                
                {technique.effect && (
                  <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
                    <div className="font-medium text-blue-700">Special Effect:</div>
                    <div>{getEffectDescription(technique.effect)}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Technique Details Dialog */}
      {selectedTechnique && (
        <Dialog open={!!selectedTechnique} onOpenChange={(open) => !open && setSelectedTechnique(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <i className={`fas ${selectedTechnique.icon} mr-2 ${getTierColor(selectedTechnique.tier)}`}></i>
                {selectedTechnique.name}
              </DialogTitle>
              <DialogDescription>
                {getTierName(selectedTechnique.tier)} Tier Technique
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-2">
              <p className="text-sm mb-4">{selectedTechnique.description}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Base Damage</div>
                  <div className="font-medium">{selectedTechnique.damage}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Qi Cost</div>
                  <div className="font-medium">{selectedTechnique.cost}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Cooldown</div>
                  <div className="font-medium">{selectedTechnique.cooldown} seconds</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Scaling Attribute</div>
                  <div className="font-medium capitalize">{selectedTechnique.attribute || "None"}</div>
                </div>
              </div>
              
              {selectedTechnique.effect && (
                <div className="mb-4 bg-blue-50 p-3 rounded">
                  <h4 className="font-medium text-sm mb-1 text-blue-700">Special Effect</h4>
                  <p className="text-sm">{getEffectDescription(selectedTechnique.effect)}</p>
                </div>
              )}
              
              {selectedTechnique.baseTechnique && (
                <div className="mb-4 bg-amber-50 p-3 rounded">
                  <h4 className="font-medium text-sm mb-1 text-amber-700">Required Technique</h4>
                  <p className="text-sm">
                    Requires {MARTIAL_TECHNIQUES[selectedTechnique.baseTechnique].name} to be unlocked first
                  </p>
                </div>
              )}
              
              <Separator className="my-4" />
              
              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2">Requirements</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <i className={`fas fa-user-graduate mr-1 ${
                      game.cultivationLevel >= selectedTechnique.requiredLevel ? 'text-green-500' : 'text-red-500'
                    }`}></i>
                    <span>Level {selectedTechnique.requiredLevel}</span>
                    {game.cultivationLevel >= selectedTechnique.requiredLevel && 
                      <i className="fas fa-check text-green-500 ml-1"></i>}
                  </div>
                  
                  {selectedTechnique.baseTechnique && (
                    <div className="flex items-center">
                      <i className={`fas fa-scroll mr-1 ${
                        game.martialArts[selectedTechnique.baseTechnique]?.unlocked ? 'text-green-500' : 'text-red-500'
                      }`}></i>
                      <span>Base Technique</span>
                      {game.martialArts[selectedTechnique.baseTechnique]?.unlocked && 
                        <i className="fas fa-check text-green-500 ml-1"></i>}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2">Cost to {
                  game.martialArts[selectedTechnique.id]?.unlocked ? 'Upgrade' : 'Unlock'
                }</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <i className={`fas fa-coins mr-1 ${
                      game.gold >= selectedTechnique.upgradeCost.gold ? 'text-amber-500' : 'text-red-500'
                    }`}></i>
                    <span>{selectedTechnique.upgradeCost.gold} Gold</span>
                  </div>
                  <div className="flex items-center">
                    <i className={`fas fa-gem mr-1 ${
                      game.spiritualStones >= selectedTechnique.upgradeCost.spiritualStones ? 'text-blue-500' : 'text-red-500'
                    }`}></i>
                    <span>{selectedTechnique.upgradeCost.spiritualStones} Qi Stones</span>
                  </div>
                </div>
              </div>
              
              {game.martialArts[selectedTechnique.id]?.unlocked && (
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">Current Level Stats</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <i className="fas fa-star-half-alt text-amber-500 mr-1"></i>
                      <span>Level: {game.martialArts[selectedTechnique.id].level}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-fist-raised text-red-500 mr-1"></i>
                      <span>Damage: {Math.floor(game.martialArts[selectedTechnique.id].damage)}</span>
                    </div>
                    {game.martialArts[selectedTechnique.id].effect && (
                      <div className="col-span-2 flex items-center">
                        <i className="fas fa-magic text-purple-500 mr-1"></i>
                        <span>Effect: {getEffectDescription(game.martialArts[selectedTechnique.id].effect)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              {game.martialArts[selectedTechnique.id]?.unlocked ? (
                <Button
                  onClick={() => upgradeTechnique(selectedTechnique.id)}
                  disabled={!canAfford(selectedTechnique)}
                >
                  <i className="fas fa-level-up-alt mr-1"></i> Upgrade Technique
                </Button>
              ) : (
                <Button
                  onClick={() => unlockTechnique(selectedTechnique.id)}
                  disabled={!isTechniqueAvailable(selectedTechnique) || !canAfford(selectedTechnique)}
                >
                  <i className="fas fa-unlock mr-1"></i> Learn Technique
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={() => setLocation("/game")}
        >
          Return to Cultivation
        </Button>
      </div>
    </div>
  );
}