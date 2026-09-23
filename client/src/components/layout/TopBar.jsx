import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Database, Sparkles, Plus, Briefcase, ExternalLink } from 'lucide-react';
import Button from '../common/Button';

export default function TopBar({ matter, onNewMatter }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-[#0d1017]/90 border-b border-slate-800/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
      
      {/* Left: Breadcrumbs & Context */}
      <div className="flex items-center space-x-3 text-sm">
        {matter ? (
          <div className="flex items-center space-x-2">
            <Link to="/matters" className="text-slate-400 hover:text-amber-300 transition-colors font-medium">
              Matters
            </Link>
            <span className="text-slate-600">/</span>
            <span className="font-semibold text-slate-100 font-serif flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-amber-400" />
              {matter.matter_name}
              {matter.matter_number && (
                <span className="text-xs font-mono font-normal text-slate-400">
                  (#{matter.matter_number})
                </span>
              )}
            </span>
          </div>
        ) : (
          <div className="font-semibold text-slate-200">
            {location.pathname.includes('/matters') ? 'Case Management' :
             location.pathname.includes('/profile') ? 'Compliance & Security Audit' :
             'Enterprise Legal Intelligence'}
          </div>
        )}
      </div>

      {/* Right: Security & AI Badges & Quick Action */}
      <div className="flex items-center space-x-3">
        
        {/* Anti-Hallucination & Engine Pill */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#121824] border border-slate-800 text-xs">
          <span className="flex items-center text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            Zero-Hallucination RAG
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center text-amber-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
            Gemini 2.5 Flash
          </span>
        </div>

        {onNewMatter && (
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={onNewMatter}
          >
            New Matter
          </Button>
        )}
      </div>

    </header>
  );
}
