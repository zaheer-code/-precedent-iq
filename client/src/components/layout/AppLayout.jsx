import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout({ children, matter, onNewMatter }) {
  return (
    <div className="flex h-screen bg-[#0a0d14] text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar matter={matter} onNewMatter={onNewMatter} />
        
        <main className="flex-1 overflow-y-auto bg-[#0a0d14] p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
