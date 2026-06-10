import { useSettingsStore } from './settingsStore';

// 音频管理器 - 单一职责：统一管理所有音效和背景音乐播放
// 使用Web Audio API生成简单合成音效，无需外部音频文件

class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private soundGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicOscillators: OscillatorNode[] = [];
  private isInitialized = false;
  private settingsUnsubscribe: (() => void) | null = null;

  constructor() {
    this.initializeAudio = this.initializeAudio.bind(this);
    this.handleSettingsChange = this.handleSettingsChange.bind(this);
  }

  // 初始化音频上下文（需要用户交互后才能调用）
  public initializeAudio(): void {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 主音量节点
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 1;

      // 音效音量节点
      this.soundGain = this.audioContext.createGain();
      this.soundGain.connect(this.masterGain);

      // 音乐音量节点
      this.musicGain = this.audioContext.createGain();
      this.musicGain.connect(this.masterGain);

      this.isInitialized = true;

      // 订阅设置变化，自动应用音量/开关设置
      this.settingsUnsubscribe = useSettingsStore.subscribe(this.handleSettingsChange);
      
      // 立即应用当前设置
      const currentSettings = useSettingsStore.getState();
      this.handleSettingsChange(currentSettings);

      this.playMusic();
    } catch (e) {
      console.warn('Audio not supported:', e);
    }
  }

  // 处理设置变化 - 自动应用音频设置
  private handleSettingsChange(settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    soundVolume: number;
    musicVolume: number;
  }): void {
    if (!this.isInitialized || !this.soundGain || !this.musicGain) return;

    // 应用音效设置
    this.soundGain.gain.value = settings.soundEnabled ? settings.soundVolume : 0;
    
    // 应用音乐设置
    this.musicGain.gain.value = settings.musicEnabled ? settings.musicVolume : 0;
  }

  // 播放简单合成音效
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3,
    useMusicNode: boolean = false
  ): void {
    if (!this.isInitialized || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(useMusicNode ? this.musicGain! : this.soundGain!);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // 播放简单背景音乐（循环合成旋律）
  private playMusic(): void {
    if (!this.isInitialized || !this.audioContext || !this.musicGain) return;

    // 停止之前的音乐
    this.stopMusic();

    // 简单的游戏背景音乐循环音符
    const notes = [261.63, 329.63, 392.00, 329.63, 261.63, 329.63, 392.00, 523.25]; // C4, E4, G4...
    let noteIndex = 0;
    const noteDuration = 0.5;

    const playNextNote = () => {
      if (!this.isInitialized || !this.audioContext || this.musicGain!.gain.value === 0) {
        // 静音时不播放但继续调度
        this.musicOscillators.forEach(osc => {
          try { osc.stop(); } catch(e) {}
        });
        this.musicOscillators = [];
        setTimeout(playNextNote, noteDuration * 1000);
        return;
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(notes[noteIndex], this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + noteDuration - 0.05);

      oscillator.connect(gainNode);
      gainNode.connect(this.musicGain!);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + noteDuration);
      this.musicOscillators.push(oscillator);

      // 清理已停止的oscillator
      setTimeout(() => {
        const idx = this.musicOscillators.indexOf(oscillator);
        if (idx > -1) this.musicOscillators.splice(idx, 1);
      }, noteDuration * 1000);

      noteIndex = (noteIndex + 1) % notes.length;
      setTimeout(playNextNote, noteDuration * 1000);
    };

    playNextNote();
  }

  // 停止音乐
  private stopMusic(): void {
    this.musicOscillators.forEach(osc => {
      try { osc.stop(); } catch(e) {}
    });
    this.musicOscillators = [];
  }

  // 建造塔音效
  public playBuild(): void {
    this.initializeAudio();
    this.playTone(440, 0.1, 'sine', 0.3);
    setTimeout(() => this.playTone(554.37, 0.1, 'sine', 0.3), 50);
    setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.3), 100);
  }

  // 升级塔音效
  public playUpgrade(): void {
    this.initializeAudio();
    this.playTone(523.25, 0.1, 'sine', 0.3);
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.3), 80);
    setTimeout(() => this.playTone(783.99, 0.2, 'sine', 0.3), 160);
  }

  // 射击音效
  public playShoot(): void {
    this.initializeAudio();
    this.playTone(880, 0.05, 'square', 0.1);
  }

  // 爆炸音效
  public playExplosion(): void {
    this.initializeAudio();
    if (!this.isInitialized || !this.audioContext || !this.soundGain) return;
    
    const bufferSize = this.audioContext.sampleRate * 0.2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }

    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = buffer;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0.4;

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.soundGain);

    noiseSource.start();
  }

  // 击杀音效
  public playKill(): void {
    this.initializeAudio();
    this.playTone(300, 0.1, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(200, 0.15, 'sawtooth', 0.2), 50);
  }

  // 获得金币音效
  public playCoin(): void {
    this.initializeAudio();
    this.playTone(987.77, 0.08, 'sine', 0.2);
    setTimeout(() => this.playTone(1318.51, 0.1, 'sine', 0.2), 60);
  }

  // 受伤害音效
  public playDamage(): void {
    this.initializeAudio();
    this.playTone(150, 0.2, 'sawtooth', 0.25);
  }

  // 卡牌抽牌音效
  public playCardDraw(): void {
    this.initializeAudio();
    this.playTone(600, 0.08, 'triangle', 0.2);
    setTimeout(() => this.playTone(800, 0.08, 'triangle', 0.2), 40);
  }

  // 卡牌使用音效
  public playCardUse(): void {
    this.initializeAudio();
    this.playTone(523.25, 0.1, 'sine', 0.25);
    setTimeout(() => this.playTone(783.99, 0.15, 'sine', 0.25), 80);
  }

  // 波次开始音效
  public playWaveStart(): void {
    this.initializeAudio();
    this.playTone(392, 0.15, 'sine', 0.3);
    setTimeout(() => this.playTone(523.25, 0.15, 'sine', 0.3), 100);
    setTimeout(() => this.playTone(659.25, 0.2, 'sine', 0.3), 200);
  }

  // 胜利音效
  public playVictory(): void {
    this.initializeAudio();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.3), i * 120);
    });
  }

  // 失败音效
  public playDefeat(): void {
    this.initializeAudio();
    const notes = [392, 349.23, 311.13, 261.63];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sawtooth', 0.25), i * 150);
    });
  }

  // 按钮点击音效
  public playClick(): void {
    this.initializeAudio();
    this.playTone(800, 0.05, 'sine', 0.15);
  }

  // 销毁
  public destroy(): void {
    if (this.settingsUnsubscribe) {
      this.settingsUnsubscribe();
      this.settingsUnsubscribe = null;
    }
    this.stopMusic();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isInitialized = false;
  }
}

// 单例导出
export const audioManager = new AudioManager();
