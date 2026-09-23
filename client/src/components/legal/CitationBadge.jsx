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
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D9A62E]/10 hover:bg-[#D9A62E]/20 text-[#F3F4F6] border border-[#D9A62E]/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${className}`}
      title={`Click to inspect source evidence: ${docName}, Page ${page}`}
    >
      <BookOpen className="w-3 h-3 text-[#D9A62E] flex-shrink-0" />
      <span className="truncate max-w-[140px] text-[#F3F4F6]">{docName}</span>
      <span className="text-[#D9A62E] font-mono text-[11px] font-semibold">p.{page}</span>
    </button>
  );
}
