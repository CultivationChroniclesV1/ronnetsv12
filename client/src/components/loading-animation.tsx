import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { getThemeForPath } from '@/lib/animations';
import { useLocation } from 'wouter';

interface LoadingAnimationProps {
  type?: 'qi' | 'lotus' | 'sword' | 'scroll' | 'simple' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  mood?: 'calm' | 'dynamic' | 'powerful' | 'elegant' | 'mysterious';
}

/**
 * Wuxia-themed loading animation component
 * Different types of animations for different contexts
 * Can automatically choose the animation style based on the current page/theme
 */
export function LoadingAnimation({
  type = 'auto',
  size = 'md',
  text = 'Loading...',
  mood = 'calm',
  className
}: LoadingAnimationProps) {
  const [location] = useLocation();
  
  // Size mapping
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }[size];
  
  // Text size mapping
  const textSizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];
  
  // Auto-select the appropriate loader type based on the current page
  const getAutoLoaderType = (): 'qi' | 'lotus' | 'sword' | 'scroll' | 'simple' => {
    const pageTheme = getThemeForPath(location);
    
    // Map page themes to loader types
    if (location.includes('cultivation') || pageTheme === 'cultivation') return 'qi';
    if (location.includes('combat') || pageTheme === 'combat') return 'sword';
    if (location.includes('map') || location.includes('shop')) return 'scroll';
    if (location.includes('character')) return 'lotus';
    return 'qi'; // Default
  };
  
  // Determine the final loader type
  const finalType = type === 'auto' ? getAutoLoaderType() : type;
  
  // Custom text based on loader type
  const getCustomText = () => {
    if (!text || text === 'Loading...') {
      switch (finalType) {
        case 'qi': return 'Gathering Qi Energy...';
        case 'lotus': return 'Reaching Enlightenment...';
        case 'sword': return 'Focusing Spirit...';
        case 'scroll': return 'Consulting Ancient Texts...';
        default: return 'Loading...';
      }
    }
    return text;
  };
  
  // Get the appropriate loading animation based on type
  const renderLoadingAnimation = () => {
    switch (finalType) {
      case 'qi':
        return <QiEnergyLoader size={sizeClass} mood={mood} />;
      case 'lotus':
        return <LotusLoader size={sizeClass} mood={mood} />;
      case 'sword':
        return <SwordLoader size={sizeClass} mood={mood} />;
      case 'scroll':
        return <ScrollLoader size={sizeClass} mood={mood} />;
      case 'simple':
      default:
        return <SimpleLoader size={sizeClass} mood={mood} />;
    }
  };
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center transition-all duration-300",
      className
    )}>
      {renderLoadingAnimation()}
      {text && (
        <div className={cn(
          "mt-4 text-center font-serif opacity-80 transition-all duration-500",
          textSizeClass
        )}>
          {getCustomText()}
        </div>
      )}
    </div>
  );
}

// Qi Energy Loader (swirling energy)
function QiEnergyLoader({ size, mood = 'calm' }: { size: string, mood?: string }) {
  const [dots, setDots] = useState<JSX.Element[]>([]);
  
  // Adjust effects based on mood
  const moodColors = {
    calm: 'bg-blue-500',
    dynamic: 'bg-amber-500',
    powerful: 'bg-red-600',
    elegant: 'bg-purple-500',
    mysterious: 'bg-indigo-600'
  };
  
  const innerColors = {
    calm: 'bg-blue-200',
    dynamic: 'bg-amber-200',
    powerful: 'bg-red-200',
    elegant: 'bg-purple-200',
    mysterious: 'bg-indigo-200'
  };
  
  const dotColor = moodColors[mood as keyof typeof moodColors] || 'bg-blue-500';
  const innerColor = innerColors[mood as keyof typeof innerColors] || 'bg-blue-200';
  
  type SpeedType = 'calm' | 'dynamic' | 'powerful' | 'elegant' | 'mysterious';
  const speeds: Record<SpeedType, string> = {
    calm: '2s',
    dynamic: '1.2s',
    powerful: '0.8s',
    elegant: '2.5s',
    mysterious: '3s'
  };
  
  const dotSpeed = speeds[mood as SpeedType] || speeds.calm;
  
  useEffect(() => {
    const newDots = [];
    const totalDots = 12;
    
    for (let i = 0; i < totalDots; i++) {
      newDots.push(
        <div 
          key={i}
          className={cn(
            "absolute w-2 h-2 rounded-full opacity-0",
            dotColor
          )}
          style={{
            transform: `rotate(${i * 30}deg) translateY(-120%)`,
            animationDelay: `${i * 0.1}s`,
            animation: `qi-pulse ${dotSpeed} ease-in-out infinite`
          }}
        />
      );
    }
    
    setDots(newDots);
  }, [mood, dotColor, dotSpeed]);
  
  return (
    <div className={cn("relative flex items-center justify-center", size)}>
      <div className={`absolute w-full h-full rounded-full border-4 border-${dotColor}/20 animate-pulse`} />
      <div className={`absolute w-1/2 h-1/2 ${innerColor}/40 rounded-full animate-ping`} />
      {dots}
    </div>
  );
}

// Lotus Flower Loader
function LotusLoader({ size, mood = 'calm' }: { size: string, mood?: string }) {
  // Adjust effects based on mood
  const petalColors = {
    calm: 'bg-pink-300',
    dynamic: 'bg-yellow-400',
    powerful: 'bg-red-400',
    elegant: 'bg-purple-300',
    mysterious: 'bg-indigo-300'
  };
  
  const centerColors = {
    calm: 'bg-yellow-400',
    dynamic: 'bg-amber-500',
    powerful: 'bg-red-500',
    elegant: 'bg-purple-400',
    mysterious: 'bg-blue-400'
  };
  
  const petalColor = petalColors[mood as keyof typeof petalColors] || 'bg-pink-300';
  const centerColor = centerColors[mood as keyof typeof centerColors] || 'bg-yellow-400';
  
  type SpeedType = 'calm' | 'dynamic' | 'powerful' | 'elegant' | 'mysterious';
  const speeds: Record<SpeedType, string> = {
    calm: '3s',
    dynamic: '1.8s',
    powerful: '1.2s',
    elegant: '4s',
    mysterious: '5s'
  };
  
  const petalSpeed = speeds[mood as SpeedType] || speeds.calm;
  
  return (
    <div className={cn("relative", size)}>
      {/* Lotus petals */}
      {[...Array(8)].map((_, i) => (
        <div 
          key={i}
          className="absolute inset-0"
          style={{
            transform: `rotate(${i * 45}deg)`,
            animationDelay: `${i * 0.125}s`,
            animation: `lotus-petal ${petalSpeed} ease-in-out infinite`
          }}
        >
          <div 
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1/2 ${petalColor} rounded-full origin-bottom`}
          />
        </div>
      ))}
      
      {/* Center of the lotus */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-1/4 h-1/4 rounded-full ${centerColor} animate-pulse`} />
      </div>
    </div>
  );
}

// Sword Loader (rotating swords)
function SwordLoader({ size, mood = 'calm' }: { size: string, mood?: string }) {
  // Adjust effects based on mood
  const bladeColors = {
    calm: 'bg-gray-300',
    dynamic: 'bg-amber-200',
    powerful: 'bg-red-300',
    elegant: 'bg-purple-200',
    mysterious: 'bg-blue-300'
  };
  
  const handleColors = {
    calm: 'bg-amber-700',
    dynamic: 'bg-amber-600',
    powerful: 'bg-red-700',
    elegant: 'bg-purple-700',
    mysterious: 'bg-blue-700'
  };
  
  const centerColors = {
    calm: 'bg-blue-500',
    dynamic: 'bg-amber-500',
    powerful: 'bg-red-500',
    elegant: 'bg-purple-500',
    mysterious: 'bg-indigo-500'
  };
  
  const bladeColor = bladeColors[mood as keyof typeof bladeColors] || 'bg-gray-300';
  const handleColor = handleColors[mood as keyof typeof handleColors] || 'bg-amber-700';
  const centerColor = centerColors[mood as keyof typeof centerColors] || 'bg-blue-500';
  
  type SpeedType = 'calm' | 'dynamic' | 'powerful' | 'elegant' | 'mysterious';
  const speeds: Record<SpeedType, string> = {
    calm: '2s',
    dynamic: '1.5s',
    powerful: '1s',
    elegant: '3s',
    mysterious: '4s'
  };
  
  const rotationSpeed = speeds[mood as SpeedType] || speeds.calm;
  
  return (
    <div className={cn("relative", size)}>
      {/* Three rotating swords */}
      {[...Array(3)].map((_, i) => (
        <div 
          key={i}
          className="absolute inset-0"
          style={{
            animationDelay: `${i * 0.33}s`,
            animation: `sword-rotate ${rotationSpeed} linear infinite`
          }}
        >
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3/4 ${bladeColor}`}>
            {/* Sword handle */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 ${handleColor} rounded-full`} />
            {/* Sword blade */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 border-t-4 border-l-4 border-r-4 border-${bladeColor}`} style={{ transform: 'translateX(-50%) rotate(45deg)' }} />
          </div>
        </div>
      ))}
      
      {/* Center point */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-1/6 h-1/6 rounded-full ${centerColor} animate-ping`} />
      </div>
    </div>
  );
}

// Scroll Loader (unrolling scroll)
function ScrollLoader({ size, mood = 'calm' }: { size: string, mood?: string }) {
  // Adjust effects based on mood
  const scrollColors = {
    calm: 'bg-amber-100',
    dynamic: 'bg-amber-50',
    powerful: 'bg-red-50',
    elegant: 'bg-purple-50',
    mysterious: 'bg-blue-50'
  };
  
  const rollerColors = {
    calm: 'bg-amber-700',
    dynamic: 'bg-amber-600',
    powerful: 'bg-red-700',
    elegant: 'bg-purple-700',
    mysterious: 'bg-blue-700'
  };
  
  const lineColors = {
    calm: 'bg-gray-400',
    dynamic: 'bg-amber-400',
    powerful: 'bg-red-400',
    elegant: 'bg-purple-400',
    mysterious: 'bg-blue-400'
  };
  
  const scrollColor = scrollColors[mood as keyof typeof scrollColors] || 'bg-amber-100';
  const rollerColor = rollerColors[mood as keyof typeof rollerColors] || 'bg-amber-700';
  const lineColor = lineColors[mood as keyof typeof lineColors] || 'bg-gray-400';
  
  type SpeedType = 'calm' | 'dynamic' | 'powerful' | 'elegant' | 'mysterious';
  
  const unrollSpeeds: Record<SpeedType, string> = {
    calm: '2s',
    dynamic: '1.2s',
    powerful: '0.8s',
    elegant: '3s',
    mysterious: '4s'
  };
  
  const lineSpeeds: Record<SpeedType, string> = {
    calm: '1.5s',
    dynamic: '1s',
    powerful: '0.7s',
    elegant: '2s',
    mysterious: '2.5s'
  };
  
  const unrollSpeed = unrollSpeeds[mood as SpeedType] || unrollSpeeds.calm;
  const lineSpeed = lineSpeeds[mood as SpeedType] || lineSpeeds.calm;
  
  return (
    <div className={cn("relative", size)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={`w-3/4 h-1/2 ${scrollColor} rounded-lg relative overflow-hidden`}
          style={{ animation: `scroll-unroll ${unrollSpeed} ease-out forwards` }}
        >
          {/* Scroll content lines */}
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className={`absolute left-4 h-0.5 ${lineColor}`}
              style={{
                top: `${30 + i * 15}%`,
                width: `${70 - i * 10}%`,
                animationDelay: `${0.2 + i * 0.1}s`,
                animation: `scroll-line ${lineSpeed} ease-out forwards`
              }}
            />
          ))}
          
          {/* Scroll rollers */}
          <div className={`absolute top-0 left-0 w-2 h-full ${rollerColor} rounded-l-lg`} />
          <div className={`absolute top-0 right-0 w-2 h-full ${rollerColor} rounded-r-lg`} />
        </div>
      </div>
    </div>
  );
}

// Simple Loader (spinning circle with pulse)
function SimpleLoader({ size, mood = 'calm' }: { size: string, mood?: string }) {
  // Adjust effects based on mood
  const borderColors = {
    calm: 'border-blue-500',
    dynamic: 'border-amber-500',
    powerful: 'border-red-500',
    elegant: 'border-purple-500',
    mysterious: 'border-indigo-500'
  };
  
  const centerColors = {
    calm: 'bg-blue-300',
    dynamic: 'bg-amber-300',
    powerful: 'bg-red-300',
    elegant: 'bg-purple-300',
    mysterious: 'bg-indigo-300'
  };
  
  const borderColor = borderColors[mood as keyof typeof borderColors] || 'border-blue-500';
  const centerColor = centerColors[mood as keyof typeof centerColors] || 'bg-blue-300';
  
  type SpeedType = 'calm' | 'dynamic' | 'powerful' | 'elegant' | 'mysterious';
  const spinSpeeds: Record<SpeedType, string> = {
    calm: '2s',
    dynamic: '1s',
    powerful: '0.7s',
    elegant: '3s',
    mysterious: '4s'
  };
  
  const spinSpeed = spinSpeeds[mood as SpeedType] || spinSpeeds.calm;
  
  return (
    <div className={cn("relative", size)}>
      <div className={`absolute inset-0 border-4 ${borderColor.replace('border-', 'border-')}/20 rounded-full`} />
      <div 
        className={`absolute inset-0 border-4 border-transparent ${borderColor} rounded-full`}
        style={{ animation: `spin ${spinSpeed} linear infinite` }}
      />
      <div className={`absolute inset-0 m-auto w-1/3 h-1/3 ${centerColor}/30 rounded-full animate-ping`} />
    </div>
  );
}