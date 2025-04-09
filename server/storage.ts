import { 
  users, type User, type InsertUser, 
  playerData, type PlayerData, type InsertPlayerData,
  type GameState
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Player data operations
  getPlayerData(userId: number | null): Promise<PlayerData | undefined>;
  savePlayerData(data: InsertPlayerData): Promise<PlayerData>;
  updatePlayerData(id: number, gameState: GameState): Promise<PlayerData | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private playerData: Map<number, PlayerData>;
  currentId: number;
  currentPlayerDataId: number;

  constructor() {
    this.users = new Map();
    this.playerData = new Map();
    this.currentId = 1;
    this.currentPlayerDataId = 1;
  }

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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
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
}

export const storage = new MemStorage();
