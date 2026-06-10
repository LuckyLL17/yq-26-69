import { useSettingsStore } from './settingsStore';

export type SoundType =
  | 'build'
  | 'upgrade'
  | 'sell'
  | 'attack'
  | 'enemy_death'
  | 'card_play'
  | 'wave_start'
  | 'game_over'
  | 'victory'
  | 'click'
  | 'freeze'
  | 'explosion'
  | 'heal'
  | 'gold'
  | 'warning'
  | 'lightning'
  | 'meteor';

class AudioManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private soundGain: GainNode | null = null;
  private musicOscillators: OscillatorNode[] = [];
  private isMusicPlaying = false;

  private getContext(): AudioContext | null {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
        this.soundGain = this.ctx.createGain();
        this.soundGain.connect(this.ctx.destination);
        this.musicGain = this.ctx.createGain();
        this.musicGain.connect(this.ctx.destination);
        this.updateVolumes();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  updateVolumes() {
    const settings = useSettingsStore.getState();
    if (this.soundGain) {
      this.soundGain.gain.value = settings.soundEnabled ? settings.soundVolume : 0;
    }
    if (this.musicGain) {
      this.musicGain.gain.value = settings.musicEnabled ? settings.musicVolume * 0.3 : 0;
    }
  }

  playSound(type: SoundType) {
    const ctx = this.getContext();
    if (!ctx || !this.soundGain) return;

    const settings = useSettingsStore.getState();
    if (!settings.soundEnabled) return;

    const now = ctx.currentTime;

    switch (type) {
      case 'build':
        this.playBuildSound(ctx, now);
        break;
      case 'upgrade':
        this.playUpgradeSound(ctx, now);
        break;
      case 'sell':
        this.playSellSound(ctx, now);
        break;
      case 'attack':
        this.playAttackSound(ctx, now);
        break;
      case 'enemy_death':
        this.playEnemyDeathSound(ctx, now);
        break;
      case 'card_play':
        this.playCardSound(ctx, now);
        break;
      case 'wave_start':
        this.playWaveStartSound(ctx, now);
        break;
      case 'game_over':
        this.playGameOverSound(ctx, now);
        break;
      case 'victory':
        this.playVictorySound(ctx, now);
        break;
      case 'click':
        this.playClickSound(ctx, now);
        break;
      case 'freeze':
        this.playFreezeSound(ctx, now);
        break;
      case 'explosion':
        this.playExplosionSound(ctx, now);
        break;
      case 'heal':
        this.playHealSound(ctx, now);
        break;
      case 'gold':
        this.playGoldSound(ctx, now);
        break;
      case 'warning':
        this.playWarningSound(ctx, now);
        break;
      case 'lightning':
        this.playLightningSound(ctx, now);
        break;
      case 'meteor':
        this.playMeteorSound(ctx, now);
        break;
    }
  }

  startMusic() {
    if (this.isMusicPlaying) return;
    const ctx = this.getContext();
    if (!ctx || !this.musicGain) return;

    this.isMusicPlaying = true;
    this.playAmbientLoop(ctx);
  }

  stopMusic() {
    this.isMusicPlaying = false;
    this.musicOscillators.forEach((osc) => {
      try { osc.stop(); } catch { /* ignore */ }
    });
    this.musicOscillators = [];
  }

  private playAmbientLoop(ctx: AudioContext) {
    const settings = useSettingsStore.getState();
    if (!settings.musicEnabled) {
      this.isMusicPlaying = false;
      return;
    }

    const baseFreqs = [110, 146.83, 164.81, 196];
    const now = ctx.currentTime;
    const duration = 8;

    baseFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;

      gain.gain.value = 0;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 2);
      gain.gain.setValueAtTime(0.08, now + duration - 2);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 1.01, now + duration / 2);
      osc.frequency.linearRampToValueAtTime(freq, now + duration);

      osc.connect(gain);
      gain.connect(this.musicGain!);

      osc.start(now);
      osc.stop(now + duration);
      this.musicOscillators.push(osc);
    });

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2;
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain);
    lfo.start(now);
    lfo.stop(now + duration);
    this.musicOscillators.push(lfo);

    setTimeout(() => {
      this.musicOscillators = this.musicOscillators.filter(
        (o) => o !== lfo
      );
      if (this.isMusicPlaying) {
        this.playAmbientLoop(ctx);
      }
    }, duration * 1000);
  }

  private createOsc(ctx: AudioContext, type: OscillatorType, freq: number, startTime: number, duration: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.connect(gain);
    gain.connect(this.soundGain!);
    osc.start(startTime);
    osc.stop(startTime + duration);
    return { osc, gain };
  }

  private playBuildSound(ctx: AudioContext, now: number) {
    this.createOsc(ctx, 'square', 200, now, 0.1);
    this.createOsc(ctx, 'square', 300, now + 0.05, 0.08);
  }

  private playUpgradeSound(ctx: AudioContext, now: number) {
    this.createOsc(ctx, 'sine', 400, now, 0.15);
    this.createOsc(ctx, 'sine', 600, now + 0.1, 0.15);
    this.createOsc(ctx, 'sine', 800, now + 0.2, 0.2);
  }

  private playSellSound(ctx: AudioContext, now: number) {
    this.createOsc(ctx, 'sine', 600, now, 0.1);
    this.createOsc(ctx, 'sine', 400, now + 0.08, 0.1);
    this.createOsc(ctx, 'sine', 300, now + 0.16, 0.15);
  }

  private playAttackSound(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.soundGain!);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  private playEnemyDeathSound(ctx: AudioContext, now: number) {
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.soundGain!);
    noise.start(now);
    noise.stop(now + 0.15);
  }

  private playCardSound(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(this.soundGain!);
    osc.start(now);
    osc.stop(now + 0.2);

    this.createOsc(ctx, 'triangle', 800, now + 0.05, 0.15);
  }

  private playWaveStartSound(ctx: AudioContext, now: number) {
    this.createOsc(ctx, 'square', 220, now, 0.2);
    this.createOsc(ctx, 'square', 330, now + 0.15, 0.2);
    this.createOsc(ctx, 'square', 440, now + 0.3, 0.3);
  }

  private playGameOverSound(ctx: AudioContext, now: number) {
    this.createOsc(ctx, 'sine', 400, now, 0.3);
    this.createOsc(ctx, 'sine', 300, now + 0.25, 0.3);
    this.createOsc(ctx, 'sine', 200, now + 0.5, 0.5);
    this.createOsc(ctx, 'sine', 150, now + 0.75, 0.6);
  }

  private playVictorySound(ctx: AudioContext, now: number) {
    this.createOsc(ctx, 'sine', 523, now, 0.2);
    this.createOsc(ctx, 'sine', 659, now + 0.15, 0.2);
    this.createOsc(ctx, 'sine', 784, now + 0.3, 0.2);
    this.createOsc(ctx, 'sine', 1047, now + 0.45, 0.4);
  }

  private playClickSound(ctx: AudioContext, now: number) {
    this.createOsc(ctx, 'sine', 600, now, 0.05);
  }

  private playFreezeSound(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1500, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.3);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.soundGain!);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  private playExplosionSound(ctx: AudioContext, now: number) {
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.soundGain!);
    noise.start(now);
    noise.stop(now + 0.3);

    this.createOsc(ctx, 'sine', 100, now, 0.2);
  }

  private playHealSound(ctx: AudioContext, now: number) {
    this.createOsc(ctx, 'sine', 400, now, 0.15);
    this.createOsc(ctx, 'sine', 500, now + 0.1, 0.15);
    this.createOsc(ctx, 'sine', 600, now + 0.2, 0.2);
    this.createOsc(ctx, 'triangle', 800, now + 0.15, 0.25);
  }

  private playGoldSound(ctx: AudioContext, now: number) {
    this.createOsc(ctx, 'triangle', 800, now, 0.1);
    this.createOsc(ctx, 'triangle', 1000, now + 0.08, 0.1);
    this.createOsc(ctx, 'triangle', 1200, now + 0.16, 0.15);
  }

  private playWarningSound(ctx: AudioContext, now: number) {
    this.createOsc(ctx, 'square', 440, now, 0.15);
    this.createOsc(ctx, 'square', 440, now + 0.2, 0.15);
  }

  private playLightningSound(ctx: AudioContext, now: number) {
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    noise.connect(gain);
    gain.connect(this.soundGain!);
    noise.start(now);
    noise.stop(now + 0.15);

    this.createOsc(ctx, 'sawtooth', 1000, now, 0.1);
    this.createOsc(ctx, 'sine', 2000, now + 0.02, 0.08);
  }

  private playMeteorSound(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2000, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc.connect(gain);
    gain.connect(this.soundGain!);
    osc.start(now);
    osc.stop(now + 0.6);

    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.3, now + 0.3);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.soundGain!);
    noise.start(now + 0.2);
    noise.stop(now + 0.6);
  }
}

export const audioManager = new AudioManager();
