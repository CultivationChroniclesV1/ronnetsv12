import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { PageTransition, PageContent } from "@/components/page-transition";
import { Volume2, VolumeX, Music, Volume1, Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const AUDIO_KEY = 'game-music-enabled';
const VOLUME_KEY = 'game-music-volume';
const TRACKS = [
  { id: 'bg', name: 'Peaceful Cultivation', file: '/audio/bg.mp3', mood: 'peaceful' },
  { id: 'combat', name: 'Battle Theme', file: '/audio/combat.mp3', mood: 'intense' },
  { id: 'meditation', name: 'Deep Meditation', file: '/audio/meditation.mp3', mood: 'calm' },
  { id: 'breakthrough', name: 'Spirit Breakthrough', file: '/audio/breakthrough.mp3', mood: 'uplifting' },
];

export default function MusicSettings() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(TRACKS[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  
  // Create audio element once
  useEffect(() => {
    // Try to load saved volume
    const savedVolume = localStorage.getItem(VOLUME_KEY);
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
    
    // Try to load auto-play setting
    const musicEnabled = localStorage.getItem(AUDIO_KEY);
    if (musicEnabled === 'false') {
      setAutoPlay(false);
    }
    
    // Create the audio element
    const audio = new Audio(currentTrack.file);
    audio.loop = true;
    audio.volume = volume;
    
    // Set refs
    audioRef.current = audio;
    setAudioElement(audio);
    
    // Clean up on unmount
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);
  
  // Update audio source when track changes
  useEffect(() => {
    if (audioElement) {
      const wasPlaying = !audioElement.paused;
      audioElement.src = currentTrack.file;
      audioElement.load();
      
      if (wasPlaying) {
        audioElement.play().catch(error => {
          console.error("Failed to play new track:", error);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrack, audioElement]);
  
  // Function to toggle play/pause
  const togglePlay = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error("Audio play failed:", error);
          toast({
            title: "Playback Failed",
            description: "Please click the play button again to enable music.",
            variant: "destructive"
          });
        });
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (!audioElement) return;
    
    audioElement.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle volume slider changes
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    // Save volume to localStorage
    localStorage.setItem(VOLUME_KEY, newVolume.toString());
    
    if (!audioElement) return;
    
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
      audioElement.muted = false;
    }
    
    audioElement.volume = newVolume;
  };
  
  // Toggle auto-play setting
  const toggleAutoPlay = () => {
    const newState = !autoPlay;
    setAutoPlay(newState);
    localStorage.setItem(AUDIO_KEY, newState.toString());
    
    toast({
      title: newState ? "Music Auto-Play Enabled" : "Music Auto-Play Disabled",
      description: newState 
        ? "Background music will automatically play when you start the game." 
        : "You will need to manually start music.",
    });
  };
  
  // Change track
  const changeTrack = (trackId: string) => {
    const track = TRACKS.find(t => t.id === trackId);
    if (track) {
      setCurrentTrack(track);
      
      toast({
        title: "Now Playing",
        description: track.name,
      });
    }
  };
  
  // Skip to next or previous track
  const nextTrack = () => {
    const currentIndex = TRACKS.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % TRACKS.length;
    setCurrentTrack(TRACKS[nextIndex]);
  };
  
  const previousTrack = () => {
    const currentIndex = TRACKS.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + TRACKS.length) % TRACKS.length;
    setCurrentTrack(TRACKS[prevIndex]);
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <PageContent>
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-serif text-white mb-2">
                <Music className="inline-block mr-2" />
                Musical Cultivation
              </h1>
              <p className="text-white/70">Enhance your cultivation journey with harmonious melodies</p>
            </div>
          </PageContent>
          
          <PageContent delay={200}>
            <Card className="bg-white/90 shadow-xl mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span>Now Playing</span>
                  <div className="flex items-center ml-auto space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={previousTrack}
                    >
                      <SkipBack size={18} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant={isPlaying ? "default" : "outline"}
                      onClick={togglePlay}
                      className="w-10 h-10 rounded-full"
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={nextTrack}
                    >
                      <SkipForward size={18} />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  {currentTrack.name} - <span className="italic text-primary/70">{currentTrack.mood} melody</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Volume Control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Volume</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={toggleMute}
                        className="w-8 h-8 p-0 rounded-full"
                      >
                        {isMuted ? <VolumeX size={16} /> : volume < 0.5 ? <Volume1 size={16} /> : <Volume2 size={16} />}
                      </Button>
                    </div>
                    <Slider
                      defaultValue={[volume]}
                      max={1}
                      step={0.01}
                      value={[volume]}
                      onValueChange={handleVolumeChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </PageContent>
          
          <PageContent delay={300}>
            <Card className="bg-white/90 shadow-xl mb-6">
              <CardHeader>
                <CardTitle>Music Library</CardTitle>
                <CardDescription>
                  Select a track for your cultivation journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {TRACKS.map(track => (
                    <div 
                      key={track.id}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                        currentTrack.id === track.id 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => changeTrack(track.id)}
                    >
                      <div>
                        <div className="font-medium">{track.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{track.mood} atmosphere</div>
                      </div>
                      {currentTrack.id === track.id && (
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </PageContent>
          
          <PageContent delay={400}>
            <Card className="bg-white/90 shadow-xl">
              <CardHeader>
                <CardTitle>Music Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-play">Auto-Play Music</Label>
                      <div className="text-sm text-gray-500">
                        Automatically play music when you start the game
                      </div>
                    </div>
                    <Switch
                      id="auto-play"
                      checked={autoPlay}
                      onCheckedChange={toggleAutoPlay}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </PageContent>
        </div>
      </div>
    </PageTransition>
  );
}