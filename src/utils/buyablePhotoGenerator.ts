import { StagingPreset, BossListerProduct } from '../types/bosslister';

export const STAGING_PRESETS: StagingPreset[] = [
  {
    id: 'luxury-marble',
    name: '✨ Luxury Marble & Gold Podium',
    category: 'Luxury',
    description: 'Polished Italian Carrara marble pedestal with floating gold dust, dramatic top rim light, and soft reflection. Maximizes perceived value.',
    badgeLabel: 'PREMIUM QUALITY',
    backgroundGradient: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
    ambientColor: '#fef08a',
    shadowBlur: 28,
    shadowOpacity: 0.65,
    shadowOffsetY: 22,
    highlightGlow: '#eab308',
    platformFit: 'Shopify • Luxury Brands • Collector Editions'
  },
  {
    id: 'scandinavian-wood',
    name: '🌿 Sunlit Scandinavian Wood Table',
    category: 'Lifestyle',
    description: 'Natural blonde oak surface with warm morning window sunbeams and soft monstera plant shadow. Creates authentic, cozy trust.',
    badgeLabel: 'HANDCRAFTED FEEL',
    backgroundGradient: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 40%, #fde68a 100%)',
    ambientColor: '#f59e0b',
    shadowBlur: 20,
    shadowOpacity: 0.35,
    shadowOffsetY: 16,
    highlightGlow: '#ffffff',
    platformFit: 'Etsy • Lifestyle • Books & Journals'
  },
  {
    id: 'pure-white-amazon',
    name: '📦 Amazon / eBay Pure White Studio',
    category: 'Studio',
    description: '100% compliant RGB(255,255,255) seamless catalog studio floor with crisp contact drop shadow. Boosts click-through on search feeds.',
    badgeLabel: 'AMAZON #1 BESTSELLER',
    backgroundGradient: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 80%, #f1f5f9 100%)',
    ambientColor: '#94a3b8',
    shadowBlur: 18,
    shadowOpacity: 0.28,
    shadowOffsetY: 14,
    highlightGlow: '#ffffff',
    platformFit: 'Amazon • eBay • Walmart Marketplace'
  },
  {
    id: 'pastel-ugc-desk',
    name: '📱 Viral TikTok Shop UGC Setup',
    category: 'Lifestyle',
    description: 'Modern aesthetic pastel desk mat with soft ring light glow, clean pastel gradient, and high viral engagement.',
    badgeLabel: '🔥 TIKTOK VIRAL #1',
    backgroundGradient: 'linear-gradient(135deg, #fce7f3 0%, #e0e7ff 50%, #ede9fe 100%)',
    ambientColor: '#ec4899',
    shadowBlur: 24,
    shadowOpacity: 0.4,
    shadowOffsetY: 18,
    highlightGlow: '#f43f5e',
    platformFit: 'TikTok Shop • Instagram Reels • Pinterest'
  },
  {
    id: 'cyberpunk-neon',
    name: '⚡ Cyberpunk Neon Tech Stage',
    category: 'Tech',
    description: 'Dark brushed titanium hexagonal stage with electric cyan and magenta rim lights and atmospheric mist. High-energy futuristic aesthetic.',
    badgeLabel: 'CYBER-PRO EDITION',
    backgroundGradient: 'linear-gradient(180deg, #030712 0%, #082f49 50%, #020617 100%)',
    ambientColor: '#06b6d4',
    shadowBlur: 32,
    shadowOpacity: 0.8,
    shadowOffsetY: 24,
    highlightGlow: '#a855f7',
    platformFit: 'Gaming • Sci-Fi • High-Tech Merch'
  },
  {
    id: 'golden-hour-nature',
    name: '🌅 Outdoor Golden Hour Nature',
    category: 'Nature',
    description: 'Sun-drenched forest stone with warm evening sunbeams, soft green bokeh foliage, and earthy organic warmth.',
    badgeLabel: '100% AUTHENTIC',
    backgroundGradient: 'linear-gradient(180deg, #fef08a 0%, #dcfce7 40%, #14532d 100%)',
    ambientColor: '#84cc16',
    shadowBlur: 22,
    shadowOpacity: 0.45,
    shadowOffsetY: 18,
    highlightGlow: '#fef08a',
    platformFit: 'Outdoor Apparel • Eco-Friendly • Merch'
  }
];

export interface CompositeBuyableOptions {
  width?: number; // e.g. 1080
  height?: number; // e.g. 1080
  product: BossListerProduct;
  cutoutImageUrl: string;
  presetId: string;
  showRatingBadge?: boolean;
  showUrgencyBadge?: boolean;
  showPriceRibbon?: boolean;
  showFeatureBadges?: boolean;
  customBackdropUrl?: string; // If user generated an AI background
}

/**
 * Composite a cut-out product onto a buyable e-commerce staging background with shadows,
 * lighting, and high-converting marketing badges.
 */
export async function generateBuyableProductImage(
  options: CompositeBuyableOptions
): Promise<string> {
  const width = options.width || 1200;
  const height = options.height || 1200;
  const { product, cutoutImageUrl, presetId } = options;

  const preset = STAGING_PRESETS.find(p => p.id === presetId) || STAGING_PRESETS[0];

  // 1. Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context');

  // 2. Draw Background
  if (options.customBackdropUrl) {
    try {
      const bgImg = await loadImage(options.customBackdropUrl);
      ctx.drawImage(bgImg, 0, 0, width, height);
    } catch {
      drawPresetBackground(ctx, preset, width, height);
    }
  } else {
    drawPresetBackground(ctx, preset, width, height);
  }

  // 3. Load Cutout Image
  const prodImg = await loadImage(cutoutImageUrl);

  // Calculate product placement (centered with pedestal proportion)
  const maxProdW = width * 0.62;
  const maxProdH = height * 0.62;
  const scale = Math.min(maxProdW / prodImg.width, maxProdH / prodImg.height);
  const prodW = prodImg.width * scale;
  const prodH = prodImg.height * scale;
  const prodX = (width - prodW) / 2;
  const prodY = (height - prodH) / 2 - (height * 0.04); // slight upward bias for pedestal base

  // 4. Draw Realistic Contact Shadow & Floor Reflection
  drawRealisticShadow(ctx, preset, prodX, prodY, prodW, prodH, width, height);

  // 5. Draw Product Cutout
  ctx.save();
  // Ambient rim glow if applicable
  if (preset.id === 'luxury-marble' || preset.id === 'cyberpunk-neon') {
    ctx.shadowColor = preset.ambientColor;
    ctx.shadowBlur = 15;
  }
  ctx.drawImage(prodImg, prodX, prodY, prodW, prodH);
  ctx.restore();

  // 6. Draw High-Converting E-Commerce Badges & Ribbons

  // A. Top-Right Urgency / Promo Badge
  if (options.showUrgencyBadge !== false) {
    const badgeText = product.badges?.[0] || preset.badgeLabel || '🔥 LIMITED TIME OFFER';
    drawUrgencyBadge(ctx, badgeText, width - 40, 50);
  }

  // B. Top-Left Social Proof / Rating Pill
  if (options.showRatingBadge !== false) {
    drawRatingPill(ctx, product.rating || 4.9, product.reviewCount || 1840, 40, 50);
  }

  // C. Bottom-Left Price & Discount Tag
  if (options.showPriceRibbon !== false && product.price) {
    drawPriceTag(
      ctx,
      product.price,
      product.originalPrice || Math.round(product.price * 1.45 * 100) / 100,
      product.currency || '$',
      40,
      height - 80
    );
  }

  // D. Bottom-Right Feature Checkmarks
  if (options.showFeatureBadges !== false && product.features && product.features.length > 0) {
    drawFeatureBadges(ctx, product.features.slice(0, 3), width - 40, height - 90);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Draw sophisticated procedural staging background
 */
function drawPresetBackground(
  ctx: CanvasRenderingContext2D,
  preset: StagingPreset,
  w: number,
  h: number
) {
  if (preset.id === 'pure-white-amazon') {
    // 100% white studio with subtle gradient floor
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, h * 0.65, 0, h);
    grad.addColorStop(0, 'rgba(241, 245, 249, 0)');
    grad.addColorStop(1, 'rgba(226, 232, 240, 0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, h * 0.65, w, h * 0.35);
    return;
  }

  if (preset.id === 'luxury-marble') {
    // Deep dark moody backdrop with marble pedestal base
    const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.35, 50, w * 0.5, h * 0.5, w * 0.8);
    bgGrad.addColorStop(0, '#1e1b4b');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Marble podium cylinder / ellipse
    const podY = h * 0.72;
    const podW = w * 0.68;
    const podH = h * 0.12;

    // Podium 3D base
    const baseGrad = ctx.createLinearGradient(0, podY, 0, podY + 50);
    baseGrad.addColorStop(0, '#cbd5e1');
    baseGrad.addColorStop(0.5, '#94a3b8');
    baseGrad.addColorStop(1, '#475569');
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.ellipse(w / 2, podY + 40, podW / 2, podH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Podium top surface
    const topGrad = ctx.createRadialGradient(w / 2, podY, 20, w / 2, podY, podW / 2);
    topGrad.addColorStop(0, '#f8fafc');
    topGrad.addColorStop(0.7, '#e2e8f0');
    topGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.ellipse(w / 2, podY, podW / 2, podH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gold rim accent on podium
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(w / 2, podY, podW / 2 + 1, podH / 2 + 1, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Floating gold particle specks
    ctx.fillStyle = 'rgba(234, 179, 8, 0.45)';
    const specks = [
      [w * 0.2, h * 0.25, 4], [w * 0.8, h * 0.3, 5], [w * 0.25, h * 0.55, 3],
      [w * 0.75, h * 0.65, 4], [w * 0.15, h * 0.4, 2.5], [w * 0.85, h * 0.45, 3.5]
    ];
    specks.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    return;
  }

  if (preset.id === 'scandinavian-wood') {
    // Soft morning wall
    const wallGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    wallGrad.addColorStop(0, '#fef3c7');
    wallGrad.addColorStop(1, '#faebd7');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, w, h * 0.65);

    // Warm wooden desk surface
    const deskGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
    deskGrad.addColorStop(0, '#d97706');
    deskGrad.addColorStop(0.3, '#b45309');
    deskGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = deskGrad;
    ctx.fillRect(0, h * 0.65, w, h * 0.35);

    // Wood grain lines
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.2)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 7; i++) {
      const y = h * 0.68 + i * 28;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.3, y - 5, w * 0.7, y + 8, w, y);
      ctx.stroke();
    }
    return;
  }

  if (preset.id === 'cyberpunk-neon') {
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    // Neon laser floor grid
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 1.5;
    const vanishY = h * 0.55;
    for (let x = -w * 0.2; x <= w * 1.2; x += w * 0.12) {
      ctx.beginPath();
      ctx.moveTo(w / 2, vanishY);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = vanishY + 30; y < h; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Top neon glow
    const neonGrad = ctx.createRadialGradient(w / 2, vanishY, 20, w / 2, vanishY, w * 0.5);
    neonGrad.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
    neonGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.15)');
    neonGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = neonGrad;
    ctx.fillRect(0, 0, w, h);
    return;
  }

  // Fallback: Elegant modern studio radial gradient
  const grad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, w * 0.75);
  grad.addColorStop(0, '#334155');
  grad.addColorStop(0.7, '#1e293b');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Draw contact shadow under the product
 */
function drawRealisticShadow(
  ctx: CanvasRenderingContext2D,
  preset: StagingPreset,
  px: number,
  py: number,
  pw: number,
  ph: number,
  cw: number,
  ch: number
) {
  ctx.save();
  const shadowY = py + ph - 8;
  const shadowW = pw * 0.85;
  const shadowH = Math.max(16, ph * 0.1);

  // Soft ambient ground shadow
  ctx.shadowColor = `rgba(0, 0, 0, ${preset.shadowOpacity})`;
  ctx.shadowBlur = preset.shadowBlur;
  ctx.shadowOffsetY = preset.shadowOffsetY;
  ctx.fillStyle = `rgba(0, 0, 0, ${preset.shadowOpacity * 0.7})`;

  ctx.beginPath();
  ctx.ellipse(px + pw / 2, shadowY, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark sharp contact shadow directly under touch point
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = `rgba(0, 0, 0, ${preset.shadowOpacity * 1.2})`;
  ctx.beginPath();
  ctx.ellipse(px + pw / 2, shadowY, shadowW * 0.65 / 2, shadowH * 0.45 / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw Top-Right Urgency & Promo Badge
 */
function drawUrgencyBadge(ctx: CanvasRenderingContext2D, text: string, right: number, top: number) {
  ctx.save();
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  const padX = 22;
  const padY = 12;
  const textWidth = ctx.measureText(text).width;
  const badgeW = textWidth + padX * 2;
  const badgeH = 44;
  const badgeX = right - badgeW;
  const badgeY = top;

  // Badge gradient
  const grad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(1, '#ef4444');

  // Shadow
  ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;

  // Rounded pill
  ctx.fillStyle = grad;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 22);
  ctx.fill();

  // Inner text
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, badgeX + padX, badgeY + badgeH / 2);

  ctx.restore();
}

/**
 * Draw Top-Left Rating Star Pill
 */
function drawRatingPill(ctx: CanvasRenderingContext2D, rating: number, reviews: number, left: number, top: number) {
  ctx.save();
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  const text = `★ ${rating.toFixed(1)} (${reviews.toLocaleString()} verified)`;
  const textWidth = ctx.measureText(text).width;
  const badgeW = textWidth + 36;
  const badgeH = 42;

  // Dark glass pill
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  roundRect(ctx, left, top, badgeW, badgeH, 21);
  ctx.fill();

  ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, left, top, badgeW, badgeH, 21);
  ctx.stroke();

  // Text
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#fbbf24';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, left + 18, top + badgeH / 2);

  ctx.restore();
}

/**
 * Draw Price Tag with Discount Strike-Through
 */
function drawPriceTag(
  ctx: CanvasRenderingContext2D,
  price: number,
  origPrice: number,
  curr: string,
  left: number,
  bottom: number
) {
  ctx.save();

  const saleStr = `${curr}${price.toFixed(2)}`;
  const origStr = `${curr}${origPrice.toFixed(2)}`;
  const discountPct = Math.round(((origPrice - price) / origPrice) * 100);

  ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
  const saleW = ctx.measureText(saleStr).width;

  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  const origW = ctx.measureText(origStr).width;

  const totalW = saleW + origW + 150;
  const h = 64;
  const y = bottom - h;

  // Background banner
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 18;
  roundRect(ctx, left, y, totalW, h, 16);
  ctx.fill();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, left, y, totalW, h, 16);
  ctx.stroke();

  // Sale Price
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(saleStr, left + 20, y + h / 2);

  // Original Price (strike-through)
  const origX = left + 20 + saleW + 16;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px system-ui, -apple-system, sans-serif';
  ctx.fillText(origStr, origX, y + h / 2);

  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(origX - 2, y + h / 2);
  ctx.lineTo(origX + origW + 2, y + h / 2);
  ctx.stroke();

  // Discount Pill
  if (discountPct > 0) {
    const discStr = `-${discountPct}%`;
    const discX = origX + origW + 16;
    ctx.fillStyle = '#ef4444';
    roundRect(ctx, discX, y + 14, 68, 36, 10);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillText(discStr, discX + 10, y + h / 2);
  }

  ctx.restore();
}

/**
 * Draw Feature Bullet Badges
 */
function drawFeatureBadges(ctx: CanvasRenderingContext2D, features: string[], right: number, bottom: number) {
  ctx.save();
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.textBaseline = 'middle';

  const rowH = 34;
  const startY = bottom - (features.length * rowH);

  features.forEach((feat, idx) => {
    const text = `✓ ${feat}`;
    const tw = ctx.measureText(text).width;
    const x = right - tw - 28;
    const y = startY + idx * rowH;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    roundRect(ctx, x, y, tw + 28, 28, 8);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(text, x + 12, y + 14);
  });

  ctx.restore();
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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image: ' + src));
    img.src = src;
  });
}
