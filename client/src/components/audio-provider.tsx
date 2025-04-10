import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { 
  audioManager, 
  playMusicForPage, 
  playSfx, 
  toggleMusic, 
  toggleSound,
  setMusicVolume,
  setSfxVolume
} from '@/lib/audioManager';

interface AudioContextType {
  isMusicEnabled: boolean;
  isSoundEnabled: boolean;
  musicVolume: number;
  soundVolume: number;
  toggleMusic: () => void;
  toggleSound: () => void;
  playSound: (soundName: string) => void;
  setMusicVolume: (volume: number) => void;
  setSoundVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType>({
  isMusicEnabled: true,
  isSoundEnabled: true,
  musicVolume: 0.3,
  soundVolume: 0.5,
  toggleMusic: () => {},
  toggleSound: () => {},
  playSound: () => {},
  setMusicVolume: () => {},
  setSoundVolume: () => {}
});

interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [location] = useLocation();
  const [isMusicEnabled, setIsMusicEnabled] = useState(audioManager?.getMusicEnabled() ?? true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(audioManager?.getSoundEnabled() ?? true);
  const [musicVolume, setMusicVolumeState] = useState(audioManager?.getMusicVolume() ?? 0.3);
  const [soundVolume, setSoundVolumeState] = useState(audioManager?.getSfxVolume() ?? 0.5);

  // Play background music when route changes
  useEffect(() => {
    if (location) {
      playMusicForPage(location);
    }
  }, [location]);

  // Implementation of context methods
  const handleToggleMusic = () => {
    const isEnabled = toggleMusic() ?? !isMusicEnabled;
    setIsMusicEnabled(isEnabled);
  };

  const handleToggleSound = () => {
    const isEnabled = toggleSound() ?? !isSoundEnabled;
    setIsSoundEnabled(isEnabled);
  };

  const handlePlaySound = (soundName: string) => {
    playSfx(soundName);
  };

  const handleSetMusicVolume = (volume: number) => {
    setMusicVolume(volume);
    setMusicVolumeState(volume);
  };

  const handleSetSoundVolume = (volume: number) => {
    setSfxVolume(volume);
    setSoundVolumeState(volume);
  };

  const contextValue: AudioContextType = {
    isMusicEnabled,
    isSoundEnabled,
    musicVolume,
    soundVolume,
    toggleMusic: handleToggleMusic,
    toggleSound: handleToggleSound,
    playSound: handlePlaySound,
    setMusicVolume: handleSetMusicVolume,
    setSoundVolume: handleSetSoundVolume
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
}

// Custom hook for using the audio context
export function useAudio() {
  return useContext(AudioContext);
}

// Custom hook for adding sound to a button
export function useSoundButton(soundName: string = 'click') {
  const { playSound, isSoundEnabled } = useAudio();
  
  const handleClick = () => {
    if (isSoundEnabled) {
      playSound(soundName);
    }
  };
  
  return { onClick: handleClick };
}

// Enhanced button that plays sound on click
export function withSound<T extends { onClick?: (...args: any[]) => void }>(
  Component: React.ComponentType<T>,
  soundName: string = 'click'
) {
  return function WithSoundComponent(props: T) {
    const { playSound, isSoundEnabled } = useAudio();
    
    const handleClick = (...args: any[]) => {
      if (isSoundEnabled) {
        playSound(soundName);
      }
      props.onClick?.(...args);
    };
    
    return <Component {...props} onClick={handleClick} />;
  };
}