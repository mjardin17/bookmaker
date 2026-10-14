import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Trash2, Cpu, Server, Database, Sparkles, Layers, BookOpen } from 'lucide-react';

interface EmpireOSSystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSeedData: () => void;
  onClearData: () => void;
  totalProjectsCount: number;
}

export const EmpireOSSystemStatusModal: React.FC<EmpireOSSystemStatusModalProps> = ({
  isOpen,
  onClose,
  onLoadSeedData,
  onClearData,
  totalProjectsCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 text-slate-100 shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-amber-500 to-sky-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-amber-300 bg-clip-text text-transparent">
                Empire OS Architecture & Capability Audit
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                System Boundary & Operational Status Matrix
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all font-mono"
          >
            ✕ Close
          </button>
        </div>

        {/* Data Reset & Seed Actions */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold text-slate-200 font-mono">
                Empire OS Memory State ({totalProjectsCount} Active Books / Projects)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Demo/seed data is removable. You can reset to a clean workspace or restore default enterprise seed books anytime.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onLoadSeedData();
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Demo Seed Data
            </button>
            <button
              onClick={() => {
                if (confirm('Clear all projects and reset to clean workspace?')) {
                  onClearData();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Data
            </button>
          </div>
        </div>

        {/* Audit Status Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Fully Operational */}
          <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-emerald-800/40 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
                Fully Operational
              </h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 font-mono">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>Empire OS Workspace Header & StoryForge Module Boundary</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>20-Step Production Pipeline Tracker</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>Story Council 9-Expert Consensus Engine</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>Chapter Manuscript AI Generator (`/api/chapter/write`)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>Character & World Bible Visual DNA Engine</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>Shared Semantic Memory Store (`/api/semantic-memory/*`)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>Publishing Export Package Hub (.ZIP file builder)</span>
              </li>
            </ul>
          </div>

          {/* Partially Implemented / Server Proxy */}
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-amber-800/40 pb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                Partially Implemented / Proxy
              </h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 font-mono">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>Server-Side Gemini API Proxy (`GEMINI_API_KEY` supported; graceful local fallback when unconfigured)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>Market Research BISAC Pipeline API (`/api/market-research`)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>Cross-Universe Continuity Guardrail Checker (`/api/continuity/check`)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>LocalStorage Persistence Engine (auto-saves edits to browser memory)</span>
              </li>
            </ul>
          </div>

          {/* Credential / External Dep */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <AlertTriangle className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono">
                External Infrastructure Req.
              </h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 font-mono">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>Direct Amazon KDP API Upload (Requires KDP Seller API key)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>Live Midjourney Discord Bot Auto-Render (Requires Discord Bot webhook)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>ElevenLabs Audio Voice Synthesis (Requires ElevenLabs API Key)</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center pt-2 text-[11px] text-slate-500 font-mono">
          Empire OS Architecture Version 2.5 • StoryForge Module Container • AI Studio Sandbox
        </div>

      </div>
    </div>
  );
};
