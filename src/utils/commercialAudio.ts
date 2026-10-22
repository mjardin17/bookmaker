/**
 * BossLister Commercial Audio Synthesizer
 * Procedural Web Audio API sound effects, high-energy commercial music loops,
 * and text-to-speech voiceover teleprompter.
 */

let commercialAudioCtx: AudioContext | null = null;

export function getCommercialAudioContext(): AudioContext {
  if (!commercialAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    commercialAudioCtx = new AudioContextClass();
  }
  if (commercialAudioCtx.state === 'suspended') {
    commercialAudioCtx.resume().catch(() => {});
  }
  return commercialAudioCtx;
}

export type CommercialSFX = 
  | 'whoosh' 
  | 'pop' 
  | 'cha-ching' 
  | 'ticking' 
  | 'fanfare' 
  | 'glockenspiel-reveal'
  | 'laser-hit';

/**
 * Play zero-latency procedural commercial sound effects
 */
export function playCommercialSFX(sfxType: CommercialSFX, customCtx?: AudioContext) {
  try {
    const ctx = customCtx || getCommercialAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    switch (sfxType) {
      case 'whoosh': {
        // Fast sweep white noise + filter sweep
        const bufferSize = ctx.sampleRate * 0.25;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.12);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.25);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        whiteNoise.start(now);
        whiteNoise.stop(now + 0.28);
        break;
      }

      case 'pop': {
        // Crisp bubble / checkmark pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }

      case 'cha-ching': {
        // Classic cash register bell chime + coins
        const chimeNotes = [987.77, 1318.51, 1975.53]; // B5, E6, B6
        chimeNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);

          gain.gain.setValueAtTime(0.3, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.55);
        });
        break;
      }

      case 'ticking': {
        // Crisp clockwork woodblock tick
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }

      case 'fanfare': {
        // Victorious major triad fanfare (C5, E5, G5, C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          gain.gain.setValueAtTime(0.18, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.45);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(2400, now);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.5);
        });
        break;
      }

      case 'glockenspiel-reveal': {
        // High sparkling bell chime
        const notes = [1318.51, 1567.98, 2093.00, 2637.02];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);

          gain.gain.setValueAtTime(0.25, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.45);
        });
        break;
      }

      case 'laser-hit': {
        // Electro tech punch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }
    }
  } catch (e) {
    console.warn('Commercial SFX playback failed:', e);
  }
}

/**
 * Start procedural rhythmic commercial backing track
 */
export function startCommercialBGM(genre: 'upbeat-electro' | 'lofi-chill' | 'cinematic-epic' | 'ambient-tech') {
  try {
    const ctx = getCommercialAudioContext();
    if (!ctx) return { stop: () => {}, setVolume: () => {} };

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
    masterGain.connect(ctx.destination);

    let isRunning = true;
    let step = 0;
    const bpm = genre === 'upbeat-electro' ? 128 : genre === 'lofi-chill' ? 84 : 110;
    const intervalMs = (60 / bpm / 2) * 1000; // eighth notes

    // Bassline chord progression notes
    const bassline = genre === 'upbeat-electro' 
      ? [110, 110, 130.81, 146.83, 164.81, 146.83, 130.81, 110]
      : [130.81, 130.81, 164.81, 174.61, 196.00, 174.61, 164.81, 130.81];

    const timer = setInterval(() => {
      if (!isRunning) return;
      const now = ctx.currentTime;

      // 1. Kick on beat 0 and 4
      if (step % 4 === 0) {
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.frequency.setValueAtTime(140, now);
        kickOsc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

        kickGain.gain.setValueAtTime(0.35, now);
        kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

        kickOsc.connect(kickGain);
        kickGain.connect(masterGain);
        kickOsc.start(now);
        kickOsc.stop(now + 0.1);
      }

      // 2. Snare / Clack on beat 2 and 6
      if (step % 4 === 2) {
        const snareOsc = ctx.createOscillator();
        const snareGain = ctx.createGain();
        snareOsc.type = 'triangle';
        snareOsc.frequency.setValueAtTime(220, now);
        snareOsc.frequency.exponentialRampToValueAtTime(90, now + 0.06);

        snareGain.gain.setValueAtTime(0.2, now);
        snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        snareOsc.connect(snareGain);
        snareGain.connect(masterGain);
        snareOsc.start(now);
        snareOsc.stop(now + 0.09);
      }

      // 3. Hi-hat on every step
      const hatOsc = ctx.createOscillator();
      const hatGain = ctx.createGain();
      hatOsc.type = 'triangle';
      hatOsc.frequency.setValueAtTime(6000, now);
      hatGain.gain.setValueAtTime(step % 2 === 1 ? 0.06 : 0.02, now);
      hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      hatOsc.connect(hatGain);
      hatGain.connect(masterGain);
      hatOsc.start(now);
      hatOsc.stop(now + 0.035);

      // 4. Bass synth note
      const bassFreq = bassline[step % bassline.length];
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(genre === 'lofi-chill' ? 350 : 800, now);

      bassGain.gain.setValueAtTime(0.08, now);
      bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(masterGain);
      bassOsc.start(now);
      bassOsc.stop(now + 0.14);

      step++;
    }, intervalMs);

    return {
      stop: () => {
        isRunning = false;
        clearInterval(timer);
        masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      },
      setVolume: (v: number) => {
        masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, v)), ctx.currentTime);
      }
    };
  } catch (e) {
    console.warn('Commercial BGM start failed:', e);
    return { stop: () => {}, setVolume: () => {} };
  }
}

/**
 * Speech synthesis for voiceover teleprompter
 */
export function speakCommercialVoiceover(text: string, tone: string = 'energetic-ugc'): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);

  if (tone === 'energetic-ugc' || tone === 'hyped-asmr') {
    utterance.rate = 1.15;
    utterance.pitch = 1.1;
  } else if (tone === 'cinematic-luxury') {
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
  } else {
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
  }

  // Prefer English natural voices if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.speak(utterance);
  return utterance;
}
