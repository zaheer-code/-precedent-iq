import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-[#11182D] border border-[#1C2640] text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidth} z-10 animate-in zoom-in-95 duration-200`}
        >
          {title && (
            <div className="flex items-center justify-between border-b border-[#1C2640] px-6 py-4 bg-[#0E1528]">
              <h3 className="text-base font-bold tracking-tight text-[#F3F4F6]">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-[#151E36] hover:text-[#F3F4F6] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ text = 'Loading intelligence...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <div className={`${sizeClasses[size]} border-2 border-[#D9A62E]/20 border-t-[#D9A62E] rounded-full animate-spin`} />
      {text && <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">{text}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-[#1C2640] bg-[#0E1528]/80">
      {Icon && (
        <div className="p-3 bg-[#151E36] rounded-2xl border border-[#1C2640] text-[#D9A62E] mb-4">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-base font-semibold text-[#F3F4F6]">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorAlert({ message, retry }) {
  if (!message) return null;
  return (
    <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-600/30 text-rose-200 text-sm flex items-center justify-between">
      <span>{message}</span>
      {retry && (
        <button onClick={retry} className="text-xs font-semibold underline hover:text-white ml-3">
          Try Again
        </button>
      )}
    </div>
  );
}
