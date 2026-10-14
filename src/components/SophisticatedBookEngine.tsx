import React, { useState } from 'react';
import { 
  PublishingProject, Chapter, AuthorFormulaId, 
  AuthorFormulaProfile, PattersonComplianceReport, 
  FormulaOutlineBeat, AuthorVoiceConfig 
} from '../types/storyforge';
import { BESTSELLER_FORMULAS, AUTHOR_CLONING_PRESETS } from '../data/authorFormulas';
import { 
  Zap, BookOpen, Sparkles, ShieldCheck, Flame, Sliders, 
  Clock, CheckCircle, AlertTriangle, RefreshCw, Scissors, 
  FileText, Copy, ChevronRight, Eye, Feather, Award, 
  Layers, ArrowRight, Wand2, Compass, BookMarked, UserCheck, Search
} from 'lucide-react';

interface SophisticatedBookEngineProps {
  project: PublishingProject;
  onUpdateChapter: (chapterId: string, updated: Partial<Chapter>) => void;
  onAddChapter: (newChapter?: Partial<Chapter>) => void;
  onUpdateProjectConfig?: (updatedConfig: Partial<AuthorVoiceConfig>) => void;
  onUpdateFormulaOutline?: (outline: FormulaOutlineBeat[]) => void;
  onSwitchToManuscriptEditor?: () => void;
}

export const SophisticatedBookEngine: React.FC<SophisticatedBookEngineProps> = ({
  project,
  onUpdateChapter,
  onAddChapter,
  onUpdateProjectConfig,
  onUpdateFormulaOutline,
  onSwitchToManuscriptEditor
}) => {
  // Active sub-view tab
  const [activeSubTab, setActiveSubTab] = useState<'machine' | 'formulas' | 'cloner' | 'outline' | 'research'>('machine');

  // Selected formula state
  const [selectedFormulaId, setSelectedFormulaId] = useState<AuthorFormulaId>(
    (project.authorMachineConfig?.selectedFormulaId as AuthorFormulaId) || 'james-patterson'
  );
  const currentFormula: AuthorFormulaProfile = BESTSELLER_FORMULAS[selectedFormulaId] || BESTSELLER_FORMULAS['james-patterson'];

  // Global Patterson rules enforcement toggle
  const [enforcePattersonRules, setEnforcePattersonRules] = useState<boolean>(
    project.authorMachineConfig?.enforcePattersonRules ?? true
  );

  // Pacing and severity sliders
  const [pacingVelocity, setPacingVelocity] = useState<number>(project.authorMachineConfig?.pacingDial || 95);
  const [cliffhangerSeverity, setCliffhangerSeverity] = useState<number>(project.authorMachineConfig?.cliffhangerSeverity || 90);
  const [fluffRemoverStrength, setFluffRemoverStrength] = useState<number>(project.authorMachineConfig?.fluffRemoverStrength || 85);

  // Active chapter selection
  const chapters = project.manuscript?.chapters || [];
  const [activeChapterId, setActiveChapterId] = useState<string>(chapters[0]?.id || '');
  const activeChapter = chapters.find((c) => c.id === activeChapterId) || chapters[0];

  // Outliner state
  const [formulaOutline, setFormulaOutline] = useState<FormulaOutlineBeat[]>(
    project.formulaOutline || []
  );
  const [outlineChapterCount, setOutlineChapterCount] = useState<number>(12);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState<boolean>(false);

  // Live generation and editing states
  const [isWritingChapter, setIsWritingChapter] = useState<boolean>(false);
  const [isPattersonizing, setIsPattersonizing] = useState<boolean>(false);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [complianceReport, setComplianceReport] = useState<PattersonComplianceReport | null>(
    activeChapter?.pattersonCompliance || null
  );
  const [pattersonizeResult, setPattersonizeResult] = useState<any | null>(null);

  // Author voice cloner state
  const [customAuthorName, setCustomAuthorName] = useState<string>('');
  const [customSampleText, setCustomSampleText] = useState<string>('');
  const [isCloningVoice, setIsCloningVoice] = useState<boolean>(false);
  const [clonedFingerprint, setClonedFingerprint] = useState<any | null>(
    project.authorMachineConfig?.customVoiceFingerprint || null
  );

  // Formula catalog filter
  const [formulaCategoryFilter, setFormulaCategoryFilter] = useState<'all' | 'suspense' | 'mystery' | 'epic' | 'literary'>('all');
  const [formulaSearchQuery, setFormulaSearchQuery] = useState<string>('');

  // Save config helper
  const updateEngineConfig = (newSettings: Partial<AuthorVoiceConfig>) => {
    if (onUpdateProjectConfig) {
      onUpdateProjectConfig(newSettings);
    }
  };

  // 1. Generate Full Patterson Granular Outline
  const handleGeneratePattersonOutline = async () => {
    setIsGeneratingOutline(true);
    try {
      const res = await fetch('/api/book/patterson-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.manuscript.title,
          genre: project.genre,
          premise: project.manuscript.synopsis,
          chapterCount: outlineChapterCount,
          targetAge: project.targetAge
        })
      });
      const data = await res.json();
      if (data.success && data.outline?.chapters) {
        setFormulaOutline(data.outline.chapters);
        if (onUpdateFormulaOutline) {
          onUpdateFormulaOutline(data.outline.chapters);
        }
      }
    } catch (e) {
      console.error('Failed generating outline:', e);
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  // 2. Write Formula Chapter (Patterson Rules Enforced)
  const handleWriteFormulaChapter = async () => {
    if (!activeChapter) return;
    setIsWritingChapter(true);
    try {
      const res = await fetch('/api/book/write-formula-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterNumber: activeChapter.chapterNumber,
          chapterTitle: activeChapter.title,
          chapterSynopsis: activeChapter.synopsis,
          formulaId: selectedFormulaId,
          enforcePattersonRules: enforcePattersonRules,
          povCharacter: activeChapter.povCharacter || 'Protagonist',
          tickingClock: activeChapter.tickingClockNote || 'T-minus 36 hours',
          targetWordCount: 850,
          worldContext: project.worldBible?.universeName ? `${project.worldBible.universeName}: ${project.worldBible.settingOverview}` : '',
          characterContext: project.characters?.map(c => `${c.name} (${c.role}): ${c.goals}`).join('; '),
          customAuthorName: selectedFormulaId === 'custom-clone' ? customAuthorName : undefined,
          customVoiceDirectives: clonedFingerprint ? clonedFingerprint.imitationDirectives?.join('. ') : undefined
        })
      });
      const data = await res.json();
      if (data.success && data.chapter) {
        const ch = data.chapter;
        onUpdateChapter(activeChapter.id, {
          content: ch.content,
          wordCount: ch.wordCount,
          cliffhangerHook: ch.cliffhangerHook,
          authorFormulaApplied: ch.authorFormulaApplied || selectedFormulaId,
          readabilityScore: ch.readabilityScore,
          pattersonCompliance: ch.pattersonCompliance
        });
        if (ch.pattersonCompliance) {
          setComplianceReport(ch.pattersonCompliance);
        }
      }
    } catch (e) {
      console.error('Failed writing chapter:', e);
    } finally {
      setIsWritingChapter(false);
    }
  };

  // 3. "Pattersonize It!" (Strip Fluff & Inject Cliffhanger)
  const handlePattersonizeProse = async () => {
    if (!activeChapter || !activeChapter.content) return;
    setIsPattersonizing(true);
    try {
      const res = await fetch('/api/book/pattersonize-prose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: activeChapter.content,
          chapterTitle: activeChapter.title
        })
      });
      const data = await res.json();
      if (data.success && data.pattersonizedProse) {
        setPattersonizeResult(data);
        const newWords = data.pattersonizedProse.trim().split(/\s+/).length;
        onUpdateChapter(activeChapter.id, {
          content: data.pattersonizedProse,
          wordCount: newWords,
          cliffhangerHook: data.cliffhangerAdded
        });
        // Run audit on the new text
        handleAuditPatterson(data.pattersonizedProse);
      }
    } catch (e) {
      console.error('Failed to Pattersonize:', e);
    } finally {
      setIsPattersonizing(false);
    }
  };

  // 4. Audit Patterson Compliance
  const handleAuditPatterson = async (textToAudit?: string) => {
    const text = textToAudit || activeChapter?.content;
    if (!text) return;
    setIsAuditing(true);
    try {
      const res = await fetch('/api/book/audit-patterson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          chapterTitle: activeChapter?.title
        })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setComplianceReport(data.report);
        if (activeChapter) {
          onUpdateChapter(activeChapter.id, {
            pattersonCompliance: data.report
          });
        }
      }
    } catch (e) {
      console.error('Failed to audit Patterson compliance:', e);
    } finally {
      setIsAuditing(false);
    }
  };

  // 5. Clone Author Voice
  const handleCloneAuthorVoice = async (overrideName?: string, overrideSample?: string) => {
    const name = overrideName || customAuthorName;
    const sample = overrideSample || customSampleText;
    if (!sample) return;
    setIsCloningVoice(true);
    try {
      const res = await fetch('/api/author-voice/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: name,
          sampleText: sample
        })
      });
      const data = await res.json();
      if (data.success && data.fingerprint) {
        setClonedFingerprint(data.fingerprint);
        setSelectedFormulaId('custom-clone');
        updateEngineConfig({
          selectedFormulaId: 'custom-clone',
          customAuthorName: name,
          customSampleText: sample,
          customVoiceFingerprint: data.fingerprint
        });
      }
    } catch (e) {
      console.error('Failed cloning author voice:', e);
    } finally {
      setIsCloningVoice(false);
    }
  };

  // 6. Convert Outline Beat into a Real Chapter
  const handleAdoptOutlineBeat = (beat: FormulaOutlineBeat) => {
    const existing = chapters.find(c => c.chapterNumber === beat.chapterNumber);
    if (existing) {
      onUpdateChapter(existing.id, {
        title: beat.title,
        synopsis: beat.coreConflict,
        povCharacter: beat.pov,
        tickingClockNote: beat.tickingClock,
        cliffhangerHook: beat.cliffhangerBeat
      });
      setActiveChapterId(existing.id);
    } else {
      onAddChapter({
        title: beat.title,
        chapterNumber: beat.chapterNumber,
        synopsis: beat.coreConflict,
        povCharacter: beat.pov,
        tickingClockNote: beat.tickingClock,
        cliffhangerHook: beat.cliffhangerBeat,
        wordCount: 0,
        content: `[Chapter ${beat.chapterNumber}: ${beat.title}]\n\nPOV: ${beat.pov}\nTicking Clock: ${beat.tickingClock}\n\nConflict Beat: ${beat.coreConflict}\nMandatory Cliffhanger Target: ${beat.cliffhangerBeat}`,
        status: 'Draft'
      });
    }
    setActiveSubTab('machine');
  };

  const formulaEntries = Object.values(BESTSELLER_FORMULAS);
  const filteredFormulas = formulaEntries.filter(f => {
    if (formulaSearchQuery) {
      const q = formulaSearchQuery.toLowerCase();
      return f.authorName.toLowerCase().includes(q) || 
             f.formulaTitle.toLowerCase().includes(q) ||
             f.keyTechniques.some(t => t.toLowerCase().includes(q));
    }
    if (formulaCategoryFilter === 'suspense') {
      return ['james-patterson', 'dan-brown', 'lee-child', 'michael-crichton'].includes(f.id);
    }
    if (formulaCategoryFilter === 'mystery') {
      return ['agatha-christie', 'gillian-flynn'].includes(f.id);
    }
    if (formulaCategoryFilter === 'epic') {
      return ['brandon-sanderson'].includes(f.id);
    }
    if (formulaCategoryFilter === 'literary') {
      return ['stephen-king', 'malcolm-gladwell', 'colleen-hoover'].includes(f.id);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Master Book Writing Machine Command Center */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                PATTERSON FORMULA BESTSELLER MACHINE
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Guinness Record Cadence Active
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                425M+ Copies Sold Formula
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-3">
              <span>Universal Author Mimicry & Book Writing Machine</span>
            </h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Engineered after James Patterson&apos;s formula (60-80 page outlines, micro-chapters, Zeigarnik cliffhangers, dual asymmetric POVs, zero fluff) combined with multi-author stylistic mimicry (Dan Brown, Stephen King, Brandon Sanderson, Agatha Christie, Colleen Hoover, Michael Crichton, or clone any custom author from sample prose).
            </p>
          </div>

          {/* Quick Enforce Switch & Stats */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 bg-slate-950/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between sm:justify-start gap-3 pr-2 border-b sm:border-b-0 sm:border-r border-slate-800 pb-2 sm:pb-0">
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">Patterson Rule Mandate</span>
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  {enforcePattersonRules ? 'STRICTLY ENFORCED' : 'FLEXIBLE ADAPT'}
                </span>
              </div>
              <button
                onClick={() => {
                  const newVal = !enforcePattersonRules;
                  setEnforcePattersonRules(newVal);
                  updateEngineConfig({ enforcePattersonRules: newVal });
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                  enforcePattersonRules ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
                title="Toggle mandatory James Patterson 9-rule enforcement"
              >
                <div className="bg-slate-950 w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSubTab('outline')}
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>80-Beat Outliner</span>
              </button>
              <button
                onClick={() => setActiveSubTab('formulas')}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Feather className="w-3.5 h-3.5 text-indigo-400" />
                <span>Formulas ({formulaEntries.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* 9 Patterson Rules Mini Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar text-[11px] font-mono">
            {[
              { num: 1, label: 'Exhaustive Outline' },
              { num: 2, label: 'Micro-Chapters (600-1100w)' },
              { num: 3, label: 'Zeigarnik Cliffhanger' },
              { num: 4, label: 'Dual POV Irony' },
              { num: 5, label: 'Ticking Clock' },
              { num: 6, label: 'Zero Fluff' },
              { num: 7, label: 'In Media Res' },
              { num: 8, label: 'Staccato Dialogue' },
              { num: 9, label: 'False Dawn Reversal' }
            ].map((rule) => (
              <div 
                key={rule.num} 
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                  enforcePattersonRules 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold">
                  {rule.num}
                </span>
                <span>{rule.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'machine', label: '⚡ Patterson Chapter Machine & Live Auditor', icon: Flame },
          { id: 'outline', label: '📋 Granular Master Outliner (Patterson Method)', icon: Layers, badge: `${formulaOutline.length} Beats` },
          { id: 'formulas', label: '📚 Top Authors Formula Library', icon: BookOpen, badge: '10 Authors' },
          { id: 'cloner', label: '🧬 Author Voice Cloner & Stylometry Lab', icon: Wand2, badge: clonedFingerprint ? 'Cloned' : 'Ready' },
          { id: 'research', label: '🔬 Bestseller Formula Research Vault', icon: Award }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-VIEW 1: PATTERSON CHAPTER MACHINE & LIVE AUDITOR */}
      {activeSubTab === 'machine' && (
        <div className="space-y-6">
          
          {/* Active Formula & Directorial Knobs Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              
              {/* Active Author Persona */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0">
                  {currentFormula.avatar}
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Active Writing Voice</span>
                  <span className="text-sm font-black text-slate-100 block">
                    {selectedFormulaId === 'custom-clone' && customAuthorName ? customAuthorName : currentFormula.authorName}
                  </span>
                  <span className="text-[11px] text-amber-400 font-mono">
                    {currentFormula.formulaTitle}
                  </span>
                </div>
              </div>

              {/* Pacing Velocity Dial */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Pacing Velocity</span>
                  <span className="text-amber-300 font-bold">{pacingVelocity}% (Hyper)</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={pacingVelocity}
                  onChange={(e) => setPacingVelocity(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              {/* Cliffhanger Severity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Cliffhanger Severity</span>
                  <span className="text-rose-400 font-bold">{cliffhangerSeverity}% (Zeigarnik Loop)</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={cliffhangerSeverity}
                  onChange={(e) => setCliffhangerSeverity(Number(e.target.value))}
                  className="w-full accent-rose-500 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              {/* Fluff Stripper */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Fluff Stripper</span>
                  <span className="text-emerald-400 font-bold">{fluffRemoverStrength}% (Zero Wallpaper)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={fluffRemoverStrength}
                  onChange={(e) => setFluffRemoverStrength(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

            </div>
          </div>

          {/* Chapter Selector & Writing Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Chapter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveChapterId(ch.id);
                    setComplianceReport(ch.pattersonCompliance || null);
                    setPattersonizeResult(null);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                    ch.id === activeChapter?.id
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Ch. {ch.chapterNumber}: {ch.title}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    (ch.wordCount || 0) >= 600 && (ch.wordCount || 0) <= 1100
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {ch.wordCount || 0}w
                  </span>
                </button>
              ))}

              <button
                onClick={() => {
                  const nextNum = chapters.length + 1;
                  onAddChapter({
                    chapterNumber: nextNum,
                    title: `Chapter ${nextNum}: The Ticking Door`,
                    synopsis: 'Accelerated high-stakes confrontation with an immediate cliffhanger hook.',
                    content: '',
                    wordCount: 0,
                    status: 'Draft'
                  });
                }}
                className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-xl transition-all text-xs font-bold"
              >
                + Add Chapter
              </button>
            </div>

            {/* AI Action Triggers */}
            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
              
              {/* Audit Button */}
              <button
                onClick={() => handleAuditPatterson()}
                disabled={isAuditing || !activeChapter?.content}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isAuditing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                Audit Formula
              </button>

              {/* Pattersonize It Button */}
              <button
                onClick={handlePattersonizeProse}
                disabled={isPattersonizing || !activeChapter?.content}
                className="bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50"
                title="Strips wallpaper fluff, cuts long paragraphs, and sharpens cliffhanger ending"
              >
                {isPattersonizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Scissors className="w-3.5 h-3.5 text-rose-400" />}
                Pattersonize It!
              </button>

              {/* Generate Chapter with Formula */}
              <button
                onClick={handleWriteFormulaChapter}
                disabled={isWritingChapter}
                className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
              >
                {isWritingChapter ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Write Chapter with {currentFormula.authorName} Formula</span>
              </button>

            </div>
          </div>

          {/* Chapter Metadata: POV & Ticking Clock (Patterson Rules 4 & 5) */}
          {activeChapter && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">
                  Chapter POV Character (Rule 4: Alternate POVs)
                </label>
                <input
                  type="text"
                  value={activeChapter.povCharacter || 'Protagonist: Leo'}
                  onChange={(e) => onUpdateChapter(activeChapter.id, { povCharacter: e.target.value })}
                  placeholder="e.g. Detective Alex Cross / Antagonist: The Shadow"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">
                  Ticking Clock Urgency (Rule 5)
                </label>
                <input
                  type="text"
                  value={activeChapter.tickingClockNote || 'T-minus 36 hours before launch'}
                  onChange={(e) => onUpdateChapter(activeChapter.id, { tickingClockNote: e.target.value })}
                  placeholder="e.g. 18 minutes remaining on the bomb timer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">
                  Closing Cliffhanger Beat (Rule 3)
                </label>
                <input
                  type="text"
                  value={activeChapter.cliffhangerHook || ''}
                  onChange={(e) => onUpdateChapter(activeChapter.id, { cliffhangerHook: e.target.value })}
                  placeholder="Unresolved twist / impending danger that forces page turn..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          )}

          {/* Main Dual Surface: Editor (Left 2 cols) + Live Patterson Compliance Radar (Right 1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Editor Workspace */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Pattersonized Result Banner (if just run) */}
              {pattersonizeResult && (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Scissors className="w-4 h-4 text-emerald-400" />
                      Prose Successfully Pattersonized!
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      {pattersonizeResult.complianceGrade || 'A+ (Patterson Masterpiece)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {pattersonizeResult.beforeAfterAnalysis}
                  </p>
                  {pattersonizeResult.cliffhangerAdded && (
                    <div className="text-[11px] font-mono text-amber-300 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <strong>Zeigarnik Cliffhanger Injected:</strong> {pattersonizeResult.cliffhangerAdded}
                    </div>
                  )}
                </div>
              )}

              {/* Text Surface */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <Feather className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-slate-200">
                      {activeChapter?.title || 'Chapter Manuscript'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                      (activeChapter?.wordCount || 0) >= 600 && (activeChapter?.wordCount || 0) <= 1100
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {activeChapter?.wordCount || 0} words {((activeChapter?.wordCount || 0) >= 600 && (activeChapter?.wordCount || 0) <= 1100) ? '✓ Patterson Target' : '(Aim for 600-1100w)'}
                    </span>
                  </div>
                </div>

                <textarea
                  rows={20}
                  value={activeChapter?.content || ''}
                  onChange={(e) => {
                    const text = e.target.value;
                    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
                    if (activeChapter) {
                      onUpdateChapter(activeChapter.id, {
                        content: text,
                        wordCount: words
                      });
                    }
                  }}
                  placeholder="Write or generate your high-velocity chapter here. Micro-chapters, staccato paragraphs, zero fluff, and cliffhanger endings are enforced..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-amber-500/50 font-serif"
                />

                {/* Footer Advice */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800">
                  <span>💡 Patterson Rule 6: Cut wallpaper description. Every paragraph must advance action or conflict.</span>
                  <button
                    onClick={() => {
                      if (onSwitchToManuscriptEditor) {
                        onSwitchToManuscriptEditor();
                      }
                    }}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span>Open in Full Editor</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Live Patterson Compliance Radar */}
            <div className="space-y-4">
              
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">Patterson Compliance Scorecard</h3>
                      <span className="text-[10px] font-mono text-slate-400">9-Point Bestseller Benchmark</span>
                    </div>
                  </div>
                  {complianceReport && (
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {complianceReport.overallGrade}
                    </span>
                  )}
                </div>

                {complianceReport ? (
                  <div className="space-y-4">
                    
                    {/* Overall Score Meter */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-300">Overall Formula Score</span>
                        <span className="text-amber-400 font-bold">{complianceReport.overallScore}/100</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-500 transition-all duration-500"
                          style={{ width: `${complianceReport.overallScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Word Count Metric */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <CheckCircle className={`w-3.5 h-3.5 ${complianceReport.wordCountScore.pass ? 'text-emerald-400' : 'text-amber-400'}`} />
                          Micro-Chapter Word Target
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {complianceReport.wordCountScore.count}w / {complianceReport.wordCountScore.targetMin}-{complianceReport.wordCountScore.targetMax}w
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        {complianceReport.wordCountScore.feedback}
                      </p>
                    </div>

                    {/* Cliffhanger Audit */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-rose-400" />
                          Zeigarnik Cliffhanger Audit
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {complianceReport.cliffhangerAudit.tensionLevel} ({complianceReport.cliffhangerAudit.intensity}%)
                        </span>
                      </div>
                      {complianceReport.cliffhangerAudit.cliffhangerSentence && (
                        <div className="text-[11px] font-mono text-rose-300/90 italic bg-slate-900 p-2 rounded-lg border border-slate-800">
                          &ldquo;{complianceReport.cliffhangerAudit.cliffhangerSentence}&rdquo;
                        </div>
                      )}
                      <p className="text-[11px] text-slate-400 leading-normal">
                        {complianceReport.cliffhangerAudit.feedback}
                      </p>
                    </div>

                    {/* Fluff & Wallpaper Detection */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Scissors className="w-3.5 h-3.5 text-indigo-400" />
                          Fluff & Inertia Detection
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400">
                          {complianceReport.fluffDetection.fluffPercentage}% Fluff ({complianceReport.fluffDetection.propulsionRating}% Propulsion)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        {complianceReport.fluffDetection.verdict}
                      </p>
                    </div>

                    {/* Rules Followed Badges */}
                    <div>
                      <span className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5">Verified Patterson Rules</span>
                      <div className="space-y-1">
                        {complianceReport.pattersonRulesFollowed?.map((rule, idx) => (
                          <div key={idx} className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1.5">
                            <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    {complianceReport.recommendations?.length > 0 && (
                      <div>
                        <span className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5">Editor Recommendations</span>
                        <div className="space-y-1">
                          {complianceReport.recommendations.map((rec, idx) => (
                            <div key={idx} className="text-[11px] text-amber-200/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 flex items-start gap-1.5">
                              <span className="text-amber-400">⚡</span>
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Click <strong>Audit Formula</strong> or generate a chapter to evaluate word targets, Zeigarnik cliffhangers, and fluff elimination.
                    </p>
                    <button
                      onClick={() => handleAuditPatterson()}
                      disabled={isAuditing || !activeChapter?.content}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md"
                    >
                      Run Instant Audit
                    </button>
                  </div>
                )}
              </div>

              {/* Patterson Rule Quick Reference Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs text-slate-300">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Why Patterson&apos;s Formula Works
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Patterson created a publishing empire worth over $800M by treating storytelling like a biochemical dopamine dispenser. Micro-chapters trigger frequent task completion loops in reader neurology, while cliffhangers exploit the <em>Zeigarnik Effect</em> (human memory prioritizes unfinished tasks), rendering it physically difficult to stop reading.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* SUB-VIEW 2: GRANULAR MASTER OUTLINER (PATTERSON METHOD) */}
      {activeSubTab === 'outline' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mb-2">
                  <Layers className="w-3 h-3 text-amber-400" />
                  Rule 1: Exhaustive Chapter-by-Chapter Beat Outline First
                </span>
                <h2 className="text-xl font-bold text-slate-100">
                  The Patterson Master Outline Generator
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Patterson never writes a single word of prose without an exhaustive 60-80 page outline where every single chapter has its turning point, ticking clock, and cliffhanger locked down.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
                  <span className="text-xs text-slate-400 font-mono">Chapters:</span>
                  <select
                    value={outlineChapterCount}
                    onChange={(e) => setOutlineChapterCount(Number(e.target.value))}
                    className="bg-transparent text-xs font-bold text-amber-300 focus:outline-none"
                  >
                    <option value="8">8 Chapters (Fast Novella)</option>
                    <option value="12">12 Chapters (Standard Bestseller)</option>
                    <option value="16">16 Chapters (Extended Thriller)</option>
                    <option value="20">20 Chapters (Epic Mystery)</option>
                  </select>
                </div>

                <button
                  onClick={handleGeneratePattersonOutline}
                  disabled={isGeneratingOutline}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isGeneratingOutline ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Generate Full Master Outline</span>
                </button>
              </div>
            </div>
          </div>

          {/* Outline Beats Grid */}
          {formulaOutline.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formulaOutline.map((beat) => (
                <div 
                  key={beat.chapterNumber}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 space-y-3 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Beat #{beat.chapterNumber}
                      </span>
                      <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {beat.tickingClock}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {beat.title}
                    </h3>

                    <div className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 inline-block">
                      POV: {beat.pov}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>Conflict:</strong> {beat.coreConflict}
                    </p>

                    <div className="text-[11px] font-mono text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                      <strong>Zeigarnik Cliffhanger:</strong> {beat.cliffhangerBeat}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-slate-500">
                      Target: {beat.wordTarget}w
                    </span>
                    <button
                      onClick={() => handleAdoptOutlineBeat(beat)}
                      className="bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1"
                    >
                      <span>Adopt &amp; Write</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <Layers className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">No Master Outline Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click the &ldquo;Generate Full Master Outline&rdquo; button above to build an authentic Patterson-style chapter-by-chapter outline with alternating POVs and relentless cliffhangers.
              </p>
              <button
                onClick={handleGeneratePattersonOutline}
                disabled={isGeneratingOutline}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Outline Now</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: TOP AUTHORS FORMULA LIBRARY */}
      {activeSubTab === 'formulas' && (
        <div className="space-y-6">
          
          {/* Header & Filter Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  Top Bestseller Formulas &amp; Author Mimicry Vault
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Research-backed narrative architectures reverse-engineered from the world&apos;s most commercially successful authors. Select any formula to mimic their voice and structural rules.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formulaSearchQuery}
                  onChange={(e) => setFormulaSearchQuery(e.target.value)}
                  placeholder="Search authors, formulas, keywords..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              {[
                { id: 'all', label: 'All Authors (10)' },
                { id: 'suspense', label: 'High-Velocity Suspense (Patterson, Brown, Child, Crichton)' },
                { id: 'mystery', label: 'Puzzle Box & Noir (Christie, Flynn)' },
                { id: 'epic', label: 'Hard Worldbuilding (Sanderson)' },
                { id: 'literary', label: 'Psychological & Drama (King, Hoover, Gladwell)' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFormulaCategoryFilter(cat.id as any)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    formulaCategoryFilter === cat.id
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Formulas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFormulas.map((f) => {
              const isSelected = selectedFormulaId === f.id;
              return (
                <div
                  key={f.id}
                  className={`bg-slate-900 rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    
                    {/* Author Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shadow-inner">
                          {f.avatar}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                            <span>{f.authorName}</span>
                            {f.id === 'james-patterson' && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                                #1 Default
                              </span>
                            )}
                          </h3>
                          <span className="text-[11px] font-mono text-amber-400 block font-semibold">
                            {f.formulaTitle}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>

                    {/* Bestseller Credentials */}
                    <div className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      {f.bestsellerCredentials}
                    </div>

                    {/* Cadence Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-500 block">Chapter Length:</span>
                        <span className="text-slate-200 font-bold">
                          {f.targetChapterWordCount.min}-{f.targetChapterWordCount.max}w (avg {f.targetChapterWordCount.typical}w)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Pacing Cadence:</span>
                        <span className="text-amber-300 font-bold capitalize">
                          {f.pacingVelocity.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Core Rules Preview */}
                    <div className="space-y-1.5 pt-1">
                      <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Signature Mechanics</span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {f.coreRules.slice(0, 3).map((r, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-mono text-[10px] font-bold mt-0.5">#{r.ruleNumber}</span>
                            <span className="leading-tight"><strong className="text-slate-200">{r.title}:</strong> {r.mechanism.substring(0, 85)}...</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Opening Hook & Ending Cliffhanger Samples */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-[11px]">
                      <div>
                        <span className="text-[10px] font-mono text-indigo-400 block">Sample Opening Hook:</span>
                        <p className="text-slate-300 italic">&ldquo;{f.sampleOpeningHook}&rdquo;</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-rose-400 block">Sample Ending Cliffhanger:</span>
                        <p className="text-rose-200/90 italic">&ldquo;{f.sampleEndingCliffhanger}&rdquo;</p>
                      </div>
                    </div>

                  </div>

                  {/* Apply Formula Button */}
                  <div className="pt-3 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedFormulaId(f.id as AuthorFormulaId);
                        updateEngineConfig({ selectedFormulaId: f.id });
                        setActiveSubTab('machine');
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200'
                      }`}
                    >
                      <span>{isSelected ? 'Currently Active Formula' : `Mimic & Apply ${f.authorName} Formula`}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* SUB-VIEW 4: AUTHOR VOICE CLONER & STYLOMETRY LAB */}
      {activeSubTab === 'cloner' && (
        <div className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-indigo-400" />
              AI Author Stylometry &amp; Voice Fingerprint Cloner
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Paste 1 to 3 paragraphs of ANY author (Hemingway, Cormac McCarthy, Haruki Murakami, George R.R. Martin, Jane Austen, etc.). The AI forensic stylometry engine extracts sentence cadence, lexical density, sensory palette, and writes new book chapters in their exact voice while maintaining James Patterson pacing.
            </p>

            {/* Quick 1-Click Preset Buttons */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2">Or Choose a Legendary Preset to Clone:</span>
              <div className="flex flex-wrap items-center gap-2">
                {AUTHOR_CLONING_PRESETS.map((preset) => (
                  <button
                    key={preset.authorName}
                    onClick={() => {
                      setCustomAuthorName(preset.authorName);
                      setCustomSampleText(preset.sampleText);
                      handleCloneAuthorVoice(preset.authorName, preset.sampleText);
                    }}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <span>⚡ {preset.authorName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form & Extracted Fingerprint Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Cloner Input Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Feather className="w-4 h-4 text-amber-400" />
                Target Author Prose Sample
              </h3>

              <div>
                <label className="block text-xs text-slate-400 font-mono mb-1">Author Name / Pen Name</label>
                <input
                  type="text"
                  value={customAuthorName}
                  onChange={(e) => setCustomAuthorName(e.target.value)}
                  placeholder="e.g. Ernest Hemingway, Cormac McCarthy, Donna Tartt"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-mono mb-1">
                  Sample Prose Excerpt (1-3 paragraphs)
                </label>
                <textarea
                  rows={8}
                  value={customSampleText}
                  onChange={(e) => setCustomSampleText(e.target.value)}
                  placeholder="Paste excerpt from a published novel or story by this author..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 leading-relaxed font-serif focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <button
                onClick={() => handleCloneAuthorVoice()}
                disabled={isCloningVoice || !customSampleText}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isCloningVoice ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                <span>Extract Stylistic Fingerprint &amp; Clone Voice</span>
              </button>
            </div>

            {/* Extracted Voice DNA Fingerprint */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Extracted Stylometric Fingerprint
              </h3>

              {clonedFingerprint ? (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Syntactic Cadence</span>
                    <p className="text-xs text-slate-200 leading-relaxed">{clonedFingerprint.syntaxCadence}</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Lexical Density &amp; Diction</span>
                    <p className="text-xs text-slate-200 leading-relaxed">{clonedFingerprint.vocabularyGrade}</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Dialogue Dynamics</span>
                    <p className="text-xs text-slate-200 leading-relaxed">{clonedFingerprint.dialogueStyle}</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Sensory Palette</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {clonedFingerprint.sensoryPalette?.map((s: string, idx: number) => (
                        <span key={idx} className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {clonedFingerprint.sampleEmulationExcerpt && (
                    <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-500/30 space-y-1">
                      <span className="text-[10px] font-mono text-indigo-300 uppercase block">AI Demonstration Emulation</span>
                      <p className="text-xs text-indigo-100 italic font-serif leading-relaxed">
                        &ldquo;{clonedFingerprint.sampleEmulationExcerpt}&rdquo;
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedFormulaId('custom-clone');
                      setActiveSubTab('machine');
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Write Current Book with this Cloned Voice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <Wand2 className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Paste author text on the left or select a preset to analyze syntax cadence, vocabulary grade, and sensory palette.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* SUB-VIEW 5: BESTSELLER FORMULA RESEARCH VAULT */}
      {activeSubTab === 'research' && (
        <div className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              The Empirical Science of Bestseller Formulas
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Every major literary empire is built upon rigorous mathematical and psychological formulas. From Charles Dickens serializing Victorian cliffhangers in weekly newspapers to James Patterson selling 425M+ books through micro-chapters and dopamine loops, top authors rely on repeatable engineering rather than capricious inspiration.
            </p>
          </div>

          {/* Research Findings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* The Patterson Blueprint Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl font-bold">
                  ⚡
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">The James Patterson Production Method</h3>
                  <span className="text-[11px] font-mono text-amber-400">Guinness World Record for Most NYT #1s (114)</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong>The Advertising Background:</strong> Before writing full-time, Patterson was CEO of the global advertising firm J. Walter Thompson. He applied advertising psychology to novel writing: cut dead weight, maximize brand recognizability, and create immediate emotional resonance.
                </p>
                <p>
                  <strong>The 80-Page Outline System:</strong> Patterson famously creates an ultra-detailed outline for every book that is 60 to 80 pages long. Each chapter is mapped with:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-[11px]">
                  <li>The specific dramatic question introduced</li>
                  <li>The action beat driving conflict</li>
                  <li>The exact cliffhanger terminating the scene</li>
                  <li>Which character perspective provides maximum dramatic irony</li>
                </ul>
                <p>
                  <strong>The Dopamine Hook:</strong> Because an average chapter is only 800 words (about 3 minutes of reading time), readers repeatedly trick themselves into thinking &ldquo;I&apos;ll just read one more chapter before sleeping.&rdquo; In reality, they read 10 chapters in 30 minutes.
                </p>
              </div>
            </div>

            {/* The Top Author Formula Comparison Matrix */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xl font-bold">
                  📊
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Formula Comparative Statistics</h3>
                  <span className="text-[11px] font-mono text-indigo-400">Structural DNA of Top 5 Fiction Titans</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { author: 'James Patterson', avgWords: '850w', cliffhangerRate: '100% (Every Chapter)', pov: 'Dual Asymmetric (Hero vs Killer)', sales: '425M+' },
                  { author: 'Dan Brown', avgWords: '1,100w', cliffhangerRate: '95% (Puzzle breaks)', pov: 'Omniscient Ticking Clock', sales: '250M+' },
                  { author: 'Agatha Christie', avgWords: '1,500w', cliffhangerRate: '80% (Alibi contradictions)', pov: 'Objective Observer Sleuth', sales: '2B+' },
                  { author: 'Stephen King', avgWords: '1,800w', cliffhangerRate: '40% (Ominous foreshadowing)', pov: 'Deep 3rd Small-Town Dread', sales: '350M+' },
                  { author: 'Brandon Sanderson', avgWords: '2,800w', cliffhangerRate: '30% (Converges in Sanderstorm)', pov: 'Multi-Thread Hard Magic', sales: '40M+' }
                ].map((stat, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="flex justify-between font-bold text-slate-200">
                      <span>{stat.author}</span>
                      <span className="text-emerald-400 font-mono">{stat.sales} copies</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 pt-1">
                      <div>Words/Ch: <span className="text-amber-300">{stat.avgWords}</span></div>
                      <div>Cliffhangers: <span className="text-rose-300">{stat.cliffhangerRate}</span></div>
                      <div>POV: <span className="text-indigo-300">{stat.pov}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
