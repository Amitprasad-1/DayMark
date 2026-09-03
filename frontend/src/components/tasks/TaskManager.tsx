'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Priority, Task } from '@/types';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Tag,
  AlertCircle,
  CheckCircle2,
  Circle,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

export const TaskManager: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useApp();

  const [filter, setFilter] = useState<'ALL' | 'TODAY' | 'HIGH_PRIORITY' | 'COMPLETED'>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Task Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [category, setCategory] = useState('Development');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'TODAY') return t.dueDate === todayStr;
    if (filter === 'HIGH_PRIORITY') return t.priority === 'HIGH';
    if (filter === 'COMPLETED') return t.completed;
    return true;
  });

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

  const getPriorityBadgeStyle = (p: Priority) => {
    switch (p) {
      case 'HIGH':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'LOW':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-400" />
            <span>Task Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Organize daily directives, prioritize deep tasks, and sync accomplishments.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Add Task Form Modal / Inline */}
      {showAddForm && (
        <form onSubmit={handleCreateTask} className="glass-panel p-6 rounded-2xl border border-indigo-500/30 space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-white">Create New Task Directive</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g. Implement user authentication logic"
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
                placeholder="Category (e.g. Development, Writing)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-slate-900"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="Description or notes (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl glass-input"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs rounded-xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {(['ALL', 'TODAY', 'HIGH_PRIORITY', 'COMPLETED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all ${
              filter === f
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs italic">
            No tasks match the selected filter.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.completed;
            return (
              <div
                key={task.id}
                className={`glass-panel p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                  isCompleted ? 'opacity-60 bg-slate-950/40 border-white/5' : 'border-white/10 hover:border-indigo-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => {
                      toggleTask(task.id);
                      if (!isCompleted) confetti({ particleCount: 25, spread: 50 });
                    }}
                    className="mt-0.5"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-indigo-400 transition-colors" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <h4
                      className={`text-sm font-semibold ${
                        isCompleted ? 'line-through text-slate-500' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-400">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 pt-1 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {task.category}
                      </span>
                      {task.dueDate && (
                        <span className="text-slate-400 flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" /> {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeStyle(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
