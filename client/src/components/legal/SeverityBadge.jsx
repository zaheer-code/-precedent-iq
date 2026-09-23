import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Clock, XCircle, FileUp } from 'lucide-react';
import { Badge } from '../common/Card';

export function SeverityBadge({ severity }) {
  const sev = (severity || 'low').toLowerCase();

  if (sev === 'high') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40">
        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        HIGH SEVERITY
      </span>
    );
  } else if (sev === 'medium') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/40">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        MODERATE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30">
      <Info className="w-3.5 h-3.5 text-sky-400" />
      LOW
    </span>
  );
}

export function DocumentCategoryBadge({ category }) {
  const cat = category || 'Other';
  const colorMap = {
    'Case Law': 'purple',
    'Statute': 'navy',
    'Regulation': 'navy',
    'Contract': 'gold',
    'Deposition': 'warning',
    'Complaint': 'danger',
    'Motion': 'warning',
    'Brief': 'success',
    'Order': 'purple',
    'Exhibit': 'default'
  };

  return (
    <Badge variant={colorMap[cat] || 'default'} size="xs">
      {cat}
    </Badge>
  );
}

export function StatusBadge({ status, error }) {
  const s = (status || 'UPLOADED').toUpperCase();

  if (s === 'READY') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        Ready
      </span>
    );
  } else if (s === 'PROCESSING') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
        <Clock className="w-3 h-3 text-amber-400 animate-spin" />
        Indexing...
      </span>
    );
  } else if (s === 'FAILED') {
    return (
      <span
        title={error || 'Processing failed'}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 cursor-help"
      >
        <XCircle className="w-3 h-3 text-rose-400" />
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
      <FileUp className="w-3 h-3 text-slate-400" />
      Uploaded
    </span>
  );
}
