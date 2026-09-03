// Web Audio API Ambient Sound Generator and Timer Notification Synth

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private isPlayingAmbient: boolean = false;
  private currentAmbientType: string = 'none';

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a pleasant completion chime chime bell
  public playCompletionChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);

        gain.gain.setValueAtTime(0.001, now + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.2, now + index * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 1.3);
      });
    } catch (e) {
      console.warn('Audio playback not permitted yet:', e);
    }
  }

  // Synthesize ambient sounds using pink/white noise filters
  public setAmbientSound(type: 'none' | 'rain' | 'white-noise' | 'forest' | 'waves', volume: number = 0.15) {
    this.stopAmbient();
    if (type === 'none') return;

    try {
      this.initCtx();
      if (!this.ctx) return;

      this.currentAmbientType = type;
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate White / Pink Noise
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain' || type === 'forest') {
          // Pink noise filter approximation
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11;
          b6 = white * 0.115926;
        } else {
          output[i] = white * 0.1;
        }
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      } else if (type === 'forest') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.5, this.ctx.currentTime);
      } else if (type === 'waves') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);
        // LFO for wave modulation
        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // Wave swell rate
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(300, this.ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
      } else {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2500, this.ctx.currentTime);
      }

      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      whiteNoise.start();
      this.ambientSource = whiteNoise;
      this.ambientGain = gainNode;
      this.isPlayingAmbient = true;
    } catch (e) {
      console.warn('Could not start ambient audio engine:', e);
    }
  }

  public stopAmbient() {
    if (this.ambientSource) {
      try {
        (this.ambientSource as AudioBufferSourceNode).stop();
        this.ambientSource.disconnect();
      } catch {}
      this.ambientSource = null;
    }
    this.isPlayingAmbient = false;
    this.currentAmbientType = 'none';
  }

  public isAmbientPlaying() {
    return this.isPlayingAmbient;
  }

  public getCurrentAmbientType() {
    return this.currentAmbientType;
  }
}

export const soundEngine = new SoundEngine();
