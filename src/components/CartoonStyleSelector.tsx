import React, { useState } from 'react';
import { CartoonStyle } from '../types/storyforge';
import { 
  Sparkles, Check, Eye, Volume2, Palette, Layers, 
  Film, Wand2, Compass, Play, X, Sliders, Info
} from 'lucide-react';
import { playCartoonSFX, SFXType } from '../utils/cartoonAudio';

export interface StyleDefinition {
  id: CartoonStyle;
  name: string;
  tagline: string;
  category: 'featured' | '3d-anime' | 'handcrafted' | 'classic';
  studioBadge: string;
  badgeColor: string;
  description: string;
  palette: string[];
  promptKeywords: string;
  technique: {
    shading: string;
    lineArt: string;
    atmosphere: string;
    framePacing: string;
  };
  audioSFX: SFXType;
  audioLabel: string;
}

export const CARTOON_STYLES: StyleDefinition[] = [
  {
    id: '3d-pixar',
    name: '3D Pixar & DreamWorks CGI',
    tagline: 'Volumetric Depth • Subsurface Skin • Soft Cinematic Lighting',
    category: 'featured',
    studioBadge: 'Pixar / Disney 3D',
    badgeColor: 'from-amber-400 to-orange-500 text-slate-950',
    description: 'High-end 3D animated feature film look with rich volumetric lighting, tangible textures, expressive oversized eyes, and warm cinematic color grading.',
    palette: ['#38bdf8', '#fbbf24', '#f97316', '#1e293b'],
    promptKeywords: '3D Pixar CGI animation style, rendered in Unreal Engine 5 aesthetic, volumetric sunbeam lighting, soft subsurface scattering on skin, vibrant tactile textures, round expressive cartoon facial features, blockbuster animated movie quality',
    technique: {
      shading: 'Smooth subsurface scattering with soft radial ambient occlusion',
      lineArt: 'Clean rim-lighting & specular edges without black ink lines',
      atmosphere: 'Cinematic depth-of-field with warm dust motes & golden glow',
      framePacing: '24 FPS ultra-fluid cinematic motion curves'
    },
    audioSFX: 'magic-sparkle',
    audioLabel: 'Sparkle Bloom SFX'
  },
  {
    id: 'studio-ghibli',
    name: 'Studio Ghibli Watercolor',
    tagline: 'Hand-Painted Gouache • Lush Rolling Meadows • Whimsical Warmth',
    category: 'featured',
    studioBadge: 'Hayao Miyazaki Aesthetic',
    badgeColor: 'from-emerald-400 to-teal-500 text-slate-950',
    description: 'Breathtaking hand-painted watercolor and gouache aesthetic inspired by classic Ghibli films. Features lush emerald foliage, billowy cumulus clouds, gentle breezes, and nostalgic warmth.',
    palette: ['#34d399', '#fde047', '#60a5fa', '#f472b6'],
    promptKeywords: 'Studio Ghibli animation aesthetic, painted by Hayao Miyazaki, hand-painted watercolor gouache backgrounds, lush green meadows, billowy summer cumulus clouds, warm nostalgic sunlight, gentle wind blowing character hair, whimsical storybook soul',
    technique: {
      shading: 'Painterly gouache washes with soft wet-on-wet transitions',
      lineArt: 'Delicate sepia-pencil outlines with organic calligraphic weight',
      atmosphere: 'Gentle morning sunbeams with floating dandelion seeds & wind gusts',
      framePacing: '12-24 FPS expressive theatrical animation with gentle pauses'
    },
    audioSFX: 'whoosh',
    audioLabel: 'Pastoral Wind Breeze SFX'
  },
  {
    id: 'anime-chibi',
    name: 'Anime & Shonen Action',
    tagline: 'Dynamic Cel-Shading • Expressive Eyes • Kinetic Speed Lines',
    category: 'featured',
    studioBadge: 'Toei / Shonen Anime',
    badgeColor: 'from-purple-400 to-pink-500 text-slate-950',
    description: 'Electric modern anime style with crisp vector cel-shading, high-contrast dynamic shadows, expressive starry anime eyes, and kinetic action speed-lines.',
    palette: ['#c084fc', '#f43f5e', '#38bdf8', '#0f172a'],
    promptKeywords: 'Modern Japanese anime animation style, crisp two-tone cel shading, vibrant neon accents, dynamic perspective angles, large expressive shonen anime eyes, kinetic motion speed lines, high energy action composition',
    technique: {
      shading: 'Sharp two-step vector cel-shading with hard cut shadow edges',
      lineArt: 'Crisp tapered black ink with variable weight and speed strokes',
      atmosphere: 'High-contrast chromatic rim glow and radiant energy aura',
      framePacing: 'Animated on-twos (12 FPS) with explosive fast-frame snaps'
    },
    audioSFX: 'clockwork-whir',
    audioLabel: 'Kinetic Charge SFX'
  },
  {
    id: 'sketch',
    name: 'Hand-Drawn Pencil & Sketch',
    tagline: 'Cross-Hatched Graphite • Charcoal Linework • Parchment Texture',
    category: 'featured',
    studioBadge: 'Concept Sketchbook',
    badgeColor: 'from-amber-200 to-stone-400 text-slate-950',
    description: 'Artistic animator\'s preliminary concept sketchbook aesthetic. Features visible graphite pencil hatching, textured cream parchment paper, charcoal depth, and expressive line boiling.',
    palette: ['#fef3c7', '#a8a29e', '#57534e', '#1c1917'],
    promptKeywords: 'Hand-drawn charcoal and graphite pencil sketch animation, Renaissance Leonardo sketchbook style, cross-hatched pencil shading, warm aged parchment paper texture, artistic rough construction guidelines, expressive animator pencil test',
    technique: {
      shading: 'Fine 45-degree cross-hatching and smeared graphite tonal washes',
      lineArt: 'Layered rough pencil strokes with visible under-drawing construction arcs',
      atmosphere: 'Textured fibrous deckle paper tone with subtle graphite dust specks',
      framePacing: '12 FPS classic pencil-test flipbook cadence with line vibration'
    },
    audioSFX: 'ticking',
    audioLabel: 'Pencil Scratch SFX'
  },
  {
    id: '2d-classic',
    name: '2D Classic Saturday Morning',
    tagline: 'Golden Era Inks • Bouncy Squash & Stretch • Primary Colors',
    category: 'classic',
    studioBadge: 'Warner / Disney 2D',
    badgeColor: 'from-yellow-400 to-amber-500 text-slate-950',
    description: 'Iconic 1990s television cartoon style with bold black contour outlines, bright primary colors, rubbery exaggerated limbs, and slapstick visual comedy.',
    palette: ['#f59e0b', '#3b82f6', '#ef4444', '#10b981'],
    promptKeywords: 'Classic 1990s Saturday morning cartoon television style, bold ink contours, vibrant flat cel coloring, exaggerated squash and stretch anatomy, slapstick visual humor, colorful retro animation background',
    technique: {
      shading: 'Flat solid cel fills with minimal single-tone under-shadows',
      lineArt: 'Heavy consistent black ink outlines with rounded terminal caps',
      atmosphere: 'Saturated flat sky gradients and clean graphic backdrop shapes',
      framePacing: 'Fast snappy squash-and-stretch timing with comic holds'
    },
    audioSFX: 'boing',
    audioLabel: 'Cartoon Boing SFX'
  },
  {
    id: 'claymation',
    name: 'Tactile Claymation Stop-Motion',
    tagline: 'Plasticine Clay • Miniature Set Lighting • Thumbprint Texture',
    category: 'handcrafted',
    studioBadge: 'Aardman / Laika Style',
    badgeColor: 'from-orange-500 to-red-600 text-white',
    description: 'Charming handcrafted stop-motion aesthetic with tactile sculpted clay models, subtle thumbprint imperfections, tabletop spotlighting, and miniature set depth.',
    palette: ['#ea580c', '#f59e0b', '#0d9488', '#431407'],
    promptKeywords: 'Claymation stop-motion animation, physical sculpted plasticine clay characters, visible clay seam textures and subtle fingerprint indentations, miniature studio tabletop spotlight lighting, shallow depth of field, handcrafted charm',
    technique: {
      shading: 'Physical miniature softbox spotlighting with warm falloff shadows',
      lineArt: 'Zero ink lines; defined entirely by physical clay edges & cast shadows',
      atmosphere: 'Warm workshop tungsten lamp glow with soft miniature bokeh',
      framePacing: 'Stepped 12 FPS stop-motion armature motion with tactile charm'
    },
    audioSFX: 'pop',
    audioLabel: 'Tactile Clay Pop SFX'
  },
  {
    id: 'rubber-hose',
    name: '1930s Rubber Hose Vintage',
    tagline: 'Fleischer Era • Pie-Cut Eyes • Sepia Grain & Scratches',
    category: 'classic',
    studioBadge: '1930s Cuphead / Fleischer',
    badgeColor: 'from-zinc-300 to-zinc-500 text-slate-950',
    description: 'Vintage 1930s black-and-white theatrical short with sepia wash, pie-cut eyes, noodly boneless arms and legs, white Mickey-style gloves, and authentic film projector grain.',
    palette: ['#18181b', '#f4f4f5', '#d97706', '#71717a'],
    promptKeywords: '1930s rubber hose vintage cartoon animation, vintage Fleischer Studios style, pie-cut eyes, noodle arms and legs, monochrome with warm sepia tint, flickering 35mm film grain, dust specks, jazz age theatrical short',
    technique: {
      shading: 'High-contrast monochrome halftone shading with vintage sepia wash',
      lineArt: 'Thick vintage dip-pen ink lines with rhythmic rubbery curvature',
      atmosphere: 'Flickering 35mm celluloid grain, subtle dust hairs, and circular vignette',
      framePacing: 'Bouncy rhythmic 24 FPS cycle synced to an upbeat tempo'
    },
    audioSFX: 'giggle-slide',
    audioLabel: 'Vintage Whistle SFX'
  },
  {
    id: 'storybook-popup',
    name: 'Pop-Up Watercolor Papercraft',
    tagline: 'Layered Cardstock • Living Fairytale • Textured Folds',
    category: 'handcrafted',
    studioBadge: 'Living Fairytale Book',
    badgeColor: 'from-pink-400 to-indigo-500 text-white',
    description: 'Enchanting children\'s book pop-up illustration where layers of cut cardstock physically pop toward the viewer with soft drop shadows, torn paper edges, and watercolor tints.',
    palette: ['#ec4899', '#8b5cf6', '#06b6d4', '#fef08a'],
    promptKeywords: 'Pop-up children storybook illustration, multi-layered cut papercraft diorama, soft natural drop shadows between cardboard planes, subtle paper fiber texture, gentle pastel watercolor wash, whimsical fairytale stage',
    technique: {
      shading: 'Multi-plane paper cast drop shadows with clean cutout borders',
      lineArt: 'Crisp die-cut paper silhouette edges with subtle deckled tearing',
      atmosphere: 'Warm bedtime reading lamp glow and folded paper crease lines',
      framePacing: 'Gentle accordion-fold unfold motion with physical spring-backs'
    },
    audioSFX: 'fanfare',
    audioLabel: 'Fairytale Chime SFX'
  }
];

// Interactive Visual Artwork Renderer for Each Art Style
const VisualStyleArtwork: React.FC<{ styleId: CartoonStyle; isLarge?: boolean }> = ({ styleId, isLarge }) => {
  const h = isLarge ? 200 : 110;
  
  switch (styleId) {
    case '3d-pixar':
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover rounded-lg overflow-hidden">
          <defs>
            <radialGradient id="pixar-sky" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
            <radialGradient id="pixar-sun" cx="30%" cy="20%" r="40%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="pixar-skin" cx="40%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="70%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#c2410c" />
            </radialGradient>
            <radialGradient id="pixar-gear" cx="35%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>
            <filter id="pixar-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Background */}
          <rect width="320" height="180" fill="url(#pixar-sky)" />
          <circle cx="90" cy="40" r="110" fill="url(#pixar-sun)" />
          
          {/* Soft 3D Pixar Mountains with depth */}
          <path d="M-20 180 L80 100 L180 180 Z" fill="#1e293b" opacity="0.6" />
          <path d="M120 180 L230 85 L340 180 Z" fill="#0f172a" opacity="0.8" />
          
          {/* Glowing 3D Golden Gears */}
          <g filter="url(#pixar-glow)">
            <circle cx="260" cy="55" r="32" fill="url(#pixar-gear)" />
            <circle cx="260" cy="55" r="12" fill="#0f172a" />
            <rect x="256" y="15" width="8" height="14" rx="3" fill="#fef08a" />
            <rect x="256" y="81" width="8" height="14" rx="3" fill="#fef08a" />
            <rect x="220" y="51" width="14" height="8" rx="3" fill="#fef08a" />
            <rect x="286" y="51" width="14" height="8" rx="3" fill="#fef08a" />
          </g>

          {/* 3D Pixar Leo Character Head */}
          <g transform="translate(130, 95)">
            {/* Soft 3D Torso */}
            <rect x="-30" y="25" width="60" height="60" rx="14" fill="#2563eb" />
            <rect x="-18" y="35" width="36" height="45" rx="8" fill="#d97706" />
            {/* Round 3D Head */}
            <circle cx="0" cy="0" r="35" fill="url(#pixar-skin)" />
            {/* 3D Hair volume */}
            <path d="M-36 -5 Q-30 -38 0 -38 Q30 -38 36 -5 Q20 -15 0 -15 Q-20 -15 -36 -5 Z" fill="#78350f" />
            {/* Big Pixar Eyes */}
            <ellipse cx="-12" cy="-4" rx="9" ry="11" fill="#ffffff" />
            <ellipse cx="12" cy="-4" rx="9" ry="11" fill="#ffffff" />
            {/* Irises with blue shimmer */}
            <circle cx="-11" cy="-3" r="6" fill="#0284c7" />
            <circle cx="13" cy="-3" r="6" fill="#0284c7" />
            {/* Specular high-light dots */}
            <circle cx="-13" cy="-6" r="2.5" fill="#ffffff" />
            <circle cx="11" cy="-6" r="2.5" fill="#ffffff" />
            {/* Friendly smile */}
            <path d="M-10 14 Q0 24 10 14" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>

          {/* Volumetric Light Beams */}
          <polygon points="40,0 120,0 200,180 80,180" fill="url(#pixar-sun)" opacity="0.3" />
        </svg>
      );

    case 'studio-ghibli':
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover rounded-lg overflow-hidden">
          <defs>
            <linearGradient id="ghibli-sky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
            <linearGradient id="ghibli-hills1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="ghibli-hills2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          {/* Vibrant watercolor summer sky */}
          <rect width="320" height="180" fill="url(#ghibli-sky)" />
          
          {/* Billowy Ghibli cumulus clouds */}
          <ellipse cx="230" cy="50" rx="60" ry="32" fill="#ffffff" opacity="0.9" />
          <ellipse cx="265" cy="38" rx="42" ry="26" fill="#ffffff" opacity="0.95" />
          <ellipse cx="190" cy="58" rx="36" ry="20" fill="#ffffff" opacity="0.85" />
          
          {/* Lush rolling green hills */}
          <path d="M-30 180 Q60 100 180 140 T360 120 L360 180 Z" fill="url(#ghibli-hills1)" />
          <path d="M-20 180 Q100 125 240 130 T360 160 L360 180 Z" fill="url(#ghibli-hills2)" opacity="0.8" />
          
          {/* Gentle floral specks on hills */}
          <circle cx="80" cy="145" r="2" fill="#f43f5e" />
          <circle cx="120" cy="155" r="2.5" fill="#fde047" />
          <circle cx="150" cy="140" r="2" fill="#ec4899" />
          <circle cx="210" cy="150" r="3" fill="#ffffff" />
          <circle cx="280" cy="142" r="2.5" fill="#fde047" />

          {/* Ghibli Style Leo with wind in his hair */}
          <g transform="translate(100, 100)">
            {/* Soft coat with watercolor wash */}
            <path d="M-22 30 Q-15 15 0 15 Q15 15 22 30 L26 70 L-26 70 Z" fill="#1e3a8a" />
            <path d="M-8 15 L0 30 L8 15 Z" fill="#fef08a" />
            {/* Delicate hand-drawn head */}
            <circle cx="0" cy="0" r="24" fill="#ffedd5" stroke="#78350f" strokeWidth="1.5" />
            {/* Flowing Ghibli hair moving with wind */}
            <path d="M-26 2 Q-20 -28 5 -24 Q24 -20 28 -2 Q18 -10 0 -12 Q-16 -12 -26 2 Z" fill="#854d0e" />
            <path d="M12 -18 Q32 -26 36 -12 Q28 -6 20 -8 Z" fill="#854d0e" />
            {/* Gentle gentle eyes */}
            <ellipse cx="-8" cy="-1" rx="4" ry="5" fill="#1e293b" />
            <ellipse cx="8" cy="-1" rx="4" ry="5" fill="#1e293b" />
            <circle cx="-9" cy="-2.5" r="1.5" fill="#ffffff" />
            <circle cx="7" cy="-2.5" r="1.5" fill="#ffffff" />
            {/* Gentle smile */}
            <path d="M-5 11 Q0 15 5 11" stroke="#9a3412" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {/* Soft pink watercolor cheek blush */}
            <ellipse cx="-13" cy="5" rx="5" ry="2.5" fill="#f43f5e" opacity="0.35" />
            <ellipse cx="13" cy="5" rx="5" ry="2.5" fill="#f43f5e" opacity="0.35" />
          </g>

          {/* Floating dandelion fluff / leaves */}
          <circle cx="45" cy="70" r="2" fill="#ffffff" opacity="0.7" />
          <circle cx="160" cy="80" r="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="210" cy="95" r="2" fill="#ffffff" opacity="0.8" />
        </svg>
      );

    case 'anime-chibi':
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover rounded-lg overflow-hidden">
          <defs>
            <linearGradient id="anime-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4c1d95" />
              <stop offset="50%" stopColor="#831843" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#anime-bg)" />
          
          {/* Dynamic Action Speed Lines */}
          <g stroke="#f43f5e" strokeWidth="1.5" opacity="0.4">
            <line x1="0" y1="20" x2="320" y2="40" />
            <line x1="0" y1="60" x2="320" y2="80" />
            <line x1="0" y1="120" x2="320" y2="100" />
            <line x1="0" y1="160" x2="320" y2="140" />
            <line x1="160" y1="0" x2="160" y2="180" stroke="#a855f7" strokeDasharray="4 8" />
          </g>

          {/* Anime Neon Energy Aura */}
          <circle cx="160" cy="95" r="55" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="8 6" opacity="0.6" />

          {/* Anime Chibi Leo */}
          <g transform="translate(160, 92)">
            {/* Spiky Cel-Shaded Anime Hair */}
            <polygon points="-36,-10 -50,-35 -24,-26 -10,-48 10,-48 24,-26 50,-35 36,-10" fill="#ea580c" stroke="#7c2d12" strokeWidth="2.5" />
            {/* Anime Head Base */}
            <circle cx="0" cy="5" r="34" fill="#ffedd5" stroke="#0f172a" strokeWidth="2.5" />
            {/* Huge Expressive Anime Eyes */}
            <ellipse cx="-13" cy="2" rx="10" ry="14" fill="#0f172a" />
            <ellipse cx="13" cy="2" rx="10" ry="14" fill="#0f172a" />
            <ellipse cx="-13" cy="5" rx="8" ry="9" fill="#0284c7" />
            <ellipse cx="13" cy="5" rx="8" ry="9" fill="#0284c7" />
            {/* Starry anime highlights */}
            <circle cx="-15" cy="-2" r="3.5" fill="#ffffff" />
            <circle cx="11" cy="-2" r="3.5" fill="#ffffff" />
            <circle cx="-10" cy="9" r="1.5" fill="#ffffff" />
            <circle cx="16" cy="9" r="1.5" fill="#ffffff" />
            {/* Determination Eyebrows */}
            <line x1="-22" y1="-14" x2="-6" y2="-9" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
            <line x1="22" y1="-14" x2="6" y2="-9" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
            {/* Chibi Open Mouth */}
            <path d="M-7 19 Q0 27 7 19 Z" fill="#e11d48" stroke="#0f172a" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case 'sketch':
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover rounded-lg overflow-hidden">
          {/* Aged parchment paper tone */}
          <rect width="320" height="180" fill="#fef3c7" />
          
          {/* Fine sketch hatching lines across background */}
          <g stroke="#a8a29e" strokeWidth="0.8" opacity="0.35">
            {Array.from({ length: 24 }).map((_, i) => (
              <line key={i} x1={i * 15} y1="0" x2={i * 15 + 40} y2="180" />
            ))}
          </g>

          {/* Leonardo da Vinci style gear sketch diagram */}
          <g stroke="#57534e" strokeWidth="1.5" fill="none" opacity="0.75" transform="translate(240, 60)">
            <circle cx="0" cy="0" r="30" strokeDasharray="2 3" />
            <circle cx="0" cy="0" r="22" />
            <line x1="-30" y1="0" x2="30" y2="0" strokeWidth="0.8" />
            <line x1="0" y1="-30" x2="0" y2="30" strokeWidth="0.8" />
            <text x="-25" y="44" fontFamily="monospace" fontSize="8" fill="#78716c">FIG. 04 - GEAR</text>
          </g>

          {/* Hand-sketched Leo with cross-hatching */}
          <g transform="translate(120, 95)" stroke="#1c1917">
            {/* Torso sketch lines */}
            <path d="M-22 30 L22 30 L18 70 L-18 70 Z" fill="#f5f5f4" strokeWidth="2" />
            {/* Cross-hatch shading on torso */}
            <line x1="-15" y1="35" x2="5" y2="65" stroke="#78716c" strokeWidth="1" />
            <line x1="-10" y1="35" x2="10" y2="65" stroke="#78716c" strokeWidth="1" />
            <line x1="-5" y1="35" x2="15" y2="65" stroke="#78716c" strokeWidth="1" />
            {/* Head contour */}
            <circle cx="0" cy="0" r="26" fill="#fef9c3" strokeWidth="2.2" />
            {/* Construction axes */}
            <line x1="-24" y1="0" x2="24" y2="0" stroke="#a8a29e" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="0" y1="-24" x2="0" y2="24" stroke="#a8a29e" strokeWidth="0.8" strokeDasharray="2 2" />
            {/* Hand-drawn hair loops */}
            <path d="M-26 0 C-24 -24, 0 -30, 24 -18 C18 -10, 0 -8, -26 0" fill="#e7e5e4" strokeWidth="2" />
            {/* Sketched eyes */}
            <ellipse cx="-8" cy="-1" rx="4" ry="6" fill="#292524" />
            <ellipse cx="8" cy="-1" rx="4" ry="6" fill="#292524" />
            <line x1="-12" y1="-9" x2="-4" y2="-8" strokeWidth="1.8" />
            <line x1="12" y1="-9" x2="4" y2="-8" strokeWidth="1.8" />
            {/* Smile line with graphite tick */}
            <path d="M-6 12 Q0 16 6 12" strokeWidth="1.8" fill="none" />
          </g>

          {/* Hand-sketched border */}
          <rect x="6" y="6" width="308" height="168" fill="none" stroke="#78716c" strokeWidth="1.5" strokeDasharray="12 4" />
        </svg>
      );

    case '2d-classic':
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover rounded-lg overflow-hidden">
          {/* Bold saturated cartoon backdrop */}
          <rect width="320" height="180" fill="#0284c7" />
          <path d="M-20 180 L120 80 L260 180 Z" fill="#f59e0b" />
          <path d="M160 180 L250 110 L340 180 Z" fill="#ef4444" />
          
          {/* Classic Bold Inked Leo */}
          <g transform="translate(150, 95)">
            <rect x="-24" y="25" width="48" height="55" rx="10" fill="#2563eb" stroke="#000000" strokeWidth="4" />
            <circle cx="0" cy="0" r="30" fill="#fed7aa" stroke="#000000" strokeWidth="4" />
            {/* Exaggerated big round eyes */}
            <ellipse cx="-10" cy="-2" rx="8" ry="11" fill="#ffffff" stroke="#000000" strokeWidth="3" />
            <ellipse cx="10" cy="-2" rx="8" ry="11" fill="#ffffff" stroke="#000000" strokeWidth="3" />
            <circle cx="-9" cy="-1" r="4.5" fill="#000000" />
            <circle cx="9" cy="-1" r="4.5" fill="#000000" />
            <circle cx="-11" cy="-3" r="1.5" fill="#ffffff" />
            <circle cx="7" cy="-3" r="1.5" fill="#ffffff" />
            {/* Big goofy grin */}
            <path d="M-14 10 Q0 24 14 10 Z" fill="#e11d48" stroke="#000000" strokeWidth="3" />
          </g>
        </svg>
      );

    case 'claymation':
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover rounded-lg overflow-hidden">
          <defs>
            <radialGradient id="clay-spot" cx="50%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#18181b" />
            </radialGradient>
          </defs>
          <rect width="320" height="180" fill="url(#clay-spot)" />
          
          {/* Clay sculpted floor with tactile depth */}
          <ellipse cx="160" cy="165" rx="140" ry="35" fill="#78350f" />
          <ellipse cx="160" cy="165" rx="120" ry="25" fill="#92400e" />

          {/* Chunky clay Leo */}
          <g transform="translate(160, 95)">
            {/* Chunky clay body */}
            <rect x="-26" y="24" width="52" height="50" rx="14" fill="#1e40af" stroke="#172554" strokeWidth="3" />
            {/* Chunky sculpted clay head */}
            <circle cx="0" cy="0" r="30" fill="#f97316" stroke="#c2410c" strokeWidth="3" />
            {/* Bead bead eyes */}
            <circle cx="-10" cy="-3" r="5" fill="#ffffff" stroke="#431407" strokeWidth="2" />
            <circle cx="10" cy="-3" r="5" fill="#ffffff" stroke="#431407" strokeWidth="2" />
            <circle cx="-9" cy="-3" r="2.5" fill="#000000" />
            <circle cx="9" cy="-3" r="2.5" fill="#000000" />
            {/* Indented clay smile */}
            <path d="M-10 12 Q0 20 10 12" stroke="#431407" strokeWidth="4" strokeLinecap="round" fill="none" />
          </g>
        </svg>
      );

    case 'rubber-hose':
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover rounded-lg overflow-hidden">
          {/* Sepia vintage screen */}
          <rect width="320" height="180" fill="#27272a" />
          <rect width="320" height="180" fill="#78350f" opacity="0.15" />
          
          {/* Vignette border */}
          <circle cx="160" cy="90" r="140" fill="none" stroke="#09090b" strokeWidth="30" opacity="0.8" />

          {/* 1930s Pacman Eye Leo with noodle limbs */}
          <g transform="translate(160, 90)">
            {/* Rubbery noodle body */}
            <rect x="-20" y="25" width="40" height="50" rx="12" fill="#09090b" stroke="#f4f4f5" strokeWidth="2.5" />
            {/* Head */}
            <circle cx="0" cy="0" r="28" fill="#f4f4f5" stroke="#09090b" strokeWidth="3.5" />
            {/* Classic 1930s Pie-Cut Eyes */}
            <path d="M-13 -8 A7 7 0 1 0 -5 0 L-9 -4 Z" fill="#09090b" />
            <path d="M5 -8 A7 7 0 1 0 13 0 L9 -4 Z" fill="#09090b" />
            {/* Rubber hose curved grin */}
            <path d="M-14 8 Q0 22 14 8" stroke="#09090b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Cartoon gloves */}
            <circle cx="-35" cy="50" r="9" fill="#f4f4f5" stroke="#09090b" strokeWidth="2.5" />
            <circle cx="35" cy="50" r="9" fill="#f4f4f5" stroke="#09090b" strokeWidth="2.5" />
          </g>
        </svg>
      );

    case 'storybook-popup':
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover rounded-lg overflow-hidden">
          {/* Cardboard pastel background */}
          <rect width="320" height="180" fill="#fdf2f8" />
          
          {/* Folded center book spine crease */}
          <line x1="160" y1="0" x2="160" y2="180" stroke="#f472b6" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />

          {/* Pop-up layers with drop shadows */}
          <g filter="drop-shadow(0px 8px 6px rgba(0,0,0,0.15))">
            {/* Backdrop mountain paper cutout */}
            <polygon points="20,180 90,80 180,180" fill="#c084fc" />
            <polygon points="140,180 230,70 310,180" fill="#818cf8" />
          </g>

          <g filter="drop-shadow(0px 10px 8px rgba(0,0,0,0.22))" transform="translate(150, 95)">
            {/* Cardstock cutout Leo with visible white die-cut border */}
            <rect x="-24" y="24" width="48" height="52" rx="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="3" />
            <circle cx="0" cy="0" r="28" fill="#fef08a" stroke="#ffffff" strokeWidth="3" />
            {/* Whimsical storybook features */}
            <ellipse cx="-8" cy="-2" rx="4" ry="6" fill="#1e293b" />
            <ellipse cx="8" cy="-2" rx="4" ry="6" fill="#1e293b" />
            <circle cx="-10" cy="-4" r="1.5" fill="#ffffff" />
            <circle cx="6" cy="-4" r="1.5" fill="#ffffff" />
            <path d="M-6 12 Q0 18 6 12" stroke="#db2777" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        </svg>
      );

    default:
      return null;
  }
};

interface CartoonStyleSelectorProps {
  selectedStyle: CartoonStyle;
  onSelectStyle: (style: CartoonStyle) => void;
  onPreviewClose?: () => void;
}

export const CartoonStyleSelector: React.FC<CartoonStyleSelectorProps> = ({
  selectedStyle,
  onSelectStyle
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'featured' | '3d-anime' | 'handcrafted' | 'classic'>('all');
  const [inspectingStyleId, setInspectingStyleId] = useState<CartoonStyle>(selectedStyle);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const activeStyleDef = CARTOON_STYLES.find(s => s.id === selectedStyle) || CARTOON_STYLES[0];
  const inspectedStyleDef = CARTOON_STYLES.find(s => s.id === inspectingStyleId) || activeStyleDef;

  // Filter styles by category
  const filteredStyles = CARTOON_STYLES.filter(s => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'featured') return s.category === 'featured';
    return s.category === activeCategory;
  });

  // Play audio test for a style
  const handleTestAudio = (sfx: SFXType, styleId: string) => {
    setPlayingAudioId(styleId);
    playCartoonSFX(sfx);
    setTimeout(() => {
      setPlayingAudioId(null);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs & Filter Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'All Styles (8)' },
            { id: 'featured', label: '⭐ Featured (Pixar, Ghibli, Anime, Sketch)' },
            { id: '3d-anime', label: '3D & Anime' },
            { id: 'handcrafted', label: 'Handcrafted & Paper' },
            { id: 'classic', label: 'Classic Toon' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeCategory === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Side-by-Side Comparison Launcher */}
        <button
          type="button"
          onClick={() => setShowComparisonModal(true)}
          className="text-xs font-mono font-bold text-sky-400 hover:text-sky-300 bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all"
        >
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>Compare 4 Core Styles</span>
        </button>
      </div>

      {/* Visual Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredStyles.map(st => {
          const isSelected = selectedStyle === st.id;
          const isInspecting = inspectingStyleId === st.id;

          return (
            <div
              key={st.id}
              onClick={() => {
                onSelectStyle(st.id);
                setInspectingStyleId(st.id);
              }}
              className={`group relative rounded-xl border p-3 flex flex-col justify-between transition-all cursor-pointer overflow-hidden ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                  : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              {/* Top Row: Studio Badge & Selection Indicator */}
              <div className="flex items-center justify-between gap-1 mb-2 z-10">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${st.badgeColor} shadow-sm`}>
                  {st.studioBadge}
                </span>

                <div className="flex items-center gap-1">
                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-700 bg-slate-950/50 group-hover:border-slate-500" />
                  )}
                </div>
              </div>

              {/* Visual Thumbnail Art Box */}
              <div className="relative w-full aspect-[16/10] bg-slate-950 rounded-lg overflow-hidden border border-slate-800/80 mb-2.5 group-hover:border-slate-600 transition-all">
                <VisualStyleArtwork styleId={st.id} />
                
                {/* Palette Swatches Overlay on bottom-left */}
                <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-slate-800">
                  {st.palette.map((c, idx) => (
                    <span
                      key={idx}
                      style={{ backgroundColor: c }}
                      className="w-2.5 h-2.5 rounded-full border border-slate-900 shadow-xs"
                      title={c}
                    />
                  ))}
                </div>

                {/* Inspect Button on hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectingStyleId(st.id);
                  }}
                  className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1 transition-all"
                  title="Inspect visual directorial details"
                >
                  <Eye className="w-3 h-3 text-amber-400" />
                  <span>Inspect</span>
                </button>
              </div>

              {/* Title & Tagline */}
              <div>
                <h4 className="text-xs font-black text-slate-100 flex items-center gap-1.5 group-hover:text-amber-400 transition-colors">
                  {st.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                  {st.tagline}
                </p>
              </div>

              {/* Footer: Audio Sound Test & Select Action */}
              <div className="flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestAudio(st.audioSFX, st.id);
                  }}
                  className={`text-[10px] font-mono flex items-center gap-1 px-1.5 py-0.5 rounded ${
                    playingAudioId === st.id 
                      ? 'bg-amber-500/20 text-amber-300' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title="Test style audio cue"
                >
                  <Volume2 className="w-3 h-3 text-amber-400" />
                  <span>Audio Vibe</span>
                </button>

                <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                  {isSelected ? 'ACTIVE' : 'SELECT'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Directorial Inspector Console for Selected/Inspected Style */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>Director's Art Specification:</span>
              <span className="text-slate-100">{inspectedStyleDef.name}</span>
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTestAudio(inspectedStyleDef.audioSFX, `inspect-${inspectedStyleDef.id}`)}
              className="text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Listen: {inspectedStyleDef.audioLabel}</span>
            </button>

            {selectedStyle !== inspectedStyleDef.id && (
              <button
                type="button"
                onClick={() => onSelectStyle(inspectedStyleDef.id)}
                className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1 rounded-lg transition-all shadow-sm"
              >
                Apply This Style
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-0.5">Shading & Volume</span>
            <p className="text-slate-300 font-medium leading-relaxed">{inspectedStyleDef.technique.shading}</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-0.5">Line Art & Inking</span>
            <p className="text-slate-300 font-medium leading-relaxed">{inspectedStyleDef.technique.lineArt}</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-0.5">Atmosphere & Glow</span>
            <p className="text-slate-300 font-medium leading-relaxed">{inspectedStyleDef.technique.atmosphere}</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-0.5">Animation Pacing</span>
            <p className="text-slate-300 font-medium leading-relaxed">{inspectedStyleDef.technique.framePacing}</p>
          </div>
        </div>

        {/* AI Prompt Keyword Preview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex items-start gap-2.5">
          <Wand2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wide block">
              Gemini AI Art Injection Directives:
            </span>
            <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
              "{inspectedStyleDef.promptKeywords}"
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Modal (3D Pixar vs Anime vs Studio Ghibli vs Sketch) */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>Art Style Comparison Matrix: 4 Core Animation Modes</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Preview how your scene and characters look rendered in 3D Pixar, Anime Chibi, Studio Ghibli Watercolor, and Hand-Drawn Sketch.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowComparisonModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4 Core Styles Side-by-Side Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                CARTOON_STYLES.find(s => s.id === '3d-pixar')!,
                CARTOON_STYLES.find(s => s.id === 'studio-ghibli')!,
                CARTOON_STYLES.find(s => s.id === 'anime-chibi')!,
                CARTOON_STYLES.find(s => s.id === 'sketch')!
              ].map(st => {
                const isSelected = selectedStyle === st.id;
                return (
                  <div
                    key={st.id}
                    className={`rounded-xl border p-4 space-y-3 transition-all ${
                      isSelected 
                        ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500' 
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${st.badgeColor}`}>
                        {st.studioBadge}
                      </span>
                      {isSelected ? (
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Active Selection
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectStyle(st.id);
                            setShowComparisonModal(false);
                          }}
                          className="text-xs font-bold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 px-2.5 py-1 rounded-lg transition-all"
                        >
                          Select This Style
                        </button>
                      )}
                    </div>

                    <div className="w-full aspect-[16/9] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-md">
                      <VisualStyleArtwork styleId={st.id} isLarge />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{st.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{st.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-slate-400" />
                        <div className="flex gap-1">
                          {st.palette.map((c, i) => (
                            <span key={i} style={{ backgroundColor: c }} className="w-3 h-3 rounded-full border border-slate-900" />
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTestAudio(st.audioSFX, `modal-${st.id}`)}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Hear Audio</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowComparisonModal(false)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
              >
                Done Comparing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
