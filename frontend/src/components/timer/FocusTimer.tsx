'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { soundEngine } from '@/lib/audio';
import { TimerMode } from '@/types';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Maximize2,
  Minimize2,
  CheckCircle,
  Sparkles,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FocusTimer: React.FC = () => {
  const {
    timerMode,
    setTimerMode,
    timerStatus,
    timerSecondsRemaining,
    activeActivityId,
    setActiveActivityId,
    activities,
    settings,
    updateSettings,
    selectedPomodoroPhase,
    stopwatchElapsed,
    startTimer,
    pauseTimer,
    resetTimer,
    switchPomodoroPhase,
    finishStopwatch,
  } = useApp();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  const activeActivity = activities.find((a) => a.id === activeActivityId) || activities[0];

  // Helper for formatting time MM:SS
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const displaySeconds = timerMode === 'STOPWATCH' ? stopwatchElapsed : timerSecondsRemaining;

  // Calculate circular progress percentage (0 to 1)
  let totalPhaseSeconds = 25 * 60;
  if (selectedPomodoroPhase === 'work') {
    totalPhaseSeconds = (settings.workIntervalMinutes || 25) * 60;
  } else if (selectedPomodoroPhase === 'shortBreak') {
    totalPhaseSeconds = (settings.shortBreakMinutes || 5) * 60;
  } else if (selectedPomodoroPhase === 'longBreak') {
    totalPhaseSeconds = (settings.longBreakMinutes || 15) * 60;
  }

  const progressFraction =
    timerMode === 'STOPWATCH'
      ? (stopwatchElapsed % 3600) / 3600
      : Math.max(0, Math.min(1, (totalPhaseSeconds - timerSecondsRemaining) / totalPhaseSeconds));

  const circleRadius = 150;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - progressFraction * circumference;

  // Toggle ambient sound engine
  const handleAmbientSoundToggle = (sound: 'none' | 'rain' | 'white-noise' | 'forest' | 'waves') => {
    updateSettings({ ambientSound: sound });
    soundEngine.setAmbientSound(sound);
  };

  return (
    <div className={`space-y-8 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#050811] p-6 lg:p-12 flex flex-col justify-between overflow-y-auto' : ''}`}>
      {/* Top Timer Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel-luxury p-4 lg:p-5 rounded-3xl border border-white/[0.09] shadow-2xl bg-[#090E1C]/80">
        {/* Mode Selector */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-950/80 border border-white/10">
          {(['POMODORO', 'STOPWATCH'] as TimerMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setTimerMode(mode);
                resetTimer();
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                timerMode === mode
                  ? 'text-white font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {timerMode === mode && (
                <motion.div
                  layoutId="timerModePill"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                />
              )}
              <span className="relative z-10">{mode}</span>
            </button>
          ))}
        </div>

        {/* Ambient Soundscape & Fullscreen Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-white/10 shadow-inner">
            <Volume2 className="w-4 h-4 text-amber-400" />
            
            {/* Animated Sound Equalizer Bars when active */}
            {settings.ambientSound !== 'none' && (
              <div className="flex items-end gap-0.5 h-4 px-1">
                <div className="w-1 bg-amber-400 rounded-full animate-wave-1" />
                <div className="w-1 bg-amber-300 rounded-full animate-wave-2" />
                <div className="w-1 bg-amber-500 rounded-full animate-wave-3" />
                <div className="w-1 bg-amber-400 rounded-full animate-wave-4" />
              </div>
            )}

            <select
              value={settings.ambientSound}
              onChange={(e) => handleAmbientSoundToggle(e.target.value as any)}
              className="text-xs bg-transparent text-slate-200 outline-none cursor-pointer font-bold pr-1"
            >
              <option value="none" className="bg-slate-900 text-slate-400">Mute Soundscape</option>
              <option value="rain" className="bg-slate-900 text-white">🌧️ Rain Shower</option>
              <option value="white-noise" className="bg-slate-900 text-white">📻 White Noise</option>
              <option value="forest" className="bg-slate-900 text-white">🌲 Forest Wind</option>
              <option value="waves" className="bg-slate-900 text-white">🌊 Ocean Waves</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-2xl bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white cursor-pointer transition-colors shadow-md"
            title="Toggle Zen Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* CENTERPIECE TIME DISPLAY WITH CIRCULAR PROGRESS GAUGE */}
      <div className="glass-panel-luxury p-8 sm:p-12 lg:p-16 rounded-3xl border border-white/[0.09] flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden shadow-2xl bg-[#090E1C]/80">
        {/* Ambient Glowing Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-amber-500/10 via-indigo-600/15 to-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Pomodoro Phase Switcher */}
        {timerMode === 'POMODORO' && (
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-white/10 shadow-inner relative z-10">
            <button
              type="button"
              onClick={() => switchPomodoroPhase('work')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                selectedPomodoroPhase === 'work' ? 'text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {selectedPomodoroPhase === 'work' && (
                <motion.div
                  layoutId="pomodoroPhasePill"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                />
              )}
              <span className="relative z-10">Focus ({settings.workIntervalMinutes}m)</span>
            </button>

            <button
              type="button"
              onClick={() => switchPomodoroPhase('shortBreak')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                selectedPomodoroPhase === 'shortBreak' ? 'text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {selectedPomodoroPhase === 'shortBreak' && (
                <motion.div
                  layoutId="pomodoroPhasePill"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                />
              )}
              <span className="relative z-10">Short Break ({settings.shortBreakMinutes}m)</span>
            </button>

            <button
              type="button"
              onClick={() => switchPomodoroPhase('longBreak')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                selectedPomodoroPhase === 'longBreak' ? 'text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {selectedPomodoroPhase === 'longBreak' && (
                <motion.div
                  layoutId="pomodoroPhasePill"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                />
              )}
              <span className="relative z-10">Long Break ({settings.longBreakMinutes}m)</span>
            </button>
          </div>
        )}

        {/* Target Activity Selector */}
        <div className="flex items-center gap-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Track:</span>
          <select
            value={activeActivityId}
            onChange={(e) => setActiveActivityId(e.target.value)}
            className="px-4 py-2 text-xs font-black rounded-2xl glass-input bg-slate-900/90 text-indigo-300 border border-white/10 cursor-pointer shadow-md"
          >
            {activities.map((act) => (
              <option key={act.id} value={act.id} className="bg-slate-900 text-white">
                {act.name} ({act.category})
              </option>
            ))}
          </select>
        </div>

        {/* CIRCULAR PROGRESS GAUGE + TIME DISPLAY */}
        <div className="relative flex items-center justify-center z-10 my-4">
          <svg className="w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 -rotate-90 transform drop-shadow-[0_0_25px_rgba(0,0,0,0.8)]">
            {/* Background Track */}
            <circle
              cx="50%"
              cy="50%"
              r={circleRadius}
              className="stroke-slate-900/80"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Luminous Gradient Progress Dial */}
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
            <circle
              cx="50%"
              cy="50%"
              r={circleRadius}
              stroke="url(#timerGradient)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out shadow-2xl"
            />
          </svg>

          {/* Large Digital Digits inside dial */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <motion.div
              animate={timerStatus === 'RUNNING' ? { scale: [1, 1.018, 1] } : { scale: 1 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight text-white drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] select-none"
            >
              {formatSeconds(displaySeconds)}
            </motion.div>

            <div className="mt-3 text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center justify-center gap-2">
              {timerStatus === 'RUNNING' ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  <span className="text-emerald-300">Active Focus Interval</span>
                </>
              ) : (
                <span className="text-slate-400">Ready / Paused</span>
              )}
            </div>
          </div>
        </div>

        {/* Notes Input */}
        <div className="w-full max-w-md relative z-10">
          <input
            type="text"
            placeholder="Add session focus note (e.g. Deep Work on Database specs)..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="w-full px-4 py-3 text-xs text-center rounded-2xl glass-input shadow-inner font-medium"
          />
        </div>

        {/* CONTROLS (START / PAUSE / RESET / SAVE) */}
        <div className="flex items-center gap-4 pt-2 relative z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={resetTimer}
            className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xl"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>

          {timerStatus === 'RUNNING' ? (
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(245, 158, 11, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={pauseTimer}
              className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-base shadow-2xl transition-all cursor-pointer border border-amber-300/40"
            >
              <Pause className="w-5 h-5 fill-slate-950" />
              <span>Pause Focus</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(16, 185, 129, 0.45)' }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={startTimer}
              className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 font-black text-base shadow-2xl transition-all cursor-pointer border border-emerald-300/40"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Start Focus</span>
            </motion.button>
          )}

          {timerMode === 'STOPWATCH' && stopwatchElapsed > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => finishStopwatch(sessionNotes)}
              className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xl cursor-pointer border border-emerald-400/40"
              title="Save Stopwatch Session"
            >
              <CheckCircle className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
