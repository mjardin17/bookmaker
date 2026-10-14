import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CartoonEpisode, CartoonScene, CartoonStyle } from '../types/storyforge';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, 
  Download, Film, Sparkles, Wand2, SkipForward, SkipBack,
  Sliders, Music, Check, Loader2, Video
} from 'lucide-react';
import { playCartoonSFX, startCartoonBGM, speakCartoonDialogue, getAudioContext } from '../utils/cartoonAudio';

interface CartoonPlayerProps {
  episode: CartoonEpisode;
  onSceneChange?: (sceneIndex: number) => void;
  activeSceneIndex?: number;
}

export const CartoonPlayer: React.FC<CartoonPlayerProps> = ({
  episode,
  onSceneChange,
  activeSceneIndex: controlledSceneIndex
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [soundtrackEnabled, setSoundtrackEnabled] = useState(true);
  const [voiceoversEnabled, setVoiceoversEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Recording & Export state
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Active scene calculation
  const totalDuration = episode.scenes.reduce((acc, s) => acc + s.duration, 0) || episode.totalDuration || 28;

  // Compute scene time offsets
  const sceneOffsets = episode.scenes.map((scene, idx) => {
    const start = episode.scenes.slice(0, idx).reduce((acc, s) => acc + s.duration, 0);
    return {
      index: idx,
      scene,
      start,
      end: start + scene.duration
    };
  });

  const currentSceneOffset = sceneOffsets.find(
    (s) => currentTime >= s.start && currentTime < s.end
  ) || sceneOffsets[sceneOffsets.length - 1] || { index: 0, scene: episode.scenes[0], start: 0, end: 7 };

  const currentScene = currentSceneOffset.scene;
  const currentSceneIndex = currentSceneOffset.index;
  const sceneLocalTime = Math.max(0, currentTime - currentSceneOffset.start);

  // Sync scene change with parent if provided
  useEffect(() => {
    if (onSceneChange) {
      onSceneChange(currentSceneIndex);
    }
  }, [currentSceneIndex, onSceneChange]);

  // Jump to controlled scene when requested by parent
  useEffect(() => {
    if (controlledSceneIndex !== undefined && controlledSceneIndex !== currentSceneIndex) {
      const target = sceneOffsets[controlledSceneIndex];
      if (target) {
        setCurrentTime(target.start);
      }
    }
  }, [controlledSceneIndex]);

  // Track SFX played to avoid repeat triggers
  const playedSfxRef = useRef<Set<string>>(new Set());
  const spokenDialogueRef = useRef<Set<string>>(new Set());
  const bgmRef = useRef<{ stop: () => void; setVolume: (v: number) => void } | null>(null);

  // BGM control
  useEffect(() => {
    if (isPlaying && soundtrackEnabled && !isMuted) {
      if (!bgmRef.current) {
        bgmRef.current = startCartoonBGM(episode.bgmTrack);
      }
    } else {
      if (bgmRef.current) {
        bgmRef.current.stop();
        bgmRef.current = null;
      }
    }

    return () => {
      if (bgmRef.current) {
        bgmRef.current.stop();
        bgmRef.current = null;
      }
    };
  }, [isPlaying, soundtrackEnabled, isMuted, episode.bgmTrack]);

  // Reset played SFX tracker on seek or rewind
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    playedSfxRef.current.clear();
    spokenDialogueRef.current.clear();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Main Animation & Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTimestamp: number | null = null;

    // Canvas internal logical dimensions
    const isVertical = episode.aspectRatio === '9:16';
    const isSquare = episode.aspectRatio === '1:1';
    const W = isVertical ? 720 : (isSquare ? 1080 : 1280);
    const H = isVertical ? 1280 : (isSquare ? 1080 : 720);

    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
    }

    const render = (timestamp: number) => {
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const deltaTime = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      // Update current time if playing
      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + deltaTime * playbackSpeed;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return next;
        });
      }

      // Check for Sound Effects to trigger at currentTime
      if (isPlaying && !isMuted && currentScene?.soundEffects) {
        currentScene.soundEffects.forEach((sfx) => {
          const globalSfxTime = currentSceneOffset.start + sfx.timestampSec;
          const sfxKey = `${currentScene.id}-${sfx.id}`;
          if (
            Math.abs(currentTime - globalSfxTime) < 0.15 &&
            !playedSfxRef.current.has(sfxKey)
          ) {
            playedSfxRef.current.add(sfxKey);
            playCartoonSFX(sfx.sfxType);
          }
        });
      }

      // Check for Dialogue Voiceovers to trigger
      if (isPlaying && voiceoversEnabled && !isMuted && currentScene?.dialogue) {
        currentScene.dialogue.forEach((d) => {
          const globalStart = currentSceneOffset.start + d.startSec;
          const dKey = `${currentScene.id}-${d.id}`;
          if (
            currentTime >= globalStart &&
            currentTime < globalStart + 0.3 &&
            !spokenDialogueRef.current.has(dKey)
          ) {
            spokenDialogueRef.current.add(dKey);
            speakCartoonDialogue(d.text, d.voicePitch, d.voiceRate);
          }
        });
      }

      // CLEAR CANVAS
      ctx.save();
      ctx.clearRect(0, 0, W, H);

      // 1. CAMERA MOTIONS (Pan, Zoom, Shake)
      const sceneProgress = Math.min(1, Math.max(0, sceneLocalTime / (currentScene.duration || 7)));
      let cameraX = 0;
      let cameraY = 0;
      let cameraScale = 1.0;

      switch (currentScene.cameraMotion) {
        case 'pan-right':
          cameraX = (sceneProgress - 0.5) * -120;
          break;
        case 'pan-left':
          cameraX = (0.5 - sceneProgress) * -120;
          break;
        case 'zoom-in':
          cameraScale = 1.0 + sceneProgress * 0.12;
          break;
        case 'zoom-out':
          cameraScale = 1.12 - sceneProgress * 0.12;
          break;
        case 'dramatic-shake':
          if (sceneProgress < 0.35) {
            cameraX = Math.sin(timestamp * 0.05) * 8;
            cameraY = Math.cos(timestamp * 0.06) * 6;
          }
          break;
        case 'tracking-shot':
          cameraX = Math.sin(sceneProgress * Math.PI) * -80;
          break;
      }

      ctx.translate(W / 2, H / 2);
      ctx.scale(cameraScale, cameraScale);
      ctx.translate(-W / 2 + cameraX, -H / 2 + cameraY);

      // 2. BACKGROUND THEME RENDERING
      drawCartoonBackground(ctx, W, H, currentScene.backgroundTheme, timestamp, sceneProgress, episode.animationStyle);

      // 3. AMBIENT PARTICLES
      drawAmbientParticles(ctx, W, H, currentScene.ambientParticles, timestamp);

      // 4. ANIMATED CHARACTERS
      const activeDialogue = currentScene.dialogue?.find(
        (d) => sceneLocalTime >= d.startSec && sceneLocalTime <= (d.startSec + d.durationSec)
      );

      currentScene.characters?.forEach((char, idx) => {
        const isSpeaking = activeDialogue && activeDialogue.speaker.toLowerCase().includes(char.characterName.toLowerCase());
        drawAnimatedCartoonCharacter(
          ctx,
          W,
          H,
          char,
          timestamp,
          sceneProgress,
          Boolean(isSpeaking),
          episode.animationStyle
        );
      });

      // 5. COMIC SPEECH BUBBLE & DIALOGUE
      if (activeDialogue) {
        drawSpeechBubble(ctx, W, H, activeDialogue, currentScene.characters, timestamp);
      }

      // RESTORE CAMERA TRANSFORM
      ctx.restore();

      // 6. CARTOON TRANSITIONS (Iris Wipe, Star Wipe, Bounce Pop, Cross Dissolve)
      drawCartoonTransition(ctx, W, H, currentScene.transition, sceneProgress, currentScene.duration);

      // 7. CINEMATIC OVERLAY (Style Tint, Film Grain, Vignette)
      drawStylePostProcessing(ctx, W, H, episode.animationStyle);

      // 8. ON-SCREEN SUBTITLES (Karaoke Highlight Bar)
      if (activeDialogue) {
        drawSubtitles(ctx, W, H, activeDialogue, sceneLocalTime);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    isPlaying,
    currentTime,
    currentScene,
    currentSceneIndex,
    currentSceneOffset,
    sceneLocalTime,
    totalDuration,
    playbackSpeed,
    isMuted,
    soundtrackEnabled,
    voiceoversEnabled,
    episode
  ]);

  // Video Recording & Export Handler
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExportingVideo(true);
    setExportProgress(10);
    setIsPlaying(false);
    handleSeek(0);

    try {
      // Capture stream from canvas at 30 fps
      const stream = canvas.captureStream(30);

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4000000 // 4 Mbps high quality
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setIsExportingVideo(false);
        setExportProgress(100);

        // Auto trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${episode.title.replace(/[^a-zA-Z0-9]/g, '_')}_1080p.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      mediaRecorder.start();
      setIsPlaying(true);

      // Monitor recording progress
      const interval = setInterval(() => {
        setCurrentTime((t) => {
          const prog = Math.min(98, Math.round((t / totalDuration) * 100));
          setExportProgress(prog);
          if (t >= totalDuration - 0.2) {
            clearInterval(interval);
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
          }
          return t;
        });
      }, 200);

    } catch (err) {
      console.error('Failed to export video:', err);
      setIsExportingVideo(false);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Top Video Header Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 border-b border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <div>
            <span className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              {episode.title}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Scene {currentSceneIndex + 1}/{episode.scenes.length}: {currentScene.title} • {episode.animationStyle.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Video Button */}
          <button
            onClick={handleExportVideo}
            disabled={isExportingVideo}
            className="bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
            title="Record & download animated cartoon video"
          >
            {isExportingVideo ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Recording {exportProgress}%</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Video (.webm)</span>
              </>
            )}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]">
        {/* HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          onClick={() => {
            getAudioContext();
            setIsPlaying(!isPlaying);
          }}
          className={`max-w-full max-h-full object-contain cursor-pointer shadow-2xl transition-all ${
            episode.aspectRatio === '9:16' ? 'aspect-[9/16] h-[90vh]' : episode.aspectRatio === '1:1' ? 'aspect-square h-[90vh]' : 'aspect-video w-full'
          }`}
        />

        {/* Big Center Play Overlay Button when paused */}
        {!isPlaying && (
          <button
            onClick={() => {
              getAudioContext();
              setIsPlaying(true);
            }}
            className="absolute z-20 w-16 h-16 rounded-full bg-amber-500/90 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 transform hover:scale-110 active:scale-95 transition-all"
            title="Play Cartoon"
          >
            <Play className="w-8 h-8 ml-1 fill-current" />
          </button>
        )}

        {/* Camera Direction Pill Badge on Top Right */}
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-950/70 border border-slate-700/60 text-amber-300 backdrop-blur-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Camera: {currentScene.cameraMotion} • Transition: {currentScene.transition}
          </span>
        </div>
      </div>

      {/* Video Control Bar */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4 space-y-2.5 z-10">
        
        {/* Timeline Scrubber */}
        <div className="space-y-1">
          <div className="relative group">
            <input
              type="range"
              min={0}
              max={totalDuration}
              step={0.05}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 focus:outline-none transition-all"
            />

            {/* Scene Markers on Timeline */}
            <div className="absolute top-0 left-0 right-0 h-2 pointer-events-none flex">
              {sceneOffsets.map((s, idx) => (
                <div
                  key={idx}
                  style={{ width: `${(s.scene.duration / totalDuration) * 100}%` }}
                  className="h-full border-r border-slate-950/80 relative"
                  title={`Scene ${idx + 1}: ${s.scene.title}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
            <div className="flex items-center gap-1">
              {sceneOffsets.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSeek(s.start)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                    currentSceneIndex === idx
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Scene {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Left: Playback controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                getAudioContext();
                setIsPlaying(!isPlaying);
              }}
              className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
            </button>

            <button
              onClick={() => handleSeek(0)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
              title="Rewind to start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const nextScene = sceneOffsets[currentSceneIndex + 1];
                if (nextScene) handleSeek(nextScene.start);
              }}
              disabled={currentSceneIndex >= sceneOffsets.length - 1}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all disabled:opacity-40"
              title="Next Scene"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Playback Speed selector */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
              {[0.5, 1.0, 1.5, 2.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded transition-all ${
                    playbackSpeed === spd ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Right: Audio Toggles & Sound FX Test */}
          <div className="flex items-center gap-2">
            {/* Soundtrack BGM Toggle */}
            <button
              onClick={() => setSoundtrackEnabled(!soundtrackEnabled)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                soundtrackEnabled 
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' 
                  : 'bg-slate-950 text-slate-500 border border-slate-800'
              }`}
              title="Toggle Cartoon Background Music"
            >
              <Music className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Toon BGM</span>
            </button>

            {/* Voiceover Speech Toggle */}
            <button
              onClick={() => setVoiceoversEnabled(!voiceoversEnabled)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                voiceoversEnabled 
                  ? 'bg-sky-500/10 text-sky-300 border border-sky-500/30' 
                  : 'bg-slate-950 text-slate-500 border border-slate-800'
              }`}
              title="Toggle Cartoon Voice Dialogue"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voices</span>
            </button>

            {/* Master Mute Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   CANVAS CARTOON RENDERING FUNCTIONS
   ========================================================================= */

/**
 * 1. Background Theme Renderer
 */
function drawCartoonBackground(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  theme: string,
  timestamp: number,
  progress: number,
  style: CartoonStyle
) {
  const t = timestamp * 0.001;

  if (theme === 'workshop_vault') {
    // Cozy Victorian Steampunk Workshop
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1c1917');
    grad.addColorStop(0.7, '#292524');
    grad.addColorStop(1, '#44403c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Warm volumetric light beam from top-left window
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W * 0.6, H);
    ctx.lineTo(W * 0.2, H);
    ctx.closePath();
    const beamGrad = ctx.createLinearGradient(0, 0, W * 0.4, H);
    beamGrad.addColorStop(0, 'rgba(251, 191, 36, 0.22)');
    beamGrad.addColorStop(1, 'rgba(251, 191, 36, 0.0)');
    ctx.fillStyle = beamGrad;
    ctx.fill();
    ctx.restore();

    // Oak wooden floorboards
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, H * 0.72, W, H * 0.28);
    for (let x = 0; x < W; x += 90) {
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, H * 0.72);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    // Animated Turning Brass Gears in Background
    drawCartoonGear(ctx, W * 0.82, H * 0.35, 95, t * 0.8, '#d97706', '#b45309');
    drawCartoonGear(ctx, W * 0.68, H * 0.45, 65, -t * 1.2, '#f59e0b', '#d97706');
    drawCartoonGear(ctx, W * 0.15, H * 0.3, 75, t * 0.5, '#78350f', '#451a03');

    // Glowing subterranean sundial ring in floor
    const pulse = Math.sin(t * 4) * 0.2 + 0.8;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H * 0.82, 140 * pulse, 35 * pulse, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.restore();

  } else if (theme === 'backward_river') {
    // Surreal Upward Flowing River & Twilight Citadel
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    skyGrad.addColorStop(0, '#312e81');
    skyGrad.addColorStop(0.5, '#4c1d95');
    skyGrad.addColorStop(1, '#831843');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Floating Clockwork Citadel in Distance
    const citadelY = H * 0.25 + Math.sin(t * 1.5) * 8;
    ctx.save();
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(W * 0.5, citadelY, 70, 0, Math.PI * 2);
    ctx.fill();
    // Citadel Spire & Turrets
    ctx.fillRect(W * 0.48, citadelY - 90, 24, 70);
    ctx.fillRect(W * 0.42, citadelY - 50, 16, 40);
    ctx.fillRect(W * 0.56, citadelY - 50, 16, 40);
    ctx.restore();

    // Mountain silhouettes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.7);
    ctx.lineTo(W * 0.3, H * 0.4);
    ctx.lineTo(W * 0.6, H * 0.65);
    ctx.lineTo(W, H * 0.45);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // Upward-Flowing Turquoise River!
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(W * 0.35, H);
    ctx.quadraticCurveTo(W * 0.4, H * 0.6, W * 0.5, citadelY + 50);
    ctx.quadraticCurveTo(W * 0.6, H * 0.6, W * 0.65, H);
    ctx.closePath();
    const riverGrad = ctx.createLinearGradient(0, H, 0, citadelY);
    riverGrad.addColorStop(0, '#06b6d4');
    riverGrad.addColorStop(0.5, '#3b82f6');
    riverGrad.addColorStop(1, '#a855f7');
    ctx.fillStyle = riverGrad;
    ctx.fill();

    // Animated water ripples moving UPWARD
    for (let i = 0; i < 8; i++) {
      const rippleY = ((H - citadelY) - ((t * 120 + i * 50) % (H - citadelY))) + citadelY;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(W * 0.5 + Math.sin(rippleY * 0.02) * 20, rippleY, 30, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

  } else if (theme === 'sky_docks') {
    // Sky Docks with Floating Galleon Airships & Sunset Clouds
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.4, '#f59e0b');
    grad.addColorStop(1, '#e11d48');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Drifting cartoon puffy clouds
    for (let c = 0; c < 5; c++) {
      const cloudX = ((t * 40 + c * 260) % (W + 300)) - 150;
      const cloudY = H * 0.15 + (c * 60);
      drawCartoonCloud(ctx, cloudX, cloudY, 80);
    }

    // Wooden sky dock platform at bottom
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, H * 0.75, W, H * 0.25);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, H * 0.73, W, 14);

  } else {
    // Vibrant General Fantasy / Citadel Theme
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.6, '#1e293b');
    grad.addColorStop(1, '#334155');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Giant spinning celestial clock in center
    drawCartoonGear(ctx, W * 0.5, H * 0.4, 180, t * 0.4, '#3b82f6', '#1d4ed8');
    drawCartoonGear(ctx, W * 0.5, H * 0.4, 110, -t * 0.7, '#f59e0b', '#d97706');

    // Stone ledge
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, H * 0.75, W, H * 0.25);
  }
}

/**
 * 2. Cartoon Gear Drawing Helper
 */
function drawCartoonGear(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number,
  fillColor: string,
  strokeColor: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  const teeth = 12;
  const toothDepth = radius * 0.2;

  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const angle1 = (i / teeth) * Math.PI * 2;
    const angle2 = ((i + 0.3) / teeth) * Math.PI * 2;
    const angle3 = ((i + 0.5) / teeth) * Math.PI * 2;
    const angle4 = ((i + 0.8) / teeth) * Math.PI * 2;

    const rOuter = radius;
    const rInner = radius - toothDepth;

    if (i === 0) {
      ctx.moveTo(Math.cos(angle1) * rOuter, Math.sin(angle1) * rOuter);
    } else {
      ctx.lineTo(Math.cos(angle1) * rOuter, Math.sin(angle1) * rOuter);
    }
    ctx.lineTo(Math.cos(angle2) * rOuter, Math.sin(angle2) * rOuter);
    ctx.lineTo(Math.cos(angle3) * rInner, Math.sin(angle3) * rInner);
    ctx.lineTo(Math.cos(angle4) * rInner, Math.sin(angle4) * rInner);
  }
  ctx.closePath();

  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 5;
  ctx.stroke();

  // Center hole
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.stroke();

  // Spoke accents
  for (let s = 0; s < 4; s++) {
    ctx.beginPath();
    ctx.rotate(Math.PI / 2);
    ctx.arc(0, radius * 0.55, radius * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
  }

  ctx.restore();
}

/**
 * 3. Cartoon Puffy Cloud Helper
 */
function drawCartoonCloud(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.arc(x + r * 0.7, y - r * 0.2, r * 0.8, 0, Math.PI * 2);
  ctx.arc(x + r * 1.4, y, r * 0.75, 0, Math.PI * 2);
  ctx.arc(x + r * 0.7, y + r * 0.2, r * 0.6, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * 4. Ambient Particles Engine
 */
function drawAmbientParticles(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  type: string,
  timestamp: number
) {
  const t = timestamp * 0.001;

  if (type === 'floating_gears') {
    for (let i = 0; i < 6; i++) {
      const px = ((i * 220 + t * 30) % W);
      const py = (H * 0.2 + (i * 80) + Math.sin(t * 2 + i) * 20);
      drawCartoonGear(ctx, px, py, 14, t * (i % 2 === 0 ? 2 : -2), 'rgba(245, 158, 11, 0.6)', '#78350f');
    }
  } else if (type === 'sparkles' || type === 'stars') {
    for (let i = 0; i < 15; i++) {
      const px = ((i * 95 + Math.sin(t + i) * 60) % W);
      const py = ((i * 70 + t * 45) % H);
      const size = 3 + Math.sin(t * 6 + i) * 2.5;

      ctx.save();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(px, py, Math.max(1, size), 0, Math.PI * 2);
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    }
  } else if (type === 'bubbles') {
    for (let i = 0; i < 12; i++) {
      const px = (W * 0.35 + (i * 40) + Math.sin(t * 3 + i) * 30);
      const py = H - ((t * 80 + i * 60) % H);
      const r = 8 + (i % 4) * 3;

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Highlight dot
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(px - r * 0.3, py - r * 0.3, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

/**
 * 5. Animated Cartoon Character Engine (Squash & Stretch, Expressive Eyes, Talking Mouth)
 */
function drawAnimatedCartoonCharacter(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  char: any,
  timestamp: number,
  progress: number,
  isSpeaking: boolean,
  style: CartoonStyle
) {
  const t = timestamp * 0.001;

  // Character Base Position
  const posX = (char.positionX / 100) * W;
  const posY = (char.positionY / 100) * H;
  const scale = (char.scale || 1.0) * (W / 1280);

  // Squash & Stretch Bounce Animation
  let bounce = Math.sin(t * 7 + char.positionX) * 8;
  let stretchX = 1.0;
  let stretchY = 1.0;

  if (char.action === 'jumping') {
    bounce = -Math.abs(Math.sin(t * 6)) * 40;
    stretchX = 0.9;
    stretchY = 1.15;
  } else if (char.action === 'running') {
    bounce = Math.sin(t * 12) * 12;
    stretchX = 1.05;
    stretchY = 0.95;
  }

  ctx.save();
  ctx.translate(posX, posY + bounce);
  ctx.scale(scale * stretchX, scale * stretchY);

  // Cast shadow on floor
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 110, 50 * stretchX, 15, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fill();
  ctx.restore();

  const isLeo = char.characterName.toLowerCase().includes('leo');
  const isKael = char.characterName.toLowerCase().includes('kael');

  // --- BODY & ATTIRE ---
  if (isLeo) {
    // Leo: Blue linen shirt + leather apron + brass toolbelt
    // Torso
    ctx.fillStyle = '#1e3a8a'; // Dark blue shirt
    ctx.beginPath();
    ctx.roundRect(-30, 20, 60, 75, 12);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Leather apron
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(-22, 35, 44, 60, 6);
    ctx.fill();

    // Utility Toolbelt with brass gear buckle
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-32, 65, 64, 12);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 71, 9, 0, Math.PI * 2);
    ctx.fill();

    // Legs / Pants
    ctx.fillStyle = '#334155';
    ctx.fillRect(-22, 95, 18, 30);
    ctx.fillRect(4, 95, 18, 30);
    // Boots
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-24, 118, 22, 14);
    ctx.fillRect(2, 118, 22, 14);

  } else if (isKael) {
    // Kael: 18th Century Navy Blue Coat with brass buttons & tricorn hat
    ctx.fillStyle = '#1e1b4b'; // Navy coat
    ctx.beginPath();
    ctx.roundRect(-32, 20, 64, 80, 10);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // White ruffled cravat
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-12, 20);
    ctx.lineTo(12, 20);
    ctx.lineTo(0, 42);
    ctx.closePath();
    ctx.fill();

    // Golden brass buttons
    ctx.fillStyle = '#facc15';
    for (let b = 0; b < 3; b++) {
      ctx.beginPath();
      ctx.arc(-8, 38 + b * 14, 4, 0, Math.PI * 2);
      ctx.arc(8, 38 + b * 14, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Legs & High Riding Boots
    ctx.fillStyle = '#f1f5f9'; // white breeches
    ctx.fillRect(-22, 95, 18, 15);
    ctx.fillRect(4, 95, 18, 15);
    ctx.fillStyle = '#451a03'; // brown boots
    ctx.fillRect(-24, 105, 22, 26);
    ctx.fillRect(2, 105, 22, 26);

  } else {
    // General Cartoon Hero Body
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.roundRect(-28, 20, 56, 75, 12);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-20, 95, 16, 30);
    ctx.fillRect(4, 95, 16, 30);
  }

  // --- ARMS & GESTURES ---
  const armWave = char.action === 'waving' ? Math.sin(t * 10) * 0.4 : 0;
  // Left arm
  ctx.save();
  ctx.translate(-30, 30);
  ctx.rotate(-0.2 + armWave);
  ctx.fillStyle = isLeo ? '#1e3a8a' : (isKael ? '#1e1b4b' : '#4f46e5');
  ctx.fillRect(-10, 0, 16, 45);
  // Hand
  ctx.fillStyle = '#fbcfe8';
  ctx.beginPath();
  ctx.arc(-2, 48, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right arm
  ctx.save();
  ctx.translate(30, 30);
  ctx.rotate(0.2 - armWave);
  ctx.fillStyle = isLeo ? '#1e3a8a' : (isKael ? '#1e1b4b' : '#4f46e5');
  ctx.fillRect(-6, 0, 16, 45);
  // Hand
  ctx.fillStyle = '#fbcfe8';
  ctx.beginPath();
  ctx.arc(2, 48, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- CARTOON HEAD & FACE ---
  const headBob = Math.sin(t * 6 + char.positionX) * 2;
  ctx.save();
  ctx.translate(0, headBob);

  // Head base
  ctx.fillStyle = '#fed7aa'; // Peachy skin
  ctx.beginPath();
  ctx.arc(0, -15, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Hair
  if (isLeo) {
    // Messy brown hair with copper bangs
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(0, -25, 36, Math.PI, Math.PI * 2);
    ctx.lineTo(36, -10);
    ctx.lineTo(20, -18);
    ctx.lineTo(0, -8);
    ctx.lineTo(-20, -18);
    ctx.lineTo(-36, -10);
    ctx.closePath();
    ctx.fill();

    // Brass Magnifying Loupe on forehead
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(14, -34, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(14, -34, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.stroke();

  } else if (isKael) {
    // Wavy Blonde Hair + Tricorn Pirate Hat
    ctx.fillStyle = '#fde047'; // Blonde hair
    ctx.beginPath();
    ctx.arc(0, -20, 38, Math.PI, Math.PI * 2);
    ctx.lineTo(38, -5);
    ctx.lineTo(-38, -5);
    ctx.closePath();
    ctx.fill();

    // Tricorn Hat
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-45, -28);
    ctx.lineTo(45, -28);
    ctx.lineTo(0, -60);
    ctx.closePath();
    ctx.fill();
    // Golden trim on hat
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // --- EYES (Blinking Animation) ---
  const isBlinking = (Math.floor(t * 1.5) % 4 === 0) && (t % 0.25 < 0.12);
  const eyeX = 12;
  const eyeY = -16;

  if (isBlinking) {
    // Closed happy curve
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-eyeX, eyeY, 7, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 7, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else {
    // Big expressive cartoon eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(-eyeX, eyeY, 8, 11, 0, 0, Math.PI * 2);
    ctx.ellipse(eyeX, eyeY, 8, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Irises (Leo: hazel gold, Kael: sea blue)
    const irisColor = isLeo ? '#15803d' : (isKael ? '#0284c7' : '#4f46e5');
    ctx.fillStyle = irisColor;
    ctx.beginPath();
    ctx.arc(-eyeX + 1, eyeY, 5, 0, Math.PI * 2);
    ctx.arc(eyeX + 1, eyeY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Pupils & Catchlight sparkles
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-eyeX + 1, eyeY, 2.5, 0, Math.PI * 2);
    ctx.arc(eyeX + 1, eyeY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(-eyeX - 1, eyeY - 2, 2, 0, Math.PI * 2);
    ctx.arc(eyeX - 1, eyeY - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eyebrows
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (char.faceExpression === 'surprised') {
    ctx.arc(-eyeX, eyeY - 14, 8, Math.PI + 0.3, Math.PI * 2 - 0.3);
    ctx.arc(eyeX, eyeY - 14, 8, Math.PI + 0.3, Math.PI * 2 - 0.3);
  } else {
    ctx.arc(-eyeX, eyeY - 12, 7, Math.PI + 0.2, Math.PI * 2 - 0.2);
    ctx.arc(eyeX, eyeY - 12, 7, Math.PI + 0.2, Math.PI * 2 - 0.2);
  }
  ctx.stroke();

  // Cute rosy cheeks
  ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
  ctx.beginPath();
  ctx.arc(-18, -4, 6, 0, Math.PI * 2);
  ctx.arc(18, -4, 6, 0, Math.PI * 2);
  ctx.fill();

  // --- MOUTH (Lip-Sync Flapping When Speaking) ---
  const mouthY = 3;
  if (isSpeaking) {
    // Dynamic lip sync mouth cycle
    const mouthOpen = Math.abs(Math.sin(t * 14)) * 9 + 4;
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.ellipse(0, mouthY, 9, mouthOpen, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // White teeth flash
    ctx.fillStyle = 'white';
    ctx.fillRect(-5, mouthY - mouthOpen * 0.7, 10, 4);

  } else if (char.faceExpression === 'happy') {
    // Big cheerful smile
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.arc(0, mouthY, 9, 0.1, Math.PI - 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else if (char.faceExpression === 'surprised') {
    // Surprised 'O'
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.arc(0, mouthY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else {
    // Gentle smirk / neutral
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, mouthY - 3, 7, 0.2, Math.PI - 0.5);
    ctx.stroke();
  }

  ctx.restore(); // end head
  ctx.restore(); // end character
}

/**
 * 6. Comic-Book Speech Bubble Overlay
 */
function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  dialogue: any,
  characters: any[],
  timestamp: number
) {
  const t = timestamp * 0.001;
  const speakerChar = characters?.find((c) =>
    c.characterName.toLowerCase().includes(dialogue.speaker.toLowerCase())
  ) || characters?.[0];

  const charX = speakerChar ? (speakerChar.positionX / 100) * W : W * 0.5;
  const charY = speakerChar ? (speakerChar.positionY / 100) * H - 120 : H * 0.4;

  // Clamped bubble coordinates
  const bubbleW = Math.min(420, W * 0.65);
  const bubbleH = 80;
  const bx = Math.max(20, Math.min(W - bubbleW - 20, charX - bubbleW * 0.5));
  const by = Math.max(30, charY - bubbleH - 25);

  // Slight pop-in bouncy pulse
  const popScale = 1.0 + Math.sin(t * 8) * 0.02;

  ctx.save();
  ctx.translate(bx + bubbleW / 2, by + bubbleH / 2);
  ctx.scale(popScale, popScale);
  ctx.translate(-(bx + bubbleW / 2), -(by + bubbleH / 2));

  // Bubble background with drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(bx, by, bubbleW, bubbleH, 20);
  ctx.fill();

  // Speech bubble pointer tail toward character
  ctx.beginPath();
  ctx.moveTo(bx + bubbleW * 0.5 - 15, by + bubbleH);
  ctx.lineTo(charX, charY + 10);
  ctx.lineTo(bx + bubbleW * 0.5 + 15, by + bubbleH);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  // Speaker Tag Badge
  ctx.save();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.roundRect(bx + 16, by - 12, 100, 22, 6);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(dialogue.speaker.toUpperCase(), bx + 24, by + 3);

  // Speech Text inside Bubble
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 14px "Comic Sans MS", "Balsamiq Sans", cursive, sans-serif';
  wrapText(ctx, dialogue.text, bx + 18, by + 30, bubbleW - 36, 18);
  ctx.restore();
}

/**
 * 7. Text Wrap Helper for Speech Bubble
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

/**
 * 8. Subtitles Bar with Karaoke Highlight
 */
function drawSubtitles(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  dialogue: any,
  sceneLocalTime: number
) {
  const subY = H - 55;
  const paddingX = 40;

  // Background semi-transparent pill
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.roundRect(W * 0.1, subY - 26, W * 0.8, 48, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Subtitle text with gold color
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 6;
  ctx.fillText(`${dialogue.speaker}: "${dialogue.text}"`, W * 0.5, subY + 4);
  ctx.restore();
}

/**
 * 9. Classic Cartoon Transitions (Iris Wipe, Star Wipe, Bounce Pop)
 */
function drawCartoonTransition(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  transition: string,
  sceneProgress: number,
  duration: number
) {
  const transitionDurationSec = 0.8;
  const progressSec = sceneProgress * duration;

  // Opening transition at start of scene
  if (progressSec < transitionDurationSec) {
    const tRatio = progressSec / transitionDurationSec; // 0 to 1

    if (transition === 'iris-wipe') {
      // Classic Looney Tunes Iris expanding outward
      const maxRadius = Math.hypot(W, H) / 2;
      const r = tRatio * maxRadius;

      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.restore();

    } else if (transition === 'star-wipe') {
      // Golden Star Opening Wipe
      const maxRadius = Math.hypot(W, H) / 2;
      const r = tRatio * maxRadius;

      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      drawStarPath(ctx, W / 2, H / 2, 5, r, r * 0.45, true);
      ctx.fill();
      ctx.restore();
    }
  }

  // Closing transition at end of scene
  const remainingSec = duration - progressSec;
  if (remainingSec < transitionDurationSec) {
    const tRatio = (transitionDurationSec - remainingSec) / transitionDurationSec; // 0 to 1

    if (transition === 'iris-wipe') {
      const maxRadius = Math.hypot(W, H) / 2;
      const r = (1 - tRatio) * maxRadius;

      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.arc(W / 2, H / 2, Math.max(0, r), 0, Math.PI * 2, true);
      ctx.fill();
      ctx.restore();
    }
  }
}

/**
 * Helper to draw star path for Star Wipe
 */
function drawStarPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  counterClockwise = false
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
}

/**
 * 10. Animation Style Post-Processing Filter
 */
function drawStylePostProcessing(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  style: CartoonStyle
) {
  if (style === 'rubber-hose') {
    // 1930s Vintage Cartoon: slight sepia/monochrome tint + film grain lines
    ctx.save();
    ctx.fillStyle = 'rgba(120, 53, 15, 0.12)';
    ctx.fillRect(0, 0, W, H);

    // Film vignette
    const vigGrad = ctx.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, W * 0.7);
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

  } else if (style === '3d-pixar') {
    // Pixar 3D style: warm cinematic lighting bloom & soft vignette
    ctx.save();
    const bloom = ctx.createRadialGradient(W * 0.5, H * 0.2, 50, W * 0.5, H * 0.5, W * 0.8);
    bloom.addColorStop(0, 'rgba(254, 240, 138, 0.18)');
    bloom.addColorStop(0.5, 'rgba(245, 158, 11, 0.06)');
    bloom.addColorStop(1, 'rgba(15, 23, 42, 0.35)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

  } else if (style === 'studio-ghibli') {
    // Studio Ghibli: Dreamy hand-painted gouache / watercolor atmosphere, gentle nostalgic sunbeam
    ctx.save();
    // Warm watercolor wash
    ctx.fillStyle = 'rgba(254, 243, 199, 0.08)';
    ctx.fillRect(0, 0, W, H);
    
    // Lush atmospheric sunbeam gradient from top-left
    const ghibliGrad = ctx.createLinearGradient(0, 0, W * 0.7, H * 0.8);
    ghibliGrad.addColorStop(0, 'rgba(110, 231, 183, 0.09)'); // soft meadow mint
    ghibliGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.08)'); // golden sunlight
    ghibliGrad.addColorStop(1, 'rgba(56, 189, 248, 0.07)'); // whimsical sky blue
    ctx.fillStyle = ghibliGrad;
    ctx.fillRect(0, 0, W, H);

    // Soft nostalgic edge vignette
    const ghibliVig = ctx.createRadialGradient(W / 2, H / 2, W * 0.4, W / 2, H / 2, W * 0.75);
    ghibliVig.addColorStop(0, 'rgba(0,0,0,0)');
    ghibliVig.addColorStop(1, 'rgba(15, 23, 42, 0.28)');
    ctx.fillStyle = ghibliVig;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

  } else if (style === 'sketch') {
    // Hand-drawn Pencil & Charcoal Sketch: Parchment paper tone, subtle graphite grain, edge hatching
    ctx.save();
    // Vintage parchment warm sepia wash
    ctx.fillStyle = 'rgba(254, 240, 138, 0.05)';
    ctx.fillRect(0, 0, W, H);

    // Subtle monochrome graphite filter overlay
    ctx.fillStyle = 'rgba(30, 41, 59, 0.12)';
    ctx.fillRect(0, 0, W, H);

    // Hand-drawn sketch border / paper margin
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, W - 24, H - 24);

    // Corner sketch hatching marks
    ctx.beginPath();
    ctx.moveTo(18, 30); ctx.lineTo(30, 18);
    ctx.moveTo(24, 34); ctx.lineTo(34, 24);
    ctx.moveTo(W - 18, 30); ctx.lineTo(W - 30, 18);
    ctx.moveTo(W - 24, 34); ctx.lineTo(W - 34, 24);
    ctx.stroke();
    ctx.restore();

  } else if (style === 'anime-chibi') {
    // Dynamic Anime: Vibrant saturated aura and dynamic corner shading
    ctx.save();
    const animeGrad = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.7);
    animeGrad.addColorStop(0, 'rgba(168, 85, 247, 0.04)');
    animeGrad.addColorStop(1, 'rgba(30, 27, 75, 0.3)');
    ctx.fillStyle = animeGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

  } else if (style === 'claymation') {
    // Tactile Stop-Motion: Warm studio spotlight and subtle tactile vignette
    ctx.save();
    const clayGrad = ctx.createRadialGradient(W * 0.45, H * 0.4, W * 0.2, W / 2, H / 2, W * 0.65);
    clayGrad.addColorStop(0, 'rgba(251, 146, 60, 0.08)');
    clayGrad.addColorStop(1, 'rgba(24, 24, 27, 0.4)');
    ctx.fillStyle = clayGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

  } else if (style === 'storybook-popup') {
    // Pop-Up Book: Papercraft edge shadow
    ctx.save();
    ctx.fillStyle = 'rgba(254, 249, 195, 0.06)';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.3)';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, W - 32, H - 32);
    ctx.restore();
  }
}
