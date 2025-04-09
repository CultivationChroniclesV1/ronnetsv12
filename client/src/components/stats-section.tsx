import { useGameEngine } from '@/lib/gameEngine';
import { ACHIEVEMENTS } from '@/lib/constants';
import { formatNumber, formatTime } from '@/lib/utils';

export function StatsSection() {
  const { game } = useGameEngine();
  
  // Format the cultivation time
  const formattedTime = formatTime(game.timeCultivating);
  
  // Build achievements list with earned status
  const achievementsList = Object.entries(ACHIEVEMENTS).map(([id, achievement]) => {
    const earned = game.achievements[id]?.earned || false;
    return {
      id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      earned
    };
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-scroll rounded-lg p-4 shadow-md">
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
      
      <div className="bg-scroll rounded-lg p-4 shadow-md">
        <h2 className="font-serif text-xl mb-3 text-primary">
          <i className="fas fa-trophy text-sm mr-2"></i> Achievements
        </h2>
        
        <div className="space-y-3">
          {achievementsList.map(achievement => (
            <div key={achievement.id} className="flex items-center p-2 border border-gray-200 rounded bg-white bg-opacity-70">
              <div className={`w-10 h-10 rounded-full ${
                achievement.earned ? 'bg-amber-500' : 'bg-gray-300'
              } flex items-center justify-center mr-3 text-white`}>
                <i className={`fas fa-${achievement.icon}`}></i>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-sm">{achievement.name}</h5>
                <p className="text-xs text-gray-600">{achievement.description}</p>
              </div>
              <div className={achievement.earned ? 'text-green-600' : 'text-gray-400'}>
                <i className={`fas fa-${achievement.earned ? 'check-circle' : 'circle'}`}></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
