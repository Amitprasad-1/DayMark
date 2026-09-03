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

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Year Calendar',
      icon: CalendarDays,
      color: 'text-indigo-400',
    },
    {
      id: 'timer',
      label: 'Focus Timer',
      icon: Timer,
      badge: timerStatus === 'RUNNING' ? 1 : undefined,
      color: 'text-emerald-400',
    },
    {
      id: 'tasks',
      label: 'Tasks & Todos',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      color: 'text-blue-400',
    },
    {
      id: 'habits',
      label: 'Habits Tracker',
      icon: Zap,
      color: 'text-amber-400',
    },
    {
      id: 'goals',
      label: 'Goals & Targets',
      icon: Target,
      color: 'text-purple-400',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      color: 'text-cyan-400',
    },
    {
      id: 'review',
      label: 'Daily Reflection',
      icon: BookOpen,
      color: 'text-rose-400',
    },
    {
      id: 'settings',
      label: 'Settings & Data',
      icon: Settings,
      color: 'text-slate-400',
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-white/10 p-4 space-y-6 shrink-0 min-h-[calc(100vh-65px)]">
      {/* Navigation Group */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/30 to-indigo-500/10 text-white border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isActive ? item.color + ' scale-110' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.id === 'timer' && timerStatus === 'RUNNING'
                      ? 'bg-emerald-500 text-slate-950 animate-pulse'
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

      {/* Quote / Motivation Card */}
      <div className="mt-auto p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-900/40 text-xs space-y-2">
        <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
          <Zap className="w-3.5 h-3.5 fill-indigo-400" />
          <span>Daily Mindset</span>
        </div>
        <p className="text-slate-300 italic leading-relaxed text-[11px]">
          &quot;We are what we repeatedly do. Excellence, then, is not an act, but a habit.&quot;
        </p>
      </div>
    </aside>
  );
};
