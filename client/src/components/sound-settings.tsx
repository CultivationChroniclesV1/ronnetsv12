import { useEffect } from 'react';
import { useAudio } from '@/components/audio-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { SoundButton } from '@/components/ui/sound-button';

export function SoundSettings() {
  const { 
    isMusicEnabled, 
    isSoundEnabled, 
    musicVolume, 
    soundVolume,
    toggleMusic, 
    toggleSound, 
    setMusicVolume, 
    setSoundVolume,
    playSound
  } = useAudio();
  
  // Play sound when volume changes to preview
  useEffect(() => {
    if (isSoundEnabled) {
      const debounce = setTimeout(() => {
        playSound('click');
      }, 300);
      
      return () => clearTimeout(debounce);
    }
  }, [soundVolume, isSoundEnabled, playSound]);
  
  return (
    <Card className="animate-slide-in-bottom" style={{ animationDelay: '0.7s' }}>
      <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-indigo-100">
        <CardTitle className="text-xl flex items-center">
          <span className="inline-block w-5 h-5 mr-2 rounded-full bg-indigo-500 animate-pulse-slow"></span>
          Sound Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="p-4 border border-gray-200 rounded-md hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="music-toggle" className="text-base font-medium">Background Music</Label>
              <p className="text-sm text-muted-foreground">
                Enable atmospheric music for each area
              </p>
            </div>
            <Switch
              id="music-toggle"
              checked={isMusicEnabled}
              onCheckedChange={toggleMusic}
              className="data-[state=checked]:bg-indigo-500"
            />
          </div>
          
          <div className="mt-4">
            <Label htmlFor="music-volume" className="text-sm">
              Music Volume: {Math.round(musicVolume * 100)}%
            </Label>
            <Slider
              id="music-volume"
              disabled={!isMusicEnabled}
              value={[musicVolume * 100]}
              min={0}
              max={100}
              step={5}
              className="mt-2"
              onValueChange={(value) => setMusicVolume(value[0] / 100)}
            />
          </div>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-md hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="sound-toggle" className="text-base font-medium">Sound Effects</Label>
              <p className="text-sm text-muted-foreground">
                Enable interactive sound effects for buttons and actions
              </p>
            </div>
            <Switch
              id="sound-toggle"
              checked={isSoundEnabled}
              onCheckedChange={toggleSound}
              className="data-[state=checked]:bg-indigo-500"
            />
          </div>
          
          <div className="mt-4">
            <Label htmlFor="sound-volume" className="text-sm">
              Sound Volume: {Math.round(soundVolume * 100)}%
            </Label>
            <Slider
              id="sound-volume"
              disabled={!isSoundEnabled}
              value={[soundVolume * 100]}
              min={0}
              max={100}
              step={5}
              className="mt-2"
              onValueChange={(value) => setSoundVolume(value[0] / 100)}
            />
          </div>
          
          <div className="mt-4 flex space-x-2">
            <SoundButton size="sm" soundEffect="click" disabled={!isSoundEnabled}>
              Click
            </SoundButton>
            <SoundButton size="sm" soundEffect="success" disabled={!isSoundEnabled}>
              Success
            </SoundButton>
            <SoundButton size="sm" soundEffect="breakthrough" disabled={!isSoundEnabled}>
              Breakthrough
            </SoundButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}