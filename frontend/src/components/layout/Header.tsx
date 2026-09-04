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
  RefreshCw,
  Zap,
} from 'lucide-react';
import { format, getDayOfYear, getDaysInYear } from 'date-fns';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
  const {
    setActiveTab,
    timerStatus,
    timerMode,
    timerSecondsRemaining,
    stopwatchElapsed,
    startTimer,
    setIsDayDetailOpen,
    setSelectedDate,
    sessions,
    cloudSyncStatus,
    syncWithCloud,
  } = useApp();
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(format(now, 'hh:mm:ss a'));
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
    <header className="sticky top-0 z-40 w-full glass-panel-luxury border-b border-white/[0.08] px-4 lg:px-8 py-3.5 backdrop-blur-3xl bg-[#050811]/80 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]">
      <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-4">
        {/* Left: App Branding with Logo & Trajectory Progress Pill */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group text-left outline-none"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500 rounded-2xl blur-md opacity-40 group-hover:opacity-85 transition duration-500" />
              <img
                src="/logo.png"
                alt="DayMark Logo"
                className="relative w-10 h-10 rounded-xl object-cover shadow-2xl border border-white/25 ring-1 ring-white/10"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-xl tracking-tight text-white font-sans flex items-center">
                  Day<span className="text-gradient-gold">Mark</span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:flex items-center gap-1.5">
                <span>Day <strong className="text-slate-200 font-mono">{dayOfYear}</strong> of {totalDaysInYear}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-indigo-400 font-semibold font-mono">{yearProgress}% complete</span>
              </p>
            </div>
          </motion.button>
        </div>

        {/* Center: Live Digital Atomic Clock & Date Capsule */}
        <div className="hidden md:flex items-center gap-3.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),0_4px_12px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2 text-indigo-300 font-mono font-bold text-xs tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>{time}</span>
          </div>
          <div className="h-3.5 w-px bg-white/10" />
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{dateStr}</span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Live Timer Pill if running */}
          {timerStatus === 'RUNNING' && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setActiveTab('timer')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-emerald-500/25 border border-emerald-400/50 text-emerald-300 text-xs font-mono font-bold cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              title="Focus Session Active — Click to View"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="tracking-wider">
                {Math.floor((timerMode === 'STOPWATCH' ? stopwatchElapsed : timerSecondsRemaining) / 60)}:
                {String((timerMode === 'STOPWATCH' ? stopwatchElapsed : timerSecondsRemaining) % 60).padStart(2, '0')}
              </span>
            </motion.button>
          )}

          {/* Today's Focus Stat Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs shadow-inner">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="text-slate-400">Today:</span>
            <span className="font-extrabold text-amber-300 font-mono tracking-tight">{todayFocusMinutes}m</span>
          </div>

          {/* Quick Focus Button (harmonized luxury design) */}
          {timerStatus !== 'RUNNING' && (
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(99, 102, 241, 0.45)' }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => {
                setActiveTab('timer');
                startTimer();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-xs shadow-[0_4px_16px_rgba(99,102,241,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] cursor-pointer transition-all border border-indigo-400/40"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span className="hidden sm:inline tracking-wide uppercase">Start Focus</span>
            </motion.button>
          )}

          {/* Cloud Sync Status Indicator */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => syncWithCloud()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/85 hover:bg-slate-800/90 border border-white/10 hover:border-white/20 text-xs transition-all cursor-pointer shadow-md"
            title={
              cloudSyncStatus === 'synced'
                ? 'Cloud Synced with PostgreSQL — Click to Re-sync'
                : cloudSyncStatus === 'syncing'
                ? 'Syncing with Supabase Cloud...'
                : 'Local Cache Ready — Click to Sync Cloud'
            }
          >
            {cloudSyncStatus === 'syncing' ? (
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            ) : cloudSyncStatus === 'synced' ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            )}
            <span className="hidden sm:inline text-slate-300 font-medium">
              {cloudSyncStatus === 'synced'
                ? 'Synced'
                : cloudSyncStatus === 'syncing'
                ? 'Syncing'
                : 'Local'}
            </span>
          </motion.button>

          {/* Log Today Modal Button */}
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(30, 41, 59, 0.9)' }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => {
              setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
              setIsDayDetailOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer shadow-md"
            title="Log Today's Activities"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Log Day</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
