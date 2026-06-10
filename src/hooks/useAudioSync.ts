import { useEffect } from 'react';
import { useSettingsStore } from '@/game/settingsStore';
import { audioService } from '@/game/audioService';

/**
 * 单一职责：将 settingsStore 中的音频设置实时同步到 AudioService。
 * 任意一项变化都会立即生效（音量调节、开关切换）。
 */
export function useAudioSync(): void {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const musicEnabled = useSettingsStore((s) => s.musicEnabled);
  const soundVolume = useSettingsStore((s) => s.soundVolume);
  const musicVolume = useSettingsStore((s) => s.musicVolume);

  useEffect(() => {
    audioService.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    audioService.setSoundVolume(soundVolume);
  }, [soundVolume]);

  useEffect(() => {
    audioService.setMusicVolume(musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    audioService.setMusicEnabled(musicEnabled);
  }, [musicEnabled]);
}
