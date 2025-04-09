import { useState, useEffect } from "react";
import { useGameEngine } from "@/lib/gameEngine";
import { SECTS } from "@/lib/constants";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const CharacterCreation = () => {
  const { game, updateGameState } = useGameEngine();
  const [characterName, setCharacterName] = useState<string>("");
  const [selectedSect, setSelectedSect] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Redirect to game if character already created
  useEffect(() => {
    if (game.characterCreated) {
      setLocation("/game");
    }
  }, [game.characterCreated, setLocation]);

  // Create character function
  const handleCreateCharacter = () => {
    if (!characterName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your character.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSect) {
      toast({
        title: "Sect Required",
        description: "Please select a sect to join.",
        variant: "destructive",
      });
      return;
    }

    // Apply sect benefits and create character
    updateGameState((state) => {
      // Get the benefit function for the selected sect
      const sectData = SECTS[selectedSect as keyof typeof SECTS];
      const updatedState = sectData.benefits.effect(state);
      
      // Set character creation data
      updatedState.characterCreated = true;
      updatedState.characterName = characterName;
      updatedState.sect = selectedSect;
      
      // Initialize core objects if they don't exist
      if (!updatedState.martialArts) {
        updatedState.martialArts = {};
      }
      
      if (!updatedState.attributes) {
        updatedState.attributes = {
          strength: 10,
          agility: 10,
          endurance: 10,
          intelligence: 10,
          perception: 10
        };
      }
      
      if (!updatedState.inventory) {
        updatedState.inventory = {
          spiritualStones: 0,
          herbs: {},
          equipment: {}
        };
      }
      
      if (!updatedState.exploration) {
        updatedState.exploration = {
          currentArea: "sect",
          discoveredAreas: { "sect": true },
          completedChallenges: {},
          dailyTasksCompleted: {}
        };
      }
      
      // Initialize or reset HP system
      updatedState.health = 100;
      updatedState.maxHealth = 100;
      updatedState.defense = 5;
      updatedState.attack = 10;
      updatedState.critChance = 5;
      updatedState.dodgeChance = 5;
      
      // Calculate starting HP based on endurance (10 HP per point)
      if (updatedState.attributes.endurance) {
        updatedState.maxHealth = 50 + (updatedState.attributes.endurance * 5);
        updatedState.health = updatedState.maxHealth; // Start with full health
      }
      
      // Calculate starting attack based on strength
      if (updatedState.attributes.strength) {
        updatedState.attack = 5 + (updatedState.attributes.strength * 0.5);
      }
      
      // Calculate defense based on endurance
      if (updatedState.attributes.endurance) {
        updatedState.defense = 2 + (updatedState.attributes.endurance * 0.3);
      }
      
      // Add initial martial arts for the character
      // Every character starts with Basic Palm Strike
      updatedState.martialArts["palm-strike"] = {
        id: "palm-strike",
        name: "Azure Dragon Palm",
        chineseName: "青龙掌",
        description: "A basic yet powerful palm technique that channels Qi to strike opponents.",
        level: 1,
        maxLevel: 10,
        unlocked: true,
        damage: 15,
        cost: 5,
        cooldown: 2,
        type: "attack",
        attributeScaling: "strength"
      };
      
      return updatedState;
    });

    toast({
      title: "Character Created",
      description: `Welcome, ${characterName} of the ${SECTS[selectedSect as keyof typeof SECTS].name}!`,
    });

    // Redirect to game page
    setLocation("/game");
  };

  return (
    <div className="min-h-screen bg-scroll py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif text-center mb-8 text-primary">
          <span className="font-['Ma_Shan_Zheng'] text-amber-500 mr-2">修士</span>
          Character Creation
        </h1>

        <Card className="bg-white bg-opacity-90 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Your Immortal Identity</CardTitle>
            <CardDescription>
              Choose your name and destiny on the path to immortality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Cultivator Name
              </label>
              <Input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Enter your cultivation name"
                className="w-full"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                Choose wisely, for your name will echo throughout the cultivation world.
              </p>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-serif mb-4 text-center">Choose Your Sect</h2>
        <p className="text-center text-gray-700 mb-6">
          Each sect offers unique benefits that will shape your cultivation journey
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(SECTS).map(([sectId, sect]) => (
            <Card 
              key={sectId}
              className={`cursor-pointer transition-all ${
                selectedSect === sectId 
                  ? `ring-2 ring-${sect.color.replace('bg-', '')} shadow-lg` 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedSect(sectId)}
            >
              <CardHeader className={`${sect.color} text-white py-3`}>
                <CardTitle className="flex items-center text-lg">
                  <i className={`fas fa-${sect.icon} mr-2`}></i>
                  {sect.name}
                </CardTitle>
                <CardDescription className="text-white/80">
                  <span className="font-['Ma_Shan_Zheng']">{sect.chineseName}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm mb-3">{sect.description}</p>
                <div className="bg-gray-100 p-2 rounded-md">
                  <p className="text-sm font-medium">Benefit:</p>
                  <p className="text-sm">{sect.benefits.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            className="px-8 py-2 text-lg" 
            onClick={handleCreateCharacter}
          >
            Begin Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;