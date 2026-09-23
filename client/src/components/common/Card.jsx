import React from 'react';

export function Card({ children, className = '', hover = false, gold = false, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-[#121722]/80 border ${
        gold ? 'border-amber-500/30' : 'border-slate-800/80'
      } backdrop-blur-md p-5 transition-all duration-200 ${
        hover ? 'hover:border-slate-700 hover:bg-[#151b29] hover:shadow-xl hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    gold: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    navy: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant] || variants.default} ${
        sizes[size]
      } ${className}`}
    >
      {children}
    </span>
  );
}
