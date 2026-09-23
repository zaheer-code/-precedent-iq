import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Database, Sparkles, Plus, Briefcase, ExternalLink } from 'lucide-react';
import Button from '../common/Button';

export default function TopBar({ matter, onNewMatter }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-[#0B1020]/95 border-b border-[#1C2640] backdrop-blur-md px-6 flex items-center justify-between z-20">
      
      {/* Left: Breadcrumbs & Context */}
      <div className="flex items-center space-x-3 text-sm">
        {matter ? (
          <div className="flex items-center space-x-2">
            <Link to="/matters" className="text-[#9CA3AF] hover:text-[#D9A62E] transition-colors font-medium">
              Matters
            </Link>
            <span className="text-[#6B7280]">/</span>
            <span className="font-semibold text-[#F3F4F6] flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#D9A62E]" />
              {matter.matter_name}
              {matter.matter_number && (
                <span className="text-xs font-mono font-normal text-[#9CA3AF]">
                  (#{matter.matter_number})
                </span>
              )}
            </span>
          </div>
        ) : (
          <div className="font-semibold text-[#F3F4F6]">
            {location.pathname.includes('/matters') ? 'Case Management' :
             location.pathname.includes('/profile') ? 'Compliance & Security Audit' :
             'Enterprise Legal Intelligence'}
          </div>
        )}
      </div>

      {/* Right: Security & AI Badges & Quick Action */}
      <div className="flex items-center space-x-3">
        
        {/* Anti-Hallucination & Engine Pill */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#11182D] border border-[#1C2640] text-xs">
          <span className="flex items-center text-[#D9A62E] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#D9A62E]" />
            Zero-Hallucination RAG
          </span>
          <span className="text-[#6B7280]">•</span>
          <span className="flex items-center text-[#F3F4F6] font-medium">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-[#D9A62E]" />
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
