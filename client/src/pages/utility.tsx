import { useState } from "react";
import { useGameEngine } from "@/lib/gameEngine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { ACHIEVEMENTS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";
import { PageTransition, PageContent } from "@/components/page-transition";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export default function Utility() {
  const { game, saveGame, toggleAutoSave, toggleOfflineProgress, toggleNotifications, resetGame } = useGameEngine();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("save");
  const [isResetting, setIsResetting] = useState(false);

  // Handle manual save
  const handleSave = async () => {
    await saveGame();
    toast({
      title: "Game Saved",
      description: "Your progress has been saved successfully.",
    });
  };

  // Handle game reset with confirmation
  const handleResetGame = () => {
    if (!isResetting) {
      setIsResetting(true);
      toast({
        title: "Confirm Reset",
        description: "Click the reset button again to confirm. This will delete all progress!",
        variant: "destructive",
      });
      
      // Auto-cancel after 5 seconds
      setTimeout(() => {
        setIsResetting(false);
      }, 5000);
    } else {
      resetGame();
      setIsResetting(false);
      toast({
        title: "Game Reset",
        description: "Your game has been reset. Starting fresh...",
      });
      setLocation("/");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen py-8 px-4">
        <PageContent>
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <motion.h1 
                className="text-3xl font-serif text-primary mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Utility Settings
              </motion.h1>
              <motion.p 
                className="text-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Save your progress and manage game settings
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="save">Save & Load</TabsTrigger>
                  <TabsTrigger value="settings">Game Settings</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                </TabsList>
                
                <TabsContent value="save">
                  <Card className="bg-white bg-opacity-90 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg">Save & Load Game</CardTitle>
                      <CardDescription>
                        Save your progress or reset the game
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <p className="text-sm mb-4">
                          Last saved: {game.lastSaved ? new Date(game.lastSaved).toLocaleString() : 'Never'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button onClick={handleSave} className="flex-1">
                            <i className="fas fa-save mr-2"></i> Save Game
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleResetGame}
                            className="flex-1"
                          >
                            <i className="fas fa-trash-alt mr-2"></i> {isResetting ? "Confirm Reset" : "Reset Game"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings">
                  <Card className="bg-white bg-opacity-90 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg">Game Settings</CardTitle>
                      <CardDescription>
                        Configure how the game behaves
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="autosave" className="block mb-1">Auto-Save</Label>
                            <p className="text-sm text-gray-500">Automatically save your progress every 30 seconds</p>
                          </div>
                          <Switch
                            id="autosave"
                            checked={game.isAutoSaveEnabled}
                            onCheckedChange={toggleAutoSave}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="offline" className="block mb-1">Offline Progress</Label>
                            <p className="text-sm text-gray-500">Continue generating resources while away</p>
                          </div>
                          <Switch
                            id="offline"
                            checked={game.isOfflineProgressEnabled}
                            onCheckedChange={toggleOfflineProgress}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="notifications" className="block mb-1">Notifications</Label>
                            <p className="text-sm text-gray-500">Show in-game notifications for important events</p>
                          </div>
                          <Switch
                            id="notifications"
                            checked={game.showNotifications}
                            onCheckedChange={toggleNotifications}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="achievements">
                  <Card className="bg-white bg-opacity-90 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg">Achievements</CardTitle>
                      <CardDescription>
                        Track your accomplishments on the path to immortality
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(ACHIEVEMENTS).map(([id, achievement]) => {
                          const isEarned = game.achievements[id]?.earned || false;
                          return (
                            <div
                              key={id}
                              className={`p-3 border rounded-md transition-all ${
                                isEarned
                                  ? "border-amber-300 bg-amber-50"
                                  : "border-gray-200 bg-gray-50 opacity-75"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{achievement.name}</h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {achievement.description}
                                  </p>
                                </div>
                                {isEarned ? (
                                  <Badge className="bg-amber-500">
                                    <i className="fas fa-trophy mr-1"></i> Earned
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-gray-500">
                                    <i className="fas fa-lock mr-1"></i> Locked
                                  </Badge>
                                )}
                              </div>
                              {isEarned && game.achievements[id].timestamp && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Earned {formatTime(
                                    (Date.now() - new Date(game.achievements[id].timestamp!).getTime()) / 1000
                                  )} ago
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </PageContent>
      </div>
    </PageTransition>
  );
}