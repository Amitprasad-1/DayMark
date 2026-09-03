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
  MoreHorizontal,
  X,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, timerStatus } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Calendar', icon: CalendarDays },
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'habits', label: 'Habits', icon: Zap },
  ];

  const moreTabs: { id: ActiveTab; label: string; icon: React.ElementType; color: string; desc: string }[] = [
    { id: 'goals', label: 'Goals & Targets', icon: Target, color: 'text-purple-400', desc: 'Long-term milestones' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-cyan-400', desc: 'Focus charts & breakdown' },
    { id: 'review', label: 'Daily Review', icon: BookOpen, color: 'text-rose-400', desc: 'Self-reflection journal' },
    { id: 'settings', label: 'Settings & Data', icon: Settings, color: 'text-slate-400', desc: 'Timer defaults & backups' },
  ];

  const isMoreTabActive = moreTabs.some((t) => t.id === activeTab);

  return (
    <>
      {/* Mobile Slide-Up "More" Sheet */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end p-4 animate-fadeIn">
          <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">More Modules</h3>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                const isCurrent = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-600/30 border-indigo-500/50 shadow-md'
                        : 'bg-slate-900/60 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${tab.color}`} />
                    <span className="text-xs font-bold text-white">{tab.label}</span>
                    <span className="text-[10px] text-slate-400">{tab.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 px-3 py-2 backdrop-blur-xl bg-slate-950/90">
        <div className="flex items-center justify-around">
          {mainTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                  isActive ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  {item.id === 'timer' && timerStatus === 'RUNNING' && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
                <span className="mt-0.5">{item.label}</span>
              </button>
            );
          })}

          {/* More Button */}
          <button
            type="button"
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-all ${
              isMoreTabActive ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="mt-0.5">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
