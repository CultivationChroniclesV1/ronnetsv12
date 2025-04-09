import React, { useState } from 'react';
import { useWebSocket } from '@/contexts/websocket-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Users, 
  Send, 
  MessageSquare, 
  UserMinus,
  AlertCircle,
  Search
} from 'lucide-react';

export function FriendManagement() {
  const { isConnected, isOnline } = useWebSocket();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [friendCode, setFriendCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  
  // Query to get friends
  const { data: friends, isLoading: isLoadingFriends } = useQuery({
    queryKey: ['/api/friends'],
    enabled: isOnline,
  });
  
  // Query to get friend requests
  const { data: friendRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['/api/friend-requests'],
    enabled: isOnline,
  });

  const handleAddFriend = async () => {
    if (!friendCode.trim()) return;
    
    setIsSearching(true);
    try {
      await apiRequest('/api/friend-request', {
        method: 'POST',
        body: JSON.stringify({ characterCode: friendCode.trim() }),
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/friend-requests'] });
      setIsAddDialogOpen(false);
      setFriendCode('');
      
      toast({
        title: "Success",
        description: "Friend request sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request. Please check the character code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleRespondToRequest = async (requestId: number, accept: boolean) => {
    try {
      await apiRequest(`/api/friend-request/${requestId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ accept }),
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      
      toast({
        title: "Success",
        description: `Friend request ${accept ? 'accepted' : 'declined'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${accept ? 'accept' : 'decline'} friend request.`,
        variant: "destructive",
      });
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    try {
      await apiRequest(`/api/friends/${friendId}`, {
        method: 'DELETE',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      
      toast({
        title: "Success",
        description: "Friend removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove friend.",
        variant: "destructive",
      });
    }
  };

  const handleStartConversation = (friendId: number, friendName: string) => {
    toast({
      title: "Coming Soon",
      description: "Direct messaging will be available in a future update.",
    });
  };

  if (!isOnline) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center justify-between">
            <span>Friend Management</span>
            <Badge variant="outline" className="bg-red-100 text-red-800">Offline</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-6xl mb-4">📡</div>
            <h3 className="text-xl font-medium mb-2">Network Unavailable</h3>
            <p className="text-muted-foreground">
              Please turn on Wi-Fi to connect with friends.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Friend Management</span>
          {isConnected ? (
            <Badge variant="outline" className="bg-green-100 text-green-800">Online</Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Connecting...</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Connect with fellow cultivators
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <Tabs defaultValue="friends">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="friends" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex-1">
              <UserPlus className="h-4 w-4 mr-2" />
              Requests {friendRequests?.length > 0 && (
                <Badge variant="secondary" className="ml-1">{friendRequests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="mb-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Friend
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a Friend</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter your friend's character code to send them a friend request.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Enter character code..."
                      value={friendCode}
                      onChange={(e) => setFriendCode(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddFriend} disabled={isSearching || !friendCode.trim()}>
                    {isSearching ? (
                      <>Searching...</>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Send Request
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <TabsContent value="friends" className="h-[calc(100%-90px)]">
            {isLoadingFriends ? (
              <div className="text-center py-8">Loading your friends...</div>
            ) : !friends?.length ? (
              <div className="text-center py-8">
                <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">You have no friends yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add friends using their character code or accept incoming friend requests.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-full pr-4">
                <div className="space-y-3">
                  {friends.map((friend: any) => (
                    <div key={friend.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/20">
                      <div className="flex items-center">
                        <div 
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white mr-3"
                        >
                          {friend.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium">{friend.username}</div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            {friend.isOnline ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800 h-5 text-xs">Online</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100 text-gray-800 h-5 text-xs">Offline</Badge>
                            )}
                            {friend.characterName && (
                              <span className="ml-2">{friend.characterName}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleStartConversation(friend.id, friend.username)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => handleRemoveFriend(friend.id)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="requests" className="h-[calc(100%-90px)]">
            {isLoadingRequests ? (
              <div className="text-center py-8">Loading friend requests...</div>
            ) : !friendRequests?.length ? (
              <div className="text-center py-8">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending friend requests.</p>
              </div>
            ) : (
              <ScrollArea className="h-full pr-4">
                <div className="space-y-3">
                  {friendRequests.map((request: any) => (
                    <div key={request.id} className="p-3 rounded-md bg-secondary/20">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center text-white mr-3"
                          >
                            {request.fromUser?.username?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-medium">{request.fromUser?.username}</div>
                            <div className="text-xs text-muted-foreground">
                              {request.fromUser?.characterName || 'Unknown character'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600"
                            onClick={() => handleRespondToRequest(request.id, true)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600"
                            onClick={() => handleRespondToRequest(request.id, false)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}