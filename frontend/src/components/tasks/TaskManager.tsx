'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Priority } from '@/types';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Tag,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

export const TaskManager: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useApp();

  const [filter, setFilter] = useState<'ALL' | 'TODAY' | 'HIGH_PRIORITY' | 'COMPLETED'>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Task Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [category, setCategory] = useState('Engineering');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'TODAY') return t.dueDate === todayStr;
    if (filter === 'HIGH_PRIORITY') return t.priority === 'HIGH';
    if (filter === 'COMPLETED') return t.completed;
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category,
      dueDate,
    });

    setTitle('');
    setDescription('');
    setShowAddForm(false);
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'HIGH':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span>High</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Medium</span>
          </span>
        );
      case 'LOW':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Low</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] shadow-2xl bg-[#090E1C]/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-md">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span>Tasks &amp; Directives</span>
            <span className="text-xs font-mono font-bold bg-blue-950/60 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-800/40">
              {pendingCount} pending
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Linear-grade directive organization with smart priorities and date checkpoints.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)' }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-xs shadow-xl cursor-pointer transition-all border border-indigo-400/40"
        >
          <Plus className="w-4 h-4" />
          <span>New Directive</span>
        </motion.button>
      </div>

      {/* Add Task Form Modal / Inline */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            onSubmit={handleCreateTask}
            className="glass-panel-luxury p-6 rounded-3xl border border-indigo-500/35 space-y-4 shadow-2xl bg-[#090E1C]/95"
          >
            <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Create New Directive</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Architect PostgreSQL sync schema"
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
                  placeholder="Category (e.g. Engineering, Research)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input bg-slate-900 font-medium"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Description (Optional)</label>
              <input
                type="text"
                placeholder="Brief specifications or sub-goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="px-5 py-2 text-xs rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black shadow-lg cursor-pointer border border-indigo-400/40"
              >
                Save Directive
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter Tabs with Sliding Motion Pill */}
      <div className="flex items-center gap-2 text-xs p-1 rounded-2xl bg-slate-950/80 border border-white/10 w-fit">
        {(['ALL', 'TODAY', 'HIGH_PRIORITY', 'COMPLETED'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-extrabold transition-all relative cursor-pointer ${
              filter === f ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {filter === f && (
              <motion.div
                layoutId="taskFilterPill"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.35)]"
              />
            )}
            <span className="relative z-10">{f.replace('_', ' ')}</span>
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="glass-panel-luxury p-10 rounded-3xl text-center text-slate-400 text-xs italic border border-white/[0.08] bg-[#090E1C]/60">
            No directives match the selected filter.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.completed;
            return (
              <motion.div
                key={task.id}
                layout
                whileHover={{ scale: 1.005 }}
                className={`glass-panel-luxury p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                  isCompleted
                    ? 'opacity-60 bg-slate-950/40 border-white/[0.05]'
                    : 'border-white/[0.09] hover:border-indigo-500/40 bg-[#090E1C]/80 shadow-md'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    type="button"
                    onClick={() => {
                      toggleTask(task.id);
                      if (!isCompleted) confetti({ particleCount: 25, spread: 50 });
                    }}
                    className="mt-0.5 cursor-pointer outline-none"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950/80 shadow-sm" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-indigo-400 transition-colors" />
                    )}
                  </motion.button>

                  <div className="space-y-1">
                    <h4
                      className={`text-sm font-bold tracking-tight ${
                        isCompleted ? 'line-through text-slate-500' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 font-medium border border-white/5">
                        {task.category}
                      </span>
                      {task.dueDate && (
                        <span className="text-slate-400 flex items-center gap-1 font-mono">
                          <CalendarIcon className="w-3 h-3 text-slate-500" /> {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {getPriorityBadge(task.priority)}
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-white/5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
