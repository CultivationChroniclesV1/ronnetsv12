import { useGameEngine } from '@/lib/gameEngine';
import { canBreakthrough } from '@/lib/gameState';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatNumber } from '@/lib/utils';

export function CultivationActions() {
  const { game, manualCultivate, attemptBreakthrough } = useGameEngine();
  
  // Calculate breakthrough progress percentage
  const breakthroughProgress = (game.energy / game.maxCultivationProgress) * 100;
  const canAttemptBreakthrough = canBreakthrough(game);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Manual Cultivation */}
      <div className="bg-scroll rounded-lg p-4 relative overflow-hidden shadow-md">
        <h3 className="font-serif text-lg mb-3 text-primary">Manual Cultivation</h3>
        
        <div className="flex flex-col items-center">
          <button 
            onClick={manualCultivate}
            className="w-24 h-24 rounded-full bg-primary hover:bg-opacity-90 text-white flex items-center justify-center border-4 border-amber-400 mb-3 relative focus:outline-none active:scale-95 transition-all duration-100"
          >
            <div className="absolute inset-0 rounded-full border-2 border-white border-opacity-50"></div>
            <i className="fas fa-om text-2xl animate-pulse"></i>
          </button>
          
          <div className="text-sm text-center">
            <p className="font-semibold">+{game.manualCultivationAmount} Qi per click</p>
            <p className="mt-1 text-xs text-gray-600 italic">Meditate to accumulate Qi energy</p>
          </div>
        </div>
      </div>
      
      {/* Passive Cultivation */}
      <div className="bg-scroll rounded-lg p-4 relative overflow-hidden shadow-md">
        <h3 className="font-serif text-lg mb-3 text-primary">Passive Cultivation</h3>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Current Technique:</span>
            <span className="font-['Ma_Shan_Zheng'] text-blue-500">气功</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Base Production:</span>
            <span className="font-semibold">{game.energyRate.toFixed(1)} Qi/s</span>
          </div>
        </div>
        
        <Progress value={75} className="h-2" />
        
        <div className="mt-3 text-xs text-gray-600 italic text-center">
          Your body naturally accumulates Qi even while idle
        </div>
      </div>
      
      {/* Breakthrough */}
      <div className="bg-scroll rounded-lg p-4 relative overflow-hidden shadow-md">
        <h3 className="font-serif text-lg mb-3 text-primary">Breakthrough</h3>
        
        <div className="flex flex-col items-center">
          <Button
            onClick={attemptBreakthrough}
            disabled={!canAttemptBreakthrough}
            className={`w-full py-3 ${
              canAttemptBreakthrough ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-300 text-gray-500'
            } rounded-md font-semibold mb-2`}
            variant={canAttemptBreakthrough ? "default" : "secondary"}
          >
            <i className="fas fa-level-up-alt mr-1"></i> Attempt Breakthrough
          </Button>
          
          <Progress 
            value={breakthroughProgress} 
            className="h-2 mb-2"
            // Change color based on progress
            indicatorColor={breakthroughProgress >= 100 ? 'bg-amber-500' : undefined}
          />
          
          <div className="text-xs text-center text-gray-600 italic">
            <p>Required: {formatNumber(game.maxCultivationProgress)} Qi Energy</p>
            <p className="mt-1">Breakthrough to advance to the next cultivation level</p>
          </div>
        </div>
      </div>
    </div>
  );
}
