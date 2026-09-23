import React, { useState } from 'react';
import {
  GitCompare,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { clauseAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, Badge } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { LoadingSpinner, EmptyState } from '../../components/common/Modal';
import { Select, Input } from '../../components/common/Input';
import CitationBadge from '../../components/legal/CitationBadge';

export default function ClausesTab({ matter, documents = [], onSelectCitation }) {
  const [docAId, setDocAId] = useState(documents[0]?.id || '');
  const [docBId, setDocBId] = useState(documents[1]?.id || documents[0]?.id || '');
  const [clauseDescription, setClauseDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const { showSuccess, showError } = useToast();

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!docAId || !docBId) {
      showError('Please select two documents to compare.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await clauseAPI.compare(matter.id, {
        documentAId: docAId,
        documentBId: docBId,
        clauseDescription
      });

      if (res.data && res.data.result) {
        setResult(res.data.result);
        showSuccess('Clause comparison matrix generated.');
      }
    } catch (err) {
      showError(err.response?.data?.error || 'Clause comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  const docOptions = documents.map(d => ({
    value: d.id,
    label: `${d.original_filename} (${d.category || 'Doc'})`
  }));

  return (
    <div className="space-y-8">
      
      {/* Comparison Form Card */}
      <Card className="p-6">
        <form onSubmit={handleCompare} className="space-y-5">
          
          <div>
            <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-sky-400" />
              Dynamic Clause Comparison Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select two contracts, amendments, or policies to compare operative terms, indemnities, warranties, and notice requirements.
            </p>
          </div>

          {documents.length < 2 ? (
            <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 inline mr-2" />
              You have {documents.length} document(s) uploaded. Please upload at least two documents to this matter to run side-by-side clause comparisons.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Document A (Baseline Agreement) *"
                  value={docAId}
                  onChange={(e) => setDocAId(e.target.value)}
                  options={docOptions}
                  required
                />

                <Select
                  label="Document B (Target / Counterpart Agreement) *"
                  value={docBId}
                  onChange={(e) => setDocBId(e.target.value)}
                  options={docOptions}
                  required
                />
              </div>

              <Input
                label="Specific Clause / Focus Term (Optional)"
                placeholder="e.g. Indemnification, Termination for Cause, Non-Compete Scope, Limitation of Liability"
                value={clauseDescription}
                onChange={(e) => setClauseDescription(e.target.value)}
              />

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  icon={GitCompare}
                >
                  Generate Side-by-Side Clause Matrix
                </Button>
              </div>
            </>
          )}

        </form>
      </Card>

      {/* Loading Spinner */}
      {loading && (
        <Card className="py-12">
          <LoadingSpinner text="Extracting reciprocal clauses & contrasting legal obligations..." size="lg" />
        </Card>
      )}

      {/* Results View */}
      {result && !loading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Executive Summary */}
          <Card className="p-6 border-sky-500/30 bg-[#101726]">
            <h3 className="text-sm font-serif font-bold text-sky-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Comparative Risk & Material Differences Summary
            </h3>
            <p className="text-sm font-serif text-slate-100 leading-relaxed">
              {result.summary}
            </p>
          </Card>

          {/* Side-by-Side Comparison Matrix */}
          {result.comparisons && result.comparisons.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-amber-400" />
                Side-by-Side Provisions Matrix ({result.comparisons.length})
              </h3>

              <div className="space-y-4">
                {result.comparisons.map((item, idx) => (
                  <Card key={idx} className="p-5 bg-[#0f1420] border-slate-800 space-y-4">
                    
                    {/* Topic Header & Conflict Badge */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        {item.topic}
                      </h4>
                      <Badge variant={item.conflict ? 'danger' : 'success'} size="xs">
                        {item.conflict ? 'DIRECT CONFLICT / RISK' : 'SUBSTANTIALLY ALIGNED'}
                      </Badge>
                    </div>

                    {/* Side-by-Side Comparison Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Clause A */}
                      <div className="p-4 rounded-xl bg-[#090c12] border border-slate-800/80 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                          Document A: {item.clauseA?.citation?.documentName || 'Document A'}
                        </span>
                        <p className="text-xs text-slate-200 font-serif leading-relaxed">
                          "{item.clauseA?.text}"
                        </p>
                        {item.clauseA?.citation && item.clauseA.citation.chunkId && (
                          <div className="pt-2">
                            <CitationBadge
                              citation={item.clauseA.citation}
                              onClick={onSelectCitation}
                            />
                          </div>
                        )}
                      </div>

                      {/* Clause B */}
                      <div className="p-4 rounded-xl bg-[#090c12] border border-slate-800/80 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                          Document B: {item.clauseB?.citation?.documentName || 'Document B'}
                        </span>
                        <p className="text-xs text-slate-200 font-serif leading-relaxed">
                          "{item.clauseB?.text}"
                        </p>
                        {item.clauseB?.citation && item.clauseB.citation.chunkId && (
                          <div className="pt-2">
                            <CitationBadge
                              citation={item.clauseB.citation}
                              onClick={onSelectCitation}
                            />
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Difference Analysis & Significance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                      <div className="p-3 bg-[#141a27] rounded-xl border border-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Material Textual Shift:
                        </span>
                        <p className="text-slate-200">{item.difference}</p>
                      </div>

                      <div className="p-3 bg-[#141a27] rounded-xl border border-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                          Legal Significance & Exposure:
                        </span>
                        <p className="text-slate-200">{item.significance}</p>
                      </div>
                    </div>

                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Ambiguities & Missing Provisions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.ambiguities && result.ambiguities.length > 0 && (
              <Card className="p-5 border-slate-800 bg-[#0d1017] space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Identified Ambiguities
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
                  {result.ambiguities.map((amb, i) => (
                    <li key={i}>{amb}</li>
                  ))}
                </ul>
              </Card>
            )}

            {result.missingProvisions && result.missingProvisions.length > 0 && (
              <Card className="p-5 border-slate-800 bg-[#0d1017] space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Missing Provisions in Counterpart
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
                  {result.missingProvisions.map((mp, i) => (
                    <li key={i}>{mp}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
