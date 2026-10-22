import React from 'react';
import {
  Zap,
  Globe,
  Sparkles,
  Layers,
  Cpu,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Film,
  Flame,
  Award,
  Info
} from 'lucide-react';

export type VideoEngineProvider = 'Veo' | 'HuggingFace' | 'NovAI' | 'NVIDIA';

export interface VideoEngineDetails {
  id: VideoEngineProvider;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<any>;
  description: string;
  strengths: string[];
  supportedResolutions: string[];
  latency: string;
  pricing: string;
  availableModels: string[];
  accentColor: string;
  activeGlow: string;
}

export const VIDEO_ENGINE_PROVIDERS: VideoEngineDetails[] = [
  {
    id: 'Veo',
    name: 'Google Veo 3.1',
    tagline: 'Flagship Neural Video Generation',
    badge: 'Official Google SDK',
    badgeColor: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    icon: Zap,
    description: "Google's state-of-the-art neural diffusion architecture with cinematic camera controls, character persistence, and 720p optical flow vectors.",
    strengths: ['High character consistency', 'Realistic cinematic physics', 'Natural lighting & reflections'],
    supportedResolutions: ['720p (16:9)', '720p (9:16)'],
    latency: '10-25s',
    pricing: 'Official API Access',
    availableModels: ['veo-3.1-fast-generate-preview', 'veo-3.1-lite-generate-preview'],
    accentColor: 'from-sky-500 to-indigo-600',
    activeGlow: 'border-sky-500 bg-sky-500/10 shadow-sky-500/20'
  },
  {
    id: 'NVIDIA',
    name: 'NVIDIA Cosmos 1.0',
    tagline: 'Physical AI & World Foundation Video Diffusion',
    badge: 'NVIDIA NIM • GPU Accelerated',
    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    icon: Cpu,
    description: "NVIDIA's state-of-the-art Cosmos World Foundation diffusion architecture (Cosmos-Diffusion-7B and Cosmos-Predict-14B) running on NVIDIA TensorRT & H100 cloud infrastructure for hyper-realistic physics, camera kinematics, and high dynamic range.",
    strengths: ['Physical AI & real-world dynamics', 'TensorRT-optimized 2-second inference', 'Zero artifact optical flow & volumetric rendering'],
    supportedResolutions: ['1080p Ultra (16:9)', '720p Reel (9:16)'],
    latency: '1.5-3s (NVIDIA NIM)',
    pricing: 'NVIDIA NIM API (Free Developer Tier)',
    availableModels: ['nvidia/cosmos-diffusion-7b', 'nvidia/cosmos-predict-14b', 'nvidia/cosmos-nemotron-34b'],
    accentColor: 'from-emerald-500 to-teal-600',
    activeGlow: 'border-emerald-500 bg-emerald-500/10 shadow-emerald-500/20'
  },
  {
    id: 'HuggingFace',
    name: 'Hugging Face Hub',
    tagline: 'Open Weights Video Diffusion',
    badge: 'Open Source • 100% Free',
    badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    icon: Globe,
    description: 'Open-source diffusion ecosystem running Alibaba Wan 2.1, THUDM CogVideoX 1.5, and Lightricks LTX-Video. High throughput with zero quota limits.',
    strengths: ['100% Free & Unlimited', 'Wan 2.1 & CogVideoX open weights', 'Custom camera motion paths'],
    supportedResolutions: ['1280x720 (16:9)', '720x1280 (9:16)'],
    latency: '1-3s (Fast Router)',
    pricing: 'Free Community Hub',
    availableModels: ['Wan 2.1 Open-Weights (14B)', 'CogVideoX-5B', 'LTX-Video 2.0', 'HyperFrames Kinetic'],
    accentColor: 'from-amber-500 to-orange-600',
    activeGlow: 'border-amber-500 bg-amber-500/10 shadow-amber-500/20'
  },
  {
    id: 'NovAI',
    name: 'NovAI Motion',
    tagline: 'Stylized Anime & Fantasy Dynamics',
    badge: 'Stylized Anime • Fantasy',
    badgeColor: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    icon: Sparkles,
    description: 'Specialized stylized generative motion engine fine-tuned for fantasy book illustrations, mythological line art, glowing aura surges, and dynamic character emotion.',
    strengths: ['Stylized anime & storybook aesthetic', 'Volumetric particle glow & aura pulses', 'Expressive character facial animation'],
    supportedResolutions: ['1080p Studio (16:9)', 'Vertical Reel (9:16)'],
    latency: '2-4s',
    pricing: 'Pro Visual Synthesis',
    availableModels: ['NovAI Fantasy Motion v2', 'NovAI Anime Kinematics', 'NovAI Aura Surge'],
    accentColor: 'from-purple-500 to-pink-600',
    activeGlow: 'border-purple-500 bg-purple-500/10 shadow-purple-500/20'
  }
];

interface VideoEngineSelectorProps {
  selectedEngine: VideoEngineProvider;
  onSelectEngine: (engine: VideoEngineProvider) => void;
  selectedSubModel?: string;
  onSelectSubModel?: (subModel: string) => void;
  className?: string;
}

export const VideoEngineSelector: React.FC<VideoEngineSelectorProps> = ({
  selectedEngine,
  onSelectEngine,
  selectedSubModel,
  onSelectSubModel,
  className = ''
}) => {
  const activeDetails = VIDEO_ENGINE_PROVIDERS.find((e) => e.id === selectedEngine) || VIDEO_ENGINE_PROVIDERS[0];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-400" />
          <span>AI Video Engine Provider</span>
        </label>
        <span className="text-[11px] font-mono text-slate-400">
          Active Provider: <strong className="text-white font-bold">{activeDetails.name}</strong>
        </span>
      </div>

      {/* 3 Main Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {VIDEO_ENGINE_PROVIDERS.map((provider) => {
          const IconComp = provider.icon;
          const isSelected = selectedEngine === provider.id;

          return (
            <button
              key={provider.id}
              onClick={() => {
                onSelectEngine(provider.id);
                if (onSelectSubModel && provider.availableModels[0]) {
                  onSelectSubModel(provider.availableModels[0]);
                }
              }}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between group ${
                isSelected
                  ? `${provider.activeGlow} shadow-xl ring-2 ring-white/10 scale-[1.01]`
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:border-slate-700'
              }`}
            >
              {/* Selected Marker */}
              {isSelected && (
                <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded-full border border-white/20">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Selected</span>
                </span>
              )}

              <div>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span
                    className={`p-2 rounded-xl transition-all ${
                      isSelected
                        ? `bg-gradient-to-br ${provider.accentColor} text-white shadow-md`
                        : 'bg-slate-800 text-slate-300 group-hover:text-white'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className={`font-black text-sm tracking-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {provider.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">{provider.tagline}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                  {provider.description}
                </p>
              </div>

              {/* Provider Specs Badges */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className={`px-2 py-0.5 rounded-full border ${provider.badgeColor}`}>
                  {provider.badge}
                </span>
                <span className="text-slate-500">⚡ {provider.latency}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sub-Model Selector & Deep Capabilities Bar */}
      <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Target Model:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {activeDetails.availableModels.map((modelName) => (
              <button
                key={modelName}
                onClick={() => onSelectSubModel && onSelectSubModel(modelName)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                  selectedSubModel === modelName || (!selectedSubModel && modelName === activeDetails.availableModels[0])
                    ? 'bg-slate-800 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {modelName}
              </button>
            ))}
          </div>
        </div>

        {/* Engine Highlights */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium shrink-0">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>{activeDetails.pricing}</span>
          </span>
          <span className="text-slate-600">•</span>
          <span>{activeDetails.supportedResolutions[0]}</span>
        </div>
      </div>
    </div>
  );
};
