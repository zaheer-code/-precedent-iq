import React from 'react';

export function Card({ children, className = '', hover = false, gold = false, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-[#11182D] border ${
        gold ? 'border-[#D9A62E]/40' : 'border-[#1C2640]'
      } p-5 transition-all duration-200 ${
        hover ? 'hover:border-[#2A3B60] hover:bg-[#151E36] hover:shadow-lg cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variants = {
    default: 'bg-[#151E36] text-[#9CA3AF] border-[#1C2640]',
    gold: 'bg-[#D9A62E]/15 text-[#D9A62E] border-[#D9A62E]/30',
    navy: 'bg-[#151E36] text-[#F3F4F6] border-[#1C2640]',
    success: 'bg-[#D9A62E]/10 text-[#F3F4F6] border-[#D9A62E]/20',
    warning: 'bg-[#D9A62E]/20 text-[#D9A62E] border-[#D9A62E]/40',
    danger: 'bg-[#1E1724] text-rose-300 border-rose-900/40',
    purple: 'bg-[#151E36] text-[#F3F4F6] border-[#1C2640]'
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 font-medium tracking-tight',
    sm: 'text-xs px-2.5 py-0.5 font-medium tracking-tight',
    md: 'text-sm px-3 py-1 font-medium tracking-tight'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${variants[variant] || variants.default} ${
        sizes[size]
      } ${className}`}
    >
      {children}
    </span>
  );
}
