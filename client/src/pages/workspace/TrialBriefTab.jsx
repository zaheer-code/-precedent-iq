import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Sparkles,
  Download,
  Copy,
  Printer,
  Check,
  Edit3,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { briefAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, Badge } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';
import CitationBadge from '../../components/legal/CitationBadge';

export default function TrialBriefTab({ matter, documents = [], onSelectCitation }) {
  const [briefTitle, setBriefTitle] = useState(`Trial Brief on Behalf of Client — ${matter.matter_name}`);
  const [court, setCourt] = useState(matter.jurisdiction || 'In the District Court');
  const [jurisdiction, setJurisdiction] = useState(matter.jurisdiction || 'State/Federal Jurisdiction');
  const [issues, setIssues] = useState([
    'Whether the defendant breached the notice and cure obligations of Section 4.2 prior to terminating the contract',
    'Whether the plaintiff is entitled to full indemnification damages under governing case law'
  ]);
  const [newIssueInput, setNewIssueInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState(null);
  const [copied, setCopied] = useState(false);

  const { showSuccess, showError } = useToast();

  const handleAddIssue = () => {
    if (!newIssueInput.trim()) return;
    setIssues(prev => [...prev, newIssueInput.trim()]);
    setNewIssueInput('');
  };

  const handleRemoveIssue = (index) => {
    setIssues(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (issues.length === 0) {
      showError('Please provide at least one legal issue statement.');
      return;
    }

    setLoading(true);
    try {
      const res = await briefAPI.generate(matter.id, {
        briefTitle,
        court,
        jurisdiction,
        issues
      });

      if (res.data && res.data.result) {
        setBrief(res.data.result);
        showSuccess('Structured Trial Brief synthesized.');
      }
    } catch (err) {
      showError(err.response?.data?.error || 'Brief generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const exportMarkdown = () => {
    if (!brief) return;
    let md = `# ${brief.title}\n\n**Court:** ${court}\n**Jurisdiction:** ${jurisdiction}\n\n`;
    md += `## QUESTIONS PRESENTED\n${(brief.questionsPresented || []).map(q => `- ${q}`).join('\n')}\n\n`;
    md += `## STATEMENT OF FACTS\n${(brief.facts || []).map(f => `- ${f.statement}`).join('\n')}\n\n`;
    md += `## APPLICABLE RULES\n${(brief.rules || []).map(r => `- ${r.rule}`).join('\n')}\n\n`;
    md += `## LEGAL ARGUMENT & ANALYSIS\n`;
    (brief.analysis || []).forEach(a => {
      md += `### ${a.issue}\n**Argument:** ${a.argument}\n**Counterargument:** ${a.counterargument}\n**Rebuttal:** ${a.response}\n\n`;
    });
    md += `## EVIDENCE GAPS\n${(brief.evidenceGaps || []).map(g => `- ${g}`).join('\n')}\n\n`;
    md += `## CONCLUSION\n${brief.conclusion}\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brief.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyBriefText = () => {
    if (!brief) return;
    const text = document.getElementById('brief-content-area')?.innerText || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printBrief = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      
      {/* Brief Configuration Form */}
      <Card className="p-6 no-print">
        <form onSubmit={handleGenerate} className="space-y-5">
          
          <div>
            <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-purple-400" />
              Interactive Trial Brief Builder
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Synthesizes case facts, governing rules, and counterargument rebuttals into a formal, citation-backed brief outline.
            </p>
          </div>

          <Input
            label="Trial Brief Title *"
            value={briefTitle}
            onChange={(e) => setBriefTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Court / Forum"
              value={court}
              onChange={(e) => setCourt(e.target.value)}
            />
            <Input
              label="Jurisdiction"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
            />
          </div>

          {/* Dynamic Issues List */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
              Issue Statements Presented ({issues.length})
            </label>

            <div className="space-y-2">
              {issues.map((iss, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs">
                  <span className="text-slate-200">{i + 1}. {iss}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIssue(i)}
                    className="p-1 text-slate-500 hover:text-rose-400 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add another legal issue statement to brief..."
                value={newIssueInput}
                onChange={(e) => setNewIssueInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddIssue();
                  }
                }}
                className="flex-1 rounded-lg bg-[#0f1420] border border-slate-800 text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-amber-500/50"
              />
              <Button variant="secondary" size="sm" onClick={handleAddIssue} icon={Plus}>
                Add Issue
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={Sparkles}
            >
              Generate Structured Brief Outline
            </Button>
          </div>

        </form>
      </Card>

      {/* Loading Spinner */}
      {loading && (
        <Card className="py-12">
          <LoadingSpinner text="Synthesizing IRAC brief structure and anchoring evidence citations..." size="lg" />
        </Card>
      )}

      {/* Rendered Trial Brief */}
      {brief && !loading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Action Toolbar */}
          <div className="flex items-center justify-between no-print p-4 bg-[#121722] rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 text-xs text-amber-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Brief Outline Ready • Fully Editable & Citation-Linked</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" icon={copied ? Check : Copy} onClick={copyBriefText}>
                {copied ? 'Copied' : 'Copy Text'}
              </Button>
              <Button variant="secondary" size="sm" icon={Download} onClick={exportMarkdown}>
                Export (.md)
              </Button>
              <Button variant="primary" size="sm" icon={Printer} onClick={printBrief}>
                Print Brief
              </Button>
            </div>
          </div>

          {/* Court Brief Document Container */}
          <div
            id="brief-content-area"
            className="p-8 md:p-12 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-2xl text-slate-100 font-serif leading-relaxed space-y-8 select-text"
          >
            
            {/* Caption Header */}
            <div className="text-center pb-6 border-b border-slate-800 space-y-2">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-sans font-semibold">
                {court} • {jurisdiction}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-amber-200">
                {brief.title}
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Matter Ref: {matter.matter_name} {matter.matter_number ? `(#${matter.matter_number})` : ''}
              </p>
            </div>

            {/* Questions Presented */}
            {brief.questionsPresented && brief.questionsPresented.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-amber-400 pb-1 border-b border-slate-800">
                  I. Questions Presented
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-200">
                  {brief.questionsPresented.map((qp, i) => (
                    <li key={i} className="pl-1 leading-normal">{qp}</li>
                  ))}
                </ol>
              </section>
            )}

            {/* Statement of Facts */}
            {brief.facts && brief.facts.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-amber-400 pb-1 border-b border-slate-800">
                  II. Statement of Facts Grounded in Record
                </h3>
                <div className="space-y-3 text-sm text-slate-200">
                  {brief.facts.map((fact, i) => (
                    <div key={i} className="space-y-1">
                      <p>{fact.statement}</p>
                      {fact.citations && fact.citations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5 no-print">
                          {fact.citations.map((c, ci) => (
                            <CitationBadge key={ci} citation={c} onClick={onSelectCitation} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Applicable Rules */}
            {brief.rules && brief.rules.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-amber-400 pb-1 border-b border-slate-800">
                  III. Applicable Legal & Contractual Authorities
                </h3>
                <div className="space-y-3 text-sm text-slate-200">
                  {brief.rules.map((r, i) => (
                    <div key={i} className="space-y-1">
                      <p className="font-semibold text-slate-100">{r.rule}</p>
                      {r.citations && r.citations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5 no-print">
                          {r.citations.map((c, ci) => (
                            <CitationBadge key={ci} citation={c} onClick={onSelectCitation} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Legal Argument & Analysis */}
            {brief.analysis && brief.analysis.length > 0 && (
              <section className="space-y-6">
                <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-amber-400 pb-1 border-b border-slate-800">
                  IV. Argument & Analysis
                </h3>
                <div className="space-y-6">
                  {brief.analysis.map((an, i) => (
                    <div key={i} className="p-5 rounded-xl bg-[#090c12] border border-slate-800 space-y-3">
                      <h4 className="font-bold text-slate-100 text-sm">
                        {an.issue}
                      </h4>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {an.argument}
                      </p>

                      {an.counterargument && (
                        <div className="p-3 bg-[#131926] rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                          <span className="font-sans font-semibold text-amber-400 uppercase text-[10px] block">
                            Anticipated Counterargument & Rebuttal:
                          </span>
                          <p><span className="italic">Opposing:</span> {an.counterargument}</p>
                          <p><span className="font-semibold">Rebuttal:</span> {an.response}</p>
                        </div>
                      )}

                      {an.citations && an.citations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 no-print">
                          {an.citations.map((c, ci) => (
                            <CitationBadge key={ci} citation={c} onClick={onSelectCitation} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Evidence Gaps */}
            {brief.evidenceGaps && brief.evidenceGaps.length > 0 && (
              <section className="space-y-2 no-print">
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">
                  V. Evidentiary Incompleteness & Gaps
                </h3>
                <ul className="list-disc list-inside text-xs text-slate-400 font-sans space-y-1">
                  {brief.evidenceGaps.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Conclusion */}
            <section className="space-y-2 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-amber-400">
                VI. Conclusion & Prayer for Relief
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                {brief.conclusion}
              </p>
            </section>

          </div>

        </div>
      )}

    </div>
  );
}
