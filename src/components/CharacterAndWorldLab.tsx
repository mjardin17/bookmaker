import React, { useState } from 'react';
import { PublishingProject, CharacterProfile, WorldBible } from '../types/storyforge';
import { 
  Users, Globe, UserPlus, Sparkles, Shield, Compass, 
  MapPin, Clock, BookOpen, Key, Edit3 
} from 'lucide-react';

interface CharacterAndWorldLabProps {
  project: PublishingProject;
  onUpdateCharacters: (characters: CharacterProfile[]) => void;
  onUpdateWorldBible: (worldBible: WorldBible) => void;
}

export const CharacterAndWorldLab: React.FC<CharacterAndWorldLabProps> = ({
  project,
  onUpdateCharacters,
  onUpdateWorldBible
}) => {
  const [subTab, setSubTab] = useState<'characters' | 'world'>('characters');
  const [selectedCharId, setSelectedCharId] = useState<string>(project.characters[0]?.id || '');

  const selectedChar = project.characters.find((c) => c.id === selectedCharId) || project.characters[0];

  const handleAddCharacter = () => {
    const newChar: CharacterProfile = {
      id: `char-${Date.now()}`,
      name: 'New Character',
      role: 'supporting',
      biography: 'Brief bio description...',
      personalityTraits: ['Curious', 'Brave'],
      dialogueStyle: {
        tone: 'Direct and cheerful',
        catchphrases: ['By the stars!'],
        vocabularyComplexity: 'Moderate'
      },
      goals: 'Discover the truth about Clockwork Keep.',
      weaknesses: 'Impulsive.',
      visualDNA: {
        ethnicityOrSpecies: 'Human',
        hairColorStyle: 'Auburn curly hair',
        eyeColor: 'Amber',
        distinctiveFeatures: 'Freckles across nose',
        attire: 'Artisan vest with leather pouches',
        overallVibe: 'Enthusiastic apprentice'
      },
      characterArc: {
        startingState: 'Uncertain novice',
        catalyst: 'First encounter with time-rift',
        climaxShift: 'Takes initiative',
        endingState: 'Reliable ally'
      },
      relationships: [],
      expressions: ['Wide-eyed wonder', 'Determined nod'],
      futureDevelopment: 'Will develop acute mechanical intuition.'
    };

    onUpdateCharacters([...project.characters, newChar]);
    setSelectedCharId(newChar.id);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('characters')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'characters'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Character DNA Lab ({project.characters.length})
          </button>
          <button
            onClick={() => setSubTab('world')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'world'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            World & Lore Bible
          </button>
        </div>

        {subTab === 'characters' && (
          <button
            onClick={handleAddCharacter}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Character
          </button>
        )}
      </div>

      {/* CHARACTER TAB CONTENT */}
      {subTab === 'characters' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Character List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 px-1">
              Characters Roster
            </h3>

            {project.characters.map((char) => (
              <button
                key={char.id}
                onClick={() => setSelectedCharId(char.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  char.id === selectedChar?.id
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold">{char.name}</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-mono">{char.role}</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                  {char.visualDNA.eyeColor || 'DNA Set'}
                </span>
              </button>
            ))}
          </div>

          {/* Right 2 Columns: Character Detailed DNA Profile */}
          {selectedChar && (
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{selectedChar.name}</h3>
                  <p className="text-xs text-amber-400 font-mono uppercase">{selectedChar.role} Profile</p>
                </div>
              </div>

              {/* Visual DNA Grid */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Visual DNA & Aesthetics
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Ethnicity / Species</span>
                    <span className="text-slate-200">{selectedChar.visualDNA.ethnicityOrSpecies}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Hair Color & Style</span>
                    <span className="text-slate-200">{selectedChar.visualDNA.hairColorStyle}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Eye Color</span>
                    <span className="text-slate-200">{selectedChar.visualDNA.eyeColor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Distinctive Features</span>
                    <span className="text-slate-200">{selectedChar.visualDNA.distinctiveFeatures}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-500 font-mono block">Attire & Wardrobe</span>
                    <span className="text-slate-200">{selectedChar.visualDNA.attire}</span>
                  </div>
                </div>
              </div>

              {/* Character Arc */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Character Arc Progression
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Starting State</span>
                    <p className="text-slate-300">{selectedChar.characterArc.startingState}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Catalyst Event</span>
                    <p className="text-slate-300">{selectedChar.characterArc.catalyst}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Climax Shift</span>
                    <p className="text-slate-300">{selectedChar.characterArc.climaxShift}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Ending Resolution</span>
                    <p className="text-slate-300">{selectedChar.characterArc.endingState}</p>
                  </div>
                </div>
              </div>

              {/* Dialogue Style */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-sky-400 font-mono uppercase flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  Dialogue Style & Linguistic Fingerprint
                </h4>
                <p className="text-xs text-slate-300">Tone: {selectedChar.dialogueStyle.tone}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">Catchphrases:</span>
                  {selectedChar.dialogueStyle.catchphrases.map((phrase, idx) => (
                    <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                      "{phrase}"
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* WORLD BIBLE TAB CONTENT */}
      {subTab === 'world' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-slate-100">{project.worldBible.universeName}</h3>
            <p className="text-xs text-slate-400 mt-1">{project.worldBible.settingOverview}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Lore & History */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 font-mono uppercase flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Lore & Historical Origins
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{project.worldBible.lore}</p>
            </div>

            {/* Magic / Tech System */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                Magic or Tech Laws
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{project.worldBible.magicOrTechSystem}</p>
            </div>

            {/* Universe Rules */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Non-Negotiable Universe Rules
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                {project.worldBible.rulesOfUniverse.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>

            {/* Locations */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-sky-400 font-mono uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Key World Locations
              </h4>
              <div className="space-y-2">
                {project.worldBible.locations.map((loc, idx) => (
                  <div key={idx} className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                    <span className="text-xs font-bold text-slate-200 block">{loc.name}</span>
                    <span className="text-[11px] text-slate-400 block">{loc.description}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
