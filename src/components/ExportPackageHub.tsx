import React, { useState } from 'react';
import { PublishingProject } from '../types/storyforge';
import JSZip from 'jszip';
import { 
  Download, FileJson, Layers, CheckCircle2, 
  Sparkles, ShieldCheck, Copy, Check, FileArchive, Code, Terminal
} from 'lucide-react';

interface ExportPackageHubProps {
  project: PublishingProject;
}

export const ExportPackageHub: React.FC<ExportPackageHubProps> = ({ project }) => {
  const [isZipping, setIsZipping] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const packageFiles = [
    { name: 'book.json', label: 'Book Manuscript & Chapter Prose', size: '~24 KB' },
    { name: 'world_bible.json', label: 'World Bible & Universe Lore', size: '~12 KB' },
    { name: 'character_bible.json', label: 'Character DNA & Relationships', size: '~18 KB' },
    { name: 'series_bible.json', label: 'Series Continuum & Timeline', size: '~10 KB' },
    { name: 'illustration_guide.json', label: 'Illustration Style & Multi-Prompts', size: '~15 KB' },
    { name: 'cover_brief.json', label: 'Book Cover Art Brief & Typography', size: '~8 KB' },
    { name: 'cartoon_episodes.json', label: 'AI Cartoon Episodes & Animatic Timelines', size: '~32 KB' },
    { name: 'teacher_guide.json', label: 'Classroom & STEM Activity Guide', size: '~14 KB' },
    { name: 'activity_book.json', label: 'Coloring Pages & Puzzle Specs', size: '~11 KB' },
    { name: 'metadata.json', label: 'Amazon KDP & BISAC Metadata', size: '~6 KB' },
    { name: 'marketing_brief.json', label: 'Social & Email Campaign Assets', size: '~16 KB' },
    { name: 'franchise_plan.json', label: 'Merch & Video Trailer Scripts', size: '~14 KB' }
  ];

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folderName = project.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const rootFolder = zip.folder(folderName);

      if (rootFolder) {
        rootFolder.file('book.json', JSON.stringify(project.manuscript, null, 2));
        rootFolder.file('world_bible.json', JSON.stringify(project.worldBible, null, 2));
        rootFolder.file('character_bible.json', JSON.stringify(project.characters, null, 2));
        rootFolder.file('illustration_guide.json', JSON.stringify(project.illustrationGuide, null, 2));
        rootFolder.file('cartoon_episodes.json', JSON.stringify(project.cartoonEpisodes || [], null, 2));
        rootFolder.file('metadata.json', JSON.stringify(project.publishingMetadata, null, 2));
        rootFolder.file('marketing_brief.json', JSON.stringify(project.marketingPack, null, 2));
        rootFolder.file('video_pack.json', JSON.stringify(project.videoPack, null, 2));
        rootFolder.file('merch_pack.json', JSON.stringify(project.merchPack, null, 2));
        rootFolder.file('empire_os_full_package.json', JSON.stringify(project, null, 2));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${folderName}_empire_os_package.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP export error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyFullPackage = () => {
    navigator.clipboard.writeText(JSON.stringify(project, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Full Repository Codebase ZIP Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-sky-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-semibold">
                <FileArchive className="w-3.5 h-3.5 text-sky-400" />
                Entire Project Codebase
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Ready to Download (.ZIP)
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Download Complete Empire OS Repository (.ZIP)
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Includes the complete frontend & backend application: all React components, StoryForge modules, 9-expert Literary Council engine, Express server, TypeScript models, configuration, seed datasets, and local run instructions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/api/download-project-zip"
              download="empire-os-complete-project.zip"
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              Download Full Project (.ZIP)
            </a>
          </div>
        </div>

        {/* Quick Instructions bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-amber-400" /> Run locally:
          </span>
          <code className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-sky-300">
            unzip empire-os-complete-project.zip
          </code>
          <code className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-amber-300">
            npm install
          </code>
          <code className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-emerald-300">
            npm run dev
          </code>
        </div>
      </div>

      {/* Header for Story Data Package */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Empire OS Portable Story Package
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              11-File Master JSON Story Package Export
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Export the active story project into standardized JSON structures compatible with Empire OS, Jardin's Outpost, and external AI agents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFullPackage}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
            >
              {copiedJson ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              {copiedJson ? 'Copied Full JSON!' : 'Copy Master JSON'}
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/10 flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              {isZipping ? 'Zipping Package...' : 'Download Story ZIP Bundle'}
            </button>
          </div>
        </div>
      </div>

      {/* Package File List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <FileJson className="w-4 h-4 text-amber-400" />
          Included Story Package Manifest
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {packageFiles.map((file, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <FileJson className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-200 font-mono block">{file.name}</span>
                  <span className="text-[10px] text-slate-500 block">{file.label}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{file.size}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
