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

export default function Home() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Header */}
      <Header />

      {/* Main Container Shell */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Navigation Sidebar (Desktop) */}
        <Sidebar />

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-20 md:pb-8">
          {activeTab === 'dashboard' && <YearDashboard />}
          {activeTab === 'timer' && <FocusTimer />}
          {activeTab === 'tasks' && <TaskManager />}
          {activeTab === 'habits' && <HabitTracker />}
          {activeTab === 'goals' && <GoalManager />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'review' && <DailyReviewView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <MobileNav />

      {/* Interactive Day Details & Log Modal */}
      <DayDetailModal />
    </div>
  );
}
