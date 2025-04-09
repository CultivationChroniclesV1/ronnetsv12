import React, { useState } from 'react';
import { useGameEngine } from '@/lib/gameEngine';
import { useWebSocket } from '@/contexts/websocket-context';
import { WorldChat } from '@/components/social/world-chat';
import { FriendManagement } from '@/components/social/friend-management';
import { ClanManagement } from '@/components/social/clan-management';
import { useToast } from '@/hooks/use-toast';

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
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Users,
  Globe,
  Compass,
  AlertCircle
} from "lucide-react";

export default function SocialPage() {
  const gameEngine = useGameEngine();
  const { isConnected, isOnline } = useWebSocket();
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

  // If offline, show a connected warning
  if (!isOnline) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Social Interactions</h1>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
              Network Unavailable
            </CardTitle>
            <CardDescription>
              You are currently offline. Social features require an active internet connection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-6xl mb-4">📡</div>
              <h3 className="text-xl font-medium mb-2">Please Turn On Wi-Fi</h3>
              <p className="text-muted-foreground text-center max-w-md">
                To connect with other cultivators, send messages, join clans, and participate in world chat,
                please check your internet connection and try again.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => window.location.reload()}
            >
              Refresh Connection
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Social Interactions</h1>
      
      <Tabs defaultValue="world-chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="world-chat">
            <Globe className="mr-2 h-4 w-4" /> World Chat
          </TabsTrigger>
          <TabsTrigger value="friends">
            <Users className="mr-2 h-4 w-4" /> Friends
          </TabsTrigger>
          <TabsTrigger value="clans">
            <Compass className="mr-2 h-4 w-4" /> Clans
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="world-chat">
          <div className="grid grid-cols-1 gap-6 h-[calc(100vh-220px)]">
            <WorldChat />
          </div>
        </TabsContent>
        
        <TabsContent value="friends">
          <div className="grid grid-cols-1 gap-6 h-[calc(100vh-220px)]">
            <FriendManagement />
          </div>
        </TabsContent>
        
        <TabsContent value="clans">
          <div className="grid grid-cols-1 gap-6 h-[calc(100vh-220px)]">
            <ClanManagement />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}