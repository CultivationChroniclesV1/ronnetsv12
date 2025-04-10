import { useGameEngine } from "@/lib/gameEngine";
import { ACHIEVEMENTS } from "@/lib/constants";
import { formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function AchievementsPage() {
  const { game } = useGameEngine();
  
  // Build achievements list with earned status
  const achievementsList = Object.entries(ACHIEVEMENTS).map(([id, achievement]) => {
    const earned = game.achievements[id]?.earned || false;
    return {
      id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      earned,
      timestamp: game.achievements[id]?.timestamp || null
    };
  });
  
  // Count earned achievements
  const earnedCount = achievementsList.filter(a => a.earned).length;
  const totalCount = achievementsList.length;
  const completionPercentage = Math.round((earnedCount / totalCount) * 100);
  
  return (
    <div className="container max-w-4xl mx-auto p-4 pt-20 pb-20">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-gray-600">Track your cultivation milestones</p>
      </div>
      
      <Card className="mb-6 animate-slide-in-top">
        <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-amber-100">
          <CardTitle className="text-lg flex items-center">
            <span className="inline-block w-5 h-5 mr-2 rounded-full bg-amber-500 animate-pulse-slow"></span>
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-700">{earnedCount} / {totalCount}</span>
          </div>
          <Progress 
            value={completionPercentage} 
            className="h-2 [&>div]:bg-amber-500"
          />
          <div className="mt-4 flex justify-between">
            <Badge className="bg-amber-500 hover:bg-amber-600">{completionPercentage}% Complete</Badge>
            <Badge className="bg-primary hover:bg-primary/90">Total Time: {formatTime(game.timeCultivating)}</Badge>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Standard Achievements Section */}
        <div className="animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="inline-block w-4 h-4 mr-2 rounded-full bg-blue-500 animate-pulse-slow"></span>
            Cultivation Path
          </h2>
          {achievementsList
            .filter(a => !a.id.startsWith("hidden"))
            .slice(0, Math.ceil(achievementsList.length / 2))
            .map((achievement, index) => (
              <Card 
                key={achievement.id} 
                className={`mb-3 transition-all hover:shadow-md ${achievement.earned ? 'border-amber-300' : 'opacity-80'}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <CardContent className="p-4 flex items-center">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full 
                    ${achievement.earned ? 'bg-amber-500' : 'bg-gray-300'} 
                    flex items-center justify-center mr-4 text-white 
                    ${achievement.earned ? 'animate-ping-slow' : ''}`}
                  >
                    <i className={`fas fa-${achievement.icon} ${achievement.earned ? 'text-xl' : 'text-lg opacity-70'}`}></i>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold flex items-center">
                      {achievement.name}
                      {achievement.earned && (
                        <span className="ml-2 text-green-600">
                          <i className="fas fa-check-circle"></i>
                        </span>
                      )}
                    </h5>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    {achievement.earned && achievement.timestamp && (
                      <p className="text-xs text-amber-600 mt-1">
                        Unlocked: {new Date(achievement.timestamp).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
        
        {/* Advanced Achievements Section */}
        <div className="animate-slide-in-right" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="inline-block w-4 h-4 mr-2 rounded-full bg-purple-500 animate-pulse-slow"></span>
            Mystical Attainments
          </h2>
          {achievementsList
            .filter(a => !a.id.startsWith("hidden"))
            .slice(Math.ceil(achievementsList.length / 2))
            .map((achievement, index) => (
              <Card 
                key={achievement.id} 
                className={`mb-3 transition-all hover:shadow-md ${achievement.earned ? 'border-amber-300' : 'opacity-80'}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <CardContent className="p-4 flex items-center">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full 
                    ${achievement.earned ? 'bg-amber-500' : 'bg-gray-300'} 
                    flex items-center justify-center mr-4 text-white
                    ${achievement.earned ? 'animate-ping-slow' : ''}`}
                  >
                    <i className={`fas fa-${achievement.icon} ${achievement.earned ? 'text-xl' : 'text-lg opacity-70'}`}></i>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold flex items-center">
                      {achievement.name}
                      {achievement.earned && (
                        <span className="ml-2 text-green-600">
                          <i className="fas fa-check-circle"></i>
                        </span>
                      )}
                    </h5>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    {achievement.earned && achievement.timestamp && (
                      <p className="text-xs text-amber-600 mt-1">
                        Unlocked: {new Date(achievement.timestamp).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}