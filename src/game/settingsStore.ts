import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BackgroundTheme } from './renderer';

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

// 设置状态存储 - 单一职责：只管理全局游戏设置
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      // 设置背景主题
      setBackgroundTheme: (theme) => set({ backgroundTheme: theme }),
      // 设置粒子强度
      setParticleIntensity: (intensity) => set({ particleIntensity: intensity }),
      // 设置拖尾效果开关
      setTrailEffect: (enabled) => set({ trailEffect: enabled }),
      // 设置发光效果开关
      setGlowEffect: (enabled) => set({ glowEffect: enabled }),
      // 设置屏幕震动开关
      setScreenShake: (enabled) => set({ screenShake: enabled }),
      // 设置音效开关
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      // 设置音乐开关
      setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
      // 设置音效音量
      setSoundVolume: (volume) => set({ soundVolume: volume }),
      // 设置音乐音量
      setMusicVolume: (volume) => set({ musicVolume: volume }),
      // 重置为默认设置 - 创建新对象引用以确保状态更新触发
      resetToDefaults: () => set({ ...defaultSettings }),
    }),
    {
      name: 'game-settings',
    }
  )
);
