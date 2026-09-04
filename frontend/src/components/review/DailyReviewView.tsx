'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  BookOpen,
  Sparkles,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Star,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { format, subDays, addDays, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export const DailyReviewView: React.FC = () => {
  const { reviews, saveDailyReview } = useApp();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [activeDate, setActiveDate] = useState<string>(todayStr);

  const existingReview = reviews.find((r) => r.date === activeDate);

  const [wentWell, setWentWell] = useState(existingReview?.wentWell || '');
  const [improve, setImprove] = useState(existingReview?.improve || '');
  const [tomorrowFocus, setTomorrowFocus] = useState(existingReview?.tomorrowFocus || '');
  const [score, setScore] = useState(existingReview?.productivityScore || 8);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync fields when active date changes
  useEffect(() => {
    const rev = reviews.find((r) => r.date === activeDate);
    if (rev) {
      setWentWell(rev.wentWell || '');
      setImprove(rev.improve || '');
      setTomorrowFocus(rev.tomorrowFocus || '');
      setScore(rev.productivityScore || 8);
    } else {
      setWentWell('');
      setImprove('');
      setTomorrowFocus('');
      setScore(8);
    }
  }, [activeDate, reviews]);

  const handlePrevDay = () => {
    const d = parseISO(activeDate);
    setActiveDate(format(subDays(d, 1), 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const d = parseISO(activeDate);
    setActiveDate(format(addDays(d, 1), 'yyyy-MM-dd'));
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    saveDailyReview({
      date: activeDate,
      wentWell,
      improve,
      tomorrowFocus,
      productivityScore: score,
    });
    setSavedSuccess(true);
    confetti({ particleCount: 30, spread: 50 });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Average productivity score
  const avgScore =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.productivityScore, 0) / reviews.length).toFixed(1)
      : 'N/A';

  const isCurrentToday = activeDate === todayStr;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] shadow-2xl bg-[#090E1C]/80 flex flex-wrap items-center justify-between gap-4">
        <div>
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

        {/* Date Stepper Navigator */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/85 border border-white/10 shadow-inner">
          <button
            type="button"
            onClick={handlePrevDay}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 text-xs font-mono font-bold text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-rose-400" />
            <span>{activeDate}</span>
            {isCurrentToday && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-sans font-black uppercase">
                Today
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form for Active Date Reflection */}
        <div className="lg:col-span-2 glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] space-y-5 shadow-2xl bg-[#090E1C]/80">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-3.5">
            <div>
              <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                <span>Reflection Entry:</span>
                <span className="text-indigo-400 font-mono font-bold">{activeDate}</span>
              </h3>
              <p className="text-[11px] text-slate-400">Lock in your cognitive progress before daily shutdown.</p>
            </div>
            {(existingReview || savedSuccess) && (
              <span className="flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <CheckCircle className="w-3.5 h-3.5" /> Saved &amp; Synced
              </span>
            )}
          </div>

          <form onSubmit={handleSaveReview} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                What Went Well Today? (Wins &amp; Deep Focus)
              </label>
              <textarea
                rows={2}
                value={wentWell}
                onChange={(e) => setWentWell(e.target.value)}
                placeholder="Major accomplishments, milestone breakthroughs, smooth state of flow..."
                className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                What Can Be Improved Tomorrow? (Friction Points)
              </label>
              <textarea
                rows={2}
                value={improve}
                onChange={(e) => setImprove(e.target.value)}
                placeholder="Unexpected context switches, missed routines, friction bottlenecks..."
                className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                Top Priority Directive for Tomorrow
              </label>
              <input
                type="text"
                value={tomorrowFocus}
                onChange={(e) => setTomorrowFocus(e.target.value)}
                placeholder="The single most crucial objective for tomorrow..."
                className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Daily Productivity Rating: <span className="text-rose-400 font-mono font-bold">{score} / 10</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">1 = Low &bull; 10 = Flow State</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    key={num}
                    type="button"
                    onClick={() => setScore(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black font-mono transition-all cursor-pointer ${
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
              whileHover={{ scale: 1.01, boxShadow: '0 0 25px rgba(244, 63, 94, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-black text-xs tracking-wider uppercase shadow-xl transition-all cursor-pointer border border-rose-400/40"
            >
              Save Daily Reflection Log
            </motion.button>
          </form>
        </div>

        {/* Right Col: Stats & Past Journal Timeline */}
        <div className="glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] space-y-5 shadow-2xl bg-[#090E1C]/80 flex flex-col">
          {/* Quick Metrics Capsule */}
          <div className="grid grid-cols-2 gap-3 pb-2 border-b border-white/[0.06]">
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Score</span>
              <span className="text-base font-black font-mono text-emerald-400 mt-0.5 block">{avgScore}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Reflections Logged</span>
              <span className="text-base font-black font-mono text-amber-400 mt-0.5 block">{reviews.length} entries</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-wide">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Journal Timeline</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Click to inspect</span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 flex-1">
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-8 text-center">No past journal reviews logged yet.</p>
            ) : (
              reviews.map((rev) => {
                const isSelected = rev.date === activeDate;
                return (
                  <motion.div
                    key={rev.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setActiveDate(rev.date)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-md ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                        : 'bg-slate-900/70 border-white/[0.06] hover:border-indigo-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className={`font-mono tracking-wide ${isSelected ? 'text-white font-black' : 'text-indigo-300'}`}>
                        {rev.date}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-black border border-rose-500/30 text-[11px]">
                        {rev.productivityScore}/10
                      </span>
                    </div>
                    {rev.wentWell && (
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        <span className="text-emerald-400 font-bold">Wins:</span> {rev.wentWell}
                      </p>
                    )}
                    {rev.tomorrowFocus && (
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        <span className="text-indigo-400 font-semibold">Priority:</span> {rev.tomorrowFocus}
                      </p>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
