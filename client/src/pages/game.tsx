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
    <div className="min-h-screen">
      <HeaderStats />
      
      <div className="container mx-auto px-4 py-6">
        <CultivationStatus />
        <CultivationActions />
        <UpgradesSection />
        <SkillsSection />
        <StatsSection />
        
        {/* Utility Button - Now floating in bottom right corner instead of full footer */}
        <div className="fixed bottom-6 right-6">
          <Button 
            onClick={() => setLocation('/utility')}
            variant="default" 
            size="sm"
            className="rounded-full h-12 w-12 flex items-center justify-center shadow-lg"
          >
            <i className="fas fa-cogs"></i>
          </Button>
        </div>
      </div>
      
      <SettingsModal />
    </div>
  );
}
