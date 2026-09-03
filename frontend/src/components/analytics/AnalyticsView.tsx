'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  BarChart3,
  Clock,
  Zap,
  TrendingUp,
  Flame,
  Award,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

export const AnalyticsView: React.FC = () => {
  const { sessions, activities, habits, reviews } = useApp();

  // 1. Calculate Last 7 Days Focus Hours Data
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const daySessions = sessions.filter((s) => s.date === dateStr);
    const totalMinutes = Math.round(
      daySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
    );

    return {
      day: format(d, 'EEE'),
      minutes: totalMinutes,
      hours: (totalMinutes / 60).toFixed(1),
    };
  });

  // 2. Category Distribution Pie Chart Data
  const categoryMap: Record<string, number> = {};
  sessions.forEach((s) => {
    const act = activities.find((a) => a.id === s.activityId);
    const catName = act?.category || 'General';
    const hours = s.durationSeconds / 3600;
    categoryMap[catName] = (categoryMap[catName] || 0) + hours;
  });

  const categoryPieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(1)),
  }));

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6'];

  // 3. Productivity Score Trend Line Chart Data
  const reviewScoreData = reviews.slice(-10).map((r) => ({
    date: format(parseISO(r.date), 'MMM d'),
    score: r.productivityScore,
  }));

  // Overall totals
  const totalFocusSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalFocusHours = (totalFocusSeconds / 3600).toFixed(1);
  const totalSessionsCount = sessions.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          <span>Productivity &amp; Focus Analytics</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Deep behavioral insights, time allocation charts, and trend metrics.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Focus Time</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">{totalFocusHours} hrs</p>
          <p className="text-[11px] text-indigo-300 font-medium">Lifetime logged duration</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Focus Sessions</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">{totalSessionsCount}</p>
          <p className="text-[11px] text-amber-300 font-medium">Completed focus intervals</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Habits</span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">{habits.length}</p>
          <p className="text-[11px] text-emerald-300 font-medium">Daily consistency routines</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Focus Hours Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Last 7 Days Focus Distribution (Minutes)</span>
          </h3>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData}>
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#FFF',
                  }}
                />
                <Bar dataKey="minutes" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Allocation Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Time Logged by Category (Hours)</span>
          </h3>
          <div className="h-64 w-full pt-4 flex items-center justify-center">
            {categoryPieData.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No category data recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}h`}
                  >
                    {categoryPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#FFF',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
