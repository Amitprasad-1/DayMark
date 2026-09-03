'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  BookOpen,
  Plus,
  Sparkles,
  Calendar,
  Star,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export const DailyReviewView: React.FC = () => {
  const { reviews, saveDailyReview, selectedDate, setSelectedDate } = useApp();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const existingReview = reviews.find((r) => r.date === todayStr);

  const [wentWell, setWentWell] = useState(existingReview?.wentWell || '');
  const [improve, setImprove] = useState(existingReview?.improve || '');
  const [tomorrowFocus, setTomorrowFocus] = useState(existingReview?.tomorrowFocus || '');
  const [score, setScore] = useState(existingReview?.productivityScore || 8);

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    saveDailyReview({
      date: todayStr,
      wentWell,
      improve,
      tomorrowFocus,
      productivityScore: score,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-rose-400" />
          <span>Daily Reflection &amp; Review Journal</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Self-reflection is the engine of rapid personal growth and continuous refinement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form for Today's Reflection */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Today&apos;s Reflection ({todayStr})</h3>
              <p className="text-xs text-slate-400">Record insights before closing your day.</p>
            </div>
            {existingReview && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800/40">
                <CheckCircle className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSaveReview} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-emerald-400 block mb-1">
                What Went Well Today?
              </label>
              <textarea
                rows={3}
                value={wentWell}
                onChange={(e) => setWentWell(e.target.value)}
                placeholder="Key accomplishments, focused study blocks, energy management..."
                className="w-full px-4 py-3 text-xs rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-amber-400 block mb-1">
                What Can Be Improved Tomorrow?
              </label>
              <textarea
                rows={3}
                value={improve}
                onChange={(e) => setImprove(e.target.value)}
                placeholder="Friction points, unexpected distractions, missed habit targets..."
                className="w-full px-4 py-3 text-xs rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-indigo-400 block mb-1">
                Top Priority Directive for Tomorrow
              </label>
              <input
                type="text"
                value={tomorrowFocus}
                onChange={(e) => setTomorrowFocus(e.target.value)}
                placeholder="The single #1 task that moves the needle tomorrow..."
                className="w-full px-4 py-2.5 text-xs rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Overall Daily Productivity Score: <span className="text-rose-400">{score} / 10</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setScore(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      score === num
                        ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white scale-105 shadow-md shadow-rose-500/30'
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-bold text-xs shadow-xl transition-all"
            >
              Save Today&apos;s Journal Entry
            </button>
          </form>
        </div>

        {/* Right Col: Past Journal Entries Timeline */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Journal Timeline ({reviews.length})</span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No past journal reviews saved yet.</p>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-indigo-300 font-mono">{rev.date}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                      {rev.productivityScore}/10
                    </span>
                  </div>
                  {rev.wentWell && (
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      <span className="text-emerald-400 font-medium">Wins:</span> {rev.wentWell}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
