import React, { useState, useRef, useEffect } from 'react';
import { PublishingProject, Chapter } from '../types/storyforge';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Download,
  BookOpen,
  ArrowRight,
  Zap,
  Cpu,
  Flame,
  ShieldAlert,
  Sliders,
  Award,
  Layers,
  ChevronDown,
  Globe,
  Search,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export type GeminiModel = 'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite';

export interface GroundingData {
  webSearchQueries?: string[];
  sources?: Array<{ title?: string; url?: string; snippet?: string }>;
  isGrounded?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelUsed?: GeminiModel | string;
  timestamp: string;
  specialistName?: string;
  specialistAvatar?: string;
  grounding?: GroundingData;
}

export interface SpecialistPersona {
  id: string;
  name: string;
  title: string;
  avatar: string;
  badgeColor: string;
  systemInstruction: string;
  defaultPrompt: string;
  recommendedModel: GeminiModel;
}

export const SPECIALIST_PERSONAS: SpecialistPersona[] = [
  {
    id: 'prof-quill',
    name: 'Professor Quill',
    title: 'Dean of Story Architecture',
    avatar: '🧙‍♂️',
    badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    recommendedModel: 'gemini-4-argon',
    defaultPrompt: 'Evaluate the overarching story arc, thematic depth, and chapter progression of Little Zeus.',
    systemInstruction: `You are Professor Quill, Dean of Literature and Master Story Architect of the Grand Literary Council.
Your role: Provide rigorous, scholarly, and practical story architecture analysis.
Analyze: 3-act narrative structure, character transformational arcs, thematic resonance, pacing rhythm, and thematic motifs.
Format your responses with clear conceptual headers, specific bullet-point observations, and concrete scene rewriting suggestions.
Be encouraging yet unapologetically uncompromising about narrative excellence.`
  },
  {
    id: 'lady-ink',
    name: 'Lady Ink',
    title: 'Dialogue & Vernacular Subtext Specialist',
    avatar: '✒️',
    badgeColor: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    recommendedModel: 'gemini-3.8-flash',
    defaultPrompt: 'Polish the banter and dialogue rhythm between Little Zeus and Athena in Chapter 1.',
    systemInstruction: `You are Lady Ink, Dialogue Specialist of the Grand Literary Council.
Your role: Master of subtext, vernacular cadence, snappy banter, and distinctive character speech fingerprints.
Analyze: Dialogue-to-narrative ratios (target 40-50%), conversational subtext, unique vocabulary per character, and emotional pacing.
Rewrite flat dialogue into crackling, distinct, and memorable interactions. Avoid generic tags; let the lines reveal the subtext.`
  },
  {
    id: 'captain-grimm',
    name: 'Captain Grimm',
    title: 'Patterson Pacing & Cliffhanger Master',
    avatar: '⚔️',
    badgeColor: 'border-red-500/40 bg-red-500/10 text-red-300',
    recommendedModel: 'gemini-4-argon',
    defaultPrompt: 'How can we ramp up the stakes and make the ending of Chapter 1 an irresistible page-turner?',
    systemInstruction: `You are Captain Grimm, Action and High-Stakes Specialist enforcing the James Patterson Book Formula.
Your role: Maximum narrative momentum, escalating conflict, sudden reversals, ticking clocks, and irresistible cliffhanger hooks.
Analyze: Sentence cadence, sensory kinetic action, micro-tension in every paragraph, and ensuring every single chapter ends on a cliffhanger hook that forces the reader to flip the page.
Be punchy, direct, and uncompromising on pacing.`
  },
  {
    id: 'archivist-atlas',
    name: 'Archivist Atlas',
    title: 'World Bible & Lore Consistency Guard',
    avatar: '📜',
    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    recommendedModel: 'gemini-4-argon',
    defaultPrompt: 'Audit the consistency of Olympus lore, thunderbolt sparks, and mythological rules in our manuscript.',
    systemInstruction: `You are Archivist Atlas, Lorekeeper and World Bible Continuity Guard of the Grand Literary Council.
Your role: Total continuity, internal logic, magic/technology laws, mythological consistency, and geographic precision.
Check: Consistency with character profiles, setting rules, established limitations of divine powers, and historical/mythological grounding.
Flag any plot holes or continuity slips with surgical precision.`
  },
  {
    id: 'doctor-heart',
    name: 'Doctor Heart',
    title: 'Emotional Arc & Character Psychology',
    avatar: '❤️',
    badgeColor: 'border-pink-500/40 bg-pink-500/10 text-pink-300',
    recommendedModel: 'gemini-3.8-flash',
    defaultPrompt: 'How can we deepen Little Zeus\'s internal fear of not living up to his father\'s expectations?',
    systemInstruction: `You are Doctor Heart, Emotional Arc & Character Psychology Specialist of the Grand Literary Council.
Your role: Deep emotional resonance, relatable vulnerabilities, child psychology, internal conflict, and authentic relationships.
Analyze: The character's core wound, their external want vs internal need, moments of vulnerability, and emotional payoffs.
Help craft scenes that make readers care deeply about the characters.`
  },
  {
    id: 'prof-curiosity',
    name: 'Professor Curiosity',
    title: 'Middle-Grade Wonder & Playful Adventure',
    avatar: '✨',
    badgeColor: 'border-teal-500/40 bg-teal-500/10 text-teal-300',
    recommendedModel: 'gemini-3.1-flash-lite',
    defaultPrompt: 'Give me 5 fast, whimsical chapter title ideas with kid-friendly adventure energy.',
    systemInstruction: `You are Professor Curiosity, specialist in Middle-Grade (MG) and Children's Literature Wonder.
Your role: Sparks of joy, sensory wonder, age-appropriate humor, pedagogical scaffolding, and engaging adventure.
Ensure readability aligns with target grade levels, humor lands without being condescending, and the magic sparks authentic curiosity.
Respond quickly, creatively, and with boundless enthusiastic energy.`
  },
  {
    id: 'prof-finish',
    name: 'Professor Finish',
    title: 'KDP Best-Seller & Market Masterpiece Control',
    avatar: '🛡️',
    badgeColor: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    recommendedModel: 'gemini-3.8-flash',
    defaultPrompt: 'Write an irresistible Amazon KDP book blurb and marketing bullet points for this book.',
    systemInstruction: `You are Professor Finish, Executive Quality Control and Best-Seller Strategy Specialist.
Your role: Commercial positioning, Amazon KDP blurb optimization, hook craft, BISAC targeting, and market readiness.
Deliver high-converting copywriting, competitive title analyses, and actionable polish to make manuscripts commercial triumphs.`
  }
];

interface GeminiChatbotStudioProps {
  project?: PublishingProject;
  onApplyToChapter?: (chapterId: string, snippet: string) => void;
}

export const GeminiChatbotStudio: React.FC<GeminiChatbotStudioProps> = ({
  project,
  onApplyToChapter
}) => {
  // Model state: defaults to gemini-3.8-flash, with 4-argon for complex and 3.1-flash-lite for fast
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-3.8-flash');
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(true);
  const [activePersona, setActivePersona] = useState<SpecialistPersona>(SPECIALIST_PERSONAS[0]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Target chapter for text insertion
  const chapters = project?.manuscript?.chapters || [];
  const [targetChapterId, setTargetChapterId] = useState<string>(chapters[0]?.id || '');

  // Conversation history in a scrollable thread
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `Greetings, author! I am **${SPECIALIST_PERSONAS[0].name}**, ${SPECIALIST_PERSONAS[0].title}.\n\nI am connected via **${selectedModel}** to assist you with deep narrative architecture, plot beats, and character consistency for *"Little Zeus Gets His Thunderbolt"*. How may the Council assist your manuscript today?`,
      modelUsed: 'gemini-4-argon',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      specialistName: SPECIALIST_PERSONAS[0].name,
      specialistAvatar: SPECIALIST_PERSONAS[0].avatar
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle switching persona
  const handleSelectPersona = (persona: SpecialistPersona) => {
    setActivePersona(persona);
    setSelectedModel(persona.recommendedModel);

    // Add persona greeting message
    const greetingMsg: ChatMessage = {
      id: `greet-${Date.now()}`,
      role: 'model',
      text: `*${persona.avatar} ${persona.name} (${persona.title}) steps forward to take the floor.*\n\n"I am ready to review your work through the lens of ${persona.title.toLowerCase()}. You can ask me to evaluate scenes, rewrite dialogue, or brainstorm narrative developments."`,
      modelUsed: persona.recommendedModel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      specialistName: persona.name,
      specialistAvatar: persona.avatar
    };
    setMessages((prev) => [...prev, greetingMsg]);
  };

  // Copy text helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear conversation
  const handleClearHistory = () => {
    if (window.confirm('Clear current chat conversation history?')) {
      setMessages([
        {
          id: `reset-${Date.now()}`,
          role: 'model',
          text: `Conversation cleared. **${activePersona.name}** is standing by for your next question.`,
          modelUsed: selectedModel,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          specialistName: activePersona.name,
          specialistAvatar: activePersona.avatar
        }
      ]);
    }
  };

  // Export transcript as Markdown
  const handleExportTranscript = () => {
    const transcript = messages
      .map((m) => `### ${m.role === 'user' ? 'Author' : m.specialistName || 'Gemini'} (${m.timestamp} - ${m.modelUsed || 'AI'})\n\n${m.text}\n`)
      .join('\n---\n\n');

    const blob = new Blob([transcript], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `literary_council_chat_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    // Append user message to history
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      // Build conversation payload for multi-turn chat
      const chatPayload = updatedHistory
        .filter((m) => !m.id.startsWith('greet-') && !m.id.startsWith('reset-'))
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.text
        }));

      // Enrich system instruction with book context
      const enrichedSystemInstruction = `${activePersona.systemInstruction}

CURRENT BOOK PROJECT CONTEXT:
Book Title: "${project?.name || 'Little Zeus Gets His Thunderbolt'}"
Genre: ${project?.genre || 'Middle-Grade Greek Mythology Adventure'}
Target Age: ${project?.targetAge || 'Middle Grade (8-12)'}
Chapters in Project: ${chapters.length} chapters
Patterson Formula: 40-50% dialogue, fast 400-500 word chapters, ending with a cliffhanger hook.`;

      const effectiveModel = useSearchGrounding ? 'gemini-3.8-flash' : selectedModel;

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatPayload,
          model: effectiveModel,
          systemInstruction: enrichedSystemInstruction,
          temperature: effectiveModel === 'gemini-4-argon' ? 0.6 : 0.7,
          useSearch: useSearchGrounding
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.text || 'The Council has reviewed your inquiry and is formulating recommendations.';

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: replyText,
        modelUsed: data.modelUsed || effectiveModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        specialistName: activePersona.name,
        specialistAvatar: activePersona.avatar,
        grounding: data.grounding
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `*${activePersona.avatar} ${activePersona.name} pauses to consider:*\n\n"${err.message || 'Unable to connect to model service'}. Let us continue our narrative discussion."`,
        modelUsed: selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        specialistName: activePersona.name,
        specialistAvatar: activePersona.avatar
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 select-none">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-br from-indigo-500/20 to-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Bot className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Gemini Multi-Turn Chatbot
                <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  Triple-Tier AI Engine
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Multi-turn editorial debate with specialist AI personas using <strong>gemini-4-argon</strong>, <strong>gemini-3.8-flash</strong>, and <strong>gemini-3.1-flash-lite</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Global Chat Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTranscript}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title="Download full chat log as Markdown"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Chat (.md)</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Clear message thread"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Search Grounding Banner / Toggle */}
      <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        useSearchGrounding
          ? 'bg-gradient-to-r from-sky-950/70 via-indigo-950/40 to-slate-900 border-sky-500/40 shadow-lg shadow-sky-500/10'
          : 'bg-slate-900/70 border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <span className={`p-2.5 rounded-xl transition-all ${
            useSearchGrounding ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-800 text-slate-400'
          }`}>
            <Globe className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">Google Search Grounding</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                useSearchGrounding
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}>
                {useSearchGrounding ? 'Active • gemini-3.8-flash' : 'Disabled'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {useSearchGrounding
                ? 'Grounds responses in verified, real-time web citations using gemini-3.8-flash with googleSearch tool.'
                : 'Enable to retrieve up-to-date Amazon KDP comps, reader trends, and verified scientific/historical facts.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const next = !useSearchGrounding;
            setUseSearchGrounding(next);
            if (next) setSelectedModel('gemini-3.8-flash');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            useSearchGrounding
              ? 'bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-md shadow-sky-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>{useSearchGrounding ? 'Search Grounding: ON' : 'Enable Search Grounding'}</span>
        </button>
      </div>

      {/* Model Selection Bar (Triple Tier: Argon, Flash, Flash-Lite) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Gemini Model Tier</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Active: <strong className="text-amber-400">{selectedModel}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* 1. gemini-4-argon */}
          <button
            onClick={() => setSelectedModel('gemini-4-argon')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedModel === 'gemini-4-argon'
                ? 'border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/10'
                : 'border-slate-800 bg-slate-950/80 hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-indigo-400" />
                <span>gemini-4-argon</span>
              </span>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.5 rounded">
                Complex Tasks
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Deep reasoning, complex narrative architecture, psychological depth, and lore consistency.
            </p>
          </button>

          {/* 2. gemini-3.8-flash */}
          <button
            onClick={() => setSelectedModel('gemini-3.8-flash')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedModel === 'gemini-3.8-flash'
                ? 'border-amber-500 bg-amber-500/15 shadow-lg shadow-amber-500/10'
                : 'border-slate-800 bg-slate-950/80 hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>gemini-3.8-flash</span>
              </span>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded">
                General Tasks
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Balanced speed and creative brilliance for scene writing, dialogue polish, and pacing critique.
            </p>
          </button>

          {/* 3. gemini-3.1-flash-lite */}
          <button
            onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedModel === 'gemini-3.1-flash-lite'
                ? 'border-emerald-500 bg-emerald-500/15 shadow-lg shadow-emerald-500/10'
                : 'border-slate-800 bg-slate-950/80 hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>gemini-3.1-flash-lite</span>
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                Fast Tasks
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Ultra-low latency for instant brainstorms, rapid chapter titles, grammar checks, and punchy summaries.
            </p>
          </button>
        </div>
      </div>

      {/* Specialist Personas Roster (Role-Based System Instructions) */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-indigo-400" />
          <span>Active Council Specialist Role (System Instruction Persona)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {SPECIALIST_PERSONAS.map((persona) => (
            <button
              key={persona.id}
              onClick={() => handleSelectPersona(persona)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                activePersona.id === persona.id
                  ? `${persona.badgeColor} shadow-md`
                  : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-lg mb-1">{persona.avatar}</div>
              <p className="text-xs font-bold truncate">{persona.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{persona.title.split('&')[0]}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Thread */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Active Persona Sub-header */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">{activePersona.avatar}</span>
            <div>
              <span className="font-bold text-white">{activePersona.name}</span>
              <span className="text-slate-400 ml-1.5">({activePersona.title})</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-400">Model:</span>
            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {selectedModel}
            </span>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="p-5 overflow-y-auto max-h-[500px] min-h-[380px] space-y-4 no-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Persona Avatar if Model */}
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-base shadow">
                  {msg.specialistAvatar || '🤖'}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-md text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium'
                    : 'bg-slate-950 border border-slate-800 text-slate-200'
                }`}
              >
                {/* Header for Model messages */}
                {msg.role === 'model' && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[10px] text-slate-400 font-mono">
                    <span className="font-bold text-slate-300">
                      {msg.specialistName || 'Council Specialist'}
                    </span>
                    <div className="flex items-center gap-2">
                      {msg.modelUsed && (
                        <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          {msg.modelUsed}
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                )}

                {/* Message Body (with whitespace and markdown support) */}
                <div className="whitespace-pre-wrap select-text">{msg.text}</div>

                {/* Google Search Grounding Verification Box */}
                {msg.grounding?.isGrounded && (
                  <div className="mt-3 p-3 bg-sky-950/40 border border-sky-500/30 rounded-xl space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-300 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-sky-400" />
                        <span>Google Search Grounded (gemini-3.8-flash)</span>
                      </span>
                      <span className="text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Verified Grounding
                      </span>
                    </div>

                    {msg.grounding.webSearchQueries && msg.grounding.webSearchQueries.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Google Search Queries:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.grounding.webSearchQueries.map((q, qIdx) => (
                            <span
                              key={qIdx}
                              className="px-2 py-0.5 bg-slate-900 border border-slate-700/80 rounded text-[10px] text-sky-200 flex items-center gap-1"
                            >
                              <Search className="w-2.5 h-2.5 text-sky-400" />
                              <span>{q}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.grounding.sources && msg.grounding.sources.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Verified Sources & Citations:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.grounding.sources.map((s, sIdx) => (
                            <a
                              key={sIdx}
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-sky-500/30 hover:border-sky-400 text-sky-300 rounded text-[10px] flex items-center gap-1 transition-colors"
                            >
                              <ExternalLink className="w-2.5 h-2.5 text-sky-400" />
                              <span className="truncate max-w-[200px]">{s.title || s.url}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Actions on Model Messages */}
                {msg.role === 'model' && (
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-[11px]">
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      title="Copy response to clipboard"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {/* Send snippet to Manuscript */}
                    {chapters.length > 0 && onApplyToChapter && (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={targetChapterId}
                          onChange={(e) => setTargetChapterId(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300"
                        >
                          {chapters.map((ch) => (
                            <option key={ch.id} value={ch.id}>
                              Ch {ch.chapterNumber}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            onApplyToChapter(targetChapterId, msg.text);
                            const chNum = chapters.find(c => c.id === targetChapterId)?.chapterNumber || 1;
                            setToastMessage(`Content applied to Chapter ${chNum}!`);
                            setTimeout(() => setToastMessage(null), 3000);
                          }}
                          className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-transform"
                        >
                          <span>Apply</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base">
                {activePersona.avatar}
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>
                  {activePersona.name} is reasoning with {selectedModel}...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-5 py-2.5 border-t border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">
            Prompt Ideas:
          </span>
          {[
            '🌐 2026 Middle-Grade Fantasy Bestsellers (Google Search)',
            '🌐 Amazon KDP Greek & Roman Myth Comps & Pricing (Google Search)',
            '🌐 Scientific Physics of Lightning & Thunder Shockwaves',
            activePersona.defaultPrompt,
            'Audit Chapter 1 cliffhanger pacing',
            '5 high-concept book titles for this project'
          ].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => setInputMessage(suggestion)}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] px-2.5 py-1 rounded-lg whitespace-nowrap truncate max-w-xs transition-colors flex items-center gap-1"
            >
              {suggestion.startsWith('🌐') && <Globe className="w-2.5 h-2.5 text-sky-400 shrink-0" />}
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="mx-4 mt-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Message Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={2}
              placeholder={`Ask ${activePersona.name} (${selectedModel})... Press Enter to send, Shift+Enter for new line`}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all self-stretch justify-center"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
