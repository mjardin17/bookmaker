import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PublishingProject } from '../types/storyforge';
import { 
  BossListerProduct, 
  StagingPreset, 
  CommercialAspect, 
  CommercialTemplate 
} from '../types/bosslister';
import { STAGING_PRESETS, generateBuyableProductImage } from '../utils/buyablePhotoGenerator';
import { removeImageBackground } from '../utils/backgroundRemoval';
import { 
  playCommercialSFX, 
  startCommercialBGM, 
  speakCommercialVoiceover, 
  getCommercialAudioContext 
} from '../utils/commercialAudio';
import { 
  ShoppingBag, Video, Image as ImageIcon, Sparkles, Scissors, 
  Play, Pause, RotateCcw, Download, Copy, Check, Sliders, 
  Star, Flame, Tag, CheckCircle2, ShieldCheck, Film, 
  Upload, Eye, Plus, Trash2, ExternalLink, RefreshCw, 
  Share2, Volume2, VolumeX, Maximize2, Zap, ArrowRight,
  Palette, Smartphone, Monitor, Layers, FileSpreadsheet
} from 'lucide-react';

interface BossListerCommercialStudioProps {
  project: PublishingProject;
  onNavigateToCartoons?: () => void;
  onNavigateToVeo?: () => void;
}

export const BossListerCommercialStudio: React.FC<BossListerCommercialStudioProps> = ({
  project,
  onNavigateToCartoons,
  onNavigateToVeo
}) => {
  // Top-level Mode: 'commercial-video' | 'photo-magic' | 'ad-copy'
  const [activeStudioTab, setActiveStudioTab] = useState<'commercial-video' | 'photo-magic' | 'ad-copy'>('commercial-video');

  // Product Catalog
  const [products, setProducts] = useState<BossListerProduct[]>(() => {
    const bookTitle = project.name || 'Little Zeus: First Thunderbolt';
    const bookCover = project.illustrationGuide?.coverBrief?.coverImageUrl || 
      '/output_books/little_zeus_gets_his_thunderbolt/covers/cover_front.png';
    const price = project.publishingMetadata?.priceUSD || 19.99;

    return [
      {
        id: 'prod-book-1',
        title: `${bookTitle} (Deluxe Hardcover Edition)`,
        sku: 'BL-BOOK-001',
        category: 'Book',
        price: price,
        originalPrice: Math.round(price * 1.5 * 100) / 100,
        currency: '$',
        rating: 4.9,
        reviewCount: 2150,
        features: [
          'Gold Foil Embossed Hardcover',
          '80 Patterson Formula Micro-Chapters',
          '300 DPI Full-Color Character Art',
          'Acid-Free Archival Paper'
        ],
        badges: ['🔥 #1 AMAZON BESTSELLER', '33% OFF FLASH SALE', 'LIMITED HARDCOVER'],
        targetMarketplace: 'TikTok Shop',
        rawImageUrl: bookCover,
        cutoutImageUrl: bookCover,
        stagingPresetId: 'luxury-marble',
        description: `Bestselling epic adventure book for young readers with high-stakes pacing and vivid characters.`
      },
      {
        id: 'prod-tshirt-1',
        title: `${project.merchPack?.tShirtPrompts?.[0]?.title || 'Olympus God Vintage Tee'}`,
        sku: 'BL-TSHIRT-002',
        category: 'Apparel',
        price: 28.50,
        originalPrice: 38.00,
        currency: '$',
        rating: 4.8,
        reviewCount: 840,
        features: [
          '100% Combed Ringspun Cotton',
          'Ultra-Soft Vintage Garment Dye',
          'Pre-Shrunk Direct-to-Garment Print',
          'Unisex Relaxed Streetwear Fit'
        ],
        badges: ['⚡ TIKTOK VIRAL #1', 'FREE 2-DAY SHIPPING'],
        targetMarketplace: 'Shopify',
        rawImageUrl: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/little_zeus_sheet.png',
        stagingPresetId: 'scandinavian-wood',
        description: `Heavyweight vintage graphic apparel inspired by the bestselling franchise lore.`
      },
      {
        id: 'prod-mug-1',
        title: `${project.merchPack?.mugPrompts?.[0]?.title || 'Thunderbolt Heat-Activated Mug'}`,
        sku: 'BL-MUG-003',
        category: 'Drinkware',
        price: 18.99,
        originalPrice: 26.99,
        currency: '$',
        rating: 5.0,
        reviewCount: 620,
        features: [
          'Heat-Sensitive Color Shift Magic',
          '15 oz Glossy Ceramic Build',
          'Dishwasher & Microwave Safe',
          'Ergonomic Comfort Grip Handle'
        ],
        badges: ['✨ COLOR-SHIFTING MAGIC', 'LIMITED EDITION'],
        targetMarketplace: 'Amazon',
        rawImageUrl: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/stormy_the_storm_cloud_sheet.png',
        stagingPresetId: 'pure-white-amazon',
        description: `Pours hot liquid to reveal glowing lightning runes across the ceramic surface.`
      }
    ];
  });

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0].id);
  const activeProduct = products.find(p => p.id === selectedProductId) || products[0];

  // ----------------------------------------------------
  // PHOTO MAGIC & BACKGROUND REMOVAL STATE
  // ----------------------------------------------------
  const [photoSourceUrl, setPhotoSourceUrl] = useState<string>(activeProduct.rawImageUrl);
  const [cutoutResultUrl, setCutoutResultUrl] = useState<string | null>(activeProduct.cutoutImageUrl || null);
  const [stagedResultUrl, setStagedResultUrl] = useState<string | null>(activeProduct.enhancedImageUrl || null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [isGeneratingStage, setIsGeneratingStage] = useState(false);
  const [tolerance, setTolerance] = useState(32);
  const [featherRadius, setFeatherRadius] = useState(2);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('luxury-marble');
  const [customAiPrompt, setCustomAiPrompt] = useState<string>('On a luxury velvet jewelry display pedestal in a high-end Fifth Avenue boutique with soft golden dust particles');
  const [isGeneratingAiBackdrop, setIsGeneratingAiBackdrop] = useState(false);
  const [customBackdropUrl, setCustomBackdropUrl] = useState<string | null>(null);

  // Sync photo source when product changes
  useEffect(() => {
    setPhotoSourceUrl(activeProduct.rawImageUrl);
    setCutoutResultUrl(activeProduct.cutoutImageUrl || null);
    setStagedResultUrl(activeProduct.enhancedImageUrl || null);
  }, [selectedProductId]);

  // Execute Background Removal
  const handleRemoveBackground = async () => {
    if (!photoSourceUrl) return;
    setIsRemovingBg(true);
    try {
      const cutout = await removeImageBackground(photoSourceUrl, {
        tolerance,
        featherRadius,
        preserveInterior: true
      });
      setCutoutResultUrl(cutout);

      // Update product state
      setProducts(prev => prev.map(p => 
        p.id === activeProduct.id ? { ...p, cutoutImageUrl: cutout } : p
      ));

      playCommercialSFX('pop');
    } catch (err: any) {
      console.error('BG removal failed:', err);
      alert('Could not remove background: ' + err.message);
    } finally {
      setIsRemovingBg(false);
    }
  };

  // Generate Buyable Staged Image
  const handleGenerateBuyableStage = async () => {
    const cutoutToUse = cutoutResultUrl || photoSourceUrl;
    if (!cutoutToUse) return;

    setIsGeneratingStage(true);
    try {
      const buyable = await generateBuyableProductImage({
        product: activeProduct,
        cutoutImageUrl: cutoutToUse,
        presetId: selectedPresetId,
        customBackdropUrl: customBackdropUrl || undefined,
        showRatingBadge: true,
        showUrgencyBadge: true,
        showPriceRibbon: true,
        showFeatureBadges: true,
        width: 1200,
        height: 1200
      });

      setStagedResultUrl(buyable);

      // Update product state
      setProducts(prev => prev.map(p => 
        p.id === activeProduct.id ? { ...p, enhancedImageUrl: buyable, stagingPresetId: selectedPresetId } : p
      ));

      playCommercialSFX('cha-ching');
    } catch (err: any) {
      console.error('Buyable staging failed:', err);
      alert('Could not generate staged buyable photo: ' + err.message);
    } finally {
      setIsGeneratingStage(false);
    }
  };

  // Generate Custom AI Staging Backdrop via /api/generate-image-nano
  const handleGenerateAiBackdrop = async () => {
    if (!customAiPrompt.trim()) return;
    setIsGeneratingAiBackdrop(true);
    try {
      const res = await fetch('/api/generate-image-nano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Commercial e-commerce empty product staging pedestal, ${customAiPrompt}, professional studio lighting, 8k resolution, centered platform with space for product`,
          mode: 'create',
          aspectRatio: '1:1',
          imageSize: '1K'
        })
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setCustomBackdropUrl(data.imageUrl);
        playCommercialSFX('glockenspiel-reveal');
        // Auto-run staging composite with the new AI backdrop
        const cutoutToUse = cutoutResultUrl || photoSourceUrl;
        if (cutoutToUse) {
          const buyable = await generateBuyableProductImage({
            product: activeProduct,
            cutoutImageUrl: cutoutToUse,
            presetId: selectedPresetId,
            customBackdropUrl: data.imageUrl,
            width: 1200,
            height: 1200
          });
          setStagedResultUrl(buyable);
        }
      } else {
        throw new Error(data.error || 'Failed generating backdrop');
      }
    } catch (e: any) {
      console.warn('AI Backdrop generation note:', e.message);
      // Fallback procedural
      handleGenerateBuyableStage();
    } finally {
      setIsGeneratingAiBackdrop(false);
    }
  };

  // ----------------------------------------------------
  // COMMERCIAL VIDEO GENERATOR STATE
  // ----------------------------------------------------
  const [aspect, setAspect] = useState<CommercialAspect>('9:16');
  const [template, setTemplate] = useState<CommercialTemplate>('viral-ugc');
  const [commercialDurationSec, setCommercialDurationSec] = useState<number>(20);
  const [isPlayingCommercial, setIsPlayingCommercial] = useState<boolean>(false);
  const [commercialTime, setCommercialTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState<boolean>(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const bgmRef = useRef<{ stop: () => void; setVolume: (v: number) => void } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // 5 Distinct Commercial Scenes
  const scenes = [
    {
      id: 'hook',
      label: '1. The Viral Hook',
      durationRatio: 0.20,
      badge: '⚠️ STOP SCROLLING',
      headline: 'The internet is officially OBSESSED with this...',
      subline: `Wait until you see what ${activeProduct.title} can do.`
    },
    {
      id: 'problem',
      label: '2. The Curiosity Spike',
      durationRatio: 0.20,
      badge: '🤔 TIRED OF ORDINARY?',
      headline: 'Most items claim to be high quality. But this is different.',
      subline: 'Engineered for real collectors & enthusiasts.'
    },
    {
      id: 'reveal',
      label: '3. Product Reveal & Features',
      durationRatio: 0.25,
      badge: '✨ OFFICIAL REVEAL',
      headline: activeProduct.title,
      subline: activeProduct.features.slice(0, 3).join(' • ')
    },
    {
      id: 'social-proof',
      label: '4. Verified 5-Star Reviews',
      durationRatio: 0.15,
      badge: `★ ${activeProduct.rating.toFixed(1)} / 5.0 RATING`,
      headline: `"Hands down the best purchase I made all year!"`,
      subline: `Over ${activeProduct.reviewCount.toLocaleString()}+ verified 5-star buyers`
    },
    {
      id: 'offer-cta',
      label: '5. Limited Sale & Call to Action',
      durationRatio: 0.20,
      badge: '⚡ FLASH SALE ENDING',
      headline: `Get Yours For ${activeProduct.currency}${activeProduct.price.toFixed(2)} Today!`,
      subline: 'Use Code: BOSSLISTER20 • Tap Shop Now Before It Sells Out'
    }
  ];

  // Active scene based on commercialTime
  let accumulatedTime = 0;
  let activeSceneIndex = 0;
  for (let i = 0; i < scenes.length; i++) {
    const scDur = scenes[i].durationRatio * commercialDurationSec;
    if (commercialTime >= accumulatedTime && commercialTime < accumulatedTime + scDur) {
      activeSceneIndex = i;
      break;
    }
    accumulatedTime += scDur;
    if (i === scenes.length - 1) activeSceneIndex = i;
  }
  const currentScene = scenes[activeSceneIndex];

  // Play / Pause commercial loop
  const togglePlayCommercial = () => {
    if (isPlayingCommercial) {
      setIsPlayingCommercial(false);
      if (bgmRef.current) {
        bgmRef.current.stop();
        bgmRef.current = null;
      }
    } else {
      setIsPlayingCommercial(true);
      if (!isMuted) {
        bgmRef.current = startCommercialBGM('upbeat-electro');
        playCommercialSFX('whoosh');
      }
    }
  };

  // Trigger voiceover speech on scene change if playing
  const lastSpokenSceneRef = useRef<number>(-1);
  useEffect(() => {
    if (isPlayingCommercial && !isMuted && activeSceneIndex !== lastSpokenSceneRef.current) {
      lastSpokenSceneRef.current = activeSceneIndex;
      speakCommercialVoiceover(currentScene.headline, 'energetic-ugc');
    }
  }, [activeSceneIndex, isPlayingCommercial, isMuted]);

  // Main Canvas Render Loop for Commercial Video
  useEffect(() => {
    const canvas = videoCanvasRef.current;
    if (!canvas) return;

    let targetW = 720;
    let targetH = 1280; // 9:16
    if (aspect === '1:1') {
      targetW = 1080;
      targetH = 1080;
    } else if (aspect === '16:9') {
      targetW = 1280;
      targetH = 720;
    }

    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlayingCommercial) {
        setCommercialTime(prev => {
          const next = prev + dt;
          if (next >= commercialDurationSec) {
            playCommercialSFX('fanfare');
            return 0; // loop
          }
          return next;
        });
      }

      // Draw Commercial Frame
      drawCommercialFrame(
        ctx,
        targetW,
        targetH,
        activeProduct,
        cutoutResultUrl || stagedResultUrl || activeProduct.rawImageUrl,
        currentScene,
        commercialTime,
        commercialDurationSec,
        aspect
      );

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    aspect, 
    isPlayingCommercial, 
    commercialDurationSec, 
    activeProduct, 
    cutoutResultUrl, 
    stagedResultUrl, 
    currentScene, 
    commercialTime
  ]);

  // Real Video Recording via MediaRecorder
  const handleRecordCommercialVideo = () => {
    const canvas = videoCanvasRef.current;
    if (!canvas) return;

    if (isRecordingVideo) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingVideo(false);
      return;
    }

    try {
      recordedChunksRef.current = [];
      const stream = canvas.captureStream(30);

      // Try capturing audio if possible
      const audioCtx = getCommercialAudioContext();
      if (audioCtx) {
        // connect stream destination
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        playCommercialSFX('cha-ching');
      };

      recorder.start();
      setIsRecordingVideo(true);
      setCommercialTime(0);
      setIsPlayingCommercial(true);
      if (!isMuted) {
        bgmRef.current = startCommercialBGM('upbeat-electro');
      }

      // Auto-stop at duration
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsRecordingVideo(false);
        }
      }, (commercialDurationSec + 0.5) * 1000);
    } catch (e: any) {
      alert('Video recording not supported in this browser: ' + e.message);
    }
  };

  // Upload custom photo from disk
  const handleUploadCustomPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setPhotoSourceUrl(dataUrl);
        setCutoutResultUrl(null);
        setStagedResultUrl(null);

        // Update product raw image
        setProducts(prev => prev.map(p => 
          p.id === activeProduct.id ? { ...p, rawImageUrl: dataUrl, cutoutImageUrl: undefined, enhancedImageUrl: undefined } : p
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  // Add a new product to BossLister Catalog
  const handleAddCustomProduct = () => {
    const newId = `prod-custom-${Date.now()}`;
    const newProd: BossListerProduct = {
      id: newId,
      title: 'New BossLister Item (e.g. Graphic Hoodie / Art Print)',
      sku: `BL-ITEM-${products.length + 1}`,
      category: 'Custom Merch',
      price: 29.99,
      originalPrice: 45.00,
      currency: '$',
      rating: 4.9,
      reviewCount: 320,
      features: ['Premium Quality Materials', 'Exclusive BossLister Release', 'Fast Worldwide Dispatch'],
      badges: ['🔥 NEW RELEASE', 'SAVE 35%'],
      targetMarketplace: 'TikTok Shop',
      rawImageUrl: '/output_books/little_zeus_gets_his_thunderbolt/illustrations/ch001_illus00.png',
      stagingPresetId: 'luxury-marble',
      description: 'High-converting retail merchandise catalog item.'
    };

    setProducts(prev => [newProd, ...prev]);
    setSelectedProductId(newId);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/15 via-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 font-bold">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                BossLister Commercial & Photo Magic Studio
              </span>
              <span className="text-xs text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono">
                Auto-Background Remover • Buyable AI Staging • 9:16 Video Ads
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Commercial Ad Generator for BossLister Products</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Remove backgrounds from item photos, composite onto luxury conversion backdrops, and generate viral commercial videos for TikTok Shop, Amazon, and eBay.
            </p>
          </div>

          {/* Quick Studio Sub-Tab Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveStudioTab('commercial-video')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeStudioTab === 'commercial-video'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Commercial Video</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('photo-magic')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeStudioTab === 'photo-magic'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Photo Magic & Cutout</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('ad-copy')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeStudioTab === 'ad-copy'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ad Copy & Lister</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Selector Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 font-mono shrink-0">
            SELECT PRODUCT:
          </span>
          {products.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProductId(p.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border shrink-0 transition-all ${
                p.id === selectedProductId
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <img 
                src={p.cutoutImageUrl || p.rawImageUrl} 
                alt="" 
                className="w-5 h-5 rounded object-cover border border-slate-700 bg-slate-900" 
              />
              <span className="truncate max-w-[140px]">{p.title}</span>
              <span className="font-mono text-[10px] text-amber-300">{p.currency}{p.price}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleAddCustomProduct}
          className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add BossLister Product</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: COMMERCIAL VIDEO GENERATOR */}
      {/* ======================================================== */}
      {activeStudioTab === 'commercial-video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Canvas Video Player (Cols 7) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
            
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Film className="w-3 h-3" />
                  Live Animated Commercial Player
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {aspect} • {commercialDurationSec}s Ad
                </span>
              </div>

              {/* Aspect Ratio Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setAspect('9:16')}
                  className={`px-2.5 py-1 rounded font-bold flex items-center gap-1 transition-all ${
                    aspect === '9:16' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="9:16 Vertical Video (TikTok, Reels, Shorts)"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>9:16</span>
                </button>
                <button
                  onClick={() => setAspect('1:1')}
                  className={`px-2.5 py-1 rounded font-bold flex items-center gap-1 transition-all ${
                    aspect === '1:1' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="1:1 Square (Instagram Feed, Facebook, Catalog)"
                >
                  <Layers className="w-3 h-3" />
                  <span>1:1</span>
                </button>
                <button
                  onClick={() => setAspect('16:9')}
                  className={`px-2.5 py-1 rounded font-bold flex items-center gap-1 transition-all ${
                    aspect === '16:9' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="16:9 Landscape (YouTube, Amazon Video, TV)"
                >
                  <Monitor className="w-3 h-3" />
                  <span>16:9</span>
                </button>
              </div>
            </div>

            {/* Canvas Video Viewport */}
            <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/80 flex items-center justify-center p-2 min-h-[420px] shadow-inner">
              <canvas
                ref={videoCanvasRef}
                className={`max-w-full rounded-xl shadow-2xl transition-all ${
                  aspect === '9:16'
                    ? 'h-[460px] aspect-[9/16]'
                    : aspect === '1:1'
                    ? 'h-[420px] aspect-square'
                    : 'w-full aspect-video'
                }`}
              />

              {/* Floating Live Badge */}
              <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 text-white text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-md">
                <span className={`w-2 h-2 rounded-full ${isPlayingCommercial ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{isPlayingCommercial ? 'PLAYING' : 'PAUSED'}</span>
                <span className="text-slate-400">({commercialTime.toFixed(1)}s / {commercialDurationSec}s)</span>
              </div>

              {/* Watermark / BossLister Tag */}
              <div className="absolute bottom-4 right-4 bg-slate-950/80 border border-slate-800 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full backdrop-blur-md">
                ⚡ BossLister Engine
              </div>
            </div>

            {/* Video Scrubber & Playback Controls */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              {/* Progress Slider */}
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span>{commercialTime.toFixed(1)}s</span>
                <input
                  type="range"
                  min="0"
                  max={commercialDurationSec}
                  step="0.1"
                  value={commercialTime}
                  onChange={(e) => setCommercialTime(parseFloat(e.target.value))}
                  className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <span>{commercialDurationSec}s</span>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayCommercial}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                      isPlayingCommercial
                        ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                        : 'bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-500'
                    }`}
                  >
                    {isPlayingCommercial ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingCommercial ? 'Pause' : 'Play Commercial'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCommercialTime(0);
                      playCommercialSFX('whoosh');
                    }}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
                    title="Restart from beginning"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2 rounded-xl border transition-colors ${
                      isMuted
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                    title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Record Video (.webm) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRecordCommercialVideo}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg ${
                      isRecordingVideo
                        ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/30'
                        : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>{isRecordingVideo ? 'Recording Video...' : 'Record Video (.webm)'}</span>
                  </button>

                  {recordedVideoUrl && (
                    <a
                      href={recordedVideoUrl}
                      download={`${activeProduct.sku}-commercial-${aspect}.webm`}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Video</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Teleprompter & Voiceover Script */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Sparkles className="w-3 h-3" />
                  Voiceover Script Teleprompter ({currentScene.label})
                </span>
                <span>Scene {activeSceneIndex + 1} of 5</span>
              </div>
              <p className="text-slate-100 font-semibold italic text-sm leading-snug">
                "{currentScene.headline}"
              </p>
              <p className="text-slate-400 text-xs">
                {currentScene.subline}
              </p>
            </div>

          </div>

          {/* Right Control & Customization Panel (Cols 5) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Commercial Style & Duration */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Commercial Framework & Length
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Ad Style Template:
                  </label>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value as CommercialTemplate)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="viral-ugc">📱 Viral TikTok UGC (Hook ➔ Problem ➔ Reveal ➔ CTA)</option>
                    <option value="luxury-reveal">✨ Luxury Showcase (Cinematic pedestal reveal & gold badge)</option>
                    <option value="direct-response-pas">🔥 Direct Response PAS (Problem, Agitation, Solution)</option>
                    <option value="fast-hook-blitz">⚡ 15s Blitz Hook (High-velocity impulse buy)</option>
                    <option value="social-proof-unboxing">⭐ Social Proof Rave (5-Star Reviews & Customer Quotes)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                    <span className="font-bold">Target Duration:</span>
                    <span className="font-mono text-amber-400 font-bold">{commercialDurationSec} seconds</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 20, 30].map(sec => (
                      <button
                        key={sec}
                        onClick={() => setCommercialDurationSec(sec)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          commercialDurationSec === sec
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {sec}s {sec === 15 ? 'Blitz' : sec === 20 ? 'Optimal' : 'Extended'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Scene Sequence Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  Commercial Storyboard (5 Beats)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Click to jump</span>
              </h3>

              <div className="space-y-2">
                {scenes.map((sc, idx) => {
                  const isActive = activeSceneIndex === idx;
                  const startSec = scenes.slice(0, idx).reduce((acc, s) => acc + s.durationRatio * commercialDurationSec, 0);

                  return (
                    <button
                      key={sc.id}
                      onClick={() => {
                        setCommercialTime(startSec);
                        playCommercialSFX('whoosh');
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                        isActive
                          ? 'bg-indigo-950/70 border-indigo-500/60 ring-1 ring-indigo-400/30'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${
                        isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {startSec.toFixed(1)}s
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-bold truncate ${isActive ? 'text-amber-300' : 'text-slate-200'}`}>
                            {sc.label}
                          </span>
                          <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-400 shrink-0">
                            {sc.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          "{sc.headline}"
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick jump to Photo Magic */}
            <div className="bg-gradient-to-r from-amber-500/10 via-indigo-600/10 to-transparent border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
              <div>
                <h4 className="text-xs font-bold text-amber-300">
                  Want to remove this item's background first?
                </h4>
                <p className="text-[11px] text-slate-400">
                  Create a transparent PNG cutout or mount onto a luxury marble podium.
                </p>
              </div>

              <button
                onClick={() => setActiveStudioTab('photo-magic')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1 transition-all"
              >
                <span>Photo Magic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: PHOTO MAGIC & BACKGROUND REMOVER */}
      {/* ======================================================== */}
      {activeStudioTab === 'photo-magic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Canvas Preview / Comparison (Cols 7) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-amber-400" />
                  Background Remover & Staging Canvas
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  1-Click AI Cutout with edge antialiasing and commercial product staging.
                </p>
              </div>

              <label className="cursor-pointer bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all">
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>Upload Item Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadCustomPhoto}
                />
              </label>
            </div>

            {/* Display Comparison Grid: Raw vs Cutout vs Staged */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Box 1: Raw Original */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>1. Original Photo</span>
                  <span className="text-slate-500">Raw Input</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2 h-52 flex items-center justify-center relative overflow-hidden group">
                  <img
                    src={photoSourceUrl}
                    alt="Original"
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                </div>
              </div>

              {/* Box 2: Transparent Cutout */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-amber-300 font-bold">2. Transparent Cutout</span>
                  {cutoutResultUrl && <span className="text-emerald-400 font-bold">✓ Ready</span>}
                </div>
                <div 
                  className="border border-slate-800 rounded-2xl p-2 h-52 flex items-center justify-center relative overflow-hidden group"
                  style={{
                    backgroundImage: 'repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%)',
                    backgroundSize: '16px 16px'
                  }}
                >
                  {cutoutResultUrl ? (
                    <img
                      src={cutoutResultUrl}
                      alt="Cutout"
                      className="max-h-full max-w-full object-contain drop-shadow-xl"
                    />
                  ) : (
                    <div className="text-center p-3 text-slate-500 space-y-1">
                      <Scissors className="w-6 h-6 mx-auto text-slate-600" />
                      <p className="text-[11px]">Click "Remove Background" below</p>
                    </div>
                  )}

                  {cutoutResultUrl && (
                    <a
                      href={cutoutResultUrl}
                      download={`${activeProduct.sku}-cutout.png`}
                      className="absolute bottom-2 right-2 p-1.5 bg-slate-900/90 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-bold border border-slate-700 shadow-md flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-all"
                      title="Download transparent PNG"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PNG</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Box 3: Staged Buyable Image */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-emerald-300 font-bold">3. Buyable E-Comm Hero</span>
                  {stagedResultUrl && <span className="text-emerald-400 font-bold">★ High Converting</span>}
                </div>
                <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-2 h-52 flex items-center justify-center relative overflow-hidden group shadow-lg">
                  {stagedResultUrl ? (
                    <img
                      src={stagedResultUrl}
                      alt="Staged"
                      className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
                    />
                  ) : (
                    <div className="text-center p-3 text-slate-500 space-y-1">
                      <Sparkles className="w-6 h-6 mx-auto text-amber-400/60" />
                      <p className="text-[11px]">Select Preset & Click "Generate Buyable Stage"</p>
                    </div>
                  )}

                  {stagedResultUrl && (
                    <a
                      href={stagedResultUrl}
                      download={`${activeProduct.sku}-buyable-hero.png`}
                      className="absolute bottom-2 right-2 p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-all"
                      title="Download high-res buyable image"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>HD</span>
                    </a>
                  )}
                </div>
              </div>

            </div>

            {/* Cutout Controls Bar */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  Cutout Precision Controls
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Tolerance: {tolerance}% • Feather: {featherRadius}px
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span>Color Tolerance:</span>
                    <span className="font-mono text-amber-300">{tolerance}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="70"
                    value={tolerance}
                    onChange={(e) => setTolerance(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span>Edge Feathering (Smooth):</span>
                    <span className="font-mono text-sky-300">{featherRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    value={featherRadius}
                    onChange={(e) => setFeatherRadius(parseInt(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-400">
                  Boundary flood-fill preserves inner item details while erasing background backdrop.
                </div>

                <button
                  onClick={handleRemoveBackground}
                  disabled={isRemovingBg}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all active:scale-95"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>{isRemovingBg ? 'Removing Background...' : '1-Click Remove Background'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Buyable Staging Preset Selector (Cols 5) */}
          <div className="lg:col-span-5 space-y-5">
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Select Buyable Staging Scene
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proven visual environments that boost buyer trust and perceived product value.
                </p>
              </div>

              {/* Preset Cards */}
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {STAGING_PRESETS.map(preset => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedPresetId(preset.id);
                        playCommercialSFX('pop');
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-950/80 border-indigo-500 shadow-md ring-1 ring-indigo-400'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                            {preset.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {preset.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {preset.description}
                        </p>
                        <span className="text-[10px] font-mono text-emerald-400 mt-1 block">
                          Best for: {preset.platformFit}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="p-1 bg-amber-500 text-slate-950 rounded-full shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Button: Generate Staged Image */}
              <button
                onClick={handleGenerateBuyableStage}
                disabled={isGeneratingStage}
                className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isGeneratingStage ? 'Synthesizing Buyable Stage...' : '✨ Generate Buyable Product Image'}</span>
              </button>
            </div>

            {/* Custom AI Backdrop Generator Prompt Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
              <h4 className="text-xs font-bold text-sky-400 uppercase font-mono flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                Custom AI Studio Scene Prompt
              </h4>
              <p className="text-[11px] text-slate-400">
                Describe any custom backdrop or commercial set (e.g. "On an antique mahogany library desk with candle glow").
              </p>

              <textarea
                value={customAiPrompt}
                onChange={(e) => setCustomAiPrompt(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-400 resize-none font-sans"
                placeholder="Enter custom backdrop scene description..."
              />

              <button
                onClick={handleGenerateAiBackdrop}
                disabled={isGeneratingAiBackdrop}
                className="w-full bg-slate-950 hover:bg-slate-800 border border-sky-500/40 text-sky-300 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{isGeneratingAiBackdrop ? 'Generating AI Backdrop...' : 'Generate Custom AI Backdrop & Stage'}</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: AI AD COPY & BOSSLISTER LISTER EXPORT */}
      {/* ======================================================== */}
      {activeStudioTab === 'ad-copy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* TikTok Shop & Reels Ad Bundle */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-rose-400" />
                TikTok Shop & Instagram Reels Ad Copy
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                High Viral CTR
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <span className="text-[10px] font-mono text-amber-400 block font-bold">VIRAL HOOK (FIRST 3 SECONDS):</span>
                <p className="text-xs text-slate-200 font-semibold">
                  "Stop scrolling! If you love {activeProduct.category.toLowerCase()}s that actually blow people away, look at what just arrived..."
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <span className="text-[10px] font-mono text-sky-400 block font-bold">CAPTION & CALL TO ACTION:</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The {activeProduct.title} is officially back in stock! ⚡ Over {activeProduct.reviewCount.toLocaleString()} 5-star reviews can't be wrong. Tap the orange shopping cart below to claim yours before the limited flash sale ends! 🏷️
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {['#TikTokShopFinds', '#MustHave', '#TikTokMadeMeBuyIt', '#BossLister', `#${activeProduct.category.replace(/\s+/g, '')}`].map((tag, i) => (
                    <span key={i} className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Amazon & eBay Listing Bundle */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Amazon & eBay Promoted Listing Copy
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                SEO & Conversion
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <span className="text-[10px] font-mono text-amber-400 block font-bold">OPTIMIZED TITLE:</span>
                <p className="text-xs text-slate-200 font-mono">
                  {activeProduct.title} – Premium {activeProduct.category} | {activeProduct.features.join(' | ')}
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <span className="text-[10px] font-mono text-sky-400 block font-bold">5 BULLET FEATURE POINTS:</span>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {activeProduct.features.map((f, idx) => (
                    <li key={idx}><strong className="text-slate-100">{f}</strong> – verified craftsmanship & top-tier performance.</li>
                  ))}
                  <li><strong>100% SATISFACTION GUARANTEE:</strong> Backed by hassle-free returns and quick support.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

// -----------------------------------------------------------------
// CANVAS FRAME RENDERER FOR COMMERCIAL VIDEO
// -----------------------------------------------------------------
function drawCommercialFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  product: BossListerProduct,
  cutoutOrHeroUrl: string,
  scene: { id: string; badge: string; headline: string; subline: string },
  currentTime: number,
  totalDur: number,
  aspect: CommercialAspect
) {
  // Clear
  ctx.clearRect(0, 0, w, h);

  // Background Theme: Dynamic dark luxury gradient with pulsing aura
  const t = currentTime * 1.5;
  const grad = ctx.createRadialGradient(w / 2, h * 0.45, 40, w / 2, h * 0.45, w * 0.9);
  
  if (scene.id === 'hook') {
    grad.addColorStop(0, '#312e81'); // Indigo
    grad.addColorStop(0.6, '#0f172a');
    grad.addColorStop(1, '#020617');
  } else if (scene.id === 'problem') {
    grad.addColorStop(0, '#450a0a'); // Dark crimson intrigue
    grad.addColorStop(0.6, '#0f172a');
    grad.addColorStop(1, '#020617');
  } else if (scene.id === 'reveal') {
    grad.addColorStop(0, '#1e1b4b'); // Deep Royal
    grad.addColorStop(0.6, '#0f172a');
    grad.addColorStop(1, '#020617');
  } else if (scene.id === 'social-proof') {
    grad.addColorStop(0, '#064e3b'); // Emerald Trust
    grad.addColorStop(0.6, '#0f172a');
    grad.addColorStop(1, '#020617');
  } else {
    grad.addColorStop(0, '#78350f'); // Golden Amber Flash Sale
    grad.addColorStop(0.6, '#0f172a');
    grad.addColorStop(1, '#020617');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Floating background particle bubbles / sparkles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  for (let i = 0; i < 14; i++) {
    const px = (Math.sin(t + i * 1.2) * 0.5 + 0.5) * w;
    const py = (Math.cos(t * 0.7 + i * 1.5) * 0.5 + 0.5) * h;
    const pr = 2 + (i % 4);
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw Top Brand / Channel Banner
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('⚡ BOSSLISTER EXCLUSIVE PRODUCT SHOWCASE', w / 2, 28);

  // Draw Top Scene Badge (Pulsing Pill)
  ctx.save();
  ctx.font = 'bold 18px system-ui, sans-serif';
  const badgeText = scene.badge;
  const badgeW = ctx.measureText(badgeText).width + 36;
  const badgeH = 38;
  const badgeX = (w - badgeW) / 2;
  const badgeY = 62;

  const pulseScale = 1 + Math.sin(t * 4) * 0.03;
  ctx.translate(w / 2, badgeY + badgeH / 2);
  ctx.scale(pulseScale, pulseScale);
  ctx.translate(-w / 2, -(badgeY + badgeH / 2));

  ctx.fillStyle = scene.id === 'offer-cta' ? '#ef4444' : '#f59e0b';
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 19);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, w / 2, badgeY + badgeH / 2);
  ctx.restore();

  // Draw Central Cutout Product (Floating with 3D tilt & smooth bobbing)
  const bobY = Math.sin(t * 2) * 12;
  const prodSize = aspect === '9:16' ? w * 0.65 : w * 0.45;
  const prodX = (w - prodSize) / 2;
  const prodY = (h * 0.28) + bobY;

  // Realistic contact shadow under floating item
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.ellipse(w / 2, prodY + prodSize + 18 - bobY * 0.5, prodSize * 0.42, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Draw Product Image
  const imgElem = cachedImage(cutoutOrHeroUrl);
  if (imgElem && imgElem.complete && imgElem.naturalWidth > 0) {
    ctx.save();
    // Gentle 3D roll
    const tilt = Math.sin(t * 1.5) * 0.04;
    ctx.translate(w / 2, prodY + prodSize / 2);
    ctx.rotate(tilt);
    ctx.drawImage(imgElem, -prodSize / 2, -prodSize / 2, prodSize, prodSize);
    ctx.restore();
  } else {
    // Placeholder product graphic
    ctx.fillStyle = '#1e293b';
    roundRect(ctx, prodX, prodY, prodSize, prodSize, 20);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 24px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(product.title.slice(0, 15) + '...', w / 2, prodY + prodSize / 2);
  }

  // Draw Lower Section: Kinetic Caption, Price Slash & Big CTA Button
  const lowerY = h * 0.68;

  // Headline
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 12;
  wrapText(ctx, scene.headline, w / 2, lowerY, w * 0.88, 32);

  // Subline
  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px system-ui, sans-serif';
  ctx.shadowBlur = 4;
  wrapText(ctx, scene.subline, w / 2, lowerY + 70, w * 0.88, 22);
  ctx.restore();

  // Draw Big CTA Button at bottom
  const btnW = Math.min(380, w * 0.85);
  const btnH = 54;
  const btnX = (w - btnW) / 2;
  const btnY = h - btnH - 32;

  ctx.save();
  const btnPulse = 1 + Math.sin(t * 5) * 0.02;
  ctx.translate(w / 2, btnY + btnH / 2);
  ctx.scale(btnPulse, btnPulse);
  ctx.translate(-w / 2, -(btnY + btnH / 2));

  // Button glow
  ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
  ctx.shadowBlur = 18;

  const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
  btnGrad.addColorStop(0, '#f59e0b');
  btnGrad.addColorStop(1, '#ea580c');
  ctx.fillStyle = btnGrad;
  roundRect(ctx, btnX, btnY, btnW, btnH, 16);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#020617';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`🛒 SHOP NOW – ${product.currency}${product.price.toFixed(2)}`, w / 2, btnY + btnH / 2);

  ctx.restore();
}

// Image cache helper
const imageCache = new Map<string, HTMLImageElement>();
function cachedImage(src: string): HTMLImageElement | null {
  if (!src) return null;
  if (imageCache.has(src)) return imageCache.get(src)!;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  imageCache.set(src, img);
  return img;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let curY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}
