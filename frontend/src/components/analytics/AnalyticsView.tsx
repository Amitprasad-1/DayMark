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
  BookOpen,
  Calendar,
  CheckCircle,
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
import { isSameCalendarDay } from '@/lib/dateUtils';
import { motion } from 'framer-motion';

export const AnalyticsView: React.FC = () => {
  const { sessions, activities, habits } = useApp();

  // 1. Calculate Last 7 Days Focus Hours Data
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const daySessions = sessions.filter((s) => isSameCalendarDay(s.date, s.startTime, dateStr));
    const totalMinutes = Math.round(
      daySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
    );

    return {
      day: format(d, 'EEE'),
      fullDate: format(d, 'MMM d'),
      minutes: totalMinutes,
      hours: parseFloat((totalMinutes / 60).toFixed(1)),
    };
  });

  const weeklyTotalHours = last7DaysData
    .reduce((acc, d) => acc + d.hours, 0)
    .toFixed(1);
  const dailyAverageHours = (parseFloat(weeklyTotalHours) / 7).toFixed(1);

  // 2. Category Distribution Pie Chart Data
  const categoryMap: Record<string, number> = {};
  sessions.forEach((s) => {
    const act = activities.find((a) => a.id === s.activityId);
    const catName = act?.category || 'Study';
    const hours = s.durationSeconds / 3600;
    categoryMap[catName] = (categoryMap[catName] || 0) + hours;
  });

  const categoryPieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(1)),
  }));

  const COLORS = ['#10B981', '#06B6D4', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6'];

  // 3. Activity Subject-Level Breakdown
  const totalFocusSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalFocusHours = (totalFocusSeconds / 3600).toFixed(1);
  const totalSessionsCount = sessions.length;

  const activityBreakdown = activities.map((act) => {
    const actSessions = sessions.filter((s) => s.activityId === act.id);
    const actSeconds = actSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const actHours = (actSeconds / 3600).toFixed(1);
    const percentage = totalFocusSeconds > 0 ? Math.round((actSeconds / totalFocusSeconds) * 100) : 0;

    return {
      id: act.id,
      name: act.name,
      color: act.color || '#6366F1',
      hours: actHours,
      sessionCount: actSessions.length,
      percentage,
    };
  }).sort((a, b) => parseFloat(b.hours) - parseFloat(a.hours));

  return (
    <div className="space-y-6 pb-12">
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-panel-luxury p-5 sm:p-6 rounded-3xl border border-white/[0.09] space-y-2 relative overflow-hidden shadow-xl bg-[#090E1C]/80"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Lifetime Focus</span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
            {totalFocusHours} <span className="text-base font-sans font-bold text-slate-400">hrs</span>
          </p>
          <p className="text-[11px] text-indigo-300 font-semibold">Total logged study hours</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-panel-luxury p-5 sm:p-6 rounded-3xl border border-white/[0.09] space-y-2 relative overflow-hidden shadow-xl bg-[#090E1C]/80"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>7-Day Volume</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-emerald-300 font-mono tracking-tight">
            {weeklyTotalHours} <span className="text-base font-sans font-bold text-emerald-400/80">hrs</span>
          </p>
          <p className="text-[11px] text-emerald-300 font-semibold">Avg {dailyAverageHours}h / day this week</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-panel-luxury p-5 sm:p-6 rounded-3xl border border-white/[0.09] space-y-2 relative overflow-hidden shadow-xl bg-[#090E1C]/80"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Completed Sessions</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight">{totalSessionsCount}</p>
          <p className="text-[11px] text-amber-300 font-semibold">Focus blocks finished</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-panel-luxury p-5 sm:p-6 rounded-3xl border border-white/[0.09] space-y-2 relative overflow-hidden shadow-xl bg-[#090E1C]/80"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Active Habits</span>
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Flame className="w-4 h-4 fill-cyan-400" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-cyan-300 font-mono tracking-tight">{habits.length}</p>
          <p className="text-[11px] text-cyan-300 font-semibold">Tracked daily routines</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Focus Hours Bar Chart */}
        <div className="glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] space-y-4 shadow-2xl bg-[#090E1C]/80">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-wide">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Last 7 Days Focus Distribution</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-400">Total: {weeklyTotalHours}h</span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradientPunchy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="60%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} unit="h" />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-2xl bg-[#080C16] border border-white/20 shadow-2xl text-xs space-y-1">
                          <p className="font-bold text-white">{data.day} ({data.fullDate})</p>
                          <p className="font-mono text-cyan-300 font-extrabold text-sm">{data.hours} hours ({data.minutes} mins)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="hours" fill="url(#barGradientPunchy)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Allocation Pie Chart */}
        <div className="glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] space-y-4 shadow-2xl bg-[#090E1C]/80">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-wide">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Time Allocated by Category</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-400">{categoryPieData.length} Categories</span>
          </div>

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
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={3}
                    label={({ name, value }) => `${name}: ${value}h`}
                  >
                    {categoryPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.6)" strokeWidth={2} />
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

      {/* Subject & Activity Breakdown */}
      <div className="glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] space-y-4 shadow-2xl bg-[#090E1C]/80">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-wide">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Subject &amp; Activity Focus Breakdown</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {activities.length} Tracked Disciplines
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activityBreakdown.map((act) => (
            <div
              key={act.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: act.color }} />
                  <span className="font-bold text-white text-xs">{act.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-amber-300">{act.hours}h</span>
                  <span className="text-[10px] text-slate-400 font-mono">({act.percentage}%)</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-black/60 overflow-hidden border border-white/5 p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(act.percentage, 3)}%`,
                    backgroundColor: act.color,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{act.sessionCount} focus session{act.sessionCount === 1 ? '' : 's'}</span>
                <span>{act.hours} total hours</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
