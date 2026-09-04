'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { ActiveTab } from '@/types';
import {
  CalendarDays,
  Timer,
  CheckSquare,
  Zap,
  Target,
  BarChart3,
  BookOpen,
  Settings,
  Flame,
  Sparkles,
  Pin,
  PinOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  color: string;
  shortcut?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, tasks, timerStatus } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved pin state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('daymark_sidebar_pinned');
      if (saved !== null) {
        setIsPinned(JSON.parse(saved));
      }
    } catch {
      // Ignore SSR/storage errors
    }
  }, []);

  const togglePin = () => {
    const next = !isPinned;
    setIsPinned(next);
    try {
      localStorage.setItem('daymark_sidebar_pinned', JSON.stringify(next));
    } catch {
      // Ignore
    }
  };

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 220);
  };

  const isExpanded = isHovered || isPinned;
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const coreNav: NavItem[] = [
    { id: 'dashboard', label: 'Year Calendar', icon: CalendarDays, color: 'text-amber-400', shortcut: '1' },
    { id: 'timer', label: 'Focus Timer', icon: Timer, badge: timerStatus === 'RUNNING' ? 1 : undefined, color: 'text-emerald-400', shortcut: '2' },
    { id: 'tasks', label: 'Tasks & Directives', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined, color: 'text-sky-400', shortcut: '3' },
    { id: 'habits', label: 'Habits Matrix', icon: Zap, color: 'text-amber-400', shortcut: '4' },
  ];

  const secondaryNav: NavItem[] = [
    { id: 'goals', label: 'Goals & Targets', icon: Target, color: 'text-purple-400', shortcut: '5' },
    { id: 'analytics', label: 'Focus Analytics', icon: BarChart3, color: 'text-cyan-400', shortcut: '6' },
    { id: 'review', label: 'Daily Reflection', icon: BookOpen, color: 'text-rose-400', shortcut: '7' },
    { id: 'settings', label: 'Settings & Data', icon: Settings, color: 'text-slate-400', shortcut: '8' },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="space-y-1 w-full">
      {/* Group Header: Constant height prevents any vertical jumping */}
      <div className="h-6 flex items-center px-1">
        {isExpanded ? (
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-sans flex items-center justify-between w-full">
            <span>{title}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700/60" />
          </p>
        ) : (
          <div className="w-5 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto" />
        )}
      </div>

      <div className="space-y-1.5 w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full h-11 relative flex items-center px-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer group outline-none select-none ${
                isActive ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
              title={!isExpanded ? `${item.label} (${item.shortcut})` : undefined}
            >
              {/* Single Unified Active Pill - No ugly nested boxes */}
              {isActive && (
                <motion.div
                  layoutId="sidebarActivePill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/25 via-indigo-600/15 to-transparent border border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.25)] pointer-events-none"
                />
              )}

              {/* Folded vertical accent glow bar */}
              {isActive && !isExpanded && (
                <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-gradient-to-b from-indigo-400 to-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.9)]" />
              )}

              {/* Icon Container: Clean, proportional, single-layer */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative z-10 transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'group-hover:bg-white/5 text-slate-400'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive
                      ? item.color + ' scale-110 drop-shadow-[0_0_10px_currentColor]'
                      : 'text-slate-400 group-hover:text-white group-hover:scale-110'
                  }`}
                />
              </div>

              {/* Text Label: Expands smoothly without displacing icon */}
              <div
                className={`overflow-hidden transition-all duration-200 flex items-center justify-between flex-1 relative z-10 ${
                  isExpanded ? 'max-w-[180px] opacity-100 ml-2.5' : 'max-w-0 opacity-0 ml-0 pointer-events-none'
                }`}
              >
                <span className="tracking-tight whitespace-nowrap overflow-hidden text-ellipsis font-medium">
                  {item.label}
                </span>

                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  {item.badge !== undefined ? (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        item.id === 'timer' && timerStatus === 'RUNNING'
                          ? 'bg-emerald-400 text-slate-950 animate-pulse font-sans font-black shadow-[0_0_12px_rgba(16,185,129,0.9)]'
                          : 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                      }`}
                    >
                      {item.id === 'timer' && timerStatus === 'RUNNING' ? 'LIVE' : item.badge}
                    </span>
                  ) : item.shortcut ? (
                    <kbd className="hidden group-hover:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white/[0.06] border border-white/10 rounded-md shadow-sm">
                      {item.shortcut}
                    </kbd>
                  ) : null}
                </div>
              </div>

              {/* Folded active indicator for running timer */}
              {!isExpanded && item.id === 'timer' && timerStatus === 'RUNNING' && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      className={`hidden md:block ${
        isPinned ? 'w-64' : 'w-[68px]'
      } shrink-0 sticky top-[68px] h-[calc(100vh-68px)] relative transition-[width] duration-200 z-30`}
    >
      <motion.aside
        initial={false}
        animate={{
          width: isExpanded ? 256 : 68,
          boxShadow: isExpanded
            ? '16px 0 40px rgba(0, 0, 0, 0.85)'
            : '2px 0 10px rgba(0, 0, 0, 0.25)',
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="absolute top-0 left-0 bottom-0 flex flex-col glass-panel-luxury border-r border-white/[0.08] p-2.5 space-y-3 overflow-hidden bg-[#050811]/95 backdrop-blur-3xl h-full select-none"
      >
        {/* Top Header Row with Pin / Expand Toggle */}
        <div className="h-9 flex items-center justify-between px-1 pb-1 border-b border-white/[0.06] shrink-0">
          {isExpanded ? (
            <div className="flex items-center justify-between w-full animate-fadeIn">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Navigation
                </span>
              </div>
              <button
                type="button"
                onClick={togglePin}
                className={`p-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                  isPinned
                    ? 'text-amber-400 bg-amber-500/20 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5'
                }`}
                title={isPinned ? 'Unpin sidebar (auto-collapse)' : 'Pin sidebar open'}
              >
                {isPinned ? <Pin className="w-3.5 h-3.5 fill-amber-400" /> : <PinOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={togglePin}
              className="w-9 h-8 mx-auto rounded-xl flex items-center justify-center bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 hover:border-indigo-500/50 transition-all cursor-pointer shadow-[0_0_10px_rgba(99,102,241,0.2)] group"
              title="Click to pin navigation open"
            >
              <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="space-y-3 flex-1 overflow-y-auto overflow-x-hidden pr-0.5">
          {renderNavGroup('Workspace', coreNav)}
          {renderNavGroup('Insights & System', secondaryNav)}
        </div>

        {/* Motivational Mindset Card */}
        {isExpanded ? (
          <div className="mt-auto p-3 rounded-2xl bg-gradient-to-br from-amber-950/20 via-slate-900/70 to-indigo-950/30 border border-amber-500/20 text-xs space-y-1.5 relative overflow-hidden shadow-xl animate-fadeIn">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-400 animate-pulse" />
              <span className="font-extrabold tracking-wide uppercase text-[10px]">Daily Mindset</span>
            </div>
            <p className="text-slate-300 italic leading-relaxed text-[10px]">
              &quot;We are what we repeatedly do. Excellence, then, is not an act, but a habit.&quot;
            </p>
          </div>
        ) : (
          <div
            onClick={togglePin}
            className="mt-auto w-10 h-10 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/15 to-amber-950/40 border border-amber-500/35 flex items-center justify-center text-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.25)] hover:scale-105 transition-all cursor-pointer group"
            title="Daily Mindset (Click to pin navigation open)"
          >
            <Flame className="w-5 h-5 fill-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
          </div>
        )}
      </motion.aside>
    </div>
  );
};
