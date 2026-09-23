import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Database,
  Search,
  AlertTriangle,
  GitCompare,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock
} from 'lucide-react';
import { Card, Badge } from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function OverviewTab({ matter, documents = [], onSelectCitation }) {
  const navigate = useNavigate();

  const docCount = documents.length;
  const readyDocs = documents.filter(d => d.processing_status === 'READY').length;
  const totalChunks = documents.reduce((acc, d) => acc + (parseInt(d.chunk_count, 10) || 0), 0);

  // Group by category
  const categories = documents.reduce((acc, d) => {
    const cat = d.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      
      {/* Matter Summary Banner */}
      <div className="p-6 rounded-2xl bg-[#11182D] border border-[#1C2640] shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold" size="sm">
                {matter.practice_area || 'General Litigation'}
              </Badge>
              {matter.jurisdiction && (
                <span className="text-xs text-slate-400 font-medium">
                  • {matter.jurisdiction}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">
              {matter.matter_name}
            </h2>
            {matter.matter_number && (
              <p className="text-xs font-medium text-[#D9A62E] mt-0.5">
                Docket / Case Ref: #{matter.matter_number}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              icon={Search}
              onClick={() => navigate(`/matters/${matter.id}/research`)}
            >
              Start Grounded Research
            </Button>
          </div>
        </div>

        {matter.description && (
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl pt-2 border-t border-[#1C2640]">
            {matter.description}
          </p>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <Card className="flex items-center justify-between bg-[#11182D] border-[#1C2640]" hover onClick={() => navigate(`/matters/${matter.id}/documents`)}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Case Documents</p>
            <h3 className="text-2xl font-bold text-[#F3F4F6] mt-1">{docCount}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{readyDocs} indexed & searchable</p>
          </div>
          <div className="p-3 bg-[#151E36] rounded-xl border border-[#1C2640] text-[#D9A62E]">
            <FileText className="w-5 h-5" />
          </div>
        </Card>

        <Card className="flex items-center justify-between bg-[#11182D] border-[#1C2640]" hover onClick={() => navigate(`/matters/${matter.id}/evidence`)}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Semantic Vectors</p>
            <h3 className="text-2xl font-bold text-[#F3F4F6] mt-1">{totalChunks}</h3>
            <p className="text-[11px] text-[#D9A62E] mt-0.5">768-dim embeddings in pgvector</p>
          </div>
          <div className="p-3 bg-[#151E36] rounded-xl border border-[#1C2640] text-[#D9A62E]">
            <Database className="w-5 h-5" />
          </div>
        </Card>

        <Card className="flex items-center justify-between bg-[#11182D] border-[#1C2640]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Grounding Integrity</p>
            <h3 className="text-2xl font-bold text-[#D9A62E] mt-1">100%</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Verified page citations</p>
          </div>
          <div className="p-3 bg-[#151E36] rounded-xl border border-[#1C2640] text-[#D9A62E]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </Card>

      </div>

      {/* Workspace Quick Launchpads */}
      <div>
        <h3 className="text-base font-bold tracking-tight text-[#F3F4F6] mb-4">
          Litigation Intelligence Modules
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Card
            hover
            onClick={() => navigate(`/matters/${matter.id}/research`)}
            className="flex flex-col justify-between space-y-3 bg-[#11182D] border-[#1C2640]"
          >
            <div>
              <div className="p-2.5 bg-[#151E36] rounded-xl border border-[#1C2640] text-[#D9A62E] w-fit mb-3">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-[#F3F4F6]">Legal Research (RAG)</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Query case records for holdings, precedents, and facts with exact page citations.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-semibold text-[#D9A62E] gap-1">
              Launch Research <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>

          <Card
            hover
            onClick={() => navigate(`/matters/${matter.id}/vulnerabilities`)}
            className="flex flex-col justify-between space-y-3 bg-[#11182D] border-[#1C2640]"
          >
            <div>
              <div className="p-2.5 bg-[#151E36] rounded-xl border border-[#1C2640] text-[#D9A62E] w-fit mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-[#F3F4F6]">Vulnerability Detector</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Analyze opposing counsel's arguments to find factual contradictions and weak authority.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-semibold text-[#D9A62E] gap-1">
              Analyze Filing <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>

          <Card
            hover
            onClick={() => navigate(`/matters/${matter.id}/clauses`)}
            className="flex flex-col justify-between space-y-3 bg-[#11182D] border-[#1C2640]"
          >
            <div>
              <div className="p-2.5 bg-[#151E36] rounded-xl border border-[#1C2640] text-[#D9A62E] w-fit mb-3">
                <GitCompare className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-[#F3F4F6]">Clause Comparison</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Compare contractual obligations, warranties, and risks side-by-side.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-semibold text-[#D9A62E] gap-1">
              Compare Contracts <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>

          <Card
            hover
            onClick={() => navigate(`/matters/${matter.id}/brief`)}
            className="flex flex-col justify-between space-y-3 bg-[#11182D] border-[#1C2640]"
          >
            <div>
              <div className="p-2.5 bg-[#151E36] rounded-xl border border-[#1C2640] text-[#D9A62E] w-fit mb-3">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-[#F3F4F6]">Trial Brief Builder</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Synthesize facts, rules, and analysis into an editable, citation-grounded outline.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-semibold text-[#D9A62E] gap-1">
              Draft Brief <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>

        </div>
      </div>

      {/* Document Classification Distribution */}
      {docCount > 0 && (
        <Card className="space-y-4 bg-[#11182D] border-[#1C2640]">
          <h3 className="text-sm font-semibold text-[#F3F4F6] flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#D9A62E]" />
            Ingested Document Classification Profile
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([cat, count]) => (
              <div
                key={cat}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#0E1528] border border-[#1C2640] text-xs"
              >
                <span className="font-semibold text-[#D9A62E]">{cat}:</span>
                <span className="text-slate-300 font-medium">{count} file(s)</span>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
}
