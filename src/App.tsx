import React, { useState, useEffect } from 'react';
import { PublishingProject, Chapter, CharacterProfile, WorldBible, PublishingMetadata } from './types/storyforge';
import { INITIAL_PROJECTS } from './data/mockProjects';
import { Navbar } from './components/Navbar';
import { PipelineTracker } from './components/PipelineTracker';
import { CouncilRoom } from './components/CouncilRoom';
import { ManuscriptEditor } from './components/ManuscriptEditor';
import { CharacterAndWorldLab } from './components/CharacterAndWorldLab';
import { IllustrationStudio } from './components/IllustrationStudio';
import { CartoonStudio } from './components/CartoonStudio';
import { PublishingStudio } from './components/PublishingStudio';
import { MarketingAndVideoFactory } from './components/MarketingAndVideoFactory';
import { MerchStudio } from './components/MerchStudio';
import { ScienceLabAnalytics } from './components/ScienceLabAnalytics';
import { ExportPackageHub } from './components/ExportPackageHub';
import { SophisticatedBookEngine } from './components/SophisticatedBookEngine';
import { SubscriptionConnectorsHub } from './components/SubscriptionConnectorsHub';
import { APIKeyConfiguration } from './components/APIKeyConfiguration';
import { AppFileDropOverlay } from './components/AppFileDropOverlay';
import { NewProjectModal } from './components/NewProjectModal';
import { EmpireOSSystemStatusModal } from './components/EmpireOSSystemStatusModal';
import { ThreeStudio } from './components/ThreeStudio';
import { LyriaMusicStudio } from './components/LyriaMusicStudio';
import { VeoVideoStudio } from './components/VeoVideoStudio';
import { GeminiChatbotStudio } from './components/GeminiChatbotStudio';
import { BossListerCommercialStudio } from './components/BossListerCommercialStudio';
import { Plus, RefreshCw, BookOpen, CheckCircle2, AlertCircle, Sparkles, X, Info } from 'lucide-react';
import { ProjectMilestone } from './types/storyforge';

const STORAGE_KEY = 'EMPIRE_OS_PROJECTS_V1';

export default function App() {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [projects, setProjects] = useState<PublishingProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed loading saved projects', e);
    }
    return INITIAL_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => projects[0]?.id || '');
  const [activeTab, setActiveTab] = useState<string>('cartoons');
  const [selectedCartoonChapterId, setSelectedCartoonChapterId] = useState<string | undefined>();
  const [mode, setMode] = useState<'beginner' | 'professional'>('professional');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalInitialTab, setModalInitialTab] = useState<'scratch' | 'video'>('scratch');
  const [isSystemStatusOpen, setIsSystemStatusOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastNotice, setToastNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastNotice({ message, type });
    setTimeout(() => {
      setToastNotice(prev => prev?.message === message ? null : prev);
    }, 5500);
  };

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed saving projects to localStorage', e);
    }
  }, [projects]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Update active project helper
  const updateActiveProject = (updatedFields: Partial<PublishingProject>) => {
    if (!activeProject) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProject.id ? { ...p, ...updatedFields } : p))
    );
  };

  // Drag and drop right to app handlers
  const handleFileDropImportProject = (projectData: any) => {
    try {
      const newId = projectData.id || `proj_${Date.now()}`;
      const imported: PublishingProject = {
        ...INITIAL_PROJECTS[0],
        ...projectData,
        id: newId,
        updatedAt: new Date().toISOString()
      };
      setProjects(prev => [imported, ...prev.filter(p => p.id !== newId)]);
      setActiveProjectId(newId);
      showToast(`Successfully imported book project "${imported.name}" into workspace!`, 'success');
    } catch (err: any) {
      showToast(`Error importing project: ${err.message}`, 'error');
    }
  };

  const handleFileDropImportManuscript = (title: string, content: string) => {
    if (!activeProject) {
      showToast('Please select or create a book project first.', 'error');
      return;
    }
    const words = content.split(/\s+/).filter(Boolean).length;
    const nextNum = (activeProject.manuscript?.chapters?.length || 0) + 1;
    const newChapter: Chapter = {
      id: `ch-dropped-${Date.now()}`,
      chapterNumber: nextNum,
      title: title || `Chapter ${nextNum}: Ingested Manuscript`,
      synopsis: `Ingested chapter draft (${words} words)`,
      content: content,
      wordCount: words,
      readabilityScore: 88,
      status: 'Council Review',
      illustrationBrief: {
        sceneDescription: `Key dramatic scene from ${title}`,
        visualFocus: 'Protagonist confrontation scene',
        midjourneyPrompt: `Cinematic book illustration for ${title}, detailed lighting, 8k --ar 16:9`,
        dallePrompt: `Detailed book illustration for ${title}`
      }
    };

    updateActiveProject({
      manuscript: {
        ...activeProject.manuscript,
        chapters: [...(activeProject.manuscript?.chapters || []), newChapter],
        wordCountTotal: (activeProject.manuscript?.wordCountTotal || 0) + words
      }
    });
    setActiveTab('manuscript');
    showToast(`Ingested chapter "${newChapter.title}" (${words} words)! Switched to Manuscript Editor.`, 'success');
  };

  const handleFileDropImportSchedule = (scheduleData: any) => {
    if (!activeProject) {
      showToast('Select a book project first to update its milestone schedule.', 'error');
      return;
    }
    let milestonesToApply: ProjectMilestone[] = [];
    if (Array.isArray(scheduleData)) {
      milestonesToApply = scheduleData;
    } else if (scheduleData?.milestones && Array.isArray(scheduleData.milestones)) {
      milestonesToApply = scheduleData.milestones;
    } else if (scheduleData?.csvText) {
      const lines = (scheduleData.csvText as string).split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length > 1) {
        milestonesToApply = lines.slice(1).map((row, idx) => {
          const cols = row.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          const title = cols[0] || `Phase ${idx + 1}`;
          const duration = parseFloat(cols[1]) || 4;
          const startDay = parseFloat(cols[2]) || idx * 4;
          return {
            id: `m_drop_${idx + 1}`,
            phaseNumber: idx + 1,
            title,
            subtitle: `Imported via schedule file`,
            category: 'Foundation',
            stages: [idx + 1],
            sf2Stages: ['BRIEF_INGEST'],
            targetDaysFromStart: Math.round(startDay + duration),
            startDate: new Date(Date.now() + startDay * 86400000).toISOString().slice(0, 10),
            targetDeadline: new Date(Date.now() + (startDay + duration) * 86400000).toISOString().slice(0, 10),
            startDay,
            durationDays: duration,
            owner: cols[3] || 'Publishing AI',
            status: 'UPCOMING',
            progressPercent: 0,
            criticalPath: idx % 2 === 0,
            deliverables: [
              { id: `d_drop_${idx}_1`, label: `Execute ${title}`, completed: false, requiredForNext: true }
            ]
          };
        });
      }
    }

    if (milestonesToApply.length > 0) {
      updateActiveProject({ milestones: milestonesToApply });
      setActiveTab('pipeline');
      showToast(`Imported ${milestonesToApply.length} milestones! Switched to Pipeline Timeline Tracker.`, 'success');
    } else {
      setActiveTab('pipeline');
      showToast('Schedule file received and routed to Pipeline Tracker.', 'info');
    }
  };

  const handleFileDropImportImage = (dataUrl: string, fileName: string) => {
    if (!activeProject) {
      showToast('Select a book project first to assign artwork.', 'error');
      return;
    }
    updateActiveProject({
      illustrationGuide: {
        ...activeProject.illustrationGuide,
        coverBrief: {
          ...activeProject.illustrationGuide?.coverBrief,
          coverImageUrl: dataUrl
        }
      }
    });
    showToast(`Assigned "${fileName}" as the active book cover artwork!`, 'success');
  };

  // Seed / Clear Handlers
  const handleLoadSeedData = () => {
    setProjects(INITIAL_PROJECTS);
    setActiveProjectId(INITIAL_PROJECTS[0].id);
  };

  const handleClearData = () => {
    setProjects([]);
    setActiveProjectId('');
    localStorage.removeItem(STORAGE_KEY);
  };

  // 1. Pipeline step advancement
  const handleAdvanceStep = (stepNumber: number) => {
    updateActiveProject({ currentStep: stepNumber });
  };

  // 2. Run Council Debate
  const handleRunDebate = async (topic: string, snippet?: string) => {
    if (!activeProject) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/council/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProject.id, topic, manuscriptSnippet: snippet })
      });
      const data = await res.json();
      if (data.success && data.debate) {
        updateActiveProject({
          councilDebate: [...(activeProject.councilDebate || []), ...data.debate]
        });
      }
    } catch (err) {
      console.error('Debate error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Chapter updates & AI writing
  const handleUpdateChapter = (chapterId: string, updated: Partial<Chapter>) => {
    if (!activeProject) return;
    const updatedChapters = activeProject.manuscript.chapters.map((ch) =>
      ch.id === chapterId ? { ...ch, ...updated } : ch
    );
    updateActiveProject({
      manuscript: {
        ...activeProject.manuscript,
        chapters: updatedChapters
      }
    });
  };

  const handleAddChapter = (custom?: Partial<Chapter>) => {
    if (!activeProject) return;
    const nextNum = (activeProject.manuscript.chapters?.length || 0) + 1;
    const newCh: Chapter = {
      id: `ch-${Date.now()}`,
      chapterNumber: custom?.chapterNumber ?? nextNum,
      title: custom?.title || `Chapter ${nextNum}: New Horizon`,
      synopsis: custom?.synopsis || 'Outline chapter beats...',
      content: custom?.content || 'Start writing your new chapter manuscript here...',
      wordCount: custom?.wordCount || 8,
      readabilityScore: custom?.readabilityScore || 85,
      status: custom?.status || 'Draft',
      povCharacter: custom?.povCharacter,
      cliffhangerHook: custom?.cliffhangerHook,
      tickingClockNote: custom?.tickingClockNote,
      authorFormulaApplied: custom?.authorFormulaApplied,
      pattersonCompliance: custom?.pattersonCompliance,
      illustrationBrief: custom?.illustrationBrief || {
        sceneDescription: 'Scene illustration focus...',
        visualFocus: 'Key characters in dramatic action',
        midjourneyPrompt: 'Cinematic wide shot --ar 16:9',
        dallePrompt: 'Detailed storybook illustration...'
      }
    };

    updateActiveProject({
      manuscript: {
        ...activeProject.manuscript,
        chapters: [...activeProject.manuscript.chapters, newCh]
      }
    });
  };

  const handleUpdateProjectConfig = (updatedConfig: any) => {
    if (!activeProject) return;
    updateActiveProject({
      authorMachineConfig: {
        ...(activeProject.authorMachineConfig || {
          selectedFormulaId: 'james-patterson',
          enforcePattersonRules: true,
          targetChapterWords: 850,
          pacingDial: 95,
          cliffhangerSeverity: 90,
          fluffRemoverStrength: 85,
          dualPovMode: true
        }),
        ...updatedConfig
      }
    });
  };

  const handleUpdateFormulaOutline = (outline: any[]) => {
    if (!activeProject) return;
    updateActiveProject({ formulaOutline: outline });
  };

  const handleGenerateChapterAI = async (chapterId: string) => {
    if (!activeProject) return;
    setIsLoading(true);
    const ch = activeProject.manuscript.chapters.find((c) => c.id === chapterId);
    if (!ch) return;

    try {
      const res = await fetch('/api/chapter/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterTitle: ch.title,
          chapterSynopsis: ch.synopsis,
          worldContext: activeProject.worldBible.settingOverview,
          characterContext: activeProject.characters.map((c) => c.name).join(', ')
        })
      });
      const data = await res.json();
      if (data.success && data.chapter) {
        handleUpdateChapter(chapterId, {
          content: data.chapter.content || ch.content,
          wordCount: data.chapter.wordCount || ch.wordCount,
          readabilityScore: data.chapter.readabilityScore || ch.readabilityScore,
          status: 'Polished',
          illustrationBrief: data.chapter.illustrationBrief || ch.illustrationBrief
        });
      }
    } catch (err) {
      console.error('Chapter AI error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Character & World Bible updates
  const handleUpdateCharacters = (characters: CharacterProfile[]) => {
    updateActiveProject({ characters });
  };

  const handleUpdateWorldBible = (worldBible: WorldBible) => {
    updateActiveProject({ worldBible });
  };

  // 5. Publishing Metadata
  const handleUpdateMetadata = (updated: Partial<PublishingMetadata>) => {
    if (!activeProject) return;
    updateActiveProject({
      publishingMetadata: {
        ...activeProject.publishingMetadata,
        ...updated
      }
    });
  };

  // 6. New Project Creation
  const handleCreateProject = async (data: {
    title: string;
    genre: any;
    targetAge: any;
    theme: string;
    educationalGoals: string[];
    mode: 'beginner' | 'professional';
    customChapters?: Chapter[];
    outline?: any[];
  }) => {
    setIsLoading(true);
    try {
      let manuscriptData: any = null;
      let result: any = null;

      if (data.customChapters && data.customChapters.length > 0) {
        manuscriptData = {
          title: data.title,
          subtitle: 'Adapted from Video Story',
          targetAge: data.targetAge,
          genre: data.genre,
          theme: data.theme,
          educationalGoals: data.educationalGoals,
          wordCountTotal: data.customChapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0),
          readingLevelGrade: data.targetAge.includes('Middle') ? 'Grade 5' : 'Grade 8',
          synopsis: `Complete narrative adapted from video story with ${data.customChapters.length} Patterson-formula compliant chapters.`,
          chapters: data.customChapters,
        };
      } else {
        const res = await fetch('/api/generate-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        result = await res.json();
        manuscriptData = result.data?.manuscript;
      }

      const newProj: PublishingProject = {
        id: `empire-proj-${Date.now()}`,
        name: data.title,
        goal: `Build an enterprise ${data.genre} book for ${data.targetAge}`,
        targetAge: data.targetAge,
        genre: data.genre,
        theme: data.theme || 'Courage and discovery',
        mode: data.mode,
        currentStep: 1,
        status: 'Drafting',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        manuscript: manuscriptData || {
          title: data.title,
          subtitle: 'Book 1: The Beginning',
          targetAge: data.targetAge,
          genre: data.genre,
          theme: data.theme,
          educationalGoals: data.educationalGoals,
          wordCountTotal: 12000,
          readingLevelGrade: 'Grade 4.5',
          synopsis: 'An epic new adventure unfolds.',
          chapters: [
            {
              id: `ch-init-1`,
              chapterNumber: 1,
              title: 'Chapter 1: The Call to Adventure',
              synopsis: 'The journey starts with an unexpected discovery.',
              content: 'The morning mist clung to the rooftops as our hero stepped out into the courtyard...',
              wordCount: 140,
              readabilityScore: 88,
              status: 'Draft',
              illustrationBrief: {
                sceneDescription: 'Hero standing on courtyard looking out toward horizon',
                visualFocus: 'Atmospheric mist and sunrise lighting',
                midjourneyPrompt: 'Cinematic fantasy landscape sunrise --ar 16:9',
                dallePrompt: 'Storybook illustration of sunrise over ancient town'
              }
            }
          ]
        },

        worldBible: result?.data?.worldBible || INITIAL_PROJECTS[0].worldBible,
        characters: result?.data?.characters || INITIAL_PROJECTS[0].characters,
        illustrationGuide: result?.data?.illustrationGuide || INITIAL_PROJECTS[0].illustrationGuide,
        scorecard: result?.data?.scorecard || INITIAL_PROJECTS[0].scorecard,
        publishingMetadata: result?.data?.publishingMetadata || INITIAL_PROJECTS[0].publishingMetadata,
        marketingPack: result?.data?.marketingPack || INITIAL_PROJECTS[0].marketingPack,
        videoPack: result?.data?.videoPack || INITIAL_PROJECTS[0].videoPack,
        merchPack: result?.data?.merchPack || INITIAL_PROJECTS[0].merchPack,
        analytics: INITIAL_PROJECTS[0].analytics,
        councilDebate: INITIAL_PROJECTS[0].councilDebate,
        cartoonEpisodes: []
      };

      const updated = [newProj, ...projects];
      setProjects(updated);
      setActiveProjectId(newProj.id);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error initializing project:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      
      {/* Navigation Header */}
      <Navbar
        projects={projects}
        activeProject={activeProject}
        onSelectProject={setActiveProjectId}
        onOpenNewModal={() => {
          setModalInitialTab('scratch');
          setIsModalOpen(true);
        }}
        onOpenBookFromVideo={() => {
          setModalInitialTab('video');
          setIsModalOpen(true);
        }}
        onExportPackage={() => setActiveTab('export')}
        onOpenSystemStatus={() => setIsSystemStatusOpen(true)}
        onOpenApiKeyConfig={() => setIsApiKeyModalOpen(true)}
        mode={mode}
        onToggleMode={setMode}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Empty Projects State */}
      {!activeProject ? (
        <main className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto shadow-xl">
            <BookOpen className="w-8 h-8 text-amber-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">No Books Active in Empire OS Workspace</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Create a brand new book project or reload default seed projects to begin narrative production in StoryForge Module.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              Create New Book
            </button>
            <button
              onClick={handleLoadSeedData}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 font-mono"
            >
              <RefreshCw className="w-4 h-4 text-sky-400" />
              Load Demo Seed Book
            </button>
          </div>
        </main>
      ) : (
        /* Main Workspace Body */
        <main className={activeTab === '3d-scene' ? 'w-full p-0 m-0' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'}>
          {activeTab === '3d-scene' && (
            <ThreeStudio
              onAttachVideoToChapter={(chNum, videoUrl) => {
                const target = activeProject.manuscript?.chapters?.find(c => c.chapterNumber === chNum) || activeProject.manuscript?.chapters?.[0];
                if (target) {
                  handleUpdateChapter(target.id, {
                    attachedVideoUrl: videoUrl
                  });
                  setActiveTab('manuscript');
                }
              }}
              onNavigateToVideoStudio={() => setActiveTab('veo-studio')}
            />
          )}

          {activeTab === 'music-studio' && (
            <LyriaMusicStudio
              project={activeProject}
              onAssignToChapter={(chNum, audioUrl, title) => {
                const target = activeProject.manuscript?.chapters?.find(c => c.chapterNumber === chNum) || activeProject.manuscript?.chapters?.[0];
                if (target) {
                  handleUpdateChapter(target.id, {
                    attachedAudioUrl: audioUrl,
                    attachedAudioTitle: title
                  });
                  setActiveTab('manuscript');
                }
              }}
            />
          )}

          {activeTab === 'veo-studio' && (
            <VeoVideoStudio
              project={activeProject}
              onNavigateToMusic={() => setActiveTab('music-studio')}
              onAttachVideoToChapter={(chNum, videoUrl) => {
                const target = activeProject.manuscript?.chapters?.find(c => c.chapterNumber === chNum) || activeProject.manuscript?.chapters?.[0];
                if (target) {
                  handleUpdateChapter(target.id, {
                    attachedVideoUrl: videoUrl
                  });
                  setActiveTab('manuscript');
                }
              }}
            />
          )}

          {activeTab === 'gemini-chat' && (
            <GeminiChatbotStudio
              project={activeProject}
              onApplyToChapter={(chapterId, snippet) => {
                const target = activeProject.manuscript?.chapters?.find(c => c.id === chapterId) || activeProject.manuscript?.chapters?.[0];
                if (target) {
                  const updatedContent = `${target.content}\n\n${snippet}`;
                  handleUpdateChapter(target.id, { content: updatedContent });
                }
              }}
            />
          )}

          {activeTab === 'pipeline' && (
            <PipelineTracker
              project={activeProject}
              onAdvanceStep={handleAdvanceStep}
              onRunStageAudit={(stageName) => handleRunDebate(`Stage Audit: ${stageName}`)}
              onUpdateMilestones={(updatedMilestones) => {
                updateActiveProject({ milestones: updatedMilestones });
              }}
            />
          )}

          {activeTab === 'connectors' && (
            <SubscriptionConnectorsHub
              project={activeProject}
              onApplyGeneratedContent={(chapterNum, text) => {
                const target = activeProject.manuscript?.chapters?.[chapterNum - 1] || activeProject.manuscript?.chapters?.[0];
                if (target) {
                  handleUpdateChapter(target.id, { content: text });
                  setActiveTab('manuscript');
                }
              }}
            />
          )}

          {activeTab === 'apikeys' && (
            <APIKeyConfiguration />
          )}

          {activeTab === 'council' && (
            <CouncilRoom
              project={activeProject}
              onRunDebate={handleRunDebate}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'bookmachine' && (
            <SophisticatedBookEngine
              project={activeProject}
              onUpdateChapter={handleUpdateChapter}
              onAddChapter={handleAddChapter}
              onUpdateProjectConfig={handleUpdateProjectConfig}
              onUpdateFormulaOutline={handleUpdateFormulaOutline}
              onSwitchToManuscriptEditor={() => setActiveTab('manuscript')}
            />
          )}

          {activeTab === 'manuscript' && (
            <ManuscriptEditor
              project={activeProject}
              onUpdateChapter={handleUpdateChapter}
              onAddChapter={handleAddChapter}
              onGenerateChapterAI={handleGenerateChapterAI}
              isLoading={isLoading}
              onOpenBookMachine={() => setActiveTab('bookmachine')}
              onAnimateToCartoon={(chapterId) => {
                setSelectedCartoonChapterId(chapterId);
                setActiveTab('cartoons');
              }}
              onNavigateToVeo={() => setActiveTab('veo-studio')}
              onNavigateToLyria={() => setActiveTab('music-studio')}
              onNavigateTo3D={() => setActiveTab('3d-scene')}
            />
          )}

          {activeTab === 'cartoons' && (
            <CartoonStudio
              project={activeProject}
              onUpdateProject={updateActiveProject}
              initialChapterId={selectedCartoonChapterId}
              onNavigateToVeo={() => setActiveTab('veo-studio')}
              onNavigateToLyria={() => setActiveTab('music-studio')}
              onNavigateTo3D={() => setActiveTab('3d-scene')}
            />
          )}

          {activeTab === 'bosslister' && (
            <BossListerCommercialStudio
              project={activeProject}
              onNavigateToCartoons={() => setActiveTab('cartoons')}
              onNavigateToVeo={() => setActiveTab('veo-studio')}
            />
          )}

          {activeTab === 'characters' && (
            <CharacterAndWorldLab
              project={activeProject}
              onUpdateCharacters={handleUpdateCharacters}
              onUpdateWorldBible={handleUpdateWorldBible}
            />
          )}

          {activeTab === 'illustration' && (
            <IllustrationStudio
              project={activeProject}
              onGeneratePrompts={() => handleRunDebate('Generate Multi-Engine Illustration Packs')}
              onNavigateToVeo={() => setActiveTab('veo-studio')}
              onNavigateToLyria={() => setActiveTab('music-studio')}
            />
          )}

          {activeTab === 'publishing' && (
            <PublishingStudio
              project={activeProject}
              onUpdateMetadata={handleUpdateMetadata}
              onDownloadFormats={(format) => alert(`Downloading ${format.toUpperCase()} format for ${activeProject.name}...`)}
            />
          )}

          {activeTab === 'marketing' && (
            <MarketingAndVideoFactory
              project={activeProject}
              onGenerateCampaign={() => handleRunDebate('Generate Omni-Channel Marketing Campaign')}
              onNavigateToCartoons={() => setActiveTab('cartoons')}
              onNavigateToBossLister={() => setActiveTab('bosslister')}
            />
          )}

          {activeTab === 'merch' && (
            <MerchStudio 
              project={activeProject} 
              onNavigateToBossLister={() => setActiveTab('bosslister')}
            />
          )}

          {activeTab === 'analytics' && (
            <ScienceLabAnalytics project={activeProject} />
          )}

          {activeTab === 'export' && (
            <ExportPackageHub project={activeProject} />
          )}
        </main>
      )}

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
        isLoading={isLoading}
        initialTab={modalInitialTab}
      />

      {/* Empire OS System Status & Capability Audit Modal */}
      <EmpireOSSystemStatusModal
        isOpen={isSystemStatusOpen}
        onClose={() => setIsSystemStatusOpen(false)}
        onLoadSeedData={handleLoadSeedData}
        onClearData={handleClearData}
        totalProjectsCount={projects.length}
      />

      {/* Multi-Provider API Key Configuration Modal (NVIDIA, Anthropic, OpenAI, Groq) */}
      <APIKeyConfiguration
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        isModal={true}
      />

      {/* Floating System Notification Toast */}
      {toastNotice && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full shadow-2xl animate-fadeIn">
          <div className={`p-4 rounded-2xl border backdrop-blur-md flex items-start gap-3 shadow-xl ${
            toastNotice.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : toastNotice.type === 'info'
              ? 'bg-sky-950/90 border-sky-500/50 text-sky-200'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}>
            <div className="shrink-0 mt-0.5">
              {toastNotice.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              ) : toastNotice.type === 'info' ? (
                <Info className="w-5 h-5 text-sky-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div className="flex-1 text-xs leading-relaxed font-medium">
              {toastNotice.message}
            </div>
            <button
              onClick={() => setToastNotice(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Global Drag-and-Drop Ingest Overlay (Drop files right to app) */}
      <AppFileDropOverlay
        onImportProject={handleFileDropImportProject}
        onImportManuscriptText={handleFileDropImportManuscript}
        onImportSchedule={handleFileDropImportSchedule}
        onImportImage={handleFileDropImportImage}
        onNotification={(msg, type) => showToast(msg, type)}
      />
    </div>
  );
}

