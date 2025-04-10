import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Game data for saving
export const playerData = pgTable("player_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  gameState: jsonb("game_state").notNull(),
  lastUpdated: text("last_updated").notNull(),
});

export const insertPlayerDataSchema = createInsertSchema(playerData).pick({
  userId: true,
  gameState: true,
  lastUpdated: true,
});

export type InsertPlayerData = z.infer<typeof insertPlayerDataSchema>;
export type PlayerData = typeof playerData.$inferSelect;

export const gameStateSchema = z.object({
  // Basic character info
  characterCreated: z.boolean().default(false),
  characterName: z.string().optional(),
  sect: z.string().optional(),
  
  // Settings flags
  isAutoSaveEnabled: z.boolean().default(true),
  isOfflineProgressEnabled: z.boolean().default(true),
  showNotifications: z.boolean().default(true),
  
  // Basic cultivation stats
  energy: z.number(),
  energyRate: z.number(),
  manualCultivationAmount: z.number(),
  cultivationLevel: z.number(),
  cultivationProgress: z.number(),
  maxCultivationProgress: z.number(),
  realm: z.string(),
  realmStage: z.number(),
  realmMaxStage: z.number(),
  
  // Attributes
  attributes: z.object({
    strength: z.number().default(10),
    agility: z.number().default(10),
    endurance: z.number().default(10),
    intelligence: z.number().default(10),
    perception: z.number().default(10)
  }).default({
    strength: 10,
    agility: 10,
    endurance: 10,
    intelligence: 10,
    perception: 10
  }),
  
  // Combat stats
  health: z.number().default(100),
  maxHealth: z.number().default(100),
  defense: z.number().default(5),
  attack: z.number().default(10),
  critChance: z.number().default(5),  // Percentage
  dodgeChance: z.number().default(5), // Percentage
  
  // Martial arts
  martialArts: z.record(z.object({
    id: z.string(),
    name: z.string(),
    level: z.number(),
    maxLevel: z.number(),
    unlocked: z.boolean(),
    description: z.string(),
    damage: z.number(),
    cost: z.number(),
    cooldown: z.number(),   // in seconds
    lastUsed: z.number().optional(), // timestamp
    type: z.enum(["attack", "defense", "utility", "ultimate"]),
    attributeScaling: z.enum(["strength", "agility", "endurance", "intelligence", "perception"])
  })).default({}),
  
  // Currencies
  gold: z.number().default(100),
  spiritualStones: z.number().default(10),
  
  // Inventory
  inventory: z.object({
    resources: z.record(z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number(),
      description: z.string(),
      icon: z.string(),
      value: z.number(), // gold value
      rarity: z.enum(["common", "uncommon", "rare", "epic", "legendary", "mythic"]).default("common")
    })).default({}),
    
    herbs: z.record(z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number(),
      quality: z.number(),  // 1-5 stars
      effects: z.record(z.number()),
      icon: z.string(),
      description: z.string(),
      value: z.number() // gold value
    })).default({}),
    
    weapons: z.record(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(["sword", "saber", "spear", "staff", "dagger", "bow", "fan", "whip", "hammer", "axe"]),
      rarity: z.enum(["common", "uncommon", "rare", "epic", "legendary", "mythic"]),
      level: z.number(),
      stats: z.record(z.number()),
      equipped: z.boolean().default(false),
      icon: z.string(),
      description: z.string(),
      price: z.object({
        gold: z.number().default(0),
        spiritualStones: z.number().default(0),
        qi: z.number().default(0)
      }),
      requiredLevel: z.number().default(1)
    })).default({}),
    
    apparel: z.record(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(["robe", "armor", "innerWear", "outerWear", "belt", "boots", "gloves", "hat", "mask", "accessory"]),
      rarity: z.enum(["common", "uncommon", "rare", "epic", "legendary", "mythic"]),
      level: z.number(),
      stats: z.record(z.number()),
      equipped: z.boolean().default(false),
      icon: z.string(),
      description: z.string(),
      price: z.object({
        gold: z.number().default(0),
        spiritualStones: z.number().default(0),
        qi: z.number().default(0)
      }),
      requiredLevel: z.number().default(1)
    })).default({}),
    
    artifacts: z.record(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(["talisman", "pill", "manual", "elixir", "treasure", "insignia"]),
      rarity: z.enum(["common", "uncommon", "rare", "epic", "legendary", "mythic"]),
      level: z.number(),
      stats: z.record(z.number()),
      equipped: z.boolean().default(false),
      icon: z.string(),
      description: z.string(),
      price: z.object({
        gold: z.number().default(0),
        spiritualStones: z.number().default(0),
        qi: z.number().default(0)
      }),
      requiredLevel: z.number().default(1)
    })).default({})
  }).default({
    resources: {},
    herbs: {},
    weapons: {},
    apparel: {},
    artifacts: {}
  }),
  
  // Map exploration
  exploration: z.object({
    currentArea: z.string().default("sect"),
    discoveredAreas: z.record(z.boolean()).default({}),
    completedChallenges: z.record(z.boolean()).default({}),
    dailyTasksCompleted: z.record(z.boolean()).default({}),
    huntingGrounds: z.record(z.object({
      discovered: z.boolean().default(false),
      cleared: z.boolean().default(false),
      lastVisit: z.string().optional(),
      treasuresFound: z.record(z.boolean()).default({})
    })).default({}),
    activeQuests: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      objective: z.string(),
      type: z.enum(["sect", "main", "side", "hidden", "daily", "weekly"]),
      progress: z.number().default(0),
      target: z.number(),
      rewards: z.object({
        gold: z.number().default(0),
        spiritualStones: z.number().default(0),
        experience: z.number().default(0),
        items: z.array(z.string()).default([])
      }),
      deadline: z.string().optional(),
      completed: z.boolean().default(false)
    })).default([]),
    completedQuests: z.array(z.string()).default([])
  }).default({
    currentArea: "sect",
    discoveredAreas: {},
    completedChallenges: {},
    dailyTasksCompleted: {},
    huntingGrounds: {},
    activeQuests: [],
    completedQuests: []
  }),
  
  // Sect activities and progress
  sectActivities: z.object({
    reputation: z.number().default(0), // 0-100 reputation with sect
    contributions: z.number().default(0), // total contributions to sect
    rank: z.string().default("Outer Disciple"),
    dailyTrainingCompleted: z.boolean().default(false),
    weeklyMissionCompleted: z.boolean().default(false),
    assignedTasks: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      deadline: z.string(), // ISO date string
      completed: z.boolean().default(false),
      rewards: z.object({
        gold: z.number().default(0),
        spiritualStones: z.number().default(0),
        reputation: z.number().default(0), 
        experience: z.number().default(0)
      })
    })).default([]),
    permissions: z.object({
      canAccessLibrary: z.boolean().default(false),
      canAccessRestrictedAreas: z.boolean().default(false),
      canTeachJuniors: z.boolean().default(false),
      canLeadMissions: z.boolean().default(false)
    }).default({
      canAccessLibrary: false,
      canAccessRestrictedAreas: false,
      canTeachJuniors: false,
      canLeadMissions: false
    })
  }).default({
    reputation: 0,
    contributions: 0,
    rank: "Outer Disciple",
    dailyTrainingCompleted: false,
    weeklyMissionCompleted: false,
    assignedTasks: [],
    permissions: {
      canAccessLibrary: false,
      canAccessRestrictedAreas: false,
      canTeachJuniors: false,
      canLeadMissions: false
    }
  }),
  
  // NPC interactions
  npcRelations: z.record(z.number()).default({}), // 0-100 relationship score
  
  // Original game tracking stats
  totalQiGenerated: z.number(),
  timesMeditated: z.number(),
  successfulBreakthroughs: z.number(),
  failedBreakthroughs: z.number(),
  highestQi: z.number(),
  timeCultivating: z.number(),
  lastSaved: z.string(),
  lastOfflineTime: z.string().optional(),
  
  // Systems
  upgrades: z.record(z.object({
    level: z.number(),
    cost: z.number()
  })),
  skills: z.record(z.object({
    level: z.number(),
    maxLevel: z.number(),
    unlocked: z.boolean(),
    cost: z.number(),
    effect: z.number()
  })),
  achievements: z.record(z.object({
    earned: z.boolean(),
    timestamp: z.string().optional()
  }))
});

export type GameState = z.infer<typeof gameStateSchema>;
