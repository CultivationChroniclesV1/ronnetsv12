import { Link } from 'wouter';
import { useAudio } from '@/components/audio-provider';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * More minimal audio control that directs to a dedicated audio settings page
 */
export function AudioPlayer() {
  const { isMusicEnabled, toggleMusic, playSound } = useAudio();

  // Play sound effect and perform action
  const handleMusicToggle = () => {
    playSound('click');
    toggleMusic();
  };
  
  // Play sound when clicking the settings button
  const handleSettingsClick = () => {
    playSound('click');
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
        {/* Music toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="shadow-md h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 hover:bg-background transition-all"
              onClick={handleMusicToggle}
            >
              {isMusicEnabled ? (
                <i className="fas fa-music text-primary"></i>
              ) : (
                <i className="fas fa-volume-mute text-muted-foreground"></i>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{isMusicEnabled ? 'Mute Music' : 'Enable Music'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Link to audio settings page */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/audio-settings">
              <Button
                size="sm"
                variant="ghost" 
                className="shadow-md h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 hover:bg-background transition-all"
                onClick={handleSettingsClick}
              >
                <i className="fas fa-sliders-h text-primary"></i>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Audio Settings</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}