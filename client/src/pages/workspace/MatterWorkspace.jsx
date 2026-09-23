import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  FolderOpen,
  FileText,
  Search,
  AlertTriangle,
  GitCompare,
  FileSpreadsheet,
  Database,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { mattersAPI, documentsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import AppLayout from '../../components/layout/AppLayout';
import { LoadingSpinner } from '../../components/common/Modal';
import EvidenceDrawer from '../../components/legal/EvidenceDrawer';

// Tab Sub-pages
import OverviewTab from './OverviewTab';
import DocumentsTab from './DocumentsTab';
import ResearchTab from './ResearchTab';
import VulnerabilitiesTab from './VulnerabilitiesTab';
import ClausesTab from './ClausesTab';
import TrialBriefTab from './TrialBriefTab';
import EvidenceTab from './EvidenceTab';

export default function MatterWorkspace() {
  const { matterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [matter, setMatter] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Evidence Drawer state
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadMatterData = async () => {
    try {
      const [matterRes, docsRes] = await Promise.all([
        mattersAPI.get(matterId),
        documentsAPI.listByMatter(matterId)
      ]);

      if (matterRes.data && matterRes.data.matter) {
        setMatter(matterRes.data.matter);
      }
      if (docsRes.data && docsRes.data.documents) {
        setDocuments(docsRes.data.documents);
      }
    } catch (err) {
      showError('Failed to load matter workspace.');
      navigate('/matters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (matterId) {
      loadMatterData();
    }
  }, [matterId]);

  const handleOpenCitation = (citation) => {
    setSelectedCitation(citation);
    setDrawerOpen(true);
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingSpinner text="Connecting to matter vector workspace..." size="lg" />
      </AppLayout>
    );
  }

  if (!matter) return null;

  // Determine active tab from URL pathname
  const path = location.pathname;
  let activeTab = 'overview';
  if (path.endsWith('/documents')) activeTab = 'documents';
  else if (path.endsWith('/research')) activeTab = 'research';
  else if (path.endsWith('/vulnerabilities')) activeTab = 'vulnerabilities';
  else if (path.endsWith('/clauses')) activeTab = 'clauses';
  else if (path.endsWith('/brief')) activeTab = 'brief';
  else if (path.endsWith('/evidence')) activeTab = 'evidence';

  const tabs = [
    { id: 'overview', label: 'Overview', path: `/matters/${matterId}`, icon: FolderOpen },
    { id: 'documents', label: `Documents (${documents.length})`, path: `/matters/${matterId}/documents`, icon: FileText },
    { id: 'research', label: 'Legal Research', path: `/matters/${matterId}/research`, icon: Search },
    { id: 'vulnerabilities', label: 'Vulnerabilities', path: `/matters/${matterId}/vulnerabilities`, icon: AlertTriangle },
    { id: 'clauses', label: 'Clause Matrix', path: `/matters/${matterId}/clauses`, icon: GitCompare },
    { id: 'brief', label: 'Trial Brief', path: `/matters/${matterId}/brief`, icon: FileSpreadsheet },
    { id: 'evidence', label: 'Evidence Explorer', path: `/matters/${matterId}/evidence`, icon: Database }
  ];

  return (
    <AppLayout matter={matter}>
      <div className="space-y-6">
        
        {/* Workspace Top Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 border-b border-[#1C2640] pb-px overflow-x-auto no-print">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <Link
                key={t.id}
                to={t.path}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-t border-x whitespace-nowrap ${
                  isActive
                    ? 'bg-[#11182D] text-[#D9A62E] border-[#1C2640] border-b-transparent shadow-lg'
                    : 'text-slate-400 hover:text-[#F3F4F6] border-transparent hover:bg-[#151E36]/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D9A62E]' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Tab Content Renderer */}
        <div className="pt-2">
          {activeTab === 'overview' && (
            <OverviewTab
              matter={matter}
              documents={documents}
              onSelectCitation={handleOpenCitation}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab
              matter={matter}
              documents={documents}
              onRefresh={loadMatterData}
            />
          )}

          {activeTab === 'research' && (
            <ResearchTab
              matter={matter}
              documents={documents}
              onSelectCitation={handleOpenCitation}
            />
          )}

          {activeTab === 'vulnerabilities' && (
            <VulnerabilitiesTab
              matter={matter}
              documents={documents}
              onSelectCitation={handleOpenCitation}
            />
          )}

          {activeTab === 'clauses' && (
            <ClausesTab
              matter={matter}
              documents={documents}
              onSelectCitation={handleOpenCitation}
            />
          )}

          {activeTab === 'brief' && (
            <TrialBriefTab
              matter={matter}
              documents={documents}
              onSelectCitation={handleOpenCitation}
            />
          )}

          {activeTab === 'evidence' && (
            <EvidenceTab
              matter={matter}
              documents={documents}
              onSelectCitation={handleOpenCitation}
            />
          )}
        </div>

      </div>

      {/* Global Evidence Inspector Drawer */}
      <EvidenceDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        citation={selectedCitation}
      />
    </AppLayout>
  );
}
