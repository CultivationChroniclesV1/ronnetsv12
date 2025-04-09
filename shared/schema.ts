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
  
  // Inventory
  inventory: z.object({
    spiritualStones: z.number().default(0),
    herbs: z.record(z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number(),
      quality: z.number(),  // 1-5 stars
      effects: z.record(z.number())
    })).default({}),
    equipment: z.record(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(["weapon", "armor", "accessory", "artifact"]),
      rarity: z.enum(["common", "uncommon", "rare", "epic", "legendary", "mythic"]),
      level: z.number(),
      stats: z.record(z.number()),
      equipped: z.boolean().default(false)
    })).default({})
  }).default({
    spiritualStones: 0,
    herbs: {},
    equipment: {}
  }),
  
  // Map exploration
  exploration: z.object({
    currentArea: z.string().default("sect"),
    discoveredAreas: z.record(z.boolean()).default({}),
    completedChallenges: z.record(z.boolean()).default({}),
    dailyTasksCompleted: z.record(z.boolean()).default({})
  }).default({
    currentArea: "sect",
    discoveredAreas: {},
    completedChallenges: {},
    dailyTasksCompleted: {}
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
