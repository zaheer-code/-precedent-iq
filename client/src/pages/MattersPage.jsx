import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  FileText,
  Trash2,
  Edit2,
  ArrowUpRight,
  Database,
  Archive,
  AlertCircle
} from 'lucide-react';
import { mattersAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Card, Badge } from '../components/common/Card';
import Button from '../components/common/Button';
import { Modal, LoadingSpinner, EmptyState } from '../components/common/Modal';
import { Input, Textarea, Select } from '../components/common/Input';
import AppLayout from '../components/layout/AppLayout';

export default function MattersPage() {
  const [matters, setMatters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editMatter, setEditMatter] = useState(null);
  const [deleteConfirmMatter, setDeleteConfirmMatter] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [matterName, setMatterName] = useState('');
  const [matterNumber, setMatterNumber] = useState('');
  const [practiceArea, setPracticeArea] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [description, setDescription] = useState('');

  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const loadMatters = async () => {
    try {
      const res = await mattersAPI.list();
      if (res.data && res.data.matters) {
        setMatters(res.data.matters);
      }
    } catch (err) {
      showError('Failed to load legal matters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatters();
  }, []);

  const openCreateModal = () => {
    setEditMatter(null);
    setMatterName('');
    setMatterNumber('');
    setPracticeArea('');
    setJurisdiction('');
    setDescription('');
    setCreateModalOpen(true);
  };

  const openEditModal = (m, e) => {
    e.stopPropagation();
    setEditMatter(m);
    setMatterName(m.matter_name || '');
    setMatterNumber(m.matter_number || '');
    setPracticeArea(m.practice_area || '');
    setJurisdiction(m.jurisdiction || '');
    setDescription(m.description || '');
    setCreateModalOpen(true);
  };

  const handleSaveMatter = async (e) => {
    e.preventDefault();
    if (!matterName.trim()) {
      showError('Matter name is required.');
      return;
    }

    setActionLoading(true);
    try {
      if (editMatter) {
        await mattersAPI.update(editMatter.id, {
          matterName,
          matterNumber,
          practiceArea,
          jurisdiction,
          description
        });
        showSuccess(`Matter "${matterName}" updated.`);
      } else {
        const res = await mattersAPI.create({
          matterName,
          matterNumber,
          practiceArea,
          jurisdiction,
          description
        });
        showSuccess(`Matter "${matterName}" created.`);
      }
      setCreateModalOpen(false);
      loadMatters();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to save matter.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMatter = async () => {
    if (!deleteConfirmMatter) return;
    setActionLoading(true);
    try {
      await mattersAPI.delete(deleteConfirmMatter.id);
      showSuccess(`Matter "${deleteConfirmMatter.matter_name}" deleted.`);
      setDeleteConfirmMatter(null);
      loadMatters();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to delete matter.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMatters = matters.filter((m) => {
    const matchSearch =
      m.matter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.matter_number && m.matter_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.practice_area && m.practice_area.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout onNewMatter={openCreateModal}>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">
              Legal Matters & Workspaces
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              Manage litigation files, contracts, and isolated case records
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={openCreateModal}>
            New Legal Matter
          </Button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#11182D] rounded-xl border border-[#1C2640]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search matters by name, number, practice area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0E1528] border border-[#1C2640] text-xs text-[#F3F4F6] placeholder-slate-500 focus:outline-none focus:border-[#D9A62E]/60"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex rounded-lg bg-[#0E1528] p-1 border border-[#1C2640] text-xs">
              {['ALL', 'ACTIVE', 'ARCHIVED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    statusFilter === st
                      ? 'bg-[#D9A62E]/15 text-[#D9A62E] border border-[#D9A62E]/35'
                      : 'text-slate-400 hover:text-[#F3F4F6]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Matters Grid */}
        {loading ? (
          <LoadingSpinner text="Loading legal matters..." />
        ) : filteredMatters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMatters.map((m) => (
              <Card
                key={m.id}
                hover
                onClick={() => navigate(`/matters/${m.id}`)}
                className="flex flex-col justify-between space-y-4 group relative bg-[#11182D] border-[#1C2640]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={m.status === 'ACTIVE' ? 'gold' : 'default'} size="xs">
                      {m.practice_area || 'General Litigation'}
                    </Badge>
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => openEditModal(m, e)}
                        title="Edit Matter Info"
                        className="p-1 rounded text-slate-400 hover:text-[#D9A62E] hover:bg-[#151E36] transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmMatter(m);
                        }}
                        title="Delete Matter"
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#F3F4F6] mt-2.5 group-hover:text-[#D9A62E] transition-colors">
                    {m.matter_name}
                  </h3>

                  {m.matter_number && (
                    <p className="text-[11px] font-medium text-[#D9A62E]/90 mt-0.5">
                      Case #{m.matter_number}
                    </p>
                  )}

                  {m.jurisdiction && (
                    <p className="text-xs text-slate-400 mt-1">{m.jurisdiction}</p>
                  )}

                  {m.description && (
                    <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  )}
                </div>

                <div className="pt-3.5 border-t border-[#1C2640] flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {m.document_count || 0} Docs
                    </span>
                    <span className="flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-slate-400" />
                      {m.chunk_count || 0} Chunks
                    </span>
                  </div>
                  <span className="text-[#D9A62E] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Enter <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No matters match your filters"
            description={searchTerm ? "Try adjusting your search terms or filter selection." : "Create your first legal matter to begin."}
            action={
              <Button variant="primary" size="sm" onClick={openCreateModal}>
                Initialize Matter
              </Button>
            }
          />
        )}

      </div>

      {/* Create / Edit Matter Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={editMatter ? `Edit Matter: ${editMatter.matter_name}` : "Initialize New Legal Matter"}
      >
        <form onSubmit={handleSaveMatter} className="space-y-4">
          <Input
            label="Matter / Case Name *"
            placeholder="e.g. Acme Corp v. Beta Logistics"
            value={matterName}
            onChange={(e) => setMatterName(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Matter / Docket Number"
              placeholder="e.g. 2026-CV-01234"
              value={matterNumber}
              onChange={(e) => setMatterNumber(e.target.value)}
            />
            <Input
              label="Practice Area"
              placeholder="e.g. Intellectual Property, Employment"
              value={practiceArea}
              onChange={(e) => setPracticeArea(e.target.value)}
            />
          </div>

          <Input
            label="Jurisdiction / Forum"
            placeholder="e.g. Court of Appeals for the Federal Circuit"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
          />

          <Textarea
            label="Summary / Facts Overview"
            placeholder="Key facts, claims, issues, and background..."
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
              loading={actionLoading}
            >
              {editMatter ? 'Save Changes' : 'Initialize Matter'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmMatter}
        onClose={() => setDeleteConfirmMatter(null)}
        title="Confirm Matter Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-200">
              <span className="font-semibold block mb-1">Permanent Deletion Warning:</span>
              Deleting <span className="font-bold">"{deleteConfirmMatter?.matter_name}"</span> will permanently erase all associated documents, pages, chunk embeddings, and AI analysis records.
            </div>
          </div>

          <p className="text-xs text-slate-400">
            This action is irreversible and complies with zero-retention matter deletion policies.
          </p>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirmMatter(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={actionLoading}
              onClick={handleDeleteMatter}
            >
              Delete Matter Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
