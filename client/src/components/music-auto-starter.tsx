import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAudio } from '@/components/audio-provider';
import { playMusicForPage } from '@/lib/audioManager';
import { useGameEngine } from '@/lib/gameEngine';

/**
 * This component handles automatic music playback based on location
 * Music will play automatically for each page without requiring user interaction
 */
export function MusicAutoStarter() {
  const [location] = useLocation();
  const { isMusicEnabled } = useAudio();
  const { isInitialized } = useGameEngine();

  // Automatically play music based on current location
  useEffect(() => {
    if (isInitialized && isMusicEnabled) {
      // Play appropriate music for the current location
      const routeKey = '/' + location.split('/')[1] || '/';
      playMusicForPage(routeKey);
      
      // Create a hidden audio element to trigger browser audio context
      const unlockAudio = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
        
        // Create and play a silent audio element to unlock audio
        const silentAudio = new Audio('/audio/music/silence-placeholder.mp3');
        silentAudio.play().catch(() => {
          console.log('Audio context could not be started automatically');
        });
        
        // Remove event listeners after first interaction
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
      };
      
      // Add event listeners to unlock audio on user interaction
      document.addEventListener('click', unlockAudio);
      document.addEventListener('touchstart', unlockAudio);
      document.addEventListener('keydown', unlockAudio);
      
      // Try to play immediately (for browsers that support it)
      unlockAudio();
      
      return () => {
        // Clean up event listeners
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
      };
    }
  }, [location, isInitialized, isMusicEnabled]);

  // This component doesn't render anything visible
  return null;
}