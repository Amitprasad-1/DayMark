'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Sparkles,
  Edit3,
  List,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const ACTIVITY_PALETTE = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6'];

export const DayDetailModal: React.FC = () => {
  const {
    selectedDate,
    isDayDetailOpen,
    setIsDayDetailOpen,
    sessions,
    addSession,
    deleteSession,
    activities,
    addActivity,
    habits,
    toggleHabit,
    reviews,
    saveDailyReview,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sessions' | 'habits' | 'review'>('sessions');

  // Manual Session Log Form
  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    activities[0]?.id || ''
  );
  const [isManualActivity, setIsManualActivity] = useState<boolean>(false);
  const [manualActivityName, setManualActivityName] = useState<string>('');
  const [manualCategory, setManualCategory] = useState<string>('Deep Work');
  const [manualColor, setManualColor] = useState<string>(ACTIVITY_PALETTE[0]);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Daily Review Form State
  const existingReview = reviews.find((r) => r.date === selectedDate);
  const [wentWell, setWentWell] = useState<string>(existingReview?.wentWell || '');
  const [improve, setImprove] = useState<string>(existingReview?.improve || '');
  const [tomorrowFocus, setTomorrowFocus] = useState<string>(existingReview?.tomorrowFocus || '');
  const [score, setScore] = useState<number>(existingReview?.productivityScore || 8);

  useEffect(() => {
    if (!isDayDetailOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDayDetailOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDayDetailOpen, setIsDayDetailOpen]);

  if (!isDayDetailOpen) return null;

  const dateObj = parseISO(selectedDate);
  const formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy');

  // Filter day data
  const daySessions = sessions.filter((s) => s.date === selectedDate);
  const dayTotalSeconds = daySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const dayTotalHours = (dayTotalSeconds / 3600).toFixed(1);

  const handleAddManualSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (durationMinutes <= 0) return;

    let targetActivityId = selectedActivityId;

    if (isManualActivity) {
      const trimmedName = manualActivityName.trim();
      if (!trimmedName) return;

      const existing = activities.find(
        (a) => a.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (existing) {
        targetActivityId = existing.id;
      } else {
        const newAct = addActivity({
          name: trimmedName,
          category: manualCategory.trim() || 'Custom',
          color: manualColor,
          icon: 'Zap',
          dailyTargetMinutes: 60,
          isActive: true,
        });
        targetActivityId = newAct.id;
      }
    }

    if (!targetActivityId) return;

    const durationSeconds = durationMinutes * 60;
    const nowISO = new Date().toISOString();

    addSession({
      activityId: targetActivityId,
      startTime: nowISO,
      endTime: nowISO,
      durationSeconds,
      notes: sessionNotes || 'Manual session log',
      date: selectedDate,
    });

    setSessionNotes('');
    if (isManualActivity) {
      setManualActivityName('');
      setIsManualActivity(false);
      setSelectedActivityId(targetActivityId);
    }
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
    <div
      onClick={() => setIsDayDetailOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050811]/85 backdrop-blur-xl animate-fadeIn"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl glass-panel-luxury rounded-3xl border border-white/[0.12] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] bg-[#090E1C]/95"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-md">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">{formattedDate}</h3>
              <p className="text-xs text-slate-400 font-medium">
                Logged <strong className="text-emerald-400 font-mono font-bold">{dayTotalHours} hrs</strong> of deep focus
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => setIsDayDetailOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-white/[0.08] px-6 bg-slate-900/50 text-xs gap-2 py-1">
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`py-3 px-4 font-black transition-all relative cursor-pointer ${
              activeTab === 'sessions' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'sessions' && (
              <motion.div
                layoutId="modalActiveTabPill"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
              />
            )}
            <span>Focus Sessions ({daySessions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('habits')}
            className={`py-3 px-4 font-black transition-all relative cursor-pointer ${
              activeTab === 'habits' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'habits' && (
              <motion.div
                layoutId="modalActiveTabPill"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              />
            )}
            <span>Habit Records</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`py-3 px-4 font-black transition-all relative cursor-pointer ${
              activeTab === 'review' ? 'text-rose-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'review' && (
              <motion.div
                layoutId="modalActiveTabPill"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
              />
            )}
            <span>Daily Reflection {existingReview ? '✓' : ''}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* TAB 1: SESSIONS */}
              {activeTab === 'sessions' && (
            <div className="space-y-6">
              {/* Form to log manual session */}
              <form onSubmit={handleAddManualSession} className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/[0.08] space-y-3.5 shadow-inner">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Log Manual Focus Session</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {isManualActivity ? 'Type Custom Activity' : 'Track Activity'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualActivity(!isManualActivity);
                          if (!isManualActivity) {
                            setManualActivityName('');
                          }
                        }}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-1 cursor-pointer bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded-lg border border-indigo-500/30"
                      >
                        {isManualActivity ? (
                          <>
                            <List className="w-3 h-3" />
                            <span>Select Preset</span>
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-3 h-3" />
                            <span>Type Manually</span>
                          </>
                        )}
                      </button>
                    </div>

                    {isManualActivity ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g. DSA Practice, Physics, Client Work..."
                          value={manualActivityName}
                          onChange={(e) => setManualActivityName(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl glass-input bg-slate-900/90 font-medium border border-indigo-500/40 focus:border-indigo-400 text-white placeholder:text-slate-500"
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Category (e.g. Study, Work)"
                            value={manualCategory}
                            onChange={(e) => setManualCategory(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-[11px] rounded-lg glass-input bg-slate-900/70 font-medium text-slate-300 placeholder:text-slate-500"
                          />
                          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-white/5">
                            {ACTIVITY_PALETTE.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setManualColor(c)}
                                className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-transform ${
                                  manualColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <select
                        value={selectedActivityId}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setIsManualActivity(true);
                            setManualActivityName('');
                          } else {
                            setSelectedActivityId(e.target.value);
                          }
                        }}
                        className="w-full px-3.5 py-2 text-xs rounded-xl glass-input bg-slate-900 font-medium cursor-pointer"
                      >
                        {activities.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.category})
                          </option>
                        ))}
                        <option value="__custom__" className="text-indigo-400 font-bold bg-slate-800">
                          ➕ + Type Custom Activity...
                        </option>
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="720"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl glass-input font-medium"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Session context notes (e.g. Built database schemas, studied Chapter 4)..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-black shadow-lg cursor-pointer border border-indigo-400/40"
                >
                  Save Focus Session
                </motion.button>
              </form>

              {/* Logged Sessions List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
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
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-white/[0.06]"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white/10"
                              style={{ backgroundColor: act.color }}
                            />
                            <div>
                              <h5 className="text-xs font-bold text-white">{act.name}</h5>
                              {s.notes && <p className="text-[11px] text-slate-400">{s.notes}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-black text-indigo-300">
                              {mins} mins
                            </span>
                            <button
                              type="button"
                              onClick={() => deleteSession(s.id)}
                              className="text-slate-500 hover:text-rose-400 p-1.5 cursor-pointer rounded-lg hover:bg-white/5 transition-colors"
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
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Habit Completion Matrix for {selectedDate}
              </h4>
              <div className="space-y-2">
                {habits.map((h) => {
                  const isDone = !!h.logs[selectedDate];
                  return (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      key={h.id}
                      type="button"
                      onClick={() => toggleHabit(h.id, selectedDate)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl cursor-pointer border transition-all text-left ${
                        isDone
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                          : 'bg-slate-900/60 border-white/[0.06] text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: h.color }}
                        />
                        <span className="text-xs font-bold">{h.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">{h.frequency}</span>
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-950" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DAILY REFLECTION */}
          {activeTab === 'review' && (
            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1.5">
                  What Went Well?
                </label>
                <textarea
                  rows={2}
                  value={wentWell}
                  onChange={(e) => setWentWell(e.target.value)}
                  placeholder="Key accomplishments, breakthroughs, smooth flow..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-1.5">
                  What Can Be Improved?
                </label>
                <textarea
                  rows={2}
                  value={improve}
                  onChange={(e) => setImprove(e.target.value)}
                  placeholder="Distractions, energy friction, obstacles..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-indigo-400 block mb-1.5">
                  Tomorrow&apos;s Primary Focus
                </label>
                <input
                  type="text"
                  value={tomorrowFocus}
                  onChange={(e) => setTomorrowFocus(e.target.value)}
                  placeholder="Top #1 imperative directive..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-2">
                  Productivity Score (1 - 10): <span className="text-indigo-400 font-mono font-bold">{score}</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setScore(num)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-black font-mono transition-all cursor-pointer ${
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

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-black text-xs tracking-wide uppercase shadow-xl transition-all cursor-pointer border border-rose-400/40"
              >
                Save Daily Reflection
              </motion.button>
            </form>
          )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
