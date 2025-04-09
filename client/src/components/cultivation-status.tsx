import { useGameEngine } from '@/lib/gameEngine';
import { getCurrentRealmData } from '@/lib/gameState';
import { formatNumber } from '@/lib/utils';
import { Progress } from "@/components/ui/progress";

export function CultivationStatus() {
  const { game } = useGameEngine();
  const realmData = getCurrentRealmData(game);
  
  // Calculate cultivation progress percentage
  const progressPercentage = (game.cultivationProgress / game.maxCultivationProgress) * 100;
  
  // Build realm stages data for display
  const realmStages = [
    {
      name: 'Qi Condensation',
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      current: game.realm === 'qi',
      stage: game.realm === 'qi' ? `${game.realmStage}/${game.realmMaxStage}` : 'Locked'
    },
    {
      name: 'Foundation Establishment',
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
      current: game.realm === 'foundation',
      stage: game.realm === 'foundation' ? `${game.realmStage}/${game.realmMaxStage}` : 'Locked'
    },
    {
      name: 'Core Formation',
      color: 'bg-pink-500',
      textColor: 'text-pink-500',
      current: game.realm === 'core',
      stage: game.realm === 'core' ? `${game.realmStage}/${game.realmMaxStage}` : 'Locked'
    },
    {
      name: 'Spirit Severing',
      color: 'bg-red-500',
      textColor: 'text-red-500',
      current: game.realm === 'spirit',
      stage: game.realm === 'spirit' ? `${game.realmStage}/${game.realmMaxStage}` : 'Locked'
    }
  ];
  
  return (
    <div className="bg-scroll rounded-lg p-4 mb-6 relative overflow-hidden shadow-md">
      <div className="cultivation-realm absolute top-2 right-3">
        <span className={`${realmData.color} text-white text-xs rounded px-2 py-1 font-semibold`}>
          {realmData.name}
        </span>
      </div>
      
      <h2 className="font-serif text-xl mb-2 text-primary">Cultivation Progress</h2>
      
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 rounded-full ${realmData.color} flex items-center justify-center relative mr-3`}>
          <i className="fas fa-dragon text-white"></i>
          <div className="absolute inset-0 rounded-full animate-ping opacity-30 border-2 border-blue-500"></div>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="font-['Ma_Shan_Zheng'] mr-1">{realmData.chineseName}</span>
              <span className="font-semibold">Level {game.cultivationLevel}</span>
            </div>
            <div className="text-xs text-gray-600">
              {formatNumber(game.cultivationProgress)}/{formatNumber(game.maxCultivationProgress)}
            </div>
          </div>
          
          <Progress value={progressPercentage} className="h-1 mt-1" />
        </div>
      </div>
      
      <div className="flex flex-wrap -mx-2">
        {realmStages.map((stage, index) => (
          <div key={index} className="px-2 w-1/2 md:w-1/4 mb-2">
            <div className="p-2 border border-gray-200 rounded-md text-center bg-white bg-opacity-70 text-xs">
              <div className={`font-serif ${stage.current ? stage.textColor : 'text-gray-400'}`}>
                {stage.name}
              </div>
              <div className="text-gray-500">
                {stage.current ? `Stage ${stage.stage}` : 'Locked'}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-sm mt-3 italic text-gray-600 border-t border-gray-200 pt-2">
        <p>{realmData.description}</p>
      </div>
    </div>
  );
}
