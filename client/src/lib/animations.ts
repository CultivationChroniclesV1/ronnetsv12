// Utility functions for page animations, transitions, and themed colors

// Define theme colors for different pages/vibes
export const pageThemes = {
  home: {
    bgColor: 'from-blue-900 to-indigo-700',
    particleColor: 'rgba(255, 215, 0, 0.3)',
    animationType: 'float',
    transitionType: 'fade-scale',
  },
  cultivation: {
    bgColor: 'from-emerald-900 to-green-700',
    particleColor: 'rgba(0, 255, 145, 0.3)',
    animationType: 'spiral',
    transitionType: 'slide-up',
  },
  combat: {
    bgColor: 'from-red-900 to-rose-700',
    particleColor: 'rgba(255, 50, 50, 0.3)',
    animationType: 'flame',
    transitionType: 'slide-right',
  },
  quest: {
    bgColor: 'from-amber-900 to-yellow-700',
    particleColor: 'rgba(255, 180, 0, 0.3)',
    animationType: 'float-scroll',
    transitionType: 'slide-left',
  },
  character: {
    bgColor: 'from-violet-900 to-purple-700',
    particleColor: 'rgba(180, 90, 255, 0.3)',
    animationType: 'float-fade',
    transitionType: 'slide-up',
  },
  map: {
    bgColor: 'from-cyan-900 to-blue-700',
    particleColor: 'rgba(80, 200, 255, 0.3)',
    animationType: 'float-wide',
    transitionType: 'fade',
  },
  shop: {
    bgColor: 'from-amber-800 to-yellow-600',
    particleColor: 'rgba(255, 215, 0, 0.3)',
    animationType: 'sparkle',
    transitionType: 'slide-up',
  },
  inventory: {
    bgColor: 'from-gray-900 to-stone-700',
    particleColor: 'rgba(200, 200, 200, 0.3)',
    animationType: 'float-slow',
    transitionType: 'slide-left',
  },
  skills: {
    bgColor: 'from-blue-800 to-indigo-600',
    particleColor: 'rgba(100, 150, 255, 0.3)',
    animationType: 'pulse',
    transitionType: 'slide-right',
  },
};

// Map route paths to theme keys
export function getThemeForPath(path: string): keyof typeof pageThemes {
  if (path === '/') return 'home';
  if (path === '/game') return 'cultivation';
  if (path === '/combat') return 'combat';
  if (path === '/sect-quests') return 'quest';
  if (path === '/character-info' || path === '/character') return 'character';
  if (path === '/map') return 'map';
  if (path === '/shop') return 'shop';
  if (path === '/inventory') return 'inventory';
  if (path === '/skill-tree') return 'skills';
  
  // Default to home theme
  return 'home';
}

// CSS animation classes for achievements
export const achievementAnimations = {
  unlock: 'achievement-unlock',
  levelUp: 'achievement-level-up',
  breakthrough: 'achievement-breakthrough',
  legendary: 'achievement-legendary',
};

// Transition timings (in ms)
export const transitions = {
  pageFadeIn: 1000,       // 1 second for page fade in
  pageTransition: 1000,   // 1 second for transitions between pages
  elementFadeIn: 500,     // 0.5 seconds for element fade ins
  popIn: 300,             // 0.3 seconds for pop-in animations
};

// Generate CSS classes for background gradient
export function getBackgroundClasses(themeName: keyof typeof pageThemes): string {
  const theme = pageThemes[themeName];
  return `bg-gradient-to-br ${theme.bgColor} transition-colors duration-1000`;
}

// Generate particle animation style based on theme
export function getParticleStyle(themeName: keyof typeof pageThemes): React.CSSProperties {
  const theme = pageThemes[themeName];
  return {
    '--particle-color': theme.particleColor,
    '--animation-type': theme.animationType,
  } as React.CSSProperties;
}

// Create the animation style for a specific achievement type
export function getAchievementAnimationClass(type: keyof typeof achievementAnimations): string {
  return achievementAnimations[type];
}

// CSS class for page transitions based on theme
export function getTransitionClass(themeName: keyof typeof pageThemes): string {
  const theme = pageThemes[themeName];
  return `page-transition-${theme.transitionType}`;
}