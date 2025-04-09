import { useEffect, useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

const AUDIO_KEY = 'game-music-enabled';

/**
 * This component handles auto-starting music on app load
 * It's a separate component to isolate this functionality
 */
export function MusicAutoStarter() {
  const { toast } = useToast();
  const [audioInitialized, setAudioInitialized] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const attemptRef = useRef(0);
  
  // Audio player initialization
  useEffect(() => {
    // Don't try more than 3 times to avoid excessive logs
    if (attemptRef.current > 3) return;
    
    // By default, we'll try to play music unless explicitly disabled
    const musicDisabled = localStorage.getItem(AUDIO_KEY) === 'false';
    
    if (musicDisabled) {
      return; // User has explicitly disabled music
    }
    
    // Set default to true for first-time users
    if (localStorage.getItem(AUDIO_KEY) === null) {
      localStorage.setItem(AUDIO_KEY, 'true');
    }
    
    // Create audio element if it doesn't exist yet
    if (!audioRef.current) {
      const audio = document.createElement('audio');
      audio.id = 'background-music-player';
      audio.src = '/audio/bg.mp3';
      audio.loop = true;
      audio.volume = 0.5;
      audio.autoplay = true; // Attempt autoplay
      
      // Add to document body for more reliable playback
      document.body.appendChild(audio);
      audioRef.current = audio;
      
      // Ensure looping works correctly
      audio.addEventListener('ended', () => {
        console.log('Audio ended, restarting...');
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise) {
          playPromise.catch(err => {
            console.error('Failed to restart audio:', err);
          });
        }
      });
    }
    
    // Function to try playing audio
    const playAudio = () => {
      if (!audioRef.current) return;
      
      attemptRef.current += 1;
      console.log(`Attempting to play audio (attempt ${attemptRef.current})`);
      
      const playPromise = audioRef.current.play();
      
      if (playPromise) {
        playPromise
          .then(() => {
            console.log('Audio playback started successfully');
            setAudioInitialized(true);
            
            // Success toast only on first successful play
            if (attemptRef.current === 1) {
              toast({
                title: "Music Enabled",
                description: "Background music is now playing. You can adjust volume in the settings.",
              });
            }
          })
          .catch(err => {
            console.error(`Failed to auto-play audio (attempt ${attemptRef.current}):`, err);
            
            // Schedule another attempt after a short delay (only for early attempts)
            if (attemptRef.current < 3) {
              setTimeout(() => {
                if (!audioInitialized) playAudio();
              }, 2000);
            }
          });
      }
    };
    
    // Function to handle user interaction
    const handleUserInteraction = () => {
      if (!audioInitialized) {
        playAudio();
      }
    };
    
    // Add listeners for various user interactions
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    
    // Try to play immediately (for browsers that allow it)
    playAudio();
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      
      // We don't remove the audio element to maintain continuous playback
    };
  }, [audioInitialized, toast]);

  return null; // This component doesn't render anything
}