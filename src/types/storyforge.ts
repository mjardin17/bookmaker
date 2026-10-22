/**
 * StoryForge Enterprise Types - Empire OS Publishing Division
 */

export type AgeGroup = 
  | 'Infants (0-1y)'
  | 'Toddlers (1-3y)'
  | 'Preschool (3-5y)'
  | 'Early Reader (5-8y)'
  | 'Middle Grade (8-12y)'
  | 'Young Adult (12-18y)'
  | 'Adult (18+)';

export type BookGenre =
  | 'Fantasy'
  | 'Science Fiction'
  | 'History'
  | 'Adventure'
  | 'Mystery'
  | 'Comedy'
  | 'Educational'
  | 'Business'
  | 'Biography'
  | 'Graphic Novel'
  | 'Interactive / Choose Your Path'
  | 'Low Content / Activity Book';

export interface StoryCouncilMember {
  id: string;
  name: string;
  role: string;
  expertise: string;
  avatar: string;
  color: string;
  personality: string[];
  goals: string[];
  weaknesses: string[];
  responsibilities: string[];
}

export interface CouncilDebateEntry {
  id: string;
  specialistId: string;
  specialistName: string;
  specialistRole: string;
  avatar: string;
  color: string;
  timestamp: string;
  type: 'analysis' | 'critique' | 'suggestion' | 'approval';
  content: string;
  ratingScore?: number;
}

export interface CharacterRelationship {
  targetCharacterId: string;
  targetCharacterName: string;
  relationshipType: 'ally' | 'rival' | 'mentor' | 'family' | 'nemesis' | 'neutral';
  notes: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  role: 'protagonist' | 'deuteragonist' | 'antagonist' | 'mentor' | 'supporting';
  biography: string;
  personalityTraits: string[];
  dialogueStyle: {
    tone: string;
    catchphrases: string[];
    vocabularyComplexity: 'Simple' | 'Moderate' | 'Advanced' | 'Poetic';
  };
  goals: string;
  weaknesses: string;
  visualDNA: {
    ethnicityOrSpecies: string;
    hairColorStyle: string;
    eyeColor: string;
    distinctiveFeatures: string;
    attire: string;
    overallVibe: string;
  };
  characterArc: {
    startingState: string;
    catalyst: string;
    climaxShift: string;
    endingState: string;
  };
  relationships: CharacterRelationship[];
  expressions: string[];
  futureDevelopment: string;
}

export interface WorldBible {
  universeName: string;
  settingOverview: string;
  lore: string;
  magicOrTechSystem: string;
  timeline: { yearOrEra: string; event: string }[];
  locations: { name: string; description: string; significance: string }[];
  factionsOrPolitics: string;
  religionsOrBeliefs: string;
  architectureAndCulture: string;
  languagesAndIdioms: string[];
  rulesOfUniverse: string[];
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  synopsis: string;
  content: string;
  wordCount: number;
  illustrationBrief: {
    sceneDescription: string;
    visualFocus: string;
    midjourneyPrompt: string;
    dallePrompt: string;
  };
  readabilityScore: number;
  status: 'Draft' | 'Council Review' | 'Polished' | 'Approved';
  authorFormulaApplied?: string;
  povCharacter?: string;
  cliffhangerHook?: string;
  tickingClockNote?: string;
  pattersonCompliance?: PattersonComplianceReport;
  attachedVideoUrl?: string;
  attachedAudioUrl?: string;
  attachedAudioTitle?: string;
  attachedIllustrationUrl?: string;
}

export type AuthorFormulaId = 
  | 'james-patterson'
  | 'dan-brown'
  | 'stephen-king'
  | 'brandon-sanderson'
  | 'agatha-christie'
  | 'colleen-hoover'
  | 'michael-crichton'
  | 'lee-child'
  | 'gillian-flynn'
  | 'malcolm-gladwell'
  | 'custom-clone';

export interface AuthorFormulaProfile {
  id: AuthorFormulaId | string;
  authorName: string;
  formulaTitle: string;
  bestsellerCredentials: string;
  pacingVelocity: 'relentless-hyper' | 'ticking-clock' | 'slow-burn-dread' | 'convergent-avalanche' | 'cerebral-methodical' | 'emotional-cyclone';
  targetChapterWordCount: { min: number; max: number; typical: number };
  cliffhangerMandate: boolean;
  cliffhangerRuleDescription: string;
  coreRules: Array<{ ruleNumber: number; title: string; mechanism: string; whyItWorks: string }>;
  povStructure: string;
  fluffTolerance: 'zero-tolerance' | 'spartan' | 'rich-atmospheric' | 'tactile-observant';
  dialogueRatioPercent: number;
  keyTechniques: string[];
  sampleOpeningHook: string;
  sampleEndingCliffhanger: string;
  formulaColor: string;
  avatar: string;
}

export interface PattersonComplianceReport {
  overallScore: number; // 0-100
  overallGrade: 'A+ (Patterson Masterpiece)' | 'A (NYT Page Turner)' | 'B (Good Suspense)' | 'C (Too Much Fluff)';
  wordCountScore: {
    count: number;
    targetMin: number;
    targetMax: number;
    pass: boolean;
    feedback: string;
  };
  cliffhangerAudit: {
    detected: boolean;
    intensity: number; // 0-100
    cliffhangerSentence: string;
    tensionLevel: 'Mild' | 'High' | 'Heart-Stopping';
    feedback: string;
  };
  fluffDetection: {
    fluffPercentage: number;
    fillerSentencesFound: string[];
    propulsionRating: number; // 0-100
    verdict: string;
  };
  pacingVelocity: number; // 0-100
  povIronyRating: number; // 0-100
  pattersonRulesFollowed: string[];
  recommendations: string[];
}

export interface FormulaOutlineBeat {
  chapterNumber: number;
  title: string;
  pov: string;
  tickingClock: string;
  coreConflict: string;
  cliffhangerBeat: string;
  wordTarget: number;
  status: 'planned' | 'drafted' | 'polished';
}

export interface AuthorVoiceConfig {
  selectedFormulaId: AuthorFormulaId | string;
  enforcePattersonRules: boolean;
  targetChapterWords: number; // Default: 800 (Patterson style)
  pacingDial: number; // 0-100 (Default: 95)
  cliffhangerSeverity: number; // 0-100 (Default: 90)
  fluffRemoverStrength: number; // 0-100 (Default: 85)
  dualPovMode: boolean; // Protagonist vs Antagonist
  customAuthorName?: string;
  customSampleText?: string;
  customVoiceFingerprint?: {
    syntaxCadence: string;
    vocabularyGrade: string;
    dialogueStyle: string;
    sensoryPalette: string[];
    narrativePacing: string;
  };
}

export interface BookManuscript {
  title: string;
  subtitle: string;
  targetAge: AgeGroup;
  genre: BookGenre;
  theme: string;
  educationalGoals: string[];
  wordCountTotal: number;
  readingLevelGrade: string;
  synopsis: string;
  chapters: Chapter[];
}

export interface IllustrationGuide {
  styleGuideName: string;
  artStyleDescription: string;
  colorPalette: string[];
  characterSheets: {
    characterId: string;
    characterName: string;
    visualDNA: string;
    modelPrompt: string;
    imageUrl?: string;
  }[];
  scenePrompts: {
    sceneId: string;
    chapterNumber: number;
    description: string;
    midjourneyPrompt: string;
    imageUrl?: string;
  }[];
  coverBrief: {
    title: string;
    subtitle: string;
    coverArtPrompt: string;
    typographyStyle: string;
    coverImageUrl?: string;
  };
  storyboardGuides: {
    panelNumber: number;
    cameraAngle: string;
    actionDescription: string;
  }[];
}

export interface QualityScorecard {
  overallScore: number; // 0-100
  readabilityIndex: number;
  fleschKincaidScore: number;
  lexileEstimate: string;
  emotionalImpactScore: number;
  educationalScaffoldingScore: number;
  characterConsistencyScore: number;
  pacingScore: number;
  franchisePotential: number;
  grammarAlerts: string[];
  continuityAlerts: string[];
  marketReadiness: 'Drafting' | 'Good Progress' | 'Publish-Ready' | 'Masterpiece Standard';
}

export interface PublishingMetadata {
  kdpTitle: string;
  kdpSubtitle: string;
  authorName: string;
  penName: string;
  seriesName: string;
  seriesVolume: number;
  bisacCategories: string[];
  amazonKeywords: string[];
  bookDescriptionHtml: string;
  isbn: string;
  printFormat: {
    trimSize: '5x8' | '6x9' | '8.5x8.5' | '8.5x11';
    paperType: 'White' | 'Cream' | 'Premium Color';
    bleed: boolean;
    coverFinish: 'Matte' | 'Glossy';
  };
  priceUSD: number;
  estimatedRoyaltyPerSaleUSD: number;
}

export interface MarketingPack {
  amazonBlurb: string;
  tagline: string;
  socialPosts: { platform: string; caption: string; hashtags: string[] }[];
  emailCampaigns: { stage: string; subject: string; body: string }[];
  pressRelease: string;
  blogArticles: { title: string; outline: string }[];
  launchTimeline: { day: string; task: string }[];
}

export interface VideoNarrationPack {
  narrationVoice: string;
  sampleScriptText: string;
  storyboardPrompts: { timecode: string; visualPrompt: string; audioText: string }[];
  tiktokReelsScripts: { hook: string; script: string; visualNotes: string }[];
  trailerScript: string;
}

export type CartoonStyle = 
  | '2d-classic' 
  | '3d-pixar' 
  | 'anime-chibi' 
  | 'studio-ghibli'
  | 'sketch'
  | 'claymation' 
  | 'rubber-hose' 
  | 'storybook-popup';

export interface CartoonDialogue {
  id: string;
  speaker: string;
  text: string;
  emotion: 'excited' | 'puzzled' | 'brave' | 'mischievous' | 'whispering' | 'laughing';
  voicePitch: number;
  voiceRate: number;
  startSec: number;
  durationSec: number;
}

export interface CartoonSoundEffect {
  id: string;
  sfxType: 'boing' | 'magic-sparkle' | 'clockwork-whir' | 'whoosh' | 'pop' | 'fanfare' | 'ticking' | 'giggle-slide';
  timestampSec: number;
  label: string;
}

export interface CartoonCharacterMotion {
  characterId: string;
  characterName: string;
  positionX: number; // 0 to 100%
  positionY: number; // 0 to 100%
  scale: number; // 0.5 to 2.0
  action: 'talking' | 'waving' | 'jumping' | 'examining' | 'running' | 'idle' | 'floating';
  faceExpression: 'happy' | 'surprised' | 'focused' | 'mischievous' | 'talking' | 'brave';
}

export interface CartoonScene {
  id: string;
  sceneNumber: number;
  title: string;
  duration: number; // in seconds
  visualDescription: string;
  cameraMotion: 'pan-right' | 'pan-left' | 'zoom-in' | 'zoom-out' | 'dramatic-shake' | 'tracking-shot' | 'static';
  transition: 'iris-wipe' | 'star-wipe' | 'bounce-pop' | 'cross-dissolve' | 'slide-left';
  backgroundTheme: 'workshop_vault' | 'clockwork_citadel' | 'backward_river' | 'celestial_observatory' | 'enchanted_forest' | 'steam_laboratory' | 'mystic_canyon' | 'sky_docks';
  characters: CartoonCharacterMotion[];
  dialogue: CartoonDialogue[];
  soundEffects: CartoonSoundEffect[];
  ambientParticles: 'sparkles' | 'floating_gears' | 'bubbles' | 'stars' | 'leaves' | 'none';
  visualPrompt: string;
  generatedFrameUrl?: string;
}

export interface CartoonEpisode {
  id: string;
  title: string;
  chapterId?: string;
  chapterTitle?: string;
  animationStyle: CartoonStyle;
  aspectRatio: '16:9' | '9:16' | '1:1';
  totalDuration: number;
  fps: number;
  voiceNarrator: string;
  bgmTrack: 'Upbeat Cartoon Bounce' | 'Whimsical Adventure' | 'Mystery Clockwork' | 'Playful Shenanigans' | 'Heroic Fanfare';
  scenes: CartoonScene[];
  generatedAt: string;
  videoUrl?: string;
}

export interface MerchPack {
  tShirtPrompts: { title: string; designPrompt: string }[];
  mugPrompts: { title: string; designPrompt: string }[];
  activityPages: { title: string; type: 'coloring' | 'maze' | 'wordsearch' | 'puzzle'; promptOrText: string }[];
  printableTeacherGuide: string;
}

export interface AnalyticsSim {
  projectedSalesMonth1: number;
  projectedRoyaltiesMonth1USD: number;
  readThroughRatePercent: number;
  targetAudienceMatchPercent: number;
  mockReviews: { reviewerName: string; rating: number; reviewText: string; verifiedPurchase: boolean }[];
}

export interface PublishingProject {
  id: string;
  name: string;
  goal: string;
  targetAge: AgeGroup;
  genre: BookGenre;
  theme: string;
  mode: 'beginner' | 'professional';
  currentStep: number;
  status: 'In Research' | 'In Council Review' | 'Drafting' | 'Illustrating' | 'Formatting' | 'Publish Ready';
  createdAt: string;
  updatedAt: string;
  
  manuscript: BookManuscript;
  worldBible: WorldBible;
  characters: CharacterProfile[];
  illustrationGuide: IllustrationGuide;
  scorecard: QualityScorecard;
  publishingMetadata: PublishingMetadata;
  marketingPack: MarketingPack;
  videoPack: VideoNarrationPack;
  merchPack: MerchPack;
  analytics: AnalyticsSim;
  councilDebate: CouncilDebateEntry[];
  cartoonEpisodes?: CartoonEpisode[];
  authorMachineConfig?: AuthorVoiceConfig;
  formulaOutline?: FormulaOutlineBeat[];
  storyforge2Ledger?: StoryForge2StageStatus[];
  coverSpec?: CoverSpecResult;
  milestones?: ProjectMilestone[];
}

export type StoryForge2StageId =
  | 'BRIEF_INGEST'
  | 'MANUSCRIPT_GENERATE'
  | 'MANUSCRIPT_VALIDATE'
  | 'LAYOUT_PLAN'
  | 'ILLUSTRATIONS_GENERATE'
  | 'COVER_CALCULATE'
  | 'COVER_RENDER'
  | 'EPUB_COMPILE'
  | 'EPUB_VALIDATE'
  | 'PDF_COMPILE'
  | 'PDF_VALIDATE'
  | 'MARKETING_PACKAGE'
  | 'VIDEO_COMMERCIAL_GENERATE'
  | 'HUMAN_APPROVAL_GATE'
  | 'DISTRIBUTION_DISPATCH';

export interface StoryForge2StageStatus {
  stage: StoryForge2StageId;
  name: string;
  category: 'Foundation' | 'Manuscript' | 'Visual & Layout' | 'Cover Package' | 'Export & QA' | 'Marketing & Video' | 'Distribution';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'RETRYING' | 'SKIPPED';
  durationMs?: number;
  outputSummary?: string;
  violations?: string[];
  lastRunAt?: string;
}

export interface CoverSpecResult {
  trimWidthIn: number;
  trimHeightIn: number;
  pageCount: number;
  paperType: 'white' | 'cream';
  spineWidthIn: number;
  bleedIn: number;
  includeSpineText: boolean;
  frontCoverWidthIn: number;
  frontCoverHeightIn: number;
  fullWrapWidthIn: number;
  fullWrapHeightIn: number;
  variants: {
    id: string;
    name: string;
    dimensions: string;
    format: string;
    purpose: string;
  }[];
}

export interface PlatformCapabilityInfo {
  platformId: string;
  name: string;
  type: 'direct_api' | 'approved_partner' | 'draft_export';
  authMethod: string;
  notes: string;
  supportedFormats: string[];
  status: 'ready' | 'connected' | 'export_only' | 'sandbox';
}

export interface PattersonMechanicalValidation {
  readingLevel: 'MG' | 'YA' | 'ADULT';
  targetWords: number;
  wordCount: number;
  wordCountPass: boolean;
  dialogueRatio: number;
  dialoguePass: boolean;
  sentenceLengthAvg: number;
  sentenceLengthPass: boolean;
  passiveVoicePercent: number;
  passiveVoicePass: boolean;
  cliffhangerType: 'revelation' | 'reversal' | 'escalation' | 'question' | 'threat' | 'none';
  cliffhangerDetected: string;
  violations: string[];
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  complianceScore: number;
}

export type AISubscriptionProvider = 'gemini' | 'claude_subscription' | 'chatgpt_subscription' | 'ollama_local' | 'nvidia';

export interface AISubscriptionConfig {
  activeProvider: AISubscriptionProvider;
  claude: {
    connected: boolean;
    sessionKey?: string;
    plan: 'Claude Pro' | 'Claude Team' | 'Claude Enterprise' | 'Free' | 'Disconnected';
    preferredModel: 'claude-3-5-sonnet-latest' | 'claude-3-opus' | 'claude-3-5-haiku';
    mcpActive: boolean;
    mcpServerUrl: string;
    lastPingMs?: number;
    lastConnectedAt?: string;
  };
  chatgpt: {
    connected: boolean;
    sessionToken?: string;
    plan: 'ChatGPT Plus' | 'ChatGPT Pro' | 'ChatGPT Team' | 'Free' | 'Disconnected';
    preferredModel: 'gpt-4o' | 'o1' | 'o1-mini' | 'gpt-4o-mini';
    customGptActionActive: boolean;
    openApiSchemaUrl: string;
    lastPingMs?: number;
    lastConnectedAt?: string;
  };
  nvidia: {
    connected: boolean;
    apiKey?: string;
    plan: 'NVIDIA Developer NIM' | 'NVIDIA Enterprise AI' | 'NVIDIA Cloud DGX' | 'Free Sandbox';
    preferredModel: 'nvidia/llama-3.3-70b-instruct' | 'nvidia/nemotron-4-340b-instruct' | 'nvidia/mistral-nemo-12b-instruct' | 'nvidia/cosmos-nemotron-34b' | 'meta/llama-3.1-405b-instruct';
    nimEndpoint: string;
    lastPingMs?: number;
    lastConnectedAt?: string;
  };
  lastTestLog?: {
    provider: AISubscriptionProvider;
    success: boolean;
    latencyMs: number;
    message: string;
    timestamp: string;
  };
}

export interface ProjectMilestone {
  id: string;
  phaseNumber: number;
  title: string;
  subtitle: string;
  category: 'Foundation' | 'Architecture' | 'Manuscript' | 'Visuals' | 'Production' | 'Distribution';
  stages: number[];
  sf2Stages: StoryForge2StageId[];
  targetDaysFromStart: number;
  targetDeadline: string;
  startDate?: string;
  startDay?: number;
  durationDays?: number;
  owner?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | 'AT_RISK' | 'BLOCKED';
  progressPercent: number;
  criticalPath: boolean;
  deliverables: { id: string; label: string; completed: boolean; requiredForNext: boolean }[];
  dependsOnMilestoneId?: string;
}

export type AIKeyProviderId = 'nvidia' | 'anthropic' | 'openai' | 'groq';

export interface ProviderModelOption {
  id: string;
  name: string;
  contextWindow: string;
  speedTps: string;
  recommendedFor: string;
}

export interface ProviderKeyItem {
  id: AIKeyProviderId;
  name: string;
  displayName: string;
  tagline: string;
  keyPrefix: string;
  keyPlaceholder: string;
  docsUrl: string;
  apiKey: string;
  isConfigured: boolean;
  selectedModel: string;
  availableModels: ProviderModelOption[];
  endpoint: string;
  defaultEndpoint: string;
  status: 'unconfigured' | 'valid' | 'testing' | 'error';
  lastTestedAt?: string;
  latencyMs?: number;
  statusMessage?: string;
}

export interface ApplicationApiKeysState {
  activeProviderId: AIKeyProviderId;
  keys: Record<AIKeyProviderId, string>;
  selectedModels: Record<AIKeyProviderId, string>;
  customEndpoints?: Partial<Record<AIKeyProviderId, string>>;
  autoFallbackToGemini: boolean;
  lastUpdated?: string;
}

export interface ProviderUsageMetric {
  providerId: AIKeyProviderId;
  providerName: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  creditAllowance: number;
  creditsUsed: number;
  creditUnit: string;
  averageLatencyMs: number;
  lastUsedAt?: string;
  rateLimitPercent: number;
  tierName: string;
}

export interface ProviderCallLogItem {
  id: string;
  timestamp: string;
  providerId: AIKeyProviderId;
  model: string;
  promptSnippet: string;
  tokensPrompt: number;
  tokensCompletion: number;
  totalTokens: number;
  latencyMs: number;
  costUsd: number;
  status: 'success' | 'error';
}

export interface GlobalUsageStatistics {
  providers: Record<AIKeyProviderId, ProviderUsageMetric>;
  totalTokensAllProviders: number;
  totalRequestsAllProviders: number;
  totalCostUsdAllProviders: number;
  recentCalls: ProviderCallLogItem[];
  lastResetAt: string;
}



