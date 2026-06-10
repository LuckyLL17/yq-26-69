import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BackgroundTheme } from './renderer';
import { audioManager } from './audioManager';

export interface GameSettings {
  backgroundTheme: BackgroundTheme;
  particleIntensity: number;
  trailEffect: boolean;
  glowEffect: boolean;
  screenShake: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
}

interface SettingsStore extends GameSettings {
  setBackgroundTheme: (theme: BackgroundTheme) => void;
  setParticleIntensity: (intensity: number) => void;
  setTrailEffect: (enabled: boolean) => void;
  setGlowEffect: (enabled: boolean) => void;
  setScreenShake: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  resetToDefaults: () => void;
}

const defaultSettings: GameSettings = {
  backgroundTheme: 'night',
  particleIntensity: 1,
  trailEffect: true,
  glowEffect: true,
  screenShake: true,
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.7,
  musicVolume: 0.5,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setBackgroundTheme: (theme) => set({ backgroundTheme: theme }),
      setParticleIntensity: (intensity) => set({ particleIntensity: intensity }),
      setTrailEffect: (enabled) => set({ trailEffect: enabled }),
      setGlowEffect: (enabled) => set({ glowEffect: enabled }),
      setScreenShake: (enabled) => set({ screenShake: enabled }),
      
      // 音效开关变化时同步到音频管理器
      setSoundEnabled: (enabled) => {
        set({ soundEnabled: enabled });
      },
      
      // 音乐开关变化时同步到音频管理器
      setMusicEnabled: (enabled) => {
        set({ musicEnabled: enabled });
        audioManager.toggleMusic(enabled);
      },
      
      // 音效音量变化
      setSoundVolume: (volume) => set({ soundVolume: volume }),
      
      // 音乐音量变化时同步到音频管理器
      setMusicVolume: (volume) => {
        set({ musicVolume: volume });
        audioManager.updateMusicVolume(volume);
      },
      
      // 恢复默认设置
      resetToDefaults: () => {
        set(defaultSettings);
        audioManager.toggleMusic(defaultSettings.musicEnabled);
        audioManager.updateMusicVolume(defaultSettings.musicVolume);
      },
    }),
    {
      name: 'game-settings',
    }
  )
);
