import { useGameEngine } from '@/lib/gameEngine';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function SettingsModal() {
  const { 
    settingsOpen, 
    toggleSettings, 
    isAutoSaveEnabled, 
    toggleAutoSave,
    isOfflineProgressEnabled,
    toggleOfflineProgress,
    showNotifications,
    toggleNotifications,
    resetGame,
    saveGame
  } = useGameEngine();
  
  return (
    <Dialog open={settingsOpen} onOpenChange={toggleSettings}>
      <DialogContent className="bg-scroll max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-primary">Settings</DialogTitle>
          <DialogDescription>
            Configure your cultivation journey
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-save">Auto-save</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save your progress every 30 seconds
              </p>
            </div>
            <Switch
              id="auto-save"
              checked={isAutoSaveEnabled}
              onCheckedChange={toggleAutoSave}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="offline-progress">Offline Progression</Label>
              <p className="text-sm text-muted-foreground">
                Continue accumulating Qi while away
              </p>
            </div>
            <Switch
              id="offline-progress"
              checked={isOfflineProgressEnabled}
              onCheckedChange={toggleOfflineProgress}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="notifications">Show Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Display auto-save, achievement and progression notifications
              </p>
            </div>
            <Switch
              id="notifications"
              checked={showNotifications}
              onCheckedChange={toggleNotifications}
            />
          </div>
          
          <div className="flex justify-between pt-2">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={resetGame}
            >
              Reset Game
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={() => {
                saveGame();
                toggleSettings();
              }}
            >
              Save Game
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
