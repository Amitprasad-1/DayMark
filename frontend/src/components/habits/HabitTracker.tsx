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
  Sparkles,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] shadow-2xl bg-[#090E1C]/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <span>Habits Matrix &amp; Momentum</span>
            <span className="text-xs font-mono font-bold bg-amber-950/60 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-800/40">
              {habits.length} routines
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build unshakeable daily consistency with atomic streaks and momentum tracking.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)' }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-xl cursor-pointer transition-all border border-amber-300/40"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </motion.button>
      </div>

      {/* Add Habit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            onSubmit={handleCreateHabit}
            className="glass-panel-luxury p-6 rounded-3xl border border-amber-500/35 space-y-4 shadow-2xl bg-[#090E1C]/95"
          >
            <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Add New Habit Routine</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Habit Name</label>
                <input
                  type="text"
                  placeholder="e.g. Read 20 pages, 10K steps"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Category (e.g. Health, Mindset)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Color Accent</label>
                <div className="flex items-center gap-2 pt-0.5">
                  {['#10B981', '#06B6D4', '#6366F1', '#F59E0B', '#F43F5E', '#A855F7'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-xl transition-all cursor-pointer relative flex items-center justify-center ${
                        color === c ? 'scale-115 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <div className="relative overflow-hidden w-7 h-7 rounded-xl border border-white/20 flex items-center justify-center cursor-pointer bg-slate-800 hover:border-white/40 transition-colors" title="Custom color">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0"
                    />
                    <div className="w-3.5 h-3.5 rounded-full border border-white/50 shadow-sm" style={{ backgroundColor: color }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="px-5 py-2 text-xs rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-lg cursor-pointer border border-amber-300/40"
              >
                Save Habit
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Habit Matrix Grid */}
      <div className="glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] space-y-6 overflow-x-auto shadow-2xl bg-[#090E1C]/80">
        <div className="min-w-[680px] space-y-4">
          {/* Grid Header Dates */}
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/[0.08] pb-3.5">
            <span className="w-56">Habit Routine</span>
            <div className="flex items-center gap-2">
              {daysList.map((d) => (
                <div
                  key={d.dateStr}
                  className={`w-9 text-center flex flex-col items-center ${
                    d.isToday ? 'text-amber-400 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  <span className="text-[9px] uppercase font-mono">{d.dayName}</span>
                  <span className="text-xs font-mono font-bold mt-0.5">{d.dayNum}</span>
                </div>
              ))}
            </div>
            <span className="w-20 text-right">Streak</span>
          </div>

          {/* Habit Rows */}
          {habits.map((h) => {
            const streak = calculateStreak(h);
            return (
              <motion.div
                key={h.id}
                whileHover={{ scale: 1.003 }}
                className="flex items-center justify-between py-2.5 border-b border-white/[0.05] hover:bg-white/[0.03] px-3 rounded-2xl transition-colors"
              >
                <div className="w-56 flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm ring-2 ring-white/10"
                    style={{ backgroundColor: h.color }}
                  />
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate tracking-tight">{h.name}</h4>
                    <span className="text-[10px] text-slate-400">{h.category}</span>
                  </div>
                </div>

                {/* 14-Day Completion Squares */}
                <div className="flex items-center gap-2">
                  {daysList.map((d) => {
                    const isDone = !!h.logs[d.dateStr];
                    return (
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.88 }}
                        key={d.dateStr}
                        type="button"
                        onClick={() => {
                          toggleHabit(h.id, d.dateStr);
                          if (!isDone && d.isToday) {
                            confetti({ particleCount: 30, spread: 50 });
                          }
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isDone
                            ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.45)] border border-emerald-300/50'
                            : 'bg-slate-900/90 border border-white/10 hover:border-white/25'
                        }`}
                        title={`${h.name} - ${d.dateStr}`}
                      >
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-slate-950 fill-slate-950" />
                        ) : (
                          <Circle className="w-3 h-3 text-slate-700" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Streak Badge & Delete */}
                <div className="w-20 flex items-center justify-end gap-2">
                  <div className="flex items-center gap-1 text-xs font-black text-amber-300 font-mono bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-800/50 shadow-inner">
                    <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{streak}d</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteHabit(h.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-white/5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
