import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useGameEngine } from '@/lib/gameEngine';
import { useToast } from '@/hooks/use-toast';

// Types of messages we can receive from the server
export type WebSocketMessageType = 
  | 'auth_success'
  | 'error'
  | 'heartbeat_ack'
  | 'message'
  | 'message_sent'
  | 'friend_request'
  | 'friend_accept'
  | 'friend_reject'
  | 'gift'
  | 'gift_accept'
  | 'gift_reject'
  | 'clan_message'
  | 'clan_message_sent'
  | 'clan_member_join'
  | 'clan_member_leave'
  | 'status_change'
  | 'world_chat';

// Define the WebSocket message interface
interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
}

// Define the WebSocket context interface
interface WebSocketContextType {
  isConnected: boolean;
  isOnline: boolean;
  messages: WebSocketMessage[];
  sendMessage: (type: string, payload: any) => void;
  clearMessages: () => void;
  worldChatMessages: WorldChatMessage[];
  sendWorldChatMessage: (content: string) => void;
}

// World Chat Message interface
export interface WorldChatMessage {
  id: string;
  userId: number;
  username: string;
  characterName?: string;
  content: string;
  timestamp: Date;
}

// Create the WebSocket context
const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  isOnline: navigator.onLine,
  messages: [],
  sendMessage: () => {},
  clearMessages: () => {},
  worldChatMessages: [],
  sendWorldChatMessage: () => {}
});

// WebSocket provider component
export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [worldChatMessages, setWorldChatMessages] = useState<WorldChatMessage[]>([]);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const gameEngine = useGameEngine();
  
  // Handle network status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network is online');
      setIsOnline(true);
      
      // Try to connect if character is created and we're not already connected
      if (gameEngine.game.characterCreated && !isConnected) {
        connectWebSocket();
      }
    };
    
    const handleOffline = () => {
      console.log('Network is offline');
      setIsOnline(false);
      
      // Close existing connection if we have one
      if (socket) {
        socket.close();
      }
      
      // Show toast to inform user
      toast({
        title: 'Network Offline',
        description: 'You are currently offline. Social features are disabled.',
        variant: 'destructive'
      });
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [gameEngine.game.characterCreated, isConnected, socket, toast]);
  
  // Create WebSocket connection
  const connectWebSocket = useCallback(() => {
    // Don't connect if we're offline
    if (!navigator.onLine) {
      console.log('Cannot connect: network is offline');
      return;
    }
    
    try {
      // Create WebSocket URL from current origin
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      
      // Create new WebSocket
      const ws = new WebSocket(wsUrl);
      
      // Setup event handlers
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Authenticate with the server
        if (gameEngine.game.characterCreated) {
          const characterCode = gameEngine.game.characterCode || generateCharacterCode();
          
          // Update game state with character code if it doesn't exist
          if (!gameEngine.game.characterCode) {
            gameEngine.updateGameState({
              characterCode
            });
          }
          
          ws.send(JSON.stringify({
            type: 'auth',
            payload: {
              userId: 1, // For demo, hardcoded to 1
              username: gameEngine.game.characterName || 'Unknown',
              characterCode
            }
          }));
        }
        
        // Start heartbeat interval
        heartbeatInterval.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat' }));
          }
        }, 15000);
        
        // Clear reconnect timeout if it exists
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
          reconnectTimeout.current = null;
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          console.log('WebSocket message received:', message);
          
          // Handle different message types
          switch (message.type) {
            case 'auth_success':
              console.log('Authentication successful');
              break;
              
            case 'error':
              console.error('WebSocket error:', message.payload.message);
              toast({
                title: 'Connection Error',
                description: message.payload.message,
                variant: 'destructive'
              });
              break;
              
            case 'friend_request':
              toast({
                title: 'New Friend Request',
                description: `${message.payload.fromUser.username} sent you a friend request`,
              });
              break;
              
            case 'friend_accept':
              toast({
                title: 'Friend Request Accepted',
                description: `${message.payload.user.username} accepted your friend request`,
              });
              break;
              
            case 'gift':
              toast({
                title: 'New Gift',
                description: `${message.payload.fromUsername} sent you a gift`,
              });
              break;
              
            case 'message':
              toast({
                title: 'New Message',
                description: `${message.payload.fromUsername}: ${message.payload.content.substring(0, 30)}${message.payload.content.length > 30 ? '...' : ''}`,
              });
              break;
              
            case 'clan_message':
              // Only show toast for clan messages if not from the current user
              if (message.payload.message.userId !== 1) { // For demo, hardcoded to 1
                toast({
                  title: 'Clan Message',
                  description: `${message.payload.message.username}: ${message.payload.message.content.substring(0, 30)}${message.payload.message.content.length > 30 ? '...' : ''}`,
                });
              }
              break;
              
            case 'world_chat':
              // Add to world chat messages
              setWorldChatMessages(prev => {
                // Limit to last 100 messages
                const newMessages = [...prev, message.payload];
                if (newMessages.length > 100) {
                  return newMessages.slice(-100);
                }
                return newMessages;
              });
              break;
              
            // Other message types will be handled by the components
          }
          
          // Update messages state (skip heartbeat acknowledgments)
          if (message.type !== 'heartbeat_ack') {
            setMessages(prevMessages => [...prevMessages, message]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        setIsConnected(false);
        
        // Clear heartbeat interval
        if (heartbeatInterval.current) {
          clearInterval(heartbeatInterval.current);
          heartbeatInterval.current = null;
        }
        
        // Only try to reconnect if we're online
        if (navigator.onLine) {
          // Schedule reconnect after 3 seconds
          reconnectTimeout.current = setTimeout(() => {
            if (gameEngine.game.characterCreated) {
              console.log('Attempting to reconnect...');
              connectWebSocket();
            }
          }, 3000);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Not closing the connection here, let onclose handle it
      };
      
      setSocket(ws);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      // Only attempt reconnect if we're online
      if (navigator.onLine) {
        reconnectTimeout.current = setTimeout(() => {
          console.log('Attempting to reconnect after error...');
          connectWebSocket();
        }, 5000);
      }
    }
  }, [gameEngine]);
  
  // Connect WebSocket when component mounts and character is created
  useEffect(() => {
    if (gameEngine.game.characterCreated && navigator.onLine) {
      connectWebSocket();
    } else {
      console.log('Character not created yet or offline, not connecting WebSocket');
    }
    
    return () => {
      if (socket) {
        console.log('Closing WebSocket connection on unmount');
        socket.close();
      }
      
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
      
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
    };
  }, [connectWebSocket, gameEngine.game.characterCreated]);
  
  // Send a message to the server
  const sendMessage = useCallback((type: string, payload: any) => {
    if (!isOnline) {
      toast({
        title: 'Offline Mode',
        description: 'You are currently offline. Please connect to the internet to access social features.',
        variant: 'destructive'
      });
      return;
    }
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket not connected');
      toast({
        title: 'Connection Error',
        description: 'Not connected to chat server. Please try again.',
        variant: 'destructive'
      });
    }
  }, [socket, toast, isOnline]);
  
  // Send world chat message
  const sendWorldChatMessage = useCallback((content: string) => {
    if (!isOnline) {
      toast({
        title: 'Offline Mode',
        description: 'You are currently offline. Please connect to the internet to access chat features.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!gameEngine.game.characterCreated) {
      toast({
        title: 'Character Required',
        description: 'You need to create a character before you can chat.',
        variant: 'destructive'
      });
      return;
    }
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'world_chat',
        payload: {
          content,
          characterName: gameEngine.game.characterName,
          characterRealm: gameEngine.game.realm,
          characterSect: gameEngine.game.sect
        }
      };
      
      socket.send(JSON.stringify(message));
      
      // Optimistically add to local state
      const localMessage: WorldChatMessage = {
        id: generateId(),
        userId: 1,
        username: 'You',
        characterName: gameEngine.game.characterName || 'Unknown',
        content,
        timestamp: new Date()
      };
      
      setWorldChatMessages(prev => [...prev, localMessage]);
    } else {
      console.error('WebSocket not connected');
      toast({
        title: 'Connection Error',
        description: 'Not connected to chat server. Please try again.',
        variant: 'destructive'
      });
    }
  }, [socket, toast, isOnline, gameEngine.game]);
  
  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  
  // Context value
  const contextValue: WebSocketContextType = {
    isConnected,
    isOnline,
    messages,
    sendMessage,
    clearMessages,
    worldChatMessages,
    sendWorldChatMessage
  };
  
  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Custom hook to use the WebSocket context
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  return context;
}

// Helper function to generate a random character code
function generateCharacterCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper function to generate a random ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}