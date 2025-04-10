// netlify/functions/api.ts
import express from "express";
import serverless from "serverless-http";

// server/storage.ts
var MemStorage = class {
  users;
  playerData;
  currentId;
  currentPlayerDataId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.playerData = /* @__PURE__ */ new Map();
    this.currentId = 1;
    this.currentPlayerDataId = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getPlayerData(userId) {
    return Array.from(this.playerData.values()).find(
      (data) => data.userId === userId
    );
  }
  async savePlayerData(insertData) {
    const userId = insertData.userId === void 0 ? null : insertData.userId;
    const existingData = userId !== null ? await this.getPlayerData(userId) : void 0;
    if (existingData) {
      const updatedData = {
        id: existingData.id,
        userId: existingData.userId,
        gameState: insertData.gameState,
        lastUpdated: insertData.lastUpdated
      };
      this.playerData.set(existingData.id, updatedData);
      return updatedData;
    } else {
      const id = this.currentPlayerDataId++;
      const data = {
        id,
        userId,
        gameState: insertData.gameState,
        lastUpdated: insertData.lastUpdated
      };
      this.playerData.set(id, data);
      return data;
    }
  }
  async updatePlayerData(id, gameState) {
    const existingData = this.playerData.get(id);
    if (!existingData) {
      return void 0;
    }
    const updatedData = {
      ...existingData,
      gameState,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.playerData.set(id, updatedData);
    return updatedData;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var playerData = pgTable("player_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  gameState: jsonb("game_state").notNull(),
  lastUpdated: text("last_updated").notNull()
});
var insertPlayerDataSchema = createInsertSchema(playerData).pick({
  userId: true,
  gameState: true,
  lastUpdated: true
});
var gameStateSchema = z.object({
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
  critChance: z.number().default(5),
  // Percentage
  dodgeChance: z.number().default(5),
  // Percentage
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
    cooldown: z.number(),
    // in seconds
    lastUsed: z.number().optional(),
    // timestamp
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
      value: z.number(),
      // gold value
      rarity: z.enum(["common", "uncommon", "rare", "epic", "legendary", "mythic"]).default("common")
    })).default({}),
    herbs: z.record(z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number(),
      quality: z.number(),
      // 1-5 stars
      effects: z.record(z.number()),
      icon: z.string(),
      description: z.string(),
      value: z.number()
      // gold value
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
    reputation: z.number().default(0),
    // 0-100 reputation with sect
    contributions: z.number().default(0),
    // total contributions to sect
    rank: z.string().default("Outer Disciple"),
    dailyTrainingCompleted: z.boolean().default(false),
    weeklyMissionCompleted: z.boolean().default(false),
    assignedTasks: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      deadline: z.string(),
      // ISO date string
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
  npcRelations: z.record(z.number()).default({}),
  // 0-100 relationship score
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

// netlify/functions/api.ts
import { z as z2 } from "zod";
var app = express();
app.use(express.json());
app.post("/api/save", async (req, res) => {
  try {
    const validatedGameState = gameStateSchema.parse(req.body.gameState);
    const userId = 1;
    const savedData = await storage.savePlayerData({
      userId,
      gameState: validatedGameState,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({ success: true, savedAt: savedData.lastUpdated });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid game state data",
        errors: error.errors
      });
    } else {
      console.error("Save error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save game state"
      });
    }
  }
});
app.get("/api/load", async (req, res) => {
  try {
    const userId = 1;
    const playerData2 = await storage.getPlayerData(userId);
    if (!playerData2) {
      return res.status(404).json({
        success: false,
        message: "No saved game found"
      });
    }
    res.json({
      success: true,
      gameState: playerData2.gameState,
      lastUpdated: playerData2.lastUpdated
    });
  } catch (error) {
    console.error("Load error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load game state"
    });
  }
});
app.get("/api/health", (_, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
var handler = serverless(app);
export {
  handler
};
