import React from 'react';
import { PublishingProject } from '../types/storyforge';
import { 
  BookOpen, Plus, Download, Sparkles, Cpu, Search, 
  Layers, CheckCircle, ShieldCheck, ChevronDown, Sliders, Info, FileArchive, Video
} from 'lucide-react';

interface NavbarProps {
  projects: PublishingProject[];
  activeProject: PublishingProject;
  onSelectProject: (id: string) => void;
  onOpenNewModal: () => void;
  onOpenBookFromVideo: () => void;
  onExportPackage: () => void;
  onOpenSystemStatus: () => void;
  mode: 'beginner' | 'professional';
  onToggleMode: (mode: 'beginner' | 'professional') => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onOpenNewModal,
  onOpenBookFromVideo,
  onExportPackage,
  onOpenSystemStatus,
  mode,
  onToggleMode,
  activeTab,
  onChangeTab,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-sky-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-300 bg-clip-text text-transparent">
                  Empire OS
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-amber-400" />
                  StoryForge Module
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Enterprise Narrative & Publishing Engine
              </p>
            </div>
          </div>

          {/* Project Selector & Search */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-xl">
            {/* Project Dropdown */}
            <div className="relative group">
              <select
                value={activeProject?.id || ''}
                onChange={(e) => onSelectProject(e.target.value)}
                className="appearance-none bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer transition-all"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    📖 {p.name} ({p.genre})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Quick Filter/Search */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search lore, characters, chapters, marketing..."
                className="w-full bg-slate-900/80 border border-slate-800/80 text-xs text-slate-200 placeholder:text-slate-500 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Action Buttons & Mode Switch */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* System Status & Audit trigger */}
            <button
              onClick={onOpenSystemStatus}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 text-xs font-medium px-2.5 py-2 rounded-lg border border-slate-800 flex items-center gap-1.5 transition-all"
              title="View Empire OS System Audit & Capability Matrix"
            >
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden lg:inline">System Audit</span>
            </button>

            {/* AI Subscription Connectors trigger (Zero API Key) */}
            <button
              onClick={() => onChangeTab('connectors')}
              className={`text-xs font-medium px-2.5 py-2 rounded-lg border flex items-center gap-1.5 transition-all ${
                activeTab === 'connectors'
                  ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-purple-300 border-slate-800'
              }`}
              title="Connect Claude Pro & ChatGPT Plus Subscriptions without an API key"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden xl:inline">Subscription Connectors</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => onToggleMode('beginner')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 ${
                  mode === 'beginner' 
                    ? 'bg-slate-800 text-amber-300 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Simplified Guided Author Mode"
              >
                <Sliders className="w-3 h-3" />
                <span className="hidden lg:inline">Guided</span>
              </button>
              <button
                onClick={() => onToggleMode('professional')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 ${
                  mode === 'professional' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Full Empire OS CTO Command Mode"
              >
                <ShieldCheck className="w-3 h-3" />
                <span className="hidden lg:inline">CTO Mode</span>
              </button>
            </div>

            {/* Book from Video Button */}
            <button
              onClick={onOpenBookFromVideo}
              className="bg-red-950/40 hover:bg-red-900/50 text-red-300 hover:text-amber-300 text-xs font-semibold px-2.5 py-2 rounded-lg border border-red-500/30 hover:border-red-500/60 flex items-center gap-1.5 transition-all shadow-sm"
              title="Convert a YouTube Video Transcript into a complete Book"
            >
              <Video className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Book from Video</span>
            </button>

            {/* New Project Button */}
            <button
              onClick={onOpenNewModal}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">New Book</span>
            </button>

            {/* Export Package Button */}
            <button
              onClick={onExportPackage}
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg shadow-md shadow-amber-500/10 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Package</span>
            </button>

            {/* Download Project Source Code ZIP */}
            <a
              href="/api/download-project-zip"
              download="empire-os-complete-project.zip"
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-sky-300 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
              title="Download entire codebase as a .ZIP file"
            >
              <FileArchive className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Project .ZIP</span>
            </a>
          </div>
        </div>

        {/* Secondary Sub-Header Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar text-xs">
          {[
            { id: 'pipeline', label: '1. Pipeline & Timeline', badge: `${activeProject?.currentStep || 1}/20` },
            { id: '3d-scene', label: '🪐 3D Three.js Studio', badge: 'PBR 60fps', isNew: true },
            { id: 'music-studio', label: '🎵 Lyria Music Studio', badge: 'Lyria Pro/Clip', isNew: true },
            { id: 'veo-studio', label: '🎥 AI Video & Image Studio', badge: '5 Free Engines', isNew: true },
            { id: 'gemini-chat', label: '💬 Gemini Multi-Turn Chat', badge: 'Argon/Flash', isNew: true },
            { id: 'connectors', label: '🔌 AI Connectors (No API)', badge: 'Claude/GPT', isNew: true },
            { id: 'council', label: '2. Grand Council', badge: '9 Experts' },
            { id: 'bookmachine', label: '🖋️ Patterson Book Machine', badge: 'Formula V1', isNew: true },
            { id: 'manuscript', label: '3. Book & Chapters', badge: `${activeProject?.manuscript?.chapters?.length || 0} Ch.` },
            { id: 'cartoons', label: '🎬 AI Cartoon Videos', badge: `${activeProject?.cartoonEpisodes?.length || 0} Toons`, isNew: true },
            { id: 'characters', label: '4. Character & Lore Lab', badge: `${activeProject?.characters?.length || 0} Chars` },
            { id: 'illustration', label: '5. Illustration Studio', badge: 'Art Guides' },
            { id: 'publishing', label: '6. KDP & Publishing', badge: 'ISBN/EPUB' },
            { id: 'marketing', label: '7. Marketing & Video', badge: 'Campaigns' },
            { id: 'merch', label: '8. Merch & Activities', badge: 'Printables' },
            { id: 'analytics', label: '9. Science Audit', badge: `${activeProject?.scorecard?.overallScore || 90}/100` },
            { id: 'export', label: '10. Package Hub', badge: '11 Assets' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : tab.isNew
                  ? 'text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                activeTab === tab.id
                  ? 'bg-amber-400/20 text-amber-300'
                  : tab.isNew
                  ? 'bg-amber-500/30 text-amber-200'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.badge}
              </span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

