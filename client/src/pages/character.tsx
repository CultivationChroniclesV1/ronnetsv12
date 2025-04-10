import { useState, useEffect } from "react";
import { useGameEngine } from "@/lib/gameEngine";
import { SECTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";

export default function Character() {
  const { game, updateGameState } = useGameEngine();
  const [, setLocation] = useLocation();
  const [characterName, setCharacterName] = useState("");
  const [selectedSect, setSelectedSect] = useState<string | null>(null);

  // If character already created, redirect to game
  useEffect(() => {
    if (game.characterCreated) {
      setLocation("/game");
    }
  }, [game.characterCreated, setLocation]);

  const handleCreateCharacter = () => {
    if (!characterName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your character.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedSect) {
      toast({
        title: "Sect Selection Required",
        description: "Please select a sect to join.",
        variant: "destructive"
      });
      return;
    }

    // Update game state with character info and apply sect effects
    updateGameState((state) => {
      // Get the sect data and apply their passive effects
      const sectData = SECTS[selectedSect as keyof typeof SECTS];
      const withSectEffects = sectData.benefits?.effect ? sectData.benefits.effect(state) : state;
      
      return {
        ...withSectEffects,
        characterCreated: true,
        characterName,
        sect: selectedSect,
      };
    });

    toast({
      title: "Character Created",
      description: `Welcome, ${characterName} of the ${SECTS[selectedSect as keyof typeof SECTS].name} Sect!`,
    });

    // Redirect to game
    setLocation("/game");
  };

  return (
    <div className="min-h-screen bg-scroll py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-serif text-primary mb-2">Character Creation</h1>
          <p className="text-gray-700">Begin your journey to immortality</p>
        </div>

        <Card className="bg-white bg-opacity-90 shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Your Identity</CardTitle>
            <CardDescription>
              Choose your name and sect carefully. They will define your path.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label htmlFor="name">Your Daoist Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                className="mt-1"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-2 block">Select Your Sect</Label>
              <RadioGroup value={selectedSect || ""} onValueChange={setSelectedSect}>
                {Object.entries(SECTS).map(([id, sect]) => {
                  
                  return (
                    <Card key={id} className={`mb-3 cursor-pointer transition-all ${selectedSect === id ? "ring-2 ring-primary" : ""}`}>
                      <div className="p-4" onClick={() => setSelectedSect(id)}>
                        <RadioGroupItem value={id} id={`sect-${id}`} className="peer sr-only" />
                        <div className="flex justify-between items-start">
                          <div>
                            <Label htmlFor={`sect-${id}`} className="text-lg font-medium text-primary">
                              {sect.name}
                            </Label>
                            <p className="text-sm text-gray-600">{sect.description}</p>
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${sect.color}`}>
                            <i className={`fas fa-${sect.icon} text-white`}></i>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="text-sm">
                            <div className="font-medium text-primary mb-1">Sect Benefit:</div>
                            <div className="flex items-center bg-gray-50 p-2 rounded-md">
                              <i className="fas fa-star-of-life text-amber-500 mr-2"></i>
                              <span>{sect.benefits?.description || "No special benefits"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            size="lg"
            className="font-serif bg-primary hover:bg-primary/90 text-white px-6 py-4 h-auto max-w-md"
            onClick={handleCreateCharacter}
          >
            <span className="text-lg">Begin Journey</span>
          </Button>
        </div>
      </div>
    </div>
  );
}