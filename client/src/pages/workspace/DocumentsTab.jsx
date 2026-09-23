import React, { useState } from 'react';
import {
  FileText,
  Trash2,
  RefreshCw,
  Eye,
  Tag,
  AlertCircle,
  FileUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { documentsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, Badge } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Modal, LoadingSpinner, EmptyState } from '../../components/common/Modal';
import { Select } from '../../components/common/Input';
import { DocumentCategoryBadge, StatusBadge } from '../../components/legal/SeverityBadge';
import DocumentUploader from '../../components/legal/DocumentUploader';

const CATEGORIES = [
  'Case Law', 'Statute', 'Regulation', 'Contract', 'Deposition',
  'Complaint', 'Answer', 'Motion', 'Brief', 'Judgment', 'Order',
  'Exhibit', 'Legal Memorandum', 'Policy', 'Compliance Document', 'Other'
];

export default function DocumentsTab({ matter, documents = [], onRefresh }) {
  const [selectedDocForPreview, setSelectedDocForPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [editingCategoryDoc, setEditingCategoryDoc] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const handlePreview = async (doc) => {
    setPreviewLoading(true);
    setSelectedDocForPreview(doc);
    try {
      const res = await documentsAPI.get(doc.id);
      if (res.data && res.data.document) {
        setSelectedDocForPreview(res.data.document);
      }
    } catch (err) {
      showError('Failed to load document preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleReprocess = async (docId) => {
    try {
      await documentsAPI.reprocess(docId);
      showSuccess('Reprocessing pipeline queued.');
      if (onRefresh) onRefresh();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to trigger reprocessing.');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!editingCategoryDoc || !newCategory) return;

    setActionLoading(true);
    try {
      await documentsAPI.updateCategory(editingCategoryDoc.id, newCategory);
      showSuccess('Document classification updated.');
      setEditingCategoryDoc(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      showError('Failed to update document category.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmDoc) return;
    setActionLoading(true);
    try {
      await documentsAPI.delete(deleteConfirmDoc.id);
      showSuccess(`Document "${deleteConfirmDoc.original_filename}" deleted.`);
      setDeleteConfirmDoc(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to delete document.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Upload Zone Card */}
      <Card className="p-6">
        <h3 className="text-base font-serif font-bold text-slate-100 mb-1 flex items-center gap-2">
          <FileUp className="w-5 h-5 text-amber-400" />
          Ingest Legal Documents to Matter
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Upload case law, depositions, contracts, or court filings. Documents are extracted, paginated, chunked, and embedded into pgvector.
        </p>

        <DocumentUploader
          matterId={matter.id}
          onUploadComplete={() => {
            if (onRefresh) onRefresh();
          }}
        />
      </Card>

      {/* Ingested Documents Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 bg-[#0e131d] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Ingested Documents ({documents.length})
            </h3>
          </div>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={onRefresh}>
            Refresh Status
          </Button>
        </div>

        {documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090c12] border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Pages / Vectors</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                    
                    {/* Filename */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5 max-w-xs">
                        <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="font-medium text-slate-200 truncate">{doc.original_filename}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono pl-6">
                        {(doc.file_size / 1024).toFixed(0)} KB • {doc.mime_type?.split('/')[1] || 'doc'}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setEditingCategoryDoc(doc);
                          setNewCategory(doc.category || 'Other');
                        }}
                        title="Click to reclassify document"
                        className="hover:opacity-80 transition-opacity"
                      >
                        <DocumentCategoryBadge category={doc.category} />
                      </button>
                    </td>

                    {/* Pages & Chunks */}
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {doc.page_count ? `${doc.page_count} page(s)` : '—'} / {doc.chunk_count || 0} vectors
                    </td>

                    {/* Processing Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={doc.processing_status} error={doc.processing_error} />
                    </td>

                    {/* Upload Date */}
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => handlePreview(doc)}
                        title="Inspect Extracted Text & Pages"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleReprocess(doc.id)}
                        title="Reprocess Document & Embeddings"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmDoc(doc)}
                        title="Delete Document"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No documents uploaded to this matter yet. Use the upload zone above.
          </div>
        )}
      </Card>

      {/* Document Page Preview Modal */}
      <Modal
        isOpen={!!selectedDocForPreview}
        onClose={() => setSelectedDocForPreview(null)}
        title={`Document Extracted Text: ${selectedDocForPreview?.original_filename || ''}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {previewLoading ? (
            <LoadingSpinner text="Loading parsed pages..." />
          ) : selectedDocForPreview?.pages && selectedDocForPreview.pages.length > 0 ? (
            selectedDocForPreview.pages.map((p) => (
              <div key={p.id || p.page_number} className="p-4 rounded-xl bg-[#090c12] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Page {p.page_number}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {p.extracted_text.length} characters
                  </span>
                </div>
                <div className="text-xs font-serif text-slate-200 leading-relaxed whitespace-pre-wrap select-text">
                  {p.extracted_text}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">
              No page text available. Document might be processing or parsing failed.
            </p>
          )}
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={!!editingCategoryDoc}
        onClose={() => setEditingCategoryDoc(null)}
        title="Classify Document Type"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <p className="text-xs text-slate-400">
            Select the legal categorization for <span className="text-slate-200 font-semibold">{editingCategoryDoc?.original_filename}</span>:
          </p>

          <Select
            label="Document Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            options={CATEGORIES.map(c => ({ value: c, label: c }))}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditingCategoryDoc(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={actionLoading}>
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmDoc}
        onClose={() => setDeleteConfirmDoc(null)}
        title="Confirm Document Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete <span className="font-semibold text-slate-100">"{deleteConfirmDoc?.original_filename}"</span>?
            All associated chunks, embeddings, and page indexes will be permanently removed.
          </p>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmDoc(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" loading={actionLoading} onClick={handleDelete}>
              Delete Document
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
