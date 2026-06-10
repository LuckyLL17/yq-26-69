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
    setTimeout(() => this.playTone(554.37, 0.1,