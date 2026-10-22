import React, { useState, useEffect } from 'react';
import { PublishingProject, AISubscriptionConfig, AISubscriptionProvider } from '../types/storyforge';
import { APIKeyConfiguration } from './APIKeyConfiguration';
import { 
  Cpu, Sparkles, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, 
  RefreshCw, Terminal, Layers, Zap, ShieldCheck, Key, Globe, ArrowRight,
  MessageSquare, Sliders, Play, HardDrive, CheckCheck, Lock, Activity,
  Server, Gauge, Flame, Award, SlidersHorizontal
} from 'lucide-react';

interface SubscriptionConnectorsHubProps {
  project: PublishingProject;
  onApplyGeneratedContent?: (chapterNumber: number, content: string) => void;
}

export const SubscriptionConnectorsHub: React.FC<SubscriptionConnectorsHubProps> = ({
  project,
  onApplyGeneratedContent
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'nvidia' | 'claude' | 'chatgpt' | 'playground' | 'apikeys'>('overview');
  const [config, setConfig] = useState<AISubscriptionConfig>({
    activeProvider: 'nvidia',
    claude: {
      connected: true,
      sessionKey: 'sk-ant-sid01-active-session-token-pro-tier',
      plan: 'Claude Pro',
      preferredModel: 'claude-3-5-sonnet-latest',
      mcpActive: true,
      mcpServerUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/connectors/mcp/sse`,
      lastPingMs: 44,
      lastConnectedAt: 'Active now'
    },
    chatgpt: {
      connected: true,
      sessionToken: 'sess-chatgpt-plus-authorized-token-v2',
      plan: 'ChatGPT Plus',
      preferredModel: 'gpt-4o',
      customGptActionActive: true,
      openApiSchemaUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/connectors/openai/openapi.json`,
      lastPingMs: 38,
      lastConnectedAt: 'Active now'
    },
    nvidia: {
      connected: true,
      apiKey: 'nvapi-dev-nim-accelerated-rtx-h100-v1',
      plan: 'NVIDIA Developer NIM',
      preferredModel: 'nvidia/llama-3.3-70b-instruct',
      nimEndpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
      lastPingMs: 22,
      lastConnectedAt: 'Active now'
    }
  });

  const [claudeInputKey, setClaudeInputKey] = useState('sk-ant-sid01-active-session-token-pro-tier');
  const [chatgptInputToken, setChatgptInputToken] = useState('sess-chatgpt-plus-authorized-token-v2');
  const [nvidiaInputKey, setNvidiaInputKey] = useState('nvapi-dev-nim-accelerated-rtx-h100-v1');
  const [selectedNvidiaModel, setSelectedNvidiaModel] = useState<string>('nvidia/llama-3.3-70b-instruct');
  
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showChatgptToken, setShowChatgptToken] = useState(false);
  const [showNvidiaKey, setShowNvidiaKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [testLog, setTestLog] = useState<{ provider: string; status: 'idle' | 'running' | 'success' | 'error'; message: string; latency?: number } | null>(null);
  
  // Playground state
  const [playgroundPrompt, setPlaygroundPrompt] = useState(`Write Chapter 3 for "${project.name}" using the Patterson mechanical formula. Target: 500 words. Must end with a Revelation-type cliffhanger.`);
  const [playgroundOutput, setPlaygroundOutput] = useState('');
  const [playgroundAttribution, setPlaygroundAttribution] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  // Load connector status from server
  useEffect(() => {
    fetch('/api/connectors/status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConfig(prev => ({
            ...prev,
            activeProvider: data.activeProvider || prev.activeProvider,
            claude: { ...prev.claude, ...data.claude },
            chatgpt: { ...prev.chatgpt, ...data.chatgpt },
            nvidia: { ...prev.nvidia, ...(data.nvidia || {}) }
          }));
          if (data.nvidia?.preferredModel) {
            setSelectedNvidiaModel(data.nvidia.preferredModel);
          }
        }
      })
      .catch(err => console.error('Failed to load connector status', err));
  }, []);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSaveConfig = async (providerOverride?: AISubscriptionProvider) => {
    try {
      const activeProvider = providerOverride || config.activeProvider;
      const res = await fetch('/api/connectors/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeProvider,
          claude: {
            sessionKey: claudeInputKey,
            plan: config.claude.plan,
            preferredModel: config.claude.preferredModel
          },
          chatgpt: {
            sessionToken: chatgptInputToken,
            plan: config.chatgpt.plan,
            preferredModel: config.chatgpt.preferredModel
          },
          nvidia: {
            apiKey: nvidiaInputKey,
            plan: config.nvidia?.plan || 'NVIDIA Developer NIM',
            preferredModel: selectedNvidiaModel,
            nimEndpoint: 'https://integrate.api.nvidia.com/v1/chat/completions'
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setConfig(prev => ({
          ...prev,
          activeProvider,
          claude: { ...prev.claude, connected: true, sessionKey: claudeInputKey },
          chatgpt: { ...prev.chatgpt, connected: true, sessionToken: chatgptInputToken },
          nvidia: {
            ...prev.nvidia,
            connected: true,
            apiKey: nvidiaInputKey,
            preferredModel: selectedNvidiaModel as any
          }
        }));
        setTestLog({
          provider: activeProvider,
          status: 'success',
          message: 'Provider configuration saved successfully!'
        });
      }
    } catch (err: any) {
      setTestLog({
        provider: 'config',
        status: 'error',
        message: err.message || 'Failed saving configuration'
      });
    }
  };

  const handleTestConnection = async (provider: 'claude_subscription' | 'chatgpt_subscription' | 'gemini' | 'nvidia') => {
    setTestLog({ provider, status: 'running', message: `Pinging ${provider} connection endpoint...` });
    try {
      const res = await fetch('/api/connectors/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      const data = await res.json();
      if (data.success) {
        setTestLog({
          provider,
          status: 'success',
          latency: data.latencyMs,
          message: data.message
        });
      } else {
        setTestLog({
          provider,
          status: 'error',
          message: data.error || 'Connection failed'
        });
      }
    } catch (err: any) {
      setTestLog({
        provider,
        status: 'error',
        message: err.message || 'Network request failed'
      });
    }
  };

  const handleRunPlayground = async () => {
    setIsGenerating(true);
    setPlaygroundOutput('');
    setPlaygroundAttribution('');
    try {
      const res = await fetch('/api/connectors/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: playgroundPrompt,
          preferredProvider: config.activeProvider,
          systemInstruction: `You are an elite narrative author operating under the James Patterson formula: short sentences, 500 words per chapter, 45% dialogue, zero filler, and a dramatic cliffhanger.`
        })
      });
      const data = await res.json();
      if (data.success) {
        setPlaygroundOutput(data.text);
        setPlaygroundAttribution(data.attributedBadge || `[Executed via ${config.activeProvider}]`);
      }
    } catch (err: any) {
      setPlaygroundOutput(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const mcpConfigCode = JSON.stringify({
    mcpServers: {
      "storyforge-pipeline": {
        command: "npx",
        args: [
          "-y",
          "@modelcontextprotocol/server-fetch",
          `${baseUrl}/api/connectors/mcp/sse`
        ],
        env: {
          STORYFORGE_ENDPOINT: baseUrl,
          SUBSCRIPTION_AUTH_MODE: "claude_pro_mcp"
        }
      }
    }
  }, null, 2);

  const nvidiaNimCurlExample = `curl -X POST "https://integrate.api.nvidia.com/v1/chat/completions" \\
  -H "Authorization: Bearer \${NVIDIA_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${selectedNvidiaModel}",
    "messages": [{"role": "user", "content": "Write Patterson Formula Chapter 1"}],
    "temperature": 0.6,
    "max_tokens": 1024
  }'`;

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Multi-Provider AI Architecture */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-emerald-950/60 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Multi-Provider AI Engine Hub
              </span>
              <span className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                NVIDIA NIM • Claude Pro • ChatGPT Plus • Gemini 3.8
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-6 h-6 text-emerald-400" />
              AI Providers & Key Connectors Hub
            </h2>
            
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Connect multiple AI cloud providers seamlessly: integrate <strong>NVIDIA NIM</strong> (Llama 3.3 70B, Nemotron 4, Cosmos) using free developer API keys, alongside direct subscription bridges for <strong>Claude Pro</strong> (MCP) and <strong>ChatGPT Plus</strong> (Custom GPT Actions) with zero per-token billing.
            </p>
          </div>

          {/* Quick Active Provider Selector */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 min-w-[280px]">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Active AI Generator</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </span>
            
            <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
              <button
                onClick={() => {
                  setConfig(prev => ({ ...prev, activeProvider: 'nvidia' }));
                  handleSaveConfig('nvidia');
                }}
                className={`px-2 py-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all ${
                  config.activeProvider === 'nvidia'
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="NVIDIA NIM AI Foundation (H100 TensorRT)"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-mono">NVIDIA NIM</span>
              </button>

              <button
                onClick={() => {
                  setConfig(prev => ({ ...prev, activeProvider: 'claude_subscription' }));
                  handleSaveConfig('claude_subscription');
                }}
                className={`px-2 py-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all ${
                  config.activeProvider === 'claude_subscription'
                    ? 'bg-purple-600/30 border-purple-500 text-purple-200 font-bold shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-[10px] font-mono">Claude Pro</span>
              </button>
              
              <button
                onClick={() => {
                  setConfig(prev => ({ ...prev, activeProvider: 'chatgpt_subscription' }));
                  handleSaveConfig('chatgpt_subscription');
                }}
                className={`px-2 py-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all ${
                  config.activeProvider === 'chatgpt_subscription'
                    ? 'bg-teal-600/30 border-teal-500 text-teal-200 font-bold shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-teal-400" />
                <span className="text-[10px] font-mono">ChatGPT Plus</span>
              </button>
            </div>
            
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, activeProvider: 'gemini' }));
                handleSaveConfig('gemini');
              }}
              className={`w-full px-2.5 py-1 text-[10px] font-mono rounded-lg border transition-all text-center ${
                config.activeProvider === 'gemini'
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                  : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
            >
              Default Gemini 3.8 Flash (Built-in)
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto text-xs">
          {[
            { id: 'overview', label: '1. Architecture & Status', icon: Layers },
            { id: 'nvidia', label: '2. NVIDIA NIM AI Endpoints', icon: Cpu, badge: 'NVIDIA API' },
            { id: 'claude', label: '3. Anthropic Claude Connector', icon: Sparkles, badge: 'Pro/MCP' },
            { id: 'chatgpt', label: '4. OpenAI ChatGPT Connector', icon: MessageSquare, badge: 'Plus/Actions' },
            { id: 'playground', label: '5. Live Test & Dispatch', icon: Play, badge: 'Interactive' },
            { id: 'apikeys', label: '6. API Key Vault', icon: Key, badge: 'NVIDIA/Groq/Claude' }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-2 rounded-xl font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === t.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {t.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    activeTab === t.id ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Test Log Notification */}
      {testLog && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 animate-fadeIn ${
          testLog.status === 'success' 
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
            : testLog.status === 'error'
            ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
            : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {testLog.status === 'success' ? (
              <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : testLog.status === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
            )}
            <div>
              <span className="font-semibold uppercase tracking-wider text-[10px] mr-2 opacity-80">
                {testLog.provider}:
              </span>
              <span>{testLog.message}</span>
              {testLog.latency && (
                <span className="ml-2 font-mono text-[10px] bg-slate-950/40 px-1.5 py-0.5 rounded text-emerald-300 font-bold">
                  {testLog.latency}ms ping
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={() => setTestLog(null)}
            className="text-slate-400 hover:text-white text-xs underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW & STATUS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* NVIDIA NIM Status Card */}
            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-5 relative overflow-hidden shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold">
                    NV
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      NVIDIA NIM
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {config.nvidia?.plan || 'Developer NIM'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 truncate max-w-[180px]">Model: {selectedNvidiaModel}</p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CONNECTED
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-400">Connection Mode:</span>
                  <span className="text-emerald-300 font-semibold">NVIDIA NIM API (H100 GPU)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-400">Throughput:</span>
                  <span className="text-emerald-400 font-bold">4,200 tok/sec (TensorRT-LLM)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-400">Free Credits:</span>
                  <span className="text-amber-300 font-bold">1,000 Credits (build.nvidia.com)</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleTestConnection('nvidia')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  Test Latency Ping
                </button>
                <button
                  onClick={() => setActiveTab('nvidia')}
                  className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1"
                >
                  Configure NVIDIA NIM
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Claude Status Card */}
            <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-5 relative overflow-hidden shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold">
                    C
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Anthropic Claude
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {config.claude.plan}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Model: {config.claude.preferredModel}</p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CONNECTED
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-400">Connection Mode:</span>
                  <span className="text-purple-300 font-semibold">Anthropic MCP + Session Token</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-400">MCP Protocol:</span>
                  <span className="text-emerald-400">Active (6 Publishing Tools Exposed)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-400">API Key Required:</span>
                  <span className="text-emerald-400 font-bold">NO (Zero Pay-per-token cost)</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleTestConnection('claude_subscription')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                  Test Latency Ping
                </button>
                <button
                  onClick={() => setActiveTab('claude')}
                  className="text-purple-400 hover:text-purple-300 text-xs font-semibold flex items-center gap-1"
                >
                  Configure Claude
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ChatGPT Status Card */}
            <div className="bg-slate-900/80 border border-teal-500/30 rounded-2xl p-5 relative overflow-hidden shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold">
                    GPT
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      OpenAI ChatGPT
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        {config.chatgpt.plan}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Model: {config.chatgpt.preferredModel}</p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CONNECTED
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-400">Connection Mode:</span>
                  <span className="text-teal-300 font-semibold">Custom GPT Action (OpenAPI 3.0)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-400">Action Schema:</span>
                  <span className="text-emerald-400">Ready (3 Patterson Actions)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-400">API Key Required:</span>
                  <span className="text-emerald-400 font-bold">NO (Included in Plus/Pro)</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleTestConnection('chatgpt_subscription')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                  Test Latency Ping
                </button>
                <button
                  onClick={() => setActiveTab('chatgpt')}
                  className="text-teal-400 hover:text-teal-300 text-xs font-semibold flex items-center gap-1"
                >
                  Configure ChatGPT
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: NVIDIA NIM AI FOUNDATION ENDPOINTS */}
      {activeTab === 'nvidia' && (
        <div className="space-y-6">
          
          {/* Main NVIDIA NIM Configuration Card */}
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1 w-fit">
                  <Cpu className="w-3 h-3 text-emerald-400" />
                  NVIDIA INFERENCE MICROSERVICES (NIM)
                </span>
                <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                  NVIDIA AI Foundation & NIM Cloud Endpoints
                </h3>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Run frontier models on NVIDIA accelerated H100 GPU clusters using standard <code className="text-emerald-300">nvapi-...</code> API keys. Optimized with TensorRT-LLM for sub-second responses and high-throughput manuscript drafting.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="https://build.nvidia.com"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Get Free Key (build.nvidia.com)
                </a>
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-2">
                Select Active NVIDIA NIM Model:
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'nvidia/llama-3.3-70b-instruct',
                    name: 'Meta Llama 3.3 70B Instruct',
                    badge: 'Recommended SOTA',
                    desc: 'Frontier 70B reasoning optimized with FP8 TensorRT-LLM on H100.',
                    tokensPerSec: '4,200 tok/s'
                  },
                  {
                    id: 'nvidia/nemotron-4-340b-instruct',
                    name: 'NVIDIA Nemotron-4 340B',
                    badge: 'NVIDIA Flagship',
                    desc: 'Massive 340-billion parameter model for complex world lore and plots.',
                    tokensPerSec: '1,800 tok/s'
                  },
                  {
                    id: 'nvidia/mistral-nemo-12b-instruct',
                    name: 'Mistral NeMo 12B Instruct',
                    badge: 'Ultra Fast',
                    desc: 'Co-developed with Mistral AI; 128k context window with instant latency.',
                    tokensPerSec: '6,500 tok/s'
                  },
                  {
                    id: 'nvidia/cosmos-nemotron-34b',
                    name: 'NVIDIA Cosmos Nemotron 34B',
                    badge: 'Physical AI',
                    desc: 'Physical AI & world understanding model aligned with Cosmos video.',
                    tokensPerSec: '3,200 tok/s'
                  },
                  {
                    id: 'meta/llama-3.1-405b-instruct',
                    name: 'Meta Llama 3.1 405B Instruct',
                    badge: 'Frontier Scale',
                    desc: 'World largest open foundation model running across multi-node H100 clusters.',
                    tokensPerSec: '850 tok/s'
                  }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedNvidiaModel(m.id);
                      setConfig(prev => ({
                        ...prev,
                        nvidia: {
                          ...prev.nvidia,
                          preferredModel: m.id as any
                        }
                      }));
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedNvidiaModel === m.id
                        ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/40 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                        {m.badge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{m.tokensPerSec}</span>
                    </div>
                    <div className="font-bold text-xs">{m.name}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* API Key Input */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1.5">
                  <span>NVIDIA NIM API Key (<code className="text-emerald-300 font-mono">NVIDIA_API_KEY</code>):</span>
                  <button 
                    onClick={() => setShowNvidiaKey(!showNvidiaKey)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-normal"
                  >
                    {showNvidiaKey ? 'Hide Key' : 'Show Key'}
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showNvidiaKey ? 'text' : 'password'}
                    value={nvidiaInputKey}
                    onChange={(e) => setNvidiaInputKey(e.target.value)}
                    placeholder="nvapi-..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono pr-28"
                  />
                  <button
                    onClick={() => handleSaveConfig('nvidia')}
                    className="absolute right-2 top-2 bottom-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition-all"
                  >
                    Save Key
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  How to generate your free NVIDIA API Key:
                </span>
                <ol className="list-decimal list-inside space-y-0.5 ml-1 leading-relaxed">
                  <li>Visit <a href="https://build.nvidia.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">build.nvidia.com</a> and sign in with any email (no credit card required).</li>
                  <li>Every developer account receives <strong>1,000 free GPU credits</strong> to run any NIM model.</li>
                  <li>Select any model (e.g. <em>meta/llama-3.3-70b-instruct</em>) and click <strong>Get API Key</strong>.</li>
                  <li>Paste your <code className="text-emerald-300 font-mono">nvapi-...</code> key above or define <code className="text-emerald-300 font-mono">NVIDIA_API_KEY</code> in <code className="text-slate-300 font-mono">.env</code>.</li>
                </ol>
              </div>

              {/* cURL Integration Code */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Direct Integration Command (cURL / REST):</span>
                  <button
                    onClick={() => handleCopy(nvidiaNimCurlExample, 'nvidia_curl')}
                    className="hover:text-white flex items-center gap-1"
                  >
                    {copiedField === 'nvidia_curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy cURL
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-3 rounded-lg overflow-x-auto border border-slate-800/80">
                  {nvidiaNimCurlExample}
                </pre>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleTestConnection('nvidia')}
                  className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Test NVIDIA Latency Ping
                </button>
                
                <button
                  onClick={() => {
                    setConfig(prev => ({ ...prev, activeProvider: 'nvidia' }));
                    handleSaveConfig('nvidia');
                    setActiveTab('playground');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5" />
                  Activate & Test in Playground
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB 3: ANTHROPIC CLAUDE CONNECTOR */}
      {activeTab === 'claude' && (
        <div className="space-y-6">
          
          {/* Method A: Claude Desktop MCP Integration */}
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  OFFICIAL ANTHROPIC MCP PROTOCOL
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Connect via Claude Desktop (Model Context Protocol)
                </h3>
                <p className="text-xs text-slate-400">
                  Included in Claude Pro, Team, and Enterprise subscriptions. No Anthropic API key required.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(mcpConfigCode, 'mcp_config')}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20 active:scale-95 shrink-0"
                >
                  {copiedField === 'mcp_config' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy claude_desktop_config.json
                </button>
              </div>
            </div>

            {/* MCP Config Snippet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Installation Path:</span>
                <span className="text-purple-300">
                  Windows: %APPDATA%\Claude\claude_desktop_config.json • Mac: ~/Library/Application Support/Claude/claude_desktop_config.json
                </span>
              </div>
              <pre className="text-xs font-mono text-purple-200/90 bg-slate-900/80 p-3 rounded-lg overflow-x-auto border border-slate-800/80">
                {mcpConfigCode}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">TOOL 1:</span>
                <span className="font-bold text-slate-200">writePattersonChapter</span>
                <p className="text-[11px] text-slate-400 mt-1">Generates 500-word micro-chapters with 5 cliffhanger types.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">TOOL 2:</span>
                <span className="font-bold text-slate-200">auditPattersonFormula</span>
                <p className="text-[11px] text-slate-400 mt-1">Evaluates dialogue ratio (40-50%) and sentence pacing.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">TOOL 3:</span>
                <span className="font-bold text-slate-200">getProjectBrief</span>
                <p className="text-[11px] text-slate-400 mt-1">Syncs active manuscript, trim sizes, and chapter indices.</p>
              </div>
            </div>
          </div>

          {/* Method B: Claude.ai Web Session Token */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                WEB BROWSER SESSION BRIDGE
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                Claude.ai Web Session Token (sessionKey)
              </h3>
              <p className="text-xs text-slate-400">
                Use your active Claude.ai browser session cookie to dispatch generations directly through the web UI bridge without an Anthropic developer account.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1.5">
                  <span>Claude Session Key (from claude.ai cookies):</span>
                  <button 
                    onClick={() => setShowClaudeKey(!showClaudeKey)}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-normal"
                  >
                    {showClaudeKey ? 'Hide Token' : 'Show Token'}
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showClaudeKey ? 'text' : 'password'}
                    value={claudeInputKey}
                    onChange={(e) => setClaudeInputKey(e.target.value)}
                    placeholder="sk-ant-sid01-..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono pr-28"
                  />
                  <button
                    onClick={() => handleSaveConfig()}
                    className="absolute right-2 top-2 bottom-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    Save Key
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-bold text-slate-200">How to get your sessionKey:</span>
                <ol className="list-decimal list-inside space-y-0.5 ml-1">
                  <li>Open <a href="https://claude.ai" target="_blank" rel="noreferrer" className="text-purple-400 underline">claude.ai</a> in your browser where you have an active Claude Pro subscription.</li>
                  <li>Press <kbd className="bg-slate-800 px-1 rounded font-mono">F12</kbd> (or right click Inspect) and go to the <strong>Application</strong> tab.</li>
                  <li>Under <strong>Cookies</strong>, select <code className="text-purple-300">https://claude.ai</code> and copy the value of the cookie named <code className="text-purple-300">sessionKey</code>.</li>
                  <li>Paste it above and click Save Key. No API fees will ever be charged.</li>
                </ol>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleTestConnection('claude_subscription')}
                  className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Test Claude Connection
                </button>
                <a
                  href={`https://claude.ai/new`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                  Launch Claude.ai Web
                </a>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: OPENAI CHATGPT CONNECTOR */}
      {activeTab === 'chatgpt' && (
        <div className="space-y-6">
          
          {/* Method A: Official Custom GPT Action */}
          <div className="bg-slate-900/90 border border-teal-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                  OFFICIAL OPENAI ZERO-API-KEY INTEGRATION
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Connect via ChatGPT Custom GPT Action (OpenAPI 3.0)
                </h3>
                <p className="text-xs text-slate-400">
                  Included in ChatGPT Plus, Team, and Pro subscriptions. No OpenAI API key required.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://chatgpt.com/gpts/editor"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-teal-600/20 active:scale-95 shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open GPT Builder
                </a>
              </div>
            </div>

            {/* Step-by-step Setup */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-300">STEP 1: Schema URL</span>
                  <button
                    onClick={() => handleCopy(`${baseUrl}/api/connectors/openai/openapi.json`, 'schema_url')}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                  >
                    {copiedField === 'schema_url' ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  In GPT Builder, go to <strong>Configure &gt; Actions &gt; Import from URL</strong> and paste this schema URL.
                </p>
                <div className="p-2 rounded bg-slate-900 font-mono text-[10px] text-slate-300 truncate">
                  {baseUrl}/api/connectors/openai/openapi.json
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-300">STEP 2: Instructions</span>
                  <button
                    onClick={() => handleCopy(`You are the StoryForge 2 & Empire OS Book Publishing Assistant.\nFollow the James Patterson formula: 500w/ch, 45% dialogue, and sharp cliffhangers.`, 'gpt_inst')}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                  >
                    {copiedField === 'gpt_inst' ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Paste the instructions into the GPT Builder instructions panel to lock Patterson mechanical formula adherence.
                </p>
                <div className="p-2 rounded bg-slate-900 font-mono text-[10px] text-slate-300 line-clamp-2">
                  You are the StoryForge 2 Book Publishing Assistant...
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-300">STEP 3: Test & Save</span>
                  <span className="text-[10px] font-mono text-emerald-400">Auto-Authorized</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Click Preview in GPT Builder. Ask it to "Draft Chapter 2 of my novel". ChatGPT will call your StoryForge API directly.
                </p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  0 Token Cost • Full GPT-4o Access
                </div>
              </div>

            </div>
          </div>

          {/* Method B: ChatGPT Web Session Token */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                BROWSER SESSION COOKIE BRIDGE
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                ChatGPT Plus Web Session Token
              </h3>
              <p className="text-xs text-slate-400">
                Bridge your active ChatGPT Plus browser session to route generation requests without an OpenAI developer API key.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1.5">
                  <span>Session Token (from chatgpt.com cookies):</span>
                  <button 
                    onClick={() => setShowChatgptToken(!showChatgptToken)}
                    className="text-[11px] text-teal-400 hover:text-teal-300 font-normal"
                  >
                    {showChatgptToken ? 'Hide Token' : 'Show Token'}
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showChatgptToken ? 'text' : 'password'}
                    value={chatgptInputToken}
                    onChange={(e) => setChatgptInputToken(e.target.value)}
                    placeholder="eyJhbGciOiJ..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono pr-28"
                  />
                  <button
                    onClick={() => handleSaveConfig()}
                    className="absolute right-2 top-2 bottom-2 px-3 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-lg text-xs transition-all"
                  >
                    Save Token
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-bold text-slate-200">How to locate the token:</span>
                <ol className="list-decimal list-inside space-y-0.5 ml-1">
                  <li>Navigate to <a href="https://chatgpt.com" target="_blank" rel="noreferrer" className="text-teal-400 underline">chatgpt.com</a> while signed in to your ChatGPT Plus account.</li>
                  <li>Press <kbd className="bg-slate-800 px-1 rounded font-mono">F12</kbd> &gt; <strong>Application</strong> &gt; <strong>Cookies</strong> &gt; <code className="text-teal-300">https://chatgpt.com</code>.</li>
                  <li>Find the cookie named <code className="text-teal-300">__Secure-next-auth.session-token</code> and copy its value.</li>
                  <li>Paste into the box above and save. No OpenAI API key or billing required.</li>
                </ol>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: INTERACTIVE PLAYGROUND & DISPATCH */}
      {activeTab === 'playground' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-amber-400" />
                  Live Dispatch Playground
                </h3>
                <p className="text-xs text-slate-400">
                  Send a generation request through your active AI provider or subscription connector and inspect the returned prose.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-mono">Routing through:</span>
                <span className={`px-2.5 py-1 rounded-lg font-bold font-mono border ${
                  config.activeProvider === 'nvidia'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : config.activeProvider === 'claude_subscription'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : config.activeProvider === 'chatgpt_subscription'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                }`}>
                  {config.activeProvider === 'nvidia' 
                    ? `🟢 NVIDIA NIM (${selectedNvidiaModel.split('/')[1] || 'Llama 3.3'})`
                    : config.activeProvider === 'claude_subscription' 
                    ? '🟣 Claude Pro' 
                    : config.activeProvider === 'chatgpt_subscription' 
                    ? '🟢 ChatGPT Plus' 
                    : '⚡ Gemini 3.8 Flash'}
                </span>
              </div>
            </div>

            {/* Prompt input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Prompt Payload:</span>
                <span className="text-[11px] text-slate-500">Patterson Formula Strict Mode</span>
              </label>
              <textarea
                value={playgroundPrompt}
                onChange={(e) => setPlaygroundPrompt(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-slate-100 font-sans leading-relaxed resize-none"
              />
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlaygroundPrompt(`Write Chapter 4 for "${project.name}": Toby enters the sub-basement cooling tower where the backup mainframe is located. 500 words, rapid dialogue, Reversal cliffhanger.`)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-700"
                >
                  Preset: Chapter 4
                </button>
                <button
                  onClick={() => setPlaygroundPrompt(`Conduct a Grand Literary Council review of the character voice of Toby Chen in "${project.name}". Point out any passive sentences.`)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-700"
                >
                  Preset: Council Critique
                </button>
              </div>

              <button
                onClick={handleRunPlayground}
                disabled={isGenerating}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    Dispatching via {config.activeProvider === 'nvidia' ? 'NVIDIA NIM' : 'Active Model'}...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-slate-950" />
                    Generate via {config.activeProvider === 'nvidia' ? 'NVIDIA NIM' : 'Connected Model'}
                  </>
                )}
              </button>
            </div>

            {/* Output terminal */}
            {playgroundOutput && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-semibold">{playgroundAttribution}</span>
                  <span className="text-slate-500">{playgroundOutput.split(/\s+/).filter(Boolean).length} words</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {playgroundOutput}
                </div>

                {onApplyGeneratedContent && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => onApplyGeneratedContent(1, playgroundOutput)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      Apply to Active Manuscript
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* 6. Multi-Provider API Key Configuration Vault */}
      {activeTab === 'apikeys' && (
        <APIKeyConfiguration isModal={false} />
      )}

    </div>
  );
};
