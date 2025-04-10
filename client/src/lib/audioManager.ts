/**
 * Audio Manager for Cultivation Chronicles
 * Handles background music and sound effects throughout the game
 */

// Define music for each page/route
export const PAGE_MUSIC: Record<string, string> = {
  '/': '/audio/music/home.mp3',
  '/game': '/audio/music/cultivation.mp3',
  '/combat': '/audio/music/combat.mp3',
  '/map': '/audio/music/map.mp3',
  '/inventory': '/audio/music/inventory.mp3',
  '/shop': '/audio/music/shop.mp3',
  '/sect-quests': '/audio/music/quests.mp3',
  '/martial-techniques': '/audio/music/techniques.mp3',
  '/achievements': '/audio/music/achievements.mp3',
  '/settings': '/audio/music/settings.mp3',
  '/character': '/audio/music/character.mp3',
};

// Define all sound effects
export const SFX: Record<string, string> = {
  click: '/audio/sfx/click.mp3',
  hover: '/audio/sfx/hover.mp3',
  success: '/audio/sfx/success.mp3',
  cultivate: '/audio/sfx/cultivate.mp3',
  battle: '/audio/sfx/battle.mp3',
  achievement: '/audio/sfx/achievement.mp3',
  breakthrough: '/audio/sfx/breakthrough.mp3',
  upgrade: '/audio/sfx/upgrade.mp3',
  buy: '/audio/sfx/buy.mp3',
  skill: '/audio/sfx/skill.mp3',
  error: '/audio/sfx/error.mp3',
  save: '/audio/sfx/save.mp3',
};

class AudioManager {
  private bgmAudio: HTMLAudioElement | null = null;
  private sfxAudio: HTMLAudioElement | null = null;
  private currentMusic: string | null = null;
  private musicEnabled: boolean = true;
  private soundEnabled: boolean = true;
  private musicVolume: number = 0.3; // Default music volume
  private sfxVolume: number = 0.5;   // Default SFX volume

  constructor() {
    // Create audio elements
    if (typeof window !== 'undefined') {
      this.bgmAudio = new Audio();
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.musicVolume;
      
      this.sfxAudio = new Audio();
      this.sfxAudio.loop = false;
      this.sfxAudio.volume = this.sfxVolume;
      
      // Try to load saved audio preferences
      this.loadAudioPreferences();
    }
  }

  private loadAudioPreferences(): void {
    try {
      const audioPrefs = localStorage.getItem('cultivation-audio-prefs');
      if (audioPrefs) {
        const prefs = JSON.parse(audioPrefs);
        this.musicEnabled = prefs.musicEnabled !== undefined ? prefs.musicEnabled : true;
        this.soundEnabled = prefs.soundEnabled !== undefined ? prefs.soundEnabled : true;
        this.musicVolume = prefs.musicVolume !== undefined ? prefs.musicVolume : 0.3;
        this.sfxVolume = prefs.sfxVolume !== undefined ? prefs.sfxVolume : 0.5;
        
        if (this.bgmAudio) this.bgmAudio.volume = this.musicVolume;
        if (this.sfxAudio) this.sfxAudio.volume = this.sfxVolume;
      }
    } catch (error) {
      console.error('Error loading audio preferences:', error);
    }
  }

  public saveAudioPreferences(): void {
    try {
      const prefs = {
        musicEnabled: this.musicEnabled,
        soundEnabled: this.soundEnabled,
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume
      };
      localStorage.setItem('cultivation-audio-prefs', JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving audio preferences:', error);
    }
  }

  public playMusic(musicPath: string): void {
    if (!this.bgmAudio || !this.musicEnabled || this.currentMusic === musicPath) return;
    
    this.currentMusic = musicPath;
    this.bgmAudio.src = musicPath;
    
    // Using play() with catch for browsers that block autoplay
    const playPromise = this.bgmAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // Auto-play was prevented
        console.info('Autoplay prevented, user interaction required');
      });
    }
  }

  public playMusicForPage(route: string): void {
    const musicPath = PAGE_MUSIC[route] || PAGE_MUSIC['/'];
    this.playMusic(musicPath);
  }

  public playSfx(sfxName: string): void {
    if (!this.sfxAudio || !this.soundEnabled) return;
    
    const sfxPath = SFX[sfxName];
    if (!sfxPath) return;
    
    // Play sound effect
    this.sfxAudio.src = sfxPath;
    
    const playPromise = this.sfxAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.info('SFX playback prevented, user interaction required');
      });
    }
  }

  public toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    
    if (this.bgmAudio) {
      if (this.musicEnabled && this.currentMusic) {
        this.bgmAudio.play().catch(() => {});
      } else {
        this.bgmAudio.pause();
      }
    }
    
    this.saveAudioPreferences();
    return this.musicEnabled;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    this.saveAudioPreferences();
    return this.soundEnabled;
  }

  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    // Ensure the volume is applied to current and future music
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.getMusicEnabled() ? this.musicVolume : 0;
    }
    
    // Apply the same volume to all audio elements with music class
    if (typeof document !== 'undefined') {
      document.querySelectorAll('audio.music').forEach((element) => {
        const audio = element as HTMLAudioElement;
        audio.volume = this.getMusicEnabled() ? this.musicVolume : 0;
      });
    }
    
    this.saveAudioPreferences();
    console.log(`Music volume set to ${this.musicVolume}`);
  }

  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    
    // Apply to current sfx player
    if (this.sfxAudio) {
      this.sfxAudio.volume = this.getSoundEnabled() ? this.sfxVolume : 0;
    }
    
    // Apply the same volume to all audio elements with sfx class
    if (typeof document !== 'undefined') {
      document.querySelectorAll('audio.sfx').forEach((element) => {
        const audio = element as HTMLAudioElement;
        audio.volume = this.getSoundEnabled() ? this.sfxVolume : 0;
      });
    }
    
    this.saveAudioPreferences();
    console.log(`SFX volume set to ${this.sfxVolume}`);
  }

  public getMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public stopMusic(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.currentMusic = null;
    }
  }
}

// Singleton instance
export const audioManager = typeof window !== 'undefined' ? new AudioManager() : null;

// Export wrapper functions for easier use
export const playMusic = (musicPath: string) => audioManager?.playMusic(musicPath);
export const playMusicForPage = (route: string) => audioManager?.playMusicForPage(route);
export const playSfx = (sfxName: string) => audioManager?.playSfx(sfxName);
export const toggleMusic = () => audioManager?.toggleMusic();
export const toggleSound = () => audioManager?.toggleSound();
export const setMusicVolume = (volume: number) => audioManager?.setMusicVolume(volume);
export const setSfxVolume = (volume: number) => audioManager?.setSfxVolume(volume);
export const stopMusic = () => audioManager?.stopMusic();