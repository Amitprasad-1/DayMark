'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { motion } from 'framer-motion';

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

  const isExpanded = isHovered || isPinned;
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

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="space-y-1.5 w-full">
      {isExpanded ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500/80 mb-2 font-sans flex items-center justify-between"
        >
          <span>{title}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700/50" />
        </motion.p>
      ) : (
        <div className="w-8 h-px bg-white/[0.08] mx-auto my-2" />
      )}

      <div className="space-y-1 relative w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              whileHover={{ x: isExpanded ? 4 : 0, scale: isExpanded ? 1 : 1.08 }}
              whileTap={{ scale: 0.96 }}
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full relative flex items-center ${
                isExpanded ? 'justify-between px-3 py-2.5' : 'justify-center p-2.5'
              } rounded-2xl text-xs font-semibold transition-colors duration-200 cursor-pointer group outline-none ${
                isActive ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
              title={!isExpanded ? `${item.label} (${item.shortcut})` : undefined}
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

                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className="tracking-tight whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {item.label}
                  </motion.span>
                )}
              </div>

              {isExpanded && (
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
              )}

              {/* Folded active indicator for running timer */}
              {!isExpanded && item.id === 'timer' && timerStatus === 'RUNNING' && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="hidden md:block w-[72px] shrink-0 min-h-[calc(100vh-70px)] relative">
      <motion.aside
        initial={false}
        animate={{
          width: isExpanded ? 256 : 72,
          boxShadow: isExpanded
            ? '14px 0 35px rgba(0, 0, 0, 0.75)'
            : '2px 0 12px rgba(0, 0, 0, 0.25)',
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="absolute top-0 left-0 bottom-0 z-30 flex flex-col glass-panel-luxury border-r border-white/[0.08] p-3 space-y-5 overflow-hidden bg-[#050811]/95 backdrop-blur-3xl min-h-[calc(100vh-70px)] select-none"
      >
        {/* Top Header Row with Pin Toggle */}
        <div className="flex items-center justify-between px-1.5 pb-2 border-b border-white/[0.06] min-h-[36px]">
          {isExpanded ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between w-full"
            >
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Navigation</span>
              </span>
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  isPinned
                    ? 'text-amber-400 bg-amber-500/20 border border-amber-500/30 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
                title={isPinned ? 'Unpin (auto-fold on mouse leave)' : 'Pin sidebar open'}
              >
                {isPinned ? <Pin className="w-3.5 h-3.5 fill-amber-400" /> : <PinOff className="w-3.5 h-3.5" />}
              </button>
            </motion.div>
          ) : (
            <div className="w-full flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </div>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="space-y-4 flex-1 overflow-y-auto overflow-x-hidden">
          {renderNavGroup('Workspace', coreNav)}
          {renderNavGroup('Insights & System', secondaryNav)}
        </div>

        {/* Motivational Mindset Card */}
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="mt-auto p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/20 via-slate-900/70 to-indigo-950/30 border border-amber-500/20 text-xs space-y-2 relative overflow-hidden shadow-xl group transition-all duration-300"
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
        ) : (
          <div
            className="mt-auto w-11 h-11 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500/15 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg cursor-pointer"
            title="Excellence is not an act, but a habit."
          >
            <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
          </div>
        )}
      </motion.aside>
    </div>
  );
};
