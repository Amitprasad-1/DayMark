'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Sparkles } from 'lucide-react';

// Dynamic import with ssr: false ensures zero hydration mismatch between Vercel (UTC) and mobile client (local timezone)
const AppShell = dynamic(
  () => import('@/components/layout/AppShell').then((mod) => mod.AppShell),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 animate-pulse shadow-xl shadow-indigo-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold text-white tracking-wider uppercase font-sans">
            Day<span className="text-indigo-400">Mark</span>
          </h2>
          <p className="text-xs text-slate-500">Loading your productivity suite...</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return <AppShell />;
}
