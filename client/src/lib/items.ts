// Define weapons and equipment for the game

import type { GameState } from '@shared/schema';

// --------------------- WEAPONS ---------------------
export const WEAPONS = {
  // Common weapons (1-25)
  'wooden-sword': {
    id: 'wooden-sword',
    name: 'Wooden Training Sword',
    type: 'sword',
    rarity: 'common',
    level: 1,
    stats: { attack: 5 },
    icon: 'sword',
    description: 'A simple wooden sword used by disciples for training.',
    price: { gold: 50 },
    requiredLevel: 1
  },
  'iron-saber': {
    id: 'iron-saber',
    name: 'Iron Saber',
    type: 'saber',
    rarity: 'common',
    level: 5,
    stats: { attack: 10, critChance: 2 },
    icon: 'saber',
    description: 'A curved blade made of common iron, slightly better than training weapons.',
    price: { gold: 150 },
    requiredLevel: 5
  },
  'bamboo-staff': {
    id: 'bamboo-staff',
    name: 'Bamboo Staff',
    type: 'staff',
    rarity: 'common',
    level: 3,
    stats: { attack: 7, defense: 3 },
    icon: 'staff',
    description: 'A flexible yet sturdy staff made from seasoned bamboo.',
    price: { gold: 100 },
    requiredLevel: 3
  },
  'throwing-daggers': {
    id: 'throwing-daggers',
    name: 'Throwing Daggers',
    type: 'dagger',
    rarity: 'common',
    level: 4,
    stats: { attack: 8, agility: 2 },
    icon: 'daggers',
    description: 'A set of small, balanced daggers designed to be thrown with precision.',
    price: { gold: 120 },
    requiredLevel: 4
  },
  'hunting-bow': {
    id: 'hunting-bow',
    name: 'Hunting Bow',
    type: 'bow',
    rarity: 'common',
    level: 6,
    stats: { attack: 12, perception: 3 },
    icon: 'bow',
    description: 'A simple wooden bow used for hunting small game.',
    price: { gold: 180 },
    requiredLevel: 6
  },
  'folding-fan': {
    id: 'folding-fan',
    name: 'Iron-Ribbed Fan',
    type: 'fan',
    rarity: 'common',
    level: 8,
    stats: { attack: 9, intelligence: 4 },
    icon: 'fan',
    description: 'A seemingly ordinary fan with reinforced iron ribs, capable of deflecting attacks.',
    price: { gold: 200 },
    requiredLevel: 8
  },
  'chain-whip': {
    id: 'chain-whip',
    name: 'Chain Whip',
    type: 'whip',
    rarity: 'common',
    level: 10,
    stats: { attack: 15, reach: 5 },
    icon: 'whip',
    description: 'A flexible weapon made of connected metal rings, effective at keeping enemies at bay.',
    price: { gold: 250 },
    requiredLevel: 10
  },
  'stone-hammer': {
    id: 'stone-hammer',
    name: 'Stone Crusher',
    type: 'hammer',
    rarity: 'common',
    level: 12,
    stats: { attack: 20, strength: 5, speed: -5 },
    icon: 'hammer',
    description: 'A heavy hammer with a stone head, slow but powerful.',
    price: { gold: 300 },
    requiredLevel: 12
  },
  'woodcutters-axe': {
    id: 'woodcutters-axe',
    name: 'Woodcutter\'s Axe',
    type: 'axe',
    rarity: 'common',
    level: 7,
    stats: { attack: 14, strength: 3 },
    icon: 'axe',
    description: 'A sturdy axe designed for chopping wood, repurposed as a weapon.',
    price: { gold: 220 },
    requiredLevel: 7
  },
  'steel-sword': {
    id: 'steel-sword',
    name: 'Fine Steel Sword',
    type: 'sword',
    rarity: 'uncommon',
    level: 15,
    stats: { attack: 25, durability: 10 },
    icon: 'sword-fancy',
    description: 'A well-crafted sword made from quality steel, holding an edge much longer than iron weapons.',
    price: { gold: 500 },
    requiredLevel: 15
  },
  
  // Uncommon weapons
  'azure-blade': {
    id: 'azure-blade',
    name: 'Azure Dragon Blade',
    type: 'sword',
    rarity: 'uncommon',
    level: 20,
    stats: { attack: 35, qi: 10 },
    icon: 'sword-flame',
    description: 'A sword imbued with the essence of the Azure Dragon, capable of channeling qi.',
    price: { gold: 800, spiritualStones: 5 },
    requiredLevel: 20
  },
  'wind-saber': {
    id: 'wind-saber',
    name: 'Wind-Chasing Saber',
    type: 'saber',
    rarity: 'uncommon',
    level: 22,
    stats: { attack: 38, speed: 15 },
    icon: 'saber-wind',
    description: 'A light, curved blade that makes a whistling sound as it cuts through the air.',
    price: { gold: 850, spiritualStones: 6 },
    requiredLevel: 22
  },
  
  // Rare weapons
  'frost-spear': {
    id: 'frost-spear',
    name: 'Frost Piercer',
    type: 'spear',
    rarity: 'rare',
    level: 30,
    stats: { attack: 60, ice: 20 },
    icon: 'spear-ice',
    description: 'A spear with a head forged from frost-iron, capable of freezing enemies on contact.',
    price: { gold: 2000, spiritualStones: 25 },
    requiredLevel: 30
  },
  'shadow-daggers': {
    id: 'shadow-daggers',
    name: 'Shadow Walker\'s Fangs',
    type: 'dagger',
    rarity: 'rare',
    level: 35,
    stats: { attack: 55, stealth: 30 },
    icon: 'daggers-shadow',
    description: 'A pair of black daggers that seem to drink in light, favored by assassins.',
    price: { gold: 2500, spiritualStones: 30 },
    requiredLevel: 35
  },
  
  // Epic weapons
  'thunder-bow': {
    id: 'thunder-bow',
    name: 'Heavenly Thunder Bow',
    type: 'bow',
    rarity: 'epic',
    level: 45,
    stats: { attack: 90, lightning: 40 },
    icon: 'bow-lightning',
    description: 'A bow that channels lightning energy, firing arrows wreathed in crackling electricity.',
    price: { gold: 8000, spiritualStones: 100 },
    requiredLevel: 45
  },
  'blood-scythe': {
    id: 'blood-scythe',
    name: 'Blood Harvester',
    type: 'scythe',
    rarity: 'epic',
    level: 50,
    stats: { attack: 100, lifeSteal: 15 },
    icon: 'scythe-blood',
    description: 'A crimson scythe that drinks the life force of enemies, restoring the wielder\'s vitality.',
    price: { gold: 10000, spiritualStones: 120 },
    requiredLevel: 50
  },
  
  // Legendary weapons
  'celestial-sword': {
    id: 'celestial-sword',
    name: 'Sword of Celestial Ascension',
    type: 'sword',
    rarity: 'legendary',
    level: 70,
    stats: { attack: 150, allAttributes: 20 },
    icon: 'sword-divine',
    description: 'A legendary sword said to have fallen from the heavens, radiating divine energy.',
    price: { gold: 50000, spiritualStones: 500, qi: 10000 },
    requiredLevel: 70
  },
  'mountain-crusher': {
    id: 'mountain-crusher',
    name: 'Mountain Splitting Hammer',
    type: 'hammer',
    rarity: 'legendary',
    level: 75,
    stats: { attack: 200, earth: 50, strength: 30 },
    icon: 'hammer-mountain',
    description: 'A colossal hammer that can shatter mountains with a single strike.',
    price: { gold: 60000, spiritualStones: 550, qi: 12000 },
    requiredLevel: 75
  },
  
  // Mythic weapons
  'void-blade': {
    id: 'void-blade',
    name: 'Blade of the Void Emperor',
    type: 'sword',
    rarity: 'mythic',
    level: 90,
    stats: { attack: 300, void: 100, allAttributes: 50 },
    icon: 'sword-void',
    description: 'A sword that seems to exist between realms, capable of cutting through reality itself.',
    price: { gold: 200000, spiritualStones: 2000, qi: 50000 },
    requiredLevel: 90
  },
  'dragon-spine': {
    id: 'dragon-spine',
    name: 'Spear of the Dragon Sovereign',
    type: 'spear',
    rarity: 'mythic',
    level: 95,
    stats: { attack: 350, dragon: 120, penetration: 80 },
    icon: 'spear-dragon',
    description: 'A spear crafted from the spine of an ancient dragon, containing unfathomable power.',
    price: { gold: 250000, spiritualStones: 2500, qi: 60000 },
    requiredLevel: 95
  }
};

// --------------------- APPAREL ---------------------
export const APPAREL = {
  // Common apparel
  'cotton-robe': {
    id: 'cotton-robe',
    name: 'Cotton Disciple Robe',
    type: 'robe',
    rarity: 'common',
    level: 1,
    stats: { defense: 3 },
    icon: 'robe',
    description: 'Standard cotton robes worn by sect disciples.',
    price: { gold: 40 },
    requiredLevel: 1
  },
  'leather-boots': {
    id: 'leather-boots',
    name: 'Leather Boots',
    type: 'boots',
    rarity: 'common',
    level: 3,
    stats: { defense: 2, agility: 1 },
    icon: 'boots',
    description: 'Simple boots made from tanned leather.',
    price: { gold: 60 },
    requiredLevel: 3
  },
  'cloth-gloves': {
    id: 'cloth-gloves',
    name: 'Training Gloves',
    type: 'gloves',
    rarity: 'common',
    level: 2,
    stats: { defense: 1, dexterity: 1 },
    icon: 'gloves',
    description: 'Padded cloth gloves used during training.',
    price: { gold: 30 },
    requiredLevel: 2
  },
  'straw-hat': {
    id: 'straw-hat',
    name: 'Wide-Brimmed Straw Hat',
    type: 'hat',
    rarity: 'common',
    level: 4,
    stats: { defense: 2, heat: 5 },
    icon: 'hat',
    description: 'A simple hat that provides shade during long journeys.',
    price: { gold: 25 },
    requiredLevel: 4
  },
  'iron-belt': {
    id: 'iron-belt',
    name: 'Iron-Buckled Belt',
    type: 'belt',
    rarity: 'common',
    level: 5,
    stats: { defense: 4 },
    icon: 'belt',
    description: 'A sturdy leather belt with an iron buckle.',
    price: { gold: 45 },
    requiredLevel: 5
  }
};

// Function to get all weapons
export function getAllWeapons() {
  return Object.values(WEAPONS);
}

// Function to get weapons by rarity
export function getWeaponsByRarity(rarity: string) {
  return Object.values(WEAPONS).filter(weapon => weapon.rarity === rarity);
}

// Function to get weapons by level range
export function getWeaponsByLevelRange(minLevel: number, maxLevel: number) {
  return Object.values(WEAPONS).filter(
    weapon => weapon.requiredLevel >= minLevel && weapon.requiredLevel <= maxLevel
  );
}

// Function to get weapons available for a player's level
export function getAvailableWeapons(playerLevel: number) {
  return Object.values(WEAPONS).filter(weapon => weapon.requiredLevel <= playerLevel);
}