import { REALMS, UPGRADES, SKILLS, ACHIEVEMENTS, BASE_QI_RATE, DEFAULT_QI_PER_CLICK, BASE_STORAGE } from './constants';
import type { GameState } from '@shared/schema';

// Default initial game state
export function getInitialGameState(): GameState {
  // Build upgrades object
  const upgrades: Record<string, { level: number, cost: number }> = {};
  Object.entries(UPGRADES).forEach(([id, upgrade]) => {
    upgrades[id] = {
      level: 0,
      cost: upgrade.baseCost
    };
  });

  // Build skills object
  const skills: Record<string, { level: number, maxLevel: number, unlocked: boolean, cost: number, effect: number }> = {};
  Object.entries(SKILLS).forEach(([id, skill]) => {
    // Only basic-qi is unlocked at the start
    const unlocked = id === 'basic-qi';
    skills[id] = {
      level: id === 'basic-qi' ? 1 : 0, // Start with level 1 basic qi
      maxLevel: skill.maxLevel,
      unlocked,
      cost: skill.baseCost,
      effect: id === 'basic-qi' ? skill.effectPerLevel : 0 // Start with basic effect
    };
  });

  // Build achievements object
  const achievements: Record<string, { earned: boolean, timestamp?: string }> = {};
  Object.keys(ACHIEVEMENTS).forEach(id => {
    achievements[id] = {
      earned: false
    };
  });

  return {
    // Character info
    characterCreated: false,
    characterName: undefined,
    sect: undefined,
    
    // Basic cultivation stats
    energy: 0,
    energyRate: BASE_QI_RATE + 0.1, // Base + basic-qi level 1
    manualCultivationAmount: DEFAULT_QI_PER_CLICK,
    cultivationLevel: 1,
    cultivationProgress: 0,
    maxCultivationProgress: BASE_STORAGE,
    realm: 'qi',
    realmStage: 1,
    realmMaxStage: 9,
    
    // Attributes
    attributes: {
      strength: 10,
      agility: 10,
      endurance: 10,
      intelligence: 10,
      perception: 10
    },
    
    // Combat stats
    health: 100,
    maxHealth: 100,
    defense: 5,
    attack: 10,
    critChance: 5,
    dodgeChance: 5,
    
    // Martial arts techniques - empty initially
    martialArts: {},
    
    // Inventory
    inventory: {
      spiritualStones: 0,
      herbs: {},
      equipment: {}
    },
    
    // Exploration
    exploration: {
      currentArea: "sect",
      discoveredAreas: { "sect": true },
      completedChallenges: {},
      dailyTasksCompleted: {}
    },
    
    // NPC relations
    npcRelations: {},
    
    // Original stats
    totalQiGenerated: 0,
    timesMeditated: 0,
    successfulBreakthroughs: 0,
    failedBreakthroughs: 0,
    highestQi: 0,
    timeCultivating: 0, // In seconds
    lastSaved: new Date().toISOString(),
    
    // Systems
    upgrades,
    skills,
    achievements
  };
}

// Get current realm data
export function getCurrentRealmData(state: GameState) {
  return REALMS[state.realm as keyof typeof REALMS];
}

// Check if upgrade is available
export function isUpgradeAvailable(state: GameState, upgradeId: string): boolean {
  const upgrade = UPGRADES[upgradeId as keyof typeof UPGRADES];
  const currentLevel = state.upgrades[upgradeId]?.level || 0;
  
  // Check if max level reached
  if (currentLevel >= upgrade.maxLevel) {
    return false;
  }
  
  // Check if required realm is reached
  if (upgrade.requiredRealm && state.realm !== upgrade.requiredRealm) {
    return false;
  }
  
  return true;
}

// Calculate upgrade cost
export function getUpgradeCost(state: GameState, upgradeId: string): number {
  const upgrade = UPGRADES[upgradeId as keyof typeof UPGRADES];
  const currentLevel = state.upgrades[upgradeId]?.level || 0;
  
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
}

// Calculate skill cost
export function getSkillCost(state: GameState, skillId: string): number {
  const skill = SKILLS[skillId as keyof typeof SKILLS];
  const currentLevel = state.skills[skillId]?.level || 0;
  
  return Math.floor(skill.baseCost * Math.pow(skill.costMultiplier, currentLevel));
}

// Check if skill is available
export function isSkillAvailable(state: GameState, skillId: string): boolean {
  const skill = SKILLS[skillId as keyof typeof SKILLS];
  const currentLevel = state.skills[skillId]?.level || 0;
  
  // Check if max level reached
  if (currentLevel >= skill.maxLevel) {
    return false;
  }
  
  // Check if required realm and stage are reached
  if (
    (skill.requiredRealm && compareRealmProgress(state.realm, skill.requiredRealm) < 0) ||
    (skill.requiredRealm === state.realm && state.realmStage < (skill.requiredStage || 1))
  ) {
    return false;
  }
  
  return true;
}

// Helper function to compare realm progress
// Returns: -1 if realm1 < realm2, 0 if equal, 1 if realm1 > realm2
function compareRealmProgress(realm1: string, realm2: string): number {
  const realmOrder = ['qi', 'foundation', 'core', 'spirit', 'void', 'celestial'];
  const index1 = realmOrder.indexOf(realm1);
  const index2 = realmOrder.indexOf(realm2);
  
  if (index1 < index2) return -1;
  if (index1 > index2) return 1;
  return 0;
}

// Check if a breakthrough is possible
export function canBreakthrough(state: GameState): boolean {
  return state.energy >= state.maxCultivationProgress;
}

// Calculate breakthrough chance
export function getBreakthroughChance(state: GameState): number {
  // Base chance of 100%
  let chance = 100;
  
  // Add bonus from breakthrough insight upgrade
  chance += (state.upgrades.breakthrough?.level || 0) * UPGRADES.breakthrough.effectPerLevel * 100;
  
  // Add bonus from mystic ice method skill
  chance += (state.skills['mystic-ice']?.level || 0) * (SKILLS['mystic-ice'].effectPerLevel * 100);
  
  return Math.min(chance, 100); // Cap at 100%
}

// Calculate next level requirements
export function getNextLevelRequirements(state: GameState): number {
  const baseRequirement = BASE_STORAGE;
  
  // Increase by 50% per level
  return Math.floor(baseRequirement * Math.pow(1.5, state.cultivationLevel - 1));
}

// Check achievements and update earned status
export function updateAchievements(state: GameState): GameState {
  const newState = { ...state };
  
  Object.entries(ACHIEVEMENTS).forEach(([id, achievement]) => {
    // Skip already earned achievements
    if (newState.achievements[id]?.earned) return;
    
    // Check if achievement requirement is met
    if (achievement.requirement(newState)) {
      newState.achievements[id] = {
        earned: true,
        timestamp: new Date().toISOString()
      };
    }
  });
  
  return newState;
}

// Get all unearned achievements
export function getUnearnedAchievements(state: GameState): string[] {
  return Object.keys(state.achievements).filter(id => !state.achievements[id].earned);
}
