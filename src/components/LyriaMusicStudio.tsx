import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  Download,
  Sparkles,
  Volume2,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
  Disc,
  Radio,
  FileAudio,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { PublishingProject } from '../types/storyforge';

interface TrackItem {
  id: string;
  title: string;
  model: 'lyria-3-clip-preview' | 'lyria-3-pro-preview';
  prompt: string;
  duration: string;
  genre: string;
  audioUrl: string;
  lyrics?: string;
  createdAt: string;
  associatedChapter?: number;
}

interface LyriaMusicStudioProps {
  project?: PublishingProject;
  onAssignToChapter?: (chapterNumber: number, audioUrl: string, trackTitle: string) => void;
}

export const LyriaMusicStudio: React.FC<LyriaMusicStudioProps> = ({
  project,
  onAssignToChapter
}) => {
  // Input parameters
  const [model, setModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [prompt, setPrompt] = useState<string>(
    'Heroic orchestral fanfare for Little Zeus discovering his spark, Greek brass, buoyant cinematic strings, dynamic pacing'
  );
  const [genre, setGenre] = useState<string>('Orchestral Film Score');
  const [duration, setDuration] = useState<string>('30s');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Playback state
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [currentTrack, setCurrentTrack] = useState<TrackItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [trackDuration, setTrackDuration] = useState<number>(30);
  const [volume, setVolume] = useState<number>(0.85);
  const [assignedChapter, setAssignedChapter] = useState<number>(1);
  const [attachedSuccessMsg, setAttachedSuccessMsg] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preset prompts tailored to books, trailers, and cartoons
  const PRESET_PROMPTS = [
    {
      label: '⚡ Olympian Fanfare',
      genre: 'Heroic Orchestral',
      prompt: 'Heroic brass fanfare, thunderous timpanis, soaring violins for Little Zeus climbing Mount Olympus',
      model: 'lyria-3-clip-preview' as const
    },
    {
      label: '🎨 Whimsical Cartoon Theme',
      genre: 'Animated Comedy',
      prompt: 'Playful woodwinds, bouncy xylophone, pizzicato cello, energetic rhythm for Saturday morning cartoon intro',
      model: 'lyria-3-clip-preview' as const
    },
    {
      label: '🔍 Patterson Suspense Thriller',
      genre: 'Cinematic Noir & Suspense',
      prompt: 'Tense ticking percussion, low cello ostinato, sudden dramatic brass stings, accelerating mystery beat',
      model: 'lyria-3-pro-preview' as const
    },
    {
      label: '☁️ Storm Cloud Lullaby',
      genre: 'Mythic Ambient',
      prompt: 'Warm celestial harp, soft atmospheric synths, gentle rainfall texture, comforting magical melody',
      model: 'lyria-3-clip-preview' as const
    },
    {
      label: '🚀 Epic Full-Length Trailer',
      genre: 'Blockbuster Symphony',
      prompt: 'Full orchestral crescendo, choir accents, driving hybrid synth-percussion, emotional climax',
      model: 'lyria-3-pro-preview' as const
    }
  ];

  // Book illustrations available for inspiration (dynamically loaded)
  const [bookArtSamples, setBookArtSamples] = useState([
    { name: 'Little Zeus Character Sheet', path: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/little_zeus_sheet.png' },
    { name: 'Chapter 1 Scene: The Thunderbolt', path: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/ch001_illus00.png' },
    { name: 'Stormy the Cloud', path: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/stormy_the_storm_cloud_sheet.png' },
    { name: 'Official Book Cover', path: '/output_books/little_zeus_gets_his_thunderbolt/covers/cover_front.png' }
  ]);

  useEffect(() => {
    fetch('/api/book-illustrations')
      .then((res) => res.json())
      .then((data) => {
        if (data.illustrations && data.illustrations.length > 0) {
          const map = new Map<string, { name: string; path: string }>();
          data.illustrations.forEach((item: { name: string; path: string }) => map.set(item.path, item));
          bookArtSamples.forEach((item) => {
            if (!map.has(item.path)) map.set(item.path, item);
          });
          setBookArtSamples(Array.from(map.values()));
        }
      })
      .catch((e) => console.warn('Could not load illustrations for Lyria:', e));
  }, []);

  // Handle Audio Playback Time & End
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setTrackDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  // Audio Play/Pause toggle
  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.warn('Play error:', e));
    }
  };

  const handleSeek = (newTime: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Music using Lyria
  const handleGenerateMusic = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);
    setStatusMessage(`Connecting to ${model === 'lyria-3-pro-preview' ? 'Lyria Pro (Full-Length)' : 'Lyria Clip (30s)'}...`);

    try {
      let imageBase64Payload: string | undefined = undefined;
      if (selectedImage) {
        if (selectedImage.startsWith('/') || selectedImage.startsWith('http')) {
          try {
            const imgRes = await fetch(selectedImage);
            const blob = await imgRes.blob();
            imageBase64Payload = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          } catch (convErr) {
            console.warn('Using image path directly as fallback:', convErr);
            imageBase64Payload = selectedImage;
          }
        } else {
          imageBase64Payload = selectedImage;
        }
      }

      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          genre,
          duration: model === 'lyria-3-pro-preview' ? 'Full Track (1-2m)' : '30s',
          imageBase64: imageBase64Payload
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!result.success || !result.audioBase64) {
        throw new Error(result.error || 'No audio returned from music engine');
      }

      // Convert base64 to Blob URL
      const byteCharacters = atob(result.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.mimeType || 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);

      const newTrack: TrackItem = {
        id: `track-${Date.now()}`,
        title: result.title || `${prompt.slice(0, 36)}...`,
        model,
        prompt,
        duration: model === 'lyria-3-pro-preview' ? '1m 15s' : '0m 30s',
        genre,
        audioUrl,
        lyrics: result.lyrics,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setTracks((prev) => [newTrack, ...prev]);
      setCurrentTrack(newTrack);
      setIsPlaying(false);

      // Play newly generated track
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }, 200);

      setStatusMessage('Music generation completed successfully!');
    } catch (err: any) {
      console.error('Music generation failed:', err);
      setErrorMsg(err.message || 'Music generation error');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 select-none">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-br from-amber-500/20 to-indigo-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Music className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Lyria Music Studio
                <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  AI Orchestrator
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Compose original orchestral soundtracks, audio themes, and video background music powered by Google Lyria.
              </p>
            </div>
          </div>
        </div>

        {/* Model Selector Pill (Lyria Clip vs Lyria Pro) */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setModel('lyria-3-clip-preview')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              model === 'lyria-3-clip-preview'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Lyria Clip (30s)</span>
          </button>
          <button
            onClick={() => setModel('lyria-3-pro-preview')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              model === 'lyria-3-pro-preview'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>Lyria Pro (Full Tracks)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Music Composer Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Preset Inspiration Pills */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Book & Video Soundtrack Presets</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(p.prompt);
                    setGenre(p.genre);
                    setModel(p.model);
                  }}
                  className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/70 hover:border-amber-500/40 text-xs px-3 py-1.5 rounded-lg transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt & Musical Directives */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Music Description & Cinematic Mood
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                placeholder="Describe the instrumentation, tempo, emotional arc, rhythm, and genre..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Genre & Instrument Archetype
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                >
                  <option value="Orchestral Film Score">Orchestral Film Score</option>
                  <option value="Whimsical Children Animation">Whimsical Children Animation</option>
                  <option value="Epic Mythic Brass">Epic Mythic Brass & Choir</option>
                  <option value="Patterson Suspense Thriller">Patterson Suspense Thriller</option>
                  <option value="Acoustic Folk & Adventure">Acoustic Folk & Storybook</option>
                  <option value="Ambient Celestial Synth">Ambient Celestial Synth</option>
                  <option value="High-Energy Battle Fanfare">High-Energy Battle Fanfare</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Output Model & Duration
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono flex items-center justify-between">
                  <span>{model === 'lyria-3-clip-preview' ? 'lyria-3-clip-preview' : 'lyria-3-pro-preview'}</span>
                  <span className="text-slate-400">{model === 'lyria-3-clip-preview' ? '30s Clip' : 'Full Track'}</span>
                </div>
              </div>
            </div>

            {/* Optional Image Inspiration (Image + Text) */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>Visual Inspiration (Image + Text Music Generation)</span>
              </label>

              {/* Sample Art Shortcuts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 max-h-44 overflow-y-auto pr-1">
                {bookArtSamples.map((art, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(art.path)}
                    className={`p-2 rounded-xl border text-left text-[11px] truncate transition-all ${
                      selectedImage === art.path
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                        : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-semibold block truncate">{art.name}</span>
                    <span className="text-[9px] text-slate-500">From project</span>
                  </button>
                ))}
              </div>

              {/* Custom Image Upload */}
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                >
                  Upload Custom Photo / Art
                </button>
                {selectedImage && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Visual inspiration attached</span>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="text-slate-400 hover:text-slate-200 underline ml-1"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-3">
              <button
                onClick={handleGenerateMusic}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 disabled:opacity-50 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Track with {model}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Music Track ({model === 'lyria-3-clip-preview' ? '30s Clip' : 'Full Song'})</span>
                  </>
                )}
              </button>

              {statusMessage && (
                <p className="text-xs text-center text-slate-400 font-mono mt-2">{statusMessage}</p>
              )}
              {errorMsg && (
                <p className="text-xs text-center text-rose-400 font-medium mt-2">{errorMsg}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Audio Player & Soundtrack Library (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Player Card */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} />
                <span>Now Playing</span>
              </span>
              {currentTrack && (
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                  {currentTrack.model}
                </span>
              )}
            </div>

            {currentTrack ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white truncate">{currentTrack.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{currentTrack.genre}</p>
                </div>

                {/* Animated Waveform Visualization */}
                <div className="h-16 bg-slate-950/80 border border-slate-800/80 rounded-xl p-2 flex items-center justify-between gap-1">
                  {Array.from({ length: 32 }).map((_, i) => {
                    const waveHeight = isPlaying
                      ? 20 + Math.sin(i * 0.4 + currentTime * 8) * 16 + Math.cos(i * 0.8) * 10
                      : 8 + (i % 5) * 3;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-amber-500 to-indigo-500 rounded-full transition-all duration-75"
                        style={{ height: `${Math.max(4, Math.min(56, waveHeight))}px` }}
                      />
                    );
                  })}
                </div>

                {/* Scrubber Slider */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max={trackDuration || 30}
                    step="0.1"
                    value={currentTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(trackDuration)}</span>
                  </div>
                </div>

                {/* Playback Controls & Volume */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="w-12 h-12 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full flex items-center justify-center font-bold shadow-lg transition-transform active:scale-95"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Volume2 className="w-4 h-4 text-slate-500" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          setVolume(v);
                          if (audioRef.current) audioRef.current.volume = v;
                        }}
                        className="w-20 accent-amber-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Download WAV button */}
                  <a
                    href={currentTrack.audioUrl}
                    download={`${currentTrack.title.replace(/\s+/g, '_')}.wav`}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-4 h-4 text-sky-400" />
                    <span>Save .WAV</span>
                  </a>
                </div>

                {/* Assign to Chapter Feature */}
                {project && onAssignToChapter && (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 pt-3">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>Link Music to Book Chapter Video</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={assignedChapter}
                        onChange={(e) => setAssignedChapter(parseInt(e.target.value))}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                      >
                        {project.manuscript?.chapters?.map((ch) => (
                          <option key={ch.chapterNumber} value={ch.chapterNumber}>
                            Chapter {ch.chapterNumber}: {ch.title}
                          </option>
                        )) || <option value={1}>Chapter 1</option>}
                      </select>
                      <button
                        onClick={() => {
                          onAssignToChapter(assignedChapter, currentTrack.audioUrl, currentTrack.title);
                          setAttachedSuccessMsg(`Soundtrack attached to Chapter ${assignedChapter}!`);
                          setTimeout(() => setAttachedSuccessMsg(null), 4000);
                        }}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <span>Attach</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    {attachedSuccessMsg && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{attachedSuccessMsg}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-3">
                <FileAudio className="w-12 h-12 mx-auto text-slate-700" />
                <p className="text-xs">No active track. Enter a prompt and generate music with Lyria above.</p>
              </div>
            )}

            {/* Hidden native audio element for sound playback */}
            {currentTrack && (
              <audio ref={audioRef} src={currentTrack.audioUrl} preload="auto" />
            )}
          </div>

          {/* Session Track History */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Track History ({tracks.length})
              </span>
              <span className="text-[10px] text-slate-500">Session Memory</span>
            </div>

            {tracks.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">Your generated tracks will appear here.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                {tracks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setCurrentTrack(t);
                      setIsPlaying(false);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      currentTrack?.id === t.id
                        ? 'border-amber-500/60 bg-amber-500/10 text-white'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <button className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
                        {currentTrack?.id === t.id && isPlaying ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 ml-0.5" />
                        )}
                      </button>
                      <div className="truncate">
                        <p className="text-xs font-bold truncate">{t.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {t.genre} • {t.duration}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono ml-2">{t.createdAt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
