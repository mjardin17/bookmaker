import React, { useState, useRef } from 'react';
import { PublishingProject } from '../types/storyforge';
import { 
  Palette, Image as ImageIcon, Camera, Sparkles, Copy, 
  Check, Layers, Eye, RefreshCw, Upload, Download, 
  Search, Sliders, Wand2, ArrowRight, CheckCircle2, SplitSquareVertical
} from 'lucide-react';

interface IllustrationStudioProps {
  project: PublishingProject;
  onGeneratePrompts: () => void;
  onSaveToBookIllustrations?: (imageUrl: string, label: string) => void;
}

export const IllustrationStudio: React.FC<IllustrationStudioProps> = ({
  project,
  onGeneratePrompts,
  onSaveToBookIllustrations
}) => {
  // Studio Mode: Create, Edit, or Multi-Engine Prompts
  const [activeTab, setActiveTab] = useState<'create' | 'edit' | 'prompts'>('create');

  // Generation parameters for gemini-nano-banana-2.1
  const [prompt, setPrompt] = useState<string>(
    'Little Zeus summoning his first golden thunderbolt atop Mount Olympus, heroic stance, cinematic cel-shaded animation, warm golden rays breaking through storm clouds'
  );
  const [editPrompt, setEditPrompt] = useState<string>(
    'Add an electrifying golden lightning crown on Zeus\'s head and make the temple background glow with celestial blue aura'
  );
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [useSearch, setUseSearch] = useState<boolean>(true);
  const [selectedSourceImage, setSelectedSourceImage] = useState<string | null>(
    '/output_books/little_zeus_gets_his_thunderbolt/illustrations/ch001_illus00.png'
  );

  // Results & History
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationMeta, setGenerationMeta] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; url: string; prompt: string; mode: string; time: string }>>([]);

  // Multi-engine prompt copy state
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [activeEngine, setActiveEngine] = useState<'midjourney' | 'dalle' | 'flux' | 'sd3' | 'recraft'>('midjourney');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const guide = project.illustrationGuide;

  // Preset prompts tailored to StoryForge universe
  const NANO_PROMPTS = [
    {
      title: '⚡ Little Zeus & The Thunderbolt',
      prompt: 'Little Zeus holding a crackling golden spark atop a marble pedestal, vibrant storybook illustration, soft clouds',
      ratio: '1:1',
      size: '1K' as const
    },
    {
      title: '🦉 Athena\'s Mechanical Owl',
      prompt: 'Steampunk clockwork automaton owl with polished brass wings and glowing sapphire eyes perched on ancient laurel branch',
      ratio: '4:3',
      size: '2K' as const
    },
    {
      title: '🏛️ Mount Olympus Wide Panorama',
      prompt: 'Cinematic wide landscape of Mount Olympus palace with celestial pillars extending above golden sunset clouds',
      ratio: '16:9',
      size: '2K' as const
    },
    {
      title: '📖 Book Cover Master Portrait',
      prompt: 'Epic vertical fantasy book cover illustration of Little Zeus standing before storm clouds, 4k ultra-detailed rim lighting',
      ratio: '9:16',
      size: '4K' as const
    }
  ];

  // Quick edit suggestions
  const EDIT_SUGGESTIONS = [
    'Add a glowing lightning crown on his head',
    'Change the background sky to dramatic midnight purple with electric sparks',
    'Add magical floating Greek runes circling around the characters',
    'Enhance the lighting with dramatic golden hour volumetric rays',
    'Convert style into vintage golden-age storybook watercolor'
  ];

  // Project illustrations available for editing
  const PROJECT_IMAGES = [
    { name: 'Chapter 1 Scene', path: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/ch001_illus00.png' },
    { name: 'Little Zeus Sheet', path: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/little_zeus_sheet.png' },
    { name: 'Athena Sheet', path: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/athena_sheet.png' },
    { name: 'Stormy the Cloud', path: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/stormy_the_storm_cloud_sheet.png' },
    { name: 'Book Front Cover', path: '/output_books/little_zeus_gets_his_thunderbolt/covers/cover_front.png' }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedSourceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    const activePrompt = activeTab === 'edit' ? editPrompt : prompt;
    if (!activePrompt.trim()) return;

    if (activeTab === 'edit' && !selectedSourceImage) {
      setErrorMsg('Please select or upload an image to edit.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/generate-image-nano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activePrompt,
          mode: activeTab === 'edit' ? 'edit' : 'create',
          imageBase64: activeTab === 'edit' ? selectedSourceImage : undefined,
          aspectRatio,
          imageSize,
          useSearch
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.imageUrl) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImage(data.imageUrl);
      setGenerationMeta(data);

      setHistory((prev) => [
        {
          id: `nano-${Date.now()}`,
          url: data.imageUrl,
          prompt: activePrompt,
          mode: activeTab,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);
    } catch (err: any) {
      console.error('Image generation error:', err);
      setErrorMsg(err.message || 'Image creation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Palette className="w-3 h-3" />
                gemini-nano-banana-2.1
              </span>
              <span className="text-xs text-slate-400 font-mono">
                High-Resolution Image Synthesis & Visual Editing
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Create & Edit Images Studio
              <span className="text-xs font-normal text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                Supports 1K, 2K & 4K Resolution
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Generate new book illustrations from natural text or perform multimodal edits on existing character art and scenes using Google's <strong>gemini-nano-banana-2.1</strong> model.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGeneratePrompts}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Prompt Guide</span>
            </button>
          </div>
        </div>

        {/* Color Palette Preview */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">Book Art Palette:</span>
          <div className="flex items-center gap-1.5">
            {guide.colorPalette?.map((hex, i) => (
              <div 
                key={i} 
                className="w-6 h-6 rounded-lg border border-slate-700 shadow-sm transition-transform hover:scale-110"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-medium">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'create'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Create New Image (Text-to-Image)</span>
        </button>

        <button
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'edit'
              ? 'bg-indigo-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Edit Image (Image + Text Editing)</span>
        </button>

        <button
          onClick={() => setActiveTab('prompts')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'prompts'
              ? 'bg-slate-800 text-slate-200 font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Multi-Engine Prompts Library</span>
        </button>
      </div>

      {/* VIEW 1 & 2: CREATE OR EDIT IMAGES WITH GEMINI NANO BANANA 2.1 */}
      {(activeTab === 'create' || activeTab === 'edit') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Generator Controls (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* If Edit Mode: Image Selector */}
            {activeTab === 'edit' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Select Source Image to Edit</span>
                  </label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Custom</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleCustomUpload}
                    className="hidden"
                  />
                </div>

                {/* Project samples */}
                <div className="grid grid-cols-5 gap-2">
                  {PROJECT_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSourceImage(img.path)}
                      className={`p-1.5 rounded-xl border text-center transition-all ${
                        selectedSourceImage === img.path
                          ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <img
                        src={img.path}
                        alt={img.name}
                        className="w-full h-12 object-cover rounded-md mb-1"
                        onError={(e) => { (e.target as any).style.display = 'none'; }}
                      />
                      <span className="text-[9px] block truncate font-medium">{img.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Presets & Prompts */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              {activeTab === 'create' ? (
                <>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      StoryForge Prompt Presets
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {NANO_PROMPTS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPrompt(p.prompt);
                          setAspectRatio(p.ratio);
                          setImageSize(p.size);
                        }}
                        className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-800/70 text-left text-xs text-slate-300 transition-all hover:border-amber-500/40"
                      >
                        <span className="font-bold text-slate-200 block truncate">{p.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{p.ratio} • {p.size}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Text Prompt for gemini-nano-banana-2.1
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                      placeholder="Describe character appearance, action, scene environment, lighting, artistic style..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Edit Instructions (What to change/add)
                    </label>
                    <textarea
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
                      placeholder="e.g. Add glowing lightning around the character, replace background with sunset..."
                    />
                  </div>

                  {/* Quick Edit Suggestions */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Quick Edit Directives:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {EDIT_SUGGESTIONS.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => setEditPrompt(s)}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 rounded-lg transition-colors"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Advanced Nano Banana 2.1 Configurations */}
              <div className="pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Resolution / Image Size (1K, 2K, 4K) */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Image Size
                  </label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                  >
                    <option value="1K">1K (Standard)</option>
                    <option value="2K">2K (High-Res Master)</option>
                    <option value="4K">4K (Ultra 3840px)</option>
                  </select>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  >
                    <option value="1:1">1:1 Square</option>
                    <option value="16:9">16:9 Landscape</option>
                    <option value="9:16">9:16 Portrait / Cover</option>
                    <option value="4:3">4:3 Classic</option>
                    <option value="3:4">3:4 Book Trim</option>
                    <option value="4:1">4:1 Panoramic Banner</option>
                    <option value="1:4">1:4 Bookmark Strip</option>
                  </select>
                </div>

                {/* Search Grounding Toggle */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Search Grounding
                  </label>
                  <button
                    onClick={() => setUseSearch(!useSearch)}
                    className={`w-full py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      useSearch
                        ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <Search className="w-3 h-3" />
                    <span>{useSearch ? 'Image Search On' : 'Search Off'}</span>
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full font-black text-sm py-3.5 rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
                  activeTab === 'edit'
                    ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-amber-500 hover:from-indigo-400 hover:to-amber-400 text-white'
                    : 'bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing with gemini-nano-banana-2.1 ({imageSize})...</span>
                  </>
                ) : (
                  <>
                    {activeTab === 'edit' ? <Wand2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    <span>
                      {activeTab === 'edit' ? 'Apply Nano Banana Edits' : 'Generate with gemini-nano-banana-2.1'}
                    </span>
                  </>
                )}
              </button>

              {errorMsg && (
                <p className="text-xs text-center text-rose-400 font-medium">{errorMsg}</p>
              )}
            </div>
          </div>

          {/* Right Column: Output Showcase & Comparison (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>Output Preview</span>
                </span>
                {generationMeta && (
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                    {generationMeta.imageSize} • {generationMeta.aspectRatio}
                  </span>
                )}
              </div>

              {/* Before/After View if in Edit Mode */}
              {activeTab === 'edit' && selectedSourceImage && (
                <div className="grid grid-cols-2 gap-3 pb-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Original Source</span>
                    <div className="aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                      <img src={selectedSourceImage} alt="Original" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase">Edited Result</span>
                    <div className="aspect-square rounded-xl overflow-hidden border border-indigo-500/50 bg-slate-950 flex items-center justify-center">
                      {generatedImage ? (
                        <img src={generatedImage} alt="Edited" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4 text-slate-500 text-xs">
                          Click "Apply Nano Banana Edits" to view transformation
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Single Image View for Create Mode */}
              {activeTab === 'create' && (
                <div className="w-full max-h-[460px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
                  {generatedImage ? (
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="max-h-[440px] w-auto object-contain rounded-lg shadow-xl"
                    />
                  ) : (
                    <div className="py-24 text-center text-slate-500 space-y-2">
                      <ImageIcon className="w-12 h-12 mx-auto text-slate-700" />
                      <p className="text-xs">No image generated yet. Configure prompt and click Generate.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Output Actions: Download & Link to Book */}
              {generatedImage && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400 font-mono">
                    gemini-nano-banana-2.1
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={generatedImage}
                      download="gemini_nano_banana_image.png"
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                      <span>Download PNG</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Session History Carousel */}
            {history.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Session Generation History ({history.length})
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setGeneratedImage(item.url)}
                      className="cursor-pointer rounded-xl overflow-hidden border border-slate-800 hover:border-amber-500/60 transition-all aspect-square"
                    >
                      <img src={item.url} alt="History Item" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: MULTI-ENGINE PROMPTS LIBRARY (Original Engine Prompts) */}
      {activeTab === 'prompts' && (
        <div className="space-y-6">
          {/* Engine Switcher Bar */}
          <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
            {[
              { id: 'midjourney', label: 'Midjourney v6.1' },
              { id: 'dalle', label: 'DALL-E 3' },
              { id: 'flux', label: 'Flux Pro' },
              { id: 'sd3', label: 'Stable Diffusion 3' },
              { id: 'recraft', label: 'Recraft v3 Vector' }
            ].map((eng) => (
              <button
                key={eng.id}
                onClick={() => setActiveEngine(eng.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeEngine === eng.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {eng.label}
              </button>
            ))}
          </div>

          {/* Cover Art Master Brief Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Master Cover Art Prompt ({activeEngine.toUpperCase()})
                </h3>
              </div>
              <button
                onClick={() => handleCopy(guide.coverBrief?.primaryPrompt || '', 'cover')}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                {copiedIndex === 'cover' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedIndex === 'cover' ? 'Copied' : 'Copy Prompt'}</span>
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-xs text-amber-200/90 leading-relaxed">
              {guide.coverBrief?.primaryPrompt || 'Dramatic cinematic front cover portrait with rich lighting and atmosphere.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
