import { useEffect, useState } from 'react';
import { useGameEngine } from '@/lib/gameEngine';
import { HeaderStats } from '@/components/header-stats';
import { CultivationStatus } from '@/components/cultivation-status';
import { CultivationActions } from '@/components/cultivation-actions';
import { UpgradesSection } from '@/components/upgrades-section';
import { SkillsSection } from '@/components/skills-section';
import { StatsSection } from '@/components/stats-section';
import { SettingsModal } from '@/components/ui/settings-modal';
import { LoadingAnimation } from '@/components/loading-animation'; 
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { PageTransition, PageContent } from '@/components/page-transition';

export default function Game() {
  const { 
    game, 
    initialize, 
    toggleSettings, 
    saveGame, 
    isAutoSaveEnabled,
    isInitialized
  } = useGameEngine();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Initialize game engine when component mounts
    initialize();
    
    // Redirect to character creation if character not created
    if (!game.characterCreated) {
      setLocation('/character');
    }
    
    // Simulate loading to show the animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
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
  
  // Show loading animation during initialization
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100 dark:from-slate-900 dark:to-slate-800">
        <LoadingAnimation 
          type="qi" 
          size="lg" 
          mood="dynamic"
          text="Gathering Qi Energy..." 
        />
      </div>
    );
  }
  
  // Calculate time since last save
  const lastSavedDate = new Date(game.lastSaved);
  const now = new Date();
  const minutesSinceLastSave = Math.floor((now.getTime() - lastSavedDate.getTime()) / 60000);
  
  return (
    <PageTransition>
      <div className="min-h-screen">
        <HeaderStats />
        
        <PageContent>
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
        </PageContent>
        
        <SettingsModal />
      </div>
    </PageTransition>
  );
}
