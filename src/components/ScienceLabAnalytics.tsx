import React from 'react';
import { PublishingProject } from '../types/storyforge';
import { 
  BarChart3, Award, AlertTriangle, CheckCircle2, Star, 
  TrendingUp, BookOpen, ShieldCheck, Cpu 
} from 'lucide-react';

interface ScienceLabAnalyticsProps {
  project: PublishingProject;
}

export const ScienceLabAnalytics: React.FC<ScienceLabAnalyticsProps> = ({ project }) => {
  const score = project.scorecard;
  const sim = project.analytics;

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
    </div>
  );
};
