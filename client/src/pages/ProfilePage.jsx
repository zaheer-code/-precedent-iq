import React, { useState, useEffect } from 'react';
import { Shield, User, Lock, Activity, RefreshCw, Key, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auditAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Card, Badge } from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingSpinner, EmptyState } from '../components/common/Modal';
import AppLayout from '../components/layout/AppLayout';

export default function ProfilePage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [page, setPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const { showError } = useToast();

  const loadAuditLogs = async (pageNum = 1) => {
    setLoadingLogs(true);
    try {
      const res = await auditAPI.list({ page: pageNum, limit: 15 });
      if (res.data) {
        setLogs(res.data.logs || []);
        setTotalLogs(res.data.total || 0);
        setPage(pageNum);
      }
    } catch (err) {
      showError('Failed to load compliance audit logs.');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadAuditLogs(1);
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6] flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-[#D9A62E]" />
            Compliance, Security & Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review security-sensitive operations, data isolation policies, and account details
          </p>
        </div>

        {/* Profile & Security Settings Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card className="space-y-4 bg-[#11182D] border-[#1C2640]">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D9A62E] flex items-center justify-center text-[#0B1020] font-bold text-lg">
                {user?.fullName ? user.fullName[0].toUpperCase() : 'C'}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F3F4F6]">{user?.fullName || 'Legal Counsel'}</h3>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-[#1C2640] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Account Type:</span>
                <span className="text-[#D9A62E] font-semibold">Enterprise Counsel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Member Since:</span>
                <span className="text-slate-300">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="md:col-span-2 space-y-3 bg-[#11182D] border-[#1C2640]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D9A62E] flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#D9A62E]" />
              Security Architecture & Multi-Tenancy Guarantees
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 bg-[#0E1528] rounded-xl border border-[#1C2640] space-y-1">
                <span className="font-semibold text-[#F3F4F6] block">Row-Level SQL Scoping</span>
                <p className="text-[11px] text-slate-400">All queries parameterized strictly with verified JWT userId.</p>
              </div>
              <div className="p-3 bg-[#0E1528] rounded-xl border border-[#1C2640] space-y-1">
                <span className="font-semibold text-[#F3F4F6] block">pgvector Cosine Isolation</span>
                <p className="text-[11px] text-slate-400">Embeddings never pooled globally across foreign matters.</p>
              </div>
              <div className="p-3 bg-[#0E1528] rounded-xl border border-[#1C2640] space-y-1">
                <span className="font-semibold text-[#F3F4F6] block">Prompt Injection Guard</span>
                <p className="text-[11px] text-slate-400">All parsed legal filings treated as untrusted document text.</p>
              </div>
              <div className="p-3 bg-[#0E1528] rounded-xl border border-[#1C2640] space-y-1">
                <span className="font-semibold text-[#F3F4F6] block">Zero-Hallucination Citations</span>
                <p className="text-[11px] text-slate-400">Server cross-verifies all returned citations against retrieved chunks.</p>
              </div>
            </div>
          </Card>

        </div>

        {/* Audit Trail Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight text-[#F3F4F6] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#D9A62E]" />
              Comprehensive Security Audit Trail
            </h2>
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              onClick={() => loadAuditLogs(page)}
              loading={loadingLogs}
            >
              Refresh
            </Button>
          </div>

          <Card className="p-0 overflow-hidden bg-[#11182D] border-[#1C2640]">
            {loadingLogs ? (
              <LoadingSpinner text="Retrieving immutable audit records..." />
            ) : logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B1020] border-b border-[#1C2640] text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Operation Action</th>
                      <th className="py-3 px-4">Associated Matter</th>
                      <th className="py-3 px-4">Metadata Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C2640]">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#151E36]/40 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-medium whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-[#D9A62E] px-2 py-0.5 rounded bg-[#151E36] border border-[#1C2640]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {log.matter_name || '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate font-medium text-[11px]">
                          {log.metadata ? JSON.stringify(log.metadata) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No audit activity recorded yet.
              </div>
            )}
          </Card>
        </div>

      </div>
    </AppLayout>
  );
}
