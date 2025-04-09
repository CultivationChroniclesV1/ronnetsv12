import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  lastOnline: timestamp("last_online").defaultNow().notNull(),
  isOnline: boolean("is_online").default(false),
});

export const usersRelations = relations(users, ({ many }) => ({
  friendships: many(friendships, { relationName: "user_friendships" }),
  sentFriendRequests: many(friendRequests, { relationName: "sent_requests" }),
  receivedFriendRequests: many(friendRequests, { relationName: "received_requests" }),
  clanMemberships: many(clanMembers),
  sentMessages: many(messages, { relationName: "sent_messages" }),
  receivedMessages: many(messages, { relationName: "received_messages" }),
  playerData: many(playerData),
}));

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

export const playerDataRelations = relations(playerData, ({ one }) => ({
  user: one(users, {
    fields: [playerData.userId],
    references: [users.id],
  }),
}));

export const insertPlayerDataSchema = createInsertSchema(playerData).pick({
  userId: true,
  gameState: true,
  lastUpdated: true,
});

export type InsertPlayerData = z.infer<typeof insertPlayerDataSchema>;
export type PlayerData = typeof playerData.$inferSelect;

// Friendships (bidirectional)
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").notNull().references(() => users.id),
  user2Id: integer("user2_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    uniquePair: uniqueIndex("unique_friendship_pair").on(table.user1Id, table.user2Id),
    user1Idx: index("friendship_user1_idx").on(table.user1Id),
    user2Idx: index("friendship_user2_idx").on(table.user2Id),
  }
});

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  user1: one(users, {
    fields: [friendships.user1Id],
    references: [users.id],
    relationName: "user_friendships",
  }),
  user2: one(users, {
    fields: [friendships.user2Id],
    references: [users.id],
    relationName: "user_friendships",
  }),
}));

export const insertFriendshipSchema = createInsertSchema(friendships).pick({
  user1Id: true,
  user2Id: true,
});

export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type Friendship = typeof friendships.$inferSelect;

// Friend requests (unidirectional)
export const friendRequests = pgTable("friend_requests", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    uniqueRequest: uniqueIndex("unique_friend_request").on(table.fromUserId, table.toUserId),
    fromUserIdx: index("friend_request_from_idx").on(table.fromUserId),
    toUserIdx: index("friend_request_to_idx").on(table.toUserId),
  }
});

export const friendRequestsRelations = relations(friendRequests, ({ one }) => ({
  fromUser: one(users, {
    fields: [friendRequests.fromUserId],
    references: [users.id],
    relationName: "sent_requests",
  }),
  toUser: one(users, {
    fields: [friendRequests.toUserId],
    references: [users.id],
    relationName: "received_requests",
  }),
}));

export const insertFriendRequestSchema = createInsertSchema(friendRequests).pick({
  fromUserId: true,
  toUserId: true,
});

export type InsertFriendRequest = z.infer<typeof insertFriendRequestSchema>;
export type FriendRequest = typeof friendRequests.$inferSelect;

// Clans (social groups)
export const clans = pgTable("clans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  founderUserId: integer("founder_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clansRelations = relations(clans, ({ one, many }) => ({
  founder: one(users, {
    fields: [clans.founderUserId],
    references: [users.id],
  }),
  members: many(clanMembers),
  messages: many(clanMessages),
}));

export const insertClanSchema = createInsertSchema(clans).pick({
  name: true,
  description: true,
  founderUserId: true,
});

export type InsertClan = z.infer<typeof insertClanSchema>;
export type Clan = typeof clans.$inferSelect;

// Clan memberships
export const clanMembers = pgTable("clan_members", {
  id: serial("id").primaryKey(),
  clanId: integer("clan_id").notNull().references(() => clans.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("member"), // founder, admin, member
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => {
  return {
    uniqueMembership: uniqueIndex("unique_clan_membership").on(table.clanId, table.userId),
    clanIdx: index("clan_member_clan_idx").on(table.clanId),
    userIdx: index("clan_member_user_idx").on(table.userId),
  }
});

export const clanMembersRelations = relations(clanMembers, ({ one }) => ({
  clan: one(clans, {
    fields: [clanMembers.clanId],
    references: [clans.id],
  }),
  user: one(users, {
    fields: [clanMembers.userId],
    references: [users.id],
  }),
}));

export const insertClanMemberSchema = createInsertSchema(clanMembers).pick({
  clanId: true,
  userId: true,
  role: true,
});

export type InsertClanMember = z.infer<typeof insertClanMemberSchema>;
export type ClanMember = typeof clanMembers.$inferSelect;

// Direct messages between users
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
}, (table) => {
  return {
    fromUserIdx: index("message_from_idx").on(table.fromUserId),
    toUserIdx: index("message_to_idx").on(table.toUserId),
  }
});

export const messagesRelations = relations(messages, ({ one }) => ({
  fromUser: one(users, {
    fields: [messages.fromUserId],
    references: [users.id],
    relationName: "sent_messages",
  }),
  toUser: one(users, {
    fields: [messages.toUserId],
    references: [users.id],
    relationName: "received_messages",
  }),
}));

export const insertMessageSchema = createInsertSchema(messages).pick({
  fromUserId: true,
  toUserId: true,
  content: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Clan chat messages
export const clanMessages = pgTable("clan_messages", {
  id: serial("id").primaryKey(),
  clanId: integer("clan_id").notNull().references(() => clans.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
}, (table) => {
  return {
    clanIdx: index("clan_message_clan_idx").on(table.clanId),
    userIdx: index("clan_message_user_idx").on(table.userId),
  }
});

export const clanMessagesRelations = relations(clanMessages, ({ one }) => ({
  clan: one(clans, {
    fields: [clanMessages.clanId],
    references: [clans.id],
  }),
  user: one(users, {
    fields: [clanMessages.userId],
    references: [users.id],
  }),
}));

export const insertClanMessageSchema = createInsertSchema(clanMessages).pick({
  clanId: true,
  userId: true,
  content: true,
});

export type InsertClanMessage = z.infer<typeof insertClanMessageSchema>;
export type ClanMessage = typeof clanMessages.$inferSelect;

// Gift transactions for items between users
export const gifts = pgTable("gifts", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  itemType: text("item_type").notNull(), // herbs, equipment, materials, pills, other
  itemId: text("item_id").notNull(),
  itemData: jsonb("item_data"), // Store the complete item data
  quantity: integer("quantity").notNull().default(1),
  message: text("message"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    fromUserIdx: index("gift_from_idx").on(table.fromUserId),
    toUserIdx: index("gift_to_idx").on(table.toUserId),
  }
});

export const giftsRelations = relations(gifts, ({ one }) => ({
  fromUser: one(users, {
    fields: [gifts.fromUserId],
    references: [users.id],
  }),
  toUser: one(users, {
    fields: [gifts.toUserId],
    references: [users.id],
  }),
}));

export const insertGiftSchema = createInsertSchema(gifts).pick({
  fromUserId: true,
  toUserId: true,
  itemType: true,
  itemId: true,
  itemData: true,
  quantity: true,
  message: true,
});

export type InsertGift = z.infer<typeof insertGiftSchema>;
export type Gift = typeof gifts.$inferSelect;

export const gameStateSchema = z.object({
  // Basic character info
  characterCreated: z.boolean().default(false),
  characterName: z.string().optional(),
  sect: z.string().optional(),
  avatarUrl: z.string().optional(),
  
  // Social profile information
  socialProfile: z.object({
    displayName: z.string().optional(),
    title: z.string().optional(),
    bio: z.string().optional(),
    privacyLevel: z.enum(["public", "friends", "private"]).default("friends"),
    clanId: z.number().optional(),
    clanRole: z.string().optional(),
    lastOnline: z.string().optional(),
    status: z.string().optional(),
    friendCount: z.number().default(0),
    achievements: z.array(z.string()).default([]),
  }).default({}),
  
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
