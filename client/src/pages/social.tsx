import React, { useState, useEffect, useRef } from 'react';
import { useGameEngine } from '@/lib/gameEngine';
import { useWebSocket } from '@/contexts/websocket-context';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// UI Components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  UserPlus,
  Users,
  Gift,
  Clock,
  UserCheck,
  UserX,
  Send,
  Bell,
  BellOff,
  Circle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Friend component types
interface Friend {
  id: number;
  username: string;
  isOnline: boolean;
  lastOnline: Date;
  characterName?: string;
  realm?: string;
  realmStage?: number;
  level?: number;
}

interface FriendRequest {
  id: number;
  status: string;
  createdAt: Date;
  user: {
    id: number;
    username: string;
    isOnline: boolean;
  };
}

// Message component types
interface Conversation {
  userId: number;
  username: string;
  isOnline: boolean;
  characterName?: string;
  lastMessage?: {
    content: string;
    sentAt: Date;
    isFromUser: boolean;
  };
  unreadCount: number;
}

interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  isRead: boolean;
  sentAt: Date;
}

// Gift component types
interface Gift {
  id: number;
  itemType: string;
  itemId: string;
  itemData?: any;
  quantity: number;
  message: string | null;
  status: string;
  createdAt: Date;
  user: {
    id: number;
    username: string;
    isOnline: boolean;
  };
}

export default function SocialPage() {
  const gameEngine = useGameEngine();
  const { toast } = useToast();
  
  // Check if character is created
  if (!gameEngine.game.characterCreated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Character Required</CardTitle>
            <CardDescription>
              You need to create a character before you can interact with other cultivators.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.location.href = "/character"}>
              Create Character
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Social Interactions</h1>
      
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="friends">
            <Users className="mr-2 h-4 w-4" /> Friends
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="mr-2 h-4 w-4" /> Messages
          </TabsTrigger>
          <TabsTrigger value="gifts">
            <Gift className="mr-2 h-4 w-4" /> Gifts
          </TabsTrigger>
          <TabsTrigger value="clans">
            <Users className="mr-2 h-4 w-4" /> Clans
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="friends" className="space-y-4">
          <FriendsTab />
        </TabsContent>
        
        <TabsContent value="messages" className="space-y-4">
          <MessagesTab />
        </TabsContent>
        
        <TabsContent value="gifts" className="space-y-4">
          <GiftsTab />
        </TabsContent>
        
        <TabsContent value="clans" className="space-y-4">
          <ClansTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Friends Tab Component
function FriendsTab() {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch friends
  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ['/api/friends'],
    queryFn: async () => {
      const res = await apiRequest<{success: boolean, friends: Friend[]}>('/api/friends', {
        method: 'GET'
      });
      return res.friends;
    }
  });
  
  // Fetch friend requests
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/friend-requests'],
    queryFn: async () => {
      const res = await apiRequest<{success: boolean, requests: FriendRequest[]}>('/api/friend-requests', {
        method: 'GET'
      });
      return res.requests;
    }
  });
  
  // Send friend request mutation
  const sendFriendRequest = useMutation({
    mutationFn: async (username: string) => {
      // In a real app, we would look up the user ID from the username
      // For demo purposes, we'll use a fixed ID of 2
      return apiRequest('/api/friend-request', {
        method: 'POST',
        body: JSON.stringify({
          toUserId: 2
        })
      });
    },
    onSuccess: () => {
      toast({
        title: 'Friend Request Sent',
        description: `Your friend request to ${newFriendUsername} has been sent.`
      });
      setNewFriendUsername('');
      queryClient.invalidateQueries({ queryKey: ['/api/friend-requests'] });
    },
    onError: (error) => {
      toast({
        title: 'Error Sending Request',
        description: 'Failed to send friend request. The user may not exist or already be your friend.',
        variant: 'destructive'
      });
    }
  });
  
  // Respond to friend request mutation
  const respondToRequest = useMutation({
    mutationFn: async ({ requestId, accept }: { requestId: number, accept: boolean }) => {
      return apiRequest(`/api/friend-request/${requestId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ accept })
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.accept ? 'Friend Request Accepted' : 'Friend Request Rejected',
        description: variables.accept 
          ? 'You are now friends!' 
          : 'Friend request has been rejected.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/friend-requests'] });
      if (variables.accept) {
        queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to respond to friend request.',
        variant: 'destructive'
      });
    }
  });
  
  // Remove friend mutation
  const removeFriend = useMutation({
    mutationFn: async (friendId: number) => {
      return apiRequest(`/api/friends/${friendId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: (data, friendId) => {
      toast({
        title: 'Friend Removed',
        description: 'This person has been removed from your friends list.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove friend.',
        variant: 'destructive'
      });
    }
  });
  
  // Handle friend request form submission
  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFriendUsername.trim()) {
      sendFriendRequest.mutate(newFriendUsername);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-4">
          <Button 
            variant={activeTab === 'friends' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('friends')}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Friends {friends && friends.length > 0 && `(${friends.length})`}
          </Button>
          <Button 
            variant={activeTab === 'requests' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('requests')}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Requests {requests && requests.length > 0 && `(${requests.length})`}
          </Button>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Friend
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a Friend</DialogTitle>
              <DialogDescription>
                Send a friend request to another cultivator by their username.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendRequest}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="username" className="text-right">
                    Username
                  </label>
                  <Input
                    id="username"
                    className="col-span-3"
                    value={newFriendUsername}
                    onChange={(e) => setNewFriendUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={sendFriendRequest.isPending || !newFriendUsername.trim()}>
                  {sendFriendRequest.isPending ? 'Sending...' : 'Send Request'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {activeTab === 'friends' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friendsLoading ? (
            <p>Loading friends...</p>
          ) : friends && friends.length > 0 ? (
            friends.map((friend) => (
              <Card key={friend.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Avatar className="mr-2">
                        <AvatarFallback>{friend.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          {friend.username}
                          {friend.isOnline && (
                            <Circle className="ml-2 h-3 w-3 fill-green-500 text-green-500" />
                          )}
                        </CardTitle>
                        <CardDescription>
                          {friend.characterName || 'Unknown Character'}
                        </CardDescription>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <UserX className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Remove Friend</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to remove {friend.username} from your friends list?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button 
                            variant="destructive" 
                            onClick={() => removeFriend.mutate(friend.id)}
                            disabled={removeFriend.isPending}
                          >
                            {removeFriend.isPending ? 'Removing...' : 'Remove Friend'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="pb-2 pt-0">
                  {friend.realm && friend.realmStage && (
                    <div className="mb-2">
                      <Badge variant="secondary">
                        {friend.realm} Realm - Stage {friend.realmStage}
                      </Badge>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {friend.isOnline ? 'Online now' : friend.lastOnline ? `Last online: ${new Date(friend.lastOnline).toLocaleString()}` : 'Last online unknown'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <Button variant="secondary" className="w-full" onClick={() => window.location.href = `/social?tab=messages&userId=${friend.id}`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-6 text-center">
              <p className="text-lg mb-2">You don't have any friends yet</p>
              <p className="text-muted-foreground">Send friend requests to other cultivators to build your network.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {requestsLoading ? (
            <p>Loading requests...</p>
          ) : requests && requests.length > 0 ? (
            requests.map((request) => (
              <Card key={request.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Avatar className="mr-2">
                        <AvatarFallback>{request.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{request.user.username}</CardTitle>
                        <CardDescription className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(request.createdAt).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => respondToRequest.mutate({ requestId: request.id, accept: true })}
                        disabled={respondToRequest.isPending}
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => respondToRequest.mutate({ requestId: request.id, accept: false })}
                        disabled={respondToRequest.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-lg mb-2">No pending friend requests</p>
              <p className="text-muted-foreground">When someone sends you a friend request, it will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Messages Tab Component
function MessagesTab() {
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { sendMessage: sendWebSocketMessage } = useWebSocket();
  
  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/conversations'],
    queryFn: async () => {
      const res = await apiRequest<{success: boolean, conversations: Conversation[]}>('/api/conversations', {
        method: 'GET'
      });
      return res.conversations;
    }
  });
  
  // Fetch messages for active conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages', activeConversation],
    queryFn: async () => {
      if (!activeConversation) return [];
      const res = await apiRequest<{success: boolean, messages: Message[]}>(`/api/messages/${activeConversation}`, {
        method: 'GET'
      });
      return res.messages;
    },
    enabled: !!activeConversation
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ toUserId, content }: { toUserId: number, content: string }) => {
      return apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ toUserId, content })
      });
    },
    onSuccess: (data, { toUserId }) => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/messages', toUserId] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      
      // Also send via WebSocket if available
      sendWebSocketMessage('message', {
        toUserId,
        content: newMessage
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive'
      });
    }
  });
  
  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeConversation && newMessage.trim()) {
      sendMessageMutation.mutate({
        toUserId: activeConversation,
        content: newMessage
      });
    }
  };
  
  // Scroll to bottom of messages when new messages are loaded
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Use URL query parameters to set active conversation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    if (userId) {
      setActiveConversation(Number(userId));
    }
  }, []);
  
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Conversations List */}
      <div className="col-span-12 md:col-span-4 lg:col-span-3">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-grow px-4">
            {conversationsLoading ? (
              <p className="text-center py-4">Loading conversations...</p>
            ) : conversations && conversations.length > 0 ? (
              <div className="space-y-2">
                {conversations.map((convo) => (
                  <div 
                    key={convo.userId}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${activeConversation === convo.userId ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
                    onClick={() => setActiveConversation(convo.userId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>{convo.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center">
                            {convo.username}
                            {convo.isOnline && (
                              <Circle className="ml-1 h-2 w-2 fill-green-500 text-green-500" />
                            )}
                          </div>
                          {convo.characterName && (
                            <p className="text-xs text-muted-foreground">{convo.characterName}</p>
                          )}
                        </div>
                      </div>
                      {convo.unreadCount > 0 && (
                        <Badge variant="destructive" className="rounded-full text-xs">
                          {convo.unreadCount}
                        </Badge>
                      )}
                    </div>
                    {convo.lastMessage && (
                      <div className="mt-1">
                        <p className="text-xs text-muted-foreground truncate">
                          {convo.lastMessage.isFromUser ? 'You: ' : ''}{convo.lastMessage.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No conversations yet</p>
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>
      
      {/* Messages */}
      <div className="col-span-12 md:col-span-8 lg:col-span-9">
        <Card className="h-[600px] flex flex-col">
          {activeConversation ? (
            <>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>
                      {conversations?.find(c => c.userId === activeConversation)?.username.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>
                    {conversations?.find(c => c.userId === activeConversation)?.username || 'Unknown User'}
                  </CardTitle>
                </div>
              </CardHeader>
              <ScrollArea className="flex-grow px-4 pt-2">
                {messagesLoading ? (
                  <p className="text-center py-4">Loading messages...</p>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isFromMe = message.fromUserId === 1; // For demo, hardcoded to 1
                      return (
                        <div 
                          key={message.id} 
                          className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] p-3 rounded-lg ${isFromMe 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-secondary'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(message.sentAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-xs mt-1">Send a message to start the conversation!</p>
                  </div>
                )}
              </ScrollArea>
              <CardFooter className="p-4 pt-2">
                <form onSubmit={handleSendMessage} className="w-full flex space-x-2">
                  <Input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow"
                  />
                  <Button 
                    type="submit" 
                    disabled={sendMessageMutation.isPending || !newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </CardFooter>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-1">No conversation selected</h3>
                <p className="text-muted-foreground">Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Gifts Tab Component
function GiftsTab() {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch gifts
  const { data: gifts, isLoading: giftsLoading } = useQuery({
    queryKey: ['/api/gifts', activeTab === 'sent'],
    queryFn: async () => {
      const res = await apiRequest<{success: boolean, gifts: Gift[]}>(`/api/gifts?sent=${activeTab === 'sent'}`, {
        method: 'GET'
      });
      return res.gifts;
    }
  });
  
  // Respond to gift mutation
  const respondToGift = useMutation({
    mutationFn: async ({ giftId, accept }: { giftId: number, accept: boolean }) => {
      return apiRequest(`/api/gifts/${giftId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ accept })
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.accept ? 'Gift Accepted' : 'Gift Rejected',
        description: variables.accept 
          ? 'The gift has been added to your inventory.' 
          : 'The gift has been rejected.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gifts', false] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to respond to gift.',
        variant: 'destructive'
      });
    }
  });
  
  // Helper function to get a friendly item name
  const getItemName = (gift: Gift) => {
    if (gift.itemType === 'spiritualStones') {
      return `${gift.quantity} Spiritual Stones`;
    }
    
    let itemName = gift.itemId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    if (gift.quantity > 1) {
      return `${gift.quantity}x ${itemName}`;
    }
    
    return itemName;
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-4">
          <Button 
            variant={activeTab === 'received' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('received')}
          >
            <Gift className="mr-2 h-4 w-4" />
            Received
          </Button>
          <Button 
            variant={activeTab === 'sent' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('sent')}
          >
            <Send className="mr-2 h-4 w-4" />
            Sent
          </Button>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Gift className="mr-2 h-4 w-4" />
              Send Gift
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send a Gift</DialogTitle>
              <DialogDescription>
                Send an item from your inventory to another cultivator.
              </DialogDescription>
            </DialogHeader>
            <p className="py-4 text-center text-muted-foreground">
              This feature will be implemented soon!
            </p>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {giftsLoading ? (
          <p>Loading gifts...</p>
        ) : gifts && gifts.length > 0 ? (
          gifts.map((gift) => (
            <Card key={gift.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar className="mr-2">
                      <AvatarFallback>{gift.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{activeTab === 'received' ? 'From: ' : 'To: '}{gift.user.username}</CardTitle>
                      <CardDescription className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {new Date(gift.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {activeTab === 'received' && gift.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => respondToGift.mutate({ giftId: gift.id, accept: true })}
                        disabled={respondToGift.isPending}
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => respondToGift.mutate({ giftId: gift.id, accept: false })}
                        disabled={respondToGift.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  
                  {gift.status !== 'pending' && (
                    <Badge variant={gift.status === 'accepted' ? 'default' : 'secondary'}>
                      {gift.status === 'accepted' ? 'Accepted' : 'Rejected'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary p-3 rounded-md">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">
                      {gift.itemType}
                    </Badge>
                    <span className="font-medium">{getItemName(gift)}</span>
                  </div>
                  {gift.message && (
                    <div className="mt-2 text-sm">
                      <p className="italic">"{gift.message}"</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="p-6 text-center">
            <p className="text-lg mb-2">No {activeTab} gifts</p>
            <p className="text-muted-foreground">
              {activeTab === 'received' 
                ? 'When someone sends you a gift, it will appear here.' 
                : 'You haven\'t sent any gifts yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Clans Tab Component
function ClansTab() {
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold mb-4">Clan System</h3>
      <p className="text-muted-foreground mb-6">
        Join forces with other cultivators by forming or joining a clan. Share resources, 
        knowledge, and support each other on the path to immortality.
      </p>
      <p className="text-sm">This feature will be fully implemented soon!</p>
    </div>
  );
}