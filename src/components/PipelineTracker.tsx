import React, { useState } from 'react';
import { PublishingProject, StoryForge2StageStatus, ProjectMilestone } from '../types/storyforge';
import { 
  CheckCircle2, Clock, PlayCircle, ArrowRight, Sparkles, 
  Layers, ShieldAlert, Cpu, BarChart3, Rocket, RefreshCw, 
  CheckCheck, AlertCircle, FileCode, Check, Calendar, Flag,
  Target, AlertTriangle, ShieldCheck, ChevronRight
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

export const STORYFORGE2_15_STAGES: StoryForge2StageStatus[] = [
  { stage: 'BRIEF_INGEST', name: '1. Project Brief & Trim Ingest', category: 'Foundation', status: 'COMPLETED', durationMs: 140, outputSummary: 'Brief validated; KDP trim size and target reading level locked', lastRunAt: '2 min ago' },
  { stage: 'MANUSCRIPT_GENERATE', name: '2. Patterson Formula Manuscript Gen', category: 'Manuscript', status: 'COMPLETED', durationMs: 4200, outputSummary: '80-beat micro-chapters drafted with mechanical word counts', lastRunAt: '2 min ago' },
  { stage: 'MANUSCRIPT_VALIDATE', name: '3. Zero-Fluff Formula QA Gate', category: 'Manuscript', status: 'COMPLETED', durationMs: 310, outputSummary: 'Passed dialogue ratio (44%), sentence pace (9.8 words/sent), 0 violations', lastRunAt: '1 min ago' },
  { stage: 'LAYOUT_PLAN', name: '4. Deterministic Layout & Pagination', category: 'Visual & Layout', status: 'COMPLETED', durationMs: 85, outputSummary: 'Zero-AI deterministic page budget calculated across 128 interior pages', lastRunAt: '1 min ago' },
  { stage: 'ILLUSTRATIONS_GENERATE', name: '5. Visual DNA & Character Sheets', category: 'Visual & Layout', status: 'COMPLETED', durationMs: 5400, outputSummary: 'Consistent seed character models and scene prompts rendered', lastRunAt: '1 min ago' },
  { stage: 'COVER_CALCULATE', name: '6. KDP Spine & Bleed Math Engine', category: 'Cover Package', status: 'COMPLETED', durationMs: 45, outputSummary: 'Exact spine width (0.320") calculated with 0.125" standard bleed', lastRunAt: '1 min ago' },
  { stage: 'COVER_RENDER', name: '7. 9-Variant Cover Package Renderer', category: 'Cover Package', status: 'COMPLETED', durationMs: 2890, outputSummary: 'Generated full wrap, front, back, spine, Kindle, and 4 social formats', lastRunAt: '1 min ago' },
  { stage: 'EPUB_COMPILE', name: '8. EPUB3 Structural Compiler', category: 'Export & QA', status: 'COMPLETED', durationMs: 620, outputSummary: 'Reflowable EPUB3 container with NCX & NAV landmarks built', lastRunAt: 'Just now' },
  { stage: 'EPUB_VALIDATE', name: '9. EPUB Quality & XML Validator', category: 'Export & QA', status: 'COMPLETED', durationMs: 190, outputSummary: 'W3C EpubCheck structural validation: 0 errors, 0 warnings', lastRunAt: 'Just now' },
  { stage: 'PDF_COMPILE', name: '10. Print-Ready PDF/X-1a Engine', category: 'Export & QA', status: 'COMPLETED', durationMs: 1450, outputSummary: '300 DPI CMYK interior PDF compiled with embedded fonts', lastRunAt: 'Just now' },
  { stage: 'PDF_VALIDATE', name: '11. PDF Geometry & Font Validator', category: 'Export & QA', status: 'COMPLETED', durationMs: 230, outputSummary: 'Trim box, bleed box, and margin safety verified against printer specs', lastRunAt: 'Just now' },
  { stage: 'MARKETING_PACKAGE', name: '12. Per-Platform Social Kit & UTMs', category: 'Marketing & Video', status: 'COMPLETED', durationMs: 780, outputSummary: 'Tailored copy, hashtags, CTAs, and compliance disclosures prepared', lastRunAt: 'Just now' },
  { stage: 'VIDEO_COMMERCIAL_GENERATE', name: '13. 15s/30s/60s Video Trailers', category: 'Marketing & Video', status: 'COMPLETED', durationMs: 6100, outputSummary: 'Rendered 3 aspect ratios (16:9, 9:16, 1:1) with burned-in subtitles', lastRunAt: 'Just now' },
  { stage: 'HUMAN_APPROVAL_GATE', name: '14. Human QA & Signoff Gate', category: 'Distribution', status: 'RUNNING', durationMs: 0, outputSummary: 'Awaiting human authorization before external platform dispatch', lastRunAt: 'Active' },
  { stage: 'DISTRIBUTION_DISPATCH', name: '15. Multi-Platform Dispatch', category: 'Distribution', status: 'PENDING', durationMs: 0, outputSummary: 'KDP, D2D, Payhip, and manual upload bundles ready for trigger' }
];

export const INITIAL_MILESTONES: ProjectMilestone[] = [
  {
    id: 'm1',
    phaseNumber: 1,
    title: 'Market Intelligence & Concept Lock',
    subtitle: 'Niche analysis, KDP keyword mining & Grand Council concept audit',
    category: 'Foundation',
    stages: [1, 2, 3, 4, 5],
    sf2Stages: ['BRIEF_INGEST'],
    targetDaysFromStart: 3,
    targetDeadline: '2026-10-18',
    status: 'COMPLETED',
    progressPercent: 100,
    criticalPath: true,
    deliverables: [
      { id: 'd1_1', label: 'Amazon KDP Genre Benchmark & BISAC Code Selection', completed: true, requiredForNext: true },
      { id: 'd1_2', label: '7 High-Volume Backend Search Keywords Mined', completed: true, requiredForNext: true },
      { id: 'd1_3', label: 'Grand Council 9-Specialist Premise Consensus Audit', completed: true, requiredForNext: true }
    ]
  },
  {
    id: 'm2',
    phaseNumber: 2,
    title: 'Patterson 80-Beat Architecture & Continuity Guard',
    subtitle: 'Micro-chapter pacing map, character voiceprints & world lore bible',
    category: 'Architecture',
    stages: [6],
    sf2Stages: ['BRIEF_INGEST'],
    targetDaysFromStart: 7,
    targetDeadline: '2026-10-22',
    status: 'COMPLETED',
    progressPercent: 100,
    criticalPath: true,
    dependsOnMilestoneId: 'm1',
    deliverables: [
      { id: 'd2_1', label: '80-Beat Chapter Pacing Outline with Tension Curves', completed: true, requiredForNext: true },
      { id: 'd2_2', label: 'Lore Bible Continuity Rules & Faction Logic Locked', completed: true, requiredForNext: true },
      { id: 'd2_3', label: 'Character Voiceprints & Linguistic Fingerprints Verified', completed: true, requiredForNext: true }
    ]
  },
  {
    id: 'm3',
    phaseNumber: 3,
    title: 'Full Manuscript Generation & Zero-Fluff QA',
    subtitle: 'Mechanical chapter drafting, dialogue ratio enforcement & 5-type cliffhangers',
    category: 'Manuscript',
    stages: [7, 8, 9],
    sf2Stages: ['MANUSCRIPT_GENERATE', 'MANUSCRIPT_VALIDATE'],
    targetDaysFromStart: 15,
    targetDeadline: '2026-10-30',
    status: 'IN_PROGRESS',
    progressPercent: 78,
    criticalPath: true,
    dependsOnMilestoneId: 'm2',
    deliverables: [
      { id: 'd3_1', label: 'Complete Chapter Drafts (Target: 500w/ch Middle Grade)', completed: true, requiredForNext: true },
      { id: 'd3_2', label: 'Zero-Fluff QA: 40-50% Dialogue Ratio Passed', completed: true, requiredForNext: true },
      { id: 'd3_3', label: 'Every Chapter Ends with Verified Dramatic Cliffhanger', completed: false, requiredForNext: true },
      { id: 'd3_4', label: 'Masterpiece Standard Compliance Score >= 92/100', completed: false, requiredForNext: false }
    ]
  },
  {
    id: 'm4',
    phaseNumber: 4,
    title: 'Visual DNA, Scene Storyboards & KDP Cover Math',
    subtitle: 'Consistent character visual sheets, Midjourney prompt packs & real spine calculation',
    category: 'Visuals',
    stages: [10, 11, 12],
    sf2Stages: ['LAYOUT_PLAN', 'ILLUSTRATIONS_GENERATE', 'COVER_CALCULATE', 'COVER_RENDER'],
    targetDaysFromStart: 21,
    targetDeadline: '2026-11-05',
    status: 'UPCOMING',
    progressPercent: 25,
    criticalPath: false,
    dependsOnMilestoneId: 'm3',
    deliverables: [
      { id: 'd4_1', label: 'Seed Character Model Sheets & Color Palette Anchored', completed: true, requiredForNext: true },
      { id: 'd4_2', label: 'Multi-Engine Image Prompt Packs (Midjourney/Flux/SD)', completed: false, requiredForNext: true },
      { id: 'd4_3', label: 'KDP Mathematical Spine Width & Full Wrap Calculated', completed: false, requiredForNext: true },
      { id: 'd4_4', label: '9-Variant Cover Package (Print Wrap, Kindle, Social)', completed: false, requiredForNext: true }
    ]
  },
  {
    id: 'm5',
    phaseNumber: 5,
    title: 'Print / Digital Formatting & Quality Gates',
    subtitle: 'W3C EpubCheck validation, 300 DPI PDF/X-1a compilation & barcode registration',
    category: 'Production',
    stages: [13, 14, 15, 16, 17, 18],
    sf2Stages: ['EPUB_COMPILE', 'EPUB_VALIDATE', 'PDF_COMPILE', 'PDF_VALIDATE', 'HUMAN_APPROVAL_GATE'],
    targetDaysFromStart: 26,
    targetDeadline: '2026-11-10',
    status: 'UPCOMING',
    progressPercent: 0,
    criticalPath: true,
    dependsOnMilestoneId: 'm4',
    deliverables: [
      { id: 'd5_1', label: 'Reflowable EPUB3 with NCX & NAV Landmarks Compiled', completed: false, requiredForNext: true },
      { id: 'd5_2', label: 'W3C EpubCheck Structural Verification: 0 Errors', completed: false, requiredForNext: true },
      { id: 'd5_3', label: 'PDF/X-1a Print Interior with 0.125" Bleed Verified', completed: false, requiredForNext: true },
      { id: 'd5_4', label: 'Human QA Signoff Gate 14 Authorized', completed: false, requiredForNext: true }
    ]
  },
  {
    id: 'm6',
    phaseNumber: 6,
    title: 'Omnichannel Launch & Multi-Platform Dispatch',
    subtitle: 'Trailer video generation, KDP/D2D dispatch & social marketing machine',
    category: 'Distribution',
    stages: [19, 20],
    sf2Stages: ['MARKETING_PACKAGE', 'VIDEO_COMMERCIAL_GENERATE', 'DISTRIBUTION_DISPATCH'],
    targetDaysFromStart: 30,
    targetDeadline: '2026-11-14',
    status: 'UPCOMING',
    progressPercent: 0,
    criticalPath: false,
    dependsOnMilestoneId: 'm5',
    deliverables: [
      { id: 'd6_1', label: '15s/30s/60s Commercial Video Trailers in 3 Aspect Ratios', completed: false, requiredForNext: true },
      { id: 'd6_2', label: 'Multi-Platform Social Media Kits & Email Sequences', completed: false, requiredForNext: true },
      { id: 'd6_3', label: 'KDP, IngramSpark & Payhip Distribution Bundles Dispatched', completed: false, requiredForNext: true }
    ]
  }
];

export const PipelineTracker: React.FC<PipelineTrackerProps> = ({
  project,
  onAdvanceStep,
  onRunStageAudit
}) => {
  const currentStep = project.currentStep || 7;
  const [pipelineMode, setPipelineMode] = useState<'sf2_ledger' | 'publishing_20' | 'timeline'>('timeline');
  const [sf2Stages, setSf2Stages] = useState<StoryForge2StageStatus[]>(STORYFORGE2_15_STAGES);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(INITIAL_MILESTONES);
  const [approvalGranted, setApprovalGranted] = useState(false);
  const [auditNotice, setAuditNotice] = useState<string | null>(null);

  const handleApproveGate = () => {
    setApprovalGranted(true);
    setSf2Stages(prev => prev.map(s => {
      if (s.stage === 'HUMAN_APPROVAL_GATE') return { ...s, status: 'COMPLETED', outputSummary: 'Approved by lead publisher', lastRunAt: 'Just now' };
      if (s.stage === 'DISTRIBUTION_DISPATCH') return { ...s, status: 'COMPLETED', outputSummary: 'Direct APIs and upload bundles armed', lastRunAt: 'Just now' };
      return s;
    }));
    setAuditNotice('Gate 14 approved! Stage 15 Multi-Platform Dispatch is now unlocked for distribution.');
  };

  const handleToggleDeliverable = (milestoneId: string, deliverableId: string) => {
    setMilestones(prev => prev.map(m => {
      if (m.id !== milestoneId) return m;
      const updatedDeliverables = m.deliverables.map(d => 
        d.id === deliverableId ? { ...d, completed: !d.completed } : d
      );
      const completedCount = updatedDeliverables.filter(d => d.completed).length;
      const progressPercent = Math.round((completedCount / updatedDeliverables.length) * 100);
      const status = progressPercent === 100 ? 'COMPLETED' : progressPercent > 0 ? 'IN_PROGRESS' : 'UPCOMING';
      return {
        ...m,
        deliverables: updatedDeliverables,
        progressPercent,
        status: status as any
      };
    }));
  };

  const completedSf2Count = sf2Stages.filter(s => s.status === 'COMPLETED').length;
  const completedMilestonesCount = milestones.filter(m => m.status === 'COMPLETED').length;
  const overallMilestoneProgress = Math.round(
    milestones.reduce((acc, m) => acc + m.progressPercent, 0) / milestones.length
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                StoryForge 2 Publishing Architecture & Milestones
              </span>
              <span className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
                Repo: mjardin17/storyforge-2
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {pipelineMode === 'timeline'
                  ? `Milestones: ${completedMilestonesCount}/6 Complete (${overallMilestoneProgress}%)`
                  : pipelineMode === 'sf2_ledger'
                  ? `15-Stage Ledger: ${completedSf2Count}/15`
                  : `Current Stage: ${currentStep}/20`}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
              {project.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Track project milestones, real deadlines, Patterson mechanical gates, and 15-stage ledger progression.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Toggle: 3 Modes */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setPipelineMode('timeline')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  pipelineMode === 'timeline'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Milestone Timeline
              </button>
              <button
                onClick={() => setPipelineMode('sf2_ledger')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  pipelineMode === 'sf2_ledger'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                StoryForge 2 Ledger (15)
              </button>
              <button
                onClick={() => setPipelineMode('publishing_20')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  pipelineMode === 'publishing_20'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Classic Stages (20)
              </button>
            </div>

            <button
              onClick={() => onRunStageAudit(
                pipelineMode === 'timeline' 
                  ? 'Milestone Architecture Audit'
                  : pipelineMode === 'sf2_ledger' 
                  ? 'StoryForge 2 Quality Gate' 
                  : PIPELINE_STAGES[currentStep - 1]?.name || 'Current Stage'
              )}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Run Milestone Audit
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>
              {pipelineMode === 'timeline'
                ? `Overall Milestone Completion: ${overallMilestoneProgress}% (${completedMilestonesCount}/6 major phases approved)`
                : pipelineMode === 'sf2_ledger' 
                ? `StoryForge 2 Ledger Completion: ${Math.round((completedSf2Count / 15) * 100)}% (${completedSf2Count}/15 stages passed)`
                : `Publishing Pipeline Completion: ${Math.round((currentStep / 20) * 100)}% (${currentStep}/20)`}
            </span>
            <span>
              {pipelineMode === 'timeline'
                ? 'Target Launch: Nov 14, 2026 (31 Days Remaining)'
                : pipelineMode === 'sf2_ledger' 
                ? (completedSf2Count === 15 ? '🎉 Ready for Multi-Platform Dispatch!' : 'Gate 14 Awaiting Human Signoff')
                : (currentStep === 20 ? '🎉 Publishing Ready!' : `${20 - currentStep} stages remaining`)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ 
                width: `${
                  pipelineMode === 'timeline'
                    ? overallMilestoneProgress
                    : pipelineMode === 'sf2_ledger'
                    ? (completedSf2Count / 15) * 100
                    : (currentStep / 20) * 100
                }%` 
              }}
            />
          </div>
        </div>
      </div>

      {auditNotice && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-200 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{auditNotice}</span>
          </div>
          <button onClick={() => setAuditNotice(null)} className="text-slate-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {/* VIEW 1: MILESTONE TIMELINE & DEADLINES VIEW */}
      {pipelineMode === 'timeline' && (
        <div className="space-y-6">
          
          {/* Milestone Metrics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Completed</span>
                <span className="text-base font-bold text-white">{completedMilestonesCount} / 6 Milestones</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Active Phase</span>
                <span className="text-base font-bold text-amber-300">Phase 3: Manuscript QA</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Critical Path</span>
                <span className="text-base font-bold text-slate-200">Zero-Fluff Cliffhanger Gate</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Target Release</span>
                <span className="text-base font-bold text-purple-200">Nov 14, 2026 (KDP / D2D)</span>
              </div>
            </div>
          </div>

          {/* Timeline Milestones Roadmap */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Project Milestone Roadmap & Scheduled Deadlines
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Click deliverables to toggle status • Automated stage sync
              </span>
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {milestones.map((milestone) => {
                const isCompleted = milestone.status === 'COMPLETED';
                const isInProgress = milestone.status === 'IN_PROGRESS';
                const isUpcoming = milestone.status === 'UPCOMING';

                return (
                  <div key={milestone.id} className="relative group">
                    
                    {/* Node Dot on Timeline Spine */}
                    <div className={`absolute -left-6 sm:-left-8 top-4 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
                        : isInProgress
                        ? 'bg-amber-500 border-amber-300 text-slate-950 ring-4 ring-amber-500/20 shadow-md shadow-amber-500/40 animate-pulse'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span className="text-[10px] font-bold font-mono">{milestone.phaseNumber}</span>
                      )}
                    </div>

                    {/* Milestone Card */}
                    <div className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${
                      isInProgress
                        ? 'bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/60 shadow-xl ring-1 ring-indigo-500/30'
                        : isCompleted
                        ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/50 border-slate-900/80 text-slate-500 hover:border-slate-800'
                    }`}>
                      
                      {/* Top Row: Phase Number, Category, Status, Deadline */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            isInProgress
                              ? 'bg-amber-500 text-slate-950'
                              : isCompleted
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            Phase {milestone.phaseNumber}: {milestone.category}
                          </span>

                          {milestone.criticalPath && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 font-semibold">
                              <Flag className="w-3 h-3" /> Critical Path
                            </span>
                          )}

                          <span className="text-xs text-slate-400 font-mono">
                            Stages: {milestone.stages.join(', ')}
                          </span>
                        </div>

                        {/* Deadline Date Chip */}
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            Target Deadline:
                          </span>
                          <span className={`font-semibold px-2 py-0.5 rounded ${
                            isCompleted
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : isInProgress
                              ? 'text-amber-300 bg-amber-500/10 border border-amber-500/30'
                              : 'text-slate-400 bg-slate-900'
                          }`}>
                            {milestone.targetDeadline}
                          </span>
                        </div>
                      </div>

                      {/* Title & Subtitle */}
                      <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                        {milestone.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {milestone.subtitle}
                      </p>

                      {/* Milestone Progress Bar */}
                      <div className="mt-4 mb-4">
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className="text-slate-400">Milestone Deliverables Progress:</span>
                          <span className={isInProgress ? 'text-amber-300 font-bold' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}>
                            {milestone.progressPercent}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-emerald-400' 
                                : isInProgress 
                                ? 'bg-gradient-to-r from-amber-500 to-indigo-500' 
                                : 'bg-slate-700'
                            }`}
                            style={{ width: `${milestone.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Deliverables Checklist */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                          Required Milestones & Deliverables:
                        </span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {milestone.deliverables.map((deliv) => (
                            <button
                              key={deliv.id}
                              onClick={() => handleToggleDeliverable(milestone.id, deliv.id)}
                              className={`p-2 rounded-xl text-left flex items-start gap-2.5 transition-all text-xs border ${
                                deliv.completed
                                  ? 'bg-slate-950/70 border-emerald-500/30 text-slate-200'
                                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center border transition-all ${
                                deliv.completed 
                                  ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                                  : 'border-slate-700 bg-slate-900'
                              }`}>
                                {deliv.completed && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className={`text-[11px] leading-snug ${deliv.completed ? 'line-through text-slate-400' : ''}`}>
                                {deliv.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs flex-wrap gap-2">
                        <span className="text-[11px] text-slate-500 font-mono">
                          {milestone.dependsOnMilestoneId ? `Depends on Phase ${milestone.phaseNumber - 1}` : 'Initial Milestone'}
                        </span>

                        <div className="flex items-center gap-2">
                          {isInProgress && (
                            <button
                              onClick={() => onAdvanceStep(milestone.stages[milestone.stages.length - 1] + 1)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                            >
                              Advance to Next Phase
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: STORYFORGE 2 15-STAGE STATE LEDGER VIEW */}
      {pipelineMode === 'sf2_ledger' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 px-1">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              StoryForge 2 Execution Pipeline (storyforge2/state.py & pipeline.py)
            </h3>
            <span className="text-xs font-mono text-slate-400">
              State Machine: Deterministic SQLite Stage Ledger • Auto-Resume Enabled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sf2Stages.map((stageItem) => {
              const isCompleted = stageItem.status === 'COMPLETED';
              const isRunning = stageItem.status === 'RUNNING';
              const isGate = stageItem.stage === 'HUMAN_APPROVAL_GATE';

              return (
                <div
                  key={stageItem.stage}
                  className={`p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isRunning
                      ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
                      : isCompleted
                      ? 'bg-slate-900/70 border-slate-800'
                      : 'bg-slate-950/50 border-slate-900 text-slate-500'
                  }`}
                >
                  <div>
                    {/* Top Meta */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {stageItem.category}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <Check className="w-3 h-3" /> PASS
                          </span>
                        )}
                        {isRunning && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                            <Clock className="w-3 h-3" /> IN REVIEW
                          </span>
                        )}
                        {!isCompleted && !isRunning && (
                          <span className="text-[10px] font-mono text-slate-500">PENDING</span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100 mb-1">
                      {stageItem.name}
                    </h4>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {stageItem.outputSummary}
                    </p>
                  </div>

                  {/* Bottom Stats or Action */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{stageItem.durationMs ? `${stageItem.durationMs}ms` : 'Manual Gate'}</span>
                    
                    {isGate && !approvalGranted ? (
                      <button
                        onClick={handleApproveGate}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-md text-[10px] transition-all shadow-sm"
                      >
                        Sign Off Gate 14
                      </button>
                    ) : (
                      <span className="text-slate-400">{stageItem.lastRunAt || 'Ready'}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: CLASSIC 20-STAGE PUBLISHING VIEW */}
      {pipelineMode === 'publishing_20' && (
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
      )}

    </div>
  );
};
