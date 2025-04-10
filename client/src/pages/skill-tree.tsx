import { useState, useEffect } from "react";
import { useGameEngine } from "@/lib/gameEngine";
import { MARTIAL_ARTS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocation } from "wouter";

type SkillCategory = "attack" | "defense" | "utility" | "ultimate";

// Define skill effect types
interface SkillEffect {
  type: 'damage' | 'heal' | 'defense' | 'poison' | 'lifesteal' | 'buff';
  value: number; // Percentage or flat value
  duration?: number; // Duration in seconds if applicable
  description: string;
}

// Extended martial arts data structure
interface ExtendedMartialArt {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  damage: number;
  cost: number;
  cooldown: number;
  type: string;
  attributeScaling: string;
  icon: string;
  requiredLevel: number;
  maxLevel: number;
  requiredRealm: string;
  requiredStage: number;
  unlocked?: boolean;
  level?: number;
  unlockCost?: number;
  requiredSect?: string;
  effects?: SkillEffect[];
  prerequisites?: string[]; // IDs of prerequisite skills
}

// Additional martial arts data not in constants.ts
const EXTENDED_MARTIAL_ARTS: Record<string, Partial<ExtendedMartialArt>> = {
  'palm-strike': {
    effects: [{ type: 'damage', value: 15, description: 'Deals physical damage to the target' }],
    prerequisites: []
  },
  'iron-body': {
    effects: [{ type: 'defense', value: 30, duration: 5, description: 'Increases defense by 30% for 5 seconds' }],
    prerequisites: []
  },
  'spirit-step': {
    effects: [{ type: 'buff', value: 20, duration: 4, description: 'Increases dodge chance by 20% for 4 seconds' }],
    prerequisites: ['iron-body']
  },
  'demonic-palm': {
    effects: [
      { type: 'damage', value: 25, description: 'Deals spiritual damage to the target' },
      { type: 'lifesteal', value: 30, description: 'Heals for 30% of damage dealt' }
    ],
    prerequisites: ['palm-strike']
  },
  'five-elements-fist': {
    name: 'Five Elements Fist',
    chineseName: '五行拳',
    description: 'A powerful fist technique that cycles through the five elements with each strike.',
    damage: 30,
    cost: 20,
    cooldown: 6,
    type: 'attack',
    attributeScaling: 'strength',
    icon: 'hand-fist',
    requiredLevel: 10,
    maxLevel: 10,
    requiredRealm: 'foundation',
    requiredStage: 1,
    unlocked: false,
    level: 1,
    unlockCost: 100,
    effects: [
      { type: 'damage', value: 30, description: 'Deals elemental damage based on the current element' },
      { type: 'buff', value: 10, duration: 3, description: 'Each hit grants a 10% element-specific buff for 3 seconds' }
    ],
    prerequisites: ['palm-strike']
  },
  'heavenly-thunder-palm': {
    name: 'Heavenly Thunder Palm',
    chineseName: '天雷掌',
    description: 'Channel thunder energy into your palm strikes, stunning enemies.',
    damage: 40,
    cost: 25,
    cooldown: 8,
    type: 'attack',
    attributeScaling: 'spirit',
    icon: 'cloud-lightning',
    requiredLevel: 15,
    maxLevel: 10,
    requiredRealm: 'foundation',
    requiredStage: 3,
    unlocked: false,
    level: 1,
    unlockCost: 150,
    effects: [
      { type: 'damage', value: 40, description: 'Deals thunder damage to the target' },
      { type: 'buff', value: 20, duration: 2, description: 'Has a 20% chance to stun the enemy for 2 seconds' }
    ],
    prerequisites: ['five-elements-fist']
  },
  'frost-palm': {
    name: 'Frost Palm Technique',
    chineseName: '寒冰掌',
    description: 'A palm technique that channels frost energy to slow and damage opponents.',
    damage: 35,
    cost: 20,
    cooldown: 7,
    type: 'attack',
    attributeScaling: 'spirit',
    icon: 'snowflake',
    requiredLevel: 12,
    maxLevel: 10,
    requiredRealm: 'foundation',
    requiredStage: 2,
    unlocked: false,
    level: 1,
    unlockCost: 120,
    effects: [
      { type: 'damage', value: 35, description: 'Deals frost damage to the target' },
      { type: 'buff', value: 30, duration: 4, description: 'Slows the enemy\'s attack speed by 30% for 4 seconds' }
    ],
    prerequisites: ['palm-strike']
  },
  'black-tiger-claw': {
    name: 'Black Tiger Claw',
    chineseName: '黑虎爪',
    description: 'A fierce claw technique modeled after the hunting style of a black tiger.',
    damage: 45,
    cost: 25,
    cooldown: 9,
    type: 'attack',
    attributeScaling: 'strength',
    icon: 'paw',
    requiredLevel: 18,
    maxLevel: 10,
    requiredRealm: 'foundation',
    requiredStage: 4,
    unlocked: false,
    level: 1,
    unlockCost: 180,
    effects: [
      { type: 'damage', value: 45, description: 'Deals physical damage to the target' },
      { type: 'lifesteal', value: 15, description: 'Heals for 15% of damage dealt' }
    ],
    prerequisites: ['five-elements-fist']
  },
  'poison-hand': {
    name: 'Venomous Snake Hand',
    chineseName: '毒蛇手',
    description: 'Infuse your strikes with deadly poison that damages enemies over time.',
    damage: 25,
    cost: 25,
    cooldown: 10,
    type: 'attack',
    attributeScaling: 'perception',
    icon: 'virus',
    requiredLevel: 20,
    maxLevel: 10,
    requiredRealm: 'foundation',
    requiredStage: 5,
    unlocked: false,
    level: 1,
    unlockCost: 200,
    effects: [
      { type: 'damage', value: 25, description: 'Deals poison damage initially' },
      { type: 'poison', value: 50, duration: 10, description: 'Applies poison that deals 50% of initial damage over 10 seconds' }
    ],
    prerequisites: ['frost-palm', 'demonic-palm']
  },
  'dragon-breath': {
    name: 'Azure Dragon Breath',
    chineseName: '青龙吐息',
    description: 'Channel the breath of the Azure Dragon to heal yourself and damage enemies.',
    damage: 40,
    cost: 30,
    cooldown: 12,
    type: 'attack',
    attributeScaling: 'spirit',
    icon: 'dragon',
    requiredLevel: 25,
    maxLevel: 10,
    requiredRealm: 'core',
    requiredStage: 1,
    unlocked: false,
    level: 1,
    unlockCost: 250,
    effects: [
      { type: 'damage', value: 40, description: 'Deals azure qi damage to all enemies' },
      { type: 'heal', value: 20, description: 'Heals yourself for 20% of your maximum health' }
    ],
    prerequisites: ['heavenly-thunder-palm']
  },
  'void-step': {
    name: 'Void Stepping Technique',
    chineseName: '虚空步',
    description: 'A movement technique that allows you to step through the void, avoiding all damage briefly.',
    damage: 0,
    cost: 40,
    cooldown: 25,
    type: 'utility',
    attributeScaling: 'agility',
    icon: 'ghost',
    requiredLevel: 30,
    maxLevel: 10,
    requiredRealm: 'core',
    requiredStage: 3,
    unlocked: false,
    level: 1,
    unlockCost: 300,
    effects: [
      { type: 'buff', value: 100, duration: 3, description: 'Become intangible for 3 seconds, avoiding all damage' }
    ],
    prerequisites: ['spirit-step']
  },
  'phoenix-wing': {
    name: 'Phoenix Wing Strike',
    chineseName: '凤翼击',
    description: 'A flame-based attack that mimics the wing strikes of a phoenix.',
    damage: 60,
    cost: 35,
    cooldown: 15,
    type: 'attack',
    attributeScaling: 'strength',
    icon: 'feather',
    requiredLevel: 28,
    maxLevel: 10,
    requiredRealm: 'core',
    requiredStage: 2,
    unlocked: false,
    level: 1,
    unlockCost: 280,
    effects: [
      { type: 'damage', value: 60, description: 'Deals flame damage to the target' },
      { type: 'buff', value: 20, duration: 5, description: 'Increases your attack power by 20% for 5 seconds' }
    ],
    prerequisites: ['black-tiger-claw']
  },
  'golden-bell': {
    name: 'Golden Bell Shield',
    chineseName: '金钟罩',
    description: 'Envelop yourself in a shield of golden qi that absorbs damage.',
    damage: 0,
    cost: 45,
    cooldown: 30,
    type: 'defense',
    attributeScaling: 'endurance',
    icon: 'bell',
    requiredLevel: 32,
    maxLevel: 10,
    requiredRealm: 'core',
    requiredStage: 4,
    unlocked: false,
    level: 1,
    unlockCost: 320,
    effects: [
      { type: 'defense', value: 80, duration: 8, description: 'Reduces all incoming damage by 80% for 8 seconds' }
    ],
    prerequisites: ['iron-body']
  },
  'eclipse-finger': {
    name: 'Eclipse Finger',
    chineseName: '蚀日指',
    description: 'A devastating finger strike that can pierce through defenses like an eclipse blocks the sun.',
    damage: 80,
    cost: 50,
    cooldown: 20,
    type: 'attack',
    attributeScaling: 'strength',
    icon: 'hand-point-up',
    requiredLevel: 35,
    maxLevel: 10,
    requiredRealm: 'core',
    requiredStage: 5,
    unlocked: false,
    level: 1,
    unlockCost: 350,
    effects: [
      { type: 'damage', value: 80, description: 'Deals piercing damage, ignoring 50% of target\'s defense' }
    ],
    prerequisites: ['heavenly-thunder-palm', 'phoenix-wing']
  },
  'blood-lotus': {
    name: 'Blood Lotus Palm',
    chineseName: '血莲掌',
    description: 'A forbidden technique that sacrifices your health to deal massive damage.',
    damage: 120,
    cost: 30,
    cooldown: 40,
    type: 'attack',
    attributeScaling: 'spirit',
    icon: 'droplet',
    requiredLevel: 38,
    maxLevel: 10,
    requiredRealm: 'nascent',
    requiredStage: 1,
    unlocked: false,
    level: 1,
    unlockCost: 380,
    effects: [
      { type: 'damage', value: 120, description: 'Deals blood essence damage to the target' },
      { type: 'lifesteal', value: 60, description: 'Heals for 60% of damage dealt, but costs 20% of your max health to use' }
    ],
    prerequisites: ['poison-hand', 'demonic-palm']
  },
  'mountain-crush': {
    name: 'Mountain Crushing Fist',
    chineseName: '崩山拳',
    description: 'A powerful fist technique said to be able to crush mountains.',
    damage: 100,
    cost: 60,
    cooldown: 25,
    type: 'attack',
    attributeScaling: 'strength',
    icon: 'mountain',
    requiredLevel: 40,
    maxLevel: 10,
    requiredRealm: 'nascent',
    requiredStage: 2,
    unlocked: false,
    level: 1,
    unlockCost: 400,
    effects: [
      { type: 'damage', value: 100, description: 'Deals massive physical damage to the target' },
      { type: 'buff', value: 30, duration: 2, description: 'Has a 30% chance to stun the enemy for 2 seconds' }
    ],
    prerequisites: ['black-tiger-claw', 'phoenix-wing']
  },
  'nine-stars': {
    name: 'Nine Stars Heavenly Technique',
    chineseName: '九星天功',
    description: 'Combine the power of nine stars to unleash a devastating area attack.',
    damage: 150,
    cost: 80,
    cooldown: 45,
    type: 'ultimate',
    attributeScaling: 'intelligence',
    icon: 'stars',
    requiredLevel: 45,
    maxLevel: 10,
    requiredRealm: 'nascent',
    requiredStage: 5,
    unlocked: false,
    level: 1,
    unlockCost: 450,
    effects: [
      { type: 'damage', value: 150, description: 'Deals celestial damage to all enemies' },
      { type: 'buff', value: 25, duration: 10, description: 'Increases all your attributes by 25% for 10 seconds' }
    ],
    prerequisites: ['eclipse-finger', 'dragon-breath']
  },
  'immortal-swordplay': {
    name: 'Immortal Swordplay',
    chineseName: '仙剑术',
    description: 'A legendary sword technique that creates sword qi even without a physical sword.',
    damage: 180,
    cost: 100,
    cooldown: 60,
    type: 'ultimate',
    attributeScaling: 'perception',
    icon: 'sword',
    requiredLevel: 48,
    maxLevel: 10,
    requiredRealm: 'divine',
    requiredStage: 1,
    unlocked: false,
    level: 1,
    unlockCost: 480,
    effects: [
      { type: 'damage', value: 180, description: 'Forms 9 sword qi projections that each deal damage to the target' }
    ],
    prerequisites: ['nine-stars']
  },
  'shadowless-art': {
    name: 'Demonic Sword Path: Shadowless Art',
    chineseName: '魔剑道：无影术',
    description: 'The ultimate demonic sword technique where the practitioner becomes one with their sword intent.',
    damage: 250,
    cost: 150,
    cooldown: 90,
    type: 'ultimate',
    attributeScaling: 'strength',
    icon: 'user-ninja',
    requiredLevel: 50,
    maxLevel: 10,
    requiredRealm: 'divine',
    requiredStage: 3,
    unlocked: false,
    level: 1,
    unlockCost: 500,
    effects: [
      { type: 'damage', value: 250, description: 'Performs a series of shadowless strikes that deal massive damage' },
      { type: 'lifesteal', value: 50, description: 'Heals for 50% of damage dealt' },
      { type: 'buff', value: 40, duration: 15, description: 'Increases attack speed by 40% for 15 seconds' }
    ],
    prerequisites: ['immortal-swordplay', 'blood-lotus']
  }
};

// Helper function to merge martial arts data
function getMartialArtsData(): Record<string, ExtendedMartialArt> {
  const result: Record<string, ExtendedMartialArt> = {};
  
  // Start with base martial arts from constants
  Object.entries(MARTIAL_ARTS).forEach(([id, baseArt]) => {
    result[id] = {
      id,
      ...baseArt,
      effects: [],
      prerequisites: []
    } as ExtendedMartialArt;
  });
  
  // Merge with extended data
  Object.entries(EXTENDED_MARTIAL_ARTS).forEach(([id, extendedData]) => {
    if (result[id]) {
      // Merge with existing entry
      result[id] = {
        ...result[id],
        ...extendedData,
        id
      } as ExtendedMartialArt;
    } else {
      // Add new entry
      result[id] = {
        id,
        ...extendedData
      } as ExtendedMartialArt;
    }
  });
  
  return result;
}

export default function SkillTree() {
  const { game, updateGameState } = useGameEngine();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<SkillCategory>("attack");
  const [skillsData, setSkillsData] = useState<Record<string, ExtendedMartialArt>>(getMartialArtsData());
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  
  // Check if character is created
  useEffect(() => {
    if (!game.characterCreated) {
      setLocation("/character");
    }
  }, [game.characterCreated, setLocation]);
  
  // Filter skills by category
  const getSkillsByCategory = (category: SkillCategory) => {
    return Object.entries(skillsData)
      .filter(([_, skill]) => skill.type === category)
      .sort((a, b) => a[1].requiredLevel - b[1].requiredLevel);
  };
  
  // Check if a skill meets requirements
  const meetsRequirements = (skill: ExtendedMartialArt) => {
    // Check level requirements
    if (game.cultivationLevel < skill.requiredLevel) return false;
    
    // Check realm requirements
    if (skill.requiredRealm) {
      const realmOrder = ['qi', 'foundation', 'core', 'nascent', 'divine', 'heavenly'];
      const playerRealmIndex = realmOrder.indexOf(game.realm);
      const requiredRealmIndex = realmOrder.indexOf(skill.requiredRealm);
      
      if (playerRealmIndex < requiredRealmIndex) return false;
      
      // If same realm, check stage
      if (playerRealmIndex === requiredRealmIndex && game.realmStage < skill.requiredStage) return false;
    }
    
    // Check sect requirements
    if (skill.requiredSect && game.sect !== skill.requiredSect) return false;
    
    // Check prerequisites
    if (skill.prerequisites && skill.prerequisites.length > 0) {
      for (const prereqId of skill.prerequisites) {
        if (!game.martialArts[prereqId]?.unlocked) return false;
      }
    }
    
    return true;
  };
  
  // Get skill state (unlocked, available, locked)
  const getSkillState = (skillId: string, skill: ExtendedMartialArt) => {
    // Check if already unlocked
    if (game.martialArts[skillId]?.unlocked) return "unlocked";
    
    // Check if available to unlock
    if (meetsRequirements(skill)) return "available";
    
    // Otherwise it's locked
    return "locked";
  };
  
  // Handle skill click to show details
  const handleSkillClick = (skillId: string) => {
    setSelectedSkill(skillId);
    setSkillDialogOpen(true);
  };
  
  // Handle unlocking a skill
  const handleUnlockSkill = (skillId: string, skill: ExtendedMartialArt) => {
    if (!meetsRequirements(skill)) {
      toast({
        title: "Requirements not met",
        description: "You don't meet the requirements to unlock this skill.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if enough resources
    if (game.spiritualStones < (skill.unlockCost || 0)) {
      toast({
        title: "Not enough Qi Stones",
        description: `You need ${skill.unlockCost} Qi Stones to unlock this skill.`,
        variant: "destructive"
      });
      return;
    }
    
    // Unlock the skill
    updateGameState(state => {
      const updatedMartialArts = {
        ...state.martialArts,
        [skillId]: {
          ...(state.martialArts[skillId] || {}),
          unlocked: true,
          level: 1
        }
      };
      
      return {
        ...state,
        spiritualStones: state.spiritualStones - (skill.unlockCost || 0),
        martialArts: updatedMartialArts
      };
    });
    
    toast({
      title: "Skill Unlocked",
      description: `You have unlocked ${skill.name}!`,
      variant: "default"
    });
  };
  
  // Handle upgrading a skill
  const handleUpgradeSkill = (skillId: string, skill: ExtendedMartialArt) => {
    const currentLevel = game.martialArts[skillId]?.level || 0;
    
    if (currentLevel >= skill.maxLevel) {
      toast({
        title: "Maximum Level Reached",
        description: \`\${skill.name} is already at maximum level.\`,
        variant: "default"
      });
      return;
    }
    
    // Calculate upgrade cost (scales with level)
    const baseCost = skill.unlockCost ? Math.floor(skill.unlockCost / 5) : 20;
    const upgradeCost = baseCost * (currentLevel + 1);
    
    // Check if enough resources
    if (game.spiritualStones < upgradeCost) {
      toast({
        title: "Not enough Qi Stones",
        description: \`You need \${upgradeCost} Qi Stones to upgrade this skill.\`,
        variant: "destructive"
      });
      return;
    }
    
    // Upgrade the skill
    updateGameState(state => {
      const updatedMartialArts = {
        ...state.martialArts,
        [skillId]: {
          ...(state.martialArts[skillId] || {}),
          level: currentLevel + 1
        }
      };
      
      return {
        ...state,
        spiritualStones: state.spiritualStones - upgradeCost,
        martialArts: updatedMartialArts
      };
    });
    
    toast({
      title: "Skill Upgraded",
      description: \`\${skill.name} upgraded to level \${currentLevel + 1}!\`,
      variant: "default"
    });
  };
  
  // Calculate skill damage based on level
  const calculateSkillDamage = (skillId: string, skill: ExtendedMartialArt) => {
    const skillLevel = game.martialArts[skillId]?.level || 1;
    const baseDamage = skill.damage;
    
    // 10% increase per level
    return Math.floor(baseDamage * (1 + (skillLevel - 1) * 0.1));
  };
  
  // Skill tree visualization
  const renderSkillTree = () => {
    return (
      <Tabs defaultValue="attack" value={selectedTab} onValueChange={(value) => setSelectedTab(value as SkillCategory)}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="attack" className="flex items-center gap-2">
            <i className="fas fa-fist-raised"></i> Attack
          </TabsTrigger>
          <TabsTrigger value="defense" className="flex items-center gap-2">
            <i className="fas fa-shield-alt"></i> Defense
          </TabsTrigger>
          <TabsTrigger value="utility" className="flex items-center gap-2">
            <i className="fas fa-magic"></i> Utility
          </TabsTrigger>
          <TabsTrigger value="ultimate" className="flex items-center gap-2">
            <i className="fas fa-crown"></i> Ultimate
          </TabsTrigger>
        </TabsList>
        
        {/* Attack Skills */}
        <TabsContent value="attack" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getSkillsByCategory("attack").map(([skillId, skill]) => (
              <SkillCard
                key={skillId}
                skillId={skillId}
                skill={skill}
                onClick={() => handleSkillClick(skillId)}
                state={getSkillState(skillId, skill)}
                currentLevel={game.martialArts[skillId]?.level || 0}
                damage={calculateSkillDamage(skillId, skill)}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* Defense Skills */}
        <TabsContent value="defense" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getSkillsByCategory("defense").map(([skillId, skill]) => (
              <SkillCard
                key={skillId}
                skillId={skillId}
                skill={skill}
                onClick={() => handleSkillClick(skillId)}
                state={getSkillState(skillId, skill)}
                currentLevel={game.martialArts[skillId]?.level || 0}
                damage={calculateSkillDamage(skillId, skill)}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* Utility Skills */}
        <TabsContent value="utility" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getSkillsByCategory("utility").map(([skillId, skill]) => (
              <SkillCard
                key={skillId}
                skillId={skillId}
                skill={skill}
                onClick={() => handleSkillClick(skillId)}
                state={getSkillState(skillId, skill)}
                currentLevel={game.martialArts[skillId]?.level || 0}
                damage={calculateSkillDamage(skillId, skill)}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* Ultimate Skills */}
        <TabsContent value="ultimate" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getSkillsByCategory("ultimate").map(([skillId, skill]) => (
              <SkillCard
                key={skillId}
                skillId={skillId}
                skill={skill}
                onClick={() => handleSkillClick(skillId)}
                state={getSkillState(skillId, skill)}
                currentLevel={game.martialArts[skillId]?.level || 0}
                damage={calculateSkillDamage(skillId, skill)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    );
  };
  
  // Get selected skill details
  const getSelectedSkillDetails = () => {
    if (!selectedSkill) return null;
    return skillsData[selectedSkill];
  };
  
  return (
    <div className="min-h-screen bg-scroll py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-serif text-primary mb-2">
            <i className="fas fa-book-open mr-2"></i>
            Martial Arts Skill Tree
          </h1>
          <p className="text-gray-700">Unlock and master powerful techniques</p>
        </div>
        
        <Card className="mb-6 bg-white/90">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-amber-50 p-3 rounded-md shadow-inner">
                <p className="font-medium text-amber-800 mb-1">Cultivation Level</p>
                <p className="text-xl">{game.cultivationLevel}</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-md shadow-inner">
                <p className="font-medium text-emerald-800 mb-1">Unlocked Skills</p>
                <p className="text-xl">
                  {Object.values(game.martialArts).filter(skill => skill.unlocked).length} / 
                  {Object.keys(skillsData).length}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-md shadow-inner">
                <p className="font-medium text-blue-800 mb-1">Qi Stones</p>
                <p className="text-xl">{game.spiritualStones}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="relative">
          {renderSkillTree()}
        </div>
        
        {/* Skill Detail Dialog */}
        <Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
          <DialogContent className="max-w-xl">
            {selectedSkill && getSelectedSkillDetails() && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-2xl">
                    <i className={`fas fa-${getSelectedSkillDetails()?.icon}`}></i>
                    {getSelectedSkillDetails()?.name}
                    <span className="text-sm text-gray-500 ml-2">
                      ({getSelectedSkillDetails()?.chineseName})
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    {getSelectedSkillDetails()?.description}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Base Damage</p>
                      <p className="text-lg">
                        {calculateSkillDamage(selectedSkill, getSelectedSkillDetails()!)} 
                        <span className="text-xs text-gray-500 ml-1">
                          (Base: {getSelectedSkillDetails()?.damage})
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Cooldown</p>
                      <p className="text-lg">{getSelectedSkillDetails()?.cooldown} seconds</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Qi Cost</p>
                      <p className="text-lg">{getSelectedSkillDetails()?.cost}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Scales With</p>
                      <p className="text-lg capitalize">{getSelectedSkillDetails()?.attributeScaling}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Effects</h3>
                    <div className="space-y-2">
                      {getSelectedSkillDetails()?.effects?.map((effect, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-md">
                          <div className="mt-1">
                            <i className={`fas fa-${
                              effect.type === 'damage' ? 'bolt' :
                              effect.type === 'heal' ? 'heart' :
                              effect.type === 'defense' ? 'shield-alt' :
                              effect.type === 'poison' ? 'skull' :
                              effect.type === 'lifesteal' ? 'tint' :
                              'magic'
                            } text-${
                              effect.type === 'damage' ? 'orange' :
                              effect.type === 'heal' ? 'pink' :
                              effect.type === 'defense' ? 'blue' :
                              effect.type === 'poison' ? 'green' :
                              effect.type === 'lifesteal' ? 'red' :
                              'purple'
                            }-500`}></i>
                          </div>
                          <div>
                            <p className="font-medium capitalize">{effect.type}</p>
                            <p className="text-sm">{effect.description}</p>
                            {effect.duration && (
                              <p className="text-xs text-gray-500">Duration: {effect.duration} seconds</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Requirements</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium">Level</p>
                        <Badge className={game.cultivationLevel >= getSelectedSkillDetails()!.requiredLevel 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"}>
                          Level {getSelectedSkillDetails()?.requiredLevel}+
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Cultivation Realm</p>
                        <Badge className={
                          meetsRequirements(getSelectedSkillDetails()!) 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                        }>
                          {getSelectedSkillDetails()?.requiredRealm?.charAt(0).toUpperCase() + 
                            getSelectedSkillDetails()?.requiredRealm?.slice(1)} Stage {getSelectedSkillDetails()?.requiredStage}+
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Prerequisite skills */}
                    {getSelectedSkillDetails()?.prerequisites?.length ? (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Prerequisite Skills</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {getSelectedSkillDetails()?.prerequisites?.map(prereqId => (
                            <Badge 
                              key={prereqId}
                              className={game.martialArts[prereqId]?.unlocked 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"}
                            >
                              {skillsData[prereqId]?.name || prereqId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    
                    {/* Sect requirement if any */}
                    {getSelectedSkillDetails()?.requiredSect && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Required Sect</p>
                        <Badge className={game.sect === getSelectedSkillDetails()?.requiredSect 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"}>
                          {getSelectedSkillDetails()?.requiredSect}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Current level and progress */}
                  {game.martialArts[selectedSkill]?.unlocked && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-medium">Current Level</h3>
                        <p className="font-medium">
                          {game.martialArts[selectedSkill]?.level || 1} / {getSelectedSkillDetails()?.maxLevel}
                        </p>
                      </div>
                      <Progress 
                        value={(game.martialArts[selectedSkill]?.level || 1) / getSelectedSkillDetails()!.maxLevel * 100} 
                        className="h-2 bg-gray-200" 
                      />
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  {!game.martialArts[selectedSkill]?.unlocked ? (
                    <Button
                      onClick={() => handleUnlockSkill(selectedSkill, getSelectedSkillDetails()!)}
                      disabled={!meetsRequirements(getSelectedSkillDetails()!)}
                      className="w-full"
                    >
                      Unlock ({getSelectedSkillDetails()?.unlockCost || 0} Qi Stones)
                    </Button>
                  ) : game.martialArts[selectedSkill]?.level < getSelectedSkillDetails()!.maxLevel ? (
                    <Button
                      onClick={() => handleUpgradeSkill(selectedSkill, getSelectedSkillDetails()!)}
                      className="w-full"
                    >
                      Upgrade to Level {(game.martialArts[selectedSkill]?.level || 1) + 1} 
                      ({Math.floor((getSelectedSkillDetails()?.unlockCost || 100) / 5) * ((game.martialArts[selectedSkill]?.level || 1) + 1)} Qi Stones)
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      Maximum Level Reached
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Skill Card Component
function SkillCard({ 
  skillId, 
  skill, 
  onClick, 
  state, 
  currentLevel, 
  damage 
}: { 
  skillId: string;
  skill: ExtendedMartialArt;
  onClick: () => void;
  state: 'unlocked' | 'available' | 'locked';
  currentLevel: number;
  damage: number;
}) {
  // Get color scheme based on state
  const getColorScheme = () => {
    switch (state) {
      case 'unlocked':
        return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:border-amber-300';
      case 'available':
        return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:border-emerald-300';
      case 'locked':
        return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:border-gray-300 opacity-75';
    }
  };
  
  return (
    <Card 
      className={`cursor-pointer transition-all border-2 ${getColorScheme()}`}
      onClick={onClick}
    >
      <CardHeader className={`pb-2 ${state === 'locked' ? 'opacity-50' : ''}`}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            <i className={`fas ${skill.icon.startsWith('fa-') ? skill.icon : 'fa-'+skill.icon} text-${
              skill.type === 'attack' ? 'red' :
              skill.type === 'defense' ? 'blue' :
              skill.type === 'utility' ? 'purple' :
              'amber'
            }-500`}></i>
            <div>
              {skill.name}
              <div className="text-xs font-normal text-gray-500">{skill.chineseName}</div>
            </div>
          </CardTitle>
          <Badge className={`${
            state === 'unlocked' 
              ? 'bg-amber-100 text-amber-800' 
              : state === 'available'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-gray-100 text-gray-800'
          }`}>
            {state === 'unlocked' ? `Lv ${currentLevel}` : state === 'available' ? 'Available' : 'Locked'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-2 mb-3">{skill.description}</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="font-medium text-gray-500">Damage</p>
            <p>{damage}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Cost</p>
            <p>{skill.cost} Qi</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Cooldown</p>
            <p>{skill.cooldown}s</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-3">
        <div className="w-full text-xs text-gray-500 flex justify-between items-center">
          <span>Required: Level {skill.requiredLevel}</span>
          <span className="capitalize">{skill.type}</span>
        </div>
      </CardFooter>
    </Card>
  );
}