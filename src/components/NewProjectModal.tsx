import React, { useState } from 'react';
import { AgeGroup, BookGenre } from '../types/storyforge';
import { Sparkles, X, BookOpen, Layers } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    title: string;
    genre: BookGenre;
    targetAge: AgeGroup;
    theme: string;
    educationalGoals: string[];
    mode: 'beginner' | 'professional';
  }) => void;
  isLoading: boolean;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  isLoading
}) => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<BookGenre>('Fantasy');
  const [targetAge, setTargetAge] = useState<AgeGroup>('Middle Grade (8-12y)');
  const [theme, setTheme] = useState('');
  const [goalsInput, setGoalsInput] = useState('');
  const [mode, setMode] = useState<'beginner' | 'professional'>('professional');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const educationalGoals = goalsInput
      .split('\n')
      .map((g) => g.trim())
      .filter(Boolean);

    onCreate({
      title,
      genre,
      targetAge,
      theme,
      educationalGoals,
      mode
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">Initialize New StoryForge Project</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-mono mb-1">Book Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Quantum Pirates of Saturn"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as BookGenre)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="Fantasy">Fantasy</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="History">History</option>
                <option value="Adventure">Adventure</option>
                <option value="Mystery">Mystery</option>
                <option value="Comedy">Comedy</option>
                <option value="Educational">Educational</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">Target Age Group</label>
              <select
                value={targetAge}
                onChange={(e) => setTargetAge(e.target.value as AgeGroup)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="Infants (0-1y)">Infants (0-1y)</option>
                <option value="Toddlers (1-3y)">Toddlers (1-3y)</option>
                <option value="Preschool (3-5y)">Preschool (3-5y)</option>
                <option value="Early Reader (5-8y)">Early Reader (5-8y)</option>
                <option value="Middle Grade (8-12y)">Middle Grade (8-12y)</option>
                <option value="Young Adult (12-18y)">Young Adult (12-18y)</option>
                <option value="Adult (18+)">Adult (18+)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Core Theme / Message</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Environmental Stewardship and Resilience"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Educational Goals (One per line)</label>
            <textarea
              rows={3}
              value={goalsInput}
              onChange={(e) => setGoalsInput(e.target.value)}
              placeholder="e.g. Critical Thinking in High Stakes&#10;Basic Solar System Astronomy"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              Initialize Story Package
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
