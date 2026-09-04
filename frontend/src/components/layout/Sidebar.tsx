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
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  color: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, tasks, timerStatus } = useApp();

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const coreNav: NavItem[] = [
    { id: 'dashboard', label: 'Year Calendar', icon: CalendarDays, color: 'text-amber-400' },
    { id: 'timer', label: 'Focus Timer', icon: Timer, badge: timerStatus === 'RUNNING' ? 1 : undefined, color: 'text-emerald-400' },
    { id: 'tasks', label: 'Tasks & Directives', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined, color: 'text-blue-400' },
    { id: 'habits', label: 'Habits Matrix', icon: Zap, color: 'text-amber-400' },
  ];

  const secondaryNav: NavItem[] = [
    { id: 'goals', label: 'Goals & Targets', icon: Target, color: 'text-purple-400' },
    { id: 'analytics', label: 'Focus Analytics', icon: BarChart3, color: 'text-cyan-400' },
    { id: 'review', label: 'Daily Reflection', icon: BookOpen, color: 'text-rose-400' },
    { id: 'settings', label: 'Settings & Data', icon: Settings, color: 'text-slate-400' },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="space-y-1.5">
      <p className="px-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500/80 mb-2 font-sans flex items-center justify-between">
        <span>{title}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-700/50" />
      </p>
      <div className="space-y-1 relative">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.96 }}
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
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

              <div className="flex items-center gap-3 relative z-10">
                <div
                  className={`p-1.5 rounded-xl transition-all duration-300 ${
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
                <span className="tracking-tight transition-transform duration-200">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`relative z-10 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    item.id === 'timer' && timerStatus === 'RUNNING'
                      ? 'bg-emerald-400 text-slate-950 animate-pulse font-sans font-black shadow-[0_0_12px_rgba(16,185,129,0.9)]'
                      : 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                  }`}
                >
                  {item.id === 'timer' && timerStatus === 'RUNNING' ? 'LIVE' : item.badge}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="hidden md:flex flex-col w-64 glass-panel-luxury border-r border-white/[0.08] p-4 space-y-6 shrink-0 min-h-[calc(100vh-70px)] bg-[#050811]/60">
      {renderNavGroup('Workspace', coreNav)}
      {renderNavGroup('Insights & System', secondaryNav)}

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
    </aside>
  );
};
