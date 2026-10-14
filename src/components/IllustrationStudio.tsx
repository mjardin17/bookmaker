import React, { useState } from 'react';
import { PublishingProject } from '../types/storyforge';
import { 
  Palette, Image as ImageIcon, Camera, Sparkles, Copy, 
  Check, Layers, Eye, RefreshCw 
} from 'lucide-react';

interface IllustrationStudioProps {
  project: PublishingProject;
  onGeneratePrompts: () => void;
}

export const IllustrationStudio: React.FC<IllustrationStudioProps> = ({
  project,
  onGeneratePrompts
}) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [activeEngine, setActiveEngine] = useState<'midjourney' | 'dalle' | 'flux' | 'sd3' | 'recraft'>('midjourney');

  const guide = project.illustrationGuide;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Palette className="w-3 h-3" />
                Illustration & Art Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {guide.styleGuideName || 'Steampunk Realism'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Multi-Engine Image Prompt Studio
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Generates consistent character sheets, cover art, scene storyboards, and color palettes optimized for Midjourney v6, DALL-E 3, Flux Pro, SD3, and Recraft v3.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGeneratePrompts}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Generate Multi-Engine Packs
            </button>
          </div>
        </div>

        {/* Color Palette Preview */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">Art Palette:</span>
          <div className="flex items-center gap-1.5">
            {guide.colorPalette?.map((hex, i) => (
              <div 
                key={i} 
                className="w-6 h-6 rounded-lg border border-slate-700 shadow-sm transition-transform hover:scale-110"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Engine Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
        {[
          { id: 'midjourney', label: 'Midjourney v6.1' },
          { id: 'dalle', label: 'DALL-E 3' },
          { id: 'flux', label: 'Flux Pro' },
          { id: 'sd3', label: 'Stable Diffusion 3' },
          { id: 'recraft', label: 'Recraft v3 Vector' }
        ].map((eng) => (
          <button
            key={eng.id}
            onClick={() => setActiveEngine(eng.id as any)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeEngine === eng.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {eng.label}
          </button>
        ))}
      </div>

      {/* Cover Brief & Prompts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cover Design Brief Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              Book Cover Art Brief
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              KDP Ready
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Title Typography Style</span>
            <p className="text-xs text-slate-300">{guide.coverBrief?.typographyStyle}</p>

            <span className="text-[10px] text-slate-500 font-mono uppercase block pt-2">Cover Prompt ({activeEngine.toUpperCase()})</span>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 relative group font-mono text-xs text-amber-300 leading-relaxed">
              {guide.coverBrief?.coverArtPrompt || 'Book cover illustration, two adventurous boys standing atop giant clockwork gear at sunset...'}
              
              <button
                onClick={() => handleCopy(guide.coverBrief?.coverArtPrompt || '', 'cover')}
                className="absolute right-2 top-2 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-all opacity-80 group-hover:opacity-100"
                title="Copy Prompt"
              >
                {copiedIndex === 'cover' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Character Sheet Prompts Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Camera className="w-4 h-4 text-sky-400" />
              Character Sheet Prompts
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              {guide.characterSheets?.length || 0} Sheets
            </span>
          </div>

          <div className="space-y-3">
            {guide.characterSheets?.map((sheet, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1 relative group">
                <span className="text-xs font-bold text-slate-200 block">{sheet.characterName}</span>
                <p className="text-[11px] text-slate-400 font-mono line-clamp-2">{sheet.modelPrompt}</p>

                <button
                  onClick={() => handleCopy(sheet.modelPrompt, `char-${idx}`)}
                  className="absolute right-2 top-2 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-all opacity-80 group-hover:opacity-100"
                >
                  {copiedIndex === `char-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
