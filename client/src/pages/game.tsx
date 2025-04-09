import { useEffect } from 'react';
import { useGameEngine } from '@/lib/gameEngine';
import { HeaderStats } from '@/components/header-stats';
import { CultivationStatus } from '@/components/cultivation-status';
import { CultivationActions } from '@/components/cultivation-actions';
import { UpgradesSection } from '@/components/upgrades-section';
import { SkillsSection } from '@/components/skills-section';
import { StatsSection } from '@/components/stats-section';
import { SettingsModal } from '@/components/ui/settings-modal';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';

export default function Game() {
  const { 
    game, 
    initialize, 
    toggleSettings, 
    saveGame, 
    isAutoSaveEnabled
  } = useGameEngine();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Initialize game engine when component mounts
    initialize();
    
    // Redirect to character creation if character not created
    if (!game.characterCreated) {
      setLocation('/character');
    }
  }, [initialize, game.characterCreated, setLocation]);
  
  // Don't render game content if character not created
  if (!game.characterCreated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p>Please create your character before beginning your cultivation journey.</p>
            <Button 
              className="mt-4" 
              onClick={() => setLocation('/character')}
            >
              Create Character
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Calculate time since last save
  const lastSavedDate = new Date(game.lastSaved);
  const now = new Date();
  const minutesSinceLastSave = Math.floor((now.getTime() - lastSavedDate.getTime()) / 60000);
  
  return (
    <div className="min-h-screen pb-20">
      <HeaderStats />
      
      <div className="container mx-auto px-4 py-6">
        <CultivationStatus />
        <CultivationActions />
        <UpgradesSection />
        <SkillsSection />
        <StatsSection />
      </div>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-primary text-white py-2 px-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xs">
            <span>
              Game {isAutoSaveEnabled ? 'auto-saved' : 'saved'} {minutesSinceLastSave} minute{minutesSinceLastSave !== 1 ? 's' : ''} ago
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={saveGame}
              variant="outline" 
              size="sm"
              className="text-xs border-white text-white hover:bg-primary-dark h-8"
            >
              <i className="fas fa-save mr-1"></i> Save
            </Button>
            <Button 
              onClick={toggleSettings}
              variant="outline" 
              size="sm"
              className="text-xs border-white text-white hover:bg-primary-dark h-8"
            >
              <i className="fas fa-cog mr-1"></i> Settings
            </Button>
          </div>
        </div>
      </footer>
      
      <SettingsModal />
    </div>
  );
}
