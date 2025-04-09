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
  energy: z.number(),
  energyRate: z.number(),
  manualCultivationAmount: z.number(),
  cultivationLevel: z.number(),
  cultivationProgress: z.number(),
  maxCultivationProgress: z.number(),
  realm: z.string(),
  realmStage: z.number(),
  realmMaxStage: z.number(),
  totalQiGenerated: z.number(),
  timesMeditated: z.number(),
  successfulBreakthroughs: z.number(),
  failedBreakthroughs: z.number(),
  highestQi: z.number(),
  timeCultivating: z.number(),
  lastSaved: z.string(),
  lastOfflineTime: z.string().optional(),
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
