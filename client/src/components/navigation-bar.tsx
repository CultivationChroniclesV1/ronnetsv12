import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useGameEngine } from '@/lib/gameEngine';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { REALMS, SECTS } from '@/lib/constants';


export function NavigationBar() {
  const [location] = useLocation();
  const { game } = useGameEngine();
  
  return (
    <nav className="bg-primary text-white py-2 px-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <Link href="/">
            <div className="text-xl font-serif flex items-center cursor-pointer">
              <span className="text-amber-200 mr-2">Cultivation</span>
              <span className="hidden sm:inline">Chronicles</span>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">

          
          {/* Navigation Links */}
          <div className="hidden md:flex space-x-4 items-center">
            <Link href="/">
              <div className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${location === '/' ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark/50'}`}>
                Home
              </div>
            </Link>
            <Link href="/game">
              <div className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${location === '/game' ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark/50'}`}>
                Cultivation
              </div>
            </Link>

            {game.characterCreated && (
              <Link href="/character-info">
                <div className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${location === '/character-info' ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark/50'}`}>
                  Character Info
                </div>
              </Link>
            )}
            <Link href="/combat">
              <div className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${location === '/combat' ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark/50'}`}>
                Combat
              </div>
            </Link>
            <Link href="/skill-tree">
              <div className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${location === '/skill-tree' ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark/50'}`}>
                <i className="fas fa-book-open mr-1"></i> Skills
              </div>
            </Link>
            <Link href="/map">
              <div className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${location === '/map' ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark/50'}`}>
                Map
              </div>
            </Link>
            <Link href="/inventory">
              <div className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${location === '/inventory' ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark/50'}`}>
                <i className="fas fa-archive mr-1"></i> Inventory
              </div>
            </Link>
            <Link href="/shop">
              <div className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${location === '/shop' ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark/50'}`}>
                <i className="fas fa-shopping-cart mr-1"></i> Shop
              </div>
            </Link>
            <Link href="/sect-quests">
              <div className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${location === '/sect-quests' ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark/50'}`}>
                <i className="fas fa-tasks mr-1"></i> Quests
              </div>
            </Link>
            <Link href="/music-settings">
              <div className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${location === '/music-settings' ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark/50'}`}>
                <i className="fas fa-music mr-1"></i> Music
              </div>
            </Link>
          </div>
          
          {/* Creator Info Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-primary-dark">
                <i className="fas fa-info-circle mr-1"></i>
                <span className="hidden sm:inline">Creator</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Creator Information</SheetTitle>
                <SheetDescription>
                  About the developer of Immortal Cultivation Path
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <div className="mb-4 text-center">
                  <h3 className="text-xl font-bold mb-1">Ronald Pancho</h3>
                  <p className="text-gray-600">Game Developer & Wuxia Enthusiast</p>
                </div>
                
                <div className="mb-4">
                  <p className="mb-2">
                    Immortal Cultivation Path is a passion project born from my love of wuxia novels,
                    xianxia culture, and incremental games. I hope you enjoy the journey to immortality!
                  </p>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <h4 className="font-semibold">Connect with me:</h4>
                  <a 
                    href="https://www.facebook.com/ronald.c.pancho" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <i className="fab fa-facebook text-xl mr-2"></i>
                    Facebook
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden text-white hover:bg-primary-dark">
                <i className="fas fa-bars"></i>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-6">
                <Link href="/">
                  <div className={`px-2 py-2 rounded-md transition-colors cursor-pointer ${location === '/' ? 'bg-primary/10 text-primary' : ''}`}>
                    <i className="fas fa-home mr-2"></i> Home
                  </div>
                </Link>
                <Link href="/game">
                  <div className={`px-2 py-2 rounded-md transition-colors cursor-pointer ${location === '/game' ? 'bg-primary/10 text-primary' : ''}`}>
                    <i className="fas fa-fire mr-2"></i> Cultivation
                  </div>
                </Link>

                {game.characterCreated && (
                  <Link href="/character-info">
                    <div className={`px-2 py-2 rounded-md transition-colors cursor-pointer ${location === '/character-info' ? 'bg-primary/10 text-primary' : ''}`}>
                      <i className="fas fa-id-card mr-2"></i> Character Info
                    </div>
                  </Link>
                )}
                <Link href="/combat">
                  <div className={`px-2 py-2 rounded-md transition-colors cursor-pointer ${location === '/combat' ? 'bg-primary/10 text-primary' : ''}`}>
                    <i className="fas fa-fist-raised mr-2"></i> Combat
                  </div>
                </Link>
                <Link href="/skill-tree">
                  <div className={`px-2 py-2 rounded-md transition-colors cursor-pointer ${location === '/skill-tree' ? 'bg-primary/10 text-primary' : ''}`}>
                    <i className="fas fa-book-open mr-2"></i> Skills
                  </div>
                </Link>
                <Link href="/map">
                  <div className={`px-2 py-2 rounded-md transition-colors cursor-pointer ${location === '/map' ? 'bg-primary/10 text-primary' : ''}`}>
                    <i className="fas fa-map-marked-alt mr-2"></i> Map
                  </div>
                </Link>
                <Link href="/inventory">
                  <div className={`px-2 py-2 rounded-md transition-colors cursor-pointer ${location === '/inventory' ? 'bg-primary/10 text-primary' : ''}`}>
                    <i className="fas fa-archive mr-2"></i> Inventory
                  </div>
                </Link>
                <Link href="/shop">
                  <div className={`px-2 py-2 rounded-md transition-colors cursor-pointer ${location === '/shop' ? 'bg-primary/10 text-primary' : ''}`}>
                    <i className="fas fa-shopping-cart mr-2"></i> Shop
                  </div>
                </Link>
                <Link href="/sect-quests">
                  <div className={`px-2 py-2 rounded-md transition-colors cursor-pointer ${location === '/sect-quests' ? 'bg-primary/10 text-primary' : ''}`}>
                    <i className="fas fa-tasks mr-2"></i> Quests
                  </div>
                </Link>
                <Link href="/music-settings">
                  <div className={`px-2 py-2 rounded-md transition-colors cursor-pointer ${location === '/music-settings' ? 'bg-primary/10 text-primary' : ''}`}>
                    <i className="fas fa-music mr-2"></i> Music
                  </div>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}