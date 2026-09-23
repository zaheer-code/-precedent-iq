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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-[#0a0d14]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20 text-slate-950">
              <Scale className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-serif font-bold text-xl tracking-wider bg-gradient-to-r from-amber-200 via-amber-100 to-amber-400 bg-clip-text text-transparent">
                PRECEDENT<span className="font-sans font-black text-amber-400">IQ</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Legal Intelligence Engine
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Enterprise Legal Intelligence & RAG
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-slate-100 leading-tight">
            Grounded Intelligence for <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
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
            <div className="p-4 rounded-xl bg-[#10141e] border border-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
              <p className="text-xs font-semibold text-slate-200">100% Citation Backed</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Every assertion verified against record</p>
            </div>
            <div className="p-4 rounded-xl bg-[#10141e] border border-slate-800">
              <Database className="w-5 h-5 text-amber-400 mb-2" />
              <p className="text-xs font-semibold text-slate-200">pgvector Isolation</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Strict multi-tenant matter barriers</p>
            </div>
            <div className="p-4 rounded-xl bg-[#10141e] border border-slate-800">
              <Lock className="w-5 h-5 text-sky-400 mb-2" />
              <p className="text-xs font-semibold text-slate-200">Confidentiality Guard</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Prompt injection defense built-in</p>
            </div>
            <div className="p-4 rounded-xl bg-[#10141e] border border-slate-800">
              <BookOpen className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-xs font-semibold text-slate-200">Page-Level Accuracy</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Direct source jump & quote inspect</p>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="py-20 px-6 bg-[#0a0d14] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Core Capabilities</span>
            <h2 className="text-3xl font-serif font-bold text-slate-100">
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
                  className="p-6 rounded-2xl bg-[#121722]/90 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="p-3 w-fit bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-100 mb-2">{cap.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{cap.description}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#06080c] py-8 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-300">
            <Scale className="w-4 h-4 text-amber-400" />
            <span className="font-serif font-bold text-amber-200">PrecedentIQ</span>
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
