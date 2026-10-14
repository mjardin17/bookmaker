import React, { useState } from 'react';
import { PublishingProject, CartoonEpisode, CartoonScene, CartoonStyle, CartoonDialogue, CartoonSoundEffect } from '../types/storyforge';
import { CartoonPlayer } from './CartoonPlayer';
import { CartoonStyleSelector, CARTOON_STYLES } from './CartoonStyleSelector';
import { 
  Film, Sparkles, Wand2, Plus, Play, Clapperboard, 
  Tv, Volume2, Music, Camera, Layers, Check, Download, 
  RefreshCw, MessageSquare, Edit3, Trash2, Sliders, 
  Share2, FileText, ArrowRight, Video, ChevronRight, Eye, Palette
} from 'lucide-react';
import { playCartoonSFX, speakCartoonDialogue } from '../utils/cartoonAudio';

interface CartoonStudioProps {
  project: PublishingProject;
  onUpdateProject: (updated: Partial<PublishingProject>) => void;
  initialChapterId?: string;
}

export const CartoonStudio: React.FC<CartoonStudioProps> = ({
  project,
  onUpdateProject,
  initialChapterId
}) => {
  // Cartoon episodes stored in project
  const episodes = project.cartoonEpisodes || [];
  const [activeEpisodeId, setActiveEpisodeId] = useState<string>(() => episodes[0]?.id || '');
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);

  // Generator Drawer / Modal State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showGenerator, setShowGenerator] = useState<boolean>(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    initialChapterId || project.manuscript?.chapters?.[0]?.id || ''
  );
  const [selectedStyle, setSelectedStyle] = useState<CartoonStyle>('2d-classic');
  const [selectedRatio, setSelectedRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Active Episode calculation
  const activeEpisode = episodes.find((e) => e.id === activeEpisodeId) || episodes[0];
  const activeScene: CartoonScene | undefined = activeEpisode?.scenes?.[activeSceneIndex] || activeEpisode?.scenes?.[0];

  // Helper to update current episode
  const updateCurrentEpisode = (updatedFields: Partial<CartoonEpisode>) => {
    if (!activeEpisode) return;
    const updatedEpisodes = episodes.map((ep) =>
      ep.id === activeEpisode.id ? { ...ep, ...updatedFields } : ep
    );
    onUpdateProject({ cartoonEpisodes: updatedEpisodes });
  };

  // Helper to update scene in current episode
  const updateActiveScene = (updatedFields: Partial<CartoonScene>) => {
    if (!activeEpisode || !activeScene) return;
    const updatedScenes = activeEpisode.scenes.map((sc, idx) =>
      idx === activeSceneIndex ? { ...sc, ...updatedFields } : sc
    );
    updateCurrentEpisode({ scenes: updatedScenes });
  };

  // Generate AI Cartoon Episode via API
  const handleGenerateEpisode = async () => {
    setIsGenerating(true);
    const targetChapter = project.manuscript.chapters.find((ch) => ch.id === selectedChapterId) || project.manuscript.chapters[0];

    try {
      const response = await fetch('/api/cartoon/generate-episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyTitle: project.name,
          chapterTitle: targetChapter?.title || 'Adventure Beat',
          chapterContent: targetChapter?.content || '',
          characters: project.characters,
          animationStyle: selectedStyle,
          aspectRatio: selectedRatio,
          customPrompt: customPrompt || 'Create a fast-paced, humorous, exciting animated cartoon episode with punchy dialogue and vivid visuals'
        })
      });

      const data = await response.json();
      if (data.success && data.episode) {
        const newEpisode: CartoonEpisode = {
          ...data.episode,
          id: `ep-${Date.now()}`,
          chapterId: targetChapter?.id,
          animationStyle: selectedStyle,
          aspectRatio: selectedRatio
        };

        const nextEpisodes = [newEpisode, ...episodes];
        onUpdateProject({ cartoonEpisodes: nextEpisodes });
        setActiveEpisodeId(newEpisode.id);
        setActiveSceneIndex(0);
        setShowGenerator(false);
      }
    } catch (err) {
      console.error('Failed to generate episode:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export Printable Storyboard Sheet
  const handleExportStoryboard = () => {
    if (!activeEpisode) return;

    const win = window.open('', '_blank');
    if (!win) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Storyboard Animatic - ${activeEpisode.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; }
          h1 { color: #f59e0b; margin-bottom: 4px; }
          .meta { color: #94a3b8; font-size: 14px; margin-bottom: 30px; font-family: monospace; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
          .panel { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; }
          .panel-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; color: #38bdf8; border-bottom: 1px solid #334155; padding-bottom: 8px; margin-bottom: 12px; }
          .desc { font-size: 13px; color: #cbd5e1; line-height: 1.5; margin-bottom: 12px; }
          .dialogue-box { background: #0f172a; border-left: 3px solid #f59e0b; padding: 8px 12px; font-size: 12px; margin-top: 8px; border-radius: 4px; }
          .sfx-pill { display: inline-block; background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); padding: 2px 8px; border-radius: 12px; font-size: 11px; font-family: monospace; margin-right: 6px; }
          @media print { body { background: white; color: black; } .panel { background: white; border: 1px solid #ccc; color: black; } .desc { color: #333; } .dialogue-box { background: #f5f5f5; color: black; } }
        </style>
      </head>
      <body>
        <h1>🎬 Animated Cartoon Storyboard: ${activeEpisode.title}</h1>
        <div class="meta">
          Story: ${project.name} | Style: ${activeEpisode.animationStyle.toUpperCase()} | Ratio: ${activeEpisode.aspectRatio} | Total Run Time: ${activeEpisode.totalDuration}s
        </div>
        <div class="grid">
          ${activeEpisode.scenes.map((s, idx) => `
            <div class="panel">
              <div class="panel-header">
                <span>SCENE ${idx + 1}: ${s.title.toUpperCase()}</span>
                <span>⏱ ${s.duration}s | 🎥 ${s.cameraMotion}</span>
              </div>
              <div class="desc"><strong>Visual Direction:</strong> ${s.visualDescription}</div>
              <div class="desc"><strong>Background:</strong> ${s.backgroundTheme} | <strong>Transition:</strong> ${s.transition}</div>
              <div>
                <strong>Sound FX:</strong> 
                ${s.soundEffects.map(sfx => `<span class="sfx-pill">🔊 ${sfx.sfxType} (${sfx.label})</span>`).join('')}
              </div>
              ${s.dialogue.map(d => `
                <div class="dialogue-box">
                  <strong style="color: #f59e0b;">${d.speaker} (${d.emotion}):</strong> "${d.text}"
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `;

    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Studio Command Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
                AI Video & Cartoon Animation Studio
              </span>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                {episodes.length} Episodes Generated
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              StoryForge Toon Labs
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Transform your book chapters into full animated AI cartoon videos with custom visual art styles (3D Pixar, Anime, Studio Ghibli, Sketch, Classic 2D, Claymation, Rubber Hose, Storybook Pop-Up), character lip-sync voices, synthesized cartoon sound effects, and direct video recording & export!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Episode Selector Dropdown */}
            {episodes.length > 0 && (
              <select
                value={activeEpisode?.id || ''}
                onChange={(e) => {
                  setActiveEpisodeId(e.target.value);
                  setActiveSceneIndex(0);
                }}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
              >
                {episodes.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    🎞️ {ep.title} ({ep.animationStyle})
                  </option>
                ))}
              </select>
            )}

            {/* Create New Cartoon Button */}
            <button
              onClick={() => setShowGenerator(!showGenerator)}
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{showGenerator ? 'Close Style Studio' : 'Animate New Episode'}</span>
            </button>

            {/* Export Storyboard PDF */}
            {activeEpisode && (
              <button
                onClick={handleExportStoryboard}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all"
                title="Export printable storyboard sheet"
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">Storyboard Sheet</span>
              </button>
            )}
          </div>
        </div>

        {/* Generator Drawer & Visual Style Selector Modal */}
        {showGenerator && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-6 bg-slate-950/70 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-2xl">
            {/* Header / Workflow Step Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-400" />
                  <span>AI Cartoon Episode Director & Visual Art Studio</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose your story beat, preview visual animation aesthetics (3D Pixar, Anime, Studio Ghibli, Sketch), and launch the generative animation pipeline.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                  Style: {CARTOON_STYLES.find(s => s.id === selectedStyle)?.name || selectedStyle}
                </span>
              </div>
            </div>

            {/* Controls Row: Chapter, Aspect Ratio & Custom Cues */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Chapter Selection */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-slate-300 flex items-center justify-between">
                  <span>1. Story Chapter to Animate</span>
                  <span className="text-amber-400 text-[10px]">
                    {project.manuscript?.chapters?.length || 0} Available
                  </span>
                </label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                >
                  {project.manuscript?.chapters?.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      Chapter {ch.chapterNumber}: {ch.title} ({ch.content.split(/\s+/).length} words)
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Video Aspect Ratio */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-slate-300 block">
                  2. Video Aspect Ratio
                </label>
                <div className="flex items-center gap-1.5">
                  {[
                    { id: '16:9', label: '16:9 Widescreen', badge: 'YouTube / TV' },
                    { id: '9:16', label: '9:16 Vertical', badge: 'Shorts/TikTok' },
                    { id: '1:1', label: '1:1 Square', badge: 'Instagram' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRatio(r.id as any)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono transition-all border text-center ${
                        selectedRatio === r.id
                          ? 'bg-indigo-600 border-indigo-400 text-white font-bold shadow-md shadow-indigo-600/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="block font-bold">{r.id}</span>
                      <span className="text-[9px] opacity-70 block">{r.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Director's Custom Cues */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-slate-300 block">
                  3. Director's Custom Cues (Optional)
                </label>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Highlight Leo's clockwork inventions, add slapstick pacing..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* VISUAL STYLE SELECTOR COMPONENT WITH PREVIEWS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Visual Art Style Selector & Interactive Previews</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Preview character rendering, color palettes, technique specs, and audio vibes before launching generation.
                  </p>
                </div>
                
                <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 hidden sm:inline">
                  Click any card to select & preview
                </span>
              </div>

              {/* Interactive Visual Selector */}
              <CartoonStyleSelector
                selectedStyle={selectedStyle}
                onSelectStyle={(st) => setSelectedStyle(st)}
              />
            </div>

            {/* Launch Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Ready to direct episode with Gemini AI
                </span>
                <span>•</span>
                <span className="font-mono text-slate-300">
                  Target: 4 Animated Scenes (~28-35s)
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowGenerator(false)}
                  className="text-xs text-slate-400 hover:text-slate-200 px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-850 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleGenerateEpisode}
                  disabled={isGenerating}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Directing {CARTOON_STYLES.find(s => s.id === selectedStyle)?.name || selectedStyle} Episode...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 fill-slate-950 text-slate-950" />
                      <span>Launch AI Video Generation in {CARTOON_STYLES.find(s => s.id === selectedStyle)?.name || selectedStyle}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Studio Work Area */}
      {activeEpisode ? (
        <div className="space-y-6">
          
          {/* Real-time Animated Cartoon Video Player */}
          <CartoonPlayer 
            episode={activeEpisode}
            activeSceneIndex={activeSceneIndex}
            onSceneChange={(idx) => setActiveSceneIndex(idx)}
          />

          {/* Multi-Track Animation Timeline & Scene Sequencer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Multi-Track Cartoon Timeline
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  ({activeEpisode.scenes.length} Scenes • {activeEpisode.totalDuration}s Total Run Time)
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Video Scenes
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  Dialogue
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Sound FX
                </span>
              </div>
            </div>

            {/* Visual Scene Cards Track */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {activeEpisode.scenes.map((scene, idx) => {
                const isSelected = activeSceneIndex === idx;
                return (
                  <div
                    key={scene.id || idx}
                    onClick={() => setActiveSceneIndex(idx)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-bold">
                        Scene {idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        ⏱ {scene.duration}s
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100 line-clamp-1 mb-1">
                      {scene.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                      {scene.visualDescription}
                    </p>

                    <div className="flex flex-wrap gap-1 text-[9px] font-mono text-slate-400">
                      <span className="bg-slate-900 px-1.5 py-0.5 rounded text-sky-400">
                        🎥 {scene.cameraMotion}
                      </span>
                      <span className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-400">
                        ✨ {scene.transition}
                      </span>
                      <span className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400">
                        🔊 {scene.soundEffects?.length || 0} SFX
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scene Director Board & Live Editor */}
          {activeScene && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Scene Camera, Background & Motion Parameters */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400" />
                    Camera & Staging
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Scene {activeSceneIndex + 1}
                  </span>
                </div>

                {/* Camera Motion Selector */}
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                    Camera Movement
                  </label>
                  <select
                    value={activeScene.cameraMotion}
                    onChange={(e) => updateActiveScene({ cameraMotion: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="zoom-in">🔍 Dramatic Zoom-In</option>
                    <option value="zoom-out">🔭 Cinematic Zoom-Out</option>
                    <option value="pan-right">➡️ Pan Right Across Scene</option>
                    <option value="pan-left">⬅️ Pan Left Across Scene</option>
                    <option value="dramatic-shake">⚡ Screen Shake (Impact/Action)</option>
                    <option value="tracking-shot">🎯 Tracking Follow Shot</option>
                    <option value="static">⏸️ Static Camera</option>
                  </select>
                </div>

                {/* Transition Selector */}
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                    Scene Transition
                  </label>
                  <select
                    value={activeScene.transition}
                    onChange={(e) => updateActiveScene({ transition: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="iris-wipe">⭕ Classic Looney Tunes Iris Wipe</option>
                    <option value="star-wipe">⭐ Golden Star Wipe</option>
                    <option value="bounce-pop">💥 Bounce-Pop Elastic Cut</option>
                    <option value="cross-dissolve">🌫️ Smooth Cross Dissolve</option>
                    <option value="slide-left">⏩ Slide Left</option>
                  </select>
                </div>

                {/* Background Theme */}
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                    Background Setting
                  </label>
                  <select
                    value={activeScene.backgroundTheme}
                    onChange={(e) => updateActiveScene({ backgroundTheme: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="workshop_vault">🕰️ Clockmaker Workshop Vault</option>
                    <option value="backward_river">🌊 Upward-Flowing Backward River</option>
                    <option value="clockwork_citadel">🏰 Colossal Clockwork Citadel</option>
                    <option value="sky_docks">☁️ Floating Sky Docks & Galleons</option>
                    <option value="steam_laboratory">⚗️ Steam & Chemical Alchemist Lab</option>
                    <option value="enchanted_forest">🌲 Twisted Lantern Forest</option>
                  </select>
                </div>

                {/* Ambient Particles */}
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                    Ambient Particles
                  </label>
                  <select
                    value={activeScene.ambientParticles}
                    onChange={(e) => updateActiveScene({ ambientParticles: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="floating_gears">⚙️ Floating Brass Gears</option>
                    <option value="sparkles">✨ Golden Magic Sparkles</option>
                    <option value="bubbles">🫧 Rising River Bubbles</option>
                    <option value="stars">⭐ Shimmering Night Stars</option>
                    <option value="none">🚫 No Particles</option>
                  </select>
                </div>

                {/* Duration Slider */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>Scene Duration</span>
                    <span className="text-amber-400 font-bold">{activeScene.duration} seconds</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={12}
                    step={1}
                    value={activeScene.duration}
                    onChange={(e) => updateActiveScene({ duration: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>

              {/* Dialogue & Lip-Sync Voice Editor */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                    Dialogue & Character Lip-Sync
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activeScene.dialogue?.length || 0} Spoken Lines
                  </span>
                </div>

                <div className="space-y-3">
                  {activeScene.dialogue?.map((d, dIdx) => (
                    <div key={d.id || dIdx} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300">
                          {d.speaker}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                          Emotion: {d.emotion}
                        </span>
                      </div>

                      <textarea
                        value={d.text}
                        onChange={(e) => {
                          const updated = activeScene.dialogue.map((item, i) =>
                            i === dIdx ? { ...item, text: e.target.value } : item
                          );
                          updateActiveScene({ dialogue: updated });
                        }}
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                      />

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                          <span>Pitch: {d.voicePitch}x</span>
                          <span>•</span>
                          <span>Speed: {d.voiceRate}x</span>
                        </div>

                        {/* Test Cartoon Voice Button */}
                        <button
                          type="button"
                          onClick={() => speakCartoonDialogue(d.text, d.voicePitch, d.voiceRate)}
                          className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                          title="Preview character voice line"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Test Voice</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cartoon Sound Effects & Audio Synthesizer */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    Cartoon Sound Effects (SFX)
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Web Audio Synth
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeScene.soundEffects?.map((sfx, sIdx) => (
                    <div key={sfx.id || sIdx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">
                          {sfx.label}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400">
                          🔊 Type: {sfx.sfxType} • @ {sfx.timestampSec}s
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => playCartoonSFX(sfx.sfxType)}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-95"
                        title="Test Sound Effect"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Instant Cartoon Soundboard Test Palette */}
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2">
                    Cartoon Soundboard Quick Test
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                    {[
                      { id: 'boing', label: '🪀 Boing Spring' },
                      { id: 'clockwork-whir', label: '⚙️ Gear Whir' },
                      { id: 'magic-sparkle', label: '✨ Sparkle Chime' },
                      { id: 'whoosh', label: '💨 Wind Whoosh' },
                      { id: 'pop', label: '🍾 Bubble Pop' },
                      { id: 'fanfare', label: '🎺 Toon Fanfare' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => playCartoonSFX(s.id as any)}
                        className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg p-1.5 text-left transition-all active:scale-95"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            No Cartoon Episodes Created Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click "Animate New Episode" above to generate a full animated cartoon video based on your book chapters!
          </p>
          <button
            onClick={() => setShowGenerator(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create First Cartoon Episode</span>
          </button>
        </div>
      )}

    </div>
  );
};
