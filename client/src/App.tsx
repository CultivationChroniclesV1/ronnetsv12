import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Game from "@/pages/game";
import { useEffect, useState } from "react";
import { NavigationBar } from "@/components/navigation-bar";
import { BackgroundParticles } from "@/components/background-particles";
import { LoadingAnimation } from "@/components/loading-animation";
import { useLocation } from "wouter";
import { getThemeForPath, getBackgroundClasses } from "@/lib/animations";
import { useAchievement } from "@/hooks/use-achievement";

// Lazy load other pages
import { lazy, Suspense } from "react";
// Use relative paths for lazy loading to avoid import issues
const CharacterInfo = lazy(() => import("./pages/character-info"));
const Combat = lazy(() => import("./pages/combat"));
const Map = lazy(() => import("./pages/map"));
const Inventory = lazy(() => import("./pages/inventory"));
const Shop = lazy(() => import("./pages/shop"));
const SectQuests = lazy(() => import("./pages/sect-quests"));
const SkillTree = lazy(() => import("./pages/skill-tree"));
const MusicSettings = lazy(() => import("./pages/music-settings"));

// Loading component for lazy-loaded pages with wuxia theme
const PageLoading = () => {
  const [location] = useLocation();
  const theme = getThemeForPath(location);
  
  // Select the right loading animation based on the page
  const getLoadingType = () => {
    if (theme === 'combat') return 'sword';
    if (theme === 'cultivation') return 'qi';
    if (theme === 'skills') return 'scroll';
    return 'lotus';
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingAnimation 
          type={getLoadingType()} 
          size="lg" 
          text="Gathering Qi Energy..." 
        />
      </div>
    </div>
  );
};

function Router() {
  // Simplify router to help debug 404 issues
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/game" component={Game} />
        <Route path="/character-info" component={CharacterInfo} />
        <Route path="/combat" component={Combat} />
        <Route path="/map" component={Map} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/shop" component={Shop} />
        <Route path="/sect-quests" component={SectQuests} />
        <Route path="/skill-tree" component={SkillTree} />
        <Route path="/music-settings" component={MusicSettings} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  // Comment out achievement hook until fully implemented
  // const { AchievementDisplay } = useAchievement();
  const [location] = useLocation();
  
  // Add custom font link
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Ma+Shan+Zheng&family=Noto+Sans:wght@400;600;700&display=swap';
    document.head.appendChild(link);
    
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css';
    document.head.appendChild(fontAwesome);
    
    const title = document.createElement('title');
    title.textContent = 'Immortal Cultivation Path';
    document.head.appendChild(title);
    
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(fontAwesome);
      document.head.removeChild(title);
    };
  }, []);
  
  // Temporarily comment out theme-related code for debugging
  // const theme = getThemeForPath(location);
  // const bgClasses = getBackgroundClasses(theme);
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 to-indigo-700">
        <NavigationBar />
        <main className="flex-grow relative">
          <Router />
        </main>
        {/* Display achievements when triggered */}
        {/* AchievementDisplay will be enabled once fully implemented */}
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
