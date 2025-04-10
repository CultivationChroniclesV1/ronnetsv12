/**
 * Mood Manager for Cultivation Chronicles
 * 
 * This system manages mood-based background color transitions throughout the game
 * Colors shift based on location, cultivation realm, and gameplay context
 */

// Define mood colors for different pages/routes
export const PAGE_MOODS: Record<string, {
  primary: string[],
  secondary: string[],
  transitionSpeed: number // in seconds
}> = {
  // Home page - serene blue/purple tones
  '/': {
    primary: ['#e0f2ff', '#f0e7ff', '#e5f0ff', '#eee7ff'],
    secondary: ['#d4e6ff', '#e0d4ff', '#d6e8ff', '#e4d8ff'],
    transitionSpeed: 8
  },
  
  // Game/Cultivation page - energy-focused green/blue gradients
  '/game': {
    primary: ['#e0fff2', '#e7fff0', '#e0f7ff', '#e5ffea'],
    secondary: ['#cdfee6', '#d4ffe0', '#c8f0ff', '#d1ffda'],
    transitionSpeed: 6
  },
  
  // Combat page - intense red/orange tones
  '/combat': {
    primary: ['#fff0e0', '#ffede7', '#ffe8e0', '#ffece5'],
    secondary: ['#ffe2c8', '#ffd9cc', '#ffdbba', '#ffd6c2'],
    transitionSpeed: 4
  },
  
  // Map page - exploration yellows and earthy tones
  '/map': {
    primary: ['#fffbe0', '#fff5e7', '#fffae0', '#fff8e5'],
    secondary: ['#ffecbf', '#ffeccc', '#fff5c8', '#fff2d1'],
    transitionSpeed: 7
  },
  
  // Inventory - organized purples
  '/inventory': {
    primary: ['#f5e0ff', '#efe7ff', '#f2e0ff', '#eee5ff'],
    secondary: ['#eed4ff', '#e6d4ff', '#e8c8ff', '#e5d1ff'],
    transitionSpeed: 8
  },
  
  // Shop - merchant golds
  '/shop': {
    primary: ['#fffce0', '#fffae7', '#fff8e0', '#fffbe5'],
    secondary: ['#ffefbf', '#ffefcc', '#fff5c8', '#fff2d1'],
    transitionSpeed: 8
  },
  
  // Sect quests - mission deep blues
  '/sect-quests': {
    primary: ['#e0f0ff', '#e7f5ff', '#e0f8ff', '#e5f7ff'],
    secondary: ['#c8e6ff', '#d4eaff', '#c2e8ff', '#cfe6ff'],
    transitionSpeed: 8
  },
  
  // Martial techniques - ceremonial reds
  '/martial-techniques': {
    primary: ['#ffe0e0', '#ffe7e7', '#ffe0e5', '#ffe5e2'],
    secondary: ['#ffc8c8', '#ffd4d4', '#ffc8ce', '#ffd1ca'],
    transitionSpeed: 7
  },
  
  // Achievements - celebratory golden yellows
  '/achievements': {
    primary: ['#fffae0', '#fff7e7', '#fffbe0', '#fffce5'],
    secondary: ['#fff0c8', '#ffead4', '#fff5c2', '#fff7d1'],
    transitionSpeed: 8
  },
  
  // Settings - neutral grays
  '/settings': {
    primary: ['#f0f0f0', '#f5f5f5', '#f2f2f2', '#f7f7f7'],
    secondary: ['#e5e5e5', '#ececec', '#e8e8e8', '#efefef'],
    transitionSpeed: 10
  },
  
  // Character page - personal identity purples
  '/character': {
    primary: ['#f0e0ff', '#ede7ff', '#e8e0ff', '#ece5ff'],
    secondary: ['#e2c8ff', '#d9ccff', '#dbbaff', '#d6c2ff'],
    transitionSpeed: 8
  }
};

// Realm-based color adjustments to blend with page moods
export const REALM_MOOD_ADJUSTMENTS: Record<string, {
  hue: number,        // -30 to 30 (shift colors toward realm theme)
  saturation: number, // 0.8 to 1.2 (enhance or reduce color intensity)
  lightness: number   // 0.9 to 1.1 (make lighter or darker)
}> = {
  'Qi Condensation': {
    hue: 0,         // neutral
    saturation: 1,  // normal
    lightness: 1    // normal
  },
  'Foundation Establishment': {
    hue: 5,          // slight shift toward warm
    saturation: 1.05, // slightly more vibrant
    lightness: 1      // normal
  },
  'Core Formation': {
    hue: 10,         // warm shift
    saturation: 1.1,  // more vibrant
    lightness: 0.98   // slightly darker
  },
  'Nascent Soul': {
    hue: 15,         // warmer shift
    saturation: 1.15, // more vibrant
    lightness: 0.96   // darker
  },
  'Spirit Severing': {
    hue: -5,         // slight shift toward cool
    saturation: 1.2,  // more vibrant
    lightness: 0.95   // darker
  },
  'Dao Seeking': {
    hue: -10,        // cool shift
    saturation: 1.25, // more vibrant
    lightness: 0.93   // darker
  },
  'Immortal Ascension': {
    hue: 20,         // special warm glow
    saturation: 1.3,  // very vibrant
    lightness: 1.05   // slightly lighter (luminous)
  }
};

// Gameplay context adjustments (e.g., when cultivating, in battle, etc.)
export const CONTEXT_MOOD_ADJUSTMENTS: Record<string, {
  overlay: string,      // color overlay to blend
  intensity: number,    // 0 to 1 (how strong the effect is)
  pulseRate?: number    // seconds per pulse (undulate the effect)
}> = {
  'idle': {
    overlay: 'transparent',
    intensity: 0
  },
  'cultivating': {
    overlay: 'rgba(120, 255, 180, 0.1)',
    intensity: 0.2,
    pulseRate: 2
  },
  'breakthrough': {
    overlay: 'rgba(255, 215, 0, 0.15)',
    intensity: 0.4,
    pulseRate: 1.5
  },
  'combat': {
    overlay: 'rgba(255, 100, 100, 0.1)',
    intensity: 0.3,
    pulseRate: 1
  },
  'low-health': {
    overlay: 'rgba(255, 0, 0, 0.1)',
    intensity: 0.4,
    pulseRate: 0.8
  },
  'victory': {
    overlay: 'rgba(200, 255, 200, 0.2)',
    intensity: 0.3,
    pulseRate: 3
  },
  'meditation': {
    overlay: 'rgba(180, 220, 255, 0.15)',
    intensity: 0.25,
    pulseRate: 4
  }
};

// Helper to convert HSL adjustments to a color
export function adjustColor(color: string, hue: number, saturation: number, lightness: number): string {
  // Convert hex to HSL
  let r = 0, g = 0, b = 0;
  
  if (color.startsWith('#')) {
    // Convert hex to rgb
    const hex = color.substring(1);
    const bigint = parseInt(hex, 16);
    r = (bigint >> 16) & 255;
    g = (bigint >> 8) & 255;
    b = bigint & 255;
  } else if (color.startsWith('rgb')) {
    // Parse rgb(a) format
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    }
  }
  
  // Convert RGB to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  // Apply adjustments
  h = (h * 360 + hue) % 360;
  if (h < 0) h += 360;
  h /= 360;
  
  s *= saturation;
  if (s > 1) s = 1;
  
  l *= lightness;
  if (l > 1) l = 1;
  
  // Convert back to RGB
  let r1 = 0, g1 = 0, b1 = 0;
  
  if (s === 0) {
    r1 = g1 = b1 = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r1 = hueToRgb(p, q, h + 1/3);
    g1 = hueToRgb(p, q, h);
    b1 = hueToRgb(p, q, h - 1/3);
  }
  
  // Convert back to hex
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

export function getRandomColorFromPalette(palette: string[]): string {
  return palette[Math.floor(Math.random() * palette.length)];
}

class MoodManager {
  private currentPage: string = '/';
  private currentRealm: string = 'Qi Condensation';
  private currentContext: string = 'idle';
  private currentColors: {
    primary: string,
    secondary: string,
    transitionSpeed: number
  } = {
    primary: '#f0f0f0', 
    secondary: '#e5e5e5',
    transitionSpeed: 8
  };
  
  constructor() {
    this.updateColors();
  }
  
  public setPage(page: string): void {
    if (PAGE_MOODS[page]) {
      this.currentPage = page;
      this.updateColors();
    }
  }
  
  public setRealm(realm: string): void {
    if (REALM_MOOD_ADJUSTMENTS[realm]) {
      this.currentRealm = realm;
      this.updateColors();
    }
  }
  
  public setContext(context: string): void {
    if (CONTEXT_MOOD_ADJUSTMENTS[context]) {
      this.currentContext = context;
      this.updateColors();
    }
  }
  
  private updateColors(): void {
    const pageMood = PAGE_MOODS[this.currentPage];
    const realmAdjustment = REALM_MOOD_ADJUSTMENTS[this.currentRealm];
    
    if (!pageMood || !realmAdjustment) return;
    
    // Get base colors
    const primaryBase = getRandomColorFromPalette(pageMood.primary);
    const secondaryBase = getRandomColorFromPalette(pageMood.secondary);
    
    // Apply realm adjustments
    const primary = adjustColor(
      primaryBase, 
      realmAdjustment.hue, 
      realmAdjustment.saturation, 
      realmAdjustment.lightness
    );
    
    const secondary = adjustColor(
      secondaryBase, 
      realmAdjustment.hue, 
      realmAdjustment.saturation, 
      realmAdjustment.lightness
    );
    
    this.currentColors = {
      primary,
      secondary,
      transitionSpeed: pageMood.transitionSpeed
    };
    
    this.applyColors();
  }
  
  private applyColors(): void {
    if (typeof document === 'undefined') return;
    
    const contextStyle = CONTEXT_MOOD_ADJUSTMENTS[this.currentContext];
    const root = document.documentElement;
    
    // Apply base colors
    root.style.setProperty('--mood-primary', this.currentColors.primary);
    root.style.setProperty('--mood-secondary', this.currentColors.secondary);
    root.style.setProperty('--mood-transition-speed', `${this.currentColors.transitionSpeed}s`);
    
    // Apply context overlay if needed
    if (contextStyle.intensity > 0) {
      root.style.setProperty('--mood-overlay', contextStyle.overlay);
      root.style.setProperty('--mood-overlay-intensity', contextStyle.intensity.toString());
      
      if (contextStyle.pulseRate) {
        root.style.setProperty('--mood-pulse-rate', `${contextStyle.pulseRate}s`);
        root.classList.add('mood-pulsing');
      } else {
        root.classList.remove('mood-pulsing');
      }
    } else {
      root.style.setProperty('--mood-overlay', 'transparent');
      root.style.setProperty('--mood-overlay-intensity', '0');
      root.classList.remove('mood-pulsing');
    }
  }
  
  public getCurrentContext(): string {
    return this.currentContext;
  }
  
  public getCurrentPage(): string {
    return this.currentPage;
  }
  
  public getCurrentRealm(): string {
    return this.currentRealm;
  }
}

// Create singleton instance
export const moodManager = typeof window !== 'undefined' ? new MoodManager() : null;

// Export wrapper functions for easier use
export const setPage = (page: string) => moodManager?.setPage(page);
export const setRealm = (realm: string) => moodManager?.setRealm(realm);
export const setContext = (context: string) => moodManager?.setContext(context);