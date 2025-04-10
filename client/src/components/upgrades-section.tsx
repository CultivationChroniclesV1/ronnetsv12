import { useGameEngine } from '@/lib/gameEngine';
import { UPGRADES } from '@/lib/constants';
import { isUpgradeAvailable, getUpgradeCost } from '@/lib/gameState';
import { formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function UpgradesSection() {
  const { game, buyUpgrade } = useGameEngine();
  
  const upgradesList = Object.entries(UPGRADES).map(([id, upgrade]) => {
    const currentLevel = game.upgrades[id]?.level || 0;
    const cost = game.upgrades[id]?.cost || upgrade.baseCost;
    const available = isUpgradeAvailable(game, id);
    const canAfford = game.energy >= cost;
    
    const currentEffect = upgrade.effectDescription(currentLevel);
    const nextEffect = upgrade.effectDescription(currentLevel + 1);
    
    const realmRequirement = upgrade.requiredRealm 
      ? UPGRADES[id].requiredRealm?.charAt(0).toUpperCase() + UPGRADES[id].requiredRealm?.slice(1)
      : null;
    
    return {
      id,
      name: upgrade.name,
      description: upgrade.description,
      currentLevel,
      cost,
      available,
      canAfford,
      currentEffect,
      nextEffect,
      realmRequirement
    };
  });
  
  return (
    <div className="bg-scroll rounded-lg p-4 mb-6 shadow-md">
      <h2 className="font-serif text-xl mb-4 text-primary flex items-center">
        <i className="fas fa-arrow-up text-sm mr-2"></i> Cultivation Upgrades
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {upgradesList.map(upgrade => (
          <div key={upgrade.id} className="border border-gray-200 rounded-md p-3 bg-white bg-opacity-80 hover:bg-opacity-100 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{upgrade.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{upgrade.description}</p>
              </div>
              <Button
                onClick={() => buyUpgrade(upgrade.id)}
                disabled={!upgrade.available || !upgrade.canAfford}
                className={`text-xs rounded-md px-3 py-1 flex items-center h-auto ${
                  !upgrade.available || !upgrade.canAfford
                    ? 'bg-gray-300 text-gray-500'
                    : 'bg-primary text-white'
                }`}
                variant={upgrade.available && upgrade.canAfford ? "default" : "secondary"}
                size="sm"
              >
                <i className="fas fa-fire-alt mr-1"></i> {formatNumber(upgrade.cost)}
              </Button>
            </div>
            <div className="mt-2 text-xs">
              <div className="flex justify-between">
                <span>Current level:</span>
                <span>{upgrade.currentLevel}</span>
              </div>
              <div className={`flex justify-between ${upgrade.currentLevel > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                <span>Current effect:</span>
                <span>{upgrade.currentLevel > 0 ? upgrade.currentEffect : 'None'}</span>
              </div>
              <div className={`flex justify-between ${upgrade.available ? 'text-amber-500' : 'text-gray-400'}`}>
                <span>Next level:</span>
                <span>{upgrade.available ? upgrade.nextEffect : 'Max level reached'}</span>
              </div>
              {upgrade.realmRequirement && !upgrade.available && (
                <div className="text-xs text-red-500 mt-1">
                  Requires: {upgrade.realmRequirement} Realm
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
