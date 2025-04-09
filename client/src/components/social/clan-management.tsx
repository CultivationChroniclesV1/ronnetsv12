import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/contexts/websocket-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Plus, UserX, User, Users, Crown, ShieldCheck, Shield } from 'lucide-react';

// Clan icons - themed around cultivation
const CLAN_ICONS = [
  'dragon-sword', // Dragon Sword Sect
  'celestial-pill', // Celestial Pill Palace
  'jade-lotus', // Jade Lotus Society
  'thunder-flame', // Thunder Flame Alliance
  'spirit-sword', // Spirit Sword Mountain
];

// Icon components
const ClanIconDisplay = ({ iconName }: { iconName: string }) => {
  switch (iconName) {
    case 'dragon-sword':
      return <div className="flex items-center justify-center p-1">🐉⚔️</div>;
    case 'celestial-pill':
      return <div className="flex items-center justify-center p-1">🌟💊</div>;
    case 'jade-lotus':
      return <div className="flex items-center justify-center p-1">🔮🪷</div>;
    case 'thunder-flame':
      return <div className="flex items-center justify-center p-1">⚡🔥</div>;
    case 'spirit-sword':
      return <div className="flex items-center justify-center p-1">✨🗡️</div>;
    default:
      return <div className="flex items-center justify-center p-1">⚔️</div>;
  }
};

// Form schema for creating a clan
const createClanSchema = z.object({
  name: z.string()
    .min(3, { message: "Clan name must be at least 3 characters" })
    .max(30, { message: "Clan name must be at most 30 characters" }),
  description: z.string()
    .max(200, { message: "Description must be at most 200 characters" })
    .optional(),
  icon: z.string({ required_error: "Please select an icon for your clan" }),
});

type CreateClanFormValues = z.infer<typeof createClanSchema>;

export function ClanManagement() {
  const { isConnected, isOnline } = useWebSocket();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<CreateClanFormValues>({
    resolver: zodResolver(createClanSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
    },
  });

  // Query to get user's clans
  const { data: userClans, isLoading: isLoadingClans } = useQuery({
    queryKey: ['/api/clans'],
    enabled: isOnline,
  });
  
  // Query to get clan membership
  const { data: clanMemberships, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['/api/clan-members'],
    enabled: isOnline && !!userClans?.length,
  });

  const handleCreateClan = async (data: CreateClanFormValues) => {
    try {
      await apiRequest('/api/clans', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/clans'] });
      setIsCreateDialogOpen(false);
      form.reset();
      
      toast({
        title: "Success",
        description: `Your clan "${data.name}" has been created.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create clan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJoinClan = async (clanId: number) => {
    try {
      await apiRequest(`/api/clans/${clanId}/join`, {
        method: 'POST',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/clans'] });
      
      toast({
        title: "Success",
        description: "Your request to join the clan has been sent.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send join request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveClan = async (clanId: number) => {
    try {
      await apiRequest(`/api/clans/${clanId}/leave`, {
        method: 'POST',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/clans'] });
      
      toast({
        title: "Success",
        description: "You have left the clan.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave clan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleManageMember = async (clanId: number, userId: number, action: 'promote' | 'demote' | 'kick') => {
    try {
      if (action === 'kick') {
        await apiRequest(`/api/clans/${clanId}/members/${userId}`, {
          method: 'DELETE',
        });
      } else {
        const role = action === 'promote' ? 'admin' : 'member';
        await apiRequest(`/api/clans/${clanId}/members/${userId}`, {
          method: 'PATCH',
          body: JSON.stringify({ role }),
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/clan-members'] });
      
      toast({
        title: "Success",
        description: `Member ${action === 'promote' ? 'promoted' : action === 'demote' ? 'demoted' : 'removed'} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} member. Please try again.`,
        variant: "destructive",
      });
    }
  };

  if (!isOnline) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center justify-between">
            <span>Clan Management</span>
            <Badge variant="outline" className="bg-red-100 text-red-800">Offline</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-6xl mb-4">📡</div>
            <h3 className="text-xl font-medium mb-2">Network Unavailable</h3>
            <p className="text-muted-foreground">
              Please turn on Wi-Fi to connect to your clan.
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
          <span>Clan Management</span>
          {isConnected ? (
            <Badge variant="outline" className="bg-green-100 text-green-800">Online</Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Connecting...</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Join forces with other cultivators to establish your sect
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <Tabs defaultValue="my-clans">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="my-clans" className="flex-1">My Clans</TabsTrigger>
            <TabsTrigger value="browse" className="flex-1">Browse Clans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-clans" className="h-full">
            {isLoadingClans ? (
              <div className="text-center py-8">Loading your clans...</div>
            ) : !userClans?.length ? (
              <div className="text-center py-8">
                <p className="mb-4 text-muted-foreground">You have not joined any clans yet.</p>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create a Clan
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Clan</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleCreateClan)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Clan Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter clan name..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Describe your clan..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="icon"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select an Icon</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-wrap gap-2"
                                >
                                  {CLAN_ICONS.map((icon) => (
                                    <div key={icon} className="flex items-center space-x-2">
                                      <RadioGroupItem value={icon} id={icon} className="peer sr-only" />
                                      <Label
                                        htmlFor={icon}
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                      >
                                        <ClanIconDisplay iconName={icon} />
                                        <span className="text-xs mt-1">{icon.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end">
                          <Button type="submit">Create Clan</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100%-20px)]">
                <div className="space-y-4">
                  {userClans.map((clan: any) => (
                    <Card key={clan.id} className="overflow-hidden">
                      <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-4 flex items-center">
                        <div className="h-12 w-12 rounded-md bg-primary/20 flex items-center justify-center mr-4">
                          <ClanIconDisplay iconName={clan.icon} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{clan.name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{clan.memberCount || 1} / {clan.maxMembers || 30} members</span>
                          </div>
                        </div>
                        <div className="ml-auto">
                          {clan.userRole === 'founder' && (
                            <Badge variant="default" className="ml-2">
                              <Crown className="h-3 w-3 mr-1" /> Founder
                            </Badge>
                          )}
                          {clan.userRole === 'admin' && (
                            <Badge variant="secondary" className="ml-2">
                              <ShieldCheck className="h-3 w-3 mr-1" /> Admin
                            </Badge>
                          )}
                          {clan.userRole === 'member' && (
                            <Badge variant="outline" className="ml-2">
                              <User className="h-3 w-3 mr-1" /> Member
                            </Badge>
                          )}
                        </div>
                      </div>
                      {clan.description && (
                        <CardContent className="pt-4">
                          <p className="text-sm">{clan.description}</p>
                        </CardContent>
                      )}
                      <Separator />
                      <CardFooter className="justify-between p-4">
                        <Button variant="outline" size="sm">View Details</Button>
                        {clan.userRole !== 'founder' && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleLeaveClan(clan.id)}
                          >
                            Leave Clan
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                  
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Create a New Clan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Clan</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleCreateClan)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Clan Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter clan name..." />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Describe your clan..." />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select an Icon</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-2"
                                  >
                                    {CLAN_ICONS.map((icon) => (
                                      <div key={icon} className="flex items-center space-x-2">
                                        <RadioGroupItem value={icon} id={icon} className="peer sr-only" />
                                        <Label
                                          htmlFor={icon}
                                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                          <ClanIconDisplay iconName={icon} />
                                          <span className="text-xs mt-1">{icon.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end">
                            <Button type="submit">Create Clan</Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="browse" className="h-full">
            <div className="text-center py-8">
              <p className="mb-4 text-muted-foreground">
                Browse available clans coming soon...
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}