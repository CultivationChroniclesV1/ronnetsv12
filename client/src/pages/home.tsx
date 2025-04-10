import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useGameEngine } from '@/lib/gameEngine';

export default function Home() {
  const { initialize, game } = useGameEngine();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Initialize game engine when component mounts
    initialize();
  }, [initialize]);
  
  // Function to start the journey - redirects to character creation if no character exists
  const startJourney = () => {
    if (game.characterCreated) {
      setLocation('/game');
    } else {
      setLocation('/character');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-scroll text-center p-4">
      <div className="animate-float mb-6">
        <h1 className="font-serif text-4xl md:text-6xl font-bold mb-2 text-primary">
          <span className="font-['Ma_Shan_Zheng'] text-amber-500 mr-2">修仙录</span>
          <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
            Cultivation Chronicles
          </span>
        </h1>
        <p className="text-lg mb-8 italic text-gray-700">
          Begin your journey to immortality through the ancient art of cultivation
        </p>
      </div>
      
      <div className="max-w-2xl w-full bg-white bg-opacity-90 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="font-serif text-2xl text-primary mb-4">Your Journey Begins</h2>
        <p className="mb-6 text-gray-700">
          In the vast world of cultivation, strength is measured not by earthly possessions, 
          but by one's command over Qi, the fundamental energy of the universe. As a novice
          cultivator, you will begin at the first stage of Qi Condensation, gradually ascending
          through greater realms of power.
        </p>
        
        <div className="flex flex-col md:flex-row justify-center gap-4 mb-4">
          <div className="flex-1 border border-blue-200 rounded-md p-3 bg-blue-50">
            <h3 className="font-serif text-blue-600 mb-2">Cultivate Qi</h3>
            <p className="text-sm text-gray-600">Accumulate the mystical energy that flows through all things</p>
          </div>
          
          <div className="flex-1 border border-purple-200 rounded-md p-3 bg-purple-50">
            <h3 className="font-serif text-purple-600 mb-2">Master Techniques</h3>
            <p className="text-sm text-gray-600">Learn ancient methods to accelerate your cultivation</p>
          </div>
          
          <div className="flex-1 border border-amber-200 rounded-md p-3 bg-amber-50">
            <h3 className="font-serif text-amber-600 mb-2">Breakthrough Realms</h3>
            <p className="text-sm text-gray-600">Advance to higher stages of spiritual enlightenment</p>
          </div>
        </div>
        
        {game.characterCreated && (
          <div className="mt-4 py-3 px-4 border border-green-200 bg-green-50 rounded-md">
            <p className="text-sm text-green-700 flex items-center">
              <i className="fas fa-user-check mr-2"></i>
              Welcome back, {game.characterName} of the {game.sect} sect!
            </p>
          </div>
        )}
      </div>
      
      <Button 
        size="lg" 
        className="font-serif bg-primary hover:bg-primary/90 text-white px-8 py-6 h-auto"
        onClick={startJourney}
      >
        <span className="text-xl">
          {game.characterCreated ? 'Continue Cultivation' : 'Create Character'}
        </span>
      </Button>
    </div>
  );
}
