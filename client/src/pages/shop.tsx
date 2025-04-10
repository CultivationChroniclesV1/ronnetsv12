import React, { useState } from 'react';
import { useGameEngine } from '@/lib/gameEngine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

// Define weapon and apparel types for shop items
interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  stats: Record<string, number>;
  price: {
    gold: number;
    qiStones: number;
    qi: number;
  };
  requiredLevel: number;
  icon: string;
}

// Generate random weapons
const generateWeapons = (): ShopItem[] => {
  const weaponTypes = ['sword', 'saber', 'spear', 'staff', 'dagger', 'bow', 'fan', 'whip', 'hammer', 'axe'];
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  const weaponPrefixes = ['Dragon', 'Phoenix', 'Thunder', 'Frost', 'Azure', 'Blood', 'Heaven', 'Earth', 'Ancient', 'Divine'];
  const weaponSuffixes = ['Blade', 'Edge', 'Fang', 'Claw', 'Shard', 'Slayer', 'Bane', 'Reaper', 'Vanquisher', 'Harbinger'];
  
  const weapons: ShopItem[] = [];
  
  for (let i = 0; i < 25; i++) {
    const weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
    const rarityIndex = Math.min(Math.floor(Math.random() * 6), 5);
    const rarity = rarities[rarityIndex];
    const prefix = weaponPrefixes[Math.floor(Math.random() * weaponPrefixes.length)];
    const suffix = weaponSuffixes[Math.floor(Math.random() * weaponSuffixes.length)];
    
    // Calculate price and stats based on rarity
    const rarityMultiplier = Math.pow(3, rarityIndex);
    const basePrice = 50 * rarityMultiplier;
    const baseStatValue = 5 * rarityMultiplier;
    
    const stats: Record<string, number> = {};
    stats['attack'] = baseStatValue + Math.floor(Math.random() * 10);
    
    // Add additional stats for higher rarity items
    if (rarityIndex >= 1) {
      stats['critChance'] = 1 + Math.floor(Math.random() * rarityIndex);
    }
    if (rarityIndex >= 2) {
      stats['strength'] = 1 + Math.floor(Math.random() * rarityIndex * 2);
    }
    if (rarityIndex >= 3) {
      stats['agility'] = 1 + Math.floor(Math.random() * rarityIndex * 2);
    }
    if (rarityIndex >= 4) {
      stats['intelligence'] = 1 + Math.floor(Math.random() * rarityIndex * 3);
    }
    
    // Determine if the weapon costs Qi stones based on rarity
    let qiStoneCost = 0;
    let qiCost = 0;
    
    if (rarityIndex >= 3) {
      qiStoneCost = (rarityIndex - 2) * 5;
    }
    if (rarityIndex >= 4) {
      qiCost = (rarityIndex - 3) * 100;
    }
    
    weapons.push({
      id: `weapon-${i}`,
      name: `${prefix} ${weaponType.charAt(0).toUpperCase() + weaponType.slice(1)} ${suffix}`,
      description: `A powerful ${rarity} ${weaponType} forged with mystical techniques.`,
      type: weaponType,
      rarity: rarity,
      stats: stats,
      price: {
        gold: basePrice,
        qiStones: qiStoneCost,
        qi: qiCost
      },
      requiredLevel: Math.max(1, rarityIndex * 5),
      icon: `fa-${
        weaponType === 'sword' ? 'khanda' : 
        weaponType === 'bow' ? 'bow-arrow' : 
        weaponType === 'spear' ? 'bahai' :
        weaponType === 'staff' ? 'wand-magic' :
        weaponType === 'dagger' ? 'dagger' :
        weaponType === 'fan' ? 'fan' :
        weaponType === 'whip' ? 'whip' :
        weaponType === 'hammer' ? 'hammer' :
        weaponType === 'axe' ? 'axe' :
        'khanda' // default fallback
      }`
    });
  }
  
  return weapons;
};

// Generate random apparel
const generateApparel = (): ShopItem[] => {
  const apparelTypes = ['robe', 'armor', 'innerWear', 'outerWear', 'belt', 'boots', 'gloves', 'hat', 'mask', 'accessory'];
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  const apparelPrefixes = ['Celestial', 'Mystic', 'Immortal', 'Ethereal', 'Jade', 'Golden', 'Sacred', 'Profound', 'Spiritual', 'Transcendent'];
  const apparelSuffixes = ['Garment', 'Attire', 'Vestment', 'Raiment', 'Apparel', 'Protection', 'Guard', 'Aegis', 'Mantle', 'Ward'];
  
  const apparel: ShopItem[] = [];
  
  for (let i = 0; i < 50; i++) {
    const apparelType = apparelTypes[Math.floor(Math.random() * apparelTypes.length)];
    const rarityIndex = Math.min(Math.floor(Math.random() * 6), 5);
    const rarity = rarities[rarityIndex];
    const prefix = apparelPrefixes[Math.floor(Math.random() * apparelPrefixes.length)];
    const suffix = apparelSuffixes[Math.floor(Math.random() * apparelSuffixes.length)];
    
    // Calculate price and stats based on rarity
    const rarityMultiplier = Math.pow(2.5, rarityIndex);
    const basePrice = 40 * rarityMultiplier;
    const baseStatValue = 3 * rarityMultiplier;
    
    const stats: Record<string, number> = {};
    stats['defense'] = baseStatValue + Math.floor(Math.random() * 8);
    
    // Add additional stats for higher rarity items
    if (rarityIndex >= 1) {
      stats['dodgeChance'] = 1 + Math.floor(Math.random() * rarityIndex);
    }
    if (rarityIndex >= 2) {
      stats['endurance'] = 1 + Math.floor(Math.random() * rarityIndex * 2);
    }
    if (rarityIndex >= 3) {
      stats['perception'] = 1 + Math.floor(Math.random() * rarityIndex * 2);
    }
    if (rarityIndex >= 4) {
      stats['maxHealth'] = 10 + Math.floor(Math.random() * rarityIndex * 10);
    }
    
    // Determine if the apparel costs Qi stones based on rarity
    let qiStoneCost = 0;
    let qiCost = 0;
    
    if (rarityIndex >= 3) {
      qiStoneCost = (rarityIndex - 2) * 4;
    }
    if (rarityIndex >= 4) {
      qiCost = (rarityIndex - 3) * 80;
    }
    
    apparel.push({
      id: `apparel-${i}`,
      name: `${prefix} ${apparelType.charAt(0).toUpperCase() + apparelType.slice(1)} ${suffix}`,
      description: `A refined ${rarity} ${apparelType} crafted with exceptional skill.`,
      type: apparelType,
      rarity: rarity,
      stats: stats,
      price: {
        gold: basePrice,
        qiStones: qiStoneCost,
        qi: qiCost
      },
      requiredLevel: Math.max(1, rarityIndex * 4),
      icon: `fa-${apparelType === 'robe' ? 'tshirt' : apparelType === 'armor' ? 'shield-alt' : apparelType === 'mask' ? 'mask' : apparelType === 'boots' ? 'boot' : apparelType === 'gloves' ? 'mitten' : apparelType === 'hat' ? 'hat-wizard' : 'ring'}`
    });
  }
  
  return apparel;
};

// Generate additional apparel to reach 100 items
const generateAdditionalApparel = (): ShopItem[] => {
  const apparelTypes = ['robe', 'armor', 'innerWear', 'outerWear', 'belt', 'boots', 'gloves', 'hat', 'mask', 'accessory'];
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  const apparelPrefixes = ['Cloud', 'Moon', 'Star', 'Sun', 'Mountain', 'River', 'Ocean', 'Lightning', 'Fire', 'Wind'];
  const apparelSuffixes = ['Shroud', 'Cover', 'Cloth', 'Wrapping', 'Veil', 'Skin', 'Shell', 'Layer', 'Drape', 'Fabric'];
  
  const apparel: ShopItem[] = [];
  
  for (let i = 0; i < 50; i++) {
    const apparelType = apparelTypes[Math.floor(Math.random() * apparelTypes.length)];
    const rarityIndex = Math.min(Math.floor(Math.random() * 6), 5);
    const rarity = rarities[rarityIndex];
    const prefix = apparelPrefixes[Math.floor(Math.random() * apparelPrefixes.length)];
    const suffix = apparelSuffixes[Math.floor(Math.random() * apparelSuffixes.length)];
    
    // Calculate price and stats based on rarity
    const rarityMultiplier = Math.pow(2.5, rarityIndex);
    const basePrice = 40 * rarityMultiplier;
    const baseStatValue = 3 * rarityMultiplier;
    
    const stats: Record<string, number> = {};
    stats['defense'] = baseStatValue + Math.floor(Math.random() * 8);
    
    // Add additional stats for higher rarity items
    if (rarityIndex >= 1) {
      stats['dodgeChance'] = 1 + Math.floor(Math.random() * rarityIndex);
    }
    if (rarityIndex >= 2) {
      stats['endurance'] = 1 + Math.floor(Math.random() * rarityIndex * 2);
    }
    if (rarityIndex >= 3) {
      stats['perception'] = 1 + Math.floor(Math.random() * rarityIndex * 2);
    }
    if (rarityIndex >= 4) {
      stats['maxHealth'] = 10 + Math.floor(Math.random() * rarityIndex * 10);
    }
    
    // Determine if the apparel costs Qi stones based on rarity
    let qiStoneCost = 0;
    let qiCost = 0;
    
    if (rarityIndex >= 3) {
      qiStoneCost = (rarityIndex - 2) * 4;
    }
    if (rarityIndex >= 4) {
      qiCost = (rarityIndex - 3) * 80;
    }
    
    apparel.push({
      id: `apparel-extra-${i}`,
      name: `${prefix} ${apparelType.charAt(0).toUpperCase() + apparelType.slice(1)} ${suffix}`,
      description: `An elegant ${rarity} ${apparelType} with unique properties.`,
      type: apparelType,
      rarity: rarity,
      stats: stats,
      price: {
        gold: basePrice,
        qiStones: qiStoneCost,
        qi: qiCost
      },
      requiredLevel: Math.max(1, rarityIndex * 4),
      icon: `fa-${apparelType === 'robe' ? 'tshirt' : apparelType === 'armor' ? 'shield-alt' : apparelType === 'mask' ? 'mask' : apparelType === 'boots' ? 'boot' : apparelType === 'gloves' ? 'mitten' : apparelType === 'hat' ? 'hat-wizard' : 'ring'}`
    });
  }
  
  return apparel;
};

export default function Shop() {
  const { game, updateGameState } = useGameEngine();
  const [weapons, setWeapons] = useState<ShopItem[]>(generateWeapons());
  const [apparel, setApparel] = useState<ShopItem[]>([...generateApparel(), ...generateAdditionalApparel()]);
  const [currentTab, setCurrentTab] = useState('weapons');
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-200 text-gray-800';
      case 'uncommon': return 'bg-green-100 text-green-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      case 'mythic': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const canAfford = (item: ShopItem) => {
    return game.gold >= item.price.gold &&
           game.qiStones >= item.price.qiStones &&
           game.energy >= item.price.qi;
  };
  
  const meetsLevelRequirement = (item: ShopItem) => {
    return game.cultivationLevel >= item.requiredLevel;
  };
  
  const purchaseItem = (item: ShopItem) => {
    if (!canAfford(item)) {
      toast({
        title: "Cannot afford item",
        description: "You don't have enough resources to purchase this item.",
        variant: "destructive"
      });
      return;
    }
    
    if (!meetsLevelRequirement(item)) {
      toast({
        title: "Level too low",
        description: `You need to be at least level ${item.requiredLevel} to purchase this item.`,
        variant: "destructive"
      });
      return;
    }
    
    // Update game state to purchase the item
    updateGameState(state => {
      // Deduct costs
      const newState = {
        ...state,
        gold: state.gold - item.price.gold,
        qiStones: state.qiStones - item.price.qiStones,
        energy: state.energy - item.price.qi
      };
      
      // Add item to inventory based on its type
      if (item.id.startsWith('weapon')) {
        newState.inventory.weapons[item.id] = {
          id: item.id,
          name: item.name,
          type: item.type as any,
          rarity: item.rarity as any,
          level: 1,
          stats: item.stats,
          equipped: false,
          icon: item.icon,
          description: item.description,
          price: { gold: item.price.gold, qiStones: item.price.qiStones, qi: item.price.qi },
          requiredLevel: item.requiredLevel
        };
      } else {
        newState.inventory.apparel[item.id] = {
          id: item.id,
          name: item.name,
          type: item.type as any,
          rarity: item.rarity as any,
          level: 1,
          stats: item.stats,
          equipped: false,
          icon: item.icon,
          description: item.description,
          price: { gold: item.price.gold, qiStones: item.price.qiStones, qi: item.price.qi },
          requiredLevel: item.requiredLevel
        };
      }
      
      return newState;
    });
    
    // Remove the item from the shop
    if (item.id.startsWith('weapon')) {
      setWeapons(prevWeapons => prevWeapons.filter(weapon => weapon.id !== item.id));
    } else {
      setApparel(prevApparel => prevApparel.filter(apparelItem => apparelItem.id !== item.id));
    }
    
    toast({
      title: "Item Purchased",
      description: `You have purchased ${item.name}.`,
      variant: "default"
    });
  };
  
  // Helper function to render item stats
  const renderStats = (stats: Record<string, number>) => {
    return Object.entries(stats).map(([stat, value]) => (
      <div key={stat} className="text-sm">
        <span className="font-semibold capitalize">{stat}:</span> +{value}
      </div>
    ));
  };
  
  // Display items for the current tab
  const itemsToDisplay = currentTab === 'weapons' ? weapons : apparel;
  
  if (!game.characterCreated) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Character Required</CardTitle>
            <CardDescription>
              You need to create a character before accessing the shop.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please go to the Character page to create your character first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-serif mb-6 text-center text-primary">
        <i className="fas fa-shopping-cart mr-2"></i> Cultivation Market
      </h1>
      
      <div className="mb-6 p-4 rounded-lg bg-primary/5 flex justify-center items-center">
        <div className="flex space-x-8">
          <div>
            <span className="font-semibold text-primary">Gold:</span> 
            <span className="ml-2 text-amber-600">{game.gold}</span>
          </div>
          <div>
            <span className="font-semibold text-primary">Qi Stones:</span> 
            <span className="ml-2 text-blue-600">{game.qiStones}</span>
          </div>
          <div>
            <span className="font-semibold text-primary">Qi Energy:</span> 
            <span className="ml-2 text-green-600">{Math.floor(game.energy)}</span>
          </div>
        </div>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="weapons">
            <i className="fas fa-khanda mr-2"></i> Weapons
          </TabsTrigger>
          <TabsTrigger value="apparel">
            <i className="fas fa-tshirt mr-2"></i> Apparel
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="weapons" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weapons.map(weapon => (
              <Card key={weapon.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-serif">
                      <i className={`fas fa-khanda mr-2 text-primary`}></i> 
                      {weapon.name}
                    </CardTitle>
                    <Badge className={getRarityColor(weapon.rarity)}>
                      {weapon.rarity.charAt(0).toUpperCase() + weapon.rarity.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription>{weapon.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="bg-primary/5 p-2 rounded">
                      {renderStats(weapon.stats)}
                    </div>
                    
                    <div className="text-sm font-medium space-y-1">
                      <div className="flex justify-between">
                        <span>Required Level:</span>
                        <span className={game.cultivationLevel < weapon.requiredLevel ? 'text-red-500' : ''}>
                          {weapon.requiredLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <div className="space-x-2">
                          {weapon.price.gold > 0 && <span className="text-amber-600">{weapon.price.gold} Gold</span>}
                          {weapon.price.qiStones > 0 && <span className="text-blue-600">{weapon.price.qiStones} Stones</span>}
                          {weapon.price.qi > 0 && <span className="text-green-600">{weapon.price.qi} Qi</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4"
                    onClick={() => purchaseItem(weapon)}
                    disabled={!canAfford(weapon) || !meetsLevelRequirement(weapon)}
                  >
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="apparel" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apparel.map(item => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-serif">
                      <i className={`fas fa-tshirt mr-2 text-primary`}></i> 
                      {item.name}
                    </CardTitle>
                    <Badge className={getRarityColor(item.rarity)}>
                      {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="bg-primary/5 p-2 rounded">
                      {renderStats(item.stats)}
                    </div>
                    
                    <div className="text-sm font-medium space-y-1">
                      <div className="flex justify-between">
                        <span>Required Level:</span>
                        <span className={game.cultivationLevel < item.requiredLevel ? 'text-red-500' : ''}>
                          {item.requiredLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <div className="space-x-2">
                          {item.price.gold > 0 && <span className="text-amber-600">{item.price.gold} Gold</span>}
                          {item.price.qiStones > 0 && <span className="text-blue-600">{item.price.qiStones} Stones</span>}
                          {item.price.qi > 0 && <span className="text-green-600">{item.price.qi} Qi</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4"
                    onClick={() => purchaseItem(item)}
                    disabled={!canAfford(item) || !meetsLevelRequirement(item)}
                  >
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}