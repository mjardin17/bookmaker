import React, { useState } from 'react';
import { PublishingProject, Chapter } from '../types/storyforge';
import { 
  BookOpen, Plus, Sparkles, FileText, CheckCircle, 
  BarChart2, RefreshCw, Eye, Edit3, Image as ImageIcon,
  Film, Music, Video, ExternalLink, Box, Volume2, Play
} from 'lucide-react';

interface ManuscriptEditorProps {
  project: PublishingProject;
  onUpdateChapter: (chapterId: string, updated: Partial<Chapter>) => void;
  onAddChapter: () => void;
  onGenerateChapterAI: (chapterId: string) => Promise<void>;
  isLoading: boolean;
  onAnimateToCartoon?: (chapterId: string) => void;
  onOpenBookMachine?: () => void;
  onNavigateToVeo?: () => void;
  onNavigateToLyria?: () => void;
  onNavigateTo3D?: () => void;
}

export const ManuscriptEditor: React.FC<ManuscriptEditorProps> = ({
  project,
  onUpdateChapter,
  onAddChapter,
  onGenerateChapterAI,
  isLoading,
  onAnimateToCartoon,
  onOpenBookMachine,
  onNavigateToVeo,
  onNavigateToLyria,
  onNavigateTo3D
}) => {
  const chapters = project.manuscript.chapters || [];
  const [activeChapterId, setActiveChapterId] = useState<string>(chapters[0]?.id || '');
  const activeChapter = chapters.find((c) => c.id === activeChapterId) || chapters[0];

  if (!activeChapter) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">No Chapters Created Yet</h3>
        <button
          onClick={onAddChapter}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl"
        >
          Add Chapter 1
        </button>
      </div>
    );
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    onUpdateChapter(activeChapter.id, {
      content: text,
      wordCount: words
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls: Chapter Selector & Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Chapter Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          {chapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChapterId(ch.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                ch.id === activeChapter.id
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Ch. {ch.chapterNumber}: {ch.title}</span>
              <span className="text-[10px] font-mono text-slate-500">
                ({ch.wordCount || 0}w)
              </span>
            </button>
          ))}

          <button
            onClick={onAddChapter}
            className="p-2 bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-xl transition-all"
            title="Add New Chapter"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Chapter Action Bar */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenBookMachine && (
            <button
              onClick={onOpenBookMachine}
              className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              title="Open the James Patterson Formula & Author Mimicry Machine"
            >
              <span>⚡</span>
              <span>Patterson Formula Machine</span>
            </button>
          )}

          {onAnimateToCartoon && (
            <button
              onClick={() => onAnimateToCartoon(activeChapter.id)}
              className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              title="Create an animated AI cartoon video from this chapter"
            >
              <span>🎬</span>
              <span>Animate to Cartoon</span>
            </button>
          )}

          {onNavigateToVeo && (
            <button
              onClick={onNavigateToVeo}
              className="bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/40 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              title="Animate this chapter's illustration with Veo video generator"
            >
              <span>🎥</span>
              <span>Animate with Veo</span>
            </button>
          )}

          {onNavigateToLyria && (
            <button
              onClick={onNavigateToLyria}
              className="bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              title="Compose an orchestral soundtrack for this chapter with Lyria"
            >
              <span>🎵</span>
              <span>Lyria Soundtrack</span>
            </button>
          )}

          {onNavigateTo3D && (
            <button
              onClick={onNavigateTo3D}
              className="bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              title="Inspect 3D procedural artifacts in Three.js Studio"
            >
              <span>🪐</span>
              <span>3D Studio</span>
            </button>
          )}

          <button
            onClick={() => {
              const transcript = prompt("Paste your video transcript or episode script below to generate a new Patterson-compliant chapter:");
              if (transcript && transcript.trim()) {
                fetch('/api/bridge/video-to-book', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    transcript,
                    title: project.name,
                    readingLevel: 'MG',
                    genre: project.genre
                  })
                })
                .then(r => r.json())
                .then(data => {
                  if (data.success && data.book?.chapters?.[0]) {
                    const first = data.book.chapters[0];
                    onAddChapter({
                      title: first.title,
                      synopsis: first.synopsis,
                      content: first.content,
                      wordCount: first.wordCount,
                      status: 'Polished',
                      cliffhangerHook: first.cliffhangerHook
                    });
                  }
                })
                .catch(e => console.error(e));
              }
            }}
            className="bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            title="Convert a video transcript directly into a new book chapter"
          >
            <span>📹</span>
            <span>Import from Video</span>
          </button>

          <button
            onClick={() => onGenerateChapterAI(activeChapter.id)}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            AI Polish / Generate Chapter
          </button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Editor Surface (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          
          {/* Chapter Metadata Headers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-800">
            <div>
              <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1">Chapter Title</label>
              <input
                type="text"
                value={activeChapter.title}
                onChange={(e) => onUpdateChapter(activeChapter.id, { title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-slate-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1">Status</label>
              <select
                value={activeChapter.status}
                onChange={(e) => onUpdateChapter(activeChapter.id, { status: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-amber-400 focus:outline-none"
              >
                <option value="Draft">Draft</option>
                <option value="Council Review">Council Review</option>
                <option value="Polished">Polished</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1">Chapter Synopsis</label>
            <input
              type="text"
              value={activeChapter.synopsis || ''}
              onChange={(e) => onUpdateChapter(activeChapter.id, { synopsis: e.target.value })}
              placeholder="Brief summary of chapter beats..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            />
          </div>

          {/* Manuscript Text Area */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span className="flex items-center gap-1">
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                Chapter Manuscript Prose
              </span>
              <span>{activeChapter.wordCount || 0} Words | Readability Score: {activeChapter.readabilityScore || 85}/100</span>
            </div>

            <textarea
              rows={16}
              value={activeChapter.content || ''}
              onChange={handleTextChange}
              placeholder="Write or generate your chapter manuscript prose here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-amber-500/50 font-serif"
            />
          </div>
        </div>

        {/* Right Sidebar: Media, Video, Soundtrack & Illustration Brief */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          
          {/* 1. Attached Veo Motion Scene */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-sky-400" />
                <span>Veo 3.1 Motion Scene</span>
              </h3>
              {onNavigateToVeo && (
                <button
                  onClick={onNavigateToVeo}
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                >
                  <span>{activeChapter.attachedVideoUrl ? 'Re-animate' : 'Open Veo'}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {activeChapter.attachedVideoUrl ? (
              <div className="rounded-xl overflow-hidden border border-sky-500/30 bg-slate-950 relative group">
                <video
                  src={activeChapter.attachedVideoUrl}
                  controls
                  loop
                  autoPlay
                  muted
                  playsInline
                  className="w-full aspect-video object-cover"
                />
                <span className="absolute top-2 right-2 bg-sky-950/80 border border-sky-500/40 text-sky-300 text-[9px] font-mono px-2 py-0.5 rounded-full">
                  Veo 3.1 Fast
                </span>
              </div>
            ) : (
              <div className="bg-slate-950 border border-dashed border-slate-800 rounded-xl p-3 text-center space-y-2">
                <p className="text-[11px] text-slate-400">
                  No cinematic motion video attached to Chapter {activeChapter.chapterNumber} yet.
                </p>
                {onNavigateToVeo && (
                  <button
                    onClick={onNavigateToVeo}
                    className="bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 font-bold text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all"
                  >
                    <Film className="w-3 h-3" />
                    <span>Generate Video with Veo 3.1</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2. Attached Lyria Orchestral Soundtrack */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-amber-400" />
                <span>Lyria Soundtrack Theme</span>
              </h3>
              {onNavigateToLyria && (
                <button
                  onClick={onNavigateToLyria}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <span>{activeChapter.attachedAudioUrl ? 'Re-compose' : 'Open Lyria'}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {activeChapter.attachedAudioUrl ? (
              <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-300 truncate">
                    {activeChapter.attachedAudioTitle || 'Chapter Orchestral Theme'}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                    Lyria Audio
                  </span>
                </div>
                <audio
                  src={activeChapter.attachedAudioUrl}
                  controls
                  className="w-full h-8"
                />
              </div>
            ) : (
              <div className="bg-slate-950 border border-dashed border-slate-800 rounded-xl p-3 text-center space-y-2">
                <p className="text-[11px] text-slate-400">
                  No custom soundtrack assigned to this chapter yet.
                </p>
                {onNavigateToLyria && (
                  <button
                    onClick={onNavigateToLyria}
                    className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Compose with Lyria Engine</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 3. 3D Procedural Scene Shortcut */}
          {onNavigateTo3D && (
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={onNavigateTo3D}
                className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl p-2.5 text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">Inspect 3D Artifacts</div>
                    <div className="text-[10px] text-slate-400">Three.js PBR Studio with 60fps render</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300" />
              </button>
            </div>
          )}

          {/* 4. Illustration Brief & Prompts */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Chapter Illustration Brief</span>
            </h3>

            <div>
              <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1">Scene Visual Description</label>
              <textarea
                rows={3}
                value={activeChapter.illustrationBrief?.sceneDescription || ''}
                onChange={(e) => onUpdateChapter(activeChapter.id, {
                  illustrationBrief: {
                    ...activeChapter.illustrationBrief,
                    sceneDescription: e.target.value,
                    visualFocus: activeChapter.illustrationBrief?.visualFocus || '',
                    midjourneyPrompt: activeChapter.illustrationBrief?.midjourneyPrompt || '',
                    dallePrompt: activeChapter.illustrationBrief?.dallePrompt || ''
                  }
                })}
                placeholder="Key action or scene focus for artist..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1">Midjourney v6.1 Prompt</label>
              <textarea
                rows={3}
                value={activeChapter.illustrationBrief?.midjourneyPrompt || ''}
                onChange={(e) => onUpdateChapter(activeChapter.id, {
                  illustrationBrief: {
                    ...activeChapter.illustrationBrief,
                    sceneDescription: activeChapter.illustrationBrief?.sceneDescription || '',
                    visualFocus: activeChapter.illustrationBrief?.visualFocus || '',
                    midjourneyPrompt: e.target.value,
                    dallePrompt: activeChapter.illustrationBrief?.dallePrompt || ''
                  }
                })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-300/90 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1">DALL-E 3 / Flux Prompt</label>
              <textarea
                rows={3}
                value={activeChapter.illustrationBrief?.dallePrompt || ''}
                onChange={(e) => onUpdateChapter(activeChapter.id, {
                  illustrationBrief: {
                    ...activeChapter.illustrationBrief,
                    sceneDescription: activeChapter.illustrationBrief?.sceneDescription || '',
                    visualFocus: activeChapter.illustrationBrief?.visualFocus || '',
                    midjourneyPrompt: activeChapter.illustrationBrief?.midjourneyPrompt || '',
                    dallePrompt: e.target.value
                  }
                })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-indigo-300/90 font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
