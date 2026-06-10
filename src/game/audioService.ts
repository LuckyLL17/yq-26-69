/**
 * AudioService
 * 单一职责：使用 Web Audio API 程序化生成音效与背景音乐，
 * 并对外提供统一的播放/控制接口。
 * 真实音量、开关由外部设置驱动（通过 setSoundEnabled / setMusicEnabled / set*Volume）。
 */

// 支持的游戏音效类型
export type SoundType =
  | 'click'        // 点击 / 按钮
  | 'build'        // 建造防御塔
  | 'upgrade'      // 升级
  | 'sell'         // 出售
  | 'shoot'        // 射击
  | 'explosion'    // 爆炸
  | 'kill'         // 击杀
  | 'card'         // 使用卡牌
  | 'wave_start'   // 波次开始
  | 'win'          // 胜利
  | 'lose'         // 失败
  | 'gold'         // 获得金币
  | 'heal';        // 治疗

interface SoundDef {
  // 起始频率（Hz）
  freq: number;
  // 终止频率（用于扫频，可选）
  endFreq?: number;
  // 持续时长（秒）
  duration: number;
  // 振荡器类型
  type: OscillatorType;
  // 基础音量（0~1，最终会乘以 soundVolume）
  volume: number;
}

// 各类音效的合成参数表（程序化合成，无需音频资源）
const SOUND_PRESETS: Record<SoundType, SoundDef> = {
  click:      { freq: 600,  endFreq: 800,  duration: 0.05, type: 'square',   volume: 0.15 },
  build:      { freq: 220,  endFreq: 440,  duration: 0.18, type: 'triangle', volume: 0.25 },
  upgrade:    { freq: 440,  endFreq: 880,  duration: 0.25, type: 'triangle', volume: 0.3  },
  sell:      { freq: 660,  endFreq: 220,  duration: 0.18, type: 'triangle', volume: 0.2  },
  shoot:      { freq: 900,  endFreq: 600,  duration: 0.06, type: 'square',   volume: 0.1  },
  explosion:  { freq: 120,  endFreq: 40,   duration: 0.35, type: 'sawtooth', volume: 0.35 },
  kill:       { freq: 300,  endFreq: 100,  duration: 0.15, type: 'sawtooth', volume: 0.2  },
  card:       { freq: 520,  endFreq: 1040, duration: 0.2,  type: 'sine',     volume: 0.25 },
  wave_start: { freq: 200,  endFreq: 600,  duration: 0.4,  type: 'sawtooth', volume: 0.35 },
  win:        { freq: 523,  endFreq: 1046, duration: 0.6,  type: 'triangle', volume: 0.4  },
  lose:       { freq: 400,  endFreq: 80,   duration: 0.7,  type: 'sawtooth', volume: 0.4  },
  gold:       { freq: 1200, endFreq: 1800, duration: 0.12, type: 'sine',     volume: 0.2  },
  heal:       { freq: 660,  endFreq: 990,  duration: 0.25, type: 'sine',     volume: 0.25 },
};

// 简单的 8 音符循环旋律，用于背景音乐
const MUSIC_NOTES: number[] = [262, 330, 392, 523, 392, 330, 294, 247];
const MUSIC_NOTE_DURATION = 0.45;

class AudioService {
  private ctx: AudioContext | null = null;
  // 音效输出端
  private soundGain: GainNode | null = null;
  // 音乐输出端
  private musicGain: GainNode | null = null;

  // 当前设置（由外部调用 setXxx 同步）
  private soundEnabled = true;
  private musicEnabled = true;
  private soundVolume = 0.7;
  private musicVolume = 0.5;

  // 背景音乐调度器
  private musicTimer: number | null = null;
  private musicNoteIndex = 0;

  /**
   * 懒加载 AudioContext。
   * 浏览器要求用户交互后才能 resume，因此首次播放时再创建。
   */
  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.soundGain = this.ctx.createGain();
      this.soundGain.gain.value = this.soundVolume;
      this.soundGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('AudioContext init failed:', e);
      this.ctx = null;
    }
    return this.ctx;
  }

  /** 同步音效开关 */
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  /** 同步音乐开关：开启时启动循环；关闭时停止 */
  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  /** 同步音效音量（实时生效） */
  setSoundVolume(volume: number): void {
    this.soundVolume = Math.max(0, Math.min(1, volume));
    if (this.soundGain) {
      this.soundGain.gain.value = this.soundVolume;
    }
  }

  /** 同步音乐音量（实时生效） */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain) {
      this.musicGain.gain.value = this.musicVolume;
    }
  }

  /**
   * 播放一个音效。
   * 当音效关闭、音量为 0 或 AudioContext 不可用时直接忽略。
   */
  play(type: SoundType): void {
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.soundGain) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => undefined);
    }

    const preset = SOUND_PRESETS[type];
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = preset.type;
    osc.frequency.setValueAtTime(preset.freq, now);
    if (preset.endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(1, preset.endFreq),
        now + preset.duration
      );
    }

    // ADSR 简化包络：快起 + 指数衰减
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(preset.volume, now + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration);

    osc.connect(env);
    env.connect(this.soundGain);

    osc.start(now);
    osc.stop(now + preset.duration + 0.02);
  }

  /**
   * 启动背景音乐循环（程序化播放音符序列）。
   * 已在播放则直接返回，避免重复调度。
   */
  startMusic(): void {
    if (!this.musicEnabled) return;
    if (this.musicTimer !== null) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.musicGain) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => undefined);
    }

    const playNextNote = () => {
      if (!this.musicEnabled || !this.ctx || !this.musicGain) {
        this.stopMusic();
        return;
      }
      this.playMusicNote(MUSIC_NOTES[this.musicNoteIndex % MUSIC_NOTES.length]);
      this.musicNoteIndex++;
      this.musicTimer = window.setTimeout(playNextNote, MUSIC_NOTE_DURATION * 1000);
    };
    playNextNote();
  }

  /** 停止背景音乐循环 */
  stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  /** 播放一个音乐音符 */
  private playMusicNote(freq: number): void {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.3, now + 0.05);
    env.gain.exponentialRampToValueAtTime(0.0001, now + MUSIC_NOTE_DURATION);

    osc.connect(env);
    env.connect(this.musicGain);
    osc.start(now);
    osc.stop(now + MUSIC_NOTE_DURATION + 0.02);
  }
}

// 单例：全局唯一的音频服务
export const audioService = new AudioService();
