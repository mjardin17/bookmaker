import React, { useState } from 'react';
import { PublishingProject } from '../types/storyforge';
import { 
  Share2, Video, Mail, FileText, Sparkles, Copy, 
  Check, Clapperboard, Film 
} from 'lucide-react';

interface MarketingAndVideoFactoryProps {
  project: PublishingProject;
  onGenerateCampaign: () => void;
  onNavigateToCartoons?: () => void;
  onNavigateToBossLister?: () => void;
}

export const MarketingAndVideoFactory: React.FC<MarketingAndVideoFactoryProps> = ({
  project,
  onGenerateCampaign,
  onNavigateToCartoons,
  onNavigateToBossLister
}) => {
  const [subTab, setSubTab] = useState<'marketing' | 'video'>('video');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const mkt = project.marketingPack;
  const vid = project.videoPack;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                Marketing & Video Adaptation Factory
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Omni-Channel Campaign Engine
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Generates social media post packs, email launch sequences, press releases, TikTok/Reels hooks, and AI video trailer storyboards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubTab('marketing')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                subTab === 'marketing' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400'
              }`}
            >
              Marketing Pack
            </button>
            <button
              onClick={() => setSubTab('video')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                subTab === 'video' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400'
              }`}
            >
              Video Factory
            </button>
            {onNavigateToBossLister && (
              <button
                onClick={onNavigateToBossLister}
                className="bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10"
              >
                <span>🛍️ BossLister Studio</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {subTab === 'marketing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Social Posts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Share2 className="w-4 h-4 text-sky-400" />
              Social Media Campaign
            </h3>

            <div className="space-y-3">
              {mkt.socialPosts?.map((post, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 relative group">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {post.platform}
                  </span>
                  <p className="text-xs text-slate-200">{post.caption}</p>
                  <div className="flex flex-wrap gap-1">
                    {post.hashtags.map((h, i) => (
                      <span key={i} className="text-[10px] font-mono text-amber-400">{h}</span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleCopy(`${post.caption}\n${post.hashtags.join(' ')}`, `post-${idx}`)}
                    className="absolute right-2 top-2 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg transition-all opacity-80 group-hover:opacity-100"
                  >
                    {copiedId === `post-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Email Nurture Sequence */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Mail className="w-4 h-4 text-amber-400" />
              Email Launch Sequences
            </h3>

            <div className="space-y-3">
              {mkt.emailCampaigns?.map((email, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{email.stage}</span>
                  <h4 className="text-xs font-bold text-amber-300">Subject: {email.subject}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{email.body}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {subTab === 'video' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          {/* Cartoon Studio Quick Jump Banner */}
          {onNavigateToCartoons && (
            <div className="bg-gradient-to-r from-amber-500/15 via-indigo-600/15 to-purple-600/15 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                  🎬
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-300">
                    Full AI Cartoon Video Animation Studio Available!
                  </h4>
                  <p className="text-xs text-slate-300">
                    Watch real-time animated cartoon videos with character speech, sound effects, and direct video recording (.webm).
                  </p>
                </div>
              </div>

              <button
                onClick={onNavigateToCartoons}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-all shadow-md"
              >
                <span>Launch Cartoon Studio</span>
                <Film className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clapperboard className="w-4 h-4 text-amber-400" />
              Book Trailer Storyboard & AI Voiceover Script
            </h3>
            <p className="text-xs text-slate-400 mt-1">Recommended Voice: {vid.narrationVoice}</p>
          </div>

          <div className="space-y-3">
            {vid.storyboardPrompts?.map((item, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 block">{item.timecode}</span>
                  <span className="font-bold text-slate-200">Audio Voiceover:</span>
                  <p className="text-slate-300 italic">"{item.audioText}"</p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-bold text-indigo-400 block">AI Visual Prompt:</span>
                  <p className="text-slate-300 font-mono text-[11px]">{item.visualPrompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
