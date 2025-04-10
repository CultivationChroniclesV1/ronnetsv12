import { useEffect } from 'react';
import { playSfx, setMusicVolume, setSfxVolume } from '@/lib/audioManager';
import { useAudio } from '@/components/audio-provider';
import { PAGE_MUSIC } from '@/lib/audioManager';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AudioSettingsPage() {
  const { 
    isMusicEnabled, 
    isSoundEnabled, 
    musicVolume, 
    soundVolume, 
    toggleMusic, 
    toggleSound, 
    playSound 
  } = useAudio();
  
  // No need for useSoundButton since we're handling clicks manually
  
  useEffect(() => {
    // Set document title
    document.title = 'Audio Settings - Cultivation Chronicles';
  }, []);
  
  return (
    <div className="container max-w-4xl py-8 mx-auto">
      <h1 className="text-3xl font-serif font-semibold mb-8 text-center">
        <span className="text-primary">音乐设置</span>
        <span className="text-xl ml-2 opacity-70"> - Music Settings</span>
      </h1>
      
      <div className="max-w-lg mx-auto">
        <Card className="overflow-hidden border-primary/20 shadow-md scale-in">
          <CardHeader className="bg-primary/5">
            <CardTitle>Sound Settings</CardTitle>
            <CardDescription>Configure your audio experience</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="toggle-music" className="flex items-center space-x-2">
                  <span className="text-lg">Background Music</span>
                </Label>
                <Switch
                  id="toggle-music"
                  checked={isMusicEnabled}
                  onCheckedChange={() => {
                    toggleMusic();
                    playSfx('click');
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="music-volume" className="flex justify-between">
                  <span>Music Volume</span>
                  <span className="text-muted-foreground">{Math.round(musicVolume * 100)}%</span>
                </Label>
                <Slider
                  id="music-volume"
                  disabled={!isMusicEnabled}
                  min={0}
                  max={1}
                  step={0.01}
                  value={[musicVolume]}
                  onValueChange={(value) => {
                    setMusicVolume(value[0]);
                    if (value[0] % 0.1 === 0) playSfx('hover');
                  }}
                  className="mt-2"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="toggle-sound" className="flex items-center space-x-2">
                  <span className="text-lg">Sound Effects</span>
                </Label>
                <Switch
                  id="toggle-sound"
                  checked={isSoundEnabled}
                  onCheckedChange={() => {
                    toggleSound();
                    setTimeout(() => playSfx('click'), 10);
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sound-volume" className="flex justify-between">
                  <span>Sound Effects Volume</span>
                  <span className="text-muted-foreground">{Math.round(soundVolume * 100)}%</span>
                </Label>
                <Slider
                  id="sound-volume"
                  disabled={!isSoundEnabled}
                  min={0}
                  max={1}
                  step={0.01}
                  value={[soundVolume]}
                  onValueChange={(value) => {
                    setSfxVolume(value[0]);
                    if (value[0] % 0.1 === 0) playSfx('hover');
                  }}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>

        </Card>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-primary/70 text-sm mb-2">
          "The music of nature guides the cultivation path."
        </p>
        <Button 
          variant="ghost" 
          className="mx-auto"
          onClick={(e) => {
            e.preventDefault();
            playSound('click');
            window.history.back();
          }}
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Return
        </Button>
      </div>
    </div>
  );
}