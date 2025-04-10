import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Game from "@/pages/game";
import { useEffect } from "react";
import { NavigationBar } from "@/components/navigation-bar";

// Lazy load other pages
import { lazy, Suspense } from "react";
// Use relative paths for lazy loading to avoid import issues
const Character = lazy(() => import("./pages/character"));
const CharacterInfo = lazy(() => import("./pages/character-info"));
const Combat = lazy(() => import("./pages/combat"));
const Map = lazy(() => import("./pages/map"));
const Inventory = lazy(() => import("./pages/inventory"));
const Shop = lazy(() => import("./pages/shop"));
const SectQuests = lazy(() => import("./pages/sect-quests"));
const SkillTree = lazy(() => import("./pages/skill-tree"));

// Loading component for lazy-loaded pages
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-primary mb-4" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-gray-600">Loading page...</p>
    </div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/game" component={Game} />
        <Route path="/character" component={Character} />
        <Route path="/character-info" component={CharacterInfo} />
        <Route path="/combat" component={Combat} />
        <Route path="/map" component={Map} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/shop" component={Shop} />
        <Route path="/sect-quests" component={SectQuests} />
        <Route path="/skill-tree" component={SkillTree} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
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
    title.textContent = 'Immortal Cultivation Path';
    document.head.appendChild(title);
    
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(fontAwesome);
      document.head.removeChild(title);
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <NavigationBar />
        <main className="flex-grow">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
