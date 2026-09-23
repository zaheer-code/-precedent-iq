import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  Filter,
  CheckCircle2,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { researchAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, Badge } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { LoadingSpinner, EmptyState } from '../../components/common/Modal';
import { Input, Select, Textarea } from '../../components/common/Input';
import CitationBadge from '../../components/legal/CitationBadge';

const ANALYSIS_MODES = [
  { value: 'precedent_search', label: 'Case Law & Precedent Analysis' },
  { value: 'argument_analysis', label: 'Legal Argument Synthesis' },
  { value: 'fact_extraction', label: 'Chronological Fact Extraction' },
  { value: 'contract_analysis', label: 'Contract & Obligation Review' },
  { value: 'legal_issue_analysis', label: 'Legal Issue Spotting' },
  { value: 'summary', label: 'Executive Matter Summary' }
];

export default function ResearchTab({ matter, documents = [], onSelectCitation }) {
  const [queryText, setQueryText] = useState('');
  const [analysisType, setAnalysisType] = useState('precedent_search');
  const [searchDepth, setSearchDepth] = useState(6);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showRawEvidence, setShowRawEvidence] = useState(false);

  const { showSuccess, showError } = useToast();

  const handleToggleDoc = (docId) => {
    setSelectedDocIds(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const handleRunResearch = async (e) => {
    e.preventDefault();
    if (!queryText.trim()) {
      showError('Please enter a research question.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await researchAPI.query(matter.id, {
        query: queryText,
        analysisType,
        searchDepth: parseInt(searchDepth, 10),
        selectedDocuments: selectedDocIds
      });

      if (res.data && res.data.result) {
        setResult(res.data.result);
        showSuccess('Research analysis completed.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Research query failed. Please verify document status.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    "What specific notice deadlines apply under the governing agreement?",
    "What evidence substantiates the defendant's alleged breach?",
    "Are there any contradictory statements regarding the delivery date?"
  ];

  return (
    <div className="space-y-8">
      
      {/* Research Query Card */}
      <Card className="p-6 bg-[#11182D] border-[#1C2640]">
        <form onSubmit={handleRunResearch} className="space-y-5">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold tracking-tight text-[#F3F4F6] flex items-center gap-2">
                <Search className="w-5 h-5 text-[#D9A62E]" />
                Zero-Hallucination Legal Research Engine
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Query across all indexed case filings. Every proposition is backed by verified page citations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="gold" size="xs">
                <ShieldCheck className="w-3 h-3 mr-1" /> Matter-Isolated pgvector
              </Badge>
            </div>
          </div>

          <Textarea
            label="Research Question / Inquiry *"
            placeholder="e.g. What contractual provisions govern termination for convenience and what cure periods are required?"
            rows={3}
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            required
          />

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Suggested:</span>
            {sampleQueries.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQueryText(sq)}
                className="px-2.5 py-1 rounded-lg bg-[#0E1528] hover:bg-[#151E36] border border-[#1C2640] text-slate-300 hover:text-[#D9A62E] text-[11px] transition-colors"
              >
                "{sq}"
              </button>
            ))}
          </div>

          {/* Configuration Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#1C2640]">
            <Select
              label="Analysis Framework"
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              options={ANALYSIS_MODES}
            />

            <Select
              label="Vector Retrieval Depth (Top Chunks)"
              value={searchDepth}
              onChange={(e) => setSearchDepth(e.target.value)}
              options={[
                { value: '3', label: 'Targeted (Top 3 Chunks)' },
                { value: '6', label: 'Standard (Top 6 Chunks)' },
                { value: '10', label: 'Deep (Top 10 Chunks)' },
                { value: '15', label: 'Exhaustive (Top 15 Chunks)' }
              ]}
            />
          </div>

          {/* Optional Document Scoping Filter */}
          {documents.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Filter Specific Documents (Optional)</span>
                {selectedDocIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDocIds([])}
                    className="text-[#D9A62E] hover:underline lowercase font-normal"
                  >
                    clear ({selectedDocIds.length} selected)
                  </button>
                )}
              </label>
              
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-[#0B1020] rounded-xl border border-[#1C2640]">
                {documents.map((doc) => {
                  const isSelected = selectedDocIds.includes(doc.id);
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => handleToggleDoc(doc.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
                        isSelected
                          ? 'bg-[#D9A62E]/15 text-[#D9A62E] border border-[#D9A62E]/35 font-medium'
                          : 'bg-[#0E1528] text-slate-400 border border-[#1C2640] hover:text-[#F3F4F6]'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span className="truncate max-w-[160px]">{doc.original_filename}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={Sparkles}
            >
              Analyze & Synthesize Evidence
            </Button>
          </div>

        </form>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="py-12 bg-[#11182D] border-[#1C2640]">
          <LoadingSpinner text="Retrieving vector similarities & cross-checking citations in pgvector..." size="lg" />
        </Card>
      )}

      {/* Results Display */}
      {result && !loading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Main Answer Card */}
          <Card className="p-6 border-[#D9A62E]/35 bg-[#11182D]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1C2640]">
              <h3 className="text-base font-bold text-[#D9A62E] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D9A62E]" />
                Grounded Legal Synthesis
              </h3>
              <Badge
                variant={result.confidence === 'high' ? 'success' : result.confidence === 'medium' ? 'gold' : 'warning'}
                size="sm"
              >
                Confidence: {(result.confidence || 'Medium').toUpperCase()}
              </Badge>
            </div>

            <div className="text-sm font-normal text-[#F3F4F6] leading-relaxed whitespace-pre-wrap select-text">
              {result.answer}
            </div>
          </Card>

          {/* Structured Findings & Claims with Citation Badges */}
          {result.findings && result.findings.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold tracking-tight text-[#F3F4F6] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D9A62E]" />
                Substantive Findings & Grounded Citations ({result.findings.length})
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {result.findings.map((f, idx) => (
                  <Card key={idx} className="space-y-3 p-5 bg-[#0E1528] border-[#1C2640]">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-xs font-semibold text-[#D9A62E] uppercase tracking-wider">
                        {f.claim}
                      </h4>
                    </div>

                    <p className="text-xs text-[#F3F4F6] leading-relaxed">
                      {f.explanation}
                    </p>

                    {/* Citations list */}
                    {f.citations && f.citations.length > 0 && (
                      <div className="pt-2 border-t border-[#1C2640] flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Source Citations:
                        </span>
                        {f.citations.map((cit, cIdx) => (
                          <CitationBadge
                            key={cIdx}
                            citation={cit}
                            onClick={onSelectCitation}
                          />
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Conflicting Evidence Box */}
          {result.conflicts && result.conflicts.length > 0 && (
            <Card className="p-5 border-[#D9A62E]/35 bg-[#151E36] space-y-2">
              <h4 className="text-xs font-bold text-[#D9A62E] uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#D9A62E]" />
                Conflicting Evidence Detected in Case Record
              </h4>
              <ul className="list-disc list-inside text-xs text-[#F3F4F6] space-y-1 pl-1">
                {result.conflicts.map((conf, i) => (
                  <li key={i}>{typeof conf === 'string' ? conf : JSON.stringify(conf)}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Evidence Gaps Box */}
          {result.evidenceGaps && result.evidenceGaps.length > 0 && (
            <Card className="p-5 border-[#1C2640] bg-[#0E1528] space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                Documentary Evidence Gaps & Missing Record Information
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-1">
                {result.evidenceGaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Raw Retrieved Evidence Accordion */}
          {result.retrievedEvidence && result.retrievedEvidence.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowRawEvidence(!showRawEvidence)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#D9A62E] transition-colors"
              >
                {showRawEvidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showRawEvidence ? 'Hide' : 'Inspect'} Retrieved Vector Evidence ({result.retrievedEvidence.length} chunks)
              </button>

              {showRawEvidence && (
                <div className="mt-3 space-y-3">
                  {result.retrievedEvidence.map((chunk, idx) => (
                    <Card
                      key={idx}
                      hover
                      onClick={() => onSelectCitation && onSelectCitation(chunk)}
                      className="p-4 bg-[#0E1528] border-[#1C2640] text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#D9A62E]">
                          {chunk.documentName} • Page {chunk.pageNumber}
                        </span>
                        <span className="font-medium text-slate-400">
                          Similarity: {(chunk.similarityScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-slate-300 font-normal line-clamp-3 leading-relaxed">
                        "{chunk.content}"
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
