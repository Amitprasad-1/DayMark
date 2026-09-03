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
        <img
          src="/logo.png"
          alt="DayMark"
          className="w-16 h-16 rounded-2xl object-cover shadow-2xl shadow-indigo-500/30 animate-pulse border border-white/10"
        />
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold text-white tracking-wider uppercase font-sans">
            Day<span className="text-indigo-400">Mark</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Focus &bull; Plan &bull; Achieve</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return <AppShell />;
}
