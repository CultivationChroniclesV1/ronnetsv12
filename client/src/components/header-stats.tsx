import { useGameEngine } from '@/lib/gameEngine';
import { formatNumber } from '@/lib/utils';

export function HeaderStats() {
  const { game } = useGameEngine();
  
  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between py-2">
          <h1 className="font-serif text-lg md:text-2xl font-bold flex items-center">
            <span className="font-['Ma_Shan_Zheng'] mr-2 text-amber-300">仙道</span> 
            Immortal Cultivation Path
          </h1>
          
          <div className="flex items-center space-x-4 mt-1 md:mt-0">
            {/* Qi Energy */}
            <div className="flex items-center">
              <i className="fas fa-fire-alt text-amber-300 mr-1"></i>
              <span className="text-sm">{formatNumber(game.energy)} Qi</span>
            </div>
            
            {/* Gold */}
            <div className="flex items-center">
              <i className="fas fa-coins text-yellow-400 mr-1"></i>
              <span className="text-sm">{formatNumber(game.gold)}</span>
            </div>
            
            {/* Spiritual Stones */}
            <div className="flex items-center">
              <i className="fas fa-gem text-blue-300 mr-1"></i>
              <span className="text-sm">{formatNumber(game.spiritualStones)}</span>
            </div>
            
            {/* Energy Rate */}
            <div className="hidden md:flex items-center">
              <i className="fas fa-tachometer-alt text-green-300 mr-1"></i>
              <span className="text-sm">{game.energyRate.toFixed(1)}/s</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
