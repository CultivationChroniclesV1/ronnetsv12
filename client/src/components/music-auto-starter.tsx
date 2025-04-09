import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

const AUDIO_KEY = 'game-music-enabled';

/**
 * This component handles auto-starting music on app load
 * It's a separate component to isolate this functionality
 */
export function MusicAutoStarter() {
  const { toast } = useToast();
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Audio player initialization
  useEffect(() => {
    // By default, we'll try to play music unless explicitly disabled
    const musicDisabled = localStorage.getItem(AUDIO_KEY) === 'false';
    
    if (musicDisabled) {
      return; // User has explicitly disabled music
    }
    
    // Set default to true for first-time users
    if (localStorage.getItem(AUDIO_KEY) === null) {
      localStorage.setItem(AUDIO_KEY, 'true');
    }
    
    // Function to try playing audio
    const playAudio = () => {
      // Direct audio element approach - more reliable
      const audio = document.createElement('audio');
      audio.src = '/audio/bg.mp3';
      audio.loop = true;
      audio.volume = 0.5;
      
      // Play the audio
      audio.play()
        .then(() => {
          document.body.appendChild(audio); // Keep the element in the DOM
          setAudioInitialized(true);
          
          // Show a toast notification
          toast({
            title: "Music Enabled",
            description: "Background music is now playing. You can adjust volume in the settings.",
          });
        })
        .catch(err => {
          console.error("Failed to auto-play audio:", err);
        });
    };
    
    // Function to handle user interaction
    const handleUserInteraction = () => {
      if (!audioInitialized) {
        playAudio();
        
        // Remove listeners after successful initialization
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      }
    };
    
    // Add listeners for various user interactions
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    
    // Also try to play immediately (for browsers that allow it)
    if (!audioInitialized) {
      playAudio();
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [audioInitialized, toast]);

  return null; // This component doesn't render anything
}