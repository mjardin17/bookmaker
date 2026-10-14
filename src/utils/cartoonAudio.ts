/**
 * Cartoon Sound & Audio Synthesizer Engine
 * Uses Web Audio API for zero-latency, realistic cartoon SFX and procedural soundtrack loops,
 * plus Web Speech API for expressive cartoon character voices.
 */

// Singleton AudioContext with lazy resume
let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export type SFXType = 
  | 'boing' 
  | 'magic-sparkle' 
  | 'clockwork-whir' 
  | 'whoosh' 
  | 'pop' 
  | 'fanfare' 
  | 'ticking' 
  | 'giggle-slide';

/**
 * Play procedural cartoon sound effects using oscillators and filters
 */
export function playCartoonSFX(sfxType: SFXType, customCtx?: AudioContext) {
  try {
    const ctx = customCtx || getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (sfxType) {
      case 'boing': {
        // Classic cartoon spring boing: rapidly descending & ascending pitch modulation
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.55);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.7);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
      }

      case 'magic-sparkle': {
        // High frequency shimmering arpeggio
        const notes = [659.25, 830.61, 987.77, 1318.51, 1661.22, 1975.53, 2637.02];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);

          gain.gain.setValueAtTime(0.2, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.3);
        });
        break;
      }

      case 'clockwork-whir': {
        // Multiple rapid clicking ticks with ascending pitch
        for (let i = 0; i < 12; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(300 + i * 40, now + i * 0.04);

          gain.gain.setValueAtTime(0.18, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.04 + 0.03);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.035);
        }
        break;
      }

      case 'whoosh': {
        // Filtered noise sweep
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 0.2);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.4);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + 0.45);
        break;
      }

      case 'pop': {
        // Cartoon bubble cork pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }

      case 'fanfare': {
        // Brass cartoon fanfare chord (Root, Major Third, Fifth, Octave)
        const chord = [392.00, 493.88, 587.33, 783.99]; // G Major
        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.95);
        });
        break;
      }

      case 'ticking': {
        // Mechanical clock tick
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case 'giggle-slide': {
        // Playful cartoon pitch bent whistle
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(950, now + 0.15);
        osc.frequency.linearRampToValueAtTime(700, now + 0.3);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.5);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }
    }
  } catch (err) {
    console.warn('Could not play cartoon SFX:', err);
  }
}

/**
 * Procedural Cartoon Background Music Loop
 * Generates an upbeat, charming cartoon loop so video playback has authentic cartoon soundtrack
 */
export function startCartoonBGM(bgmName: string, customCtx?: AudioContext) {
  const ctx = customCtx || getAudioContext();
  let isPlaying = true;
  let intervalId: any = null;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
  masterGain.connect(ctx.destination);

  // Playful upbeat chord progressions in C major / G major
  const chords = [
    [261.63, 329.63, 392.00], // C
    [293.66, 369.99, 440.00], // Dm
    [329.63, 392.00, 493.88], // Em
    [349.23, 440.00, 523.25], // F
  ];

  let chordIndex = 0;

  function playBar() {
    if (!isPlaying) return;
    const now = ctx.currentTime;
    const currentChord = chords[chordIndex % chords.length];
    chordIndex++;

    // Play bouncy arpeggio
    currentChord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * 1.5, now + i * 0.15);

      noteGain.gain.setValueAtTime(0.15, now + i * 0.15);
      noteGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.2);

      osc.connect(noteGain);
      noteGain.connect(masterGain);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.22);
    });

    // Bouncy bass root
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(currentChord[0] * 0.5, now);
    bassGain.gain.setValueAtTime(0.25, now);
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    bassOsc.connect(bassGain);
    bassGain.connect(masterGain);
    bassOsc.start(now);
    bassOsc.stop(now + 0.45);
  }

  // Play immediately and loop every 800ms
  playBar();
  intervalId = setInterval(playBar, 800);

  return {
    stop: () => {
      isPlaying = false;
      if (intervalId) clearInterval(intervalId);
      try {
        masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        setTimeout(() => masterGain.disconnect(), 250);
      } catch (e) {}
    },
    setVolume: (v: number) => {
      try {
        masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, v)) * 0.15, ctx.currentTime);
      } catch (e) {}
    }
  };
}

/**
 * Expressive Cartoon Dialogue Voice Synthesis via Web Speech API
 */
export function speakCartoonDialogue(
  text: string, 
  voicePitch = 1.2, 
  voiceRate = 1.05
): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = Math.max(0.5, Math.min(2.0, voicePitch));
    utterance.rate = Math.max(0.5, Math.min(2.0, voiceRate));

    // Try finding an expressive English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Alex'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}
