// Game constants
export const REALMS = {
  qi: {
    name: 'Qi Condensation',
    chineseName: '气凝',
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    description: 'As the Qi circulates through your meridians, you feel a gentle warmth spreading through your body. Your spiritual senses are slowly awakening to the world around you.'
  },
  foundation: {
    name: 'Foundation Establishment',
    chineseName: '筑基',
    color: 'bg-purple-500',
    textColor: 'text-purple-500',
    description: 'Your Qi has begun to solidify, forming a stable core within your dantian. The world around you appears more vibrant as your perception expands.'
  },
  core: {
    name: 'Core Formation',
    chineseName: '结丹',
    color: 'bg-pink-500',
    textColor: 'text-pink-500',
    description: 'Your spiritual core takes shape, pulsing with power. Lesser cultivators can sense your presence from a distance.'
  },
  spirit: {
    name: 'Spirit Severing',
    chineseName: '元婴',
    color: 'bg-red-500',
    textColor: 'text-red-500',
    description: 'You have transcended the physical world, capable of separating your spirit from your mortal form. The heavens and earth respond to your will.'
  },
  void: {
    name: 'Void Integration',
    chineseName: '化神',
    color: 'bg-blue-700',
    textColor: 'text-blue-700',
    description: 'The barriers between you and the void blur as your consciousness expands beyond the material plane. You exist in harmony with the universe itself.'
  },
  celestial: {
    name: 'Celestial Ascension',
    chineseName: '大乘',
    color: 'bg-amber-500',
    textColor: 'text-amber-500',
    description: 'You have transcended mortal limitations. Your mere presence causes natural phenomena to respond, and immortality is within your grasp.'
  }
};

export const UPGRADES = {
  meridian: {
    name: 'Meridian Expansion',
    description: 'Increases Qi storage capacity',
    baseCost: 50,
    costMultiplier: 1.5,
    effectPerLevel: 0.1, // 10% increase per level
    effectDescription: (level: number) => `+${level * 10}% Qi capacity`,
    maxLevel: 10
  },
  circulation: {
    name: 'Qi Circulation',
    description: 'Increases passive Qi generation',
    baseCost: 75,
    costMultiplier: 1.6,
    effectPerLevel: 0.1, // 0.1 Qi/s per level
    effectDescription: (level: number) => `+${level * 0.1} Qi/second`,
    maxLevel: 10
  },
  spirit: {
    name: 'Spirit Sense',
    description: 'Increases manual cultivation efficiency',
    baseCost: 100,
    costMultiplier: 1.7,
    effectPerLevel: 2, // +2 Qi per click per level
    effectDescription: (level: number) => `+${level * 2} Qi per click`,
    maxLevel: 10
  },
  breakthrough: {
    name: 'Breakthrough Insight',
    description: 'Improves breakthrough success rate',
    baseCost: 200,
    costMultiplier: 2,
    effectPerLevel: 0.05, // 5% increase per level
    effectDescription: (level: number) => `+${level * 5}% breakthrough chance`,
    maxLevel: 5,
    requiredRealm: 'foundation'
  }
};

export const SKILLS = {
  'basic-qi': {
    name: 'Basic Qi Cultivation',
    chineseName: '气功',
    description: 'Foundation technique that circulates Qi through your body\'s meridians.',
    baseCost: 75,
    costMultiplier: 1.5,
    effectPerLevel: 0.1, // 0.1 Qi/s per level
    effectDescription: (level: number) => `+${level * 0.1} Qi/second`,
    maxLevel: 10,
    requiredRealm: 'qi',
    requiredStage: 1
  },
  'fireheart': {
    name: 'Fireheart Scripture',
    chineseName: '火心诀',
    description: 'Harness the power of inner fire to accelerate Qi generation.',
    baseCost: 200,
    costMultiplier: 1.8,
    effectPerLevel: 0.3, // 0.3 Qi/s per level
    effectDescription: (level: number) => `+${level * 0.3} Qi/second`,
    maxLevel: 10,
    requiredRealm: 'foundation',
    requiredStage: 1
  },
  'mystic-ice': {
    name: 'Mystic Ice Method',
    chineseName: '玄冰诀',
    description: 'Condense spiritual energy into mystic ice, enhancing breakthrough chance.',
    baseCost: 350,
    costMultiplier: 1.9,
    effectPerLevel: 0.05, // 5% per level
    effectDescription: (level: number) => `+${level * 5}% breakthrough chance`,
    maxLevel: 10,
    requiredRealm: 'qi',
    requiredStage: 7
  }
};

export const ACHIEVEMENTS = {
  firstSteps: {
    name: 'First Steps',
    description: 'Begin your cultivation journey',
    icon: 'seedling',
    requirement: (state: any) => state.timesMeditated >= 1
  },
  qiFlow: {
    name: 'Qi Flow',
    description: 'Reach 100 Qi for the first time',
    icon: 'fire',
    requirement: (state: any) => state.highestQi >= 100
  },
  foundationSeeker: {
    name: 'Foundation Seeker',
    description: 'Reach Foundation Establishment realm',
    icon: 'mountain',
    requirement: (state: any) => state.realm === 'foundation'
  },
  techniqueMaster: {
    name: 'Technique Master',
    description: 'Max out any cultivation technique',
    icon: 'book-open',
    requirement: (state: any) => 
      Object.values(state.skills).some((skill: any) => skill.level >= skill.maxLevel)
  },
  diligentCultivator: {
    name: 'Diligent Cultivator',
    description: 'Meditate 100 times',
    icon: 'om',
    requirement: (state: any) => state.timesMeditated >= 100
  },
  qiReservoir: {
    name: 'Qi Reservoir',
    description: 'Accumulate 1,000 Qi at once',
    icon: 'water',
    requirement: (state: any) => state.highestQi >= 1000
  }
};

// Sects and their unique benefits
export const SECTS = {
  'righteous': {
    name: 'Virtuous Sword Sect',
    chineseName: '正气剑派',
    description: 'A renowned righteous sect that produces heroic disciples and emphasizes discipline, honor, and sword cultivation.',
    icon: 'sword',
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    benefits: {
      description: 'Increases breakthrough success rate by 10%',
      effect: (state: any) => ({
        ...state,
        // 10% higher breakthrough chance
        breakthroughBonus: 0.1
      })
    }
  },
  'demonic': {
    name: 'Blood Shadow Cult',
    chineseName: '血影魔宗',
    description: 'A feared demonic cult that pursues power through any means necessary, including forbidden techniques.',
    icon: 'skull',
    color: 'bg-red-600',
    textColor: 'text-red-600',
    benefits: {
      description: 'Doubles your base Qi generation',
      effect: (state: any) => ({
        ...state,
        // Double base Qi rate
        qiMultiplier: 2
      })
    }
  },
  'scholarly': {
    name: 'Azure Clouds Academy',
    chineseName: '青云书院',
    description: 'An ancient academy focusing on scholarly pursuits and the refinement of spiritual knowledge.',
    icon: 'book',
    color: 'bg-cyan-500',
    textColor: 'text-cyan-500',
    benefits: {
      description: 'Reduces all technique upgrade costs by 15%',
      effect: (state: any) => ({
        ...state,
        // 15% cost reduction for techniques
        skillCostReduction: 0.15
      })
    }
  },
  'medical': {
    name: 'Divine Healing Pavilion',
    chineseName: '神医阁',
    description: 'A sect dedicated to the healing arts and medicinal cultivation, with unparalleled skill in herb crafting.',
    icon: 'mortar-pestle',
    color: 'bg-green-500',
    textColor: 'text-green-500',
    benefits: {
      description: 'Increases health regeneration by 20% and herb quality',
      effect: (state: any) => ({
        ...state,
        // 20% regeneration bonus
        healthRegenBonus: 0.2,
        // Better herb quality
        herbQualityBonus: 1
      })
    }
  },
  'hidden': {
    name: 'Misty Valley Hermits',
    chineseName: '幽谷隐士',
    description: 'A reclusive group of cultivators who have withdrawn from worldly affairs to pursue the ultimate dao.',
    icon: 'mountain',
    color: 'bg-purple-500',
    textColor: 'text-purple-500',
    benefits: {
      description: 'Increases cultivation speed by 15% when offline',
      effect: (state: any) => ({
        ...state,
        // 15% offline progress bonus
        offlineProgressBonus: 0.15
      })
    }
  }
};

// Martial Arts techniques
export const MARTIAL_ARTS = {
  // Basic techniques - available to everyone
  'palm-strike': {
    name: 'Azure Dragon Palm',
    chineseName: '青龙掌',
    description: 'A basic yet powerful palm technique that channels Qi to strike opponents.',
    damage: 15,
    cost: 5,
    cooldown: 2,
    type: 'attack',
    attributeScaling: 'strength',
    icon: 'hand-rock',
    requiredLevel: 1,
    maxLevel: 10,
    requiredRealm: 'qi',
    requiredStage: 1
  },
  'iron-body': {
    name: 'Iron Body Technique',
    chineseName: '铁身功',
    description: 'Hardens your body by circulating Qi through muscles and skin, reducing incoming damage.',
    damage: 0,
    cost: 8,
    cooldown: 10,
    type: 'defense',
    attributeScaling: 'endurance',
    icon: 'shield-alt',
    requiredLevel: 5,
    maxLevel: 10,
    requiredRealm: 'qi',
    requiredStage: 3
  },
  'spirit-step': {
    name: 'Phantom Spirit Step',
    chineseName: '幻灵步',
    description: 'A movement technique that allows for quick, almost teleport-like dashes using Qi.',
    damage: 0,
    cost: 10,
    cooldown: 8,
    type: 'utility',
    attributeScaling: 'agility',
    icon: 'wind',
    requiredLevel: 10,
    maxLevel: 10,
    requiredRealm: 'qi',
    requiredStage: 5
  },
  
  // Sect-specific techniques
  'sword-domain': {
    name: 'Virtuous Sword Domain',
    chineseName: '正气剑域',
    description: 'Creates a domain of sword Qi that inflicts continuous damage to all enemies within range.',
    damage: 40,
    cost: 50,
    cooldown: 30,
    type: 'ultimate',
    attributeScaling: 'intelligence',
    icon: 'swords',
    requiredLevel: 20,
    maxLevel: 20,
    requiredRealm: 'foundation',
    requiredStage: 1,
    requiredSect: 'righteous'
  },
  'blood-sacrifice': {
    name: 'Blood Sacrifice Ritual',
    chineseName: '血祭术',
    description: 'Sacrifices your health to unleash devastating demonic energy against enemies.',
    damage: 80,
    cost: 30,
    cooldown: 40,
    type: 'ultimate',
    attributeScaling: 'strength',
    icon: 'tint',
    requiredLevel: 20,
    maxLevel: 20,
    requiredRealm: 'foundation',
    requiredStage: 1,
    requiredSect: 'demonic'
  },
  'wisdom-sutra': {
    name: 'Celestial Wisdom Sutra',
    chineseName: '天元智经',
    description: 'Temporarily enhances your comprehension of the Dao, increasing all attributes.',
    damage: 0,
    cost: 40,
    cooldown: 60,
    type: 'utility',
    attributeScaling: 'intelligence',
    icon: 'brain',
    requiredLevel: 20,
    maxLevel: 20,
    requiredRealm: 'foundation',
    requiredStage: 1,
    requiredSect: 'scholarly'
  },
  'healing-lotus': {
    name: 'Divine Healing Lotus',
    chineseName: '神愈莲华',
    description: 'Manifests a spiritual lotus that continuously heals you and nearby allies.',
    damage: 0,
    cost: 35,
    cooldown: 45,
    type: 'utility',
    attributeScaling: 'perception',
    icon: 'first-aid',
    requiredLevel: 20,
    maxLevel: 20,
    requiredRealm: 'foundation',
    requiredStage: 1,
    requiredSect: 'medical'
  },
  'vanishing-technique': {
    name: 'Misty Vanishing Technique',
    chineseName: '烟隐术',
    description: 'Become one with the mist, becoming temporarily intangible and avoiding all damage.',
    damage: 0,
    cost: 30,
    cooldown: 50,
    type: 'defense',
    attributeScaling: 'agility',
    icon: 'ghost',
    requiredLevel: 20,
    maxLevel: 20,
    requiredRealm: 'foundation',
    requiredStage: 1,
    requiredSect: 'hidden'
  }
};

// Map/location information
export const LOCATIONS = {
  'sect': {
    name: 'Sect Grounds',
    description: 'Your sect\'s home base, where disciples train and elders impart wisdom.',
    requiredLevel: 1,
    activities: ['train', 'meditate', 'study', 'visit-elders']
  },
  'forest': {
    name: 'Ancient Spirit Forest',
    description: 'A mystical forest filled with spiritual energy and low-level beasts.',
    requiredLevel: 5,
    activities: ['explore', 'gather-herbs', 'hunt', 'meditate']
  },
  'mountain': {
    name: 'Azure Peak Mountain',
    description: 'A towering mountain with harsh conditions that temper the body and spirit.',
    requiredLevel: 15,
    activities: ['explore', 'mine-spiritual-stones', 'face-trial', 'secluded-cultivation']
  },
  'city': {
    name: 'Spirit Dragon City',
    description: 'A bustling city where cultivators from all sects gather to trade and exchange information.',
    requiredLevel: 10,
    activities: ['trade', 'gather-information', 'take-missions', 'auction-house']
  },
  'ruins': {
    name: 'Forgotten Immortal Ruins',
    description: 'Ancient ruins left by past immortals, filled with dangers and treasures.',
    requiredLevel: 25,
    activities: ['explore', 'search-for-treasures', 'fight-guardians', 'study-formations']
  }
};

// Enemy types for combat
export const ENEMIES = {
  // Basic enemies
  'beast': {
    name: 'Spirit Beast',
    description: 'A wild beast that has absorbed spiritual energy from its environment.',
    health: 50,
    attack: 5,
    defense: 2,
    rewards: {
      experience: 10,
      spiritualStones: 5,
      loot: ['beast-core', 'hide']
    }
  },
  'bandit': {
    name: 'Rogue Cultivator',
    description: 'A cultivator who has strayed from the righteous path and now preys on others.',
    health: 80,
    attack: 8,
    defense: 4,
    rewards: {
      experience: 15,
      spiritualStones: 10,
      loot: ['low-grade-pill', 'technique-scroll']
    }
  },
  
  // Advanced enemies
  'guardian': {
    name: 'Ancient Guardian',
    description: 'A construct created by ancient cultivators to protect their treasures.',
    health: 200,
    attack: 15,
    defense: 10,
    rewards: {
      experience: 40,
      spiritualStones: 30,
      loot: ['artifact-fragment', 'ancient-manual']
    }
  },
  'demon': {
    name: 'Lesser Demon',
    description: 'A malevolent entity born from the negative energy of the world.',
    health: 150,
    attack: 20,
    defense: 5,
    rewards: {
      experience: 50,
      spiritualStones: 25,
      loot: ['demon-core', 'forbidden-scroll']
    }
  }
};

// Game settings and mechanics
export const DEFAULT_QI_PER_CLICK = 5;
export const BASE_QI_RATE = 0.2;
export const BASE_STORAGE = 1000;
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
export const COMBAT_TICK_RATE = 1000; // 1 second
