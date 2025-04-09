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

// Game settings and mechanics
export const DEFAULT_QI_PER_CLICK = 5;
export const BASE_QI_RATE = 0.2;
export const BASE_STORAGE = 1000;
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
