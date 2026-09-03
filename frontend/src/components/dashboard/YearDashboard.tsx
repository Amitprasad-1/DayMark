'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
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
} from 'date-fns';
import confetti from 'canvas-confetti';

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

export const YearDashboard: React.FC = () => {
  const {
    sessions,
    habits,
    toggleHabit,
    tasks,
    countdowns,
    addCountdown,
    deleteCountdown,
    getDayActivityData,
    setSelectedDate,
    setIsDayDetailOpen,
    setActiveTab,
    settings,
    setTimerStatus,
  } = useApp();

  const [currentYear] = useState<number>(new Date().getFullYear());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  const [showAddCountdown, setShowAddCountdown] = useState<boolean>(false);

  // New Countdown Form
  const [newCdTitle, setNewCdTitle] = useState('');
  const [newCdDate, setNewCdDate] = useState('');
  const [newCdCategory, setNewCdCategory] = useState('Milestone');

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

  // Color helper for heatmap cells with luminous depth
  const getCellIntensityStyle = (dateStr: string) => {
    const data = getDayActivityData(dateStr);
    const hours = data.totalSeconds / 3600;
    const isDateToday = dateStr === todayStr;

    let bgClass = 'bg-slate-900/40 border-white/5 text-slate-500 hover:border-indigo-400/50 hover:bg-slate-800/80';

    if (hours > 0 || data.completedHabitsCount > 0) {
      if (hours >= 4 || data.completedHabitsCount >= 3) {
        bgClass = 'bg-gradient-to-tr from-emerald-500 to-teal-400 border-emerald-300 text-slate-950 font-bold shadow-md shadow-emerald-500/30';
      } else if (hours >= 2 || data.completedHabitsCount >= 2) {
        bgClass = 'bg-gradient-to-tr from-indigo-600 to-indigo-500 border-indigo-400 text-white font-semibold shadow-sm shadow-indigo-500/20';
      } else if (hours >= 0.5 || data.completedHabitsCount >= 1) {
        bgClass = 'bg-indigo-900/70 border-indigo-700/60 text-indigo-200 font-medium';
      } else {
        bgClass = 'bg-indigo-950/40 border-indigo-800/30 text-indigo-300';
      }
    }

    if (isDateToday) {
      bgClass += ' ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 font-extrabold shadow-lg shadow-amber-400/20';
    }

    return bgClass;
  };

  const handleCreateCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCdTitle || !newCdDate) return;
    addCountdown({
      title: newCdTitle,
      targetDate: newCdDate,
      category: newCdCategory,
      color: '#F59E0B',
      icon: 'Target',
    });
    setNewCdTitle('');
    setNewCdDate('');
    setShowAddCountdown(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. TOP HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Year Progress & Real-Time Countdown */}
        <div className="lg:col-span-2 glass-panel p-6 lg:p-7 rounded-3xl border border-white/10 space-y-6 relative overflow-hidden">
          {/* Ambient light orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 to-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    Year {currentYear} Trajectory
                  </h2>
                  <p className="text-xs text-slate-400">
                    Day <span className="text-amber-400 font-bold">{dayOfYear}</span> of {totalDaysInYear} &bull; <span className="text-slate-300 font-medium">{daysLeftInYear} days remaining</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Countdown Badge Pill */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-slate-900/90 to-indigo-950/60 border border-indigo-500/30 shadow-lg">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="text-xs font-mono text-slate-200 flex items-center gap-1.5">
                <span className="font-bold text-amber-400 font-sans">{timeToNewYear.days}d</span>
                <span className="text-slate-500">:</span>
                <span>{String(timeToNewYear.hours).padStart(2, '0')}h</span>
                <span className="text-slate-500">:</span>
                <span>{String(timeToNewYear.minutes).padStart(2, '0')}m</span>
                <span className="text-slate-500">:</span>
                <span className="text-indigo-400 font-bold">{String(timeToNewYear.seconds).padStart(2, '0')}s</span>
                <span className="text-[11px] text-slate-400 font-sans ml-1">to {currentYear + 1}</span>
              </div>
            </div>
          </div>

          {/* Glowing Multi-Segment Year Progress Bar */}
          <div className="space-y-2.5 relative z-10">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gradient-gold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>{yearProgressPercent}% Year Completed</span>
              </span>
              <span className="text-slate-400 font-mono">{daysLeftInYear} Days to New Year</span>
            </div>

            <div className="w-full h-4 rounded-full bg-slate-950/80 border border-white/10 p-0.5 overflow-hidden shadow-inner relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500 transition-all duration-1000 shadow-md shadow-orange-500/40 relative"
                style={{ width: `${yearProgressPercent}%` }}
              >
                {/* Glowing light pulse at the tip */}
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_10px_#FFF]" />
              </div>
            </div>

            {/* Quarter Milestones Indicator */}
            <div className="flex justify-between text-[10px] text-slate-500 font-mono px-1">
              <span>Q1 (25%)</span>
              <span>Q2 (50%)</span>
              <span>Q3 (75%)</span>
              <span>Q4 (100%)</span>
            </div>
          </div>

          {/* Custom Countdown Cards */}
          <div className="space-y-3 pt-2 relative z-10 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Target Milestones &amp; Countdowns</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddCountdown(!showAddCountdown)}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Target</span>
              </button>
            </div>

            {showAddCountdown && (
              <form onSubmit={handleCreateCountdown} className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-wrap gap-2.5 items-center shadow-xl animate-fadeIn">
                <input
                  type="text"
                  placeholder="Target Name (e.g. Exam, Launch)"
                  value={newCdTitle}
                  onChange={(e) => setNewCdTitle(e.target.value)}
                  className="flex-1 min-w-[200px] px-3.5 py-2 text-xs rounded-xl glass-input"
                  required
                />
                <input
                  type="date"
                  value={newCdDate}
                  onChange={(e) => setNewCdDate(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl glass-input"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md cursor-pointer hover:scale-105 transition-all"
                >
                  Save Milestone
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {countdowns.map((cd) => {
                const target = parseISO(cd.targetDate);
                const daysRemaining = differenceInDays(target, now);
                const isPassed = daysRemaining < 0;

                return (
                  <div
                    key={cd.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-amber-500/30 transition-all group shadow-sm"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wide">{cd.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{format(target, 'MMM d, yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-extrabold font-mono px-2.5 py-1 rounded-xl shadow-inner ${
                          isPassed
                            ? 'bg-slate-800/80 text-slate-500'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isPassed ? 'Passed' : `${daysRemaining}d left`}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteCountdown(cd.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Today's Action Card */}
        <div className="glass-panel p-6 lg:p-7 rounded-3xl border border-white/10 flex flex-col justify-between space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Goal Progress Ring / Header */}
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Flame className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Today&apos;s Focus Goal</h3>
                  <p className="text-[11px] text-slate-400">{todayFocusMinutes}m of {targetMinutes}m target</p>
                </div>
              </div>
              <span className="text-sm font-extrabold font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-800/40">
                {focusGoalPercent}%
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <div className="w-full h-3 rounded-full bg-slate-950/80 border border-white/10 overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 transition-all duration-700 shadow-md shadow-emerald-500/30"
                  style={{ width: `${focusGoalPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Today's Habits Checklist */}
          <div className="space-y-2.5 relative z-10 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Habit Streak Routines
              </p>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {todayData.completedHabitsCount} / {todayData.totalHabitsCount} done
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {habits.filter((h) => h.isActive).map((h) => {
                const isDone = !!h.logs[todayStr];
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      toggleHabit(h.id, todayStr);
                      if (!isDone) {
                        confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
                      }
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer border transition-all text-left group ${
                      isDone
                        ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200 shadow-sm'
                        : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/20 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: h.color }}
                      />
                      <span className="truncate font-medium">{h.name}</span>
                    </div>
                    {isDone ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 fill-emerald-950" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Triggers */}
          <div className="grid grid-cols-2 gap-3 pt-2 relative z-10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('timer');
                setTimerStatus('RUNNING');
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Timer</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedDate(todayStr);
                setIsDayDetailOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-white/10 hover:border-white/20 cursor-pointer transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Log Day</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CENTERPIECE: FULL-YEAR VISUAL CALENDAR (12-MONTH MATRIX) */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-white/10 space-y-6 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <span>{currentYear} Visual Activity Calendar</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Every day represented as a luminous activity gem. Click any date to view sessions, habits, or daily reflections.
            </p>
          </div>

          {/* Filter & Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setSelectedMonthIndex(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                selectedMonthIndex === null
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              All 12 Months
            </button>

            {/* Glowing Activity Legend */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/5 text-slate-400">
              <span className="text-[11px]">Level:</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-md bg-slate-900 border border-white/5" />
                <span className="text-[10px]">0h</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-md bg-indigo-900/60 border border-indigo-700/60" />
                <span className="text-[10px]">&lt;1h</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-md bg-indigo-600 border border-indigo-400" />
                <span className="text-[10px]">1-3h</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-md bg-gradient-to-tr from-emerald-500 to-teal-400 border border-emerald-300" />
                <span className="text-[10px]">&gt;3h</span>
              </div>
            </div>
          </div>
        </div>

        {/* 12-Month Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MONTH_NAMES.map((monthName, monthIdx) => {
            if (selectedMonthIndex !== null && selectedMonthIndex !== monthIdx) {
              return null;
            }

            const monthStart = new Date(currentYear, monthIdx, 1);
            const daysInMonthCount = getDaysInMonth(monthStart);
            const startDayOfWeek = getDay(monthStart);

            return (
              <div
                key={monthName}
                className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/70 to-slate-950/80 border border-white/10 hover:border-indigo-500/30 space-y-3.5 transition-all shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5 group-hover:text-indigo-300 transition-colors">
                    <span>{monthName}</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">{daysInMonthCount}d</span>
                </div>

                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold text-slate-500 font-mono">
                  <span>S</span>
                  <span>M</span>
                  <span>T</span>
                  <span>W</span>
                  <span>T</span>
                  <span>F</span>
                  <span>S</span>
                </div>

                {/* Days Heatmap Matrix */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Empty Offset Padding */}
                  {Array.from({ length: startDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-full aspect-square" />
                  ))}

                  {/* Days */}
                  {Array.from({ length: daysInMonthCount }).map((_, dayIndex) => {
                    const dayNum = dayIndex + 1;
                    const dateObj = new Date(currentYear, monthIdx, dayNum);
                    const dateStr = format(dateObj, 'yyyy-MM-dd');
                    const intensityClass = getCellIntensityStyle(dateStr);
                    const data = getDayActivityData(dateStr);
                    const hours = (data.totalSeconds / 3600).toFixed(1);

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setIsDayDetailOpen(true);
                        }}
                        title={`${dateStr}: ${hours}h focus, ${data.completedHabitsCount} habits done`}
                        className={`heatmap-cell w-full aspect-square rounded-lg flex items-center justify-center text-[10px] border transition-all relative cursor-pointer ${intensityClass}`}
                      >
                        <span>{dayNum}</span>

                        {/* Review Dot */}
                        {data.hasReview && (
                          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-400 shadow-sm" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
