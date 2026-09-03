'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Clock,
  Calendar,
  Flame,
  Plus,
  Play,
  CheckCircle,
  Zap,
  Sparkles,
} from 'lucide-react';
import { format, getDayOfYear, getDaysInYear } from 'date-fns';

export const Header: React.FC = () => {
  const { setActiveTab, setTimerStatus, setIsDayDetailOpen, setSelectedDate, sessions, habits, tasks } = useApp();
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

  // Calculate current streak
  const todayStr = format(now, 'yyyy-MM-dd');
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const todayFocusMinutes = Math.round(
    todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
  );

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3 backdrop-blur-xl bg-slate-950/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: App Logo & Live Year Day Banner */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group text-left"
          >
            <img
              src="/logo.png"
              alt="DayMark Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform border border-white/10"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-xl tracking-tight text-white font-sans">
                  Day<span className="text-indigo-400">Mark</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Day {dayOfYear} of {totalDaysInYear} ({yearProgress}%)
              </p>
            </div>
          </button>
        </div>

        {/* Center: Live Clock & Date Badge */}
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/60 border border-white/5 shadow-inner">
          <div className="flex items-center gap-2 text-indigo-300 font-mono font-medium text-sm">
            <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>{time}</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{dateStr}</span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-3">
          {/* Today's Focus Stat Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Today:</span>
            <span className="font-bold text-indigo-300">{todayFocusMinutes}m</span>
          </div>

          {/* Quick Focus Button */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('timer');
              setTimerStatus('RUNNING');
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span className="hidden sm:inline">Start Focus</span>
          </button>

          {/* Log Today Modal Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
              setIsDayDetailOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs border border-white/10 transition-colors cursor-pointer"
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
