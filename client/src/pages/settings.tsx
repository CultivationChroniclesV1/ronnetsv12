import { useGameEngine } from "@/lib/gameEngine";
import { AUTO_SAVE_INTERVAL } from "@/lib/constants";
import { formatTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SoundButton, SaveButton } from "@/components/ui/sound-button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SoundSettings } from "@/components/sound-settings";

export default function SettingsPage() {
  const { 
    game,
    isAutoSaveEnabled, 
    toggleAutoSave,
    isOfflineProgressEnabled,
    toggleOfflineProgress,
    showNotifications,
    toggleNotifications,
    resetGame,
    saveGame,
  } = useGameEngine();
  
  const { toast } = useToast();
  
  const handleSaveGame = async () => {
    await saveGame();
    toast({
      title: "Game Saved Successfully",
      description: "Your cultivation progress has been saved.",
      variant: "default",
    });
  };
  
  const handleResetGame = () => {
    if (window.confirm("This will reset all your cultivation progress. Are you absolutely sure? This cannot be undone!")) {
      resetGame();
      toast({
        title: "Game Reset",
        description: "All cultivation progress has been reset. You must start again from the beginning.",
        variant: "destructive",
      });
    }
  };
  
  const lastSavedDate = game.lastSaved 
    ? new Date(game.lastSaved).toLocaleString() 
    : "Never";
    
  return (
    <div className="container max-w-3xl mx-auto p-4 pt-20 pb-20">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Configure your cultivation journey</p>
      </div>
      
      {/* Save & Load Card */}
      <Card className="mb-6 animate-slide-in-top">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="text-xl flex items-center">
            <span className="inline-block w-5 h-5 mr-2 rounded-full bg-blue-500 animate-pulse-slow"></span>
            Save Your Progress
          </CardTitle>
          <CardDescription>
            Preserve your cultivation journey
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between mb-4 items-center space-y-4 md:space-y-0">
            <div>
              <p className="text-sm font-medium mb-1">Last Saved:</p>
              <Badge variant="outline" className="text-sm">{lastSavedDate}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Time Cultivating:</p>
              <Badge variant="outline" className="text-sm">{formatTime(game.timeCultivating)}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Cultivation Stage:</p>
              <Badge className="bg-primary hover:bg-primary/90">{game.realm} (Stage {game.realmStage})</Badge>
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <SaveButton
              className="bg-primary hover:bg-primary/90 animate-bounce-soft"
              style={{ animationDuration: '4s' }}
              onClick={handleSaveGame}
            >
              <span className="mr-2">💾</span> Save Game
            </SaveButton>
            
            <SoundButton
              variant="destructive"
              soundEffect="error"
              onClick={handleResetGame}
            >
              <span className="mr-2">🔄</span> Reset Game
            </SoundButton>
          </div>
        </CardContent>
      </Card>
      
      {/* Game Settings Card */}
      <Card className="mb-6 animate-slide-in-bottom" style={{ animationDelay: '0.3s' }}>
        <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle className="text-xl flex items-center">
            <span className="inline-block w-5 h-5 mr-2 rounded-full bg-purple-500 animate-pulse-slow"></span>
            Game Settings
          </CardTitle>
          <CardDescription>
            Customize your gameplay experience
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="p-4 border border-gray-200 rounded-md hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-save" className="text-base font-medium">Auto-save</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save your progress every {AUTO_SAVE_INTERVAL/1000} seconds
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={isAutoSaveEnabled}
                onCheckedChange={toggleAutoSave}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-md hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="offline-progress" className="text-base font-medium">Offline Progression</Label>
                <p className="text-sm text-muted-foreground">
                  Continue accumulating Qi while away from your cultivation
                </p>
              </div>
              <Switch
                id="offline-progress"
                checked={isOfflineProgressEnabled}
                onCheckedChange={toggleOfflineProgress}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-md hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="notifications" className="text-base font-medium">Show Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Display auto-save, achievement and progression notifications
                </p>
              </div>
              <Switch
                id="notifications"
                checked={showNotifications}
                onCheckedChange={toggleNotifications}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Sound Settings Card */}
      <SoundSettings />
    </div>
  );
}