import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gameStateSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Save game state
  app.post('/api/save', async (req: Request, res: Response) => {
    try {
      // Validate the game state with our schema
      const validatedGameState = gameStateSchema.parse(req.body.gameState);
      
      // In a real implementation, we would get the userId from the authenticated session
      // For now, we'll use a demo user
      const userId = 1;
      
      // Save the player data
      const savedData = await storage.savePlayerData({
        userId,
        gameState: validatedGameState,
        lastUpdated: new Date().toISOString()
      });
      
      res.json({ success: true, savedAt: savedData.lastUpdated });
    } catch (error) {
      if (error instanceof z.ZodError) {
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
  
  // Load game state
  app.get('/api/load', async (req: Request, res: Response) => {
    try {
      // In a real implementation, we would get the userId from the authenticated session
      const userId = 1;
      
      const playerData = await storage.getPlayerData(userId);
      
      if (!playerData) {
        return res.status(404).json({ 
          success: false, 
          message: "No saved game found" 
        });
      }
      
      res.json({ 
        success: true, 
        gameState: playerData.gameState, 
        lastUpdated: playerData.lastUpdated 
      });
    } catch (error) {
      console.error("Load error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to load game state" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
