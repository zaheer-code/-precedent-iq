import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  FileText,
  CheckCircle2,
  HelpCircle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { vulnerabilityAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, Badge } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/Modal';
import { Textarea } from '../../components/common/Input';
import { SeverityBadge } from '../../components/legal/SeverityBadge';
import CitationBadge from '../../components/legal/CitationBadge';

const FOCUS_AREAS = [
  { id: 'precedent', label: 'Weak Precedent Application' },
  { id: 'facts', label: 'Factual Inconsistencies' },
  { id: 'contract', label: 'Contractual Conflicts' },
  { id: 'logic', label: 'Logical Fallacies & Gaps' },
  { id: 'citations', label: 'Citation Mismatches' },
  { id: 'consistency', label: 'Internal Contradictions' }
];

export default function VulnerabilitiesTab({ matter, documents = [], onSelectCitation }) {
  const [opposingArgument, setOpposingArgument] = useState('');
  const [focusAreas, setFocusAreas] = useState(['precedent', 'facts', 'contract', 'logic', 'citations', 'consistency']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const { showSuccess, showError } = useToast();

  const toggleFocus = (id) => {
    setFocusAreas(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!opposingArgument.trim()) {
      showError('Please input opposing argument text to analyze.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await vulnerabilityAPI.analyze(matter.id, {
        opposingArgument,
        focusAreas
      });

      if (res.data && res.data.result) {
        setResult(res.data.result);
        showSuccess('Vulnerability detection analysis completed.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Vulnerability detection failed.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const sampleArgument = "Plaintiff failed to give 30 days written notice of default under Section 8.1 prior to filing suit, which completely bars plaintiff's claim for breach of contract and indemnification damages.";

  return (
    <div className="space-y-8">
      
      {/* Input Card */}
      <Card className="p-6 bg-[#11182D] border-[#1C2640]">
        <form onSubmit={handleAnalyze} className="space-y-5">
          
          <div>
            <h3 className="text-base font-bold tracking-tight text-[#F3F4F6] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#D9A62E]" />
              Opposing Argument Vulnerability Detector
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste opposing counsel's motion arguments or assertions. The engine cross-examines the text against matter evidence to detect contradictions, overbroad claims, and weak precedent.
            </p>
          </div>

          <Textarea
            label="Opposing Counsel Argument / Assertion *"
            placeholder="Paste excerpts from opposing brief, motion to dismiss, or summary judgment filings..."
            rows={4}
            value={opposingArgument}
            onChange={(e) => setOpposingArgument(e.target.value)}
            required
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Sample Assertion:</span>
            <button
              type="button"
              onClick={() => setOpposingArgument(sampleArgument)}
              className="text-[#D9A62E] hover:text-[#E5B645] underline text-xs"
            >
              Insert Sample Notice Defense Argument
            </button>
          </div>

          {/* Focus Area Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-[#1C2640]">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Vulnerability Focus Areas
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FOCUS_AREAS.map((area) => {
                const checked = focusAreas.includes(area.id);
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => toggleFocus(area.id)}
                    className={`flex items-center space-x-2 p-2 rounded-xl text-xs text-left transition-all border ${
                      checked
                        ? 'bg-[#D9A62E]/15 border-[#D9A62E]/35 text-[#D9A62E]'
                        : 'bg-[#0E1528] border-[#1C2640] text-slate-400 hover:text-[#F3F4F6]'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                      checked ? 'bg-[#D9A62E] border-[#D9A62E] text-[#0B1020]' : 'border-[#1C2640]'
                    }`}>
                      {checked && <span className="text-[10px] font-bold">✓</span>}
                    </div>
                    <span className="font-medium">{area.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={Flame}
            >
              Scan for Legal & Factual Vulnerabilities
            </Button>
          </div>

        </form>
      </Card>

      {/* Loading Spinner */}
      {loading && (
        <Card className="py-12 bg-[#11182D] border-[#1C2640]">
          <LoadingSpinner text="Deconstructing argument & matching contradictory evidence..." size="lg" />
        </Card>
      )}

      {/* Results Display */}
      {result && !loading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Overall Strategic Assessment */}
          <Card className="p-6 border-[#D9A62E]/35 bg-[#151E36]">
            <h3 className="text-sm font-bold text-[#D9A62E] uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#D9A62E]" />
              Strategic Vulnerability Assessment
            </h3>
            <p className="text-sm text-[#F3F4F6] font-normal leading-relaxed">
              {result.overallAssessment}
            </p>
          </Card>

          {/* Vulnerabilities List */}
          {result.vulnerabilities && result.vulnerabilities.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold tracking-tight text-[#F3F4F6] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D9A62E]" />
                Detected Flaws & Evidentiary Contradictions ({result.vulnerabilities.length})
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {result.vulnerabilities.map((v, idx) => (
                  <Card key={idx} className="p-5 bg-[#0E1528] border-[#1C2640] space-y-4">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1C2640]">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={v.severity} />
                        <span className="font-medium text-xs uppercase text-[#D9A62E]">
                          {v.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Opposing Claim */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Opposing Assertion:
                      </span>
                      <p className="text-xs font-medium text-[#F3F4F6] italic bg-[#0B1020] p-2 rounded-lg border border-[#1C2640]">
                        "{v.claim}"
                      </p>
                    </div>

                    {/* Problem Analysis */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Factual / Legal Vulnerability:
                      </span>
                      <p className="text-xs text-[#F3F4F6] leading-relaxed">
                        {v.problem}
                      </p>
                    </div>

                    {/* Why it matters */}
                    {v.whyItMatters && (
                      <div className="space-y-1 bg-[#151E36] p-3 rounded-xl border border-[#1C2640]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9A62E]">
                          Strategic & Litigation Impact:
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {v.whyItMatters}
                        </p>
                      </div>
                    )}

                    {/* Attached Citations */}
                    {v.citations && v.citations.length > 0 && (
                      <div className="pt-2 border-t border-[#1C2640] flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Rebuttal Citations:
                        </span>
                        {v.citations.map((cit, cIdx) => (
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

          {/* Missing Evidence */}
          {result.missingEvidence && result.missingEvidence.length > 0 && (
            <Card className="p-5 border-[#1C2640] bg-[#0E1528] space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                Opposing Party's Missing Evidentiary Foundations
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-1">
                {result.missingEvidence.map((me, i) => (
                  <li key={i}>{me}</li>
                ))}
              </ul>
            </Card>
          )}

        </div>
      )}

    </div>
  );
}
