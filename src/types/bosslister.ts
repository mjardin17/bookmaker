export interface BossListerCommercialScript {
  headline: string;
  hook: string;
  problem: string;
  productReveal: string;
  features: string[];
  reviewQuote: string;
  reviewerName: string;
  offerText: string;
  promoCode: string;
  callToAction: string;
  voiceoverTone: 'energetic-ugc' | 'cinematic-luxury' | 'casual-friendly' | 'hyped-asmr';
  backgroundMusicGenre: 'upbeat-electro' | 'lofi-chill' | 'cinematic-epic' | 'ambient-tech';
}

export type BossListerProductCategory = 
  | 'Book' 
  | 'Apparel' 
  | 'Drinkware' 
  | 'Print & Poster' 
  | 'Digital / Printable' 
  | 'Collectibles' 
  | 'Custom Merch';

export type BossListerMarketplace = 
  | 'TikTok Shop' 
  | 'Amazon' 
  | 'eBay' 
  | 'Shopify' 
  | 'Etsy' 
  | 'Walmart';

export interface BossListerProduct {
  id: string;
  title: string;
  sku: string;
  category: BossListerProductCategory;
  price: number;
  originalPrice?: number;
  currency: string;
  rating: number; // e.g. 4.9
  reviewCount: number; // e.g. 1840
  features: string[];
  badges: string[]; // e.g. ['LIMITED EDITION', 'BESTSELLER', '30% OFF']
  targetMarketplace: BossListerMarketplace;
  rawImageUrl: string;
  cutoutImageUrl?: string; // transparent PNG
  enhancedImageUrl?: string; // composite on buyable background
  stagingPresetId?: string;
  description: string;
  bossListerSku?: string;
  bossListerListingId?: string;
  commercialScript?: BossListerCommercialScript;
}

export type CommercialAspect = '9:16' | '1:1' | '16:9';
export type CommercialTemplate = 
  | 'viral-ugc' 
  | 'luxury-reveal' 
  | 'direct-response-pas' 
  | 'fast-hook-blitz' 
  | 'social-proof-unboxing';

export interface StagingPreset {
  id: string;
  name: string;
  category: 'Luxury' | 'Lifestyle' | 'Studio' | 'Nature' | 'Tech';
  description: string;
  badgeLabel: string;
  backgroundGradient: string;
  ambientColor: string;
  shadowBlur: number;
  shadowOpacity: number;
  shadowOffsetY: number;
  highlightGlow: string;
  platformFit: string;
}
