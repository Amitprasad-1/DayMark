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
  Sparkles,
  Flame,
} from 'lucide-react';

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
    <div className="space-y-1">
      <p className="px-3.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
        {title}
      </p>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer group ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600/35 via-indigo-500/20 to-transparent text-white border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-indigo-500/20 shadow-sm' : 'group-hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isActive ? item.color + ' scale-110' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
              </div>
              <span className={isActive ? 'font-bold' : 'font-medium'}>{item.label}</span>
            </div>

            {item.badge !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  item.id === 'timer' && timerStatus === 'RUNNING'
                    ? 'bg-emerald-400 text-slate-950 animate-pulse font-sans font-extrabold'
                    : 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                }`}
              >
                {item.id === 'timer' && timerStatus === 'RUNNING' ? 'LIVE' : item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-white/10 p-4 space-y-6 shrink-0 min-h-[calc(100vh-65px)]">
      {renderNavGroup('Workspace', coreNav)}
      {renderNavGroup('Insights & System', secondaryNav)}

      {/* Motivational Mindset Card */}
      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-indigo-950/30 border border-amber-500/20 text-xs space-y-2 relative overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Flame className="w-4 h-4 fill-amber-400" />
          <span>Daily Mindset</span>
        </div>
        <p className="text-slate-300 italic leading-relaxed text-[11px]">
          &quot;We are what we repeatedly do. Excellence, then, is not an act, but a habit.&quot;
        </p>
      </div>
    </aside>
  );
};
