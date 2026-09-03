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
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  Play,
  Trash2,
} from 'lucide-react';
import {
  format,
  getDaysInYear,
  getDayOfYear,
  startOfYear,
  addDays,
  isToday,
  isFuture,
  parseISO,
  differenceInDays,
  differenceInSeconds,
  endOfYear,
  getDaysInMonth,
  startOfMonth,
  getDay,
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
    toggleTask,
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
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null); // Null = View all 12
  const [showAddCountdown, setShowAddCountdown] = useState<boolean>(false);

  // New Countdown Form state
  const [newCdTitle, setNewCdTitle] = useState('');
  const [newCdDate, setNewCdDate] = useState('');
  const [newCdCategory, setNewCdCategory] = useState('Milestone');

  // Year End Live Countdown Ticker
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

  // Color intensity helper for heatmap cells
  const getCellIntensityStyle = (dateStr: string) => {
    const data = getDayActivityData(dateStr);
    const hours = data.totalSeconds / 3600;
    const isDateToday = dateStr === todayStr;

    let bgClass = 'bg-slate-900/60 border-slate-800/40 text-slate-500';

    if (hours > 0 || data.completedHabitsCount > 0) {
      if (hours >= 4 || data.completedHabitsCount >= 3) {
        bgClass = 'bg-emerald-500/80 border-emerald-400/80 text-white font-bold shadow-sm shadow-emerald-500/30';
      } else if (hours >= 2 || data.completedHabitsCount >= 2) {
        bgClass = 'bg-indigo-500/70 border-indigo-400/60 text-white font-medium';
      } else if (hours >= 0.5 || data.completedHabitsCount >= 1) {
        bgClass = 'bg-indigo-700/50 border-indigo-600/40 text-indigo-200';
      } else {
        bgClass = 'bg-indigo-900/30 border-indigo-800/30 text-indigo-300';
      }
    }

    if (isDateToday) {
      bgClass += ' ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-950 font-bold';
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
      color: '#6366F1',
      icon: 'Target',
    });
    setNewCdTitle('');
    setNewCdDate('');
    setShowAddCountdown(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. TOP BANNER & YEAR PROGRESS WIDGET */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Year Progress & Real-Time Countdown */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Year {currentYear} Progress
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Day <span className="text-indigo-300 font-semibold">{dayOfYear}</span> of {totalDaysInYear} &bull; {daysLeftInYear} days remaining in {currentYear}
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-800/50">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="text-xs font-mono text-slate-200">
                <span className="font-bold text-amber-400">{timeToNewYear.days}d</span>{' '}
                <span>{String(timeToNewYear.hours).padStart(2, '0')}h</span>{' '}
                <span>{String(timeToNewYear.minutes).padStart(2, '0')}m</span>{' '}
                <span className="text-indigo-400">{String(timeToNewYear.seconds).padStart(2, '0')}s</span> to {currentYear + 1}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-indigo-300">{yearProgressPercent}% Elapsed</span>
              <span className="text-slate-400">{daysLeftInYear} Days Left</span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-slate-900 border border-white/10 overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-1000 shadow-md shadow-indigo-500/50"
                style={{ width: `${yearProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Custom Countdown Cards */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Custom Target Countdowns
              </span>
              <button
                onClick={() => setShowAddCountdown(!showAddCountdown)}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Target</span>
              </button>
            </div>

            {showAddCountdown && (
              <form onSubmit={handleCreateCountdown} className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 flex flex-wrap gap-2 items-center">
                <input
                  type="text"
                  placeholder="Target Name (e.g. Exam, Product Launch)"
                  value={newCdTitle}
                  onChange={(e) => setNewCdTitle(e.target.value)}
                  className="flex-1 min-w-[200px] px-3 py-1.5 text-xs rounded-lg glass-input"
                  required
                />
                <input
                  type="date"
                  value={newCdDate}
                  onChange={(e) => setNewCdDate(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg glass-input"
                  required
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  Save
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
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 transition-all group"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-white">{cd.title}</h4>
                      <p className="text-[10px] text-slate-400">{format(target, 'MMM d, yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold font-mono px-2 py-1 rounded-lg ${
                          isPassed
                            ? 'bg-slate-800 text-slate-500'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {isPassed ? 'Passed' : `${daysRemaining}d left`}
                      </span>
                      <button
                        onClick={() => deleteCountdown(cd.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1"
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
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Today&apos;s Focus Goal</h3>
              </div>
              <span className="text-xs font-bold text-indigo-400">{focusGoalPercent}%</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{todayFocusMinutes} mins logged</span>
                <span>Target: {targetMinutes}m</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${focusGoalPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Habits & Tasks List */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Today&apos;s Habits ({todayData.completedHabitsCount}/{todayData.totalHabitsCount})
            </p>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {habits.filter((h) => h.isActive).map((h) => {
                const isDone = !!h.logs[todayStr];
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      toggleHabit(h.id, todayStr);
                      if (!isDone) {
                        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
                      }
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer border transition-all text-left ${
                      isDone
                        ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200'
                        : 'bg-slate-900/50 border-white/5 text-slate-300 hover:border-white/10'
                    }`}
                  >
                    <span className="truncate">{h.name}</span>
                    {isDone ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Button to start timer or open today detail */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                setActiveTab('timer');
                setTimerStatus('RUNNING');
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Timer</span>
            </button>
            <button
              onClick={() => {
                setSelectedDate(todayStr);
                setIsDayDetailOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-white/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Day</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CENTERPIECE: FULL-YEAR VISUAL CALENDAR (12 MONTH GRID) */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-emerald-400" />
              <span>{currentYear} Visual Activity Calendar</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Every day of {currentYear} represented as an interactive heatmap cell. Click any date to view focus logs, habit records, or write daily reflections.
            </p>
          </div>

          {/* Filter / Month View Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedMonthIndex(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedMonthIndex === null
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              All 12 Months
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-slate-400">
          <span>Activity Level:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-900 border border-slate-800" />
            <span className="text-[11px]">None</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-indigo-900/50 border border-indigo-800/50" />
            <span className="text-[11px]">Light</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-indigo-600 border border-indigo-500" />
            <span className="text-[11px]">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500 border border-emerald-400" />
            <span className="text-[11px]">High Focus</span>
          </div>
        </div>

        {/* 12-Month Matrix Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MONTH_NAMES.map((monthName, monthIdx) => {
            if (selectedMonthIndex !== null && selectedMonthIndex !== monthIdx) {
              return null;
            }

            const monthStart = new Date(currentYear, monthIdx, 1);
            const daysInMonthCount = getDaysInMonth(monthStart);
            const startDayOfWeek = getDay(monthStart); // 0 = Sun, 1 = Mon...

            return (
              <div
                key={monthName}
                className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-3 hover:border-indigo-500/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white tracking-wide">{monthName}</h3>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">{daysInMonthCount} days</span>
                </div>

                {/* Day headers: S M T W T F S */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500">
                  <span>S</span>
                  <span>M</span>
                  <span>T</span>
                  <span>W</span>
                  <span>T</span>
                  <span>F</span>
                  <span>S</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Empty offset padding cells */}
                  {Array.from({ length: startDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-full aspect-square" />
                  ))}

                  {/* Month Day Cells */}
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
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setIsDayDetailOpen(true);
                        }}
                        title={`${dateStr}: ${hours} hrs logged, ${data.completedHabitsCount} habits done`}
                        className={`heatmap-cell w-full aspect-square rounded-md flex items-center justify-center text-[11px] border transition-all relative group cursor-pointer ${intensityClass}`}
                      >
                        <span>{dayNum}</span>

                        {/* Dot indicator if has daily review */}
                        {data.hasReview && (
                          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-400" />
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
