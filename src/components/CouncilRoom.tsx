import React, { useState } from 'react';
import { PublishingProject, CouncilDebateEntry } from '../types/storyforge';
import { 
  Users, MessageSquare, Sparkles, Star, CheckCircle2, 
  Send, Bot, HelpCircle, Shield, Award, RefreshCw 
} from 'lucide-react';

interface CouncilRoomProps {
  project: PublishingProject;
  onRunDebate: (topic: string, snippet?: string) => Promise<void>;
  isLoading: boolean;
}

export const COUNCIL_MEMBERS = [
  { id: 'prof-quill', name: 'Professor Quill', role: 'Dean of Literature', avatar: '🧙‍♂️', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { id: 'lady-ink', name: 'Lady Ink', role: 'Dialogue Specialist', avatar: '✒️', color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
  { id: 'captain-grimm', name: 'Captain Grimm', role: 'Action & High-Stakes', avatar: '⚔️', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  { id: 'archivist-atlas', name: 'Archivist Atlas', role: 'Lore & World Bible Guard', avatar: '📜', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { id: 'prof-plotter', name: 'Professor Plotter', role: 'Pacing & Narrative Architecture', avatar: '📐', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
  { id: 'doctor-heart', name: 'Doctor Heart', role: 'Emotional Arc & Character Psychology', avatar: '❤️', color: 'text-pink-400 border-pink-500/30 bg-pink-500/10' },
  { id: 'master-ember', name: 'Master Ember', role: 'Magic & Tech Systems', avatar: '🔥', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
  { id: 'prof-curiosity', name: 'Professor Curiosity', role: 'Children\'s Wonder & STEM Scaffolding', avatar: '✨', color: 'text-teal-400 border-teal-500/30 bg-teal-500/10' },
  { id: 'prof-finish', name: 'Professor Finish', role: 'Market Quality & Masterpiece Control', avatar: '🛡️', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' }
];

export const CouncilRoom: React.FC<CouncilRoomProps> = ({
  project,
  onRunDebate,
  isLoading
}) => {
  const [topicInput, setTopicInput] = useState('Evaluate Chapter 1 Pacing & Character Motivations');
  const [snippetInput, setSnippetInput] = useState('');

  const handleDebateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    onRunDebate(topicInput, snippetInput);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Users className="w-3 h-3" />
                Grand Literary Council
              </span>
              <span className="text-xs text-slate-400 font-mono">
                9 Active AI Specialists
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Triple-Blind Peer Review & Consensus Chamber
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Specialized AI personas debate narrative arc, dialogue subtext, pacing, world bible continuity, and market readiness before approving manuscripts.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 font-mono uppercase">Council Standard</p>
              <p className="text-xs font-bold text-slate-200">
                {project.scorecard.marketReadiness || 'Masterpiece Standard'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 9 Council Specialists Roster */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
        {COUNCIL_MEMBERS.map((member) => (
          <div 
            key={member.id}
            className={`p-3 rounded-xl border text-center transition-all ${member.color}`}
          >
            <div className="text-2xl mb-1">{member.avatar}</div>
            <h4 className="text-xs font-bold text-slate-100 truncate">{member.name}</h4>
            <p className="text-[10px] text-slate-400 line-clamp-1">{member.role}</p>
          </div>
        ))}
      </div>

      {/* Main Debate Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Debate Input Trigger Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Convene Council Session
          </h3>

          <form onSubmit={handleDebateSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-mono">Debate Topic or Premise</label>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g. Is Chapter 1 emotional stakes high enough for age 8-12?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-mono">Manuscript Excerpt (Optional)</label>
              <textarea
                rows={4}
                value={snippetInput}
                onChange={(e) => setSnippetInput(e.target.value)}
                placeholder="Paste paragraph or scene excerpt for line-by-line review..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 disabled:opacity-50 text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Council Debating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Trigger Council Debate
                </>
              )}
            </button>
          </form>

          {/* Preset Quick Topics */}
          <div className="pt-3 border-t border-slate-800/80">
            <p className="text-[10px] text-slate-500 font-mono mb-2 uppercase">Quick Debate Prompts</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Audit Chapter 1 Opening Hook',
                'Check Lore Consistency for Clockwork Keep',
                'Verify Vocabulary Level for Grade 5',
                'Evaluate Antagonist Motivation'
              ].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setTopicInput(preset)}
                  className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg text-left transition-all"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Live Debate Transcript Stream */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              Live Council Debate Transcript
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {project.councilDebate?.length || 0} Entries
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {project.councilDebate && project.councilDebate.length > 0 ? (
              project.councilDebate.map((entry) => (
                <div 
                  key={entry.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{entry.avatar || '🤖'}</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{entry.specialistName}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">{entry.specialistRole}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.ratingScore && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {entry.ratingScore}/100
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">{entry.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans pl-1">
                    "{entry.content}"
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                No council debate logs yet. Click "Trigger Council Debate" to convene the AI specialists!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
