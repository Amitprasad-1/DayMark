'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Habit } from '@/types';
import {
  Zap,
  Plus,
  Trash2,
  Flame,
  CheckCircle,
  Circle,
  Calendar,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import confetti from 'canvas-confetti';

export const HabitTracker: React.FC = () => {
  const { habits, addHabit, toggleHabit, deleteHabit } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Wellness');
  const [color, setColor] = useState('#10B981');

  // Compute last 14 days dates for the completion grid
  const daysList = Array.from({ length: 14 }).map((_, i) => {
    const d = subDays(new Date(), 13 - i);
    return {
      dateStr: format(d, 'yyyy-MM-dd'),
      dayName: format(d, 'EEE'),
      dayNum: format(d, 'd'),
      isToday: i === 13,
    };
  });

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addHabit({
      name: name.trim(),
      category,
      color,
      icon: 'Zap',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      isActive: true,
    });

    setName('');
    setShowForm(false);
  };

  // Helper to calculate current consecutive streak
  const calculateStreak = (habit: Habit) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
      if (habit.logs[dateStr]) {
        streak++;
      } else if (i === 0) {
        // If today not completed yet, allow streak from yesterday
        continue;
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
            <span>Habit Matrix &amp; Streaks</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build unshakeable momentum with daily completion tracking.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Add Habit Form */}
      {showForm && (
        <form onSubmit={handleCreateHabit} className="glass-panel p-6 rounded-2xl border border-amber-500/30 space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-white">Add New Habit Routine</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Habit Name</label>
              <input
                type="text"
                placeholder="e.g. Read 20 pages, 10K steps"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Category</label>
              <input
                type="text"
                placeholder="Category (e.g. Health, Mindset)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Color Theme</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-9 rounded-xl glass-input p-1 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
            >
              Save Habit
            </button>
          </div>
        </form>
      )}

      {/* Habit Matrix Grid */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6 overflow-x-auto">
        <div className="min-w-[650px] space-y-4">
          {/* Grid Header Dates */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-white/10 pb-3">
            <span className="w-56">Habit Routine</span>
            <div className="flex items-center gap-2">
              {daysList.map((d) => (
                <div
                  key={d.dateStr}
                  className={`w-8 text-center flex flex-col items-center ${
                    d.isToday ? 'text-amber-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <span className="text-[9px] uppercase">{d.dayName}</span>
                  <span className="text-xs">{d.dayNum}</span>
                </div>
              ))}
            </div>
            <span className="w-20 text-right">Streak</span>
          </div>

          {/* Habit Rows */}
          {habits.map((h) => {
            const streak = calculateStreak(h);
            return (
              <div
                key={h.id}
                className="flex items-center justify-between py-2 border-b border-white/5 hover:bg-white/5 px-2 rounded-xl transition-colors"
              >
                <div className="w-56 flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: h.color }}
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-white truncate">{h.name}</h4>
                    <span className="text-[10px] text-slate-400">{h.category}</span>
                  </div>
                </div>

                {/* 14-Day Completion Buttons */}
                <div className="flex items-center gap-2">
                  {daysList.map((d) => {
                    const isDone = !!h.logs[d.dateStr];
                    return (
                      <button
                        key={d.dateStr}
                        onClick={() => {
                          toggleHabit(h.id, d.dateStr);
                          if (!isDone && d.isToday) {
                            confetti({ particleCount: 30, spread: 50 });
                          }
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                            : 'bg-slate-900 border border-white/10 hover:border-white/20'
                        }`}
                        title={`${h.name} - ${d.dateStr}`}
                      >
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-slate-950 fill-emerald-400" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-700" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Streak Badge & Delete */}
                <div className="w-20 flex items-center justify-end gap-2">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400 font-mono bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-800/40">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{streak}d</span>
                  </div>
                  <button
                    onClick={() => deleteHabit(h.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
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
  );
};
