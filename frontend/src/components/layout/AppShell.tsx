'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { YearDashboard } from '@/components/dashboard/YearDashboard';
import { FocusTimer } from '@/components/timer/FocusTimer';
import { TaskManager } from '@/components/tasks/TaskManager';
import { HabitTracker } from '@/components/habits/HabitTracker';
import { GoalManager } from '@/components/goals/GoalManager';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { DailyReviewView } from '@/components/review/DailyReviewView';
import { SettingsView } from '@/components/settings/SettingsView';
import { DayDetailModal } from '@/components/modals/DayDetailModal';
import { motion, AnimatePresence } from 'framer-motion';

export const AppShell: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Dynamic Ambient Background Glow Elements */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-transparent rounded-full blur-[120px] pointer-events-none animate-aura" />
      <div className="fixed bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-tl from-amber-500/8 via-emerald-500/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation Header */}
      <Header />

      {/* Main Container Shell */}
      <div className="flex-1 flex max-w-[1680px] w-full mx-auto relative z-10">
        {/* Left Navigation Sidebar (Desktop) */}
        <Sidebar />

        {/* Dynamic Main Workspace Area with Fluid Transitions */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-28 md:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {activeTab === 'dashboard' && <YearDashboard />}
              {activeTab === 'timer' && <FocusTimer />}
              {activeTab === 'tasks' && <TaskManager />}
              {activeTab === 'habits' && <HabitTracker />}
              {activeTab === 'goals' && <GoalManager />}
              {activeTab === 'analytics' && <AnalyticsView />}
              {activeTab === 'review' && <DailyReviewView />}
              {activeTab === 'settings' && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <MobileNav />

      {/* Interactive Day Details & Log Modal */}
      <DayDetailModal />
    </div>
  );
};
