'use client';

import React from 'react';
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
  ChevronRight,
  X,
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
  const {
    activeTab,
    setActiveTab,
    tasks,
    timerStatus,
    isSidebarOpen,
    setIsSidebarOpen,
    isSidebarPinned,
    setIsSidebarPinned,
  } = useApp();

  const isVisible = isSidebarOpen || isSidebarPinned;
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const coreNav: NavItem[] = [
    { id: 'dashboard', label: 'Year Calendar', icon: CalendarDays, color: 'text-amber-400', shortcut: '1' },
    { id: 'timer', label: 'Focus Timer', icon: Timer, badge: timerStatus === 'RUNNING' ? 1 : undefined, color: 'text-emerald-400', shortcut: '2' },
    { id: 'tasks', label: 'Tasks & Directives', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined, color: 'text-blue-400', shortcut: '3' },
    { id: 'habits', label: 'Habits Matrix', icon: Zap, color: 'text-amber-400', shortcut: '4' },
  ];

  const secondaryNav: NavItem[] = [
    { id: 'goals', label: 'Goals & Targets', icon: Target, color: 'text-purple-400', shortcut: '5' },
    { id: 'analytics', label: 'Focus Analytics', icon: BarChart3, color: 'text-cyan-400', shortcut: '6' },
    { id: 'review', label: 'Daily Reflection', icon: BookOpen, color: 'text-rose-400', shortcut: '7' },
    { id: 'settings', label: 'Settings & Data', icon: Settings, color: 'text-slate-400', shortcut: '8' },
  ];

  const handleSelectTab = (id: ActiveTab) => {
    setActiveTab(id);
    if (!isSidebarPinned) {
      setIsSidebarOpen(false);
    }
  };

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="space-y-1.5 w-full">
      <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500/80 mb-2 font-sans flex items-center justify-between">
        <span>{title}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-700/50" />
      </p>

      <div className="space-y-1 relative w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.96 }}
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id)}
              className={`w-full relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-colors duration-200 cursor-pointer group outline-none ${
                isActive ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {/* Fluid Sliding Active Indicator Background */}
              {isActive && (
                <motion.div
                  layoutId="sidebarActivePill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600/40 via-indigo-500/25 to-indigo-600/10 border border-indigo-500/50 shadow-[0_4px_20px_rgba(99,102,241,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]"
                />
              )}

              <div className="flex items-center gap-3 relative z-10 min-w-0">
                <div
                  className={`p-1.5 rounded-xl transition-all duration-300 shrink-0 ${
                    isActive
                      ? 'bg-indigo-500/30 shadow-md ring-1 ring-indigo-400/40 scale-105'
                      : 'group-hover:bg-white/5 group-hover:scale-110'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isActive ? item.color + ' scale-110' : 'text-slate-500 group-hover:text-slate-300 group-hover:-rotate-6'
                    }`}
                  />
                </div>
                <span className="tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5 relative z-10">
                {item.badge !== undefined ? (
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      item.id === 'timer' && timerStatus === 'RUNNING'
                        ? 'bg-emerald-400 text-slate-950 animate-pulse font-sans font-black shadow-[0_0_12px_rgba(16,185,129,0.9)]'
                        : 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                    }`}
                  >
                    {item.id === 'timer' && timerStatus === 'RUNNING' ? 'LIVE' : item.badge}
                  </motion.span>
                ) : item.shortcut ? (
                  <kbd className="hidden group-hover:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white/[0.06] border border-white/10 rounded-md shadow-sm">
                    {item.shortcut}
                  </kbd>
                ) : null}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Left Edge Slim Hover Trigger Rail (when folded and unpinned) */}
      {!isSidebarPinned && (
        <div
          onMouseEnter={() => setIsSidebarOpen(true)}
          className="hidden md:block fixed top-[65px] left-0 bottom-0 w-2.5 hover:w-3.5 z-30 transition-all duration-200 cursor-pointer group bg-transparent hover:bg-indigo-500/10"
          title="Hover to open navigation menu"
        >
          <div className="w-1 h-12 bg-indigo-500/30 group-hover:bg-indigo-400/80 rounded-r-full absolute top-1/2 -translate-y-1/2 transition-colors shadow-sm" />
        </div>
      )}

      {/* 2. Soft Backdrop overlay when floating/unpinned */}
      {!isSidebarPinned && isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSidebarOpen(false)}
          className="hidden md:block fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* 3. The Navigation Drawer / Sidebar */}
      <AnimatePresence>
        {isVisible && (
          <motion.aside
            initial={{ x: isSidebarPinned ? 0 : -290, opacity: isSidebarPinned ? 1 : 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -290, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 35 }}
            onMouseEnter={() => setIsSidebarOpen(true)}
            onMouseLeave={() => {
              if (!isSidebarPinned) {
                setIsSidebarOpen(false);
              }
            }}
            className={`hidden md:flex flex-col ${
              isSidebarPinned
                ? 'w-64 shrink-0 min-h-[calc(100vh-70px)] border-r border-white/[0.08] relative z-20'
                : 'fixed top-[65px] left-0 bottom-0 w-72 z-50 shadow-[20px_0_50px_rgba(0,0,0,0.85)] border-r border-white/[0.12]'
            } glass-panel-luxury p-4 space-y-6 overflow-y-auto bg-[#050811]/95 backdrop-blur-3xl select-none`}
          >
            {/* Top Header Row with Pin Toggle & Close */}
            <div className="flex items-center justify-between px-1 pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Navigation
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsSidebarPinned(!isSidebarPinned)}
                  className={`p-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                    isSidebarPinned
                      ? 'text-amber-400 bg-amber-500/20 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5'
                  }`}
                  title={isSidebarPinned ? 'Unpin (auto-fold)' : 'Pin sidebar open'}
                >
                  {isSidebarPinned ? <Pin className="w-3.5 h-3.5 fill-amber-400" /> : <PinOff className="w-3.5 h-3.5" />}
                </button>

                {!isSidebarPinned && (
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
                    title="Close navigation"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Groups */}
            <div className="space-y-5 flex-1 overflow-y-auto pr-0.5">
              {renderNavGroup('Workspace', coreNav)}
              {renderNavGroup('Insights & System', secondaryNav)}
            </div>

            {/* Motivational Mindset Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-amber-950/20 via-slate-900/70 to-indigo-950/30 border border-amber-500/20 text-xs space-y-2 relative overflow-hidden shadow-xl group transition-all duration-300"
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/25 transition-all duration-500" />
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
                <span className="font-extrabold tracking-wide uppercase text-[10px]">Daily Mindset</span>
              </div>
              <p className="text-slate-300 italic leading-relaxed text-[11px]">
                &quot;We are what we repeatedly do. Excellence, then, is not an act, but a habit.&quot;
              </p>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
