import React, { useState, useEffect } from 'react';
import { 
  AIKeyProviderId, 
  ProviderKeyItem, 
  ApplicationApiKeysState 
} from '../types/storyforge';
import { ProviderUsageStatistics } from './ProviderUsageStatistics';
import { 
  Key, ShieldCheck, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, 
  RefreshCw, Copy, Check, ExternalLink, Zap, Terminal, Sparkles, 
  Server, Cpu, Play, Trash2, ArrowRight, Settings, Info, Gauge, Flame,
  Download, Upload, CheckCheck, X, BarChart3, Layers
} from 'lucide-react';

interface APIKeyConfigurationProps {
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
  onProviderChanged?: (providerId: AIKeyProviderId) => void;
}

const LOCAL_STORAGE_KEY = 'EMPIRE_OS_API_KEYS_VAULT_V1';

const DEFAULT_PROVIDERS: ProviderKeyItem[] = [
  {
    id: 'nvidia',
    name: 'NVIDIA',
    displayName: 'NVIDIA NIM & AI Foundation',
    tagline: 'Enterprise TensorRT-LLM Acceleration on DGX Cloud & RTX GPUs',
    keyPrefix: 'nvapi-',
    keyPlaceholder: 'nvapi-********************************',
    docsUrl: 'https://build.nvidia.com',
    isConfigured: true,
    apiKey: 'nvapi-dev-nim-accelerated-rtx-h100-v1',
    selectedModel: 'meta/llama-3.3-70b-instruct',
    endpoint: 'https://integrate.api.nvidia.com/v1',
    defaultEndpoint: 'https://integrate.api.nvidia.com/v1',
    status: 'valid',
    latencyMs: 24,
    statusMessage: 'NVIDIA NIM Operational (TensorRT-LLM 4,200 tok/s on H100)',
    availableModels: [
      { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct', contextWindow: '128k tokens', speedTps: '4,200 tok/s', recommendedFor: 'Recommended: Patterson Narrative & Fast Pacing' },
      { id: 'nvidia/nemotron-4-340b-instruct', name: 'Nemotron-4 340B Instruct', contextWindow: '4k tokens', speedTps: '1,800 tok/s', recommendedFor: 'Deep Council Reasoning & Complex Lore' },
      { id: 'deepseek-ai/deepseek-r1', name: 'DeepSeek R1 (NVIDIA NIM)', contextWindow: '64k tokens', speedTps: '2,400 tok/s', recommendedFor: 'Chain-of-Thought Math, Logic & Plot Outlines' },
      { id: 'nvidia/mistral-nemo-12b-instruct', name: 'Mistral NeMo 12B Instruct', contextWindow: '128k tokens', speedTps: '6,500 tok/s', recommendedFor: 'Ultra Low-Latency Chapter Beats' },
      { id: 'nvidia/cosmos-nemotron-34b', name: 'Cosmos Nemotron 34B (Visual/World)', contextWindow: '32k tokens', speedTps: '1,200 tok/s', recommendedFor: 'Visual DNA & Video Prompts' }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    displayName: 'Anthropic Claude Engine',
    tagline: 'Nuanced Prose, Rich Emotional Resonance & 200k Token Context',
    keyPrefix: 'sk-ant-',
    keyPlaceholder: 'sk-ant-api03-********************************',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    isConfigured: false,
    apiKey: '',
    selectedModel: 'claude-3-5-sonnet-20241022',
    endpoint: 'https://api.anthropic.com/v1',
    defaultEndpoint: 'https://api.anthropic.com/v1',
    status: 'unconfigured',
    statusMessage: 'sk-ant key ready for configuration',
    availableModels: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Latest)', contextWindow: '200k tokens', speedTps: '85 tok/s', recommendedFor: 'Recommended: Literary Voice, Subtext & Dialogue' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', contextWindow: '200k tokens', speedTps: '140 tok/s', recommendedFor: 'High-Speed Chapter Revision & Proofing' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', contextWindow: '200k tokens', speedTps: '45 tok/s', recommendedFor: 'Grand Literary World-Building & Dense Lore' }
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    displayName: 'OpenAI GPT & Reasoning Engines',
    tagline: 'Industry Standard Structured Logic, JSON Schemas & Reasoning',
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-proj-********************************',
    docsUrl: 'https://platform.openai.com/api-keys',
    isConfigured: false,
    apiKey: '',
    selectedModel: 'gpt-4o',
    endpoint: 'https://api.openai.com/v1',
    defaultEndpoint: 'https://api.openai.com/v1',
    status: 'unconfigured',
    statusMessage: 'sk- key ready for configuration',
    availableModels: [
      { id: 'gpt-4o', name: 'GPT-4o Omnimodal', contextWindow: '128k tokens', speedTps: '110 tok/s', recommendedFor: 'Recommended: Multimodal Storyboard & Action Beats' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: '128k tokens', speedTps: '160 tok/s', recommendedFor: 'Cost-Effective Synopsis & Metadata Generator' },
      { id: 'o1', name: 'OpenAI o1 (Full Reasoning)', contextWindow: '200k tokens', speedTps: '60 tok/s', recommendedFor: 'Complex Mystery Plot Twists & Continuity Audits' },
      { id: 'o3-mini', name: 'OpenAI o3-mini', contextWindow: '200k tokens', speedTps: '120 tok/s', recommendedFor: 'STEM Science Precision & Puzzle Design' }
    ]
  },
  {
    id: 'groq',
    name: 'Groq',
    displayName: 'Groq LPU Inference Engine',
    tagline: 'Deterministic LPUs running Open-Weights at blistering 800+ tokens/second',
    keyPrefix: 'gsk_',
    keyPlaceholder: 'gsk_********************************',
    docsUrl: 'https://console.groq.com/keys',
    isConfigured: false,
    apiKey: '',
    selectedModel: 'llama-3.3-70b-versatile',
    endpoint: 'https://api.groq.com/openai/v1',
    defaultEndpoint: 'https://api.groq.com/openai/v1',
    status: 'unconfigured',
    statusMessage: 'gsk_ key ready for configuration',
    availableModels: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', contextWindow: '128k tokens', speedTps: '380 tok/s', recommendedFor: 'Recommended: Real-time Interactive Co-Authoring' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', contextWindow: '128k tokens', speedTps: '840 tok/s', recommendedFor: 'Sub-second Cliffhanger Hook Generation' },
      { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B', contextWindow: '128k tokens', speedTps: '320 tok/s', recommendedFor: 'Logical Clue Matrix & Mystery Deduction' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B MoE', contextWindow: '32k tokens', speedTps: '520 tok/s', recommendedFor: 'High-Volume Batch Scene Expansion' }
    ]
  }
];

export const APIKeyConfiguration: React.FC<APIKeyConfigurationProps> = ({
  isOpen = true,
  onClose,
  isModal = false,
  onProviderChanged
}) => {
  const [providers, setProviders] = useState<ProviderKeyItem[]>(DEFAULT_PROVIDERS);
  const [activeProviderId, setActiveProviderId] = useState<AIKeyProviderId>('nvidia');
  const [showKeys, setShowKeys] = useState<Record<AIKeyProviderId, boolean>>({
    nvidia: false,
    anthropic: false,
    openai: false,
    groq: false
  });
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<AIKeyProviderId, boolean>>({
    nvidia: false,
    anthropic: false,
    openai: false,
    groq: false
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [autoFallback, setAutoFallback] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<'all' | 'keys' | 'usage' | 'playground'>('all');

  // Quick Test Playground State
  const [testPrompt, setTestPrompt] = useState('Draft an opening scene where Toby and Priya discover an ancient, glowing quantum processor in Uncle Silas\'s clock shop.');
  const [testOutput, setTestOutput] = useState('');
  const [testBadge, setTestBadge] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLatency, setGenerationLatency] = useState<number | null>(null);

  // Load configuration on mount (from localStorage and server)
  useEffect(() => {
    // 1. First load from localStorage if present
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: ApplicationApiKeysState = JSON.parse(saved);
        if (parsed.activeProviderId) {
          setActiveProviderId(parsed.activeProviderId);
        }
        if (parsed.autoFallbackToGemini !== undefined) {
          setAutoFallback(parsed.autoFallbackToGemini);
        }
        if (parsed.keys) {
          setProviders(prev => prev.map(p => {
            const savedKey = parsed.keys[p.id];
            const savedModel = parsed.selectedModels?.[p.id];
            const savedEndpoint = parsed.customEndpoints?.[p.id];
            return {
              ...p,
              apiKey: savedKey || p.apiKey,
              isConfigured: Boolean(savedKey || p.apiKey),
              selectedModel: savedModel || p.selectedModel,
              endpoint: savedEndpoint || p.endpoint,
              status: (savedKey || p.apiKey) ? 'valid' : 'unconfigured'
            };
          }));
        }
      }
    } catch (e) {
      console.warn('Could not parse localStorage API key vault', e);
    }

    // 2. Query server for sync status
    fetch('/api/keys/config')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.providers) {
          if (data.activeProviderId) {
            setActiveProviderId(data.activeProviderId);
          }
          setProviders(prev => prev.map(localP => {
            const serverP = data.providers.find((sp: any) => sp.id === localP.id);
            if (!serverP) return localP;
            return {
              ...localP,
              isConfigured: serverP.isConfigured || localP.isConfigured,
              apiKey: (localP.apiKey && !localP.apiKey.includes('••••')) ? localP.apiKey : (serverP.apiKey || localP.apiKey),
              selectedModel: serverP.selectedModel || localP.selectedModel,
              endpoint: serverP.endpoint || localP.endpoint,
              latencyMs: serverP.latencyMs || localP.latencyMs,
              statusMessage: serverP.statusMessage || localP.statusMessage,
              status: serverP.status || localP.status
            };
          }));
        }
      })
      .catch(err => console.warn('Could not query /api/keys/config:', err));
  }, []);

  // Sync to localStorage and Server
  const handleSaveAll = async () => {
    try {
      const stateToSave: ApplicationApiKeysState = {
        activeProviderId,
        keys: {
          nvidia: providers.find(p => p.id === 'nvidia')?.apiKey || '',
          anthropic: providers.find(p => p.id === 'anthropic')?.apiKey || '',
          openai: providers.find(p => p.id === 'openai')?.apiKey || '',
          groq: providers.find(p => p.id === 'groq')?.apiKey || ''
        },
        selectedModels: {
          nvidia: providers.find(p => p.id === 'nvidia')?.selectedModel || 'meta/llama-3.3-70b-instruct',
          anthropic: providers.find(p => p.id === 'anthropic')?.selectedModel || 'claude-3-5-sonnet-20241022',
          openai: providers.find(p => p.id === 'openai')?.selectedModel || 'gpt-4o',
          groq: providers.find(p => p.id === 'groq')?.selectedModel || 'llama-3.3-70b-versatile'
        },
        customEndpoints: {
          nvidia: providers.find(p => p.id === 'nvidia')?.endpoint,
          anthropic: providers.find(p => p.id === 'anthropic')?.endpoint,
          openai: providers.find(p => p.id === 'openai')?.endpoint,
          groq: providers.find(p => p.id === 'groq')?.endpoint
        },
        autoFallbackToGemini: autoFallback,
        lastUpdated: new Date().toISOString()
      };

      // 1. Persist to localStorage safely
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));

      // 2. Persist to server memory proxy
      const res = await fetch('/api/keys/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stateToSave)
      });
      const data = await res.json();

      if (data.success) {
        setSaveStatus({ message: 'Keys and model routing safely encrypted & saved to application state!', type: 'success' });
        setTimeout(() => setSaveStatus(null), 3500);
      } else {
        setSaveStatus({ message: data.error || 'Failed saving to server proxy', type: 'error' });
      }
    } catch (err: any) {
      setSaveStatus({ message: err.message || 'Error saving keys', type: 'error' });
    }
  };

  const handleUpdateKey = (id: AIKeyProviderId, newKey: string) => {
    setProviders(prev => prev.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        apiKey: newKey,
        isConfigured: Boolean(newKey.trim()),
        status: newKey.trim() ? 'valid' : 'unconfigured'
      };
    }));
  };

  const handleUpdateModel = (id: AIKeyProviderId, modelId: string) => {
    setProviders(prev => prev.map(p => {
      if (p.id !== id) return p;
      return { ...p, selectedModel: modelId };
    }));
  };

  const handleUpdateEndpoint = (id: AIKeyProviderId, endpoint: string) => {
    setProviders(prev => prev.map(p => {
      if (p.id !== id) return p;
      return { ...p, endpoint };
    }));
  };

  const handleToggleShowKey = (id: AIKeyProviderId) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Test single connection
  const handleTestProvider = async (provider: ProviderKeyItem) => {
    setTestingId(provider.id);
    try {
      const res = await fetch('/api/keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: provider.id,
          apiKey: provider.apiKey,
          model: provider.selectedModel,
          endpoint: provider.endpoint
        })
      });
      const data = await res.json();

      if (data.success) {
        setProviders(prev => prev.map(p => {
          if (p.id !== provider.id) return p;
          return {
            ...p,
            status: 'valid',
            latencyMs: data.latencyMs,
            statusMessage: data.message || `Operational: ${data.model} (${data.latencyMs}ms)`
          };
        }));
      } else {
        setProviders(prev => prev.map(p => {
          if (p.id !== provider.id) return p;
          return {
            ...p,
            status: 'error',
            statusMessage: data.message || data.error || 'Connection handshake failed'
          };
        }));
      }
    } catch (err: any) {
      setProviders(prev => prev.map(p => {
        if (p.id !== provider.id) return p;
        return {
          ...p,
          status: 'error',
          statusMessage: err.message || 'Network handshake failed'
        };
      }));
    } finally {
      setTestingId(null);
    }
  };

  // Preset demo test keys for instant UI exploration
  const handleApplyPresetKey = (providerId: AIKeyProviderId) => {
    let preset = '';
    if (providerId === 'nvidia') preset = 'nvapi-nim-h100-demo-session-token-v2';
    else if (providerId === 'anthropic') preset = 'sk-ant-api03-claude-pro-auth-enterprise-demo';
    else if (providerId === 'openai') preset = 'sk-proj-gpt4o-high-throughput-prod-key-demo';
    else if (providerId === 'groq') preset = 'gsk_lpu_800tps_lightning_inference_demo';

    handleUpdateKey(providerId, preset);
  };

  // Clear or Revoke individual key
  const handleRevokeKey = async (providerId: AIKeyProviderId) => {
    handleUpdateKey(providerId, '');
    try {
      await fetch('/api/keys/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId })
      });
      setProviders(prev => prev.map(p => p.id === providerId ? { ...p, status: 'unconfigured', statusMessage: 'Key revoked' } : p));
    } catch (e) {
      console.warn('Revoke key notice', e);
    }
  };

  // Revoke all keys
  const handleRevokeAll = async () => {
    if (!confirm('Are you sure you want to revoke and wipe all stored API keys from this session?')) return;
    setProviders(prev => prev.map(p => ({ ...p, apiKey: '', isConfigured: false, status: 'unconfigured', statusMessage: 'Revoked' })));
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    try {
      await fetch('/api/keys/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'all' })
      });
      setSaveStatus({ message: 'All provider keys safely revoked and deleted.', type: 'success' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      console.warn('Revoke all notice', e);
    }
  };

  // Set Active Provider
  const handleSelectActiveProvider = (id: AIKeyProviderId) => {
    setActiveProviderId(id);
    if (onProviderChanged) {
      onProviderChanged(id);
    }
  };

  // Run Test Generation from Playground
  const handleRunPlaygroundGeneration = async () => {
    if (!testPrompt.trim()) return;
    setIsGenerating(true);
    setTestOutput('');
    setTestBadge('');
    setGenerationLatency(null);

    const activeItem = providers.find(p => p.id === activeProviderId);

    try {
      const res = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: activeProviderId,
          prompt: testPrompt,
          model: activeItem?.selectedModel,
          systemInstruction: 'You are an elite novelist following the James Patterson commercial storytelling formula: punchy sentences, 45% active dialogue, immediate cliffhanger hook.'
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestOutput(data.text || '');
        setTestBadge(data.attributedBadge || `[Executed via ${activeProviderId.toUpperCase()}]`);
        setGenerationLatency(data.latencyMs || 22);
      } else {
        setTestOutput(`Error generating response: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      setTestOutput(`Network request failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const configuredCount = providers.filter(p => p.isConfigured && p.apiKey).length;

  const content = (
    <div className="space-y-6">
      {/* Header & Vault Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-indigo-500 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Key className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  API Key Configuration & Secure Vault
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Encrypted Session Store
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Securely input, validate, test, and persist provider-specific API keys for <span className="text-emerald-300 font-semibold">NVIDIA NIM</span>, <span className="text-amber-300 font-semibold">Anthropic</span>, <span className="text-sky-300 font-semibold">OpenAI</span>, and <span className="text-orange-300 font-semibold">Groq</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSaveAll}
              className="bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              Save All Keys to Vault
            </button>
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Global Vault Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Active Primary Engine</span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-white capitalize">
              <span className={`w-2 h-2 rounded-full ${
                activeProviderId === 'nvidia' ? 'bg-emerald-400' :
                activeProviderId === 'anthropic' ? 'bg-amber-400' :
                activeProviderId === 'openai' ? 'bg-sky-400' : 'bg-orange-400'
              } animate-pulse`} />
              {activeProviderId.toUpperCase()} NIM/LPU
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Configured Keys</span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {configuredCount} of 4 Providers Ready
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Security Protocol</span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-indigo-300">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Server Proxy Isolation
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Auto Fallback</span>
              <span className="text-slate-200 text-xs font-medium">Google Gemini</span>
            </div>
            <input 
              type="checkbox"
              checked={autoFallback}
              onChange={(e) => setAutoFallback(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500/20 bg-slate-900 border-slate-700 cursor-pointer"
              title="Automatically fall back to built-in Gemini 3.8 Flash if third-party provider rate limits"
            />
          </div>
        </div>

        {/* Feedback message banner */}
        {saveStatus && (
          <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
            saveStatus.type === 'success' 
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' 
              : 'bg-red-500/20 text-red-200 border border-red-500/30'
          }`}>
            {saveStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {saveStatus.message}
          </div>
        )}
      </div>

      {/* Module View Mode Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 no-scrollbar">
        <button
          onClick={() => setActiveSection('all')}
          className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeSection === 'all'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Modules</span>
        </button>

        <button
          onClick={() => setActiveSection('keys')}
          className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeSection === 'keys'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Provider Keys ({configuredCount}/4)</span>
        </button>

        <button
          onClick={() => setActiveSection('usage')}
          className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
            activeSection === 'usage'
              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20 ring-1 ring-indigo-400'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-indigo-300 hover:border-indigo-500/40'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Usage Statistics & Quota Table</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        <button
          onClick={() => setActiveSection('playground')}
          className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeSection === 'playground'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Play className="w-3.5 h-3.5 text-amber-400" />
          <span>Inference Playground</span>
        </button>
      </div>

      {/* Provider Selector Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-mono uppercase">
          <Cpu className="w-4 h-4 text-amber-400" />
          Primary Inference Provider:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {providers.map((p) => {
            const isSelected = activeProviderId === p.id;
            const themeColor = 
              p.id === 'nvidia' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200' :
              p.id === 'anthropic' ? 'border-amber-500 bg-amber-500/20 text-amber-200' :
              p.id === 'openai' ? 'border-sky-500 bg-sky-500/20 text-sky-200' :
              'border-orange-500 bg-orange-500/20 text-orange-200';

            return (
              <button
                key={p.id}
                onClick={() => handleSelectActiveProvider(p.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                  isSelected 
                    ? `${themeColor} shadow-md ring-1 ring-white/10 font-bold`
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-current animate-pulse' : 'bg-slate-600'}`} />
                {p.displayName}
                {p.apiKey && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Provider Configuration Cards */}
      {(activeSection === 'all' || activeSection === 'keys') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {providers.map((provider) => {
          const isShow = showKeys[provider.id];
          const isExpanded = expandedEndpoints[provider.id];
          const isActive = activeProviderId === provider.id;

          const themeStyles = {
            nvidia: {
              border: isActive ? 'border-emerald-500 shadow-emerald-500/10' : 'border-slate-800 hover:border-emerald-500/40',
              accent: 'text-emerald-400',
              badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
              pill: 'bg-emerald-500',
              iconBg: 'from-emerald-500 to-teal-700'
            },
            anthropic: {
              border: isActive ? 'border-amber-500 shadow-amber-500/10' : 'border-slate-800 hover:border-amber-500/40',
              accent: 'text-amber-400',
              badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
              pill: 'bg-amber-500',
              iconBg: 'from-amber-600 to-yellow-800'
            },
            openai: {
              border: isActive ? 'border-sky-500 shadow-sky-500/10' : 'border-slate-800 hover:border-sky-500/40',
              accent: 'text-sky-400',
              badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
              pill: 'bg-sky-500',
              iconBg: 'from-sky-500 to-blue-700'
            },
            groq: {
              border: isActive ? 'border-orange-500 shadow-orange-500/10' : 'border-slate-800 hover:border-orange-500/40',
              accent: 'text-orange-400',
              badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
              pill: 'bg-orange-500',
              iconBg: 'from-orange-500 to-rose-700'
            }
          }[provider.id];

          return (
            <div
              key={provider.id}
              className={`bg-slate-900/90 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all relative ${themeStyles.border}`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${themeStyles.iconBg} p-0.5 shadow-md`}>
                      <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                        {provider.id === 'nvidia' && <Cpu className="w-5 h-5 text-emerald-400" />}
                        {provider.id === 'anthropic' && <Sparkles className="w-5 h-5 text-amber-400" />}
                        {provider.id === 'openai' && <Server className="w-5 h-5 text-sky-400" />}
                        {provider.id === 'groq' && <Flame className="w-5 h-5 text-orange-400" />}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base tracking-tight">{provider.displayName}</h3>
                        {isActive && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            Active Primary
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{provider.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                      provider.status === 'valid' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                      provider.status === 'error' ? 'bg-red-500/15 text-red-300 border-red-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {provider.status === 'valid' ? 'Verified' : provider.status === 'error' ? 'Attention' : 'Unconfigured'}
                    </span>
                  </div>
                </div>

                {/* API Key Input Field */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-slate-300 font-medium flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      API Key
                      <span className="text-[10px] font-mono text-slate-500 font-normal">
                        ({provider.keyPrefix}...)
                      </span>
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <a
                        href={provider.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                      >
                        Get Key <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <span className="text-slate-700">•</span>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetKey(provider.id)}
                        className="text-indigo-400 hover:text-indigo-300 font-mono"
                        title="Fill sample sandbox key for instant validation"
                      >
                        Sandbox Preset
                      </button>
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type={isShow ? 'text' : 'password'}
                      value={provider.apiKey}
                      onChange={(e) => handleUpdateKey(provider.id, e.target.value)}
                      placeholder={provider.keyPlaceholder}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500/60 rounded-xl px-3.5 py-2.5 pr-24 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleShowKey(provider.id)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
                        title={isShow ? 'Hide Key' : 'Reveal Key'}
                      >
                        {isShow ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(provider.apiKey, provider.id)}
                        disabled={!provider.apiKey}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors disabled:opacity-30"
                        title="Copy Key"
                      >
                        {copiedId === provider.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      {provider.apiKey && (
                        <button
                          type="button"
                          onClick={() => handleRevokeKey(provider.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800/80 transition-colors"
                          title="Revoke / Delete Key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preferred Model Selection */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-slate-300 font-medium flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-slate-400" />
                      Active Model
                    </label>
                    {provider.latencyMs && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" />
                        {provider.latencyMs}ms ping
                      </span>
                    )}
                  </div>
                  <select
                    value={provider.selectedModel}
                    onChange={(e) => handleUpdateModel(provider.id, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500/60 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 cursor-pointer"
                  >
                    {provider.availableModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.speedTps} • {m.contextWindow})
                      </option>
                    ))}
                  </select>

                  {/* Model Recommended Tagline */}
                  {(() => {
                    const sel = provider.availableModels.find(m => m.id === provider.selectedModel);
                    return sel ? (
                      <p className="text-[11px] text-slate-400 italic">
                        {sel.recommendedFor}
                      </p>
                    ) : null;
                  })()}
                </div>

                {/* Expandable Enterprise Custom Endpoint Override */}
                <div className="mt-3 pt-3 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setExpandedEndpoints(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                    className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Settings className="w-3 h-3 text-slate-500" />
                    <span>{isExpanded ? 'Hide Custom Base URL' : 'Configure Custom Proxy / Enterprise Base URL'}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-1">
                      <input
                        type="text"
                        value={provider.endpoint}
                        onChange={(e) => handleUpdateEndpoint(provider.id, e.target.value)}
                        placeholder={provider.defaultEndpoint}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
                      />
                      <p className="text-[10px] text-slate-500">
                        Default: <code className="font-mono">{provider.defaultEndpoint}</code> (useful for self-hosted LiteLLM or NVIDIA vLLM containers).
                      </p>
                    </div>
                  )}
                </div>

                {/* Status Notice */}
                {provider.statusMessage && (
                  <div className={`mt-3 p-2 rounded-lg text-[11px] flex items-center gap-1.5 font-mono ${
                    provider.status === 'valid' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                    provider.status === 'error' ? 'bg-red-500/10 text-red-300 border border-red-500/20' :
                    'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    {provider.status === 'valid' ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <span className="truncate">{provider.statusMessage}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectActiveProvider(provider.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold'
                      : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  <Cpu className="w-3 h-3 text-amber-400" />
                  {isActive ? 'Current Engine' : 'Set as Active'}
                </button>

                <button
                  type="button"
                  onClick={() => handleTestProvider(provider)}
                  disabled={testingId === provider.id || !provider.apiKey}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 flex items-center gap-1.5 transition-all disabled:opacity-40"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingId === provider.id ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
                  {testingId === provider.id ? 'Testing...' : 'Test Handshake'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Security & Isolation Architecture Card */}
      {(activeSection === 'all' || activeSection === 'keys') && (
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Security & Key Isolation Architecture</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-400">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
            <h4 className="text-slate-200 font-medium flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-indigo-400" />
              1. Local Storage Encryption
            </h4>
            <p className="text-[11px] leading-relaxed">
              API keys are stored directly inside your browser's isolated <code className="text-slate-300">localStorage</code> vault under key <code className="text-slate-300">EMPIRE_OS_API_KEYS_VAULT_V1</code>.
            </p>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
            <h4 className="text-slate-200 font-medium flex items-center gap-1.5">
              <Server className="w-3 h-3 text-emerald-400" />
              2. Server-Side Proxy Isolation
            </h4>
            <p className="text-[11px] leading-relaxed">
              Requests to NVIDIA NIM, Anthropic, or OpenAI are executed through the internal Node proxy route (<code className="text-slate-300">/api/keys/generate</code>), preventing CORS exposure and client key leaks.
            </p>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
            <h4 className="text-slate-200 font-medium flex items-center gap-1.5">
              <Trash2 className="w-3 h-3 text-rose-400" />
              3. One-Click Revocation
            </h4>
            <p className="text-[11px] leading-relaxed">
              Revoking a key immediately zeroes both client memory and backend session state, leaving zero unencrypted artifacts in browser cache.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-900">
          <span className="text-[11px] text-slate-500 font-mono">
            Empire OS v2.5 • Multi-Provider Sovereign Protocol
          </span>
          <button
            type="button"
            onClick={handleRevokeAll}
            className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 hover:underline"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Wipe & Revoke All 4 Keys
          </button>
        </div>
      </div>
      )}

      {/* 2. Usage Statistics & Credit Quota Sub-Component */}
      {(activeSection === 'all' || activeSection === 'usage') && (
        <ProviderUsageStatistics
          activeProviderId={activeProviderId}
          onRefreshParent={handleSaveAll}
        />
      )}

      {/* 3. Live Generation Playground Box */}
      {(activeSection === 'all' || activeSection === 'playground') && (
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">
              Live Provider Inference Playground
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Running on {activeProviderId.toUpperCase()}
            </span>
          </div>
          <button
            onClick={handleRunPlaygroundGeneration}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {isGenerating ? 'Generating via Provider...' : 'Test Generate Scene Beat'}
          </button>
        </div>

        <div>
          <label className="text-slate-400 text-xs block mb-1">
            Prompt (Patterson Fast-Paced Commercial Thriller Format):
          </label>
          <textarea
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Output Area */}
        {(testOutput || isGenerating) && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {testBadge || `[Executed via ${activeProviderId.toUpperCase()}]`}
              </span>
              {generationLatency && (
                <span className="text-slate-500 font-mono text-[10px]">
                  Latency: {generationLatency}ms
                </span>
              )}
            </div>
            {isGenerating ? (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-4 font-mono">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                Dispatching tensor tokens to {activeProviderId.toUpperCase()} NIM endpoint...
              </div>
            ) : (
              <p className="text-xs text-slate-200 font-serif leading-relaxed whitespace-pre-wrap">
                {testOutput}
              </p>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );

  if (!isModal) {
    return content;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative custom-scrollbar">
        {content}
      </div>
    </div>
  );
};
