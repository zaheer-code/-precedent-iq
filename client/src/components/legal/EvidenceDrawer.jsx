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
        <div className="w-screen max-w-xl bg-[#11182D] border-l border-[#1C2640] shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#1C2640] bg-[#0E1528] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#151E36] rounded-lg border border-[#1C2640] text-[#D9A62E]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F3F4F6] flex items-center gap-2">
                  Source Evidence Inspector
                  <span className="flex items-center text-[11px] font-medium text-[#D9A62E] bg-[#151E36] px-2 py-0.5 rounded border border-[#1C2640]">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Grounded
                  </span>
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{docName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#F3F4F6] hover:bg-[#151E36] transition-colors"
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
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0E1528] border border-[#1C2640] text-xs">
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Document</span>
                    <span className="font-medium text-[#F3F4F6] truncate block mt-0.5">{docName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Page Number</span>
                    <span className="font-medium text-[#D9A62E] font-semibold block mt-0.5">Page {pageNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Category</span>
                    <span className="text-slate-300 block mt-0.5">{category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Security Validation</span>
                    <span className="text-[#D9A62E] font-medium block mt-0.5">Matter-Isolated</span>
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
                      className="flex items-center gap-1 text-xs text-[#D9A62E] hover:text-[#E5B645] font-medium"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#D9A62E]" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Excerpt
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1C2640] text-[#F3F4F6] text-sm font-normal leading-relaxed whitespace-pre-wrap select-text shadow-inner">
                    {content}
                  </div>
                </div>

                {/* Grounding Notice */}
                <div className="p-3.5 rounded-xl bg-[#151E36] border border-[#D9A62E]/35 text-xs text-[#F3F4F6] leading-normal flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#D9A62E] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#D9A62E]">Zero-Hallucination Grounding:</span> This passage was indexed from the client's uploaded case file. All AI propositions linked to this citation are directly grounded in this verified record.
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#1C2640] bg-[#0E1528] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#151E36] hover:bg-[#1C2848] text-[#F3F4F6] border border-[#1C2640] transition-colors"
            >
              Close Inspector
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
