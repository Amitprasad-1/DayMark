'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ActiveTab } from '@/types';
import {
  CalendarDays,
  Timer,
  CheckSquare,
  Zap,
  BarChart3,
  BookOpen,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, timerStatus } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Calendar', icon: CalendarDays },
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'habits', label: 'Habits', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'review', label: 'Review', icon: BookOpen },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 px-2 py-2 backdrop-blur-xl bg-slate-950/90">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-all ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400 scale-110' : 'text-slate-400'}`} />
                {item.id === 'timer' && timerStatus === 'RUNNING' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
