import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X, Palette, Sparkles, Volume2, Music, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '@/game/settingsStore';
import type { BackgroundTheme } from '@/game/renderer';
import type { GameSettings } from '@/game/settingsStore';

// 主题选项配置 - 单一职责：只定义主题配置数据
const themeOptions: { value: BackgroundTheme; label: string; icon: string; colors: string[] }[] = [
  { value: 'night', label: '暗夜星空', icon: '🌙', colors: ['#1a1a2e', '#7c3aed', '#a78bfa'] },
  { value: 'forest', label: '神秘森林', icon: '🌲', colors: ['#1a3a1a', '#22c55e', '#86efac'] },
  { value: 'desert', label: '沙漠遗迹', icon: '🏜️', colors: ['#3d2f1f', '#f59e0b', '#fde0ab'] },
  { value: 'ice', label: '冰雪世界', icon: '❄️', colors: ['#1a2a3a', '#38bdf8', '#bae6fd'] },
  { value: 'volcano', label: '火山熔岩', icon: '🌋', colors: ['#2a1515', '#ef4444', '#fca5a5'] },
  { value: 'ocean', label: '深海秘境', icon: '🌊', colors: ['#0f2a3a', '#0ea5e9', '#7dd3fc'] },
];

// 设置按钮组件 - 单一职责：只负责渲染打开设置的按钮
interface SettingsButtonProps {
  onClick: () => void;
}

function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-game-panel/90 backdrop-blur-sm border border-game-magic/30 text-gray-300 hover:text-white hover:border-game-magic/50 transition-all duration-200 hover:scale-105"
    >
      <Settings className="w-5 h-5" />
      <span className="hidden sm:inline">设置</span>
    </button>
  );
}

// 主题选择器组件 - 单一职责：只负责场景主题选择
interface ThemeSelectorProps {
  currentTheme: BackgroundTheme;
  onThemeChange: (theme: BackgroundTheme) => void;
}

function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div>
      <h3 className="text-sm font-bold text-game-magic mb-3 flex items-center gap-2">
        <Palette className="w-4 h-4" />
        场景主题
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {themeOptions.map((theme) => (
          <button
            key={theme.value}
            onClick={() => onThemeChange(theme.value)}
            className={`p-3 rounded-xl border-2 transition-all duration-200 ${
              currentTheme === theme.value
                ? 'border-game-magic bg-game-magic/20 scale-105'
                : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
            }`}
          >
            <div className="w-full h-8 rounded-lg mb-2 overflow-hidden">
              <div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`,
                }}
              />
            </div>
            <div className="text-xs font-medium text-center text-gray-300">
              {theme.icon} {theme.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// 开关切换组件 - 单一职责：通用开关组件
interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
}

function ToggleSwitch({ enabled, onChange }: ToggleSwitchProps) {
  return (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-all duration-200 ${
        enabled ? 'bg-green-500' : 'bg-gray-600'
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

// 视觉特效设置组件 - 单一职责：只负责视觉特效相关设置
interface VisualEffectsSettingsProps {
  particleIntensity: number;
  trailEffect: boolean;
  glowEffect: boolean;
  screenShake: boolean;
  onParticleIntensityChange: (value: number) => void;
  onTrailEffectChange: (enabled: boolean) => void;
  onGlowEffectChange: (enabled: boolean) => void;
  onScreenShakeChange: (enabled: boolean) => void;
}

function VisualEffectsSettings({
  particleIntensity,
  trailEffect,
  glowEffect,
  screenShake,
  onParticleIntensityChange,
  onTrailEffectChange,
  onGlowEffectChange,
  onScreenShakeChange,
}: VisualEffectsSettingsProps) {
  return (
    <div>
      <h3 className="text-sm font-bold text-game-magic mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        视觉特效
      </h3>
      <div className="space-y-3">
        {/* 弹道拖尾开关 */}
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-white">弹道拖尾</p>
            <p className="text-xs text-gray-400">投射物飞行轨迹效果</p>
          </div>
          <ToggleSwitch enabled={trailEffect} onChange={() => onTrailEffectChange(!trailEffect)} />
        </div>

        {/* 发光效果开关 */}
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-white">发光效果</p>
            <p className="text-xs text-gray-400">粒子和特效的光晕</p>
          </div>
          <ToggleSwitch enabled={glowEffect} onChange={() => onGlowEffectChange(!glowEffect)} />
        </div>

        {/* 屏幕震动开关 */}
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-white">屏幕震动</p>
            <p className="text-xs text-gray-400">爆炸和击杀时的震动反馈</p>
          </div>
          <ToggleSwitch enabled={screenShake} onChange={() => onScreenShakeChange(!screenShake)} />
        </div>

        {/* 粒子强度滑块 */}
        <div className="p-3 bg-gray-800/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-white">粒子强度</p>
              <p className="text-xs text-gray-400">特效粒子数量</p>
            </div>
            <span className="text-sm font-bold text-game-magic">
              {Math.round(particleIntensity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2"
            step="0.1"
            value={particleIntensity}
            onChange={(e) => onParticleIntensityChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-game-magic"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>低</span>
            <span>中</span>
            <span>高</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 音量滑块组件 - 单一职责：通用音量滑块
interface VolumeSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function VolumeSlider({ label, value, onChange }: VolumeSliderProps) {
  return (
    <div className="p-3 bg-gray-800/50 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-bold text-gray-300">
          {Math.round(value * 100)}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-game-magic"
      />
    </div>
  );
}

// 音频设置组件 - 单一职责：只负责音频相关设置
interface AudioSettingsProps {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  onSoundEnabledChange: (enabled: boolean) => void;
  onMusicEnabledChange: (enabled: boolean) => void;
  onSoundVolumeChange: (volume: number) => void;
  onMusicVolumeChange: (volume: number) => void;
}

function AudioSettings({
  soundEnabled,
  musicEnabled,
  soundVolume,
  musicVolume,
  onSoundEnabledChange,
  onMusicEnabledChange,
  onSoundVolumeChange,
  onMusicVolumeChange,
}: AudioSettingsProps) {
  return (
    <div>
      <h3 className="text-sm font-bold text-game-magic mb-3 flex items-center gap-2">
        <Volume2 className="w-4 h-4" />
        音频设置
      </h3>
      <div className="space-y-3">
        {/* 音效开关 */}
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-white">音效</span>
          </div>
          <ToggleSwitch enabled={soundEnabled} onChange={() => onSoundEnabledChange(!soundEnabled)} />
        </div>

        {/* 音效音量 */}
        {soundEnabled && (
          <VolumeSlider label="音效音量" value={soundVolume} onChange={onSoundVolumeChange} />
        )}

        {/* 音乐开关 */}
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-white">音乐</span>
          </div>
          <ToggleSwitch enabled={musicEnabled} onChange={() => onMusicEnabledChange(!musicEnabled)} />
        </div>

        {/* 音乐音量 */}
        {musicEnabled && (
          <VolumeSlider label="音乐音量" value={musicVolume} onChange={onMusicVolumeChange} />
        )}
      </div>
    </div>
  );
}

// 从全局store获取默认设置
function getDefaultSettings(): GameSettings {
  return {
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
}

// 设置弹框内容组件 - 单一职责：只负责设置弹框UI内容，使用草稿状态，保存才生效
function SettingsModalContent({ onClose }: { onClose: () => void }) {
  // 从store获取当前已保存的设置作为初始草稿
  const savedSettings = useSettingsStore((state) => ({
    backgroundTheme: state.backgroundTheme,
    particleIntensity: state.particleIntensity,
    trailEffect: state.trailEffect,
    glowEffect: state.glowEffect,
    screenShake: state.screenShake,
    soundEnabled: state.soundEnabled,
    musicEnabled: state.musicEnabled,
    soundVolume: state.soundVolume,
    musicVolume: state.musicVolume,
  }));
  
  const {
    setBackgroundTheme,
    setParticleIntensity,
    setTrailEffect,
    setGlowEffect,
    setScreenShake,
    setSoundEnabled,
    setMusicEnabled,
    setSoundVolume,
    setMusicVolume,
    resetToDefaults,
  } = useSettingsStore();

  // 使用本地草稿状态，修改只存在本地，不立即影响全局
  const [draft, setDraft] = useState<GameSettings>(savedSettings);

  // 按ESC键关闭弹框（不保存）
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // 保存设置到全局store
  const handleSave = useCallback(() => {
    // 将草稿状态同步到全局store
    setBackgroundTheme(draft.backgroundTheme);
    setParticleIntensity(draft.particleIntensity);
    setTrailEffect(draft.trailEffect);
    setGlowEffect(draft.glowEffect);
    setScreenShake(draft.screenShake);
    setSoundEnabled(draft.soundEnabled);
    setMusicEnabled(draft.musicEnabled);
    setSoundVolume(draft.soundVolume);
    setMusicVolume(draft.musicVolume);
    onClose();
  }, [draft, setBackgroundTheme, setParticleIntensity, setTrailEffect, setGlowEffect, setScreenShake, setSoundEnabled, setMusicEnabled, setSoundVolume, setMusicVolume, onClose]);

  // 重置草稿为默认设置（只影响本地草稿，不立即保存）
  const handleResetDraft = useCallback(() => {
    setDraft(getDefaultSettings());
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 半透明背景遮罩 - 点击关闭弹框（不保存） */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 设置面板 - 居中显示，适中宽度不遮挡太多游戏内容 */}
      <div className="relative bg-game-panel/98 backdrop-blur-md rounded-2xl border border-game-magic/30 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="sticky top-0 bg-game-panel/98 backdrop-blur-md p-4 border-b border-game-magic/20 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-game-magic" />
            游戏设置
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="取消（不保存）"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          <ThemeSelector 
            currentTheme={draft.backgroundTheme} 
            onThemeChange={(theme) => setDraft(prev => ({ ...prev, backgroundTheme: theme }))} 
          />
          
          <VisualEffectsSettings
            particleIntensity={draft.particleIntensity}
            trailEffect={draft.trailEffect}
            glowEffect={draft.glowEffect}
            screenShake={draft.screenShake}
            onParticleIntensityChange={(value) => setDraft(prev => ({ ...prev, particleIntensity: value }))}
            onTrailEffectChange={(enabled) => setDraft(prev => ({ ...prev, trailEffect: enabled }))}
            onGlowEffectChange={(enabled) => setDraft(prev => ({ ...prev, glowEffect: enabled }))}
            onScreenShakeChange={(enabled) => setDraft(prev => ({ ...prev, screenShake: enabled }))}
          />
          
          <AudioSettings
            soundEnabled={draft.soundEnabled}
            musicEnabled={draft.musicEnabled}
            soundVolume={draft.soundVolume}
            musicVolume={draft.musicVolume}
            onSoundEnabledChange={(enabled) => setDraft(prev => ({ ...prev, soundEnabled: enabled }))}
            onMusicEnabledChange={(enabled) => setDraft(prev => ({ ...prev, musicEnabled: enabled }))}
            onSoundVolumeChange={(volume) => setDraft(prev => ({ ...prev, soundVolume: volume }))}
            onMusicVolumeChange={(volume) => setDraft(prev => ({ ...prev, musicVolume: volume }))}
          />

          <div className="pt-1">
            <button
              onClick={handleResetDraft}
              className="w-full py-2.5 px-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              恢复默认设置
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 p-4 border-t border-game-magic/20 bg-game-panel/98 backdrop-blur-md flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium transition-all duration-200"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02]"
          >
            保存
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

// 设置弹框组件 - 单一职责：使用Portal将弹框渲染到body避免被父容器裁剪
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  // 使用React Portal将弹框直接渲染到document.body
  // 避免父容器overflow:hidden或z-index层级导致被遮挡
  return createPortal(
    <SettingsModalContent onClose={onClose} />,
    document.body
  );
}

// 主设置面板组件 - 单一职责：组合设置按钮和弹框
export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <SettingsButton onClick={() => setIsOpen(true)} />
      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
