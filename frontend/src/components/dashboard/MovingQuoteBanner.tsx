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
  Activity,
  ZoomIn,
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

export type QuoteBannerMode = 'zoom' | 'moving';
export type QuoteSpeed = '0.25x' | '0.50x' | '0.75x' | '1.00x';

const SPEED_CONFIG: Record<
  QuoteSpeed,
  { wordIntervalMs: number; holdDurationMs: number; marqueeClass: string; label: string }
> = {
  '0.25x': { wordIntervalMs: 620, holdDurationMs: 3800, marqueeClass: 'animate-ticker-025', label: '0.25x' },
  '0.50x': { wordIntervalMs: 460, holdDurationMs: 3000, marqueeClass: 'animate-ticker-050', label: '0.50x' },
  '0.75x': { wordIntervalMs: 340, holdDurationMs: 2400, marqueeClass: 'animate-ticker-075', label: '0.75x' },
  '1.00x': { wordIntervalMs: 240, holdDurationMs: 1800, marqueeClass: 'animate-ticker-100', label: '1.00x' },
};

interface MovingQuoteBannerProps {
  className?: string;
}

export const MovingQuoteBanner: React.FC<MovingQuoteBannerProps> = ({ className = '' }) => {
  const { quotes } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<QuoteSpeed>('0.50x');
  const [displayMode, setDisplayMode] = useState<QuoteBannerMode>('zoom');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Word-by-Word Zoom Reading State
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [isHoldingSentence, setIsHoldingSentence] = useState(false);

  // Hydrate display mode & speed preferences from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('daymark_quote_banner_mode') as QuoteBannerMode | null;
      if (savedMode === 'zoom' || savedMode === 'moving') {
        setDisplayMode(savedMode);
      }
      const savedSpeed = localStorage.getItem('daymark_quote_banner_speed') as QuoteSpeed | null;
      if (savedSpeed && SPEED_CONFIG[savedSpeed]) {
        setSpeed(savedSpeed);
      }
    } catch {}
  }, []);

  const activeQuotes = quotes.filter((q) => q.isActive);

  // Ensure current index is in bounds
  const safeIndex = activeQuotes.length > 0 ? currentIndex % activeQuotes.length : 0;
  const currentQuote = activeQuotes[safeIndex];

  // Split current quote into words
  const words = currentQuote ? currentQuote.text.trim().split(/\s+/) : [];

  // Reset word reading state when quote changes
  useEffect(() => {
    setActiveWordIndex(0);
    setIsHoldingSentence(false);
  }, [currentIndex, safeIndex]);

  // Word-by-Word Focus Reading Timer Engine
  useEffect(() => {
    if (displayMode !== 'zoom' || isPaused || words.length === 0) return;

    const currentConfig = SPEED_CONFIG[speed] || SPEED_CONFIG['0.50x'];
    let timer: NodeJS.Timeout;

    if (isHoldingSentence) {
      // Hold the completed sentence so the reader absorbs the full quote stress-free
      timer = setTimeout(() => {
        setIsHoldingSentence(false);
        setActiveWordIndex(0);
        setCurrentIndex((prev) => (prev + 1) % activeQuotes.length);
      }, currentConfig.holdDurationMs);
    } else {
      timer = setTimeout(() => {
        if (activeWordIndex < words.length - 1) {
          setActiveWordIndex((prev) => prev + 1);
        } else {
          // Finished reading the sentence! Enter hold state
          setIsHoldingSentence(true);
        }
      }, currentConfig.wordIntervalMs);
    }

    return () => clearTimeout(timer);
  }, [displayMode, isPaused, activeWordIndex, isHoldingSentence, words.length, speed, activeQuotes.length]);

  const handleToggleMode = (mode: QuoteBannerMode) => {
    setDisplayMode(mode);
    setActiveWordIndex(0);
    setIsHoldingSentence(false);
    try {
      localStorage.setItem('daymark_quote_banner_mode', mode);
    } catch {}
  };

  const cycleSpeed = () => {
    setSpeed((curr) => {
      let nextSpeed: QuoteSpeed = '0.50x';
      if (curr === '0.25x') nextSpeed = '0.50x';
      else if (curr === '0.50x') nextSpeed = '0.75x';
      else if (curr === '0.75x') nextSpeed = '1.00x';
      else if (curr === '1.00x') nextSpeed = '0.25x';

      try {
        localStorage.setItem('daymark_quote_banner_speed', nextSpeed);
      } catch {}
      return nextSpeed;
    });
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeQuotes.length === 0) return;
    setActiveWordIndex(0);
    setIsHoldingSentence(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : activeQuotes.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeQuotes.length === 0) return;
    setActiveWordIndex(0);
    setIsHoldingSentence(false);
    setCurrentIndex((prev) => (prev + 1) % activeQuotes.length);
  };

  const renderIcon = (iconName?: string, color = '#F59E0B') => {
    const IconComp = (iconName && ICON_COMPONENTS[iconName]) || Sparkles;
    return <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color }} />;
  };

  const tickerItems = activeQuotes.length > 0 ? activeQuotes : [];
  const marqueeClass = SPEED_CONFIG[speed]?.marqueeClass || 'animate-ticker-050';

  return (
    <>
      <div className={`w-full relative group ${className}`}>
        {/* Subtle Ambient Backlight Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-indigo-500/20 rounded-2xl sm:rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500 pointer-events-none" />

        <div className="relative glass-panel-luxury rounded-2xl sm:rounded-3xl border border-white/[0.14] bg-[#090E1C]/90 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden flex flex-col sm:flex-row sm:items-center min-h-[4.5rem] sm:min-h-[5rem]">
          {/* Main Content Area (Full width on mobile, flexible on desktop) */}
          <div className="flex-1 min-w-0 w-full flex items-center py-2 sm:py-2.5">
            {tickerItems.length === 0 ? (
              <div
                className="flex-1 px-4 sm:px-6 text-sm text-slate-300 italic flex items-center gap-2.5 cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              >
                <QuoteIcon className="w-4 h-4 text-amber-400" />
                <span>No active quotes. Click "Edit Quotes" to add your motivational reminders!</span>
              </div>
            ) : displayMode === 'zoom' ? (
              /* 1. WORD-BY-WORD SEQUENTIAL ZOOM READING (Effortless, Stress-free, Highly Focused) */
              <div className="flex-1 flex items-center justify-between px-2 sm:px-6 py-1 overflow-hidden select-none gap-2 sm:gap-4 w-full">
                {/* Prev Button */}
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1.5 sm:p-2.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-amber-500/15 border border-white/[0.08] hover:border-amber-500/30 transition shrink-0 cursor-pointer active:scale-95"
                  title="Previous Quote"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Center: Sequential Word Zoom Sentence */}
                <div
                  className="flex-1 flex items-center justify-center cursor-pointer min-w-0 px-1"
                  onClick={() => setIsModalOpen(true)}
                  title="Click to edit quotes"
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-3.5 flex-wrap text-center max-w-4xl py-1">
                    {/* Badge Pill */}
                    <span
                      className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm shrink-0"
                      style={{
                        backgroundColor: `${currentQuote.color || '#F59E0B'}25`,
                        color: currentQuote.color || '#F59E0B',
                        border: `1px solid ${currentQuote.color || '#F59E0B'}50`,
                      }}
                    >
                      {renderIcon(currentQuote.icon, currentQuote.color || '#F59E0B')}
                      <span>{currentQuote.category || 'Focus'}</span>
                    </span>

                    {/* Words rendered with sequential zoom & spotlight */}
                    <span className="text-sm sm:text-lg lg:text-xl font-bold tracking-wide flex flex-wrap items-center justify-center gap-x-1.5 sm:gap-x-2 gap-y-0.5 sm:gap-y-1">
                      <span className="text-amber-400/50 select-none">“</span>
                      {words.map((word, wIdx) => {
                        const isActive = wIdx === activeWordIndex && !isHoldingSentence;
                        const isRead = wIdx < activeWordIndex || isHoldingSentence;

                        return (
                          <motion.span
                            key={`${currentQuote.id}-word-${wIdx}`}
                            animate={
                              isActive
                                ? { scale: [1, 1.24, 1.18], y: -2 }
                                : isHoldingSentence
                                ? { scale: 1, y: 0 }
                                : { scale: 1, y: 0 }
                            }
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className={`inline-block transition-all duration-200 ${
                              isActive
                                ? 'text-amber-300 font-black drop-shadow-[0_0_18px_rgba(245,158,11,0.95)] z-10 px-0.5'
                                : isRead
                                ? 'text-white font-extrabold opacity-95'
                                : 'text-slate-500 font-semibold opacity-40'
                            }`}
                          >
                            {word}
                          </motion.span>
                        );
                      })}
                      <span className="text-amber-400/50 select-none">”</span>
                    </span>

                    {/* Author / Note */}
                    {currentQuote.author && (
                      <span className="text-xs sm:text-sm font-semibold text-slate-300 font-sans shrink-0">
                        &bull; {currentQuote.author}
                      </span>
                    )}
                  </div>
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1.5 sm:p-2.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-amber-500/15 border border-white/[0.08] hover:border-amber-500/30 transition shrink-0 cursor-pointer active:scale-95"
                  title="Next Quote"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ) : (
              /* 2. CONTINUOUS MOVING TICKER (Ultra-smooth, easily readable drift) */
              <div
                className="flex-1 overflow-hidden relative ticker-mask cursor-pointer py-1 select-none w-full"
                onClick={() => setIsModalOpen(true)}
                title="Click to edit quotes • Hover to pause"
              >
                <div
                  className={`${marqueeClass} ${isPaused ? '' : 'pause-on-hover'} flex items-center`}
                  style={{
                    animationPlayState: isPaused ? 'paused' : undefined,
                  }}
                >
                  {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((q, idx) => {
                    const quoteColor = q.color || '#F59E0B';
                    return (
                      <div
                        key={`${q.id}-${idx}`}
                        className="flex items-center gap-3 sm:gap-4 px-8 sm:px-16 shrink-0 group/item transition-colors hover:text-white"
                      >
                        <span
                          className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm shrink-0"
                          style={{
                            backgroundColor: `${quoteColor}25`,
                            color: quoteColor,
                            border: `1px solid ${quoteColor}50`,
                          }}
                        >
                          {renderIcon(q.icon, quoteColor)}
                          {q.category || 'Focus'}
                        </span>

                        <span className="text-sm sm:text-lg lg:text-xl font-extrabold text-white group-hover/item:text-amber-200 transition-colors tracking-wide drop-shadow-md">
                          "{q.text}"
                        </span>

                        {q.author && (
                          <span className="text-xs sm:text-sm font-semibold text-slate-300 font-sans shrink-0">
                            &bull; {q.author}
                          </span>
                        )}

                        <span className="text-amber-400/70 font-black text-xs sm:text-base ml-4 sm:ml-6 select-none">
                          ✦
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar: Neatly stacked on mobile, right-aligned on desktop */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#070B16]/95 sm:bg-[#090E1C]/95 border-t sm:border-t-0 sm:border-l border-white/[0.08] sm:border-white/[0.10] shrink-0 z-20 w-full sm:w-auto">
            {/* Mode Switcher: Focus vs Moving */}
            <div className="flex items-center bg-white/[0.04] p-0.5 rounded-xl border border-white/[0.08]">
              <button
                type="button"
                onClick={() => handleToggleMode('zoom')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition ${
                  displayMode === 'zoom'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Word-by-word Focus reading (Stress-free sequential focus)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Focus</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleMode('moving')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition ${
                  displayMode === 'moving'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Moving mode (Smooth scrolling marquee)"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Moving</span>
              </button>
            </div>

            {/* Speed Selector (0.25x, 0.50x, 0.75x, 1.00x) */}
            <button
              type="button"
              onClick={cycleSpeed}
              className="px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-mono font-bold text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition flex items-center gap-1 active:scale-95 cursor-pointer"
              title={`Speed: ${speed} (Click to change: 0.25x ➔ 0.50x ➔ 0.75x ➔ 1.00x)`}
            >
              <FastForward className="w-3 h-3 text-amber-400" />
              <span>{speed}</span>
            </button>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] transition active:scale-95"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Edit / Manage Quotes Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500/25 to-orange-500/25 hover:from-amber-500/40 hover:to-orange-500/40 text-amber-300 font-extrabold text-xs sm:text-sm border border-amber-500/50 shadow-sm hover:scale-[1.02] active:scale-98 transition cursor-pointer"
              title="Edit & Manage Quotes"
            >
              <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Edit Quotes</span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/35 text-[10px] sm:text-xs font-mono font-bold text-amber-200">
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
