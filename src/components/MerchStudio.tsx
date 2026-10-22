import React from 'react';
import { PublishingProject } from '../types/storyforge';
import { Shirt, Coffee, FileSpreadsheet, Sparkles, Download, Check, Video, ArrowRight } from 'lucide-react';

interface MerchStudioProps {
  project: PublishingProject;
  onNavigateToBossLister?: () => void;
}

export const MerchStudio: React.FC<MerchStudioProps> = ({ project, onNavigateToBossLister }) => {
  const merch = project.merchPack;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Shirt className="w-3 h-3" />
                Merchandise & Activity Studio
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Franchise Merch & Educational Activity Engine
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Generates POD T-shirt graphic prompts, color-changing mug designs, coloring pages, mazes, and printable teacher guides.
            </p>
          </div>

          {onNavigateToBossLister && (
            <button
              onClick={onNavigateToBossLister}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>Launch Commercial Generator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Apparel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-amber-400 font-mono uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Shirt className="w-4 h-4" />
            Print-On-Demand Apparel
          </h3>

          {merch.tShirtPrompts?.map((ts, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-xs font-bold text-slate-200 block">{ts.title}</span>
              <p className="text-[11px] text-slate-400 font-mono">{ts.designPrompt}</p>
            </div>
          ))}
        </div>

        {/* Drinkware */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-sky-400 font-mono uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Coffee className="w-4 h-4" />
            Custom Drinkware
          </h3>

          {merch.mugPrompts?.map((mug, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-xs font-bold text-slate-200 block">{mug.title}</span>
              <p className="text-[11px] text-slate-400 font-mono">{mug.designPrompt}</p>
            </div>
          ))}
        </div>

        {/* Activity Pages */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <FileSpreadsheet className="w-4 h-4" />
            Printable Activity Book
          </h3>

          {merch.activityPages?.map((act, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-xs font-bold text-slate-200 block">{act.title} ({act.type})</span>
              <p className="text-[11px] text-slate-400">{act.promptOrText}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
