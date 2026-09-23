import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Clock, XCircle, FileUp } from 'lucide-react';
import { Badge } from '../common/Card';

export function SeverityBadge({ severity }) {
  const sev = (severity || 'low').toLowerCase();

  if (sev === 'high') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D9A62E]/20 text-[#D9A62E] border border-[#D9A62E]/50">
        <AlertCircle className="w-3.5 h-3.5 text-[#D9A62E]" />
        HIGH SEVERITY
      </span>
    );
  } else if (sev === 'medium') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D9A62E]/10 text-[#D9A62E] border border-[#D9A62E]/30">
        <AlertTriangle className="w-3.5 h-3.5 text-[#D9A62E]" />
        MODERATE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#151E36] text-[#9CA3AF] border border-[#1C2640]">
      <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
      LOW
    </span>
  );
}

export function DocumentCategoryBadge({ category }) {
  const cat = category || 'Other';
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-tight bg-[#151E36] text-[#F3F4F6] border border-[#1C2640]">
      {cat}
    </span>
  );
}

export function StatusBadge({ status, error }) {
  const s = (status || 'UPLOADED').toUpperCase();

  if (s === 'READY') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#D9A62E]/10 text-[#D9A62E] border border-[#D9A62E]/30">
        <CheckCircle2 className="w-3 h-3 text-[#D9A62E]" />
        Ready
      </span>
    );
  } else if (s === 'PROCESSING') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#151E36] text-[#D9A62E] border border-[#D9A62E]/40 animate-pulse">
        <Clock className="w-3 h-3 text-[#D9A62E] animate-spin" />
        Indexing...
      </span>
    );
  } else if (s === 'FAILED') {
    return (
      <span
        title={error || 'Processing failed'}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#1A1420] text-rose-300 border border-rose-900/40 cursor-help"
      >
        <XCircle className="w-3 h-3 text-rose-400" />
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#151E36] text-[#9CA3AF] border border-[#1C2640]">
      <FileUp className="w-3 h-3 text-[#9CA3AF]" />
      Uploaded
    </span>
  );
}
