import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  ShieldCheck,
  Search,
  AlertTriangle,
  GitCompare,
  FileSpreadsheet,
  Lock,
  CheckCircle2,
  ArrowRight,
  Database,
  Sparkles,
  BookOpen
} from 'lucide-react';
import Button from '../components/common/Button';

export default function LandingPage() {
  const capabilities = [
    {
      icon: Search,
      title: 'Zero-Hallucination RAG Research',
      description: 'Perform deep semantic vector queries across voluminous case records with strict page-level citation tracing.'
    },
    {
      icon: AlertTriangle,
      title: 'Opposing Vulnerability Detector',
      description: 'Systematically deconstruct opposing counsel filings to uncover factual inconsistencies, weak precedent, and logical gaps.'
    },
    {
      icon: GitCompare,
      title: 'Dynamic Clause Comparison',
      description: 'Extract and contrast contractual provisions side-by-side with automated obligation, liability, and conflict highlighting.'
    },
    {
      icon: FileSpreadsheet,
      title: 'Interactive Trial Brief Builder',
      description: 'Synthesize complex case records into structured, IRAC-grounded trial brief outlines with direct evidentiary citations.'
    },
    {
      icon: Database,
      title: 'PostgreSQL + pgvector Engine',
      description: 'High-performance vector similarity search with complete user and matter data isolation enforced at the database level.'
    },
    {
      icon: Lock,
      title: 'Enterprise Security & Audit Trail',
      description: 'End-to-end audit logging, bcrypt credential security, JWT session protection, and multi-tenant isolation guarantees.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F3F4F6] flex flex-col selection:bg-[#D9A62E]/30 selection:text-[#F3F4F6]">
      
      {/* Navigation Header */}
      <header className="border-b border-[#1C2640] bg-[#0E1528]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#D9A62E] rounded-xl shadow-lg shadow-[#D9A62E]/15 text-[#0B1020]">
              <Scale className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-[#F3F4F6]">
                PRECEDENT<span className="font-bold text-[#D9A62E]">IQ</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Legal Intelligence Engine
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-[#F3F4F6] transition-colors">
              Sign In
            </Link>
            <Link to="/register">
              <Button size="sm" variant="primary">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#D9A62E]/5 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D9A62E]/15 border border-[#D9A62E]/35 text-[#D9A62E] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#D9A62E]" />
            Enterprise Legal Intelligence & RAG
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#F3F4F6] leading-tight">
            Grounded Intelligence for <br />
            <span className="text-[#D9A62E]">
              High-Stakes Litigation
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-400 leading-relaxed font-normal">
            PrecedentIQ transforms thousands of pages of case documents, contracts, and filings into structured, citation-backed intelligence with guaranteed zero-hallucination verification.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" icon={ArrowRight} className="w-full">
                Launch Legal Workspace
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full">
                Sign In to Cases
              </Button>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-[#11182D] border border-[#1C2640]">
              <ShieldCheck className="w-5 h-5 text-[#D9A62E] mb-2" />
              <p className="text-xs font-semibold text-[#F3F4F6]">100% Citation Backed</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Every assertion verified against record</p>
            </div>
            <div className="p-4 rounded-xl bg-[#11182D] border border-[#1C2640]">
              <Database className="w-5 h-5 text-[#D9A62E] mb-2" />
              <p className="text-xs font-semibold text-[#F3F4F6]">pgvector Isolation</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Strict multi-tenant matter barriers</p>
            </div>
            <div className="p-4 rounded-xl bg-[#11182D] border border-[#1C2640]">
              <Lock className="w-5 h-5 text-[#D9A62E] mb-2" />
              <p className="text-xs font-semibold text-[#F3F4F6]">Confidentiality Guard</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Prompt injection defense built-in</p>
            </div>
            <div className="p-4 rounded-xl bg-[#11182D] border border-[#1C2640]">
              <BookOpen className="w-5 h-5 text-[#D9A62E] mb-2" />
              <p className="text-xs font-semibold text-[#F3F4F6]">Page-Level Accuracy</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Direct source jump & quote inspect</p>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="py-20 px-6 bg-[#0B1020] border-t border-[#1C2640]">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D9A62E]">Core Capabilities</span>
            <h2 className="text-3xl font-bold tracking-tight text-[#F3F4F6]">
              Engineered for Modern Litigation Teams
            </h2>
            <p className="text-sm text-slate-400">
              Comprehensive legal analysis tools designed to accelerate trial preparation without compromising accuracy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#11182D] border border-[#1C2640] hover:border-[#D9A62E]/40 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="p-3 w-fit bg-[#151E36] rounded-xl border border-[#1C2640] text-[#D9A62E] mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-[#F3F4F6] mb-2">{cap.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{cap.description}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#1C2640] bg-[#0E1528] py-8 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-300">
            <Scale className="w-4 h-4 text-[#D9A62E]" />
            <span className="font-bold text-[#F3F4F6]">Precedent<span className="text-[#D9A62E]">IQ</span></span>
            <span>— Legal Briefing & Cross-Case Intelligence</span>
          </div>
          <div>
            Built with PostgreSQL pgvector, Google Gemini 2.5 Flash, and Express REST Architecture.
          </div>
        </div>
      </footer>

    </div>
  );
}
