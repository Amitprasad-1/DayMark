'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Goal, GoalType } from '@/types';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  CheckCircle,
  TrendingUp,
  Award,
} from 'lucide-react';
import { format } from 'date-fns';

export const GoalManager: React.FC = () => {
  const { goals, addGoal, updateGoalProgress, deleteGoal } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<GoalType>('TIME');
  const [targetValue, setTargetValue] = useState<number>(100);
  const [category, setCategory] = useState('Development');
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
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-400" />
            <span>Goals &amp; Strategic Milestones</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Map long-term objectives to quantitative targets and track steady progression.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <form onSubmit={handleCreateGoal} className="glass-panel p-6 rounded-2xl border border-purple-500/30 space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-white">Create Strategic Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Goal Title</label>
              <input
                type="text"
                placeholder="e.g. Reach 100 Hours of Deep Coding"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Category</label>
              <input
                type="text"
                placeholder="Category (e.g. Development, Health)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Goal Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as GoalType)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-slate-900"
              >
                <option value="TIME">Time Goal (Hours)</option>
                <option value="TASK">Task Goal (Count)</option>
                <option value="HABIT">Habit Streak Goal (Days)</option>
                <option value="DEADLINE">Deadline Target</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Value</label>
              <input
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
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
              className="px-5 py-2 text-xs rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const percent = Math.min(
            100,
            Math.round((goal.currentValue / goal.targetValue) * 100)
          );
          const isCompleted = percent >= 100;

          return (
            <div
              key={goal.id}
              className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4 hover:border-purple-500/30 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {goal.type} &bull; {goal.category}
                  </span>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white">{goal.title}</h3>
                {goal.description && (
                  <p className="text-xs text-slate-400">{goal.description}</p>
                )}
              </div>

              {/* Progress Bar & Counter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">
                    {goal.currentValue} / {goal.targetValue} {goal.type === 'TIME' ? 'hrs' : 'units'}
                  </span>
                  <span className={isCompleted ? 'text-emerald-400 font-bold' : 'text-purple-300'}>
                    {percent}%
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons to adjust progress */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {goal.targetDate}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateGoalProgress(goal.id, -1)}
                    className="w-7 h-7 rounded-lg bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 font-bold"
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateGoalProgress(goal.id, 1)}
                    className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
