import React, { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '@/contexts/websocket-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Send, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function WorldChat() {
  const { isConnected, isOnline, worldChatMessages, sendWorldChatMessage } = useWebSocket();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [worldChatMessages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    if (!isConnected || !isOnline) {
      toast({
        title: "Connection Error",
        description: "You need to be online to send messages. Please check your connection.",
        variant: "destructive"
      });
      return;
    }

    sendWorldChatMessage(message);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const handleRequestFriend = (username: string) => {
    toast({
      title: "Friend Request",
      description: `Friend request sent to ${username}.`,
    });
  };

  if (!isOnline) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center justify-between">
            <span>World Chat</span>
            <Badge variant="outline" className="bg-red-100 text-red-800">Offline</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-6xl mb-4">📡</div>
            <h3 className="text-xl font-medium mb-2">Network Unavailable</h3>
            <p className="text-muted-foreground">
              Please turn on Wi-Fi to connect to other cultivators.
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
          <span>World Chat</span>
          {isConnected ? (
            <Badge variant="outline" className="bg-green-100 text-green-800">Online</Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Connecting...</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2 flex-grow overflow-auto">
        <ScrollArea className="h-[calc(100%-10px)] pr-4" ref={scrollRef}>
          {worldChatMessages.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No messages yet. Be the first to greet the cultivation world!
            </div>
          ) : (
            worldChatMessages.map((chatMsg) => (
              <div key={chatMsg.id} className="mb-4">
                <div className="flex items-start">
                  <div 
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white mr-2"
                  >
                    {chatMsg.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-semibold">{chatMsg.username}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 ml-1" 
                        onClick={() => handleRequestFriend(chatMsg.username)}
                      >
                        <UserPlus className="h-3 w-3" />
                      </Button>
                      {chatMsg.characterName && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {chatMsg.characterName}
                        </span>
                      )}
                      {chatMsg.realm && (
                        <Badge variant="outline" className="ml-2 text-xs py-0 h-5">
                          {chatMsg.realm} Realm
                        </Badge>
                      )}
                      {chatMsg.sect && (
                        <Badge variant="secondary" className="ml-2 text-xs py-0 h-5">
                          {chatMsg.sect}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 text-sm">
                      {chatMsg.content}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {chatMsg.timestamp && formatDistanceToNow(new Date(chatMsg.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex w-full space-x-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!isConnected || !message.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}