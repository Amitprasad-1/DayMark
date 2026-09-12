'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { CustomCountdown } from '@/types';
import {
  Calendar as CalendarIcon,
  Flame,
  Clock,
  Plus,
  CheckCircle,
  Circle,
  Zap,
  Target,
  Sparkles,
  TrendingUp,
  X,
  Play,
  Trash2,
  CalendarCheck,
  ChevronRight,
  Eye,
  Award,
} from 'lucide-react';
import {
  format,
  getDaysInYear,
  getDayOfYear,
  endOfYear,
  differenceInDays,
  differenceInSeconds,
  getDaysInMonth,
  getDay,
  parseISO,
  isSameDay,
  isAfter,
} from 'date-fns';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { isSameCalendarDay, normalizeDateStr, getCalendarDaysRemaining } from '@/lib/dateUtils';
import { MovingQuoteBanner } from '@/components/dashboard/MovingQuoteBanner';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export interface UnifiedMilestone {
  id: string;
  title: string;
  targetDate: string;
  category: string;
  color: string;
  icon?: string;
  isGoal: boolean;
  goalType?: string;
  currentValue?: number;
  targetValue?: number;
}

interface HoveredDayInfo {
  dateStr: string;
  formattedDate: string;
  totalHours: string;
  sessionCount: number;
  completedHabitsCount: number;
  totalHabitsCount: number;
  hasReview: boolean;
  isFuture: boolean;
  isToday: boolean;
  milestones?: UnifiedMilestone[];
}

export const YearDashboard: React.FC = () => {
  const {
    sessions,
    habits,
    toggleHabit,
    tasks,
    countdowns,
    addCountdown,
    deleteCountdown,
    goals,
    deleteGoal,
    getDayActivityData,
    setSelectedDate,
    setIsDayDetailOpen,
    setActiveTab,
    settings,
    startTimer,
  } = useApp();

  const [currentYear] = useState<number>(new Date().getFullYear());
  type CalendarViewMode = 'FROM_CURRENT' | 'REMAINING' | 'JAN_DEC';
  const [calendarView, setCalendarView] = useState<CalendarViewMode>('FROM_CURRENT');
  const [showAddCountdown, setShowAddCountdown] = useState<boolean>(false);
  const [hoveredDay, setHoveredDay] = useState<HoveredDayInfo | null>(null);

  // New Countdown Form
  const [newCdTitle, setNewCdTitle] = useState('');
  const [newCdDate, setNewCdDate] = useState('');
  const [newCdCategory, setNewCdCategory] = useState('Milestone');

  // Unified Target Milestones (combining Countdowns and Goals with a targetDate)
  const allMilestones: UnifiedMilestone[] = [
    ...countdowns.map((cd) => ({
      id: cd.id,
      title: cd.title,
      targetDate: cd.targetDate,
      category: cd.category || 'Target',
      color: cd.color || '#F59E0B',
      icon: cd.icon || 'Target',
      isGoal: false,
    })),
    ...goals
      .filter((g) => !!g.targetDate)
      .map((g) => ({
        id: g.id,
        title: g.title,
        targetDate: g.targetDate!,
        category: g.category || 'Goal Target',
        color: g.color || '#A855F7',
        icon: 'Target',
        isGoal: true,
        goalType: g.type,
        currentValue: g.currentValue,
        targetValue: g.targetValue,
      })),
  ];

  // Year End Real-Time Countdown
  const [timeToNewYear, setTimeToNewYear] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const newYearDate = endOfYear(now);
      const totalSec = Math.max(0, differenceInSeconds(newYearDate, now));

      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = Math.floor(totalSec % 60);

      setTimeToNewYear({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const dayOfYear = getDayOfYear(now);
  const totalDaysInYear = getDaysInYear(now);
  const daysLeftInYear = totalDaysInYear - dayOfYear;
  const yearProgressPercent = ((dayOfYear / totalDaysInYear) * 100).toFixed(1);

  // Today's summary stats
  const todayStr = format(now, 'yyyy-MM-dd');
  const todayData = getDayActivityData(todayStr);
  const todayFocusMinutes = Math.round(todayData.totalSeconds / 60);
  const targetMinutes = settings.dailyTargetMinutes || 360;
  const focusGoalPercent = Math.min(100, Math.round((todayFocusMinutes / targetMinutes) * 100));

  // Compute month-level stats for rich interactive month cards
  const getMonthStats = (monthIdx: number) => {
    const monthPrefix = `${currentYear}-${String(monthIdx + 1).padStart(2, '0')}`;
    const monthSessions = sessions.filter((s) => s.date.startsWith(monthPrefix));
    const totalSeconds = monthSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const totalHours = (totalSeconds / 3600).toFixed(1);
    
    // Active days count
    const uniqueDates = new Set(monthSessions.map((s) => s.date));
    return {
      totalHours,
      activeDays: uniqueDates.size,
      sessionCount: monthSessions.length,
    };
  };

  // Color helper for heatmap cells with luminous depth & punchy contrast
  const getCellIntensityStyle = (dateStr: string, isFutureDate: boolean, hasMilestone: boolean = false, isDateToday: boolean = false) => {
    const data = getDayActivityData(dateStr);
    const hours = data.totalSeconds / 3600;

    // Current Date (Today) - ALWAYS solid, clean, dark slate background with bold white text & moving rainbow border:
    if (isDateToday) {
      // Crisp, crystal clear dark slate interior with sharp contrast and 100% zero haze
      return 'bg-slate-900 border border-white/20 text-white font-bold scale-105 z-20';
    }

    // Target Milestone day: Golden Trophy / Amber Crown (same as previous)
    if (hasMilestone) {
      return 'bg-gradient-to-br from-amber-500/30 via-orange-600/20 to-amber-950/80 border-2 border-amber-400 text-amber-300 font-black ring-2 ring-amber-400/50 shadow-[0_0_18px_rgba(245,158,11,0.7)] hover:bg-amber-900/60 hover:border-amber-300 hover:text-white hover:scale-110 z-10';
    }

    if (isFutureDate) {
      return 'bg-slate-950/50 border border-white/[0.06] text-slate-500 font-medium hover:border-indigo-400/50 hover:text-slate-200 hover:bg-slate-900';
    }

    // Level 4 (>= 4 Hours): Master Deep Work - Rich Midnight Emerald & Teal base with luminous neon emerald border & glow for crystal-clear date contrast
    if (hours >= 4) {
      return 'bg-gradient-to-tr from-emerald-950 via-emerald-900 to-teal-800 border-2 border-emerald-400 text-white font-black shadow-[0_0_16px_rgba(52,211,153,0.55)]';
    }
    // Level 3 (>= 2 Hours): Electric Azure Cyan
    if (hours >= 2) {
      return 'bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 border-2 border-cyan-300 text-white font-black shadow-[0_0_14px_rgba(6,182,212,0.55)]';
    }
    // Level 2 (>= 0.5 Hours): Electric Violet Indigo
    if (hours >= 0.5) {
      return 'bg-gradient-to-tr from-indigo-800 via-purple-800 to-indigo-900 border-2 border-indigo-400/80 text-indigo-100 font-bold shadow-[0_0_10px_rgba(99,102,241,0.4)]';
    }
    // Level 1 (> 0 Hours): Deep Sapphire
    if (hours > 0) {
      return 'bg-indigo-950/95 border border-indigo-500/70 text-indigo-200 font-semibold shadow-sm';
    }

    // Past day with 0 activity: clean contrast & crisp border definition
    return 'bg-slate-900/80 border border-white/[0.09] text-slate-300 font-semibold hover:border-indigo-400/80 hover:bg-slate-800 hover:text-white';
  };

  const handleCellHover = (dateObj: Date) => {
    const dateStr = format(dateObj, 'yyyy-MM-dd');
    const data = getDayActivityData(dateStr);
    const isFutureDate = isAfter(dateObj, now) && !isSameDay(dateObj, now);
    const isDateToday = isSameDay(dateObj, now);

    const dayMilestones = allMilestones.filter((m) =>
      isSameCalendarDay(m.targetDate, undefined, dateStr)
    );

    setHoveredDay({
      dateStr,
      formattedDate: format(dateObj, 'EEEE, MMMM d, yyyy'),
      totalHours: (data.totalSeconds / 3600).toFixed(1),
      sessionCount: data.sessionCount,
      completedHabitsCount: data.completedHabitsCount,
      totalHabitsCount: data.totalHabitsCount,
      hasReview: data.hasReview,
      isFuture: isFutureDate,
      isToday: isDateToday,
      milestones: dayMilestones,
    });
  };

  const handleCreateCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCdTitle.trim() || !newCdDate) return;
    const cleanDate = normalizeDateStr(newCdDate);
    addCountdown({
      title: newCdTitle.trim(),
      targetDate: cleanDate,
      category: newCdCategory,
      color: '#F59E0B',
      icon: 'Target',
    });
    setNewCdTitle('');
    setNewCdDate('');
    setShowAddCountdown(false);
  };

  const currentMonthIdx = now.getMonth();
  const currentMonthShort = MONTH_NAMES[currentMonthIdx]?.slice(0, 3) || 'Now';

  // Filter and order months dynamically starting with current month
  const visibleMonthIndices = () => {
    switch (calendarView) {
      case 'FROM_CURRENT':
        // Starts with current month (e.g. Sep, Oct, Nov, Dec, Jan, Feb... Aug)
        return Array.from({ length: 12 }, (_, i) => (currentMonthIdx + i) % 12);
      case 'REMAINING':
        // Remaining months of the year starting from current (e.g. Sep -> Dec)
        return Array.from({ length: 12 - currentMonthIdx }, (_, i) => currentMonthIdx + i);
      case 'JAN_DEC':
        // Traditional Jan -> Dec
        return Array.from({ length: 12 }, (_, i) => i);
      default:
        return Array.from({ length: 12 }, (_, i) => (currentMonthIdx + i) % 12);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Dynamic Motivational Moving Quote Banner */}
      <MovingQuoteBanner />

      {/* 1. TOP HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Year Progress & Real-Time Countdown */}
        <div className="lg:col-span-2 glass-panel-luxury p-6 lg:p-8 rounded-3xl border border-white/[0.09] flex flex-col justify-between space-y-6 relative overflow-hidden shadow-2xl bg-[#090E1C]/80">
          {/* Ambient Lighting */}
          <div className="absolute -top-12 -right-12 w-96 h-96 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/15 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Year {currentYear} Trajectory
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Day <strong className="text-amber-400 font-mono font-bold">{dayOfYear}</strong> of {totalDaysInYear} &bull; <span className="text-slate-300 font-mono">{daysLeftInYear} days remaining</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Real-time Countdown Capsule */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="flex items-center gap-1.5 font-mono text-xs text-slate-200">
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold shadow-sm font-sans tracking-tight">
                  {timeToNewYear.days}d
                </span>
                <span className="text-slate-600 font-bold">:</span>
                <span className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-white/10 font-bold text-slate-200">
                  {String(timeToNewYear.hours).padStart(2, '0')}h
                </span>
                <span className="text-slate-600 font-bold">:</span>
                <span className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-white/10 font-bold text-slate-200">
                  {String(timeToNewYear.minutes).padStart(2, '0')}m
                </span>
                <span className="text-slate-600 font-bold">:</span>
                <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 font-black text-indigo-300 shadow-sm">
                  {String(timeToNewYear.seconds).padStart(2, '0')}s
                </span>
                <span className="text-[11px] text-slate-400 font-sans font-medium ml-1.5">to {currentYear + 1}</span>
              </div>
            </div>
          </div>

          {/* Glowing Year Progress Bar */}
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gradient-gold flex items-center gap-1.5 font-extrabold tracking-wide">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>{yearProgressPercent}% Year Trajectory Completed</span>
              </span>
              <span className="text-slate-400 font-mono font-medium">{daysLeftInYear} Days Remaining</span>
            </div>

            <div className="w-full h-4 rounded-full bg-slate-950/95 border border-white/10 p-0.5 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${yearProgressPercent}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500 relative shadow-[0_0_16px_rgba(245,158,11,0.5)]"
              >
                <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white rounded-full shadow-[0_0_12px_#FFF]" />
              </motion.div>
            </div>

            {/* Quarter Milestones */}
            <div className="flex justify-between text-[10px] text-slate-500 font-mono px-1">
              <span>Q1 (25%)</span>
              <span>Q2 (50%)</span>
              <span className="text-amber-400 font-bold">Q3 (75% - Active)</span>
              <span>Q4 (100%)</span>
            </div>
          </div>

          {/* Custom Countdown Milestones */}
          <div className="space-y-3.5 pt-3 relative z-10 border-t border-white/[0.07]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Strategic Target Milestones</span>
              </span>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => setShowAddCountdown(!showAddCountdown)}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Target</span>
              </motion.button>
            </div>

            <AnimatePresence>
              {showAddCountdown && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateCountdown}
                  className="p-4 rounded-2xl bg-slate-900/95 border border-amber-500/30 flex flex-wrap gap-2.5 items-center shadow-2xl"
                >
                  <input
                    type="text"
                    placeholder="Milestone Name (e.g. App Launch, Marathon)"
                    value={newCdTitle}
                    onChange={(e) => setNewCdTitle(e.target.value)}
                    className="flex-1 min-w-[200px] px-3.5 py-2 text-xs rounded-xl glass-input"
                    required
                  />
                  <input
                    type="date"
                    value={newCdDate}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    onFocus={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    onChange={(e) => setNewCdDate(e.target.value)}
                    className="px-3.5 py-2 text-xs rounded-xl glass-input cursor-pointer [color-scheme:dark] hover:border-amber-400/70 transition-colors"
                    required
                    title="Click to open calendar and select date"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md cursor-pointer"
                  >
                    Save Target
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* 2-Column Balanced Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {allMilestones.map((cd) => {
                const { daysRemaining, isPassed, formattedTarget } = getCalendarDaysRemaining(cd.targetDate, now);

                return (
                  <motion.div
                    key={cd.id}
                    whileHover={{ scale: 1.015, y: -2 }}
                    className="w-full flex items-center justify-between gap-3.5 p-4 rounded-2xl bg-gradient-to-br from-slate-900/95 via-[#0d1326]/90 to-amber-950/25 border border-amber-500/25 hover:border-amber-400/80 transition-all duration-300 group shadow-lg shadow-amber-500/5 hover:shadow-amber-500/20 border-t border-t-amber-400/30"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2.5 rounded-xl border shadow-[0_0_12px_rgba(245,158,11,0.25)] shrink-0 ${
                        cd.isGoal
                          ? 'bg-gradient-to-br from-purple-500/25 to-indigo-500/20 text-purple-400 border-purple-500/40'
                          : 'bg-gradient-to-br from-amber-500/25 to-orange-500/20 text-amber-400 border-amber-500/40'
                      }`}>
                        <Target className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-black text-white tracking-wide truncate">
                            {cd.title}
                          </h4>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                            cd.isGoal
                              ? 'text-purple-300 bg-purple-500/20 border-purple-500/40'
                              : 'text-amber-300 bg-amber-500/20 border-amber-500/40'
                          }`}>
                            {cd.isGoal ? '🎯 Goal Target' : (cd.category || 'Milestone')}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 mt-1 font-mono font-semibold flex items-center gap-1.5">
                          <CalendarIcon className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{formattedTarget}</span>
                          {cd.isGoal && typeof cd.targetValue === 'number' && (
                            <span className="ml-1 text-purple-400">
                              ({cd.currentValue || 0}/{cd.targetValue} {cd.goalType === 'TIME' ? 'hrs' : 'units'})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-black font-mono px-3 py-1.5 rounded-xl shadow-md whitespace-nowrap shrink-0 ${
                          isPassed
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border border-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.45)]'
                        }`}
                      >
                        {isPassed ? 'Passed' : `${daysRemaining}d left`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          deleteGoal(cd.id);
                          deleteCountdown(cd.id);
                          const matchingGoal = goals.find((g) => g.title.toLowerCase() === cd.title.toLowerCase());
                          if (matchingGoal) deleteGoal(matchingGoal.id);
                          const matchingCd = countdowns.find((c) => c.title.toLowerCase() === cd.title.toLowerCase());
                          if (matchingCd) deleteCountdown(matchingCd.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 transition-opacity p-1 cursor-pointer shrink-0"
                        title="Delete Target Milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {/* When odd milestone count, render an elegant Add Milestone card to keep grid perfectly 2x2 and balanced */}
              {allMilestones.length % 2 !== 0 && (
                <motion.button
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddCountdown(!showAddCountdown)}
                  type="button"
                  className="w-full flex items-center justify-between gap-3.5 p-4 rounded-2xl border-2 border-dashed border-amber-500/30 hover:border-amber-400/80 bg-slate-900/40 hover:bg-amber-950/20 text-slate-400 hover:text-amber-300 transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-amber-500/10 min-h-[72px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 group-hover:border-amber-400/50 transition-all shrink-0">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-300 group-hover:text-amber-200 transition-colors">
                        Add Target Milestone
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono font-medium mt-0.5">
                        Set deadline &amp; countdown
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-400/80 group-hover:text-amber-300 font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
                    + New
                  </span>
                </motion.button>
              )}

              {/* Empty state if 0 milestones */}
              {allMilestones.length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddCountdown(!showAddCountdown)}
                  type="button"
                  className="sm:col-span-2 w-full flex items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-amber-500/30 hover:border-amber-400/80 bg-slate-900/40 hover:bg-amber-950/20 text-slate-400 hover:text-amber-300 transition-all duration-300 group cursor-pointer"
                >
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 group-hover:scale-110 transition-all">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-slate-300 group-hover:text-amber-200">Set Your First Target Milestone</h4>
                    <p className="text-xs text-slate-400 font-mono">Add project launches, exams, or major year targets</p>
                  </div>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Today's Action Card */}
        <div className="glass-panel-luxury p-6 lg:p-8 rounded-3xl border border-white/[0.09] flex flex-col justify-between space-y-6 relative overflow-hidden shadow-2xl bg-[#090E1C]/80">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Goal Progress Ring / Header */}
          <div className="space-y-3.5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md">
                  <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Today&apos;s Focus Goal</h3>
                  <p className="text-[11px] text-slate-400 font-medium">{todayFocusMinutes}m of {targetMinutes}m target</p>
                </div>
              </div>
              <span className="text-sm font-black font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-700/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                {focusGoalPercent}%
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <div className="w-full h-3.5 rounded-full bg-slate-950/95 border border-white/10 overflow-hidden p-0.5 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${focusGoalPercent}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                />
              </div>
            </div>
          </div>

          {/* Today's Habits Checklist */}
          <div className="space-y-3 relative z-10 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Habit Streak Routines
              </p>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {todayData.completedHabitsCount} / {todayData.totalHabitsCount} completed
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {habits.filter((h) => h.isActive).map((h) => {
                const isDone = !!h.logs[todayStr];
                return (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    key={h.id}
                    type="button"
                    onClick={() => {
                      toggleHabit(h.id, todayStr);
                      if (!isDone) {
                        confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
                      }
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs cursor-pointer border transition-all text-left group ${
                      isDone
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                        : 'bg-slate-900/60 border-white/[0.06] text-slate-300 hover:border-white/20 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: h.color }}
                      />
                      <span className="truncate font-semibold">{h.name}</span>
                    </div>
                    {isDone ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 fill-emerald-950 shadow-sm" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Triggers */}
          <div className="grid grid-cols-2 gap-3 pt-2 relative z-10">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(99, 102, 241, 0.45)' }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => {
                setActiveTab('timer');
                startTimer();
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-xs shadow-[0_4px_16px_rgba(99,102,241,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] cursor-pointer transition-all border border-indigo-400/40"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span>Start Timer</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => {
                setSelectedDate(todayStr);
                setIsDayDetailOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-white/10 hover:border-white/20 cursor-pointer transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Log Day</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* 2. CENTERPIECE: FULL-YEAR VISUAL CALENDAR (12-MONTH MATRIX) */}
      <div className="glass-panel-luxury p-6 lg:p-8 rounded-3xl border border-white/[0.09] space-y-6 relative overflow-hidden shadow-2xl bg-[#090E1C]/80">
        {/* Floating Interactive Day Popover */}
        <AnimatePresence>
          {hoveredDay && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.98 }}
              className="p-4 rounded-2xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl backdrop-blur-2xl flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-extrabold text-white">{hoveredDay.formattedDate}</span>
                  {hoveredDay.isToday && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                      Today
                    </span>
                  )}
                  {hoveredDay.hasReview && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/25 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                      Reflection Logged
                    </span>
                  )}
                  {hoveredDay.milestones && hoveredDay.milestones.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/60 text-[10px] font-black flex items-center gap-1 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                      <Target className="w-3 h-3 text-amber-400" />
                      <span>{hoveredDay.milestones.map((m) => m.title).join(', ')}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {hoveredDay.isFuture ? (
                    <span className="text-slate-500 italic">Upcoming date &bull; Click to plan future tasks or goals</span>
                  ) : (
                    <span>
                      Focus Duration:{' '}
                      <strong className="text-emerald-400 font-mono font-bold text-sm">
                        {hoveredDay.totalHours} hrs
                      </strong>{' '}
                      across {hoveredDay.sessionCount} sessions &bull;{' '}
                      <strong className="text-amber-400">
                        {hoveredDay.completedHabitsCount} / {hoveredDay.totalHabitsCount} habits completed
                      </strong>
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => {
                    setSelectedDate(hoveredDay.dateStr);
                    setIsDayDetailOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg cursor-pointer transition-all flex items-center gap-1.5 border border-indigo-400/40"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Day Details</span>
                </motion.button>
                <button
                  type="button"
                  onClick={() => setHoveredDay(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                  title="Dismiss preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar Controls & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <span>{currentYear} Visual Activity Calendar</span>
            </h2>
            <p className="text-xs text-slate-400">
              Hover over any date cell to inspect productivity data. Click any cell to log focus time, mark habits, or write reflections.
            </p>
          </div>

          {/* Calendar Sequence & View Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-slate-950/80 border border-white/10 shadow-inner">
              {[
                { id: 'FROM_CURRENT', label: `From ${currentMonthShort} (Default)` },
                { id: 'REMAINING', label: `${currentMonthShort}–Dec` },
                { id: 'JAN_DEC', label: 'Jan–Dec' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCalendarView(opt.id as CalendarViewMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors relative outline-none ${
                    calendarView === opt.id ? 'text-white font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {calendarView === opt.id && (
                    <motion.div
                      layoutId="calendarViewActivePill"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                    />
                  )}
                  <span className="relative z-10">{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Jump to Today Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => {
                setSelectedDate(todayStr);
                setIsDayDetailOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Today ({format(now, 'MMM d')})</span>
            </motion.button>
          </div>
        </div>

        {/* Legend with punchy vivid colors */}
        <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-slate-400 pt-1">
          <span className="text-[11px] font-bold text-slate-300">Activity Level:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-slate-900 border border-white/10" />
            <span className="text-[10px] text-slate-400 font-medium">None (0h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-indigo-950 border border-indigo-600/70" />
            <span className="text-[10px] text-indigo-300 font-semibold">&lt;0.5h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-gradient-to-tr from-indigo-800 via-purple-800 to-indigo-900 border-2 border-indigo-400/80 shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
            <span className="text-[10px] text-indigo-200 font-bold">0.5h - 2h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 border-2 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.55)]" />
            <span className="text-[10px] text-cyan-200 font-black">2h - 4h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-gradient-to-tr from-emerald-950 via-emerald-900 to-teal-800 border-2 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
            <span className="text-[10px] font-black text-emerald-400">&gt;4h Deep Work</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-gradient-to-br from-amber-500/40 to-orange-600/30 border-2 border-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.7)] relative">
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-slate-950 shadow-[0_0_6px_#F59E0B]" />
            </div>
            <span className="text-[10px] font-black text-amber-300">Target Milestone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-gradient-to-br from-indigo-950 to-purple-950 border-2 border-cyan-400 relative shadow-[0_0_12px_rgba(0,229,255,0.8)] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#00E5FF] animate-pulse" />
            </div>
            <span className="text-[10px] font-black text-cyan-300">Today (Rainbow Moving Line)</span>
          </div>
        </div>

        {/* SVG Defs for Today's Infinite Moving Rainbow Laser Border */}
        <svg className="w-0 h-0 absolute pointer-events-none" aria-hidden="true">
          <defs>
            <linearGradient id="todayInfiniteLaserBeam" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF007A" />
              <stop offset="16%" stopColor="#FF7A00" />
              <stop offset="33%" stopColor="#FFE600" />
              <stop offset="50%" stopColor="#00FF9D" />
              <stop offset="68%" stopColor="#00E5FF" />
              <stop offset="84%" stopColor="#9D00FF" />
              <stop offset="100%" stopColor="#FF007A" />
            </linearGradient>
          </defs>
        </svg>

        {/* 12-Month Matrix Grid */}
        <div
          onMouseLeave={() => setHoveredDay(null)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {visibleMonthIndices().map((monthIdx) => {
            const monthName = MONTH_NAMES[monthIdx];
            const monthStart = new Date(currentYear, monthIdx, 1);
            const daysInMonthCount = getDaysInMonth(monthStart);
            const startDayOfWeek = getDay(monthStart);
            const stats = getMonthStats(monthIdx);

            return (
              <motion.div
                key={monthName}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-white/[0.08] hover:border-indigo-500/40 space-y-3.5 transition-colors shadow-xl group hover:shadow-indigo-500/10"
              >
                {/* Month Card Header with Live Stats */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white tracking-wide group-hover:text-indigo-300 transition-colors font-sans">
                        {monthName}
                      </h3>
                      {monthIdx === currentMonthIdx && (
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                          Current
                        </span>
                      )}
                      {monthIdx > currentMonthIdx && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-800/60 text-slate-400 border border-white/[0.06] text-[9px] font-semibold">
                          Upcoming
                        </span>
                      )}
                      {monthIdx < currentMonthIdx && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-900/60 text-slate-500 border border-white/[0.04] text-[9px] font-semibold">
                          Past
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-extrabold bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-800/40 shadow-inner">
                      {stats.totalHours}h
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 flex items-center justify-between font-mono">
                    <span>{daysInMonthCount} days</span>
                    <span>{stats.activeDays} active days</span>
                  </p>
                </div>

                {/* Day of Week Headers with Weekend Accent */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black font-mono border-t border-white/[0.06] pt-2">
                  <span className="text-amber-400/90 font-bold" title="Sunday">S</span>
                  <span className="text-slate-400">M</span>
                  <span className="text-slate-400">T</span>
                  <span className="text-slate-400">W</span>
                  <span className="text-slate-400">T</span>
                  <span className="text-slate-400">F</span>
                  <span className="text-amber-400/90 font-bold" title="Saturday">S</span>
                </div>

                {/* Days Heatmap Matrix */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Empty Offset Padding */}
                  {Array.from({ length: startDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-full aspect-square" />
                  ))}

                  {/* Month Days */}
                  {Array.from({ length: daysInMonthCount }).map((_, dayIndex) => {
                    const dayNum = dayIndex + 1;
                    const dateObj = new Date(currentYear, monthIdx, dayNum);
                    const dateStr = format(dateObj, 'yyyy-MM-dd');
                    const isFutureDate = isAfter(dateObj, now) && !isSameDay(dateObj, now);
                    const isDateToday = isSameDay(dateObj, now);
                    const dayMilestones = allMilestones.filter((m) =>
                      isSameCalendarDay(m.targetDate, undefined, dateStr)
                    );
                    const hasMilestone = dayMilestones.length > 0;
                    const intensityClass = getCellIntensityStyle(dateStr, isFutureDate, hasMilestone, isDateToday);
                    const data = getDayActivityData(dateStr);

                    return (
                      <motion.button
                        whileHover={{ scale: 1.25, zIndex: 40 }}
                        whileTap={{ scale: 0.85 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        key={dateStr}
                        type="button"
                        title={`${format(dateObj, 'EEEE, MMMM d, yyyy')}: ${(data.totalSeconds / 3600).toFixed(1)}h focus (${data.sessionCount} session${data.sessionCount === 1 ? '' : 's'})`}
                        onMouseEnter={() => handleCellHover(dateObj)}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setIsDayDetailOpen(true);
                        }}
                        className={`heatmap-cell w-full aspect-square rounded-lg flex items-center justify-center text-[10px] transition-colors relative cursor-pointer outline-none ${intensityClass} ${
                          isDateToday ? 'overflow-visible' : ''
                        }`}
                      >
                        {/* INFINITE MOVING COLORFUL RAINBOW BORDER (TODAY ACTIVE DATE - CRISP & ZERO HAZE) */}
                        {isDateToday && (
                          <svg
                            className="absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] pointer-events-none z-30 overflow-visible"
                            aria-hidden="true"
                          >
                            <rect
                              x="1"
                              y="1"
                              width="calc(100% - 2px)"
                              height="calc(100% - 2px)"
                              rx="8"
                              ry="8"
                              fill="none"
                              stroke="url(#todayInfiniteLaserBeam)"
                              strokeWidth="2.5"
                              strokeDasharray="14 7"
                              className="animate-infinite-border-laser"
                            />
                          </svg>
                        )}

                        <span className="relative z-10 text-white font-black text-[10px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{dayNum}</span>

                        {/* Strategic Milestone Jewel Badge (Golden Diamond) */}
                        {hasMilestone && (
                          <span
                            className="absolute -top-1 -right-1 flex h-2.5 w-2.5 z-20 pointer-events-none"
                            title={`🎯 Target Milestone: ${dayMilestones.map((m) => m.title).join(', ')}`}
                          >
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 border border-slate-950 shadow-[0_0_8px_#F59E0B]" />
                          </span>
                        )}


                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
