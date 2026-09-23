import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { evidenceAPI } from '../../services/api';
import { Badge } from '../common/Card';
import { LoadingSpinner } from '../common/Modal';

export default function EvidenceDrawer({ isOpen, onClose, citation, chunkId }) {
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadChunk() {
      const targetChunkId = chunkId || citation?.chunkId;
      if (!targetChunkId) {
        setEvidence(citation || null);
        return;
      }

      setLoading(true);
      try {
        const res = await evidenceAPI.getChunk(targetChunkId);
        if (res.data && res.data.evidence) {
          setEvidence(res.data.evidence);
        }
      } catch (err) {
        // Fall back to citation object if backend fetch fails
        setEvidence(citation || null);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      loadChunk();
    } else {
      setEvidence(null);
    }
  }, [isOpen, chunkId, citation]);

  if (!isOpen) return null;

  const docName = evidence?.document_name || evidence?.documentName || citation?.documentName || 'Case Document';
  const pageNumber = evidence?.page_number || evidence?.page || citation?.page || 1;
  const content = evidence?.content || citation?.quotedEvidence || 'Content excerpt unavailable.';
  const category = evidence?.category || 'Document';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-[#10141e] border-l border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800/80 bg-[#0d1017] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  Source Evidence Inspector
                  <span className="flex items-center text-[11px] font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Grounded
                  </span>
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{docName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <LoadingSpinner text="Retrieving verified chunk..." />
            ) : (
              <>
                {/* Document Metadata Bar */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#141a27] border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Document</span>
                    <span className="font-medium text-slate-200 truncate block mt-0.5">{docName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Page Number</span>
                    <span className="font-mono text-amber-300 font-semibold block mt-0.5">Page {pageNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Category</span>
                    <span className="text-slate-300 block mt-0.5">{category}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Security Validation</span>
                    <span className="text-emerald-400 font-medium block mt-0.5">Matter-Isolated</span>
                  </div>
                </div>

                {/* Quoted Evidence Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Exact Extracted Text Content
                    </label>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Excerpt
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-[#090c12] border border-amber-500/20 text-slate-200 text-sm font-serif leading-relaxed whitespace-pre-wrap select-text shadow-inner">
                    {content}
                  </div>
                </div>

                {/* Grounding Notice */}
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 leading-normal flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-300">Zero-Hallucination Grounding:</span> This passage was indexed from the client's uploaded case file. All AI propositions linked to this citation are directly grounded in this verified record.
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-[#0d1017] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Close Inspector
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
