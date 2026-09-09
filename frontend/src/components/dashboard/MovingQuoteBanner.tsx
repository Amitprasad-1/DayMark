'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Sparkles,
  Heart,
  Target,
  Trophy,
  Zap,
  Star,
  Award,
  BookOpen,
  Compass,
  Pause,
  Play,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Quote as QuoteIcon,
  FastForward,
  Hand,
  Activity,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ManageQuotesModal } from '@/components/modals/ManageQuotesModal';
import { motion, AnimatePresence } from 'framer-motion';

const ICON_COMPONENTS: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  Heart,
  Target,
  Flame,
  Sparkles,
  Trophy,
  Zap,
  Star,
  Award,
  BookOpen,
  Compass,
};

export const MovingQuoteBanner: React.FC = () => {
  const { quotes } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<'normal' | 'fast' | 'slow'>('normal');
  const [displayMode, setDisplayMode] = useState<'moving' | 'hands-on'>('moving');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Hydrate display mode preference from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('daymark_quote_banner_mode');
      if (savedMode === 'hands-on' || savedMode === 'moving') {
        setDisplayMode(savedMode);
      }
    } catch {}
  }, []);

  const activeQuotes = quotes.filter((q) => q.isActive);

  // Ensure current index is in bounds
  const safeIndex = activeQuotes.length > 0 ? currentIndex % activeQuotes.length : 0;
  const currentQuote = activeQuotes[safeIndex];

  const handleToggleMode = (mode: 'moving' | 'hands-on') => {
    setDisplayMode(mode);
    try {
      localStorage.setItem('daymark_quote_banner_mode', mode);
    } catch {}
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeQuotes.length === 0) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : activeQuotes.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeQuotes.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activeQuotes.length);
  };

  // Speed class mapping
  const getSpeedClass = () => {
    switch (speed) {
      case 'fast':
        return 'animate-ticker-fast';
      case 'slow':
        return 'animate-ticker-slow';
      default:
        return 'animate-ticker';
    }
  };

  const renderIcon = (iconName?: string, color = '#F59E0B') => {
    const IconComp = (iconName && ICON_COMPONENTS[iconName]) || Sparkles;
    return <IconComp className="w-4 h-4" style={{ color }} />;
  };

  const tickerItems = activeQuotes.length > 0 ? activeQuotes : [];

  return (
    <>
      <div className="w-full relative group">
        {/* Ambient Backlight Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-indigo-500/20 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition duration-500 pointer-events-none" />

        <div className="relative glass-panel-luxury rounded-2xl sm:rounded-3xl border border-white/[0.14] bg-[#090E1C]/90 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden flex items-center min-h-[4.25rem] sm:min-h-[4.75rem] py-2 sm:py-2.5">
          {/* Main Content Area (Utilizes full width without the left badge taking space) */}
          {tickerItems.length === 0 ? (
            <div
              className="flex-1 px-6 text-sm text-slate-300 italic flex items-center gap-2.5 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <QuoteIcon className="w-4 h-4 text-amber-400" />
              <span>No active quotes. Click "Edit Quotes" to add your motivational reminders!</span>
            </div>
          ) : displayMode === 'moving' ? (
            /* 1. CONTINUOUS MOVING TICKER (Full width from edge to edge) */
            <div
              className="flex-1 overflow-hidden relative ticker-mask cursor-pointer py-1 select-none"
              onClick={() => setIsModalOpen(true)}
              title="Click to edit quotes • Hover to pause"
            >
              <div
                className={`${getSpeedClass()} ${isPaused ? '' : 'pause-on-hover'} flex items-center`}
                style={{
                  animationPlayState: isPaused ? 'paused' : undefined,
                }}
              >
                {/* Repeat list multiple times to achieve seamless infinite loop */}
                {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((q, idx) => {
                  const quoteColor = q.color || '#F59E0B';
                  return (
                    <div
                      key={`${q.id}-${idx}`}
                      className="flex items-center gap-3.5 px-8 shrink-0 group/item transition-colors hover:text-white"
                    >
                      {/* Badge Pill */}
                      <span
                        className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm shrink-0"
                        style={{
                          backgroundColor: `${quoteColor}25`,
                          color: quoteColor,
                          border: `1px solid ${quoteColor}50`,
                        }}
                      >
                        {renderIcon(q.icon, quoteColor)}
                        {q.category || 'Focus'}
                      </span>

                      {/* Quote Text - Large, Bold & Fully Visible */}
                      <span className="text-sm sm:text-base lg:text-lg font-extrabold text-slate-100 group-hover/item:text-amber-200 transition-colors tracking-wide drop-shadow-sm">
                        "{q.text}"
                      </span>

                      {/* Author / Note */}
                      {q.author && (
                        <span className="text-xs sm:text-sm font-semibold text-slate-300 font-sans shrink-0">
                          &bull; {q.author}
                        </span>
                      )}

                      {/* Inter-quote separator bullet */}
                      <span className="text-amber-400/60 font-black text-sm sm:text-base ml-4 select-none">
                        ✦
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* 2. HANDS-ON / STATIC MODE (Stationary, full-sentence view with manual Prev/Next arrows) */
            <div className="flex-1 flex items-center justify-between px-3 sm:px-6 py-1 overflow-hidden select-none gap-2 sm:gap-4">
              {/* Prev Button */}
              <button
                type="button"
                onClick={handlePrev}
                className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-amber-500/15 border border-white/[0.08] hover:border-amber-500/30 transition shrink-0 cursor-pointer active:scale-95"
                title="Previous Quote (Click or Hands-on)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Centered Static Quote */}
              <div
                className="flex-1 flex items-center justify-center cursor-pointer min-w-0"
                onClick={() => setIsModalOpen(true)}
                title="Click to manage quotes"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuote.id}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.22 }}
                    className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap text-center max-w-4xl"
                  >
                    {/* Badge Pill */}
                    <span
                      className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm shrink-0"
                      style={{
                        backgroundColor: `${currentQuote.color || '#F59E0B'}25`,
                        color: currentQuote.color || '#F59E0B',
                        border: `1px solid ${currentQuote.color || '#F59E0B'}50`,
                      }}
                    >
                      {renderIcon(currentQuote.icon, currentQuote.color || '#F59E0B')}
                      {currentQuote.category || 'Focus'}
                    </span>

                    {/* Quote Text - Large & Stationary */}
                    <span className="text-sm sm:text-base lg:text-lg font-extrabold text-slate-100 tracking-wide drop-shadow-sm break-words">
                      "{currentQuote.text}"
                    </span>

                    {/* Author / Note */}
                    {currentQuote.author && (
                      <span className="text-xs sm:text-sm font-semibold text-slate-400 font-sans shrink-0">
                        &bull; {currentQuote.author}
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-amber-500/15 border border-white/[0.08] hover:border-amber-500/30 transition shrink-0 cursor-pointer active:scale-95"
                title="Next Quote (Click or Hands-on)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Right Controls: Mode Toggle, Speed/Counter, and Edit Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 bg-[#090E1C]/95 border-l border-white/[0.10] shrink-0 z-20">
            {/* Mode Switcher: Moving vs Hands-on */}
            <div className="flex items-center bg-white/[0.04] p-0.5 rounded-xl border border-white/[0.08]">
              <button
                type="button"
                onClick={() => handleToggleMode('moving')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  displayMode === 'moving'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Moving mode (Infinite scrolling marquee)"
              >
                <Activity className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Moving</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleMode('hands-on')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  displayMode === 'hands-on'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Hands-on mode (Stationary full quote with Next/Prev controls)"
              >
                <Hand className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Hands-on</span>
              </button>
            </div>

            {/* In Moving Mode: Speed & Pause Controls */}
            {displayMode === 'moving' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSpeed((prev) => (prev === 'normal' ? 'fast' : prev === 'fast' ? 'slow' : 'normal'));
                  }}
                  className="px-2 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] transition hidden sm:flex items-center gap-1"
                  title={`Speed: ${speed.toUpperCase()} (Click to toggle)`}
                >
                  <FastForward className="w-3.5 h-3.5 text-amber-400" />
                  <span>{speed === 'fast' ? '2x' : speed === 'slow' ? '0.5x' : '1x'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] transition"
                  title={isPaused ? 'Resume scrolling' : 'Pause scrolling'}
                >
                  {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
                </button>
              </>
            )}

            {/* In Hands-on Mode: Index Indicator */}
            {displayMode === 'hands-on' && activeQuotes.length > 0 && (
              <span className="px-2 py-1 rounded-lg bg-slate-800/80 border border-white/10 text-xs font-mono font-bold text-slate-300">
                {safeIndex + 1}/{activeQuotes.length}
              </span>
            )}

            {/* Edit / Manage Quotes Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/25 to-orange-500/25 hover:from-amber-500/40 hover:to-orange-500/40 text-amber-300 font-extrabold text-xs sm:text-sm border border-amber-500/50 shadow-sm hover:scale-[1.02] active:scale-98 transition cursor-pointer"
              title="Edit & Manage Quotes"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden md:inline">Edit Quotes</span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/35 text-xs font-mono font-bold text-amber-200">
                {activeQuotes.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Quote Management Modal */}
      <ManageQuotesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
