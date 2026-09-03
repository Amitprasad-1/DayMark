'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Zap,
  Calendar as CalendarIcon,
  Star,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const DayDetailModal: React.FC = () => {
  const {
    selectedDate,
    isDayDetailOpen,
    setIsDayDetailOpen,
    sessions,
    addSession,
    deleteSession,
    activities,
    habits,
    toggleHabit,
    tasks,
    reviews,
    saveDailyReview,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sessions' | 'habits' | 'review'>('sessions');

  // Manual Session Log Form
  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    activities[0]?.id || ''
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Daily Review Form State
  const existingReview = reviews.find((r) => r.date === selectedDate);
  const [wentWell, setWentWell] = useState<string>(existingReview?.wentWell || '');
  const [improve, setImprove] = useState<string>(existingReview?.improve || '');
  const [tomorrowFocus, setTomorrowFocus] = useState<string>(existingReview?.tomorrowFocus || '');
  const [score, setScore] = useState<number>(existingReview?.productivityScore || 8);

  if (!isDayDetailOpen) return null;

  const dateObj = parseISO(selectedDate);
  const formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy');

  // Filter day data
  const daySessions = sessions.filter((s) => s.date === selectedDate);
  const dayTotalSeconds = daySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const dayTotalHours = (dayTotalSeconds / 3600).toFixed(1);

  const handleAddManualSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityId || durationMinutes <= 0) return;

    const durationSeconds = durationMinutes * 60;
    const nowISO = new Date().toISOString();

    addSession({
      activityId: selectedActivityId,
      startTime: nowISO,
      endTime: nowISO,
      durationSeconds,
      notes: sessionNotes || 'Manual session log',
      date: selectedDate,
    });

    setSessionNotes('');
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    saveDailyReview({
      date: selectedDate,
      wentWell,
      improve,
      tomorrowFocus,
      productivityScore: score,
    });
    setIsDayDetailOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{formattedDate}</h3>
              <p className="text-xs text-slate-400">
                Logged <span className="text-emerald-400 font-bold">{dayTotalHours} hrs</span> of focus
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDayDetailOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-white/10 px-6 bg-slate-900/40 text-xs">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'sessions'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Focus Sessions ({daySessions.length})
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'habits'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Habit Records
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'review'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Daily Reflection {existingReview ? '✓' : ''}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              {/* Form to log manual session */}
              <form onSubmit={handleAddManualSession} className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Log Manual Focus Session</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Activity</label>
                    <select
                      value={selectedActivityId}
                      onChange={(e) => setSelectedActivityId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg glass-input bg-slate-900"
                    >
                      {activities.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.category})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="720"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs rounded-lg glass-input"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Session notes (e.g. Built database schemas, studied Chapter 4)"
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
                >
                  Save Focus Session
                </button>
              </form>

              {/* Logged Sessions List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Logged Sessions ({daySessions.length})
                </h4>

                {daySessions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    No focus sessions recorded for this date yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {daySessions.map((s) => {
                      const act = activities.find((a) => a.id === s.activityId) || {
                        name: 'Focus',
                        color: '#6366F1',
                      };
                      const mins = Math.round(s.durationSeconds / 60);

                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: act.color }}
                            />
                            <div>
                              <h5 className="text-xs font-semibold text-white">{act.name}</h5>
                              {s.notes && <p className="text-[11px] text-slate-400">{s.notes}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold text-indigo-300">
                              {mins} mins
                            </span>
                            <button
                              onClick={() => deleteSession(s.id)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: HABITS */}
          {activeTab === 'habits' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Habit Completion Log for {selectedDate}
              </h4>
              <div className="space-y-2">
                {habits.map((h) => {
                  const isDone = !!h.logs[selectedDate];
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => toggleHabit(h.id, selectedDate)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all text-left ${
                        isDone
                          ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200'
                          : 'bg-slate-900/50 border-white/5 text-slate-300 hover:border-white/10'
                      }`}
                    >
                      <span className="text-xs font-medium">{h.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{h.frequency}</span>
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DAILY REFLECTION */}
          {activeTab === 'review' && (
            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-emerald-400 block mb-1">
                  What Went Well Today?
                </label>
                <textarea
                  rows={2}
                  value={wentWell}
                  onChange={(e) => setWentWell(e.target.value)}
                  placeholder="Wins, accomplishments, breakthrough focus..."
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-400 block mb-1">
                  What Can Be Improved?
                </label>
                <textarea
                  rows={2}
                  value={improve}
                  onChange={(e) => setImprove(e.target.value)}
                  placeholder="Obstacles, distractions, energy dips..."
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-indigo-400 block mb-1">
                  Tomorrow&apos;s Primary Focus
                </label>
                <input
                  type="text"
                  value={tomorrowFocus}
                  onChange={(e) => setTomorrowFocus(e.target.value)}
                  placeholder="Top #1 imperative task for tomorrow..."
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Productivity Score (1 - 10): <span className="text-indigo-400">{score}</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setScore(num)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        score === num
                          ? 'bg-gradient-to-r from-indigo-500 to-emerald-400 text-slate-950 scale-105 shadow-md'
                          : 'bg-slate-900 text-slate-400 border border-white/5'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-semibold text-xs shadow-lg transition-all"
              >
                Save Daily Reflection
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
