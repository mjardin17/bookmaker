import React, { useState } from 'react';
import { PublishingProject } from '../types/storyforge';
import { 
  BarChart3, Award, AlertTriangle, CheckCircle2, Star, 
  TrendingUp, BookOpen, ShieldCheck, Cpu, Globe, Search, RefreshCw, ExternalLink
} from 'lucide-react';

interface ScienceLabAnalyticsProps {
  project: PublishingProject;
}

export const ScienceLabAnalytics: React.FC<ScienceLabAnalyticsProps> = ({ project }) => {
  const score = project.scorecard;
  const sim = project.analytics;

  // Google Search Grounding Fact-Checking State (gemini-3.8-flash + googleSearch)
  const [auditQuery, setAuditQuery] = useState<string>(
    "Atmospheric physics of lightning discharge, thunder speed at 20C, and ball lightning phenomena"
  );
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditReport, setAuditReport] = useState<any | null>(null);

  const handleRunScienceAudit = async (queryText?: string) => {
    const q = queryText || auditQuery;
    if (!q.trim()) return;
    setIsAuditing(true);
    try {
      const res = await fetch('/api/gemini/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          topic: 'science_meteorology',
          bookTitle: project.name || 'Little Zeus Gets His Thunderbolt'
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAuditReport(data);
    } catch (e) {
      console.warn('Science grounding error:', e);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                Story Science Lab Audit
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Status: {score.marketReadiness || 'Masterpiece Standard'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              100-Point Publishing Quality Scorecard
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Algorithmic audit evaluating Flesch-Kincaid grade level, emotional resonance, educational scaffolding, pacing velocity, character consistency, and franchise potential.
            </p>
          </div>

          <div className="bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 p-4 rounded-2xl text-center shrink-0">
            <span className="text-[10px] text-amber-400 font-mono uppercase block">Overall Score</span>
            <span className="text-3xl font-extrabold text-amber-300 font-mono">
              {score.overallScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Radar Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Readability', val: score.readabilityIndex, suffix: '/100' },
          { label: 'Emotional Impact', val: score.emotionalImpactScore, suffix: '/100' },
          { label: 'STEM / Ed Scaffolding', val: score.educationalScaffoldingScore, suffix: '/100' },
          { label: 'Character Arc', val: score.characterConsistencyScore, suffix: '/100' },
          { label: 'Pacing Velocity', val: score.pacingScore, suffix: '/100' },
          { label: 'Franchise Index', val: score.franchisePotential, suffix: '/100' }
        ].map((item, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center space-y-1">
            <span className="text-[10px] text-slate-400 font-mono block line-clamp-1">{item.label}</span>
            <span className="text-lg font-bold text-slate-100 font-mono">{item.val}{item.suffix}</span>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-400 h-full transition-all"
                style={{ width: `${item.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Market Simulator & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Market Sim */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <TrendingUp className="w-4 h-4" />
            30-Day Sales & Royalty Simulation
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-500 font-mono block">Projected Units (Month 1)</span>
              <span className="text-lg font-bold text-slate-100">{sim.projectedSalesMonth1 || 1450} Units</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-500 font-mono block">Projected Royalties (USD)</span>
              <span className="text-lg font-bold text-emerald-400">${sim.projectedRoyaltiesMonth1USD || 9932} USD</span>
            </div>
          </div>
        </div>

        {/* Reader Reviews Sim */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-amber-400 font-mono uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Star className="w-4 h-4" />
            Simulated Reader & Educator Reviews
          </h3>

          <div className="space-y-2">
            {sim.mockReviews?.map((rev, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{rev.reviewerName}</span>
                  <div className="flex text-amber-400 text-xs">
                    {'★'.repeat(rev.rating)}
                  </div>
                </div>
                <p className="text-slate-300 italic">"{rev.reviewText}"</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Google Search Grounding: Science & Lore Verification (gemini-3.8-flash + googleSearch) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl">
              <Globe className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Google Search Science & Lore Audit</span>
                <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded-full font-bold">
                  gemini-3.8-flash + googleSearch
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Ground book physics, atmospheric phenomena, and classical mythological lore against verified scientific research and archeological records.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleRunScienceAudit()}
            disabled={isAuditing || !auditQuery.trim()}
            className="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 shrink-0"
          >
            {isAuditing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Fact-Checking with Google...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Run Fact-Check Audit</span>
              </>
            )}
          </button>
        </div>

        {/* Fact-Check Presets */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Science Fact-Check Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              "Atmospheric lightning temperature vs sun surface comparison",
              "Thunder speed in 20°C air and 5-second per mile distance rule",
              "Ball lightning plasma duration and electrical spark physics",
              "Ancient Delphi archaeological bronze metallurgy and Greek thunderbolts"
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAuditQuery(preset);
                  handleRunScienceAudit(preset);
                }}
                className="bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-sky-500/50 text-xs px-3 py-1.5 rounded-lg transition-all text-left"
              >
                🔬 {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={auditQuery}
            onChange={(e) => setAuditQuery(e.target.value)}
            placeholder="Enter custom scientific hypothesis to ground via Google Search..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Audit Report View */}
        {auditReport && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            {/* Search Queries Executed */}
            {auditReport.searchQueries && auditReport.searchQueries.length > 0 && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Search className="w-3 h-3 text-sky-400" />
                  <span>Google Search Queries Executed:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {auditReport.searchQueries.map((q: string, i: number) => (
                    <span key={i} className="text-[11px] font-mono bg-slate-900 border border-slate-700/80 px-2 py-0.5 rounded text-sky-300">
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            {auditReport.sources && auditReport.sources.length > 0 && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3 text-emerald-400" />
                  <span>Verified Research Sources:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {auditReport.sources.map((s: any, i: number) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-medium bg-slate-900 hover:bg-slate-800 border border-sky-500/30 hover:border-sky-400 px-2.5 py-1 rounded-lg text-sky-300 flex items-center gap-1 transition-colors"
                    >
                      <Globe className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="truncate max-w-xs">{s.title || s.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Text Report */}
            <div className="p-5 bg-slate-950/90 border border-slate-800 rounded-xl">
              <div className="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-200">
                {auditReport.text}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
