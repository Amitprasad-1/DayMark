'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Clock,
  Calendar,
  Flame,
  Plus,
  Play,
  Sparkles,
} from 'lucide-react';
import { format, getDayOfYear, getDaysInYear } from 'date-fns';

export const Header: React.FC = () => {
  const { setActiveTab, setTimerStatus, setIsDayDetailOpen, setSelectedDate, sessions } = useApp();
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(format(now, 'HH:mm:ss'));
      setDateStr(format(now, 'EEEE, MMMM d, yyyy'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const dayOfYear = getDayOfYear(now);
  const totalDaysInYear = getDaysInYear(now);
  const yearProgress = ((dayOfYear / totalDaysInYear) * 100).toFixed(1);

  // Calculate today's focus minutes
  const todayStr = format(now, 'yyyy-MM-dd');
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const todayFocusMinutes = Math.round(
    todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
  );

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3 backdrop-blur-2xl bg-slate-950/70 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: App Branding with Logo & Progress Pill */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group text-left"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500 rounded-2xl blur-sm opacity-40 group-hover:opacity-75 transition duration-300" />
              <img
                src="/logo.png"
                alt="DayMark Logo"
                className="relative w-10 h-10 rounded-xl object-cover shadow-xl border border-white/20"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl tracking-tight text-white font-sans">
                  Day<span className="text-gradient-gold">Mark</span>
                </h1>
                <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:flex items-center gap-1.5">
                <span>Day {dayOfYear} of {totalDaysInYear}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-indigo-300 font-semibold">{yearProgress}% complete</span>
              </p>
            </div>
          </button>
        </div>

        {/* Center: Live Clock & Date Badge */}
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/70 border border-white/10 shadow-inner">
          <div className="flex items-center gap-2 text-indigo-300 font-mono font-bold text-sm tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{time}</span>
          </div>
          <div className="h-3.5 w-px bg-white/10" />
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{dateStr}</span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-3">
          {/* Today's Focus Stat Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-slate-400">Today:</span>
            <span className="font-bold text-amber-300 font-mono">{todayFocusMinutes}m</span>
          </div>

          {/* Quick Focus Button */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('timer');
              setTimerStatus('RUNNING');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 hover:from-emerald-300 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span className="hidden sm:inline">Start Focus</span>
          </button>

          {/* Log Today Modal Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
              setIsDayDetailOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-md"
            title="Log Today's Activities"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Log Day</span>
          </button>
        </div>
      </div>
    </header>
  );
};
