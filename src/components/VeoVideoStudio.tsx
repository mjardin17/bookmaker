import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Upload,
  Play,
  Pause,
  Download,
  Sparkles,
  Maximize2,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Film,
  Smartphone,
  Monitor,
  Layers,
  ArrowRight,
  BookOpen,
  Clock
} from 'lucide-react';
import { PublishingProject } from '../types/storyforge';

interface VideoItem {
  id: string;
  operationName: string;
  sourceImage: string;
  videoUrl: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  model: string;
  createdAt: string;
  chapterNumber?: number;
}

interface VeoVideoStudioProps {
  project?: PublishingProject;
  onAttachVideoToChapter?: (chapterNumber: number, videoUrl: string) => void;
}

export const VeoVideoStudio: React.FC<VeoVideoStudioProps> = ({
  project,
  onAttachVideoToChapter
}) => {
  // Input parameters
  const [sourceImage, setSourceImage] = useState<string | null>(
    '/output_books/little_zeus_gets_his_thunderbolt/illustrations/ch001_illus00.png'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [prompt, setPrompt] = useState<string>(
    'Cinematic slow dolly zoom with golden lightning sparks crackling around Little Zeus, dramatic atmospheric lighting, 4k detail'
  );
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Result & Player state
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isLooping, setIsLooping] = useState<boolean>(true);

  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cinematic Motion Presets
  const MOTION_PRESETS = [
    {
      title: '⚡ Lightning Surge & Arc Dolly',
      prompt: 'Cinematic slow dolly zoom with golden lightning sparks crackling around Little Zeus, dramatic atmospheric lighting, 4k detail',
      ratio: '16:9' as const
    },
    {
      title: '🕊️ Expressive Character Life',
      prompt: 'Subtle realistic character animation, soft natural breathing, blinking eyes, gentle wind fluttering tunic and clouds',
      ratio: '16:9' as const
    },
    {
      title: '📱 YouTube Shorts / Vertical Hero',
      prompt: 'Dynamic vertical camera pan rising from ancient temple steps to the heroic stance of Little Zeus against the starry storm',
      ratio: '9:16' as const
    },
    {
      title: '🦅 Soaring Aerial Reveal',
      prompt: 'Smooth drone camera sweeping backwards revealing the magnificent marble pillars of Mount Olympus emerging from the misty clouds',
      ratio: '16:9' as const
    }
  ];

  // Available project illustrations for quick testing (merged with server)
  const [artSamples, setArtSamples] = useState([
    { name: 'Chapter 1: The Thunderbolt', path: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/ch001_illus00.png' },
    { name: 'Little Zeus Character Sheet', path: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/little_zeus_sheet.png' },
    { name: 'Athena Automaton', path: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/athena_sheet.png' },
    { name: 'Stormy the Cloud', path: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/stormy_the_storm_cloud_sheet.png' },
    { name: 'Book Front Cover', path: '/output_books/little_zeus_gets_his_thunderbolt/covers/cover_front.png' }
  ]);

  useEffect(() => {
    fetch('/api/book-illustrations')
      .then((res) => res.json())
      .then((data) => {
        if (data.illustrations && data.illustrations.length > 0) {
          const map = new Map<string, { name: string; path: string }>();
          data.illustrations.forEach((item: { name: string; path: string }) => map.set(item.path, item));
          artSamples.forEach((item) => {
            if (!map.has(item.path)) map.set(item.path, item);
          });
          setArtSamples(Array.from(map.values()));
        }
      })
      .catch((e) => console.warn('Could not load dynamic illustrations:', e));
  }, []);

  // Reassuring status stages while Veo processes
  const STATUS_STAGES = [
    'Encoding reference photo & analyzing spatial depth...',
    'Dispatching to veo-3.1-fast-generate-preview neural lattice...',
    'Synthesizing temporal optical motion vectors...',
    'Rendering camera physics & atmospheric particle lighting...',
    'Finalizing MP4 video encode & delivery stream...'
  ];

  // Handle image upload from user computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Video Generation
  const handleGenerateVideo = async () => {
    if (!sourceImage) {
      setErrorMsg('Please select or upload a photo first.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setProgressStage(0);
    setStatusMessage(STATUS_STAGES[0]);

    try {
      // Advance progress indicators smoothly
      const progressTimer = setInterval(() => {
        setProgressStage((prev) => {
          const next = Math.min(prev + 1, STATUS_STAGES.length - 1);
          setStatusMessage(STATUS_STAGES[next]);
          return next;
        });
      }, 3500);

      // Convert local image path to base64 if needed
      let cleanImagePayload = sourceImage;
      if (sourceImage.startsWith('/') || sourceImage.startsWith('http')) {
        try {
          const imgRes = await fetch(sourceImage);
          const blob = await imgRes.blob();
          cleanImagePayload = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (convErr) {
          console.warn('Using image path directly as fallback:', convErr);
        }
      }

      // Call server endpoint
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: cleanImagePayload,
          prompt,
          aspectRatio,
          model: 'veo-3.1-fast-generate-preview'
        })
      });

      if (!response.ok) {
        clearInterval(progressTimer);
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const initData = await response.json();
      const operationId = initData.operationId;
      const operationName = initData.operationName;

      // Poll for completion
      let isDone = false;
      let finalVideoUrl = '';
      let attempts = 0;

      while (!isDone && attempts < 30) {
        attempts++;
        await new Promise((r) => setTimeout(r, 2500));

        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationId, operationName })
        });

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.done || statusData.status === 'completed') {
            isDone = true;
            finalVideoUrl = statusData.videoUrl || `/api/video-file/${operationId}`;
          }
        }
      }

      clearInterval(progressTimer);

      if (!isDone) {
        // Fallback direct URL
        finalVideoUrl = `/api/video-file/${operationId}`;
      }

      const newVideo: VideoItem = {
        id: operationId,
        operationName: operationName || 'veo-gen',
        sourceImage,
        videoUrl: finalVideoUrl,
        prompt,
        aspectRatio,
        model: 'veo-3.1-fast-generate-preview',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setVideos((prev) => [newVideo, ...prev]);
      setActiveVideo(newVideo);
      setStatusMessage('Veo video successfully synthesized!');
    } catch (err: any) {
      console.error('Veo video generation error:', err);
      setErrorMsg(err.message || 'Video generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 select-none">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-br from-indigo-500/20 to-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
              <Film className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Veo Image-to-Video Studio
                <span className="text-xs font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full">
                  veo-3.1-fast-generate-preview
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Animate any still photo, book illustration, or character portrait into high-definition cinematic video.
              </p>
            </div>
          </div>
        </div>

        {/* Aspect Ratio Toggle (16:9 Landscape vs 9:16 Portrait) */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setAspectRatio('16:9')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              aspectRatio === '16:9'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>16:9 Landscape (YouTube)</span>
          </button>
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              aspectRatio === '9:16'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>9:16 Portrait (Shorts / Reels)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Selector & Motion Prompt Builder (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. Source Photo Selection */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>1. Select or Upload Source Photo</span>
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Custom Image</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Project Illustrations Shortcuts */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
              {artSamples.map((art, idx) => (
                <button
                  key={idx}
                  onClick={() => setSourceImage(art.path)}
                  className={`p-1.5 rounded-xl border text-center transition-all ${
                    sourceImage === art.path
                      ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                      : 'border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <img
                    src={art.path}
                    alt={art.name}
                    className="w-full h-14 object-cover rounded-lg mb-1"
                    onError={(e) => {
                      (e.target as any).style.display = 'none';
                    }}
                  />
                  <span className="text-[10px] block truncate font-medium">{art.name}</span>
                </button>
              ))}
            </div>

            {/* Current Selected Image Preview */}
            {sourceImage && (
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center max-h-56">
                <img
                  src={sourceImage}
                  alt="Selected Source"
                  className="max-h-56 object-contain"
                />
                <span className="absolute bottom-2 left-2 bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300 px-2 py-0.5 rounded-md font-mono">
                  Input Frame Source
                </span>
              </div>
            )}
          </div>

          {/* 2. Motion Presets */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Cinematic Motion Presets</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MOTION_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPresetIndex(idx);
                    setPrompt(p.prompt);
                    setAspectRatio(p.ratio);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    selectedPresetIndex === idx
                      ? 'border-sky-500/80 bg-sky-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{p.title}</span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">{p.ratio}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Motion Prompt Input & Model Specs */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Motion & Direction Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500/60 transition-colors"
                placeholder="Describe the camera movement, character action, lighting shifts, and physical dynamics..."
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span>Model: <strong className="text-sky-300">veo-3.1-fast-generate-preview</strong></span>
              <span>Format: <strong className="text-amber-300">{aspectRatio} MP4</strong></span>
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={isGenerating || !sourceImage}
              className="w-full bg-gradient-to-r from-sky-500 via-indigo-600 to-amber-500 hover:from-sky-400 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Video with Veo...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>Generate Video ({aspectRatio})</span>
                </>
              )}
            </button>

            {/* Reassuring multi-stage progress display */}
            {isGenerating && (
              <div className="p-4 bg-slate-950 border border-sky-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-400 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Rendering Frame Sequence</span>
                  </span>
                  <span className="font-mono text-slate-400">{progressStage + 1}/5</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full transition-all duration-500"
                    style={{ width: `${((progressStage + 1) / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-300 font-mono">{statusMessage}</p>
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-center text-rose-400 font-medium">{errorMsg}</p>
            )}
          </div>
        </div>

        {/* Right Column: Generated Video Output Player & History (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Film className="w-4 h-4" />
                <span>Veo Generated Video Result</span>
              </span>
              {activeVideo && (
                <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full">
                  {activeVideo.aspectRatio}
                </span>
              )}
            </div>

            {activeVideo ? (
              <div className="space-y-4">
                {/* Video Viewport Container (Aspect Ratio Responsive) */}
                <div
                  className={`relative mx-auto rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center ${
                    activeVideo.aspectRatio === '9:16' ? 'w-64 aspect-[9/16]' : 'w-full aspect-video'
                  }`}
                >
                  <video
                    ref={videoPlayerRef}
                    src={activeVideo.videoUrl}
                    autoPlay
                    loop={isLooping}
                    muted
                    playsInline
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-2">{activeVideo.prompt}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Model: {activeVideo.model} • Synthesized {activeVideo.createdAt}
                  </p>
                </div>

                {/* Video Actions: Download & Loop */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsLooping(!isLooping)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        isLooping
                          ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                          : 'border-slate-800 bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span>Loop: {isLooping ? 'On' : 'Off'}</span>
                    </button>
                  </div>

                  <a
                    href={activeVideo.videoUrl}
                    download="veo_animated_video.mp4"
                    className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4 Video</span>
                  </a>
                </div>

                {/* Link to Chapter Video */}
                {project && onAttachVideoToChapter && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                      <span>Attach to Book Chapter Video Package</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        id="chapter-assign-select"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                      >
                        {project.manuscript?.chapters?.map((ch) => (
                          <option key={ch.chapterNumber} value={ch.chapterNumber}>
                            Chapter {ch.chapterNumber}: {ch.title}
                          </option>
                        )) || <option value={1}>Chapter 1</option>}
                      </select>
                      <button
                        onClick={() => {
                          const sel = document.getElementById('chapter-assign-select') as HTMLSelectElement;
                          const chNum = parseInt(sel?.value || '1');
                          onAttachVideoToChapter(chNum, activeVideo.videoUrl);
                          alert(`Veo video successfully linked to Chapter ${chNum} package!`);
                        }}
                        className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <span>Attach</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 space-y-3">
                <Video className="w-12 h-12 mx-auto text-slate-700" />
                <p className="text-xs max-w-xs mx-auto">
                  No video generated yet. Select an image on the left, set your motion prompt, and click Generate.
                </p>
              </div>
            )}
          </div>

          {/* Session Video History */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Generated Videos ({videos.length})
            </span>
            {videos.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">Your generated clips will be saved here.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {videos.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setActiveVideo(v)}
                    className={`p-2 rounded-xl border cursor-pointer transition-all ${
                      activeVideo?.id === v.id
                        ? 'border-sky-500 bg-sky-500/10'
                        : 'border-slate-800 bg-slate-950 hover:bg-slate-800'
                    }`}
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-1.5">
                      <video src={v.videoUrl} muted className="w-full h-full object-cover" />
                      <span className="absolute top-1 right-1 bg-black/70 text-[9px] font-mono text-white px-1.5 rounded">
                        {v.aspectRatio}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-200 truncate">{v.prompt}</p>
                    <span className="text-[9px] text-slate-500 font-mono">{v.createdAt}</span>
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
