import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gameStateSchema, insertFriendRequestSchema, insertMessageSchema, insertGiftSchema, insertClanSchema, insertClanMemberSchema, insertClanMessageSchema } from "@shared/schema";
import { z } from "zod";
import { WebSocketServer, WebSocket } from 'ws';

// Session storage for connected users
interface UserConnection {
  userId: number;
  ws: WebSocket;
  username: string;
  lastHeartbeat: number;
}

// WebSocket connection management
const connectedUsers = new Map<number, UserConnection>();
const usernameToUserId = new Map<string, number>();

// WebSocket message types
type WSMessageType = 
  | 'auth' 
  | 'message' 
  | 'friend_request' 
  | 'friend_accept' 
  | 'friend_reject' 
  | 'gift' 
  | 'gift_accept' 
  | 'gift_reject' 
  | 'clan_message'
  | 'heartbeat'
  | 'status_change';

interface WSMessage {
  type: WSMessageType;
  payload: any;
}

// Middleware to extract user ID from request
// In a real app, this would verify auth token/session
const getUserId = (req: Request, res: Response, next: NextFunction) => {
  const userId = Number(req.query.userId || req.body.userId || 1);
  req.body.userId = userId;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware for all API routes
  app.use('/api', getUserId);

  // Save game state
  app.post('/api/save', async (req: Request, res: Response) => {
    try {
      // Validate the game state with our schema
      const validatedGameState = gameStateSchema.parse(req.body.gameState);
      
      // Get the userId from middleware
      const userId = req.body.userId;
      
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
      // Get the userId from middleware
      const userId = req.body.userId;
      
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

  // Get user profile
  app.get('/api/user/:userId/profile', async (req: Request, res: Response) => {
    try {
      const targetUserId = Number(req.params.userId);
      const currentUserId = req.body.userId;
      
      // Get user data
      const user = await storage.getUser(targetUserId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      // Get player data
      const playerData = await storage.getPlayerData(targetUserId);
      if (!playerData) {
        return res.status(404).json({ success: false, message: "Player data not found" });
      }
      
      // Check if users are friends (for privacy settings)
      const areFriends = currentUserId === targetUserId || 
        await storage.getFriendship(currentUserId, targetUserId) !== undefined;
      
      const { gameState } = playerData;
      
      // Create a sanitized profile depending on privacy level
      const privacyLevel = gameState.socialProfile?.privacyLevel || 'friends';
      
      const profile = {
        id: user.id,
        username: user.username,
        isOnline: user.isOnline,
        lastOnline: user.lastOnline,
        characterName: gameState.characterName,
        realm: gameState.realm,
        realmStage: gameState.realmStage,
        sect: gameState.sect,
        level: gameState.cultivationLevel,
        title: gameState.socialProfile?.title,
        bio: privacyLevel === 'public' || 
             (privacyLevel === 'friends' && areFriends) 
               ? gameState.socialProfile?.bio 
               : undefined,
        socialProfile: {
          displayName: gameState.socialProfile?.displayName,
          title: gameState.socialProfile?.title,
          // Only include sensitive data if appropriate based on privacy
          ...(privacyLevel === 'public' || (privacyLevel === 'friends' && areFriends) ? {
            achievements: gameState.socialProfile?.achievements,
            clanId: gameState.socialProfile?.clanId,
            clanRole: gameState.socialProfile?.clanRole,
          } : {})
        }
      };
      
      res.json({ success: true, profile });
    } catch (error) {
      console.error("Get user profile error:", error);
      res.status(500).json({ success: false, message: "Failed to get user profile" });
    }
  });

  // Friend Routes
  
  // Get friends list
  app.get('/api/friends', async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const friends = await storage.getFriends(userId);
      
      // Get online status and basic info
      const friendsWithDetails = await Promise.all(friends.map(async (friend) => {
        const playerData = await storage.getPlayerData(friend.id);
        return {
          id: friend.id,
          username: friend.username,
          isOnline: friend.isOnline,
          lastOnline: friend.lastOnline,
          ...(playerData ? {
            characterName: playerData.gameState.characterName,
            realm: playerData.gameState.realm,
            realmStage: playerData.gameState.realmStage,
            level: playerData.gameState.cultivationLevel,
          } : {})
        };
      }));
      
      res.json({ success: true, friends: friendsWithDetails });
    } catch (error) {
      console.error("Get friends error:", error);
      res.status(500).json({ success: false, message: "Failed to get friends list" });
    }
  });
  
  // Get friend requests
  app.get('/api/friend-requests', async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const isSent = req.query.sent === 'true';
      
      const requests = await storage.getFriendRequests(userId, isSent);
      
      // Get requesting user details
      const requestsWithUsers = await Promise.all(requests.map(async request => {
        const otherUserId = isSent ? request.toUserId : request.fromUserId;
        const user = await storage.getUser(otherUserId);
        
        return {
          id: request.id,
          status: request.status,
          createdAt: request.createdAt,
          user: user ? {
            id: user.id,
            username: user.username,
            isOnline: user.isOnline,
          } : { id: otherUserId, username: 'Unknown User' }
        };
      }));
      
      res.json({ 
        success: true, 
        requests: requestsWithUsers 
      });
    } catch (error) {
      console.error("Get friend requests error:", error);
      res.status(500).json({ success: false, message: "Failed to get friend requests" });
    }
  });
  
  // Send friend request
  app.post('/api/friend-request', async (req: Request, res: Response) => {
    try {
      const fromUserId = req.body.userId;
      const toUserId = req.body.toUserId;
      
      // Validate request
      if (fromUserId === toUserId) {
        return res.status(400).json({ success: false, message: "Cannot send friend request to yourself" });
      }
      
      // Check if users exist
      const toUser = await storage.getUser(toUserId);
      if (!toUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      // Check if already friends
      const existingFriendship = await storage.getFriendship(fromUserId, toUserId);
      if (existingFriendship) {
        return res.status(400).json({ success: false, message: "Users are already friends" });
      }
      
      // Check for existing request
      const sentRequests = await storage.getFriendRequests(fromUserId, true);
      const existingRequest = sentRequests.find(req => req.toUserId === toUserId);
      
      if (existingRequest) {
        return res.status(400).json({ success: false, message: "Friend request already sent" });
      }
      
      // Create request
      const requestData = insertFriendRequestSchema.parse({
        fromUserId,
        toUserId
      });
      
      const request = await storage.createFriendRequest(requestData);
      
      // If user is online, send a WebSocket notification
      const targetConnection = connectedUsers.get(toUserId);
      if (targetConnection) {
        const fromUser = await storage.getUser(fromUserId);
        targetConnection.ws.send(JSON.stringify({
          type: 'friend_request',
          payload: {
            requestId: request.id,
            fromUser: {
              id: fromUserId,
              username: fromUser?.username || 'Unknown User'
            }
          }
        }));
      }
      
      res.json({ 
        success: true, 
        request: {
          id: request.id,
          status: request.status,
          createdAt: request.createdAt
        } 
      });
    } catch (error) {
      console.error("Send friend request error:", error);
      res.status(500).json({ success: false, message: "Failed to send friend request" });
    }
  });
  
  // Respond to friend request
  app.post('/api/friend-request/:requestId/respond', async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const requestId = Number(req.params.requestId);
      const accept = req.body.accept === true;
      
      // Get the request
      const requests = await storage.getFriendRequests(userId, false);
      const request = requests.find(req => req.id === requestId);
      
      if (!request) {
        return res.status(404).json({ success: false, message: "Friend request not found" });
      }
      
      // Update request status
      const newStatus = accept ? 'accepted' : 'rejected';
      await storage.updateFriendRequestStatus(requestId, newStatus);
      
      // If accepted, create friendship
      if (accept) {
        await storage.createFriendship({
          user1Id: request.fromUserId,
          user2Id: request.toUserId
        });
        
        // Notify the requester if they're online
        const requesterConnection = connectedUsers.get(request.fromUserId);
        if (requesterConnection) {
          const currentUser = await storage.getUser(userId);
          requesterConnection.ws.send(JSON.stringify({
            type: 'friend_accept',
            payload: {
              user: {
                id: userId,
                username: currentUser?.username || 'Unknown User'
              }
            }
          }));
        }
      }
      
      res.json({ success: true, status: newStatus });
    } catch (error) {
      console.error("Respond to friend request error:", error);
      res.status(500).json({ success: false, message: "Failed to respond to friend request" });
    }
  });
  
  // Remove friend
  app.delete('/api/friends/:friendId', async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const friendId = Number(req.params.friendId);
      
      const result = await storage.removeFriendship(userId, friendId);
      
      if (!result) {
        return res.status(404).json({ success: false, message: "Friendship not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Remove friend error:", error);
      res.status(500).json({ success: false, message: "Failed to remove friend" });
    }
  });
  
  // Messages Routes
  
  // Get conversations list (unique people user has messaged with)
  app.get('/api/conversations', async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      
      // We'll implement this by getting all messages and finding unique users
      const sentMessages = await storage.getMessages(userId, -1);
      const receivedMessages = await storage.getMessages(-1, userId);
      
      // Find unique conversation partners
      const conversationPartnerIds = new Set<number>();
      
      for (const msg of sentMessages) {
        conversationPartnerIds.add(msg.toUserId);
      }
      
      for (const msg of receivedMessages) {
        conversationPartnerIds.add(msg.fromUserId);
      }
      
      // Get user details for each conversation partner
      const conversations = await Promise.all(
        Array.from(conversationPartnerIds).map(async (partnerId) => {
          const partner = await storage.getUser(partnerId);
          const playerData = await storage.getPlayerData(partnerId);
          
          // Get the most recent message
          const messages = await storage.getMessages(userId, partnerId);
          const latestMessage = messages.length > 0 
            ? messages[messages.length - 1] 
            : null;
          
          // Count unread messages
          const unreadCount = messages.filter(
            msg => msg.toUserId === userId && !msg.isRead
          ).length;
          
          return {
            userId: partnerId,
            username: partner?.username || 'Unknown User',
            isOnline: partner?.isOnline || false,
            characterName: playerData?.gameState.characterName,
            lastMessage: latestMessage ? {
              content: latestMessage.content,
              sentAt: latestMessage.sentAt,
              isFromUser: latestMessage.fromUserId === userId
            } : null,
            unreadCount
          };
        })
      );
      
      res.json({ success: true, conversations });
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ success: false, message: "Failed to get conversations" });
    }
  });
  
  // Get messages with a specific user
  app.get('/api/messages/:userId', async (req: Request, res: Response) => {
    try {
      const currentUserId = req.body.userId;
      const otherUserId = Number(req.params.userId);
      
      const messages = await storage.getMessages(currentUserId, otherUserId);
      
      // Mark messages as read
      await storage.markMessagesAsRead(currentUserId, otherUserId);
      
      res.json({ success: true, messages });
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ success: false, message: "Failed to get messages" });
    }
  });
  
  // Send message (API endpoint for non-WebSocket fallback)
  app.post('/api/messages', async (req: Request, res: Response) => {
    try {
      const fromUserId = req.body.userId;
      const toUserId = req.body.toUserId;
      const content = req.body.content;
      
      if (!content || content.trim() === '') {
        return res.status(400).json({ success: false, message: "Message content cannot be empty" });
      }
      
      // Validate message data
      const messageData = insertMessageSchema.parse({
        fromUserId,
        toUserId,
        content
      });
      
      // Send the message
      const message = await storage.sendMessage(messageData);
      
      // Try to send via WebSocket if recipient is connected
      const recipientConnection = connectedUsers.get(toUserId);
      if (recipientConnection) {
        const sender = await storage.getUser(fromUserId);
        recipientConnection.ws.send(JSON.stringify({
          type: 'message',
          payload: {
            id: message.id,
            fromUserId,
            content: message.content,
            sentAt: message.sentAt,
            fromUsername: sender?.username || 'Unknown User'
          }
        }));
      }
      
      res.json({ success: true, message });
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ success: false, message: "Failed to send message" });
    }
  });
  
  // Gift Routes
  
  // Get gifts
  app.get('/api/gifts', async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const isSent = req.query.sent === 'true';
      
      const gifts = await storage.getGifts(userId, isSent);
      
      // Enhance gift data with user info
      const giftsWithUsers = await Promise.all(gifts.map(async gift => {
        const otherUserId = isSent ? gift.toUserId : gift.fromUserId;
        const user = await storage.getUser(otherUserId);
        
        return {
          id: gift.id,
          itemType: gift.itemType,
          itemId: gift.itemId,
          itemData: gift.itemData,
          quantity: gift.quantity,
          message: gift.message,
          status: gift.status,
          createdAt: gift.createdAt,
          user: user ? {
            id: user.id,
            username: user.username,
            isOnline: user.isOnline,
          } : { id: otherUserId, username: 'Unknown User' }
        };
      }));
      
      res.json({ success: true, gifts: giftsWithUsers });
    } catch (error) {
      console.error("Get gifts error:", error);
      res.status(500).json({ success: false, message: "Failed to get gifts" });
    }
  });
  
  // Send gift
  app.post('/api/gifts', async (req: Request, res: Response) => {
    try {
      const fromUserId = req.body.userId;
      const { toUserId, itemType, itemId, itemData, quantity = 1, message = null } = req.body;
      
      // Validate gift
      if (!itemType || !itemId) {
        return res.status(400).json({ success: false, message: "Invalid gift data" });
      }
      
      // Verify recipient exists
      const toUser = await storage.getUser(toUserId);
      if (!toUser) {
        return res.status(404).json({ success: false, message: "Recipient not found" });
      }
      
      // Create gift
      const giftData = insertGiftSchema.parse({
        fromUserId,
        toUserId,
        itemType,
        itemId,
        itemData,
        quantity,
        message
      });
      
      const gift = await storage.createGift(giftData);
      
      // Notify recipient if online
      const recipientConnection = connectedUsers.get(toUserId);
      if (recipientConnection) {
        const sender = await storage.getUser(fromUserId);
        recipientConnection.ws.send(JSON.stringify({
          type: 'gift',
          payload: {
            id: gift.id,
            fromUserId,
            fromUsername: sender?.username || 'Unknown User',
            itemType: gift.itemType,
            itemId: gift.itemId,
            quantity: gift.quantity,
            message: gift.message
          }
        }));
      }
      
      res.json({ success: true, gift });
    } catch (error) {
      console.error("Send gift error:", error);
      res.status(500).json({ success: false, message: "Failed to send gift" });
    }
  });
  
  // Respond to gift
  app.post('/api/gifts/:giftId/respond', async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const giftId = Number(req.params.giftId);
      const accept = req.body.accept === true;
      
      // Verify the gift is for this user
      const gifts = await storage.getGifts(userId, false);
      const gift = gifts.find(g => g.id === giftId);
      
      if (!gift) {
        return res.status(404).json({ success: false, message: "Gift not found" });
      }
      
      if (gift.status !== 'pending') {
        return res.status(400).json({ success: false, message: "Gift has already been processed" });
      }
      
      // Update gift status
      const newStatus = accept ? 'accepted' : 'rejected';
      const updatedGift = await storage.updateGiftStatus(giftId, newStatus);
      
      // If accepted, update the recipient's inventory
      if (accept) {
        // Get the recipient's game state
        const playerData = await storage.getPlayerData(userId);
        if (!playerData) {
          return res.status(404).json({ success: false, message: "Player data not found" });
        }
        
        // Deep clone the game state to avoid mutation
        const gameState = JSON.parse(JSON.stringify(playerData.gameState));
        
        // Update inventory based on item type
        const { itemType, itemId, quantity, itemData } = gift;
        
        if (itemType === 'herbs') {
          if (!gameState.inventory.herbs[itemId]) {
            gameState.inventory.herbs[itemId] = {
              ...itemData,
              id: itemId,
              quantity: quantity
            };
          } else {
            gameState.inventory.herbs[itemId].quantity += quantity;
          }
        } else if (itemType === 'equipment') {
          // For equipment, add as new item
          gameState.inventory.equipment.push({
            ...itemData,
            id: itemId,
            equipped: false
          });
        } else if (itemType === 'materials') {
          if (!gameState.inventory.materials[itemId]) {
            gameState.inventory.materials[itemId] = quantity;
          } else {
            gameState.inventory.materials[itemId] += quantity;
          }
        } else if (itemType === 'pills') {
          if (!gameState.inventory.pills[itemId]) {
            gameState.inventory.pills[itemId] = quantity;
          } else {
            gameState.inventory.pills[itemId] += quantity;
          }
        } else if (itemType === 'other') {
          if (!gameState.inventory.other[itemId]) {
            gameState.inventory.other[itemId] = quantity;
          } else {
            gameState.inventory.other[itemId] += quantity;
          }
        } else if (itemType === 'spiritualStones') {
          gameState.inventory.spiritualStones += quantity;
        }
        
        // Save the updated game state
        await storage.updatePlayerData(playerData.id, gameState);
        
        // Notify the sender if they're online
        const senderConnection = connectedUsers.get(gift.fromUserId);
        if (senderConnection) {
          const currentUser = await storage.getUser(userId);
          senderConnection.ws.send(JSON.stringify({
            type: 'gift_accept',
            payload: {
              giftId: gift.id,
              user: {
                id: userId,
                username: currentUser?.username || 'Unknown User'
              }
            }
          }));
        }
      } else {
        // If rejected, notify sender
        const senderConnection = connectedUsers.get(gift.fromUserId);
        if (senderConnection) {
          const currentUser = await storage.getUser(userId);
          senderConnection.ws.send(JSON.stringify({
            type: 'gift_reject',
            payload: {
              giftId: gift.id,
              user: {
                id: userId,
                username: currentUser?.username || 'Unknown User'
              }
            }
          }));
        }
      }
      
      res.json({ success: true, status: newStatus, gift: updatedGift });
    } catch (error) {
      console.error("Respond to gift error:", error);
      res.status(500).json({ success: false, message: "Failed to process gift" });
    }
  });
  
  // Clan Routes
  
  // Get clans
  app.get('/api/clans', async (req: Request, res: Response) => {
    try {
      const clans = await storage.getClans();
      
      // Add member count for each clan
      const clansWithMemberCount = await Promise.all(clans.map(async clan => {
        const members = await storage.getClanMembers(clan.id);
        return {
          ...clan,
          memberCount: members.length
        };
      }));
      
      res.json({ success: true, clans: clansWithMemberCount });
    } catch (error) {
      console.error("Get clans error:", error);
      res.status(500).json({ success: false, message: "Failed to get clans" });
    }
  });
  
  // Get clan details
  app.get('/api/clans/:clanId', async (req: Request, res: Response) => {
    try {
      const clanId = Number(req.params.clanId);
      const userId = req.body.userId;
      
      const clan = await storage.getClan(clanId);
      if (!clan) {
        return res.status(404).json({ success: false, message: "Clan not found" });
      }
      
      // Get clan members with user info
      const members = await storage.getClanMembers(clanId);
      const memberDetails = await Promise.all(members.map(async member => {
        const user = await storage.getUser(member.userId);
        const playerData = await storage.getPlayerData(member.userId);
        
        return {
          userId: member.userId,
          username: user?.username || 'Unknown User',
          isOnline: user?.isOnline || false,
          role: member.role,
          joinedAt: member.joinedAt,
          characterName: playerData?.gameState.characterName,
          realm: playerData?.gameState.realm,
          realmStage: playerData?.gameState.realmStage,
        };
      }));
      
      // Check if the current user is a member
      const userIsMember = members.some(m => m.userId === userId);
      
      res.json({ 
        success: true, 
        clan, 
        members: memberDetails,
        userIsMember 
      });
    } catch (error) {
      console.error("Get clan error:", error);
      res.status(500).json({ success: false, message: "Failed to get clan details" });
    }
  });
  
  // Create clan
  app.post('/api/clans', async (req: Request, res: Response) => {
    try {
      const founderUserId = req.body.userId;
      const { name, description } = req.body;
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: "Clan name cannot be empty" });
      }
      
      // Create clan
      const clanData = insertClanSchema.parse({
        name,
        description: description || null,
        founderUserId
      });
      
      const clan = await storage.createClan(clanData);
      
      // Add founder as a member with the founder role
      await storage.addClanMember({
        clanId: clan.id,
        userId: founderUserId,
        role: 'founder'
      });
      
      // Update user's game state to reflect clan membership
      const playerData = await storage.getPlayerData(founderUserId);
      if (playerData) {
        const gameState = JSON.parse(JSON.stringify(playerData.gameState));
        
        // Initialize socialProfile if it doesn't exist
        if (!gameState.socialProfile) {
          gameState.socialProfile = {};
        }
        
        gameState.socialProfile.clanId = clan.id;
        gameState.socialProfile.clanRole = 'founder';
        
        await storage.updatePlayerData(playerData.id, gameState);
      }
      
      res.json({ success: true, clan });
    } catch (error) {
      console.error("Create clan error:", error);
      res.status(500).json({ success: false, message: "Failed to create clan" });
    }
  });
  
  // Join clan
  app.post('/api/clans/:clanId/join', async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const clanId = Number(req.params.clanId);
      
      // Check if clan exists
      const clan = await storage.getClan(clanId);
      if (!clan) {
        return res.status(404).json({ success: false, message: "Clan not found" });
      }
      
      // Check if user is already in a clan
      const playerData = await storage.getPlayerData(userId);
      if (playerData?.gameState.socialProfile?.clanId) {
        return res.status(400).json({ success: false, message: "User is already in a clan" });
      }
      
      // Add user to clan
      const memberData = insertClanMemberSchema.parse({
        clanId,
        userId,
        role: 'member'
      });
      
      const member = await storage.addClanMember(memberData);
      
      // Update user's game state
      if (playerData) {
        const gameState = JSON.parse(JSON.stringify(playerData.gameState));
        
        // Initialize socialProfile if it doesn't exist
        if (!gameState.socialProfile) {
          gameState.socialProfile = {};
        }
        
        gameState.socialProfile.clanId = clanId;
        gameState.socialProfile.clanRole = 'member';
        
        await storage.updatePlayerData(playerData.id, gameState);
      }
      
      // Notify clan members
      const members = await storage.getClanMembers(clanId);
      for (const clanMember of members) {
        if (clanMember.userId !== userId) {
          const connection = connectedUsers.get(clanMember.userId);
          if (connection) {
            const user = await storage.getUser(userId);
            connection.ws.send(JSON.stringify({
              type: 'clan_member_join',
              payload: {
                clanId,
                user: {
                  id: userId,
                  username: user?.username || 'Unknown User'
                }
              }
            }));
          }
        }
      }
      
      res.json({ success: true, member });
    } catch (error) {
      console.error("Join clan error:", error);
      res.status(500).json({ success: false, message: "Failed to join clan" });
    }
  });
  
  // Leave clan
  app.post('/api/clans/:clanId/leave', async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const clanId = Number(req.params.clanId);
      
      // Check clan membership
      const members = await storage.getClanMembers(clanId);
      const userMembership = members.find(m => m.userId === userId);
      
      if (!userMembership) {
        return res.status(404).json({ success: false, message: "User is not a clan member" });
      }
      
      // Prevent founders from leaving without transferring ownership
      if (userMembership.role === 'founder') {
        // Check if there are other members
        if (members.length > 1) {
          return res.status(400).json({ 
            success: false, 
            message: "Founders must transfer ownership before leaving" 
          });
        }
        
        // If founder is the only member, remove the clan
        // TODO: Add clan deletion logic
      }
      
      // Remove user from clan
      await storage.removeClanMember(clanId, userId);
      
      // Update user's game state
      const playerData = await storage.getPlayerData(userId);
      if (playerData) {
        const gameState = JSON.parse(JSON.stringify(playerData.gameState));
        
        if (gameState.socialProfile) {
          gameState.socialProfile.clanId = undefined;
          gameState.socialProfile.clanRole = undefined;
        }
        
        await storage.updatePlayerData(playerData.id, gameState);
      }
      
      // Notify clan members
      for (const member of members) {
        if (member.userId !== userId) {
          const connection = connectedUsers.get(member.userId);
          if (connection) {
            const user = await storage.getUser(userId);
            connection.ws.send(JSON.stringify({
              type: 'clan_member_leave',
              payload: {
                clanId,
                user: {
                  id: userId,
                  username: user?.username || 'Unknown User'
                }
              }
            }));
          }
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Leave clan error:", error);
      res.status(500).json({ success: false, message: "Failed to leave clan" });
    }
  });
  
  // Get clan messages
  app.get('/api/clans/:clanId/messages', async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const clanId = Number(req.params.clanId);
      
      // Verify user is a clan member
      const members = await storage.getClanMembers(clanId);
      const isMember = members.some(m => m.userId === userId);
      
      if (!isMember) {
        return res.status(403).json({ success: false, message: "Only clan members can view messages" });
      }
      
      const messages = await storage.getClanMessages(clanId);
      
      // Add user info to messages
      const messagesWithUsers = await Promise.all(messages.map(async msg => {
        const sender = await storage.getUser(msg.userId);
        return {
          id: msg.id,
          userId: msg.userId,
          username: sender?.username || 'Unknown User',
          content: msg.content,
          sentAt: msg.sentAt
        };
      }));
      
      res.json({ success: true, messages: messagesWithUsers });
    } catch (error) {
      console.error("Get clan messages error:", error);
      res.status(500).json({ success: false, message: "Failed to get clan messages" });
    }
  });
  
  // Send clan message
  app.post('/api/clans/:clanId/messages', async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const clanId = Number(req.params.clanId);
      const content = req.body.content;
      
      if (!content || content.trim() === '') {
        return res.status(400).json({ success: false, message: "Message content cannot be empty" });
      }
      
      // Verify user is a clan member
      const members = await storage.getClanMembers(clanId);
      const isMember = members.some(m => m.userId === userId);
      
      if (!isMember) {
        return res.status(403).json({ success: false, message: "Only clan members can send messages" });
      }
      
      // Create message
      const messageData = insertClanMessageSchema.parse({
        clanId,
        userId,
        content
      });
      
      const message = await storage.sendClanMessage(messageData);
      
      // Add sender info
      const sender = await storage.getUser(userId);
      const messageWithUser = {
        id: message.id,
        userId: message.userId,
        username: sender?.username || 'Unknown User',
        content: message.content,
        sentAt: message.sentAt
      };
      
      // Notify all online clan members
      for (const member of members) {
        if (member.userId !== userId) {
          const connection = connectedUsers.get(member.userId);
          if (connection) {
            connection.ws.send(JSON.stringify({
              type: 'clan_message',
              payload: {
                clanId,
                message: messageWithUser
              }
            }));
          }
        }
      }
      
      res.json({ success: true, message: messageWithUser });
    } catch (error) {
      console.error("Send clan message error:", error);
      res.status(500).json({ success: false, message: "Failed to send clan message" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', function connection(ws) {
    let currentUserId: number | null = null;
    
    ws.on('message', async function incoming(message) {
      try {
        const data = JSON.parse(message.toString()) as WSMessage;
        
        if (data.type === 'auth') {
          // Authenticate user
          const { userId, username } = data.payload;
          if (!userId || !username) {
            ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid authentication data' } }));
            return;
          }
          
          // Store user connection
          currentUserId = userId;
          connectedUsers.set(userId, {
            userId,
            ws,
            username,
            lastHeartbeat: Date.now()
          });
          
          // Remember mapping from username to ID
          usernameToUserId.set(username, userId);
          
          // Update user status
          await storage.updateUserOnlineStatus(userId, true);
          
          // Send confirmation
          ws.send(JSON.stringify({ type: 'auth_success', payload: { userId } }));
          
          // Notify friends about online status
          const friends = await storage.getFriends(userId);
          for (const friend of friends) {
            const friendConnection = connectedUsers.get(friend.id);
            if (friendConnection) {
              friendConnection.ws.send(JSON.stringify({
                type: 'status_change',
                payload: {
                  userId,
                  username,
                  isOnline: true
                }
              }));
            }
          }
        } else if (data.type === 'heartbeat') {
          // Update heartbeat time
          if (currentUserId) {
            const connection = connectedUsers.get(currentUserId);
            if (connection) {
              connection.lastHeartbeat = Date.now();
              ws.send(JSON.stringify({ type: 'heartbeat_ack' }));
            }
          }
        } else if (data.type === 'message') {
          // Send direct message
          if (!currentUserId) {
            ws.send(JSON.stringify({ type: 'error', payload: { message: 'Not authenticated' } }));
            return;
          }
          
          const { toUserId, content } = data.payload;
          if (!toUserId || !content) {
            ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid message data' } }));
            return;
          }
          
          // Send the message
          const message = await storage.sendMessage({
            fromUserId: currentUserId,
            toUserId,
            content
          });
          
          // Get sender info
          const sender = await storage.getUser(currentUserId);
          
          // Forward to recipient if online
          const recipientConn = connectedUsers.get(toUserId);
          if (recipientConn) {
            recipientConn.ws.send(JSON.stringify({
              type: 'message',
              payload: {
                id: message.id,
                fromUserId: currentUserId,
                content,
                sentAt: message.sentAt,
                fromUsername: sender?.username || 'Unknown User'
              }
            }));
          }
          
          // Send confirmation to sender
          ws.send(JSON.stringify({
            type: 'message_sent',
            payload: {
              id: message.id,
              toUserId,
              content,
              sentAt: message.sentAt
            }
          }));
        } else if (data.type === 'clan_message') {
          // Send message to clan chat
          if (!currentUserId) {
            ws.send(JSON.stringify({ type: 'error', payload: { message: 'Not authenticated' } }));
            return;
          }
          
          const { clanId, content } = data.payload;
          if (!clanId || !content) {
            ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid clan message data' } }));
            return;
          }
          
          // Verify user is in the clan
          const members = await storage.getClanMembers(clanId);
          const userIsMember = members.some(m => m.userId === currentUserId);
          
          if (!userIsMember) {
            ws.send(JSON.stringify({ type: 'error', payload: { message: 'Not a clan member' } }));
            return;
          }
          
          // Send the message
          const message = await storage.sendClanMessage({
            clanId,
            userId: currentUserId,
            content
          });
          
          // Get sender info
          const sender = await storage.getUser(currentUserId);
          
          // Forward to all online clan members
          for (const member of members) {
            if (member.userId !== currentUserId) {
              const connection = connectedUsers.get(member.userId);
              if (connection) {
                connection.ws.send(JSON.stringify({
                  type: 'clan_message',
                  payload: {
                    clanId,
                    message: {
                      id: message.id,
                      userId: currentUserId,
                      username: sender?.username || 'Unknown User',
                      content,
                      sentAt: message.sentAt
                    }
                  }
                }));
              }
            }
          }
          
          // Send confirmation to sender
          ws.send(JSON.stringify({
            type: 'clan_message_sent',
            payload: {
              id: message.id,
              clanId,
              content,
              sentAt: message.sentAt
            }
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid message format' } }));
      }
    });
    
    ws.on('close', async function close() {
      if (currentUserId) {
        // Remove from connected users
        const connection = connectedUsers.get(currentUserId);
        if (connection) {
          connectedUsers.delete(currentUserId);
          usernameToUserId.delete(connection.username);
          
          // Update user status
          await storage.updateUserOnlineStatus(currentUserId, false);
          
          // Notify friends about offline status
          const friends = await storage.getFriends(currentUserId);
          for (const friend of friends) {
            const friendConnection = connectedUsers.get(friend.id);
            if (friendConnection) {
              friendConnection.ws.send(JSON.stringify({
                type: 'status_change',
                payload: {
                  userId: currentUserId,
                  username: connection.username,
                  isOnline: false
                }
              }));
            }
          }
        }
      }
    });
  });
  
  // Run periodic cleanup of stale connections
  setInterval(() => {
    const now = Date.now();
    for (const [userId, connection] of connectedUsers.entries()) {
      // If no heartbeat for 30 seconds, consider connection stale
      if (now - connection.lastHeartbeat > 30000) {
        connectedUsers.delete(userId);
        usernameToUserId.delete(connection.username);
        storage.updateUserOnlineStatus(userId, false).catch(console.error);
      }
    }
  }, 15000);
  
  return httpServer;
}
