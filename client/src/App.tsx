import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Game from "@/pages/game";
import React, { useEffect, useState } from "react";
import { NavigationBar } from "@/components/navigation-bar";
import { AudioProvider } from "@/components/audio-provider";
import { MusicAutoStarter } from "@/components/music-auto-starter";

import { MoodProvider } from "@/components/mood-provider";
import { MoodBackground } from "@/components/mood-background";
import { MoodController } from "@/components/mood-controller";
import { AmbientBackground } from "@/components/ambient-background";
import { BreakthroughEffect } from "@/components/breakthrough-effect";

// Lazy load other pages
import { lazy, Suspense } from "react";
// Use relative paths for lazy loading to avoid import issues
const Character = lazy(() => import("./pages/character"));
const Combat = lazy(() => import("./pages/combat"));
const Map = lazy(() => import("./pages/map"));
const Inventory = lazy(() => import("./pages/inventory"));
const Shop = lazy(() => import("./pages/shop"));
const SectQuests = lazy(() => import("./pages/sect-quests"));
const MartialTechniques = lazy(() => import("./pages/martial-techniques"));
const Achievements = lazy(() => import("./pages/achievements"));
const Settings = lazy(() => import("./pages/settings"));
const AudioSettings = lazy(() => import("./pages/audio-settings"));

// Import our zen-inspired loading animation
import { LoadingAnimation } from "@/components/loading-animation";

// Loading component for lazy-loaded pages
const PageLoading = () => {
  // Show different loading animations based on routes
  const [location] = useLocation();
  
  let variant: 'default' | 'breakthrough' | 'cultivation' | 'combat' | 'meditation' = 'default';
  
  if (location.includes('combat')) {
    variant = 'combat';
  } else if (location.includes('game')) {
    variant = 'cultivation';
  } else if (location.includes('techniques')) {
    variant = 'meditation';
  }
  
  return (
    <LoadingAnimation 
      variant={variant}
      message="Gathering Spiritual Energy"
      subMessage="Please wait as we cultivate the next page..."
    />
  );
};

function Router() {
  // Use regular useState since we already imported React
  const [isLoading, setIsLoading] = useState(false);
  const [location] = useLocation();
  const [prevLocation, setPrevLocation] = useState(location);
  
  // Handle loading state for page transitions
  useEffect(() => {
    if (location !== prevLocation) {
      setIsLoading(true);
      // Always show loading for at least 1 second
      const timer = setTimeout(() => {
        setIsLoading(false);
        setPrevLocation(location);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [location, prevLocation]);
  
  // If loading, show the loading animation
  if (isLoading) {
    return <PageLoading />;
  }
  
  return (
    <Suspense fallback={<PageLoading />}>
      <div className="page-transition-enter-active">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/game" component={Game} />
          <Route path="/character" component={Character} />
          <Route path="/combat" component={Combat} />
          <Route path="/map" component={Map} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/shop" component={Shop} />
          <Route path="/sect-quests" component={SectQuests} />
          <Route path="/martial-techniques" component={MartialTechniques} />
          <Route path="/achievements" component={Achievements} />
          <Route path="/settings" component={Settings} />
          <Route path="/audio-settings" component={AudioSettings} />
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </div>
    </Suspense>
  );
}

function App() {
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
    title.textContent = 'Cultivation Chronicles';
    document.head.appendChild(title);
    
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(fontAwesome);
      document.head.removeChild(title);
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AudioProvider>
        <MoodProvider>
          <div className="flex flex-col min-h-screen">
            <NavigationBar />
            <main className="flex-grow">
              <Router />
            </main>
          </div>
          <MusicAutoStarter />
          <MoodBackground />
          <MoodController />
          <AmbientBackground />
          <BreakthroughEffect />
          <Toaster />
        </MoodProvider>
      </AudioProvider>
    </QueryClientProvider>
  );
}

export default App;
