import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGameEngine } from "@/lib/gameEngine";
import { ACHIEVEMENTS, GAME_NAME } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { formatNumber, formatTime } from "@/lib/utils";
import { PageTransition, PageContent } from "@/components/page-transition";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Utility() {
  const { game, saveGame, isAutoSaveEnabled, toggleAutoSave, toggleOfflineProgress, toggleNotifications, resetGame, updateGameState } = useGameEngine();
  const { toast } = useToast();
  const [exportedData, setExportedData] = useState("");
  const [importedData, setImportedData] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // Function to handle manual save
  const handleSaveGame = async () => {
    try {
      await saveGame();
      toast({
        title: "Game Saved",
        description: "Your cultivation journey has been saved.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "There was an error saving your game.",
        variant: "destructive",
      });
    }
  };

  // Format the cultivation time
  const formattedTime = formatTime(game.timeCultivating);
  
  // Build achievements list with earned status
  const achievementsList = Object.entries(ACHIEVEMENTS).map(([id, achievement]) => {
    const earned = game.achievements[id]?.earned || false;
    return {
      id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      earned
    };
  });
  
  // Export save data to string
  const exportSaveData = () => {
    try {
      const saveData = JSON.stringify(game);
      setExportedData(saveData);
      navigator.clipboard.writeText(saveData).then(() => {
        toast({
          title: "Save Data Exported",
          description: "Save data copied to clipboard. You can now paste and save it somewhere safe.",
        });
      });
      return saveData;
    } catch (error) {
      console.error("Error exporting save data:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your save data.",
        variant: "destructive",
      });
      return null;
    }
  };
  
  // Import save data from string
  const importSaveData = () => {
    try {
      const importedGameState = JSON.parse(importedData);
      
      // Add validation to ensure it's a valid game state
      if (!importedGameState.characterName || !importedGameState.realm) {
        throw new Error("Invalid save data format");
      }
      
      updateGameState(() => importedGameState);
      setImportDialogOpen(false);
      setImportedData("");
      
      toast({
        title: "Save Data Imported",
        description: "Your save data has been successfully imported.",
      });
    } catch (error) {
      console.error("Error importing save data:", error);
      toast({
        title: "Import Failed",
        description: "There was an error importing your save data. Make sure the format is correct.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen py-8 px-4">
        <PageContent>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-serif font-bold text-primary mb-2">Utility</h1>
              <p className="text-gray-700">Game settings, achievements, and other utilities</p>
            </div>
            
            <Tabs defaultValue="settings" className="mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>
              
              <TabsContent value="settings">
                <Card className="bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl">Game Settings</CardTitle>
                    <CardDescription>
                      Configure your cultivation journey settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">Save Game</h3>
                        <p className="text-sm text-gray-600">
                          Last saved: {new Date(game.lastSaved).toLocaleString()}
                        </p>
                      </div>
                      <Button onClick={handleSaveGame} className="animate-pulse">
                        <i className="fas fa-save mr-2"></i> Save Now
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">Auto Save</h3>
                        <p className="text-sm text-gray-600">
                          Automatically save your progress periodically
                        </p>
                      </div>
                      <Button 
                        variant={isAutoSaveEnabled ? "default" : "outline"} 
                        onClick={toggleAutoSave}
                      >
                        {isAutoSaveEnabled ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">Offline Progress</h3>
                        <p className="text-sm text-gray-600">
                          Continue gaining cultivation while you're away
                        </p>
                      </div>
                      <Button 
                        variant={game.isOfflineProgressEnabled ? "default" : "outline"} 
                        onClick={toggleOfflineProgress}
                      >
                        {game.isOfflineProgressEnabled ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">Notifications</h3>
                        <p className="text-sm text-gray-600">
                          Display popup notifications for achievements and events
                        </p>
                      </div>
                      <Button 
                        variant={game.showNotifications ? "default" : "outline"} 
                        onClick={toggleNotifications}
                      >
                        {game.showNotifications ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">Export Game Data</h3>
                        <p className="text-sm text-gray-600">
                          Save your progress to a backup file
                        </p>
                      </div>
                      <Button onClick={exportSaveData}>
                        <i className="fas fa-download mr-2"></i> Export
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">Import Game Data</h3>
                        <p className="text-sm text-gray-600">
                          Restore your progress from a backup
                        </p>
                      </div>
                      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <i className="fas fa-upload mr-2"></i> Import
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Import Game Data</DialogTitle>
                            <DialogDescription>
                              Paste your saved game data below to restore your progress.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="import-data">Game Data:</Label>
                              <Textarea 
                                id="import-data" 
                                value={importedData} 
                                onChange={(e) => setImportedData(e.target.value)}
                                placeholder="Paste your game data here..."
                                className="h-40"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button 
                              variant="outline" 
                              onClick={() => setImportDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={importSaveData}>
                              Import Data
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-md border-red-200 bg-red-50">
                      <div>
                        <h3 className="font-medium text-red-600">Reset Game</h3>
                        <p className="text-sm text-red-500">
                          This will delete all progress and cannot be undone
                        </p>
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          if (confirm("Are you sure you want to reset your game? All progress will be lost.")) {
                            resetGame();
                            toast({
                              title: "Game Reset",
                              description: "Your game has been reset to the beginning.",
                            });
                          }
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="achievements">
                <Card className="bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl">Cultivation Achievements</CardTitle>
                    <CardDescription>
                      Your journey through the cultivation world has been marked by these milestones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Stats Summary</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="text-sm text-gray-600">Total Qi Generated</div>
                          <div className="font-medium">{formatNumber(game.totalQiGenerated)}</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="text-sm text-gray-600">Time Cultivating</div>
                          <div className="font-medium">{formattedTime}</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="text-sm text-gray-600">Breakthroughs</div>
                          <div className="font-medium">{(game.successfulBreakthroughs || 0) + (game.failedBreakthroughs || 0)}</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="text-sm text-gray-600">Achievements Earned</div>
                          <div className="font-medium">
                            {achievementsList.filter(a => a.earned).length} / {achievementsList.length}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="font-medium mb-3">Achievements</h3>
                    <div className="space-y-2">
                      {achievementsList.map((achievement) => (
                        <div 
                          key={achievement.id}
                          className={`p-3 border rounded-md transition-all ${
                            achievement.earned 
                              ? "border-green-200 bg-green-50" 
                              : "border-gray-200 bg-gray-50 opacity-60"
                          }`}
                        >
                          <div className="flex">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                              achievement.earned ? "bg-green-500 text-white" : "bg-gray-300"
                            }`}>
                              <i className={`fas fa-${achievement.icon}`}></i>
                            </div>
                            <div>
                              <div className="font-medium">{achievement.name}</div>
                              <div className="text-sm text-gray-600">{achievement.description}</div>
                            </div>
                            {achievement.earned && (
                              <div className="ml-auto text-green-500">
                                <i className="fas fa-check-circle"></i>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </PageContent>
      </div>
    </PageTransition>
  );
}