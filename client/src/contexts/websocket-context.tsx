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
  | 'status_change';

// Define the WebSocket message interface
interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
}

// Define the WebSocket context interface
interface WebSocketContextType {
  isConnected: boolean;
  messages: WebSocketMessage[];
  sendMessage: (type: string, payload: any) => void;
  clearMessages: () => void;
}

// Create the WebSocket context
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// WebSocket provider component
export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const gameEngine = useGameEngine();
  
  // Create WebSocket connection
  const connectWebSocket = useCallback(() => {
    // Create WebSocket URL from current origin
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    // Create new WebSocket
    const ws = new WebSocket(wsUrl);
    
    // Setup event handlers
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Authenticate with the server
      if (gameEngine.game.characterCreated) {
        ws.send(JSON.stringify({
          type: 'auth',
          payload: {
            userId: 1, // For demo, hardcoded to 1
            username: gameEngine.game.characterName || 'Unknown'
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
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Clear heartbeat interval
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
      
      // Schedule reconnect after 3 seconds
      reconnectTimeout.current = setTimeout(() => {
        if (gameEngine.game.characterCreated) {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }
      }, 3000);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      
      // Close the connection on error to trigger reconnect
      ws.close();
    };
    
    setSocket(ws);
    
    // Clean up on unmount
    return () => {
      if (ws) {
        ws.close();
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
  }, [gameEngine.game.characterCreated, gameEngine.game.characterName, toast]);
  
  // Connect WebSocket when component mounts and character is created
  useEffect(() => {
    if (gameEngine.game.characterCreated) {
      connectWebSocket();
    }
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connectWebSocket, gameEngine.game.characterCreated, socket]);
  
  // Send a message to the server
  const sendMessage = useCallback((type: string, payload: any) => {
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
  }, [socket, toast]);
  
  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  
  // Context value
  const contextValue: WebSocketContextType = {
    isConnected,
    messages,
    sendMessage,
    clearMessages
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
  
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  
  return context;
}