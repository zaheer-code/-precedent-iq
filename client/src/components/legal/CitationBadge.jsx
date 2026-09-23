import React from 'react';
import { BookOpen } from 'lucide-react';

export default function CitationBadge({ citation, onClick, className = '' }) {
  if (!citation) return null;

  const docName = citation.documentName || 'Document';
  const page = citation.page || citation.pageNumber || 1;

  return (
    <button
      type="button"
      onClick={() => onClick && onClick(citation)}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${className}`}
      title={`Click to inspect source evidence: ${docName}, Page ${page}`}
    >
      <BookOpen className="w-3 h-3 text-amber-400 flex-shrink-0" />
      <span className="truncate max-w-[140px]">{docName}</span>
      <span className="text-amber-400 font-mono text-[11px]">p.{page}</span>
    </button>
  );
}
