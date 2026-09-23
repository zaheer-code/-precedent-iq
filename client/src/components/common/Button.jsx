import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  icon: Icon,
  className = '',
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B1020] disabled:opacity-50 disabled:cursor-not-allowed tracking-tight";

  const variants = {
    primary: "bg-[#D9A62E] hover:bg-[#E5B645] active:bg-[#C49223] text-[#0B1020] font-bold shadow-md shadow-[#D9A62E]/20 focus:ring-[#D9A62E] border border-[#D9A62E]",
    secondary: "bg-[#151E36] hover:bg-[#1C2848] text-[#F3F4F6] border border-[#1C2640] focus:ring-[#1C2640]",
    navy: "bg-[#11182D] hover:bg-[#151E36] text-[#D9A62E] border border-[#D9A62E]/30 focus:ring-[#D9A62E]",
    ghost: "bg-transparent hover:bg-[#151E36] text-[#9CA3AF] hover:text-[#F3F4F6] focus:ring-[#1C2640]",
    danger: "bg-[#1A1420] hover:bg-[#251828] text-rose-300 border border-rose-900/40 focus:ring-rose-800"
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
