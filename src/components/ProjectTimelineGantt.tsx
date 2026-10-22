import React, { useState, useEffect, useRef } from 'react';
import { ProjectMilestone, PublishingProject, StoryForge2StageStatus } from '../types/storyforge';
import {
  Calendar, Check, CheckCircle2, Clock, Flag, Target, AlertTriangle,
  ChevronDown, ChevronRight, Sparkles, ArrowRight, Eye, Filter,
  Layers, BarChart2, Zap, ShieldCheck, CheckCheck, PlayCircle,
  Link2, Unlink, GitBranch, Share2, Plus, X, ArrowUpRight,
  Info, AlertCircle, HelpCircle, Move, GripVertical, UploadCloud,
  SlidersHorizontal, ArrowLeftRight, RotateCcw, FileText
} from 'lucide-react';

interface ProjectTimelineGanttProps {
  milestones: ProjectMilestone[];
  project: PublishingProject;
  sf2Stages: StoryForge2StageStatus[];
  onToggleDeliverable: (milestoneId: string, deliverableId: string) => void;
  onAdvanceMilestone?: (nextStageId: number) => void;
  onRunAudit?: (milestoneTitle: string) => void;
  onUpdateDependency?: (milestoneId: string, dependsOnId: string | undefined) => void;
  onUpdateMilestoneSchedule?: (milestoneId: string, newStartDay: number, newDurationDays: number, cascadeDependents?: boolean) => void;
  onReorderMilestones?: (reorderedMilestones: ProjectMilestone[]) => void;
  onImportScheduleFiles?: (file: File) => void;
}

// Fixed 30-day timeline configuration: Oct 15, 2026 -> Nov 14, 2026
const PROJECT_START_DATE = new Date('2026-10-15T00:00:00');
const CURRENT_DATE = new Date('2026-10-19T00:00:00'); // Pinned to local time Oct 19, 2026
const TOTAL_PROJECT_DAYS = 30;

// Calculate days between dates
const getDaysBetween = (start: Date, end: Date) => {
  const diffTime = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
};

// Days elapsed from project start to today
const DAYS_ELAPSED = getDaysBetween(PROJECT_START_DATE, CURRENT_DATE);
const TODAY_PERCENTAGE = Math.min(100, Math.max(0, (DAYS_ELAPSED / TOTAL_PROJECT_DAYS) * 100));

// Specific milestone timeline data mappings
const DEFAULT_MILESTONE_TIME_MAP: Record<string, { startDay: number; durationDays: number; owner: string }> = {
  m1: { startDay: 0, durationDays: 3.5, owner: 'Grand Council AI' },
  m2: { startDay: 3.5, durationDays: 4, owner: 'Patterson Formula Arch' },
  m3: { startDay: 6, durationDays: 9.5, owner: 'Manuscript & Zero-Fluff QA' },
  m4: { startDay: 14, durationDays: 7, owner: 'Art DNA & KDP Math' },
  m5: { startDay: 21, durationDays: 5, owner: 'EPUB3 & PDF Validator' },
  m6: { startDay: 26, durationDays: 4, owner: 'Omnichannel Launch AI' }
};

export const formatDisplayDate = (day: number): string => {
  const d = new Date(PROJECT_START_DATE.getTime() + Math.round(day) * 24 * 60 * 60 * 1000);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatIsoDate = (day: number): string => {
  const d = new Date(PROJECT_START_DATE.getTime() + Math.round(day) * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
};

// Check if adding dependency `sourceId depends on candidatePredecessorId` would create a circular loop
export const wouldCreateCycle = (
  sourceId: string,
  candidatePredecessorId: string,
  milestones: ProjectMilestone[]
): boolean => {
  if (sourceId === candidatePredecessorId) return true;
  let current: string | undefined = candidatePredecessorId;
  const visited = new Set<string>();

  while (current) {
    if (current === sourceId) return true;
    if (visited.has(current)) break;
    visited.add(current);
    const m = milestones.find(item => item.id === current);
    current = m?.dependsOnMilestoneId;
  }
  return false;
};

interface DraggingState {
  type: 'move' | 'resize-right';
  milestoneId: string;
  initialMouseX: number;
  initialStartDay: number;
  initialDuration: number;
  currentStartDay: number;
  currentDuration: number;
  trackWidthPx: number;
}

export const ProjectTimelineGantt: React.FC<ProjectTimelineGanttProps> = ({
  milestones,
  project,
  sf2Stages,
  onToggleDeliverable,
  onAdvanceMilestone,
  onRunAudit,
  onUpdateDependency,
  onUpdateMilestoneSchedule,
  onReorderMilestones,
  onImportScheduleFiles
}) => {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('m3');
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({ m3: true });
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);
  const [viewDensity, setViewDensity] = useState<'standard' | 'compact'>('standard');
  const [activeTab, setActiveTab] = useState<'gantt' | 'split' | 'cards'>('gantt');

  // Dynamic Drag-and-Drop Schedule State
  const [scheduleMap, setScheduleMap] = useState<Record<string, { startDay: number; durationDays: number }>>(() => {
    const initial: Record<string, { startDay: number; durationDays: number }> = {};
    milestones.forEach(m => {
      const fallback = DEFAULT_MILESTONE_TIME_MAP[m.id] || { startDay: m.phaseNumber * 4, durationDays: 4, owner: '' };
      initial[m.id] = {
        startDay: typeof m.startDay === 'number' ? m.startDay : fallback.startDay,
        durationDays: typeof m.durationDays === 'number' ? m.durationDays : fallback.durationDays
      };
    });
    return initial;
  });

  const [dragState, setDragState] = useState<DraggingState | null>(null);
  const [cascadeDependents, setCascadeDependents] = useState<boolean>(true);
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);
  const [isDropzoneHovered, setIsDropzoneHovered] = useState<boolean>(false);
  const [draggedCardIndex, setDraggedCardIndex] = useState<number | null>(null);

  // Dependency linking state
  const [showDependencyCurves, setShowDependencyCurves] = useState<boolean>(true);
  const [linkingTargetId, setLinkingTargetId] = useState<string | null>(null);
  const [hoveredDependency, setHoveredDependency] = useState<{ fromId: string; toId: string } | null>(null);
  const [quickLinkNotice, setQuickLinkNotice] = useState<string | null>(null);

  // Sync scheduleMap when milestones prop changes externally
  useEffect(() => {
    setScheduleMap(prev => {
      const updated = { ...prev };
      milestones.forEach(m => {
        const fallback = DEFAULT_MILESTONE_TIME_MAP[m.id] || { startDay: m.phaseNumber * 4, durationDays: 4, owner: '' };
        updated[m.id] = {
          startDay: typeof m.startDay === 'number' ? m.startDay : (prev[m.id]?.startDay ?? fallback.startDay),
          durationDays: typeof m.durationDays === 'number' ? m.durationDays : (prev[m.id]?.durationDays ?? fallback.durationDays)
        };
      });
      return updated;
    });
  }, [milestones]);

  // Window-level mouse listeners for smooth horizontal drag & drop along the timeline
  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.initialMouseX;
      const daysPerPx = TOTAL_PROJECT_DAYS / dragState.trackWidthPx;
      // Snap to 0.5 day intervals
      const dayDelta = Math.round((deltaX * daysPerPx) * 2) / 2;

      if (dragState.type === 'move') {
        const minDay = 0;
        const maxDay = TOTAL_PROJECT_DAYS - dragState.initialDuration;
        const newStart = Math.max(minDay, Math.min(maxDay, dragState.initialStartDay + dayDelta));
        setDragState(prev => prev ? { ...prev, currentStartDay: newStart } : null);
      } else if (dragState.type === 'resize-right') {
        const minDuration = 1;
        const maxDuration = TOTAL_PROJECT_DAYS - dragState.initialStartDay;
        const newDuration = Math.max(minDuration, Math.min(maxDuration, dragState.initialDuration + dayDelta));
        setDragState(prev => prev ? { ...prev, currentDuration: newDuration } : null);
      }
    };

    const handleMouseUp = () => {
      if (!dragState) return;

      const { milestoneId, currentStartDay, currentDuration, initialStartDay, initialDuration } = dragState;

      if (currentStartDay !== initialStartDay || currentDuration !== initialDuration) {
        handleCommitScheduleShift(milestoneId, currentStartDay, currentDuration);
      }

      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, scheduleMap, cascadeDependents, milestones]);

  // Commit schedule shift & optional downstream cascade
  const handleCommitScheduleShift = (
    milestoneId: string,
    newStartDay: number,
    newDurationDays: number
  ) => {
    setScheduleMap(prev => {
      const next = { ...prev, [milestoneId]: { startDay: newStartDay, durationDays: newDurationDays } };

      if (cascadeDependents) {
        let queue = [milestoneId];
        const visited = new Set<string>();

        while (queue.length > 0) {
          const currentId = queue.shift()!;
          visited.add(currentId);
          const currentFinish = next[currentId].startDay + next[currentId].durationDays;

          const directSuccessors = milestones.filter(m => m.dependsOnMilestoneId === currentId);
          for (const succ of directSuccessors) {
            const succSched = next[succ.id] || { startDay: succ.phaseNumber * 4, durationDays: 4 };
            if (succSched.startDay < currentFinish) {
              const shiftDelta = currentFinish - succSched.startDay;
              const shiftedStart = Math.min(TOTAL_PROJECT_DAYS - succSched.durationDays, succSched.startDay + shiftDelta);
              next[succ.id] = {
                startDay: shiftedStart,
                durationDays: succSched.durationDays
              };
              if (!visited.has(succ.id)) {
                queue.push(succ.id);
              }
            }
          }
        }
      }

      return next;
    });

    const m = milestones.find(item => item.id === milestoneId);
    const startStr = formatDisplayDate(newStartDay);
    const endStr = formatDisplayDate(newStartDay + newDurationDays);

    setScheduleNotice(
      `Schedule Shifted: Phase ${m?.phaseNumber || ''} (${m?.title}) moved to ${startStr} – ${endStr} (${newDurationDays}d). ${cascadeDependents ? 'Downstream dependencies auto-aligned.' : ''}`
    );
    setTimeout(() => setScheduleNotice(null), 4500);

    if (onUpdateMilestoneSchedule) {
      onUpdateMilestoneSchedule(milestoneId, newStartDay, newDurationDays, cascadeDependents);
    }
  };

  const handleStartDrag = (
    e: React.MouseEvent,
    milestoneId: string,
    type: 'move' | 'resize-right'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const trackElem = e.currentTarget.closest('.gantt-track-container') as HTMLElement;
    const trackWidthPx = trackElem ? trackElem.getBoundingClientRect().width : 600;
    const currentInfo = scheduleMap[milestoneId] || { startDay: 0, durationDays: 4 };

    setDragState({
      type,
      milestoneId,
      initialMouseX: e.clientX,
      initialStartDay: currentInfo.startDay,
      initialDuration: currentInfo.durationDays,
      currentStartDay: currentInfo.startDay,
      currentDuration: currentInfo.durationDays,
      trackWidthPx
    });
  };

  // Reset all schedules to default baseline
  const handleResetSchedule = () => {
    if (!confirm('Reset all milestone timelines and deadlines to default baseline?')) return;
    const baseline: Record<string, { startDay: number; durationDays: number }> = {};
    milestones.forEach(m => {
      const fb = DEFAULT_MILESTONE_TIME_MAP[m.id] || { startDay: m.phaseNumber * 4, durationDays: 4, owner: '' };
      baseline[m.id] = { startDay: fb.startDay, durationDays: fb.durationDays };
      if (onUpdateMilestoneSchedule) {
        onUpdateMilestoneSchedule(m.id, fb.startDay, fb.durationDays, false);
      }
    });
    setScheduleMap(baseline);
    setScheduleNotice('Timelines reset to standard 30-day baseline schedule.');
    setTimeout(() => setScheduleNotice(null), 3000);
  };

  // Handle Drop in timeline dropzone
  const handleTimelineFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropzoneHovered(false);
    const files = e.dataTransfer.files;
    if (files && files[0] && onImportScheduleFiles) {
      onImportScheduleFiles(files[0]);
    }
  };

  // Card view drag-and-drop reordering
  const handleCardDragStart = (index: number) => {
    setDraggedCardIndex(index);
  };

  const handleCardDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedCardIndex === null || draggedCardIndex === index) return;
    const newItems = [...milestones];
    const draggedItem = newItems.splice(draggedCardIndex, 1)[0];
    newItems.splice(index, 0, draggedItem);
    setDraggedCardIndex(index);
    if (onReorderMilestones) {
      onReorderMilestones(newItems);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedMilestones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedMilestone = milestones.find(m => m.id === selectedMilestoneId) || milestones[0];

  const filteredMilestones = filterCriticalOnly 
    ? milestones.filter(m => m.criticalPath) 
    : milestones;

  const completedCount = milestones.filter(m => m.status === 'COMPLETED').length;
  const inProgressCount = milestones.filter(m => m.status === 'IN_PROGRESS').length;
  const overallProgress = Math.round(
    milestones.reduce((acc, m) => acc + m.progressPercent, 0) / milestones.length
  );

  const totalDependenciesCount = milestones.filter(m => !!m.dependsOnMilestoneId).length;

  // 5 Calendar Weeks markers for Gantt header
  const timelineWeeks = [
    { label: 'Week 1: Concept & Brief', span: 'Oct 15 - Oct 21', startDay: 0, endDay: 6 },
    { label: 'Week 2: Outline & Bible', span: 'Oct 22 - Oct 28', startDay: 7, endDay: 13 },
    { label: 'Week 3: Patterson Manuscript', span: 'Oct 29 - Nov 04', startDay: 14, endDay: 20 },
    { label: 'Week 4: Visuals & Math', span: 'Nov 05 - Nov 11', startDay: 21, endDay: 27 },
    { label: 'Week 5: Compile & Launch', span: 'Nov 12 - Nov 14', startDay: 28, endDay: 30 }
  ];

  const handleSetDependency = (milestoneId: string, predecessorId: string | undefined) => {
    if (onUpdateDependency) {
      onUpdateDependency(milestoneId, predecessorId);
    }
    setLinkingTargetId(null);
    const target = milestones.find(m => m.id === milestoneId);
    const pred = milestones.find(m => m.id === predecessorId);
    if (predecessorId && pred) {
      setQuickLinkNotice(`Linked: Phase ${target?.phaseNumber} now depends on Phase ${pred.phaseNumber} (${pred.title})`);
    } else {
      setQuickLinkNotice(`Unlinked: Phase ${target?.phaseNumber} has no predecessor dependency.`);
    }
    setTimeout(() => setQuickLinkNotice(null), 4000);
  };

  const getSuccessorsOf = (milestoneId: string) => {
    return milestones.filter(m => m.dependsOnMilestoneId === milestoneId);
  };

  const getDependencyChain = (milestoneId: string): string[] => {
    const chain: string[] = [];
    let curr: string | undefined = milestoneId;
    const visited = new Set<string>();

    while (curr && !visited.has(curr)) {
      visited.add(curr);
      const m = milestones.find(item => item.id === curr);
      if (m) {
        chain.unshift(`P${m.phaseNumber}`);
        curr = m.dependsOnMilestoneId;
      } else {
        break;
      }
    }
    return chain;
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Top Gantt HUD & Health Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>Overall Progress</span>
            <Target className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">{overallProgress}%</span>
            <span className="text-[11px] text-emerald-400 font-mono">Ahead +0.5d</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>Milestone Health</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">{completedCount} of 6</span>
            <span className="text-[11px] text-slate-400 font-mono">Passed</span>
          </div>
          <span className="text-[10px] text-amber-300 font-mono block mt-1">
            {inProgressCount} Active • Phase 3 In Flight
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>Dependency Network</span>
            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">{totalDependenciesCount} Links</span>
            <span className="text-[11px] text-indigo-400 font-mono">Acyclic</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono block mt-1">
            Interactive Drag & SVG Curves
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>Dynamic Drag Mode</span>
            <Move className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-sm font-bold text-emerald-400">Drag to Shift</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">
            Move bar or drag diamond handle
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>Launch Target</span>
            <Flag className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-base font-bold text-white">Nov 14, 2026</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">
            Day {DAYS_ELAPSED} of {TOTAL_PROJECT_DAYS} ({30 - DAYS_ELAPSED} days left)
          </span>
        </div>
      </div>

      {/* Notice Banner: Dependency or Schedule Shift Feedback */}
      {(quickLinkNotice || scheduleNotice) && (
        <div className="p-3 rounded-xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{quickLinkNotice || scheduleNotice}</span>
          </div>
          <button 
            onClick={() => { setQuickLinkNotice(null); setScheduleNotice(null); }} 
            className="text-slate-400 hover:text-white text-xs underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Drag & Drop File Import Zone right inside Timeline Header */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDropzoneHovered(true); }}
        onDragLeave={() => setIsDropzoneHovered(false)}
        onDrop={handleTimelineFileDrop}
        className={`p-3 rounded-2xl border-2 border-dashed transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          isDropzoneHovered
            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/10'
            : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isDropzoneHovered ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-amber-400 border border-slate-800'}`}>
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>Drop Schedule (.json/.csv) or Manuscript (.txt/.docx) Right Here</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Direct File Drop
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Drag from your desktop to instantly update milestone dates, inject chapter drafts, or import task sheets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
            <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
            <span>Browse Files</span>
            <input
              type="file"
              className="hidden"
              accept=".json,.csv,.tsv,.txt,.md,.docx,.pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0] && onImportScheduleFiles) {
                  onImportScheduleFiles(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Gantt Controls & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Critical Path Toggle */}
          <button
            onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all font-mono text-xs ${
              filterCriticalOnly
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-semibold shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${filterCriticalOnly ? 'text-rose-400' : 'text-slate-500'}`} />
            <span>{filterCriticalOnly ? 'Critical Path Only (Active)' : 'Highlight Critical Path'}</span>
          </button>

          {/* Dependency Curves Toggle */}
          <button
            onClick={() => setShowDependencyCurves(!showDependencyCurves)}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all font-mono text-xs ${
              showDependencyCurves
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showDependencyCurves ? 'Dependency Links: Visible' : 'Dependency Links: Hidden'}</span>
          </button>

          {/* Cascade Downstream Shifts Toggle */}
          <button
            onClick={() => setCascadeDependents(!cascadeDependents)}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all font-mono text-xs ${
              cascadeDependents
                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Automatically shift downstream dependent milestones forward when a predecessor is delayed"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cascade Shifts: {cascadeDependents ? 'ON' : 'OFF'}</span>
          </button>

          {/* Reset Schedule Button */}
          <button
            onClick={handleResetSchedule}
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300 flex items-center gap-1.5 font-mono text-xs transition-all"
            title="Restore baseline 30-day schedule"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Dates</span>
          </button>
        </div>

        {/* View Mode: Gantt Chart vs Split View vs Cards */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('gantt')}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-all ${
              activeTab === 'gantt' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>Gantt Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('split')}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-all ${
              activeTab === 'split' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Split Inspector</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-all ${
              activeTab === 'cards' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <GripVertical className="w-3 h-3" />
            <span>Drag Cards</span>
          </button>
        </div>
      </div>

      {/* MODAL: LINK DEPENDENCY SELECTOR */}
      {linkingTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                  Dependency Linker
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                  <Link2 className="w-4 h-4 text-indigo-400" />
                  Link Predecessor for Phase {milestones.find(m => m.id === linkingTargetId)?.phaseNumber}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select which milestone must finish before <strong className="text-slate-200">{milestones.find(m => m.id === linkingTargetId)?.title}</strong> can proceed.
                </p>
              </div>
              <button
                onClick={() => setLinkingTargetId(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of potential predecessor candidates */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {/* Option 1: None / Independent */}
              <button
                onClick={() => handleSetDependency(linkingTargetId, undefined)}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                  !milestones.find(m => m.id === linkingTargetId)?.dependsOnMilestoneId
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Unlink className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="font-bold">None (Independent Milestone)</div>
                    <div className="text-[10px] text-slate-500">Can begin independently without predecessor milestone gating</div>
                  </div>
                </div>
                {!milestones.find(m => m.id === linkingTargetId)?.dependsOnMilestoneId && (
                  <Check className="w-4 h-4 text-amber-400" />
                )}
              </button>

              {/* Other milestones as candidates */}
              {milestones.map((candidate) => {
                if (candidate.id === linkingTargetId) return null;

                const isCurrentPredecessor = milestones.find(m => m.id === linkingTargetId)?.dependsOnMilestoneId === candidate.id;
                const isCycle = wouldCreateCycle(linkingTargetId, candidate.id, milestones);

                return (
                  <button
                    key={candidate.id}
                    disabled={isCycle}
                    onClick={() => handleSetDependency(linkingTargetId, candidate.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                      isCurrentPredecessor
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-semibold ring-1 ring-indigo-500/40'
                        : isCycle
                        ? 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60 cursor-not-allowed'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-[11px] ${
                        candidate.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : candidate.status === 'IN_PROGRESS'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        P{candidate.phaseNumber}
                      </div>

                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{candidate.title}</span>
                          {candidate.criticalPath && (
                            <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-1 rounded border border-rose-500/20">
                              Critical Path
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Status: <strong className={candidate.status === 'COMPLETED' ? 'text-emerald-400' : candidate.status === 'IN_PROGRESS' ? 'text-amber-300' : 'text-slate-400'}>{candidate.status}</strong> • Target Deadline: {candidate.targetDeadline}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCycle && (
                        <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Circular Loop
                        </span>
                      )}
                      {isCurrentPredecessor && (
                        <Check className="w-4 h-4 text-indigo-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Automatic acyclic graph validation
              </span>
              <button
                onClick={() => setLinkingTargetId(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-sans font-medium"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MAIN GANTT CHART VIEW */}
      {(activeTab === 'gantt' || activeTab === 'split') && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative select-none">
          
          {/* Scrollable Container */}
          <div className="overflow-x-auto">
            <div className="min-w-[880px] relative">
              
              {/* Gantt Timeline Header: Weeks & Days */}
              <div className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-20">
                
                {/* Row 1: Left Phase Column Label + 5 Calendar Weeks */}
                <div className="grid grid-cols-12 text-xs">
                  <div className="col-span-4 p-3 border-r border-slate-800 font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      Milestone / Phase (Drag Bar to Shift)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {filteredMilestones.length} Phases
                    </span>
                  </div>

                  <div className="col-span-8 grid grid-cols-5 divide-x divide-slate-800/80">
                    {timelineWeeks.map((week, idx) => (
                      <div key={idx} className="p-2.5 text-center bg-slate-900/40">
                        <span className="text-slate-200 font-bold block text-[11px] truncate">
                          {week.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {week.span}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 2: Daily Scale Ruler (30 Days) */}
                <div className="grid grid-cols-12 text-[10px] font-mono border-t border-slate-800/60 bg-slate-950/60 text-slate-400">
                  <div className="col-span-4 px-3 py-1.5 border-r border-slate-800 flex items-center justify-between">
                    <span>Oct 15 Project Kickoff</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Day {DAYS_ELAPSED} Today
                    </span>
                  </div>

                  <div className="col-span-8 flex divide-x divide-slate-800/40">
                    {Array.from({ length: TOTAL_PROJECT_DAYS }).map((_, d) => {
                      const isToday = d === DAYS_ELAPSED;
                      const isMajorMarker = d % 5 === 0 || d === TOTAL_PROJECT_DAYS - 1;

                      return (
                        <div
                          key={d}
                          style={{ width: `${100 / TOTAL_PROJECT_DAYS}%` }}
                          className={`text-center py-1 transition-colors ${
                            isToday 
                              ? 'bg-amber-500/20 text-amber-300 font-bold border-b-2 border-amber-400' 
                              : isMajorMarker
                              ? 'text-slate-300 font-semibold'
                              : 'text-slate-600'
                          }`}
                          title={`Day ${d + 1}: ${formatDisplayDate(d)}`}
                        >
                          {d + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Gantt Body: Matrix Grid & Milestone Bars */}
              <div className="relative divide-y divide-slate-800/60 font-sans">
                
                {/* Vertical "Today" Marker Line */}
                <div
                  className="absolute top-0 bottom-0 z-10 pointer-events-none"
                  style={{ left: `calc(33.333% + (66.666% * ${TODAY_PERCENTAGE / 100}))` }}
                >
                  <div className="w-0.5 h-full bg-gradient-to-b from-amber-400 via-amber-500 to-transparent opacity-80" />
                  <div className="absolute top-1 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                    Today
                  </div>
                </div>

                {/* SVG Curves for Dependencies */}
                {showDependencyCurves && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    <defs>
                      <marker
                        id="dep-arrow"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto"
                      >
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
                      </marker>
                      <marker
                        id="dep-arrow-active"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto"
                      >
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                      </marker>
                      <marker
                        id="dep-arrow-complete"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto"
                      >
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
                      </marker>
                    </defs>

                    {filteredMilestones.map((milestone, rowIndex) => {
                      if (!milestone.dependsOnMilestoneId) return null;
                      const predIndex = filteredMilestones.findIndex(m => m.id === milestone.dependsOnMilestoneId);
                      if (predIndex === -1) return null;

                      const pred = filteredMilestones[predIndex];
                      const predSched = scheduleMap[pred.id] || { startDay: pred.phaseNumber * 4, durationDays: 4 };
                      const currSched = scheduleMap[milestone.id] || { startDay: milestone.phaseNumber * 4, durationDays: 4 };

                      const rowHeight = 56;
                      const y1 = predIndex * rowHeight + 28;
                      const y2 = rowIndex * rowHeight + 28;

                      const x1Pct = ((predSched.startDay + predSched.durationDays) / TOTAL_PROJECT_DAYS) * 100;
                      const x2Pct = (currSched.startDay / TOTAL_PROJECT_DAYS) * 100;

                      const isHovered = hoveredDependency?.fromId === pred.id && hoveredDependency?.toId === milestone.id;
                      const strokeColor = pred.status === 'COMPLETED' ? '#10b981' : pred.status === 'IN_PROGRESS' ? '#f59e0b' : '#6366f1';
                      const marker = pred.status === 'COMPLETED' ? 'url(#dep-arrow-complete)' : pred.status === 'IN_PROGRESS' ? 'url(#dep-arrow-active)' : 'url(#dep-arrow)';

                      return (
                        <g key={`curve-${pred.id}-${milestone.id}`}>
                          <path
                            d={`M calc(33.333% + (66.666% * ${x1Pct / 100})) ${y1} C calc(33.333% + (66.666% * ${Math.min(100, x1Pct + 4) / 100})) ${y1}, calc(33.333% + (66.666% * ${Math.max(0, x2Pct - 4) / 100})) ${y2}, calc(33.333% + (66.666% * ${x2Pct / 100})) ${y2}`}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={isHovered ? "2.5" : "1.75"}
                            strokeDasharray={pred.status === 'IN_PROGRESS' ? "4 3" : undefined}
                            opacity={isHovered ? 1 : 0.8}
                            markerEnd={marker}
                            className="transition-all duration-300"
                          />
                        </g>
                      );
                    })}
                  </svg>
                )}

                {/* Milestone Rows */}
                {filteredMilestones.map((milestone) => {
                  const isCompleted = milestone.status === 'COMPLETED';
                  const isInProgress = milestone.status === 'IN_PROGRESS';
                  const isUpcoming = milestone.status === 'UPCOMING';
                  const isSelected = milestone.id === selectedMilestoneId;
                  const isExpanded = !!expandedMilestones[milestone.id];

                  const isBeingDragged = dragState?.milestoneId === milestone.id;
                  const timeInfo = scheduleMap[milestone.id] || DEFAULT_MILESTONE_TIME_MAP[milestone.id] || {
                    startDay: milestone.phaseNumber * 4,
                    durationDays: 4,
                    owner: 'Publishing AI'
                  };

                  const currentStartDay = isBeingDragged ? dragState.currentStartDay : timeInfo.startDay;
                  const currentDuration = isBeingDragged ? dragState.currentDuration : timeInfo.durationDays;

                  const barLeftPct = (currentStartDay / TOTAL_PROJECT_DAYS) * 100;
                  const barWidthPct = Math.max(6, (currentDuration / TOTAL_PROJECT_DAYS) * 100);

                  const predecessor = milestones.find(m => m.id === milestone.dependsOnMilestoneId);
                  const successors = getSuccessorsOf(milestone.id);

                  return (
                    <React.Fragment key={milestone.id}>
                      <div
                        onClick={() => setSelectedMilestoneId(milestone.id)}
                        className={`grid grid-cols-12 transition-all group min-h-[56px] ${
                          isSelected
                            ? 'bg-indigo-950/30'
                            : isInProgress
                            ? 'bg-amber-950/10 hover:bg-slate-900/60'
                            : 'hover:bg-slate-900/40'
                        }`}
                      >
                        {/* Left Info Column */}
                        <div className="col-span-4 p-3 border-r border-slate-800 flex items-start gap-2.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(milestone.id);
                            }}
                            className="mt-0.5 text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : isInProgress
                                  ? 'bg-amber-500 text-slate-950 font-bold'
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                P{milestone.phaseNumber}
                              </span>

                              <span className="text-xs font-bold text-slate-200 truncate group-hover:text-amber-300 transition-colors">
                                {milestone.title}
                              </span>

                              {milestone.criticalPath && (
                                <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-1 rounded border border-rose-500/20">
                                  Critical
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {milestone.subtitle}
                            </p>

                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-slate-400">
                                  {formatDisplayDate(currentStartDay)} – {formatDisplayDate(currentStartDay + currentDuration)} ({currentDuration}d)
                                </span>

                                {predecessor && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLinkingTargetId(milestone.id);
                                    }}
                                    onMouseEnter={() => setHoveredDependency({ fromId: predecessor.id, toId: milestone.id })}
                                    onMouseLeave={() => setHoveredDependency(null)}
                                    className="text-[9px] font-mono text-indigo-300 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 px-1 py-0.2 rounded flex items-center gap-0.5"
                                    title={`Predecessor: Phase ${predecessor.phaseNumber} (${predecessor.title}). Click to edit.`}
                                  >
                                    <Link2 className="w-2.5 h-2.5" />
                                    <span>P{predecessor.phaseNumber}</span>
                                  </button>
                                )}

                                {successors.length > 0 && (
                                  <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1 py-0.2 rounded" title={`${successors.length} downstream milestones depend on this phase`}>
                                    → {successors.map(s => `P${s.phaseNumber}`).join(', ')}
                                  </span>
                                )}
                              </div>

                              <span className={isInProgress ? 'text-amber-300 font-bold' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}>
                                {milestone.progressPercent}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Gantt Bar Track (Interactive Drag & Drop Canvas) */}
                        <div className="col-span-8 relative py-3 px-2 flex items-center gantt-track-container overflow-visible">
                          
                          {/* Background Grid Lines for the 5 weeks */}
                          <div className="absolute inset-0 grid grid-cols-5 pointer-events-none divide-x divide-slate-800/40" />

                          {/* Floating Dragging Tooltip Badge */}
                          {isBeingDragged && (
                            <div 
                              className="absolute -top-7 z-40 bg-slate-900 border border-amber-400 text-amber-300 text-[10px] font-mono px-2.5 py-0.5 rounded-lg shadow-xl flex items-center gap-1.5 whitespace-nowrap pointer-events-none animate-fadeIn"
                              style={{ left: `${barLeftPct}%` }}
                            >
                              <Move className="w-3 h-3 text-amber-400" />
                              <span className="font-bold text-white">P{milestone.phaseNumber}:</span>
                              <span>{formatDisplayDate(currentStartDay)} – {formatDisplayDate(currentStartDay + currentDuration)}</span>
                              <span className="text-amber-400 font-bold">({currentDuration}d)</span>
                            </div>
                          )}

                          {/* Interactive Draggable Gantt Bar */}
                          <div
                            onMouseDown={(e) => handleStartDrag(e, milestone.id, 'move')}
                            className={`relative h-8 rounded-lg shadow-md transition-all flex items-center px-2.5 overflow-hidden border select-none ${
                              isBeingDragged 
                                ? 'ring-2 ring-amber-400 border-amber-300 cursor-grabbing shadow-amber-500/30 scale-[1.02] z-30'
                                : 'cursor-grab active:cursor-grabbing hover:scale-[1.01]'
                            } ${
                              isCompleted
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 border-emerald-400 text-white'
                                : isInProgress
                                ? 'bg-gradient-to-r from-amber-600 via-indigo-600 to-indigo-700 border-amber-300/80 text-white shadow-amber-500/20 ring-1 ring-amber-400/50'
                                : 'bg-slate-800/90 border-slate-700 text-slate-300'
                            }`}
                            style={{
                              left: `${barLeftPct}%`,
                              width: `${barWidthPct}%`
                            }}
                            title={`Drag milestone bar horizontally to shift dates • ${milestone.title}`}
                          >
                            {/* In-Progress Progress Fill Overlay */}
                            {isInProgress && (
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-amber-500/40 border-r border-amber-300 transition-all duration-300 pointer-events-none"
                                style={{ width: `${milestone.progressPercent}%` }}
                              />
                            )}

                            {/* Bar Content */}
                            <div className="relative z-10 flex items-center justify-between w-full text-[11px] font-semibold truncate gap-2 pointer-events-none">
                              <div className="flex items-center gap-1.5 truncate">
                                <GripVertical className="w-3 h-3 text-slate-400/60 shrink-0" />
                                {isCompleted ? (
                                  <Check className="w-3.5 h-3.5 stroke-[3] text-slate-950 bg-white rounded-full p-0.5 shrink-0" />
                                ) : isInProgress ? (
                                  <Clock className="w-3.5 h-3.5 text-amber-200 animate-spin shrink-0" />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                )}
                                <span className="truncate">{milestone.title}</span>
                              </div>

                              <span className="font-mono text-[10px] shrink-0 opacity-90">
                                {milestone.progressPercent}%
                              </span>
                            </div>

                            {/* Left Connector Node (Incoming Dependency) */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLinkingTargetId(milestone.id);
                              }}
                              className="absolute left-0 top-0 bottom-0 w-2.5 bg-indigo-500/40 hover:bg-amber-400 transition-colors z-20 cursor-pointer"
                              title="Click to link incoming predecessor dependency"
                            />

                            {/* Right Resize Handle & Outgoing Node */}
                            <div
                              onMouseDown={(e) => handleStartDrag(e, milestone.id, 'resize-right')}
                              className="absolute right-0 top-0 bottom-0 w-3 hover:bg-amber-400/80 bg-amber-500/20 transition-colors z-20 cursor-ew-resize flex items-center justify-center"
                              title="Drag right edge to extend duration or shift deadline"
                            >
                              <span className="w-0.5 h-3 bg-white/70 rounded-full" />
                            </div>
                          </div>

                          {/* Interactive Draggable Deadline Diamond Marker */}
                          <div
                            onMouseDown={(e) => handleStartDrag(e, milestone.id, 'resize-right')}
                            className="absolute -translate-x-1/2 flex items-center justify-center cursor-ew-resize z-20 group/diamond hover:scale-125 transition-transform"
                            style={{ left: `${barLeftPct + barWidthPct}%` }}
                            title={`Deadline: ${formatDisplayDate(currentStartDay + currentDuration)} • Drag diamond horizontally to adjust deadline`}
                          >
                            <div className={`w-3.5 h-3.5 rotate-45 border shadow-sm transition-all ${
                              isCompleted
                                ? 'bg-emerald-400 border-emerald-200'
                                : isInProgress
                                ? 'bg-amber-400 border-amber-200 ring-2 ring-amber-500/40'
                                : 'bg-slate-700 border-slate-500'
                            } ${isBeingDragged && dragState?.type === 'resize-right' ? 'scale-125 ring-2 ring-white' : ''}`} />
                          </div>

                        </div>
                      </div>

                      {/* Expandable Sub-Deliverables and Sub-Stages on Timeline */}
                      {isExpanded && (
                        <div className="bg-slate-950/80 p-3 pl-10 border-b border-slate-800/80">
                          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Stage & Deliverables Breakdown: {milestone.title}</span>
                            <div className="flex items-center gap-2">
                              {predecessor && (
                                <span className="text-indigo-400 font-mono">
                                  Gated by: Phase {predecessor.phaseNumber} ({predecessor.title})
                                </span>
                              )}
                              <span className="text-slate-300 font-semibold">
                                Target: {formatDisplayDate(currentStartDay + currentDuration)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {milestone.deliverables.map((deliv) => (
                              <button
                                key={deliv.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleDeliverable(milestone.id, deliv.id);
                                }}
                                className={`p-2 rounded-lg text-left flex items-start gap-2 border text-xs transition-all ${
                                  deliv.completed
                                    ? 'bg-slate-900/90 border-emerald-500/30 text-slate-200'
                                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                <div className={`w-3.5 h-3.5 rounded mt-0.5 shrink-0 flex items-center justify-center border ${
                                  deliv.completed
                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                    : 'border-slate-700 bg-slate-950'
                                }`}>
                                  {deliv.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                                <span className={`text-[11px] leading-snug flex-1 ${deliv.completed ? 'line-through text-slate-400' : ''}`}>
                                  {deliv.label}
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* Quick Actions for Selected Milestone */}
                          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs flex-wrap gap-2">
                            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                              <span>Stages: {milestone.stages.join(', ')}</span>
                              <span>•</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLinkingTargetId(milestone.id);
                                }}
                                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                              >
                                <Link2 className="w-3 h-3" />
                                {predecessor ? `Edit Predecessor (P${predecessor.phaseNumber})` : 'Add Predecessor Dependency'}
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              {onRunAudit && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRunAudit(milestone.title);
                                  }}
                                  className="text-indigo-400 hover:text-indigo-300 text-[11px] font-mono flex items-center gap-1"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-400" />
                                  Run Grand Council Audit
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

              </div>

            </div>
          </div>

        </div>
      )}

      {/* CARDS MODE: DRAG AND DROP REORDERING */}
      {activeTab === 'cards' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono">
              <GripVertical className="w-3.5 h-3.5 text-amber-400" />
              Drag milestone cards up or down to reorder production sequence & priority
            </span>
            <span className="text-[11px] text-slate-500">
              {milestones.length} Milestones in Pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {milestones.map((m, idx) => {
              const sched = scheduleMap[m.id] || { startDay: m.phaseNumber * 4, durationDays: 4 };

              return (
                <div
                  key={m.id}
                  draggable={true}
                  onDragStart={() => handleCardDragStart(idx)}
                  onDragOver={(e) => handleCardDragOver(e, idx)}
                  className={`bg-slate-900 border rounded-2xl p-4 shadow-lg transition-all cursor-move flex flex-col justify-between ${
                    draggedCardIndex === idx 
                      ? 'border-amber-400 bg-amber-500/10 shadow-amber-500/20 scale-[1.02]' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-slate-500" />
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          Phase {m.phaseNumber}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {sched.durationDays}d duration
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        m.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                        m.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-2 leading-tight">
                      {m.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {m.subtitle}
                    </p>

                    <div className="mt-3 p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-300">
                      <span>Deadline:</span>
                      <span className="text-amber-300 font-bold">{formatDisplayDate(sched.startDay + sched.durationDays)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {m.deliverables.filter(d => d.completed).length}/{m.deliverables.length} Deliverables
                    </span>
                    <button
                      onClick={() => {
                        setSelectedMilestoneId(m.id);
                        setActiveTab('split');
                      }}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1"
                    >
                      Inspect <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* INSPECTOR PANEL (IN SPLIT VIEW) */}
      {activeTab === 'split' && selectedMilestone && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                  Phase {selectedMilestone.phaseNumber}
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedMilestone.title}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedMilestone.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-300">
                Deadline: <strong className="text-amber-300">{formatDisplayDate((scheduleMap[selectedMilestone.id]?.startDay ?? 0) + (scheduleMap[selectedMilestone.id]?.durationDays ?? 4))}</strong>
              </span>
            </div>
          </div>

          {/* Dependency Architecture Section */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-indigo-300 font-semibold flex items-center gap-1.5 uppercase">
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                Dependency Architecture
              </span>
              
              <button
                onClick={() => setLinkingTargetId(selectedMilestone.id)}
                className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all"
              >
                <Link2 className="w-3.5 h-3.5" />
                {selectedMilestone.dependsOnMilestoneId ? 'Change Predecessor' : 'Link Predecessor'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Gating Predecessor</span>
                  {selectedMilestone.dependsOnMilestoneId ? (
                    <div className="mt-1">
                      <span className="font-bold text-slate-200">
                        Phase {milestones.find(m => m.id === selectedMilestone.dependsOnMilestoneId)?.phaseNumber}: {milestones.find(m => m.id === selectedMilestone.dependsOnMilestoneId)?.title}
                      </span>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Status: <strong className={milestones.find(m => m.id === selectedMilestone.dependsOnMilestoneId)?.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-300'}>{milestones.find(m => m.id === selectedMilestone.dependsOnMilestoneId)?.status}</strong>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 mt-1 block">None (Runs Independently)</span>
                  )}
                </div>

                {selectedMilestone.dependsOnMilestoneId && (
                  <button
                    onClick={() => handleSetDependency(selectedMilestone.id, undefined)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Remove predecessor dependency"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Downstream Dependents</span>
                {getSuccessorsOf(selectedMilestone.id).length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {getSuccessorsOf(selectedMilestone.id).map(succ => (
                      <div key={succ.id} className="text-slate-300 flex items-center justify-between">
                        <span className="font-semibold">Phase {succ.phaseNumber}: {succ.title}</span>
                        <span className="text-[10px] font-mono text-slate-500">{succ.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 mt-1 block">No downstream dependents</span>
                )}
              </div>
            </div>

            {/* Execution Chain Path */}
            <div className="pt-2 border-t border-slate-900 flex items-center gap-2 text-[11px] font-mono text-slate-400 flex-wrap">
              <span className="text-slate-500">Execution Chain:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {getDependencyChain(selectedMilestone.id).map((step, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-slate-600">→</span>}
                    <span className={`px-1.5 py-0.5 rounded font-bold ${
                      step === `P${selectedMilestone.phaseNumber}`
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {step}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1 text-slate-400">
              <span>Phase Deliverables Completion:</span>
              <span className="font-bold text-amber-300">{selectedMilestone.progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${selectedMilestone.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Deliverables Checklist */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Required Deliverables & Quality Gates (Click to Toggle):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedMilestone.deliverables.map((deliv) => (
                <button
                  key={deliv.id}
                  onClick={() => onToggleDeliverable(selectedMilestone.id, deliv.id)}
                  className={`p-2.5 rounded-xl text-left flex items-start gap-2.5 transition-all text-xs border ${
                    deliv.completed
                      ? 'bg-slate-950/80 border-emerald-500/30 text-slate-200'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center border transition-all ${
                    deliv.completed 
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                      : 'border-slate-700 bg-slate-900'
                  }`}>
                    {deliv.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={`text-xs leading-snug flex-1 ${deliv.completed ? 'line-through text-slate-400' : ''}`}>
                    {deliv.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
