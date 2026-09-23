import React from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import {
  Scale,
  LayoutDashboard,
  Briefcase,
  FileText,
  Search,
  AlertTriangle,
  GitCompare,
  FileSpreadsheet,
  Database,
  Shield,
  LogOut,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const params = useParams();

  // Check if we are inside a matter workspace route (/matters/:matterId/...)
  const matterMatch = location.pathname.match(/\/matters\/([a-f0-9-]+)/);
  const currentMatterId = matterMatch ? matterMatch[1] : null;

  const mainLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Matters & Cases', path: '/matters', icon: Briefcase },
    { name: 'Audit & Compliance', path: '/profile', icon: Shield }
  ];

  const workspaceLinks = currentMatterId ? [
    { name: 'Matter Overview', path: `/matters/${currentMatterId}`, icon: FolderOpen, exact: true },
    { name: 'Documents', path: `/matters/${currentMatterId}/documents`, icon: FileText },
    { name: 'Legal Research (RAG)', path: `/matters/${currentMatterId}/research`, icon: Search },
    { name: 'Vulnerability Detector', path: `/matters/${currentMatterId}/vulnerabilities`, icon: AlertTriangle },
    { name: 'Clause Comparison', path: `/matters/${currentMatterId}/clauses`, icon: GitCompare },
    { name: 'Trial Brief Builder', path: `/matters/${currentMatterId}/brief`, icon: FileSpreadsheet },
    { name: 'Evidence Explorer', path: `/matters/${currentMatterId}/evidence`, icon: Database }
  ] : [];

  return (
    <aside className="w-64 bg-[#0B1020] border-r border-[#1C2640] flex flex-col h-screen select-none">
      
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#1C2640] bg-[#0B1020]">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-[#D9A62E] rounded-lg shadow-md shadow-[#D9A62E]/20 text-[#0B1020]">
            <Scale className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-[#F3F4F6]">
              PRECEDENT<span className="text-[#D9A62E]">IQ</span>
            </span>
            <span className="block text-[9px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
              Legal Intelligence
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menus */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        
        {/* Main Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            Platform
          </div>
          <nav className="space-y-1">
            {mainLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/matters'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive && !currentMatterId
                        ? 'bg-[#D9A62E]/15 text-[#D9A62E] border border-[#D9A62E]/30 font-semibold'
                        : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#151E36]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#D9A62E]" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Matter Workspace Specific Section */}
        {currentMatterId && (
          <div>
            <div className="px-3 mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#D9A62E]">
              <span>Active Workspace</span>
              <span className="w-2 h-2 rounded-full bg-[#D9A62E] animate-pulse" />
            </div>
            <nav className="space-y-1">
              {workspaceLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#D9A62E]/15 text-[#D9A62E] font-semibold border border-[#D9A62E]/40 shadow-sm'
                          : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#151E36]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-[#D9A62E]" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-[#1C2640] bg-[#0B1020]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#11182D] border border-[#1C2640]">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-7 h-7 rounded-full bg-[#D9A62E]/15 border border-[#D9A62E]/40 flex items-center justify-center text-[#D9A62E] text-xs font-bold flex-shrink-0">
              {user?.fullName ? user.fullName[0].toUpperCase() : 'A'}
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-semibold text-[#F3F4F6] truncate">{user?.fullName || 'Legal Counsel'}</p>
              <p className="text-[10px] text-[#9CA3AF] truncate">{user?.email || 'authenticated'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out of PrecedentIQ"
            className="p-1.5 rounded-md text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#151E36] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  );
}
