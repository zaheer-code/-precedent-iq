import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  FileText,
  Copy,
  Check,
  Filter,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { evidenceAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, Badge } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/Modal';
import { Select } from '../../components/common/Input';
import { DocumentCategoryBadge } from '../../components/legal/SeverityBadge';

export default function EvidenceTab({ matter, documents = [], onSelectCitation }) {
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalChunks, setTotalChunks] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  const { showError } = useToast();

  const loadEvidence = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await evidenceAPI.listByMatter(matter.id, {
        documentId: selectedDocId || undefined,
        search: searchTerm || undefined,
        page: pageNum,
        limit: 15
      });

      if (res.data) {
        setChunks(res.data.chunks || []);
        setTotalChunks(res.data.total || 0);
        setPage(pageNum);
      }
    } catch (err) {
      showError('Failed to load evidence index.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence(1);
  }, [selectedDocId, matter.id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadEvidence(1);
  };

  const copyChunk = (chunk, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(chunk.content);
    setCopiedId(chunk.chunk_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const docOptions = [
    { value: '', label: 'All Ingested Documents' },
    ...documents.map(d => ({ value: d.id, label: d.original_filename }))
  ];

  const totalPages = Math.ceil(totalChunks / 15) || 1;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            Evidence & Semantic Vector Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Directly browse, search, and verify indexed chunk vectors stored in pgvector for this matter
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/30">
          <ShieldCheck className="w-4 h-4" />
          <span>{totalChunks} Grounded Chunks</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-[#10141e]">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vector text content (e.g. indemnity, liability, delivery date)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0a0d14] border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="w-full md:w-64">
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0d14] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
            >
              {docOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <Button type="submit" variant="secondary" size="sm">
            Filter Vectors
          </Button>

        </form>
      </Card>

      {/* Chunk List */}
      {loading ? (
        <Card className="py-12">
          <LoadingSpinner text="Querying pgvector chunks..." />
        </Card>
      ) : chunks.length > 0 ? (
        <div className="space-y-3">
          {chunks.map((c) => (
            <Card
              key={c.chunk_id}
              hover
              onClick={() => onSelectCitation && onSelectCitation({
                chunkId: c.chunk_id,
                documentId: c.document_id,
                documentName: c.document_name,
                page: c.page_number,
                quotedEvidence: c.content
              })}
              className="p-5 bg-[#0f1420] border-slate-800 hover:border-amber-500/40 space-y-3 transition-all cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/60 text-xs">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="font-semibold text-slate-200">{c.document_name}</span>
                  <DocumentCategoryBadge category={c.category} />
                </div>

                <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
                  <span className="text-amber-300 font-semibold">Page {c.page_number}</span>
                  <span>•</span>
                  <span>Chunk #{c.chunk_index}</span>
                  <span>•</span>
                  <span>{c.token_count || '~150'} tokens</span>
                  
                  <button
                    onClick={(e) => copyChunk(c, e)}
                    className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors ml-2"
                    title="Copy Chunk Text"
                  >
                    {copiedId === c.chunk_id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs font-serif text-slate-200 leading-relaxed line-clamp-4 select-text">
                "{c.content}"
              </p>
            </Card>
          ))}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 bg-[#10141e] rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">
              Page <span className="text-slate-200 font-semibold">{page}</span> of <span className="text-slate-200 font-semibold">{totalPages}</span> ({totalChunks} total chunks)
            </span>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => loadEvidence(page - 1)}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => loadEvidence(page + 1)}
                icon={ChevronRight}
              >
                Next
              </Button>
            </div>
          </div>

        </div>
      ) : (
        <Card className="p-8 text-center text-xs text-slate-500">
          No chunks found matching current query.
        </Card>
      )}

    </div>
  );
}
