import React, { useState, useEffect } from 'react';
import { useGameEngine } from '@/lib/gameEngine';
import { MARTIAL_ARTS, REALMS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

type SkillCategory = "attack" | "defense" | "utility" | "ultimate";

interface SkillEffect {
  type: 'damage' | 'heal' | 'defense' | 'poison' | 'lifesteal' | 'buff';
  value: number; // Percentage or flat value
  duration?: number; // Duration in seconds if applicable
  description: string;
}

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

function getMartialArtsData(): Record<string, ExtendedMartialArt> {
  // Extend the base martial arts with additional data
  const extendedData: Record<string, ExtendedMartialArt> = {};
  
  // Add all the martial arts from constants
  Object.entries(MARTIAL_ARTS).forEach(([id, skill]) => {
    // Cast the skill to any to handle the basic structure
    const baseSkill = skill as any;
    
    // Create extended martial art with default values
    extendedData[id] = {
      id,
      ...baseSkill,
      effects: baseSkill.effects || [],
      prerequisites: baseSkill.prerequisites || []
    };
  });
  
  // Add special effects to certain skills
  if (extendedData['demonic-palm']) {
    extendedData['demonic-palm'].effects = [
      {
        type: 'lifesteal',
        value: 30,
        description: 'Drains 30% of damage dealt as health'
      }
    ];
  }
  
  if (extendedData['iron-body']) {
    extendedData['iron-body'].effects = [
      {
        type: 'defense',
        value: 40,
        duration: 20,
        description: 'Increases defense by 40% for 20 seconds'
      }
    ];
  }
  
  if (extendedData['spirit-step']) {
    extendedData['spirit-step'].effects = [
      {
        type: 'buff',
        value: 50,
        duration: 10,
        description: 'Increases dodge rate by 50% for 10 seconds'
      }
    ];
  }
  
  if (extendedData['blood-sacrifice']) {
    extendedData['blood-sacrifice'].effects = [
      {
        type: 'damage',
        value: 150,
        description: 'Deals 150% bonus damage at the cost of 20% max health'
      }
    ];
  }
  
  // Add additional skills not in constants for more variety
  
  // Ancient Dragon Scales technique
  extendedData['dragon-scales'] = {
    id: 'dragon-scales',
    name: 'Ancient Dragon Scales',
    chineseName: '太古龙鳞',
    description: 'Covers your body with spiritual dragon scales, providing powerful defense against all types of damage.',
    damage: 0,
    cost: 30,
    cooldown: 45,
    type: 'defense',
    attributeScaling: 'endurance',
    icon: 'dragon',
    requiredLevel: 15,
    maxLevel: 10,
    requiredRealm: 'foundation',
    requiredStage: 1,
    unlockCost: 200,
    effects: [
      {
        type: 'defense',
        value: 75,
        duration: 30,
        description: 'Reduces all incoming damage by 75% for 30 seconds'
      }
    ]
  };
  
  // Five Elements Harmony
  extendedData['five-elements'] = {
    id: 'five-elements',
    name: 'Five Elements Harmony',
    chineseName: '五行相生',
    description: 'Harness the power of the five elements - metal, wood, water, fire, and earth - to recover vital energy.',
    damage: 0,
    cost: 25,
    cooldown: 60,
    type: 'utility',
    attributeScaling: 'intelligence',
    icon: 'circle-notch',
    requiredLevel: 20,
    maxLevel: 10,
    requiredRealm: 'foundation',
    requiredStage: 3,
    unlockCost: 300,
    effects: [
      {
        type: 'heal',
        value: 50,
        description: 'Instantly recovers 50% of max health'
      }
    ]
  };
  
  // Venomous Palm
  extendedData['venomous-palm'] = {
    id: 'venomous-palm',
    name: 'Venomous Jade Palm',
    chineseName: '碧玉毒掌',
    description: 'A devious technique that injects deadly poison into the enemy, causing lasting damage over time.',
    damage: 20,
    cost: 20,
    cooldown: 15,
    type: 'attack',
    attributeScaling: 'spirit',
    icon: 'hand-paper',
    requiredLevel: 25,
    maxLevel: 10,
    requiredRealm: 'foundation',
    requiredStage: 4,
    unlockCost: 350,
    effects: [
      {
        type: 'poison',
        value: 10,
        duration: 30,
        description: 'Poisons the target, dealing 10% of initial strike damage per second for 30 seconds'
      }
    ],
    prerequisites: ['demonic-palm']
  };
  
  // Heaven's Thunder
  extendedData['heavens-thunder'] = {
    id: 'heavens-thunder',
    name: "Heaven's Thunder Call",
    chineseName: '天雷召唤',
    description: 'Summon lightning from the heavens to strike down your enemies with divine judgment.',
    damage: 120,
    cost: 60,
    cooldown: 90,
    type: 'ultimate',
    attributeScaling: 'spirit',
    icon: 'bolt',
    requiredLevel: 30,
    maxLevel: 5,
    requiredRealm: 'core',
    requiredStage: 1,
    unlockCost: 500,
    effects: [
      {
        type: 'damage',
        value: 200,
        description: 'Massive area damage that ignores 50% of enemy defense'
      }
    ]
  };
  
  // Set prerequisites for advanced skills
  if (extendedData['sword-domain']) {
    extendedData['sword-domain'].prerequisites = ['palm-strike', 'iron-body'];
  }
  
  // Add more prerequisites for variety
  if (extendedData['dragon-scales']) {
    extendedData['dragon-scales'].prerequisites = ['iron-body'];
  }
  
  if (extendedData['heavens-thunder']) {
    extendedData['heavens-thunder'].prerequisites = ['five-elements'];
  }
  
  // Return the complete dataset
  return extendedData;
}

export default function SkillTree() {
  const { game, updateGameState } = useGameEngine();
  const isMobile = useIsMobile();
  const [selectedTab, setSelectedTab] = useState<SkillCategory>("attack");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  
  // Get all the martial arts with extended data
  const skillsData = getMartialArtsData();
  
  // Get skills by category
  const getSkillsByCategory = (category: SkillCategory) => {
    return Object.entries(skillsData).filter(([_, skill]) => 
      skill.type === category
    );
  };
  
  // Check if player meets requirements to unlock a skill
  const meetsRequirements = (skill: ExtendedMartialArt) => {
    // Check level requirement
    if (game.cultivationLevel < skill.requiredLevel) return false;
    
    // Check realm requirement
    const realmProgress = { 
      qi: 1, 
      foundation: 2, 
      core: 3, 
      nascent: 4, 
      divine: 5 
    };
    
    const playerRealmValue = realmProgress[game.cultivationRealm as keyof typeof realmProgress] || 0;
    const requiredRealmValue = realmProgress[skill.requiredRealm as keyof typeof realmProgress] || 0;
    
    if (playerRealmValue < requiredRealmValue) return false;
    
    // Check stage requirement if in the same realm
    if (playerRealmValue === requiredRealmValue && 
        game.cultivationStage < skill.requiredStage) return false;
    
    // Check sect requirement if any
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
          unlocked: true,
          level: 1
        }
      };
      
      return {
        ...state,
        martialArts: updatedMartialArts,
        spiritualStones: state.spiritualStones - (skill.unlockCost || 0)
      };
    });
    
    toast({
      title: "Skill Unlocked",
      description: `You have successfully unlocked ${skill.name}!`,
      variant: "default"
    });
  };
  
  // Handle upgrading a skill
  const handleUpgradeSkill = (skillId: string, skill: ExtendedMartialArt) => {
    const currentLevel = game.martialArts[skillId]?.level || 1;
    
    // Check if already at max level
    if (currentLevel >= skill.maxLevel) {
      toast({
        title: "Maximum Level Reached",
        description: `${skill.name} is already at maximum level.`,
        variant: "destructive"
      });
      return;
    }
    
    // Calculate upgrade cost
    const upgradeCost = Math.floor((skill.unlockCost || 100) / 5) * (currentLevel + 1);
    
    // Check if enough resources
    if (game.spiritualStones < upgradeCost) {
      toast({
        title: "Not enough Qi Stones",
        description: `You need ${upgradeCost} Qi Stones to upgrade this skill.`,
        variant: "destructive"
      });
      return;
    }
    
    // Upgrade the skill
    updateGameState(state => {
      const updatedMartialArts = {
        ...state.martialArts,
        [skillId]: {
          unlocked: true,
          level: currentLevel + 1
        }
      };
      
      return {
        ...state,
        martialArts: updatedMartialArts,
        spiritualStones: state.spiritualStones - upgradeCost
      };
    });
    
    toast({
      title: "Skill Upgraded",
      description: `${skill.name} has been upgraded to level ${currentLevel + 1}!`,
      variant: "default"
    });
  };
  
  // Calculate skill damage with level bonuses
  const calculateSkillDamage = (skillId: string, skill: ExtendedMartialArt) => {
    const skillLevel = game.martialArts[skillId]?.level || 1;
    const baseDamage = skill.damage;
    
    // 10% increase per level
    return Math.floor(baseDamage * (1 + (skillLevel - 1) * 0.1));
  };
  
  // Get the selected skill details
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
              <div className="bg-blue-50 p-3 rounded-md shadow-inner">
                <p className="font-medium text-blue-800 mb-1">Current Realm</p>
                <p className="text-xl capitalize">
                  {game.cultivationRealm} Stage {game.cultivationStage}
                </p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-md shadow-inner">
                <p className="font-medium text-emerald-800 mb-1">Qi Stones</p>
                <p className="text-xl">{game.spiritualStones}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="relative">
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
        </div>
        
        {/* Skill Detail Dialog */}
        <Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
          <DialogContent className="max-w-xl">
            {selectedSkill && getSelectedSkillDetails() && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-2xl">
                    <i className={"fas fa-" + (getSelectedSkillDetails()?.icon || "")}></i>
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
                            <i className={"fas fa-" + (
                              effect.type === 'damage' ? 'bolt' :
                              effect.type === 'heal' ? 'heart' :
                              effect.type === 'defense' ? 'shield-alt' :
                              effect.type === 'poison' ? 'skull' :
                              effect.type === 'lifesteal' ? 'tint' :
                              'magic'
                            ) + " text-" + (
                              effect.type === 'damage' ? 'orange' :
                              effect.type === 'heal' ? 'pink' :
                              effect.type === 'defense' ? 'blue' :
                              effect.type === 'poison' ? 'green' :
                              effect.type === 'lifesteal' ? 'red' :
                              'purple'
                            ) + "-500"}></i>
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
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:border-gray-300 opacity-75';
    }
  };
  
  return (
    <Card 
      className={"cursor-pointer transition-all border-2 " + getColorScheme()}
      onClick={onClick}
    >
      <CardHeader className={"pb-2 " + (state === 'locked' ? 'opacity-50' : '')}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            <i className={"fas " + (skill.icon.startsWith('fa-') ? skill.icon : 'fa-'+skill.icon) + " text-" + (
              skill.type === 'attack' ? 'red' :
              skill.type === 'defense' ? 'blue' :
              skill.type === 'utility' ? 'purple' :
              'amber'
            ) + "-500"}></i>
            <div>
              {skill.name}
              <div className="text-xs font-normal text-gray-500">{skill.chineseName}</div>
            </div>
          </CardTitle>
          <Badge className={
            state === 'unlocked' 
              ? 'bg-amber-100 text-amber-800' 
              : state === 'available'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-gray-100 text-gray-800'
          }>
            {state === 'unlocked' ? "Lv " + currentLevel : state === 'available' ? 'Available' : 'Locked'}
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