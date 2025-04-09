import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Music, Volume1 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Create audio element once
  useEffect(() => {
    const audio = document.createElement("audio");
    audio.src = "/audio/bg.mp3";
    audio.loop = true;
    audio.volume = volume;
    
    // Handle end of track to ensure looping works
    audio.addEventListener("ended", () => {
      // Force replay
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error("Audio replay failed:", error);
      });
    });
    
    // Set the audio element
    audioRef.current = audio;
    setAudioElement(audio);
    
    // Clean up on unmount
    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, []);

  // Try to start playing once the component mounts and after any user interaction
  useEffect(() => {
    if (audioElement && hasUserInteracted) {
      audioElement.play()
        .then(() => {
          setIsPlaying(true);
          toast({
            title: "Music Playing",
            description: "Background music is now playing.",
          });
        })
        .catch(error => {
          console.error("Audio play failed:", error);
          setIsPlaying(false);
        });
    }
  }, [audioElement, hasUserInteracted, toast]);

  // Handle volume changes
  useEffect(() => {
    if (audioElement) {
      audioElement.volume = isMuted ? 0 : volume;
    }
  }, [audioElement, volume, isMuted]);

  // Function to toggle play/pause
  const togglePlay = () => {
    if (!audioElement) return;
    
    setHasUserInteracted(true);
    
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
    
    setHasUserInteracted(true);
    audioElement.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle volume slider changes
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (!audioElement) return;
    
    setHasUserInteracted(true);
    
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
      audioElement.muted = false;
    }
    
    audioElement.volume = newVolume;
  };

  // Force play on dialog open
  const handleDialogOpen = (open: boolean) => {
    setDialogOpen(open);
    
    if (open && audioElement && !isPlaying) {
      setHasUserInteracted(true);
      audioElement.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error("Audio play failed:", error);
        });
    }
  };

  // Compact version for navbar
  return (
    <div className="audio-player flex items-center gap-2">
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-8 h-8 p-0 rounded-full relative"
            onClick={() => setHasUserInteracted(true)}
          >
            <Music size={16} className={isPlaying ? "text-amber-200" : "text-gray-400"} />
            {!isPlaying && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Music Settings</DialogTitle>
            <DialogDescription>
              Enable background music for an immersive cultivation experience.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Background Music</span>
              <Button 
                variant={isPlaying ? "default" : "outline"} 
                size="sm" 
                onClick={togglePlay}
              >
                {isPlaying ? "Pause" : "Play"}
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Volume</span>
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
        </DialogContent>
      </Dialog>
      
      <div className="text-xs font-medium hidden sm:block">
        {isPlaying ? 
          <span className="text-amber-200">♪ Music On</span> : 
          <span className="text-gray-300">Music Off</span>
        }
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={togglePlay}
        className="text-xs px-2 py-0 h-6 hidden sm:flex"
      >
        {isPlaying ? "Pause" : "Play"}
      </Button>
    </div>
  );
}