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
  const [location] = useLocation();
  // Use a delayed page loading for a smoother experience
  const [showLoading, setShowLoading] = useState(true);
  // Track location changes to force loading screens between page transitions
  const [prevLocation, setPrevLocation] = useState(location);
  
  // Show loading screen when location changes, then hide after delay
  useEffect(() => {
    if (location !== prevLocation) {
      setShowLoading(true);
      setPrevLocation(location);
    }
    
    // Simulate a minimum load time of 1 second for a more satisfying loading experience
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [location, prevLocation]);
  
  return (
    <Suspense fallback={<PageLoading />}>
      {showLoading ? (
        <PageLoading />
      ) : (
        <Switch>
          <Route path="/">
            <Home />
          </Route>
          <Route path="/game">
            <Game />
          </Route>
          <Route path="/character-info">
            <CharacterInfo />
          </Route>
          <Route path="/combat">
            <Combat />
          </Route>
          <Route path="/map">
            <Map />
          </Route>
          <Route path="/inventory">
            <Inventory />
          </Route>
          <Route path="/shop">
            <Shop />
          </Route>
          <Route path="/sect-quests">
            <SectQuests />
          </Route>
          <Route path="/skill-tree">
            <SkillTree />
          </Route>
          <Route path="/music-settings">
            <MusicSettings />
          </Route>
          {/* Fallback to 404 */}
          <Route>
            <NotFound />
          </Route>
        </Switch>
      )}
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
  
  // Restore theme-related code now that router is fixed
  const theme = getThemeForPath(location);
  const bgClasses = getBackgroundClasses(theme);
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className={`flex flex-col min-h-screen ${bgClasses}`}>
        <NavigationBar />
        <main className="flex-grow relative">
          <BackgroundParticles />
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
