import type React from 'react';

export default function TvLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 font-sans selection:bg-blue-500/30">
      {children}
    </div>
  );
}
