import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Music, Volume1 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true); // Default to playing
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio("/audio/bg.mp3");
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // Try to autoplay
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error("Audio play failed:", error);
          setIsPlaying(false);
        });
    }

    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Some browsers require user interaction before playing audio
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(error => {
              console.error("Audio play failed:", error);
            });
        }
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
      if (audioRef.current) {
        audioRef.current.muted = false;
      }
    }
  };

  // Compact version for navbar
  return (
    <div className="audio-player flex items-center gap-2">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-8 h-8 p-0 rounded-full"
          >
            <Music size={16} className="text-amber-200" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Music Settings</DialogTitle>
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