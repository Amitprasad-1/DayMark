'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  BookOpen,
  Sparkles,
  Calendar,
  CheckCircle,
  Award,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export const DailyReviewView: React.FC = () => {
  const { reviews, saveDailyReview, selectedDate, setSelectedDate } = useApp();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const existingReview = reviews.find((r) => r.date === todayStr);

  const [wentWell, setWentWell] = useState(existingReview?.wentWell || '');
  const [improve, setImprove] = useState(existingReview?.improve || '');
  const [tomorrowFocus, setTomorrowFocus] = useState(existingReview?.tomorrowFocus || '');
  const [score, setScore] = useState(existingReview?.productivityScore || 8);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    saveDailyReview({
      date: todayStr,
      wentWell,
      improve,
      tomorrowFocus,
      productivityScore: score,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] shadow-2xl bg-[#090E1C]/80">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <span>Daily Reflection &amp; Review Journal</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Structured mental debriefs: capture key breakthroughs, isolate friction points, and focus tomorrow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form for Today's Reflection */}
        <div className="lg:col-span-2 glass-panel-luxury p-6 lg:p-8 rounded-3xl border border-white/[0.09] space-y-6 shadow-2xl bg-[#090E1C]/80">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
            <div>
              <h3 className="text-base font-black text-white tracking-tight">Today&apos;s Reflection Log ({todayStr})</h3>
              <p className="text-xs text-slate-400">Lock in your cognitive progress before shutdown.</p>
            </div>
            {(existingReview || savedSuccess) && (
              <span className="flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <CheckCircle className="w-3.5 h-3.5" /> Saved &amp; Synced
              </span>
            )}
          </div>

          <form onSubmit={handleSaveReview} className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1.5">
                What Went Well Today? (Wins &amp; Deep Focus)
              </label>
              <textarea
                rows={3}
                value={wentWell}
                onChange={(e) => setWentWell(e.target.value)}
                placeholder="Major accomplishments, milestone breakthroughs, smooth state of flow..."
                className="w-full px-4 py-3 text-xs rounded-2xl glass-input"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-1.5">
                What Can Be Improved Tomorrow? (Friction Points)
              </label>
              <textarea
                rows={3}
                value={improve}
                onChange={(e) => setImprove(e.target.value)}
                placeholder="Unexpected context switches, missed routines, friction bottlenecks..."
                className="w-full px-4 py-3 text-xs rounded-2xl glass-input"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-indigo-400 block mb-1.5">
                Top Priority Directive for Tomorrow
              </label>
              <input
                type="text"
                value={tomorrowFocus}
                onChange={(e) => setTomorrowFocus(e.target.value)}
                placeholder="The single most crucial objective for tomorrow..."
                className="w-full px-4 py-3 text-xs rounded-2xl glass-input"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-2.5">
                Daily Productivity Rating: <span className="text-rose-400 font-mono font-bold text-sm">{score} / 10</span>
              </label>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    key={num}
                    type="button"
                    onClick={() => setScore(num)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black font-mono transition-all cursor-pointer ${
                      score === num
                        ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white scale-105 shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-rose-400/50'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {num}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(244, 63, 94, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-black text-xs tracking-wider uppercase shadow-xl transition-all cursor-pointer border border-rose-400/40"
            >
              Save Daily Reflection Log
            </motion.button>
          </form>
        </div>

        {/* Right Col: Past Journal Entries Timeline */}
        <div className="glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] space-y-4 shadow-2xl bg-[#090E1C]/80">
          <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-wide">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Journal Timeline ({reviews.length})</span>
          </h3>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">No past journal reviews logged yet.</p>
            ) : (
              reviews.map((rev) => (
                <motion.div
                  key={rev.id}
                  whileHover={{ scale: 1.01 }}
                  className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/[0.06] space-y-2 hover:border-indigo-500/30 transition-all shadow-md"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-indigo-300 font-mono tracking-wide">{rev.date}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-black border border-rose-500/30">
                      {rev.productivityScore}/10
                    </span>
                  </div>
                  {rev.wentWell && (
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      <span className="text-emerald-400 font-bold">Wins:</span> {rev.wentWell}
                    </p>
                  )}
                  {rev.tomorrowFocus && (
                    <p className="text-[10px] text-slate-400 line-clamp-1">
                      <span className="text-indigo-400 font-semibold">Priority:</span> {rev.tomorrowFocus}
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
