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
  Clock,
  Zap,
  Globe,
  Sliders,
  ShieldCheck,
  Music,
  Plus,
  Trash2,
  ExternalLink,
  Volume2,
  Palette
} from 'lucide-react';
import { PublishingProject } from '../types/storyforge';
import { VideoEngineSelector, VideoEngineProvider } from './VideoEngineSelector';

export type VideoEngine = VideoEngineProvider | 'story-reel';
export type CameraMotion = 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'spark-pulse' | 'orbit-roll';
export type StudioTab = 'video' | 'free-image' | 'story-reel';

export const VIDEO_ENGINES = [
  {
    id: 'veo' as VideoEngine,
    name: 'Google Veo 3.1 Fast',
    badge: 'veo-3.1-fast-generate-preview',
    badgeColor: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    icon: Zap,
    description: 'Neural optical motion vectors with 720p resolution and character consistency.'
  },
  {
    id: 'wan' as VideoEngine,
    name: 'Wan 2.1 Open Weights Router',
    badge: 'Open Weights Router',
    badgeColor: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    icon: Layers,
    description: 'Dual-stage open-weights generative pipeline based on Hugging Face inference architecture.'
  },
  {
    id: 'cogvideo' as VideoEngine,
    name: 'CogVideoX 1.5 Diffusion',
    badge: 'Open Source SOTA',
    badgeColor: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    icon: Film,
    description: 'High-dynamic camera motion with spatial-temporal attention transformers.'
  },
  {
    id: 'hyperframes' as VideoEngine,
    name: 'HyperFrames Kinetic Engine',
    badge: '100% Free • Unlimited Local',
    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    icon: Sparkles,
    description: 'Instant local kinetic synthesis: Ken Burns dolly, pan, atmospheric particles, zero credits required.'
  },
  {
    id: 'pollinations' as VideoEngine,
    name: 'Pollinations Flux Motion',
    badge: '100% Free • Open Web',
    badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    icon: Globe,
    description: 'Free open-source visual synthesis via Pollinations Flux + multi-directional camera motion.'
  },
  {
    id: 'story-reel' as VideoEngine,
    name: 'Storyboard Multi-Scene Reel',
    badge: 'Multi-Shot Book Trailer',
    badgeColor: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
    icon: Video,
    description: 'Stitches multiple book scenes into an animated cinematic trailer with soundtrack.'
  }
];

export const CAMERA_MOTIONS = [
  { id: 'zoom-in' as CameraMotion, label: '🔍 Slow Dolly Zoom-In', desc: 'Focuses in toward the character or focal subject' },
  { id: 'zoom-out' as CameraMotion, label: '🔭 Panoramic Reveal', desc: 'Sweeps outward revealing the full landscape' },
  { id: 'pan-left' as CameraMotion, label: '⬅️ Tracking Pan Left', desc: 'Horizontal motion following leftward action' },
  { id: 'pan-right' as CameraMotion, label: '➡️ Horizon Pan Right', desc: 'Sweeps across the scene from left to right' },
  { id: 'spark-pulse' as CameraMotion, label: '⚡ Lightning Pulse & Flare', desc: 'Volumetric lighting surges and spark flickers' },
  { id: 'orbit-roll' as CameraMotion, label: '🔄 3D Orbit Drift & Roll', desc: 'Dynamic curved camera drift with subtle roll' }
];

interface VideoItem {
  id: string;
  operationName: string;
  sourceImage: string;
  videoUrl: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  engine: VideoEngineProvider | 'story-reel';
  subModel?: string;
  motionType: CameraMotion;
  hasAudio: boolean;
  createdAt: string;
  chapterNumber?: number;
}

interface GeneratedImageItem {
  id: string;
  prompt: string;
  imageUrl: string;
  model: string;
  style: string;
  aspectRatio: string;
  createdAt: string;
}

interface VeoVideoStudioProps {
  project?: PublishingProject;
  onAttachVideoToChapter?: (chapterNumber: number, videoUrl: string) => void;
  onNavigateTo3D?: () => void;
}

export const VeoVideoStudio: React.FC<VeoVideoStudioProps> = ({
  project,
  onAttachVideoToChapter,
  onNavigateTo3D
}) => {
  // Active Studio Mode Tab
  const [studioTab, setStudioTab] = useState<StudioTab>('video');

  // Input parameters for Video Generator
  const [engine, setEngine] = useState<VideoEngineProvider>('Veo');
  const [subModel, setSubModel] = useState<string>('veo-3.1-fast-generate-preview');
  const [videoMode, setVideoMode] = useState<'image-to-video' | 'text-to-video'>('image-to-video');
  const [motionType, setMotionType] = useState<CameraMotion>('zoom-in');
  const [duration, setDuration] = useState<number>(5);
  const [includeAudio, setIncludeAudio] = useState<boolean>(true);
  const [audioGenre, setAudioGenre] = useState<string>('Orchestral Film Score');
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
  const [attachedSuccessCh, setAttachedSuccessCh] = useState<number | null>(null);

  // Free AI Image Studio state
  const [imagePrompt, setImagePrompt] = useState<string>(
    'Little Zeus standing atop Mount Olympus holding a blazing golden thunderbolt, ethereal storm clouds, heroic pose'
  );
  const [imageStyle, setImageStyle] = useState<string>('olympian');
  const [imageModel, setImageModel] = useState<string>('gemini-nano');
  const [imageRatio, setImageRatio] = useState<'16:9' | '1:1' | '9:16'>('16:9');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageItem[]>([
    {
      id: 'init_img_1',
      prompt: 'Little Zeus holding the thunderbolt with divine aura',
      imageUrl: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/ch001_illus00.png',
      model: 'gemini-nano-banana-2.1',
      style: 'olympian',
      aspectRatio: '16:9',
      createdAt: 'Default Master Art'
    },
    {
      id: 'init_img_2',
      prompt: 'Athena Automaton with owl emblem and celestial gears',
      imageUrl: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/athena_sheet.png',
      model: 'gemini-nano-banana-2.1',
      style: 'olympian',
      aspectRatio: '1:1',
      createdAt: 'Character Bible'
    }
  ]);

  // Storyboard Reel Maker state
  const [reelScenes, setReelScenes] = useState<Array<{ imagePath: string; caption: string }>>([
    { imagePath: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/ch001_illus00.png', caption: 'Act I: The Storm on Mount Olympus' },
    { imagePath: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/little_zeus_sheet.png', caption: 'Act II: The Young Thunder God Arrives' },
    { imagePath: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/athena_sheet.png', caption: 'Act III: Athena and the Celestial Council' }
  ]);
  const [reelTitle, setReelTitle] = useState<string>('Little Zeus: The Animated Teaser Trailer');
  const [isGeneratingReel, setIsGeneratingReel] = useState<boolean>(false);

  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cinematic Motion Presets
  const MOTION_PRESETS = [
    {
      title: '⚡ Lightning Surge & Arc Dolly',
      prompt: 'Cinematic slow dolly zoom with golden lightning sparks crackling around Little Zeus, dramatic atmospheric lighting, 4k detail',
      ratio: '16:9' as const,
      motion: 'zoom-in' as CameraMotion
    },
    {
      title: '🕊️ Expressive Character Life',
      prompt: 'Subtle realistic character animation, soft natural breathing, blinking eyes, gentle wind fluttering tunic and clouds',
      ratio: '16:9' as const,
      motion: 'orbit-roll' as CameraMotion
    },
    {
      title: '📱 YouTube Shorts / Vertical Hero',
      prompt: 'Dynamic vertical camera pan rising from ancient temple steps to the heroic stance of Little Zeus against the starry storm',
      ratio: '9:16' as const,
      motion: 'spark-pulse' as CameraMotion
    },
    {
      title: '🦅 Soaring Aerial Reveal',
      prompt: 'Smooth drone camera sweeping backwards revealing the magnificent marble pillars of Mount Olympus emerging from the misty clouds',
      ratio: '16:9' as const,
      motion: 'zoom-out' as CameraMotion
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

  // Dynamic status stages based on selected engine provider and sub-model
  const getStatusStages = (eng: VideoEngineProvider, modelName: string) => {
    if (eng === 'Veo') {
      return [
        'Encoding reference visual & analyzing 3D spatial depth vectors...',
        `Dispatching to Google Veo 3.1 neural lattice (${modelName})...`,
        'Synthesizing temporal optical motion vectors & character persistence...',
        'Rendering cinematic lighting, shadows & physics dynamics...',
        'Mastering high-fidelity MP4 video encode & delivery...'
      ];
    } else if (eng === 'HuggingFace') {
      return [
        'Preparing visual frame & computing spatial attention tensors...',
        `Routing to Hugging Face Open-Weights Cluster (${modelName})...`,
        'Executing Wan 2.1 / CogVideoX spatial-temporal diffusion...',
        'Rendering 60fps kinetic camera trajectory & particle physics...',
        'Packaging open-source MP4 video stream...'
      ];
    } else {
      return [
        'Analyzing line art & mythological character expressions...',
        `Connecting to NovAI Stylized Anime & Fantasy Motion Engine (${modelName})...`,
        'Applying volumetric aura surge & fantasy lighting dynamics...',
        'Rendering stylized line-art kinematics & emotional vectors...',
        'Finalizing stylized fantasy MP4 with ambient orchestral score...'
      ];
    }
  };

  // Handle image upload from user computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImage(event.target?.result as string);
        setVideoMode('image-to-video');
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Video Generation
  const handleGenerateVideo = async () => {
    if (videoMode === 'image-to-video' && !sourceImage) {
      setErrorMsg('Please select or upload a photo first.');
      return;
    }

    const currentStages = getStatusStages(engine, subModel);
    setIsGenerating(true);
    setErrorMsg(null);
    setProgressStage(0);
    setStatusMessage(currentStages[0]);

    try {
      // Advance progress indicators smoothly
      const progressTimer = setInterval(() => {
        setProgressStage((prev) => {
          const next = Math.min(prev + 1, currentStages.length - 1);
          setStatusMessage(currentStages[next]);
          return next;
        });
      }, 2500);

      // Convert local image path to base64 if needed
      let cleanImagePayload = sourceImage || '';
      if (sourceImage && (sourceImage.startsWith('/') || sourceImage.startsWith('http'))) {
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

      // Call server endpoint with dynamic engine and subModel
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: cleanImagePayload,
          prompt,
          aspectRatio,
          engine,
          subModel,
          motionType,
          mode: videoMode,
          duration,
          includeAudio,
          audioGenre
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
        await new Promise((r) => setTimeout(r, 2000));

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
        finalVideoUrl = `/api/video-file/${operationId}`;
      }

      const newVideo: VideoItem = {
        id: operationId,
        operationName: operationName || `${engine}-gen`,
        sourceImage: sourceImage || '/output_books/little_zeus_gets_his_thunderbolt/illustrations/ch001_illus00.png',
        videoUrl: finalVideoUrl,
        prompt,
        aspectRatio,
        engine,
        subModel,
        motionType,
        hasAudio: includeAudio,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setVideos((prev) => [newVideo, ...prev]);
      setActiveVideo(newVideo);
      setStatusMessage(`Video successfully synthesized via ${engine} (${subModel})!`);
    } catch (err: any) {
      console.error('Video generation error:', err);
      setErrorMsg(err.message || 'Video generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Free AI Image
  const handleGenerateFreeImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/generate-image-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          style: imageStyle,
          model: imageModel,
          aspectRatio: imageRatio
        })
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        const newImg: GeneratedImageItem = {
          id: `img_${Date.now()}`,
          prompt: imagePrompt,
          imageUrl: data.imageUrl,
          model: data.model || imageModel,
          style: imageStyle,
          aspectRatio: imageRatio,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setGeneratedImages((prev) => [newImg, ...prev]);
        // Also auto-select as source image for video studio
        setSourceImage(data.imageUrl);
      }
    } catch (err: any) {
      console.error('Free image generation error:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Generate Storyboard Reel
  const handleGenerateStoryReel = async () => {
    if (reelScenes.length === 0) return;
    setIsGeneratingReel(true);
    try {
      const res = await fetch('/api/create-story-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reelTitle,
          scenes: reelScenes,
          aspectRatio,
          audioGenre
        })
      });
      const data = await res.json();
      if (data.success && data.videoUrl) {
        const newVideo: VideoItem = {
          id: data.operationId,
          operationName: 'story-reel',
          sourceImage: reelScenes[0].imagePath,
          videoUrl: data.videoUrl,
          prompt: reelTitle,
          aspectRatio,
          engine: 'story-reel',
          motionType: 'orbit-roll',
          hasAudio: true,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setVideos((prev) => [newVideo, ...prev]);
        setActiveVideo(newVideo);
        setStudioTab('video');
      }
    } catch (err: any) {
      console.error('Story reel creation error:', err);
    } finally {
      setIsGeneratingReel(false);
    }
  };

  // Attach video to chapter
  const handleAttachToChapter = (chNum: number) => {
    if (!activeVideo || !onAttachVideoToChapter) return;
    onAttachVideoToChapter(chNum, activeVideo.videoUrl);
    setAttachedSuccessCh(chNum);
    setTimeout(() => setAttachedSuccessCh(null), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 select-none">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-gradient-to-br from-indigo-500/20 via-sky-500/20 to-amber-500/20 text-sky-400 rounded-2xl border border-sky-500/30 shadow-lg">
              <Film className="w-7 h-7" />
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Universal AI Video & Free Image Studio
                <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  5 Video Engines • 100% Free Open Models
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Create videos via Google Veo 3.1, Wan 2.1, CogVideoX, HyperFrames 2.5D, and Storyboard Reels with zero required credits.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Studio Mode Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-inner gap-1">
          <button
            onClick={() => setStudioTab('video')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              studioTab === 'video'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>AI Video Generator</span>
          </button>
          <button
            onClick={() => setStudioTab('free-image')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              studioTab === 'free-image'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Free AI Image Studio</span>
          </button>
          <button
            onClick={() => setStudioTab('story-reel')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              studioTab === 'story-reel'
                ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-Scene Story Reel</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MULTI-ENGINE AI VIDEO GENERATOR */}
      {/* ========================================================================= */}
      {studioTab === 'video' && (
        <div className="space-y-8">
          {/* Video Engine Provider Selector Component */}
          <VideoEngineSelector
            selectedEngine={engine}
            onSelectEngine={(newEngine) => {
              setEngine(newEngine);
              if (newEngine === 'Veo') setSubModel('veo-3.1-fast-generate-preview');
              else if (newEngine === 'HuggingFace') setSubModel('Wan 2.1 Open-Weights (14B)');
              else if (newEngine === 'NovAI') setSubModel('NovAI Fantasy Motion v2');
            }}
            selectedSubModel={subModel}
            onSelectSubModel={setSubModel}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Input Builder (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Input Mode Selector (Image-to-Video vs Text-to-Video) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setVideoMode('image-to-video')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                        videoMode === 'image-to-video'
                          ? 'bg-sky-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Image-to-Video</span>
                    </button>
                    <button
                      onClick={() => setVideoMode('text-to-video')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                        videoMode === 'text-to-video'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Direct Text-to-Video</span>
                    </button>
                  </div>

                  {/* Aspect Ratio Switcher */}
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setAspectRatio('16:9')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                        aspectRatio === '16:9' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                      <span>16:9</span>
                    </button>
                    <button
                      onClick={() => setAspectRatio('9:16')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                        aspectRatio === '9:16' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>9:16</span>
                    </button>
                  </div>
                </div>

                {videoMode === 'image-to-video' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Select Source Frame:</span>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload File</span>
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Book Illustrations Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto pr-1">
                      {artSamples.map((art, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSourceImage(art.path)}
                          className={`p-1.5 rounded-xl border text-center transition-all ${
                            sourceImage === art.path
                              ? 'border-sky-500 bg-sky-500/15 text-sky-300 ring-2 ring-sky-500/30'
                              : 'border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400'
                          }`}
                        >
                          <img
                            src={art.path}
                            alt={art.name}
                            className="w-full h-12 object-cover rounded-lg mb-1"
                            onError={(e) => {
                              (e.target as any).style.display = 'none';
                            }}
                          />
                          <span className="text-[9px] block truncate font-medium">{art.name}</span>
                        </button>
                      ))}
                    </div>

                    {sourceImage && (
                      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center max-h-48">
                        <img src={sourceImage} alt="Input Frame" className="max-h-48 object-contain" />
                        <span className="absolute bottom-2 left-2 bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300 px-2 py-0.5 rounded-md font-mono">
                          Input Visual Frame
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 text-xs text-slate-400">
                    <p className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Direct Text-to-Video Enabled</span>
                    </p>
                    <p>
                      Type your description below. The neural generator will synthesize the concept visual frame automatically, then apply camera physics vectors to produce the complete MP4.
                    </p>
                  </div>
                )}
              </div>

              {/* Camera Motion Physics Selector */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-400" />
                  <span>Camera Motion Trajectory & Physics</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CAMERA_MOTIONS.map((motion) => (
                    <button
                      key={motion.id}
                      onClick={() => setMotionType(motion.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        motionType === motion.id
                          ? 'border-sky-500 bg-sky-500/10 text-white ring-1 ring-sky-500/30'
                          : 'border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="font-bold text-[11px] truncate">{motion.label}</div>
                      <div className="text-[9px] text-slate-500 mt-1 line-clamp-1">{motion.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt & Controls */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Motion & Direction Prompt
                    </label>
                    <button
                      onClick={() => {
                        const enhanced = `${prompt}, dramatic cinematic volumetric lighting, raytraced reflections, masterwork film still, 8k`;
                        setPrompt(enhanced);
                      }}
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Boost Prompt</span>
                    </button>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500/60 transition-colors"
                    placeholder="Describe character motion, camera trajectory, lighting shifts, and atmosphere..."
                  />
                </div>

                {/* Duration & Audio Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        <span>Clip Duration</span>
                      </span>
                      <span className="font-mono text-sky-300 font-bold">{duration} Seconds</span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={10}
                      step={1}
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5 text-amber-400" />
                        <span>Include Soundtrack</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Olympian Orchestral AAC</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeAudio}
                      onChange={(e) => setIncludeAudio(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateVideo}
                  disabled={isGenerating || (videoMode === 'image-to-video' && !sourceImage)}
                  className="w-full bg-gradient-to-r from-sky-500 via-indigo-600 to-amber-500 hover:from-sky-400 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Video via {engine} ({subModel})...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      <span>Generate {aspectRatio} Video ({duration}s • {engine} • {subModel.split(' ')[0]})</span>
                    </>
                  )}
                </button>

                {/* Progress Indicator */}
                {isGenerating && (
                  <div className="p-4 bg-slate-950 border border-sky-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-sky-400 flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Rendering Sequence</span>
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

            {/* Right Column: Player & History (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <Film className="w-4 h-4" />
                    <span>AI Video Master Player</span>
                  </span>
                  {activeVideo && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full">
                        {activeVideo.engine} {activeVideo.subModel ? `(${activeVideo.subModel.split(' ')[0]})` : ''} • {activeVideo.aspectRatio}
                      </span>
                      {activeVideo.hasAudio && (
                        <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Volume2 className="w-2.5 h-2.5" />
                          <span>Audio</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {activeVideo ? (
                  <div className="space-y-4">
                    {/* Viewport */}
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
                        muted={false}
                        playsInline
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Metadata & Actions */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200 truncate max-w-xs">{activeVideo.prompt}</span>
                        <span className="text-[10px] font-mono text-slate-500">{activeVideo.createdAt}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
                        <a
                          href={activeVideo.videoUrl}
                          download={`video-${activeVideo.id}.mp4`}
                          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download MP4</span>
                        </a>

                        {project?.manuscript?.chapters && (
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-slate-400 text-[11px]">Attach to:</span>
                            <select
                              onChange={(e) => handleAttachToChapter(Number(e.target.value))}
                              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-amber-300 font-semibold cursor-pointer"
                              defaultValue=""
                            >
                              <option value="" disabled>Choose Chapter</option>
                              {project.manuscript.chapters.map((ch) => (
                                <option key={ch.id} value={ch.chapterNumber}>
                                  Ch. {ch.chapterNumber}: {ch.title.slice(0, 24)}...
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {attachedSuccessCh && (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Saved to Chapter {attachedSuccessCh}!</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <Film className="w-10 h-10 text-slate-700 animate-pulse" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-300">No Video Generated Yet</h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                        Select an engine (Veo, HuggingFace, or NovAI), choose camera trajectory, and hit Generate Video.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Generation History */}
              {videos.length > 0 && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Session Video Renders ({videos.length})</span>
                  </h3>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {videos.map((vid) => (
                      <div
                        key={vid.id}
                        onClick={() => setActiveVideo(vid)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          activeVideo?.id === vid.id
                            ? 'border-sky-500 bg-sky-500/10'
                            : 'border-slate-800 bg-slate-950 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={vid.sourceImage}
                            alt=""
                            className="w-10 h-8 object-cover rounded-lg shrink-0 border border-slate-800"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-200 truncate">{vid.prompt}</p>
                            <span className="text-[10px] font-mono text-slate-500">
                              {vid.engine} {vid.subModel ? `(${vid.subModel.split(' ')[0]})` : ''} • {vid.aspectRatio} • {vid.createdAt}
                            </span>
                          </div>
                        </div>
                        <Play className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FREE AI IMAGE GENERATOR STUDIO */}
      {/* ========================================================================= */}
      {studioTab === 'free-image' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Image Prompt & Controls */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-amber-400" />
                    <h2 className="text-base font-bold text-white">Free AI Image Synthesizer</h2>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Zero Cost • Unlimited
                  </span>
                </div>

                {/* Prompt */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Creative Image Prompt
                  </label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                    placeholder="Describe character pose, scenery, lighting, colors, and art aesthetic..."
                  />
                </div>

                {/* Style Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Artistic Style Preset
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'olympian', label: '🏛️ Olympian Epic' },
                      { id: 'storybook', label: '🎨 Storybook Watercolor' },
                      { id: 'cyberpunk', label: '🤖 Cyberpunk Neon' },
                      { id: '3d-pixar', label: '🎬 3D Pixar Animation' },
                      { id: 'oil-painting', label: '🖌️ Classical Oil' },
                      { id: 'raw', label: '✨ Raw / Custom' }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setImageStyle(st.id)}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all text-left ${
                          imageStyle === st.id
                            ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                            : 'border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio & Engine */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Aspect Ratio</label>
                    <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(['16:9', '1:1', '9:16'] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setImageRatio(r)}
                          className={`flex-1 py-1 rounded-lg font-bold text-center transition-all ${
                            imageRatio === r ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Free AI Model</label>
                    <select
                      value={imageModel}
                      onChange={(e) => setImageModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2 focus:outline-none focus:border-amber-500"
                    >
                      <option value="gemini-nano">Gemini Nano Banana 2.1 (Instant 8K)</option>
                      <option value="flux">FLUX.1 Schnell (Open Source)</option>
                      <option value="sdxl">SDXL Turbo (Community Model)</option>
                    </select>
                  </div>
                </div>

                {/* Generate Image Button */}
                <button
                  onClick={handleGenerateFreeImage}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 disabled:opacity-50 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  {isGeneratingImage ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Free AI Image...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Free AI Image ({imageRatio})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Generated Images Gallery & 1-Click Animate */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>Generated Image Gallery ({generatedImages.length})</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">1-Click Animate Ready</span>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {generatedImages.map((img) => (
                    <div
                      key={img.id}
                      className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-all"
                    >
                      <div className="relative rounded-lg overflow-hidden bg-black flex items-center justify-center max-h-60 border border-slate-800/80">
                        <img src={img.imageUrl} alt={img.prompt} className="max-h-60 w-full object-cover" />
                        <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-[9px] text-amber-300 px-2 py-0.5 rounded font-mono">
                          {img.model} • {img.style}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <p className="font-semibold text-slate-200 line-clamp-1 flex-1 pr-2">{img.prompt}</p>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">{img.createdAt}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
                        <button
                          onClick={() => {
                            setSourceImage(img.imageUrl);
                            setStudioTab('video');
                            setPrompt(`Cinematic slow dolly zoom with dynamic atmospheric particles: ${img.prompt}`);
                          }}
                          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Animate to Video</span>
                        </button>

                        <a
                          href={img.imageUrl}
                          download={`ai-image-${img.id}.png`}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-slate-800"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-400" />
                          <span>Download</span>
                        </a>

                        {project?.manuscript?.chapters && (
                          <button
                            onClick={() => {
                              if (onAttachVideoToChapter && project.manuscript?.chapters?.[0]) {
                                onAttachVideoToChapter(1, img.imageUrl);
                              }
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-slate-800"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Save to Book</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MULTI-SCENE STORYBOARD TRAILER REEL */}
      {/* ========================================================================= */}
      {studioTab === 'story-reel' && (
        <div className="space-y-8">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-rose-400" />
                  <span>Cinematic Multi-Scene Book Trailer Maker</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Stitch 2 to 5 book chapter illustrations together into a seamless animated teaser trailer with crossfades, camera movements, and orchestral score.
                </p>
              </div>
              <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-full font-bold">
                Multi-Shot Sequencing Engine
              </span>
            </div>

            {/* Trailer Title */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Trailer Title / Project Name
              </label>
              <input
                type="text"
                value={reelTitle}
                onChange={(e) => setReelTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Scenes Strip */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sequenced Story Scenes ({reelScenes.length} of 5 max)
                </label>
                <span className="text-[11px] text-slate-500 font-mono">3 Seconds per Scene • Automated Transitions</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {reelScenes.map((scene, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 relative group">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-rose-300">Scene {idx + 1}</span>
                      {reelScenes.length > 2 && (
                        <button
                          onClick={() => setReelScenes(reelScenes.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <img
                      src={scene.imagePath}
                      alt={scene.caption}
                      className="w-full h-24 object-cover rounded-lg border border-slate-800"
                    />
                    <input
                      type="text"
                      value={scene.caption}
                      onChange={(e) => {
                        const updated = [...reelScenes];
                        updated[idx].caption = e.target.value;
                        setReelScenes(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 text-[11px] text-slate-200 px-2 py-1 rounded focus:outline-none"
                      placeholder="Scene caption / title..."
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Add Scene Shortcut from Project Illustrations */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400">Click to add illustration to trailer:</span>
              <div className="flex flex-wrap gap-2">
                {artSamples.map((art, idx) => (
                  <button
                    key={idx}
                    disabled={reelScenes.length >= 5}
                    onClick={() => {
                      if (reelScenes.length < 5) {
                        setReelScenes([...reelScenes, { imagePath: art.path, caption: art.name }]);
                      }
                    }}
                    className="p-1.5 bg-slate-950 border border-slate-800 hover:border-rose-500/50 rounded-xl text-left text-xs flex items-center gap-2 transition-all disabled:opacity-40"
                  >
                    <img src={art.path} alt="" className="w-8 h-8 object-cover rounded" />
                    <span className="text-[11px] text-slate-300 font-medium">{art.name}</span>
                    <Plus className="w-3 h-3 text-rose-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Synthesize Trailer Button */}
            <button
              onClick={handleGenerateStoryReel}
              disabled={isGeneratingReel || reelScenes.length === 0}
              className="w-full bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-sm py-4 rounded-xl shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {isGeneratingReel ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Multi-Scene Trailer ({reelScenes.length * 3}s MP4 with Score)...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  <span>Synthesize Multi-Scene Trailer ({reelScenes.length * 3}s MP4 • Orchestral Score)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
