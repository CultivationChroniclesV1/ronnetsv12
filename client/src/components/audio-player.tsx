import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio("/audio/bg.mp3");
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

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
      } else {
        // Some browsers require user interaction before playing audio
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Audio play failed:", error);
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="audio-player flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={toggleMute}
        className="w-8 h-8 p-0 rounded-full"
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </Button>
      <div className="text-xs font-medium">
        {isPlaying ? "Music Playing" : "Music Paused"}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={togglePlay}
        className="text-xs px-2 py-0 h-6"
      >
        {isPlaying ? "Pause" : "Play"}
      </Button>
    </div>
  );
}