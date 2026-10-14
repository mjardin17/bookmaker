import React from 'react';
import { PublishingProject } from '../types/storyforge';
import { 
  CheckCircle2, Clock, PlayCircle, ArrowRight, Sparkles, 
  Layers, ShieldAlert, Cpu, BarChart3, Rocket
} from 'lucide-react';

interface PipelineTrackerProps {
  project: PublishingProject;
  onAdvanceStep: (stepNumber: number) => void;
  onRunStageAudit: (stageName: string) => void;
}

export const PIPELINE_STAGES = [
  { id: 1, name: 'Market Research', category: 'Strategy', desc: 'Identify reader demographics, market gaps, and genre demand benchmarks.' },
  { id: 2, name: 'Trend Analysis', category: 'Strategy', desc: 'Cross-reference bestselling themes, Amazon KDP rank trends, and tropes.' },
  { id: 3, name: 'Keyword Research', category: 'Strategy', desc: 'Mine high-volume, low-competition Amazon search phrases & BISAC categories.' },
  { id: 4, name: 'Idea Generation', category: 'Concept', desc: 'Synthesize high-concept premise, title, educational goals, and theme.' },
  { id: 5, name: 'Story Council Debate', category: 'Review', desc: 'Trigger 9-specialist AI council consensus audit on premise and stakes.' },
  { id: 6, name: 'Outline & Architecture', category: 'Writing', desc: 'Construct chapter-by-chapter pacing maps, story beats, and emotional arcs.' },
  { id: 7, name: 'Chapter Writing', category: 'Writing', desc: 'Generate and refine full manuscript prose with vivid sensory details.' },
  { id: 8, name: 'Consistency Review', category: 'Audit', desc: 'Run Lore Bible Continuity Guard for temporal, geographical, and rule errors.' },
  { id: 9, name: 'Character & Dialogue', category: 'Audit', desc: 'Verify linguistic fingerprints, character arc shifts, and emotional resonance.' },
  { id: 10, name: 'Illustration Planning', category: 'Art', desc: 'Define visual DNA, key scene storyboards, and character sheets.' },
  { id: 11, name: 'Image Prompt Packs', category: 'Art', desc: 'Generate multi-engine prompts for Midjourney, DALL-E 3, Flux, SD, and Recraft.' },
  { id: 12, name: 'Illustration Studio', category: 'Art', desc: 'Assemble cover art briefs, scene graphics, and thumbnail compositions.' },
  { id: 13, name: 'Editing & Polishing', category: 'Refinement', desc: 'Fine-tune prose rhythm, vocabulary level, and sensory immersion.' },
  { id: 14, name: 'Grammar & Fact Check', category: 'Refinement', desc: 'Automated proofreading, spell check, and factual verification.' },
  { id: 15, name: 'KDP Formatting', category: 'Publishing', desc: 'Configure trim sizes (5x8, 6x9, 8.5x11), bleed, margins, and typography.' },
  { id: 16, name: 'Cover Typography', category: 'Publishing', desc: 'Design title typography, author pen name, back blurb layout, and barcode.' },
  { id: 17, name: 'Metadata & SEO', category: 'Publishing', desc: 'Finalize KDP title, 7 backend keywords, BISAC codes, and HTML description.' },
  { id: 18, name: 'Publishing Preparation', category: 'Publishing', desc: 'Compile print-ready PDF, digital EPUB, and editable DOCX manuscripts.' },
  { id: 19, name: 'Marketing & Campaign', category: 'Launch', desc: 'Generate Instagram, TikTok, email nurture sequences, and press release.' },
  { id: 20, name: 'Video & Merch Factory', category: 'Launch', desc: 'Produce YouTube trailer script, Reels hooks, activity sheets, and merch prompts.' }
];

export const PipelineTracker: React.FC<PipelineTrackerProps> = ({
  project,
  onAdvanceStep,
  onRunStageAudit
}) => {
  const currentStep = project.currentStep || 7;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Empire OS 20-Stage Pipeline Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Current Stage: {currentStep}/20
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
              {project.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {project.goal}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onRunStageAudit(PIPELINE_STAGES[currentStep - 1]?.name || 'Current Stage')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Run Stage AI Audit
            </button>
            <button
              onClick={() => onAdvanceStep(Math.min(20, currentStep + 1))}
              disabled={currentStep >= 20}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
            >
              Advance Stage
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>Progress Completion: {Math.round((currentStep / 20) * 100)}%</span>
            <span>{currentStep === 20 ? '🎉 Publishing Ready!' : `${20 - currentStep} stages remaining`}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 20) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 20-Stage Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PIPELINE_STAGES.map((stage) => {
          const isDone = stage.id < currentStep;
          const isCurrent = stage.id === currentStep;

          return (
            <div
              key={stage.id}
              onClick={() => onAdvanceStep(stage.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                isCurrent
                  ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                  : isDone
                  ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-900 text-slate-600 hover:border-slate-800'
              }`}
            >
              {/* Top Row: Stage Number & Status */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950'
                    : isDone
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  STAGE {stage.id.toString().padStart(2, '0')}
                </span>

                <div className="flex items-center gap-1">
                  {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isCurrent && <PlayCircle className="w-4 h-4 text-amber-400 animate-pulse" />}
                  {!isDone && !isCurrent && <Clock className="w-4 h-4 text-slate-600" />}
                </div>
              </div>

              <h3 className={`text-sm font-bold tracking-tight mb-1 ${
                isCurrent ? 'text-amber-300' : isDone ? 'text-slate-200' : 'text-slate-500'
              }`}>
                {stage.name}
              </h3>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {stage.desc}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>{stage.category}</span>
                <span className="group-hover:text-amber-400 transition-colors">
                  {isCurrent ? 'Active Now' : isDone ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
