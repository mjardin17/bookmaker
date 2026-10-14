import React from 'react';
import { PublishingProject, PublishingMetadata } from '../types/storyforge';
import { 
  Book, ShoppingCart, DollarSign, Barcode, Tag, 
  FileText, Download, CheckCircle2, Shield 
} from 'lucide-react';

interface PublishingStudioProps {
  project: PublishingProject;
  onUpdateMetadata: (updated: Partial<PublishingMetadata>) => void;
  onDownloadFormats: (format: 'pdf' | 'epub' | 'docx') => void;
}

export const PublishingStudio: React.FC<PublishingStudioProps> = ({
  project,
  onUpdateMetadata,
  onDownloadFormats
}) => {
  const meta = project.publishingMetadata;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShoppingCart className="w-3 h-3" />
                Amazon KDP & Direct Publishing Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ISBN: {meta.isbn || 'Pending Allocation'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              KDP Metadata & Print Spec Suite
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Configures title metadata, BISAC categories, 7 Amazon keywords, HTML descriptions, print trim specs (5x8, 6x9, 8.5x8.5, 8.5x11), and estimates KDP royalties.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownloadFormats('epub')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4" />
              Download EPUB
            </button>
            <button
              onClick={() => onDownloadFormats('pdf')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Print PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Form Fields */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Book className="w-4 h-4 text-amber-400" />
            Amazon KDP Book Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 font-mono mb-1">KDP Title</label>
              <input
                type="text"
                value={meta.kdpTitle || ''}
                onChange={(e) => onUpdateMetadata({ kdpTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-mono mb-1">Author Pen Name</label>
              <input
                type="text"
                value={meta.penName || ''}
                onChange={(e) => onUpdateMetadata({ penName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-mono mb-1">HTML Formatted Book Description</label>
            <textarea
              rows={5}
              value={meta.bookDescriptionHtml || ''}
              onChange={(e) => onUpdateMetadata({ bookDescriptionHtml: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* 7 Amazon Keywords */}
          <div>
            <label className="block text-xs text-slate-400 font-mono mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              7 Amazon KDP Backend Keywords
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {meta.amazonKeywords?.map((kw, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
                  <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                  <input
                    type="text"
                    value={kw}
                    onChange={(e) => {
                      const updated = [...meta.amazonKeywords];
                      updated[idx] = e.target.value;
                      onUpdateMetadata({ amazonKeywords: updated });
                    }}
                    className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Print Spec & Royalty Calculator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Print Specifications & Royalty Calculator
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Trim Size</label>
              <select
                value={meta.printFormat?.trimSize || '5x8'}
                onChange={(e) => onUpdateMetadata({
                  printFormat: {
                    ...meta.printFormat,
                    trimSize: e.target.value as any,
                    paperType: meta.printFormat?.paperType || 'Cream',
                    bleed: meta.printFormat?.bleed || false,
                    coverFinish: meta.printFormat?.coverFinish || 'Matte'
                  }
                })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="5x8">5" x 8" (Standard Digest)</option>
                <option value="6x9">6" x 9" (US Trade)</option>
                <option value="8.5x8.5">8.5" x 8.5" (Square Children's Book)</option>
                <option value="8.5x11">8.5" x 11" (Workbook / Picture Book)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">List Price (USD)</label>
              <input
                type="number"
                step="0.01"
                value={meta.priceUSD || 12.99}
                onChange={(e) => onUpdateMetadata({ priceUSD: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              />
            </div>

            {/* Estimated Royalty Summary */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-1">
              <span className="text-[10px] text-emerald-400 font-mono uppercase block">Est. Royalty Per KDP Sale (60% Rate)</span>
              <p className="text-xl font-bold text-emerald-300">
                ${( (meta.priceUSD || 12.99) * 0.60 - 1.25 ).toFixed(2)} USD
              </p>
              <span className="text-[10px] text-slate-400 block">Calculated at standard print cost per unit.</span>
            </div>
          </div>

          {/* Barcode & ISBN Mock */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center space-y-2">
            <Barcode className="w-12 h-12 text-slate-400 mx-auto opacity-80" />
            <span className="text-[10px] text-slate-500 font-mono block">ISBN-13 Barcode Generated</span>
            <span className="text-xs font-mono font-bold text-slate-300">{meta.isbn || '978-1-987654-32-1'}</span>
          </div>

        </div>

      </div>
    </div>
  );
};
