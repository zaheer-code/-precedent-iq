import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Database,
  Clock,
  Search,
  AlertTriangle,
  GitCompare,
  FileSpreadsheet,
  Plus,
  ArrowUpRight,
  Shield,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { statsAPI, mattersAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Card, Badge } from '../components/common/Card';
import Button from '../components/common/Button';
import { Modal, LoadingSpinner, EmptyState } from '../components/common/Modal';
import { Input, Select, Textarea } from '../components/common/Input';
import AppLayout from '../components/layout/AppLayout';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Create Matter Form State
  const [matterName, setMatterName] = useState('');
  const [matterNumber, setMatterNumber] = useState('');
  const [practiceArea, setPracticeArea] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const loadDashboard = async () => {
    try {
      const res = await statsAPI.getDashboard();
      if (res.data && res.data.stats) {
        setData(res.data);
      }
    } catch (err) {
      showError('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleCreateMatter = async (e) => {
    e.preventDefault();
    if (!matterName.trim()) {
      showError('Matter name is required.');
      return;
    }

    setCreating(true);
    try {
      const res = await mattersAPI.create({
        matterName,
        matterNumber,
        practiceArea,
        jurisdiction,
        description
      });
      showSuccess(`Matter "${matterName}" initialized.`);
      setCreateModalOpen(false);
      setMatterName('');
      setMatterNumber('');
      setPracticeArea('');
      setJurisdiction('');
      setDescription('');
      navigate(`/matters/${res.data.matter.id}`);
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to create legal matter.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingSpinner text="Compiling cross-case intelligence..." size="lg" />
      </AppLayout>
    );
  }

  const stats = data?.stats || {
    totalMatters: 0,
    totalDocuments: 0,
    documentsProcessing: 0,
    totalIndexedChunks: 0
  };

  return (
    <AppLayout onNewMatter={() => setCreateModalOpen(true)}>
      <div className="space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#F3F4F6]">
              Intelligence Command Center
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-1">
              Cross-case retrieval, semantic indexing, and grounded analysis dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setCreateModalOpen(true)}
            >
              Initialize New Matter
            </Button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Card className="flex items-center justify-between" hover>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Total Matters</p>
              <h3 className="text-2xl font-extrabold tracking-tight text-[#F3F4F6] mt-1">{stats.totalMatters}</h3>
              <p className="text-[11px] text-[#D9A62E] mt-0.5">Active litigation files</p>
            </div>
            <div className="p-3 bg-[#151E36] rounded-xl border border-[#1C2640] text-[#D9A62E]">
              <Briefcase className="w-5 h-5" />
            </div>
          </Card>

          <Card className="flex items-center justify-between" hover>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Case Documents</p>
              <h3 className="text-2xl font-extrabold tracking-tight text-[#F3F4F6] mt-1">{stats.totalDocuments}</h3>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">PDFs, DOCX & Filings</p>
            </div>
            <div className="p-3 bg-[#151E36] rounded-xl border border-[#1C2640] text-[#D9A62E]">
              <FileText className="w-5 h-5" />
            </div>
          </Card>

          <Card className="flex items-center justify-between" hover>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Indexed Chunks</p>
              <h3 className="text-2xl font-extrabold tracking-tight text-[#F3F4F6] mt-1">{stats.totalIndexedChunks}</h3>
              <p className="text-[11px] text-[#D9A62E] mt-0.5">768-dim pgvector embeddings</p>
            </div>
            <div className="p-3 bg-[#151E36] rounded-xl border border-[#1C2640] text-[#D9A62E]">
              <Database className="w-5 h-5" />
            </div>
          </Card>

          <Card className="flex items-center justify-between" hover>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Pipeline Ingestion</p>
              <h3 className="text-2xl font-extrabold tracking-tight text-[#F3F4F6] mt-1">{stats.documentsProcessing}</h3>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">In queue / processing</p>
            </div>
            <div className="p-3 bg-[#151E36] rounded-xl border border-[#1C2640] text-[#D9A62E]">
              <Clock className="w-5 h-5" />
            </div>
          </Card>

        </div>

        {/* Two Columns: Recent Matters + Recent AI Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2 spans): Recent Matters */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-[#F3F4F6] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#D9A62E]" />
                Active Matters & Workspaces
              </h2>
              <Link to="/matters" className="text-xs text-[#D9A62E] hover:underline font-medium flex items-center gap-1">
                View All Matters <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data?.recentMatters && data.recentMatters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.recentMatters.map((m) => (
                  <Card
                    key={m.id}
                    hover
                    onClick={() => navigate(`/matters/${m.id}`)}
                    className="flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <Badge variant="gold" size="xs">
                          {m.practice_area || 'General Litigation'}
                        </Badge>
                        <span className="text-[11px] font-mono text-[#9CA3AF]">
                          {m.matter_number ? `#${m.matter_number}` : ''}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold tracking-tight text-[#F3F4F6] mt-2 group-hover:text-[#D9A62E]">
                        {m.matter_name}
                      </h3>
                      {m.jurisdiction && (
                        <p className="text-xs text-[#9CA3AF] mt-0.5">{m.jurisdiction}</p>
                      )}
                      {m.description && (
                        <p className="text-xs text-[#9CA3AF] mt-2 line-clamp-2 leading-relaxed">
                          {m.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#1C2640] flex items-center justify-between text-xs text-[#9CA3AF]">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-[#9CA3AF]" />
                        {m.document_count || 0} document(s)
                      </span>
                      <span className="text-[#D9A62E] font-medium flex items-center gap-0.5">
                        Open Workspace <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Briefcase}
                title="No active matters found"
                description="Initialize your first legal matter to start ingesting filings, generating trial briefs, and analyzing opposing arguments."
                action={
                  <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
                    Create First Matter
                  </Button>
                }
              />
            )}
          </div>

          {/* Right Column (1 span): Recent Intelligence History & Audit */}
          <div className="space-y-4">
            <h2 className="text-base font-bold tracking-tight text-[#F3F4F6] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D9A62E]" />
              Recent AI Intelligence Runs
            </h2>

            <Card className="space-y-3 p-4">
              {data?.recentAnalyses && data.recentAnalyses.length > 0 ? (
                <div className="divide-y divide-[#1C2640]">
                  {data.recentAnalyses.map((an) => (
                    <div
                      key={an.id}
                      onClick={() => navigate(`/matters/${an.matter_id}/${an.analysis_type === 'research' ? 'research' : an.analysis_type === 'vulnerabilities' ? 'vulnerabilities' : an.analysis_type === 'clause_comparison' ? 'clauses' : 'brief'}`)}
                      className="py-2.5 first:pt-0 last:pb-0 cursor-pointer hover:bg-[#151E36] rounded-lg p-2 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D9A62E]">
                          {an.analysis_type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-[#9CA3AF]">
                          {new Date(an.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#F3F4F6] truncate mt-1">
                        {an.matter_name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#9CA3AF] py-4 text-center">
                  No intelligence operations logged yet. Run research or brief builder inside a matter.
                </p>
              )}
            </Card>

            {/* Quick Security Status */}
            <Card className="p-4 bg-[#0E1528] border-[#D9A62E]/30 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#D9A62E]">
                <Shield className="w-4 h-4 text-[#D9A62E]" />
                <span>Matter-Level Isolation Active</span>
              </div>
              <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                All RAG queries are dynamically parameterized and scoped to your authenticated tenant ID. Zero cross-client data access.
              </p>
            </Card>
          </div>

        </div>

      </div>

      {/* Initialize Matter Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Initialize New Legal Matter"
      >
        <form onSubmit={handleCreateMatter} className="space-y-4">
          <Input
            label="Matter / Case Name *"
            placeholder="e.g. Apex Global v. Horizon Media Corp."
            value={matterName}
            onChange={(e) => setMatterName(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Internal Matter Number"
              placeholder="e.g. 2026-CV-08942"
              value={matterNumber}
              onChange={(e) => setMatterNumber(e.target.value)}
            />
            <Input
              label="Practice Area"
              placeholder="e.g. Commercial Litigation, IP, Contract"
              value={practiceArea}
              onChange={(e) => setPracticeArea(e.target.value)}
            />
          </div>

          <Input
            label="Court Jurisdiction / Venue"
            placeholder="e.g. U.S. District Court, S.D.N.Y."
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
          />

          <Textarea
            label="Matter Summary / Background"
            placeholder="Brief overview of claims, operative contracts, and key disputes..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="pt-3 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={creating}
            >
              Create Matter Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
