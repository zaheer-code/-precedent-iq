import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { documentsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';

export default function DocumentUploader({ matterId, onUploadComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useToast();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files) => {
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md'];
    const valid = files.filter(f => {
      const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase();
      return validExtensions.includes(ext);
    });

    if (valid.length < files.length) {
      showError('Some files were skipped. Only PDF, DOCX, and TXT files are supported.');
    }

    setSelectedFiles(prev => [...prev, ...valid]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await documentsAPI.upload(matterId, formData);
      showSuccess(`Uploaded ${selectedFiles.length} file(s) successfully. Processing started.`);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onUploadComplete) onUploadComplete(res.data.documents);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to upload documents';
      showError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-[#D9A62E] bg-[#D9A62E]/10 scale-[1.01]'
            : 'border-[#1C2640] hover:border-[#D9A62E]/50 hover:bg-[#151E36]/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3.5 bg-[#151E36] rounded-2xl border border-[#1C2640] text-[#D9A62E]">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#F3F4F6]">
              Drag & Drop case files here, or <span className="text-[#D9A62E] underline">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF (with page detection), DOCX, and TXT • Max 25MB per file
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3 p-4 bg-[#0E1528] rounded-xl border border-[#1C2640] animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Selected Documents ({selectedFiles.length})</span>
            <span>Total size: {(selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB</span>
          </div>

          <div className="divide-y divide-[#1C2640] max-h-48 overflow-y-auto">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2.5 truncate max-w-sm">
                  <File className="w-4 h-4 text-[#D9A62E] flex-shrink-0" />
                  <span className="text-[#F3F4F6] truncate">{file.name}</span>
                  <span className="text-xs text-slate-400 font-medium">
                    ({(file.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  disabled={uploading}
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => setSelectedFiles([])}
            >
              Clear All
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={uploading}
              onClick={handleUpload}
            >
              Upload & Ingest {selectedFiles.length} File(s)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
