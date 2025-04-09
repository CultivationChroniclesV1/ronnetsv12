import { useGameEngine } from '@/lib/gameEngine';
import { SKILLS } from '@/lib/constants';
import { isSkillAvailable, getSkillCost } from '@/lib/gameState';
import { formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function SkillsSection() {
  const { game, upgradeSkill } = useGameEngine();
  
  const skillsList = Object.entries(SKILLS).map(([id, skill]) => {
    const currentLevel = game.skills[id]?.level || 0;
    const maxLevel = skill.maxLevel;
    const unlocked = game.skills[id]?.unlocked || false;
    const available = isSkillAvailable(game, id);
    const cost = game.skills[id]?.cost || skill.baseCost;
    const canAfford = game.energy >= cost;
    
    // Progress percentage
    const progressPercentage = (currentLevel / maxLevel) * 100;
    
    // Effect description based on skill type
    let effectDescription = '';
    if (currentLevel > 0) {
      if (id === 'basic-qi' || id === 'fireheart') {
        effectDescription = `+${game.skills[id].effect.toFixed(1)} Qi/second`;
      } else if (id === 'mystic-ice') {
        effectDescription = `+${(game.skills[id].effect * 100).toFixed(0)}% breakthrough chance`;
      }
    } else {
      effectDescription = 'None (Locked)';
    }
    
    const requirementText = (() => {
      if (unlocked) return '';
      
      if (skill.requiredRealm && skill.requiredRealm !== game.realm) {
        return `Requires ${skill.requiredRealm.charAt(0).toUpperCase() + skill.requiredRealm.slice(1)} Realm`;
      } else if (skill.requiredStage && game.realmStage < skill.requiredStage) {
        return `Requires ${game.realm.charAt(0).toUpperCase() + game.realm.slice(1)} (Stage ${skill.requiredStage})`;
      }
      
      return '';
    })();
    
    return {
      id,
      name: skill.name,
      chineseName: skill.chineseName,
      description: skill.description,
      currentLevel,
      maxLevel,
      unlocked,
      available,
      canAfford,
      cost,
      effectDescription,
      progressPercentage,
      requirementText
    };
  });
  
  return (
    <div className="bg-scroll rounded-lg p-4 mb-6 shadow-md">
      <h2 className="font-serif text-xl mb-4 text-primary flex items-center">
        <i className="fas fa-book text-sm mr-2"></i> Cultivation Techniques
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {skillsList.map(skill => (
          <div 
            key={skill.id} 
            className={`skill-card border ${
              skill.unlocked ? 'border-blue-500' : 'border-gray-300'
            } rounded-md bg-white bg-opacity-70 overflow-hidden hover:-translate-y-1 transition-all duration-200`}
          >
            <div className={`${
              skill.unlocked ? 'bg-blue-500 bg-opacity-10 border-b border-blue-500' : 'bg-gray-200 border-b border-gray-300'
            } p-3`}>
              <h4 className={`font-['Ma_Shan_Zheng'] ${
                skill.unlocked ? 'text-blue-500' : 'text-gray-500'
              } text-lg text-center`}>
                {skill.chineseName}
              </h4>
              <h5 className="font-serif text-center text-sm">{skill.name}</h5>
            </div>
            
            <div className="p-3">
              <p className="text-xs text-gray-600 mb-3">{skill.description}</p>
              
              <div className="text-xs mb-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Level:</span>
                  <span>{skill.currentLevel}/{skill.maxLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Effect:</span>
                  <span>{skill.effectDescription}</span>
                </div>
                <Progress value={skill.progressPercentage} className="h-1 mt-1" />
              </div>
              
              <Button
                onClick={() => upgradeSkill(skill.id)}
                disabled={!skill.unlocked || !skill.available || !skill.canAfford}
                className={`w-full py-1 ${
                  skill.unlocked && skill.available && skill.canAfford
                    ? 'bg-primary text-white'
                    : 'bg-gray-300 text-gray-500'
                } text-xs rounded-md h-auto`}
                variant={skill.unlocked && skill.available && skill.canAfford ? "default" : "secondary"}
                size="sm"
              >
                {skill.unlocked
                  ? <><i className="fas fa-arrow-up mr-1"></i> Improve ({formatNumber(skill.cost)} Qi)</>
                  : <><i className="fas fa-lock mr-1"></i> {skill.requirementText}</>
                }
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
