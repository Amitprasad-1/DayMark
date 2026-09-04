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
  Sparkles,
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
} from 'recharts';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';

export const AnalyticsView: React.FC = () => {
  const { sessions, activities, habits } = useApp();

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
    const catName = act?.category || 'Engineering';
    const hours = s.durationSeconds / 3600;
    categoryMap[catName] = (categoryMap[catName] || 0) + hours;
  });

  const categoryPieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(1)),
  }));

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6'];

  // Overall totals
  const totalFocusSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalFocusHours = (totalFocusSeconds / 3600).toFixed(1);
  const totalSessionsCount = sessions.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] shadow-2xl bg-[#090E1C]/80">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-md">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span>Performance &amp; Focus Analytics</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Deep behavioral insights, time allocation distributions, and multi-track productivity metrics.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.015 }}
          className="glass-panel-luxury p-6 rounded-3xl border border-white/[0.09] space-y-2 relative overflow-hidden shadow-xl bg-[#090E1C]/80"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Focus Time</span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">{totalFocusHours} <span className="text-lg font-sans font-bold text-slate-400">hrs</span></p>
          <p className="text-[11px] text-indigo-300 font-semibold">Lifetime logged deep focus</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.015 }}
          className="glass-panel-luxury p-6 rounded-3xl border border-white/[0.09] space-y-2 relative overflow-hidden shadow-xl bg-[#090E1C]/80"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Completed Sessions</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">{totalSessionsCount}</p>
          <p className="text-[11px] text-amber-300 font-semibold">Focus intervals finished</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.015 }}
          className="glass-panel-luxury p-6 rounded-3xl border border-white/[0.09] space-y-2 relative overflow-hidden shadow-xl bg-[#090E1C]/80"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Active Habits</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Flame className="w-4 h-4 fill-emerald-400" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">{habits.length}</p>
          <p className="text-[11px] text-emerald-300 font-semibold">Daily momentum routines</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Focus Hours Bar Chart */}
        <div className="glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] space-y-4 shadow-2xl bg-[#090E1C]/80">
          <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-wide">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Last 7 Days Focus Distribution (Minutes)</span>
          </h3>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090E1C',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '16px',
                    color: '#FFF',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
                  }}
                />
                <Bar dataKey="minutes" fill="url(#barGradient)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Allocation Pie Chart */}
        <div className="glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] space-y-4 shadow-2xl bg-[#090E1C]/80">
          <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-wide">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Time Allocated by Category (Hours)</span>
          </h3>
          <div className="h-72 w-full pt-4 flex items-center justify-center">
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
                    outerRadius={85}
                    innerRadius={45}
                    paddingAngle={3}
                    label={({ name, value }) => `${name}: ${value}h`}
                  >
                    {categoryPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090E1C',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '16px',
                      color: '#FFF',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
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
