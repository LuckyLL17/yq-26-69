// 音频管理器 - 使用 Web Audio API 生成游戏音效和背景音乐
import { useSettingsStore } from './settingsStore';

// 音效类型定义
export type SoundEffectType = 
  | 'build'        // 建造防御塔
  | 'upgrade'      // 升级防御塔
  | 'sell'         // 出售防御塔
  | 'shoot'        // 塔射击
  | 'hit'          // 命中敌人
  | 'kill'         // 击杀敌人
  | 'card'         // 使用卡牌
  | 'wave_start'   // 波次开始
  | 'wave_complete' // 波次完成
  | 'game_over'    // 游戏结束
  | 'victory'      // 游戏胜利
  | 'click'        // 按钮点击
  | 'gold'         // 获得金币
  | 'damage';      // 受到伤害

// 音频管理器类
class AudioManager {
  private audioContext: AudioContext | null = null;
  private musicOscillator: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying = false;
  private initialized = false;

  // 初始化音频上下文（需要用户交互后调用）
  private init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  // 确保音频上下文已启动（处理浏览器自动播放策略）
  private ensureContextRunning(): void {
    if (!this.audioContext) {
      this.init();
    }
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // 播放音效
  playSound(type: SoundEffectType): void {
    const { soundEnabled, soundVolume } = useSettingsStore.getState();
    if (!soundEnabled) return;

    this.ensureContextRunning();
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // 根据音效类型生成不同的声音
    switch (type) {
      case 'build':
        this.playBuildSound(ctx, now, soundVolume);
        break;
      case 'upgrade':
        this.playUpgradeSound(ctx, now, soundVolume);
        break;
      case 'sell':
        this.playSellSound(ctx, now, soundVolume);
        break;
      case 'shoot':
        this.playShootSound(ctx, now, soundVolume);
        break;
      case 'hit':
        this.playHitSound(ctx, now, soundVolume);
        break;
      case 'kill':
        this.playKillSound(ctx, now, soundVolume);
        break;
      case 'card':
        this.playCardSound(ctx, now, soundVolume);
        break;
      case 'wave_start':
        this.playWaveStartSound(ctx, now, soundVolume);
        break;
      case 'wave_complete':
        this.playWaveCompleteSound(ctx, now, soundVolume);
        break;
      case 'game_over':
        this.playGameOverSound(ctx, now, soundVolume);
        break;
      case 'victory':
        this.playVictorySound(ctx, now, soundVolume);
        break;
      case 'click':
        this.playClickSound(ctx, now, soundVolume);
        break;
      case 'gold':
        this.playGoldSound(ctx, now, soundVolume);
        break;
      case 'damage':
        this.playDamageSound(ctx, now, soundVolume);
        break;
    }
  }

  // 建造音效 - 低沉的敲击声
  private playBuildSound(ctx: AudioContext, now: number, volume: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
    
    gain.gain.setValueAtTime(volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // 升级音效 - 上升的音调
  private playUpgradeSound(ctx: AudioContext, now: number, volume: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
    
    gain.gain.setValueAtTime(volume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // 出售音效 - 金币声
  private playSellSound(ctx: AudioContext, now: number, volume: number): void {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(800, now);
    osc2.frequency.setValueAtTime(1200, now + 0.05);
    
    gain.gain.setValueAtTime(volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.1);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.2);
  }

  // 射击音效 - 快速的"嗖"声
  private playShootSound(ctx: AudioContext, now: number, volume: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
    
    gain.gain.setValueAtTime(volume * 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // 命中音效 - 短促的打击声
  private playHitSound(ctx: AudioContext, now: number, volume: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
    
    gain.gain.setValueAtTime(volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // 击杀音效 - 爆炸感的声音
  private playKillSound(ctx: AudioContext, now: number, volume: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
    
    gain.gain.setValueAtTime(volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // 卡牌音效 - 魔法感的声音
  private playCardSound(ctx: AudioContext, now: number, volume: number): void {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(400, now);
    osc1.frequency.exponentialRampToValueAtTime(800, now + 0.15);
    osc2.frequency.setValueAtTime(600, now);
    osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    
    gain.gain.setValueAtTime(volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.2);
    osc2.start(now);
    osc2.stop(now + 0.2);
  }

  // 波次开始音效 - 警报声
  private playWaveStartSound(ctx: AudioContext, now: number, volume: number): void {
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now + i * 0.15);
      osc.frequency.setValueAtTime(880, now + i * 0.15 + 0.075);
      
      gain.gain.setValueAtTime(volume * 0.2, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.12);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.12);
    }
  }

  // 波次完成音效 - 胜利的小旋律
  private playWaveCompleteSound(ctx: AudioContext, now: number, volume: number): void {
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      
      gain.gain.setValueAtTime(volume * 0.2, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.15);
    });
  }

  // 游戏结束音效 - 低沉的失败音
  private playGameOverSound(ctx: AudioContext, now: number, volume: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.8);
    
    gain.gain.setValueAtTime(volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.9);
  }

  // 胜利音效 - 欢快的旋律
  private playVictorySound(ctx: AudioContext, now: number, volume: number): void {
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50]; // C5, E5, G5, C6, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
      
      gain.gain.setValueAtTime(volume * 0.2, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.2);
    });
  }

  // 点击音效 - 轻微的点击声
  private playClickSound(ctx: AudioContext, now: number, volume: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    
    gain.gain.setValueAtTime(volume * 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // 金币音效 - 清脆的叮当声
  private playGoldSound(ctx: AudioContext, now: number, volume: number): void {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(1000, now);
    osc2.frequency.setValueAtTime(1500, now + 0.05);
    
    gain.gain.setValueAtTime(volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.1);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.2);
  }

  // 受到伤害音效 - 警示音
  private playDamageSound(ctx: AudioContext, now: number, volume: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.setValueAtTime(150, now + 0.1);
    osc.frequency.setValueAtTime(200, now + 0.2);
    
    gain.gain.setValueAtTime(volume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // 播放背景音乐
  startMusic(): void {
    const { musicEnabled, musicVolume } = useSettingsStore.getState();
    if (!musicEnabled || this.isMusicPlaying) return;

    this.ensureContextRunning();
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    
    // 创建简单的背景音乐循环
    this.musicGain = ctx.createGain();
    this.musicGain.gain.setValueAtTime(musicVolume * 0.1, ctx.currentTime);
    this.musicGain.connect(ctx.destination);

    // 使用简单的低音作为背景
    this.playMusicLoop(ctx);
    this.isMusicPlaying = true;
  }

  // 背景音乐循环
  private playMusicLoop(ctx: AudioContext): void {
    if (!this.musicGain || !this.isMusicPlaying) return;

    const notes = [130.81, 164.81, 196.00, 164.81]; // C3, E3, G3, E3
    const now = ctx.currentTime;
    const noteDuration = 0.5;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * noteDuration);
      
      gain.gain.setValueAtTime(0, now + i * noteDuration);
      gain.gain.linearRampToValueAtTime(0.5, now + i * noteDuration + 0.05);
      gain.gain.setValueAtTime(0.5, now + i * noteDuration + noteDuration - 0.1);
      gain.gain.linearRampToValueAtTime(0, now + i * noteDuration + noteDuration);
      
      osc.connect(gain);
      gain.connect(this.musicGain!);
      
      osc.start(now + i * noteDuration);
      osc.stop(now + i * noteDuration + noteDuration);
    });

    // 安排下一次循环
    setTimeout(() => {
      if (this.isMusicPlaying) {
        this.playMusicLoop(ctx);
      }
    }, notes.length * noteDuration * 1000);
  }

  // 停止背景音乐
  stopMusic(): void {
    if (!this.isMusicPlaying) return;

    this.isMusicPlaying = false;
    
    if (this.musicGain) {
      this.musicGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.5);
      setTimeout(() => {
        this.musicGain = null;
        this.musicOscillator = null;
      }, 500);
    }
  }

  // 更新音乐音量
  updateMusicVolume(volume: number): void {
    if (this.musicGain && this.audioContext) {
      this.musicGain.gain.setValueAtTime(volume * 0.1, this.audioContext.currentTime);
    }
  }

  // 切换音乐
  toggleMusic(enabled: boolean): void {
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }
}

// 创建单例实例
export const audioManager = new AudioManager();

// 导出默认实例
export default audioManager;
