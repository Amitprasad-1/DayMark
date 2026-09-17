'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Square, Maximize2, ExternalLink, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { MiniHudView, MINI_HUD_STYLES } from './MiniHudView';

export const FocusRecordingBeacon: React.FC = () => {
  const {
    timerStatus,
    timerMode,
    timerSecondsRemaining,
    stopwatchElapsed,
    activeActivityId,
    activities,
    pauseTimer,
    startTimer,
    resetTimer,
    setActiveTab,
    sessions,
    settings,
  } = useApp();

  const [hasPipSupport, setHasPipSupport] = useState(false);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
      setHasPipSupport(true);
    }
  }, []);

  // Cleanup PiP window if focus beacon unmounts
  useEffect(() => {
    return () => {
      if (pipWindow && !pipWindow.closed) {
        pipWindow.close();
      }
    };
  }, [pipWindow]);

  if (timerStatus !== 'RUNNING' && timerStatus !== 'PAUSED') {
    return null;
  }

  const currentActivity = activities.find((a) => a.id === activeActivityId);
  const activityLabel = currentActivity ? currentActivity.name : 'Deep Focus Session';

  const totalSeconds = timerMode === 'STOPWATCH' ? stopwatchElapsed : timerSecondsRemaining;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedTime =
    hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Today's total focus minutes calculation
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const todayFocusMinutes = Math.round(
    todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
  );

  // Progress fraction for gauge
  const progressFraction =
    timerMode === 'POMODORO'
      ? settings.workIntervalMinutes > 0
        ? 1 - timerSecondsRemaining / (settings.workIntervalMinutes * 60)
        : 0
      : (totalSeconds % 60) / 60;

  const openPictureInPicture = async () => {
    if (typeof window === 'undefined') return;

    // If PiP window is already active, bring it to front
    if (pipWindow && !pipWindow.closed) {
      pipWindow.focus();
      return;
    }

    try {
      const pipApi = (window as unknown as {
        documentPictureInPicture?: {
          requestWindow: (opts: { width: number; height: number }) => Promise<Window>;
        };
      }).documentPictureInPicture;

      if (pipApi) {
        const pipWin = await pipApi.requestWindow({
          width: 380,
          height: 180,
        });

        pipWin.document.title = `DayMark — Mini HUD [${activityLabel}]`;

        // Inject high-precision cyber styling
        const styleEl = pipWin.document.createElement('style');
        styleEl.textContent = MINI_HUD_STYLES;
        pipWin.document.head.appendChild(styleEl);

        pipWin.addEventListener('pagehide', () => {
          setPipWindow(null);
        });

        setPipWindow(pipWin);
      }
    } catch (e) {
      console.warn('PiP activation notice:', e);
    }
  };

  return (
    <>
      <AnimatePresence>
      <motion.aside
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 220 }}
        className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-[#070B16]/95 backdrop-blur-2xl border-t border-red-500/50 shadow-[0_-8px_35px_rgba(239,68,68,0.45),0_-1px_10px_rgba(239,68,68,0.8)] px-4 sm:px-6 py-2.5"
        role="region"
        aria-label="Active Focus Session Beacon"
      >
        <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-4">
          {/* Left: Glowing Red Pulse + Mode Label + Target Track */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Glowing Red REC Beacon */}
            <div className="relative flex h-3.5 w-3.5 items-center justify-center shrink-0">
              {timerStatus === 'RUNNING' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-85" />
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  timerStatus === 'RUNNING'
                    ? 'bg-red-500 shadow-[0_0_14px_rgba(239,68,68,1)]'
                    : 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                }`}
              />
            </div>

            {/* REC Badge */}
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-red-500/20 border border-red-500/40 text-red-300 text-[11px] font-mono font-black tracking-widest uppercase shadow-[0_0_10px_rgba(239,68,68,0.3)]">
              {timerStatus === 'RUNNING' ? 'REC' : 'PAUSED'}
            </span>

            {/* Target Activity Tag */}
            <div className="min-w-0 flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden lg:inline font-medium">Tracking:</span>
              <span className="font-bold text-sm text-white truncate max-w-[180px] sm:max-w-[280px] md:max-w-md flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="truncate">{activityLabel}</span>
              </span>
            </div>
          </div>

          {/* Center: Glowing Red Live Digital Time Display */}
          <div className="flex items-center gap-2 font-mono">
            <span className="text-red-100 font-black text-xl sm:text-2xl tracking-wider drop-shadow-[0_0_14px_rgba(239,68,68,0.8)]">
              {formattedTime}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-red-400/80 hidden sm:inline">
              {timerMode}
            </span>
          </div>

          {/* Right: Quick Actions (Pause/Resume, Stop, PiP, Expand) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* PiP Button (if supported) */}
            {hasPipSupport && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={openPictureInPicture}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all"
                title="Always-on-top Floating Mini Focus Widget"
              >
                <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden xl:inline">Mini HUD</span>
              </motion.button>
            )}

            {/* Pause / Resume Button */}
            {timerStatus === 'RUNNING' ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={pauseTimer}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold cursor-pointer transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                title="Pause Focus Session"
              >
                <Pause className="w-3.5 h-3.5 fill-amber-300" />
                <span className="hidden sm:inline">Pause</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={startTimer}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/25 hover:bg-red-500/35 border border-red-500/50 text-red-300 text-xs font-bold cursor-pointer transition-all shadow-[0_0_12px_rgba(239,68,68,0.35)]"
                title="Resume Focus Session"
              >
                <Play className="w-3.5 h-3.5 fill-red-300" />
                <span className="hidden sm:inline">Resume</span>
              </motion.button>
            )}

            {/* Stop & Reset Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={resetTimer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/45 border border-red-500/50 text-red-200 text-xs font-bold cursor-pointer transition-all shadow-[0_0_12px_rgba(239,68,68,0.3)]"
              title="Stop and Reset Clock"
            >
              <Square className="w-3.5 h-3.5 fill-red-300" />
              <span className="hidden sm:inline">Stop</span>
            </motion.button>

            {/* Go to Timer Screen Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setActiveTab('timer')}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white cursor-pointer transition-all"
              title="Open Full Focus Timer Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>

    {/* Fully Synchronized Live Reactive Mini HUD inside Picture-in-Picture Window */}
    {pipWindow &&
      pipWindow.document &&
      pipWindow.document.body &&
      createPortal(
        <MiniHudView
          timerStatus={timerStatus}
          timerMode={timerMode}
          formattedTime={formattedTime}
          activityLabel={activityLabel}
          progressFraction={progressFraction}
          totalSeconds={totalSeconds}
          todayFocusMinutes={todayFocusMinutes}
          onPause={pauseTimer}
          onResume={startTimer}
          onStop={resetTimer}
          onFocusApp={() => {
            window.focus();
            if (pipWindow && !pipWindow.closed) {
              pipWindow.focus();
            }
          }}
        />,
        pipWindow.document.body
      )}
    </>
  );
};
