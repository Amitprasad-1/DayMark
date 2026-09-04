'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Goal, GoalType } from '@/types';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export const GoalManager: React.FC = () => {
  const { goals, addGoal, updateGoalProgress, deleteGoal } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<GoalType>('TIME');
  const [targetValue, setTargetValue] = useState<number>(100);
  const [category, setCategory] = useState('Engineering');
  const [targetDate, setTargetDate] = useState(
    format(new Date(new Date().getFullYear(), 11, 31), 'yyyy-MM-dd')
  );

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetValue <= 0) return;

    addGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      targetValue,
      category,
      targetDate,
      color: '#6366F1',
    });

    setTitle('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] shadow-2xl bg-[#090E1C]/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-md">
              <Target className="w-5 h-5" />
            </div>
            <span>Goals &amp; Strategic Targets</span>
            <span className="text-xs font-mono font-bold bg-purple-950/60 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-800/40">
              {goals.length} tracked
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Map long-term vision into quantitative milestones with real-time progression tracking.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(168, 85, 247, 0.4)' }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-xl cursor-pointer transition-all border border-purple-400/40"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </motion.button>
      </div>

      {/* Add Goal Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            onSubmit={handleCreateGoal}
            className="glass-panel-luxury p-6 rounded-3xl border border-purple-500/35 space-y-4 shadow-2xl bg-[#090E1C]/95"
          >
            <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Create Strategic Goal</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. 100 Hours of Deep Systems Engineering"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Category (e.g. Architecture, Learning)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Goal Metric Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as GoalType)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input bg-slate-900 font-medium"
                >
                  <option value="TIME">Time Metric (Hours)</option>
                  <option value="TASK">Task Metric (Directives)</option>
                  <option value="HABIT">Streak Metric (Days)</option>
                  <option value="DEADLINE">Deadline Target</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Target Value</label>
                <input
                  type="number"
                  min="1"
                  value={targetValue}
                  onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input"
                />
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
                className="px-5 py-2 text-xs rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-lg cursor-pointer border border-purple-400/40"
              >
                Save Goal
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const percent = Math.min(
            100,
            Math.round((goal.currentValue / goal.targetValue) * 100)
          );
          const isCompleted = percent >= 100;

          return (
            <motion.div
              key={goal.id}
              whileHover={{ scale: 1.015 }}
              className="glass-panel-luxury p-6 rounded-3xl border border-white/[0.09] flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all shadow-xl bg-[#090E1C]/80"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                    {goal.type} &bull; {goal.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteGoal(goal.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-white/5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-black text-white tracking-tight">{goal.title}</h3>
                {goal.description && (
                  <p className="text-xs text-slate-400 leading-relaxed">{goal.description}</p>
                )}
              </div>

              {/* Progress Bar & Counter */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-bold font-mono">
                  <span className="text-slate-300 font-sans">
                    {goal.currentValue} / {goal.targetValue} {goal.type === 'TIME' ? 'hrs' : 'units'}
                  </span>
                  <span className={isCompleted ? 'text-emerald-400 font-extrabold shadow-sm' : 'text-purple-300'}>
                    {percent}%
                  </span>
                </div>

                <div className="w-full h-3.5 rounded-full bg-slate-950/95 overflow-hidden p-0.5 border border-white/10 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    }`}
                  />
                </div>
              </div>

              {/* Action Buttons to adjust progress */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
                <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {goal.targetDate}
                </span>

                <div className="flex items-center gap-1.5">
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    type="button"
                    onClick={() => updateGoalProgress(goal.id, -1)}
                    className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 font-black cursor-pointer shadow-sm flex items-center justify-center text-sm"
                  >
                    -
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    type="button"
                    onClick={() => updateGoalProgress(goal.id, 1)}
                    className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black cursor-pointer shadow-[0_0_12px_rgba(99,102,241,0.3)] flex items-center justify-center text-sm"
                  >
                    +
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
