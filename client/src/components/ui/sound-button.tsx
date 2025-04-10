import { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useAudio } from '@/components/audio-provider';

export interface SoundButtonProps extends ButtonProps {
  soundEffect?: string;
  hoverSound?: boolean;
}

export const SoundButton = forwardRef<HTMLButtonElement, SoundButtonProps>(
  ({ soundEffect = 'click', hoverSound = false, onClick, onMouseEnter, ...props }, ref) => {
    const { playSound, isSoundEnabled } = useAudio();
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isSoundEnabled) {
        playSound(soundEffect);
      }
      onClick?.(e);
    };
    
    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isSoundEnabled && hoverSound) {
        playSound('hover');
      }
      onMouseEnter?.(e);
    };
    
    return (
      <Button
        ref={ref}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...props}
      />
    );
  }
);

SoundButton.displayName = 'SoundButton';

// Variants for specific actions
export const CultivateButton = forwardRef<HTMLButtonElement, Omit<SoundButtonProps, 'soundEffect'>>(
  (props, ref) => <SoundButton ref={ref} soundEffect="cultivate" {...props} />
);
CultivateButton.displayName = 'CultivateButton';

export const BreakthroughButton = forwardRef<HTMLButtonElement, Omit<SoundButtonProps, 'soundEffect'>>(
  (props, ref) => <SoundButton ref={ref} soundEffect="breakthrough" {...props} />
);
BreakthroughButton.displayName = 'BreakthroughButton';

export const UpgradeButton = forwardRef<HTMLButtonElement, Omit<SoundButtonProps, 'soundEffect'>>(
  (props, ref) => <SoundButton ref={ref} soundEffect="upgrade" {...props} />
);
UpgradeButton.displayName = 'UpgradeButton';

export const BattleButton = forwardRef<HTMLButtonElement, Omit<SoundButtonProps, 'soundEffect'>>(
  (props, ref) => <SoundButton ref={ref} soundEffect="battle" {...props} />
);
BattleButton.displayName = 'BattleButton';

export const BuyButton = forwardRef<HTMLButtonElement, Omit<SoundButtonProps, 'soundEffect'>>(
  (props, ref) => <SoundButton ref={ref} soundEffect="buy" {...props} />
);
BuyButton.displayName = 'BuyButton';

export const SaveButton = forwardRef<HTMLButtonElement, Omit<SoundButtonProps, 'soundEffect'>>(
  (props, ref) => <SoundButton ref={ref} soundEffect="save" {...props} />
);
SaveButton.displayName = 'SaveButton';