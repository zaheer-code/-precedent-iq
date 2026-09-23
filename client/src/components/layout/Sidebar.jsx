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
    <aside className="w-64 bg-[#0d1017] border-r border-slate-800/80 flex flex-col h-screen select-none">
      
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 bg-[#090c12]">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-lg shadow-amber-500/20 text-slate-950">
            <Scale className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-serif font-bold text-base tracking-wider bg-gradient-to-r from-amber-200 via-amber-100 to-amber-400 bg-clip-text text-transparent">
              PRECEDENT<span className="font-sans font-black text-amber-400">IQ</span>
            </span>
            <span className="block text-[9px] font-semibold uppercase tracking-widest text-slate-400">
              Legal Intelligence
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menus */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        
        {/* Main Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-amber-400" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Matter Workspace Specific Section */}
        {currentMatterId && (
          <div>
            <div className="px-3 mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-400">
              <span>Active Workspace</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
                          ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-amber-400/80" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090c12]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#121722] border border-slate-800">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-xs font-bold font-serif flex-shrink-0">
              {user?.fullName ? user.fullName[0].toUpperCase() : 'A'}
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.fullName || 'Legal Counsel'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'authenticated'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out of PrecedentIQ"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  );
}
