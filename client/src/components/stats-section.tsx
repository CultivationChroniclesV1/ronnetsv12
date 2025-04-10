import { useGameEngine } from '@/lib/gameEngine';
import { formatNumber, formatTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export function StatsSection() {
  const { game } = useGameEngine();
  const [, setLocation] = useLocation();
  
  // Format the cultivation time
  const formattedTime = formatTime(game.timeCultivating);
  
  // Count earned achievements
  const earnedAchievements = Object.values(game.achievements).filter(a => a.earned).length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-scroll rounded-lg p-4 shadow-md animate-fade-in">
        <h2 className="font-serif text-xl mb-3 text-primary">
          <i className="fas fa-chart-line text-sm mr-2"></i> Cultivation Stats
        </h2>
        
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2">Total Qi Generated</td>
              <td className="py-2 text-right font-semibold">{formatNumber(game.totalQiGenerated)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">Times Meditated</td>
              <td className="py-2 text-right font-semibold">{formatNumber(game.timesMeditated)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">Successful Breakthroughs</td>
              <td className="py-2 text-right font-semibold">{game.successfulBreakthroughs}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">Failed Breakthroughs</td>
              <td className="py-2 text-right font-semibold">{game.failedBreakthroughs}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">Highest Qi Reached</td>
              <td className="py-2 text-right font-semibold">{formatNumber(game.highestQi)}</td>
            </tr>
            <tr>
              <td className="py-2">Time Cultivating</td>
              <td className="py-2 text-right font-semibold">{formattedTime}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="bg-scroll rounded-lg p-4 shadow-md flex flex-col justify-between animate-slide-in-right">
        <div>
          <h2 className="font-serif text-xl mb-3 text-primary">
            <i className="fas fa-trophy text-sm mr-2"></i> Achievements Overview
          </h2>
          
          <div className="space-y-3 mb-4">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-medium text-amber-700 mb-2">Achievement Progress</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm">Earned:</span>
                <span className="font-bold text-amber-700">{earnedAchievements}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-amber-500 h-2.5 rounded-full animate-pulse-slow" style={{ width: '25%' }}></div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-700 mb-1">Recent Achievement</h3>
              <p className="text-sm text-gray-600 mb-2">
                View your latest cultivation milestones on the achievements page
              </p>
            </div>
          </div>
        </div>
        
        <Button 
          className="w-full bg-amber-500 hover:bg-amber-600 mt-4 animate-bounce-soft"
          style={{ animationDuration: '3s' }}
          onClick={() => setLocation('/achievements')}
        >
          <i className="fas fa-trophy mr-2"></i>
          View All Achievements
        </Button>
      </div>
    </div>
  );
}
