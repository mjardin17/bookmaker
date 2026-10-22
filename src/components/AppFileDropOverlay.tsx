import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, FileText, Image, FileCode, CheckCircle2, 
  AlertCircle, Sparkles, X, FileSpreadsheet, Music, Video
} from 'lucide-react';
import { PublishingProject, ProjectMilestone, Chapter } from '../types/storyforge';

interface AppFileDropOverlayProps {
  onImportProject?: (projectData: any) => void;
  onImportManuscriptText?: (title: string, content: string) => void;
  onImportSchedule?: (scheduleData: any) => void;
  onImportImage?: (dataUrl: string, fileName: string) => void;
  onNotification?: (msg: string, type: 'success' | 'error') => void;
}

export const AppFileDropOverlay: React.FC<AppFileDropOverlayProps> = ({
  onImportProject,
  onImportManuscriptText,
  onImportSchedule,
  onImportImage,
  onNotification
}) => {
  const [isDraggingOverWindow, setIsDraggingOverWindow] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      setDragCounter(prev => prev + 1);
      if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
        setIsDraggingOverWindow(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setDragCounter(prev => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          setIsDraggingOverWindow(false);
        }
        return next;
      });
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOverWindow(false);
      setDragCounter(0);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const fileName = file.name;
      const lowerName = fileName.toLowerCase();

      try {
        // 1. JSON file: Project Backup, Schedule, or Milestones
        if (lowerName.endsWith('.json')) {
          const text = await file.text();
          const parsed = JSON.parse(text);

          if (parsed.milestones && Array.isArray(parsed.milestones) && onImportSchedule) {
            onImportSchedule(parsed.milestones);
            onNotification?.(`Imported project timeline & milestones from "${fileName}"`, 'success');
          } else if (parsed.name && parsed.manuscript && onImportProject) {
            onImportProject(parsed);
            onNotification?.(`Imported book project "${parsed.name}" from "${fileName}"`, 'success');
          } else if (Array.isArray(parsed) && onImportProject) {
            onImportProject(parsed[0]);
            onNotification?.(`Imported seed project from "${fileName}"`, 'success');
          } else if (onImportSchedule) {
            onImportSchedule(parsed);
            onNotification?.(`Imported schedule configuration from "${fileName}"`, 'success');
          }
        }
        // 2. CSV / TSV file: Schedule / Task Sheet
        else if (lowerName.endsWith('.csv') || lowerName.endsWith('.tsv')) {
          const text = await file.text();
          const lines = text.split(/\r?\n/).filter(Boolean);
          if (lines.length > 1 && onImportSchedule) {
            onImportSchedule({ csvText: text, fileName });
            onNotification?.(`Imported schedule tasks from CSV "${fileName}" (${lines.length - 1} entries)`, 'success');
          }
        }
        // 3. Text / Markdown / Document: Manuscript Chapters
        else if (lowerName.endsWith('.txt') || lowerName.endsWith('.md') || lowerName.endsWith('.docx')) {
          const text = await file.text();
          const title = fileName.replace(/\.[^/.]+$/, '');
          if (onImportManuscriptText) {
            onImportManuscriptText(title, text);
            onNotification?.(`Imported manuscript text from "${fileName}" (${text.split(/\s+/).filter(Boolean).length} words)`, 'success');
          }
        }
        // 4. Image: Cover Art or Character Visuals
        else if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (readEvent) => {
            const dataUrl = readEvent.target?.result as string;
            if (dataUrl && onImportImage) {
              onImportImage(dataUrl, fileName);
              onNotification?.(`Imported visual artwork "${fileName}" into studio assets`, 'success');
            }
          };
          reader.readAsDataURL(file);
        } else {
          // Fallback text read
          const text = await file.text();
          if (onImportManuscriptText) {
            onImportManuscriptText(fileName, text);
            onNotification?.(`Imported file "${fileName}" into active project`, 'success');
          }
        }
      } catch (err: any) {
        onNotification?.(`Error reading dropped file "${fileName}": ${err.message}`, 'error');
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [onImportProject, onImportManuscriptText, onImportSchedule, onImportImage, onNotification]);

  if (!isDraggingOverWindow) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="border-2 border-dashed border-amber-400 bg-slate-900/90 rounded-3xl p-8 max-w-xl w-full text-center shadow-2xl shadow-amber-500/20 space-y-4">
        
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-sky-500 p-0.5 mx-auto animate-bounce">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <UploadCloud className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <span>Drop File Right Here to Import</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Empire OS Smart Ingest
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
            Release your file to instantly import manuscripts, update project milestone schedules, or assign visual artwork.
          </p>
        </div>

        {/* Supported File Types Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left pt-2">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] font-bold">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>MANUSCRIPTS</span>
            </div>
            <div className="text-[11px] text-slate-300 font-semibold mt-0.5">.txt, .md, .docx</div>
            <div className="text-[9px] text-slate-500">Auto-creates chapters</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-sky-400 font-mono text-[10px] font-bold">
              <FileCode className="w-3.5 h-3.5 text-sky-400" />
              <span>SCHEDULES</span>
            </div>
            <div className="text-[11px] text-slate-300 font-semibold mt-0.5">.json, .csv, .tsv</div>
            <div className="text-[9px] text-slate-500">Gantt milestone dates</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] font-bold">
              <Image className="w-3.5 h-3.5 text-emerald-400" />
              <span>ART & COVERS</span>
            </div>
            <div className="text-[11px] text-slate-300 font-semibold mt-0.5">.png, .jpg, .webp</div>
            <div className="text-[9px] text-slate-500">Assigns cover image</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-purple-400 font-mono text-[10px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>FULL BACKUPS</span>
            </div>
            <div className="text-[11px] text-slate-300 font-semibold mt-0.5">project.json</div>
            <div className="text-[9px] text-slate-500">Restores whole project</div>
          </div>
        </div>

        <div className="pt-2 text-[10px] font-mono text-slate-400 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Listening for drop events across active workspace</span>
        </div>

      </div>
    </div>
  );
};
