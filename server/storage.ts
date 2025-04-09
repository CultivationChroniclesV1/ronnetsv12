import { 
  users, type User, type InsertUser, 
  playerData, type PlayerData, type InsertPlayerData,
  type GameState,
  friendships, type Friendship, type InsertFriendship,
  friendRequests, type FriendRequest, type InsertFriendRequest,
  clans, type Clan, type InsertClan,
  clanMembers, type ClanMember, type InsertClanMember,
  messages, type Message, type InsertMessage,
  clanMessages, type ClanMessage, type InsertClanMessage,
  gifts, type Gift, type InsertGift,
  worldChatMessages, type WorldChatMessage, type InsertWorldChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc } from "drizzle-orm";

// Add more methods as needed for social features
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserOnlineStatus(id: number, isOnline: boolean): Promise<User | undefined>;
  
  // Player data operations
  getPlayerData(userId: number | null): Promise<PlayerData | undefined>;
  savePlayerData(data: InsertPlayerData): Promise<PlayerData>;
  updatePlayerData(id: number, gameState: GameState): Promise<PlayerData | undefined>;

  // Friend operations
  getFriends(userId: number): Promise<User[]>;
  getFriendship(user1Id: number, user2Id: number): Promise<Friendship | undefined>;
  createFriendship(friendship: InsertFriendship): Promise<Friendship>;
  removeFriendship(user1Id: number, user2Id: number): Promise<boolean>;
  
  // Friend request operations
  getFriendRequests(userId: number, isSent?: boolean): Promise<FriendRequest[]>;
  createFriendRequest(request: InsertFriendRequest): Promise<FriendRequest>;
  updateFriendRequestStatus(id: number, status: string): Promise<FriendRequest | undefined>;
  
  // Clan operations
  getClans(): Promise<Clan[]>;
  getClan(id: number): Promise<Clan | undefined>;
  createClan(clan: InsertClan): Promise<Clan>;
  updateClan(id: number, data: Partial<Clan>): Promise<Clan | undefined>;
  
  // Clan member operations
  getClanMembers(clanId: number): Promise<ClanMember[]>;
  getUserClans(userId: number): Promise<Clan[]>;
  addClanMember(member: InsertClanMember): Promise<ClanMember>;
  updateClanMemberRole(clanId: number, userId: number, role: string): Promise<ClanMember | undefined>;
  removeClanMember(clanId: number, userId: number): Promise<boolean>;
  
  // Message operations
  getMessages(userId: number, otherUserId: number): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(userId: number, fromUserId: number): Promise<boolean>;
  
  // Clan message operations
  getClanMessages(clanId: number): Promise<ClanMessage[]>;
  sendClanMessage(message: InsertClanMessage): Promise<ClanMessage>;
  
  // Gift operations
  getGifts(userId: number, isSent?: boolean): Promise<Gift[]>;
  createGift(gift: InsertGift): Promise<Gift>;
  updateGiftStatus(id: number, status: string): Promise<Gift | undefined>;
  
  // World chat operations
  getWorldChatMessages(limit?: number): Promise<WorldChatMessage[]>;
  sendWorldChatMessage(message: InsertWorldChatMessage): Promise<WorldChatMessage>;
}

// Memory storage implementation (for testing/fallback)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private playerData: Map<number, PlayerData>;
  private friendships: Map<number, Friendship>;
  private friendRequests: Map<number, FriendRequest>;
  private clans: Map<number, Clan>;
  private clanMembers: Map<number, ClanMember>;
  private messages: Map<number, Message>;
  private clanMessages: Map<number, ClanMessage>;
  private gifts: Map<number, Gift>;
  private worldChatMessages: Map<number, WorldChatMessage>;
  
  currentId: number;
  currentPlayerDataId: number;
  currentFriendshipId: number;
  currentFriendRequestId: number;
  currentClanId: number;
  currentClanMemberId: number;
  currentMessageId: number;
  currentClanMessageId: number;
  currentGiftId: number;
  currentWorldChatMessageId: number;

  constructor() {
    this.users = new Map();
    this.playerData = new Map();
    this.friendships = new Map();
    this.friendRequests = new Map();
    this.clans = new Map();
    this.clanMembers = new Map();
    this.messages = new Map();
    this.clanMessages = new Map();
    this.gifts = new Map();
    this.worldChatMessages = new Map();
    
    this.currentId = 1;
    this.currentPlayerDataId = 1;
    this.currentFriendshipId = 1;
    this.currentFriendRequestId = 1;
    this.currentClanId = 1;
    this.currentClanMemberId = 1;
    this.currentMessageId = 1;
    this.currentClanMessageId = 1;
    this.currentGiftId = 1;
    this.currentWorldChatMessageId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      lastOnline: now,
      isOnline: false 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserOnlineStatus(id: number, isOnline: boolean): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      isOnline,
      lastOnline: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Player data operations
  async getPlayerData(userId: number | null): Promise<PlayerData | undefined> {
    return Array.from(this.playerData.values()).find(
      (data) => data.userId === userId
    );
  }
  
  async savePlayerData(insertData: InsertPlayerData): Promise<PlayerData> {
    // Check if data already exists for this user
    const userId = insertData.userId === undefined ? null : insertData.userId;
    
    // Find existing data only if userId is not null
    const existingData = userId !== null ? await this.getPlayerData(userId) : undefined;
    
    if (existingData) {
      // Update existing data
      const updatedData: PlayerData = {
        id: existingData.id,
        userId: existingData.userId,
        gameState: insertData.gameState,
        lastUpdated: insertData.lastUpdated
      };
      this.playerData.set(existingData.id, updatedData);
      return updatedData;
    } else {
      // Create new data
      const id = this.currentPlayerDataId++;
      const data: PlayerData = {
        id,
        userId,
        gameState: insertData.gameState,
        lastUpdated: insertData.lastUpdated
      };
      this.playerData.set(id, data);
      return data;
    }
  }
  
  async updatePlayerData(id: number, gameState: GameState): Promise<PlayerData | undefined> {
    const existingData = this.playerData.get(id);
    
    if (!existingData) {
      return undefined;
    }
    
    const updatedData: PlayerData = {
      ...existingData,
      gameState: gameState,
      lastUpdated: new Date().toISOString()
    };
    
    this.playerData.set(id, updatedData);
    return updatedData;
  }
  
  // Friend operations
  async getFriends(userId: number): Promise<User[]> {
    const friendships = Array.from(this.friendships.values()).filter(
      f => f.user1Id === userId || f.user2Id === userId
    );
    
    const friendIds = friendships.map(f => 
      f.user1Id === userId ? f.user2Id : f.user1Id
    );
    
    return Array.from(this.users.values()).filter(u => 
      friendIds.includes(u.id)
    );
  }
  
  async getFriendship(user1Id: number, user2Id: number): Promise<Friendship | undefined> {
    return Array.from(this.friendships.values()).find(
      f => (f.user1Id === user1Id && f.user2Id === user2Id) || 
           (f.user1Id === user2Id && f.user2Id === user1Id)
    );
  }
  
  async createFriendship(friendship: InsertFriendship): Promise<Friendship> {
    const id = this.currentFriendshipId++;
    const newFriendship = {
      ...friendship,
      id,
      createdAt: new Date()
    };
    this.friendships.set(id, newFriendship);
    return newFriendship;
  }
  
  async removeFriendship(user1Id: number, user2Id: number): Promise<boolean> {
    const friendship = await this.getFriendship(user1Id, user2Id);
    if (!friendship) return false;
    
    this.friendships.delete(friendship.id);
    return true;
  }
  
  // Friend request operations
  async getFriendRequests(userId: number, isSent: boolean = false): Promise<FriendRequest[]> {
    return Array.from(this.friendRequests.values()).filter(
      r => isSent ? r.fromUserId === userId : r.toUserId === userId
    );
  }
  
  async createFriendRequest(request: InsertFriendRequest): Promise<FriendRequest> {
    const id = this.currentFriendRequestId++;
    const now = new Date();
    const newRequest = {
      ...request,
      id,
      status: "pending",
      createdAt: now,
      updatedAt: now
    };
    this.friendRequests.set(id, newRequest);
    return newRequest;
  }
  
  async updateFriendRequestStatus(id: number, status: string): Promise<FriendRequest | undefined> {
    const request = this.friendRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = {
      ...request,
      status,
      updatedAt: new Date()
    };
    
    this.friendRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  // Clan operations
  async getClans(): Promise<Clan[]> {
    return Array.from(this.clans.values());
  }
  
  async getClan(id: number): Promise<Clan | undefined> {
    return this.clans.get(id);
  }
  
  async createClan(clan: InsertClan): Promise<Clan> {
    const id = this.currentClanId++;
    const now = new Date();
    const newClan = {
      ...clan,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.clans.set(id, newClan);
    return newClan;
  }
  
  async updateClan(id: number, data: Partial<Clan>): Promise<Clan | undefined> {
    const clan = this.clans.get(id);
    if (!clan) return undefined;
    
    const updatedClan = {
      ...clan,
      ...data,
      updatedAt: new Date()
    };
    
    this.clans.set(id, updatedClan);
    return updatedClan;
  }
  
  // Clan member operations
  async getClanMembers(clanId: number): Promise<ClanMember[]> {
    return Array.from(this.clanMembers.values()).filter(
      m => m.clanId === clanId
    );
  }
  
  async getUserClans(userId: number): Promise<Clan[]> {
    const memberships = Array.from(this.clanMembers.values()).filter(
      m => m.userId === userId
    );
    
    const clanIds = memberships.map(m => m.clanId);
    
    return Array.from(this.clans.values()).filter(c => 
      clanIds.includes(c.id)
    );
  }
  
  async addClanMember(member: InsertClanMember): Promise<ClanMember> {
    const id = this.currentClanMemberId++;
    const newMember = {
      ...member,
      id,
      joinedAt: new Date()
    };
    this.clanMembers.set(id, newMember);
    return newMember;
  }
  
  async updateClanMemberRole(clanId: number, userId: number, role: string): Promise<ClanMember | undefined> {
    const member = Array.from(this.clanMembers.values()).find(
      m => m.clanId === clanId && m.userId === userId
    );
    
    if (!member) return undefined;
    
    const updatedMember = {
      ...member,
      role
    };
    
    this.clanMembers.set(member.id, updatedMember);
    return updatedMember;
  }
  
  async removeClanMember(clanId: number, userId: number): Promise<boolean> {
    const member = Array.from(this.clanMembers.values()).find(
      m => m.clanId === clanId && m.userId === userId
    );
    
    if (!member) return false;
    
    this.clanMembers.delete(member.id);
    return true;
  }
  
  // Message operations
  async getMessages(userId: number, otherUserId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      m => (m.fromUserId === userId && m.toUserId === otherUserId) ||
           (m.fromUserId === otherUserId && m.toUserId === userId)
    ).sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }
  
  async sendMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const newMessage = {
      ...message,
      id,
      isRead: false,
      sentAt: new Date()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  async markMessagesAsRead(userId: number, fromUserId: number): Promise<boolean> {
    const messagesToUpdate = Array.from(this.messages.values()).filter(
      m => m.toUserId === userId && m.fromUserId === fromUserId && !m.isRead
    );
    
    for (const message of messagesToUpdate) {
      this.messages.set(message.id, {
        ...message,
        isRead: true
      });
    }
    
    return true;
  }
  
  // Clan message operations
  async getClanMessages(clanId: number): Promise<ClanMessage[]> {
    return Array.from(this.clanMessages.values()).filter(
      m => m.clanId === clanId
    ).sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }
  
  async sendClanMessage(message: InsertClanMessage): Promise<ClanMessage> {
    const id = this.currentClanMessageId++;
    const newMessage = {
      ...message,
      id,
      sentAt: new Date()
    };
    this.clanMessages.set(id, newMessage);
    return newMessage;
  }
  
  // Gift operations
  async getGifts(userId: number, isSent: boolean = false): Promise<Gift[]> {
    return Array.from(this.gifts.values()).filter(
      g => isSent ? g.fromUserId === userId : g.toUserId === userId
    );
  }
  
  async createGift(gift: InsertGift): Promise<Gift> {
    const id = this.currentGiftId++;
    const now = new Date();
    const newGift = {
      ...gift,
      id,
      status: "pending",
      createdAt: now,
      updatedAt: now
    };
    this.gifts.set(id, newGift);
    return newGift;
  }
  
  async updateGiftStatus(id: number, status: string): Promise<Gift | undefined> {
    const gift = this.gifts.get(id);
    if (!gift) return undefined;
    
    const updatedGift = {
      ...gift,
      status,
      updatedAt: new Date()
    };
    
    this.gifts.set(id, updatedGift);
    return updatedGift;
  }
  
  // World chat operations
  async getWorldChatMessages(limit: number = 50): Promise<WorldChatMessage[]> {
    return Array.from(this.worldChatMessages.values())
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
      .slice(0, limit);
  }
  
  async sendWorldChatMessage(message: InsertWorldChatMessage): Promise<WorldChatMessage> {
    const id = this.currentWorldChatMessageId++;
    const newMessage = {
      ...message,
      id,
      sentAt: new Date()
    };
    this.worldChatMessages.set(id, newMessage);
    return newMessage;
  }
}

// Database storage implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        lastOnline: now,
        isOnline: false
      })
      .returning();
    return user;
  }
  
  async updateUserOnlineStatus(id: number, isOnline: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        isOnline,
        lastOnline: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  // Player data operations
  async getPlayerData(userId: number | null): Promise<PlayerData | undefined> {
    if (userId === null) return undefined;
    const [data] = await db
      .select()
      .from(playerData)
      .where(eq(playerData.userId, userId));
    return data;
  }
  
  async savePlayerData(insertData: InsertPlayerData): Promise<PlayerData> {
    // Check if data already exists for this user
    const existingData = await this.getPlayerData(insertData.userId);
    
    if (existingData) {
      // Update existing data
      const [updatedData] = await db
        .update(playerData)
        .set({
          gameState: insertData.gameState,
          lastUpdated: insertData.lastUpdated
        })
        .where(eq(playerData.id, existingData.id))
        .returning();
      return updatedData;
    } else {
      // Create new data
      const [newData] = await db
        .insert(playerData)
        .values(insertData)
        .returning();
      return newData;
    }
  }
  
  async updatePlayerData(id: number, gameState: GameState): Promise<PlayerData | undefined> {
    const [updatedData] = await db
      .update(playerData)
      .set({
        gameState,
        lastUpdated: new Date().toISOString()
      })
      .where(eq(playerData.id, id))
      .returning();
    return updatedData;
  }
  
  // Friend operations
  async getFriends(userId: number): Promise<User[]> {
    const friendshipsResult = await db
      .select()
      .from(friendships)
      .where(or(
        eq(friendships.user1Id, userId),
        eq(friendships.user2Id, userId)
      ));
    
    if (friendshipsResult.length === 0) return [];
    
    const friendIds = friendshipsResult.map(f => 
      f.user1Id === userId ? f.user2Id : f.user1Id
    );
    
    return await db
      .select()
      .from(users)
      .where(
        friendIds.map(id => eq(users.id, id)).reduce((acc, curr) => or(acc, curr))
      );
  }
  
  async getFriendship(user1Id: number, user2Id: number): Promise<Friendship | undefined> {
    const [friendship] = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(
            eq(friendships.user1Id, user1Id),
            eq(friendships.user2Id, user2Id)
          ),
          and(
            eq(friendships.user1Id, user2Id),
            eq(friendships.user2Id, user1Id)
          )
        )
      );
    return friendship;
  }
  
  async createFriendship(friendship: InsertFriendship): Promise<Friendship> {
    const [newFriendship] = await db
      .insert(friendships)
      .values(friendship)
      .returning();
    return newFriendship;
  }
  
  async removeFriendship(user1Id: number, user2Id: number): Promise<boolean> {
    const friendship = await this.getFriendship(user1Id, user2Id);
    if (!friendship) return false;
    
    await db
      .delete(friendships)
      .where(eq(friendships.id, friendship.id));
    
    return true;
  }
  
  // Friend request operations
  async getFriendRequests(userId: number, isSent: boolean = false): Promise<FriendRequest[]> {
    return await db
      .select()
      .from(friendRequests)
      .where(
        isSent 
          ? eq(friendRequests.fromUserId, userId)
          : eq(friendRequests.toUserId, userId)
      );
  }
  
  async createFriendRequest(request: InsertFriendRequest): Promise<FriendRequest> {
    const [newRequest] = await db
      .insert(friendRequests)
      .values(request)
      .returning();
    return newRequest;
  }
  
  async updateFriendRequestStatus(id: number, status: string): Promise<FriendRequest | undefined> {
    const [updatedRequest] = await db
      .update(friendRequests)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(friendRequests.id, id))
      .returning();
    return updatedRequest;
  }
  
  // Clan operations
  async getClans(): Promise<Clan[]> {
    return await db
      .select()
      .from(clans);
  }
  
  async getClan(id: number): Promise<Clan | undefined> {
    const [clan] = await db
      .select()
      .from(clans)
      .where(eq(clans.id, id));
    return clan;
  }
  
  async createClan(clan: InsertClan): Promise<Clan> {
    const [newClan] = await db
      .insert(clans)
      .values(clan)
      .returning();
    return newClan;
  }
  
  async updateClan(id: number, data: Partial<Clan>): Promise<Clan | undefined> {
    const [updatedClan] = await db
      .update(clans)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(clans.id, id))
      .returning();
    return updatedClan;
  }
  
  // Clan member operations
  async getClanMembers(clanId: number): Promise<ClanMember[]> {
    return await db
      .select()
      .from(clanMembers)
      .where(eq(clanMembers.clanId, clanId));
  }
  
  async getUserClans(userId: number): Promise<Clan[]> {
    const memberships = await db
      .select()
      .from(clanMembers)
      .where(eq(clanMembers.userId, userId));
    
    if (memberships.length === 0) return [];
    
    const clanIds = memberships.map(m => m.clanId);
    
    return await db
      .select()
      .from(clans)
      .where(
        clanIds.map(id => eq(clans.id, id)).reduce((acc, curr) => or(acc, curr))
      );
  }
  
  async addClanMember(member: InsertClanMember): Promise<ClanMember> {
    const [newMember] = await db
      .insert(clanMembers)
      .values(member)
      .returning();
    return newMember;
  }
  
  async updateClanMemberRole(clanId: number, userId: number, role: string): Promise<ClanMember | undefined> {
    const [updatedMember] = await db
      .update(clanMembers)
      .set({ role })
      .where(
        and(
          eq(clanMembers.clanId, clanId),
          eq(clanMembers.userId, userId)
        )
      )
      .returning();
    return updatedMember;
  }
  
  async removeClanMember(clanId: number, userId: number): Promise<boolean> {
    await db
      .delete(clanMembers)
      .where(
        and(
          eq(clanMembers.clanId, clanId),
          eq(clanMembers.userId, userId)
        )
      );
    return true;
  }
  
  // Message operations
  async getMessages(userId: number, otherUserId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.fromUserId, userId),
            eq(messages.toUserId, otherUserId)
          ),
          and(
            eq(messages.fromUserId, otherUserId),
            eq(messages.toUserId, userId)
          )
        )
      )
      .orderBy(messages.sentAt);
  }
  
  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }
  
  async markMessagesAsRead(userId: number, fromUserId: number): Promise<boolean> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.toUserId, userId),
          eq(messages.fromUserId, fromUserId),
          eq(messages.isRead, false)
        )
      );
    return true;
  }
  
  // Clan message operations
  async getClanMessages(clanId: number): Promise<ClanMessage[]> {
    return await db
      .select()
      .from(clanMessages)
      .where(eq(clanMessages.clanId, clanId))
      .orderBy(clanMessages.sentAt);
  }
  
  async sendClanMessage(message: InsertClanMessage): Promise<ClanMessage> {
    const [newMessage] = await db
      .insert(clanMessages)
      .values(message)
      .returning();
    return newMessage;
  }
  
  // Gift operations
  async getGifts(userId: number, isSent: boolean = false): Promise<Gift[]> {
    return await db
      .select()
      .from(gifts)
      .where(
        isSent 
          ? eq(gifts.fromUserId, userId)
          : eq(gifts.toUserId, userId)
      );
  }
  
  async createGift(gift: InsertGift): Promise<Gift> {
    const [newGift] = await db
      .insert(gifts)
      .values(gift)
      .returning();
    return newGift;
  }
  
  async updateGiftStatus(id: number, status: string): Promise<Gift | undefined> {
    const [updatedGift] = await db
      .update(gifts)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(gifts.id, id))
      .returning();
    return updatedGift;
  }
  
  // World chat operations
  async getWorldChatMessages(limit: number = 50): Promise<WorldChatMessage[]> {
    return await db
      .select()
      .from(worldChatMessages)
      .orderBy(desc(worldChatMessages.sentAt))
      .limit(limit);
  }
  
  async sendWorldChatMessage(message: InsertWorldChatMessage): Promise<WorldChatMessage> {
    const [newMessage] = await db
      .insert(worldChatMessages)
      .values(message)
      .returning();
    return newMessage;
  }
}

// Export the appropriate storage implementation
export const storage = new DatabaseStorage();
