import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useGameEngine } from '@/lib/gameEngine';
import { setPage, setRealm, setContext } from '@/lib/moodManager';

/**
 * MoodBackground component
 * 
 * This component manages the ambient mood of the application
 * by changing background colors based on location, realm, and context
 */
export function MoodBackground() {
  const [location] = useLocation();
  const { game } = useGameEngine();
  const [prevLocation, setPrevLocation] = useState<string | null>(null);
  const [prevRealm, setPrevRealm] = useState<string | null>(null);
  
  // When location changes, update the page mood
  useEffect(() => {
    if (location !== prevLocation) {
      setPage(location || '/');
      setPrevLocation(location);
      
      // Determine context from location
      if (location === '/combat') {
        setContext('combat');
      } else if (location === '/game') {
        setContext('cultivating');
      } else {
        setContext('idle');
      }
    }
  }, [location, prevLocation]);
  
  // When realm changes, update the realm mood
  useEffect(() => {
    if (game.realm !== prevRealm) {
      setRealm(game.realm);
      setPrevRealm(game.realm);
    }
  }, [game.realm, prevRealm]);
  
  // Update mood based on energy/cultivation in combat
  useEffect(() => {
    if (location === '/combat') {
      // Calculate a percentage based on cultivation progress as a health proxy
      const energy = game.energy;
      const maxEnergyStorage = 1000; // Use a fixed value for simplicity
      
      if (typeof energy === 'number') {
        const energyPercentage = energy / maxEnergyStorage;
        
        if (energyPercentage < 0.3) {
          setContext('low-health');
        } else {
          setContext('combat');
        }
      }
    }
  }, [location, game.energy]);
  
  // Add CSS variables to the document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Add core CSS for background transitions
      const style = document.createElement('style');
      style.textContent = `
        :root {
          --mood-primary: #f0f0f0;
          --mood-secondary: #e5e5e5;
          --mood-overlay: transparent;
          --mood-overlay-intensity: 0;
          --mood-transition-speed: 8s;
          --mood-pulse-rate: 2s;
        }
        
        body {
          position: relative;
          background: linear-gradient(135deg, 
                      var(--mood-primary) 0%, 
                      var(--mood-secondary) 100%);
          background-size: 400% 400%;
          animation: gradient-shift var(--mood-transition-speed) ease infinite;
        }
        
        body::after {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--mood-overlay);
          opacity: var(--mood-overlay-intensity);
          pointer-events: none;
          z-index: 0;
        }
        
        .mood-pulsing body::after {
          animation: mood-pulse var(--mood-pulse-rate) ease-in-out infinite alternate;
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes mood-pulse {
          0% { opacity: calc(var(--mood-overlay-intensity) * 0.7); }
          100% { opacity: var(--mood-overlay-intensity); }
        }
        
        /* Ensure content stays above the overlay */
        #root, main, .flex-grow {
          position: relative;
          z-index: 1;
        }
      `;
      
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);
  
  // This component doesn't render anything visible
  return null;
}