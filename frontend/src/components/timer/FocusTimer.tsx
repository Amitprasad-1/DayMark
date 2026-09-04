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

  const circleRadius = 136;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - progressFraction * circumference;

  // Exact comet head position on circumference (starts at 12 o'clock = -PI/2)
  const headAngle = -Math.PI / 2 + 2 * Math.PI * progressFraction;
  const headX = 180 + circleRadius * Math.cos(headAngle);
  const headY = 180 + circleRadius * Math.sin(headAngle);

  // Real-time second beacon on outer orbit (rotates every 60s)
  const secondFraction = (displaySeconds % 60) / 60;
  const secAngle = -Math.PI / 2 + 2 * Math.PI * (1 - secondFraction);
  const secOrbitRadius = 160;
  const secX = 180 + secOrbitRadius * Math.cos(secAngle);
  const secY = 180 + secOrbitRadius * Math.sin(secAngle);

  // Dynamic theme colors by phase
  const getPhaseTheme = () => {
    if (selectedPomodoroPhase === 'shortBreak') {
      return {
        gradId: 'shortBreakGrad',
        c1: '#10B981',
        c2: '#06B6D4',
        c3: '#34D399',
        glow: 'rgba(16, 185, 129, 0.45)',
        textAccent: 'text-emerald-400',
      };
    }
    if (selectedPomodoroPhase === 'longBreak') {
      return {
        gradId: 'longBreakGrad',
        c1: '#6366F1',
        c2: '#A855F7',
        c3: '#EC4899',
        glow: 'rgba(99, 102, 241, 0.45)',
        textAccent: 'text-indigo-400',
      };
    }
    return {
      gradId: 'workGrad',
      c1: '#F59E0B',
      c2: '#FB923C',
      c3: '#FBBF24',
      glow: 'rgba(245, 158, 11, 0.5)',
      textAccent: 'text-amber-400',
    };
  };

  const theme = getPhaseTheme();

  // 60 radial chronometer tick markers
  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const angle = (i * 6 - 90) * (Math.PI / 180);
    const isMajor = i % 5 === 0;
    const len = isMajor ? 8 : 4;
    const outerR = 150;
    const innerR = outerR - len;
    const x1 = 180 + innerR * Math.cos(angle);
    const y1 = 180 + innerR * Math.sin(angle);
    const x2 = 180 + outerR * Math.cos(angle);
    const y2 = 180 + outerR * Math.sin(angle);
    const tickFraction = i / 60;
    const isLit = tickFraction <= progressFraction;
    return { x1, y1, x2, y2, isMajor, isLit, i };
  });

  // Crackling spark rays shooting outward from the burning tip
  const sparkRays = [
    { dx: 14, dy: -12, len: 14, width: 2, color: '#FFF' },
    { dx: -12, dy: -16, len: 16, width: 1.5, color: '#FEF08A' },
    { dx: 18, dy: 6, len: 18, width: 2.2, color: '#FDE047' },
    { dx: -16, dy: 10, len: 15, width: 1.5, color: '#F59E0B' },
    { dx: 6, dy: 18, len: 16, width: 2, color: '#FFF' },
    { dx: 12, dy: 14, len: 14, width: 1.8, color: '#FEF08A' },
    { dx: -14, dy: -8, len: 12, width: 1.5, color: '#FB923C' },
    { dx: 8, dy: -18, len: 16, width: 2, color: '#FDE047' },
  ];

  // Floating spark embers trailing off the active progress line
  const sparkEmbers = [
    { angleOffset: -0.05, driftR: 12, size: 3, duration: 0.8, delay: 0 },
    { angleOffset: -0.11, driftR: 18, size: 2.5, duration: 1.1, delay: 0.2 },
    { angleOffset: -0.18, driftR: 15, size: 2, duration: 0.9, delay: 0.4 },
    { angleOffset: -0.08, driftR: 22, size: 2.8, duration: 0.75, delay: 0.1 },
    { angleOffset: -0.15, driftR: 10, size: 3.2, duration: 1.0, delay: 0.3 },
    { angleOffset: -0.22, driftR: 19, size: 2.2, duration: 0.85, delay: 0.5 },
  ];

  // Points along active arc that twinkle with sparkling starlets
  const lineSparkles = Array.from({ length: 6 }).map((_, i) => {
    const f = progressFraction * (0.2 + i * 0.15);
    const ang = -Math.PI / 2 + 2 * Math.PI * f;
    const x = 180 + circleRadius * Math.cos(ang);
    const y = 180 + circleRadius * Math.sin(ang);
    return { x, y, visible: progressFraction > 0.05, delay: i * 0.25 };
  });

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
        <div className="relative flex items-center justify-center z-10 my-4 select-none">
          <svg
            viewBox="0 0 360 360"
            className="w-72 h-72 sm:w-84 sm:h-84 md:w-[410px] md:h-[410px] overflow-visible drop-shadow-[0_0_35px_rgba(0,0,0,0.9)]"
          >
            <defs>
              {/* Dynamic Theme Gradients */}
              <linearGradient id={theme.gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.c1} />
                <stop offset="50%" stopColor={theme.c2} />
                <stop offset="100%" stopColor={theme.c3} />
              </linearGradient>

              {/* Electric Spark Lightning Gradient */}
              <linearGradient id="electricSparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="25%" stopColor="#FEF08A" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
              </linearGradient>

              {/* Volumetric Bloom Filter */}
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* High-intensity Spark Bloom Filter */}
              <filter id="sparkBloom" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="beadGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. Outer Constellation Orbit Ring (rotates slowly) */}
            <motion.circle
              cx="180"
              cy="180"
              r={secOrbitRadius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth="1"
              strokeDasharray="3 7"
              animate={{ rotate: 360 }}
              transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
              style={{ originX: '180px', originY: '180px' }}
            />

            {/* 2. Active Pulsating Breathing Rings (when running) */}
            {timerStatus === 'RUNNING' && (
              <>
                <motion.circle
                  cx="180"
                  cy="180"
                  r={circleRadius}
                  fill="none"
                  stroke={theme.c1}
                  strokeWidth="2"
                  animate={{
                    r: [circleRadius, circleRadius + 15, circleRadius],
                    opacity: [0.4, 0, 0.4],
                  }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.circle
                  cx="180"
                  cy="180"
                  r={circleRadius - 10}
                  fill="none"
                  stroke={theme.c2}
                  strokeWidth="1.5"
                  animate={{
                    r: [circleRadius - 10, circleRadius - 20, circleRadius - 10],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                />
              </>
            )}

            {/* 3. 60 Precision Chronometer Dial Ticks */}
            {ticks.map((t) => (
              <line
                key={t.i}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={
                  t.isLit
                    ? theme.c1
                    : t.isMajor
                    ? 'rgba(255, 255, 255, 0.28)'
                    : 'rgba(255, 255, 255, 0.08)'
                }
                strokeWidth={t.isMajor ? (t.isLit ? 2.5 : 2) : 1}
                strokeLinecap="round"
                className="transition-colors duration-300"
              />
            ))}

            {/* 4. Underlying Dark Track Ring */}
            <circle
              cx="180"
              cy="180"
              r={circleRadius}
              fill="none"
              stroke="rgba(15, 23, 42, 0.9)"
              strokeWidth="12"
            />
            <circle
              cx="180"
              cy="180"
              r={circleRadius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="12"
            />

            {/* 5. Animated Luminous Progress Arc */}
            <circle
              cx="180"
              cy="180"
              r={circleRadius}
              fill="none"
              stroke={`url(#${theme.gradId})`}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 180 180)"
              filter="url(#neonGlow)"
              className="transition-all duration-700 ease-out"
            />

            {/* 5b. Electric Spark Pulse streaming continuously along the active progress line */}
            {timerStatus === 'RUNNING' && progressFraction > 0.01 && (
              <motion.circle
                cx="180"
                cy="180"
                r={circleRadius}
                fill="none"
                stroke="url(#electricSparkGrad)"
                strokeWidth="5"
                strokeDasharray="50 250"
                strokeLinecap="round"
                transform="rotate(-90 180 180)"
                animate={{
                  strokeDashoffset: [0, -circumference],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                filter="url(#sparkBloom)"
              />
            )}

            {/* 5c. Twinkling Starlet Sparkles along the progress arc */}
            {timerStatus === 'RUNNING' &&
              lineSparkles.map(
                (sp, idx) =>
                  sp.visible && (
                    <motion.g
                      key={`sparkle-${idx}`}
                      transform={`translate(${sp.x}, ${sp.y})`}
                      animate={{
                        scale: [0, 1.3, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 90],
                      }}
                      transition={{
                        duration: 1.1,
                        repeat: Infinity,
                        delay: sp.delay,
                        ease: 'easeInOut',
                      }}
                    >
                      <path
                        d="M 0,-4 Q 0,0 4,0 Q 0,0 0,4 Q 0,0 -4,0 Q 0,0 0,-4 Z"
                        fill="#FFFFFF"
                        filter="url(#sparkBloom)"
                      />
                    </motion.g>
                  )
              )}

            {/* 6. Active Spark Head & Floating Embers */}
            {progressFraction > 0 && (
              <g>
                {/* A. Floating Embers Flying Off the Tip */}
                {timerStatus === 'RUNNING' &&
                  sparkEmbers.map((ember, i) => {
                    const ang = headAngle + ember.angleOffset;
                    const baseX = 180 + circleRadius * Math.cos(ang);
                    const baseY = 180 + circleRadius * Math.sin(ang);
                    const targetX = 180 + (circleRadius + ember.driftR) * Math.cos(ang);
                    const targetY = 180 + (circleRadius + ember.driftR) * Math.sin(ang);

                    return (
                      <motion.circle
                        key={`ember-${i}`}
                        cx={baseX}
                        cy={baseY}
                        r={ember.size}
                        fill="#FEF08A"
                        animate={{
                          cx: [baseX, targetX],
                          cy: [baseY, targetY],
                          opacity: [1, 0],
                          scale: [1.3, 0.2],
                        }}
                        transition={{
                          duration: ember.duration,
                          repeat: Infinity,
                          delay: ember.delay,
                          ease: 'easeOut',
                        }}
                        filter="url(#sparkBloom)"
                      />
                    );
                  })}

                {/* B. Crackling Jittering Spark Rays at the Tip */}
                {timerStatus === 'RUNNING' &&
                  sparkRays.map((ray, idx) => (
                    <motion.line
                      key={`ray-${idx}`}
                      x1={headX}
                      y1={headY}
                      x2={headX + ray.dx}
                      y2={headY + ray.dy}
                      stroke={ray.color}
                      strokeWidth={ray.width}
                      strokeLinecap="round"
                      animate={{
                        x2: [headX, headX + ray.dx * 1.6, headX + ray.dx],
                        y2: [headY, headY + ray.dy * 1.6, headY + ray.dy],
                        opacity: [0.2, 1, 0.1],
                      }}
                      transition={{
                        duration: 0.22 + (idx % 4) * 0.08,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                      filter="url(#sparkBloom)"
                    />
                  ))}

                {/* C. Rotating 4-Point Star Spark at the Core */}
                <motion.g
                  transform={`translate(${headX}, ${headY})`}
                  animate={{
                    rotate: [0, 180, 360],
                    scale: timerStatus === 'RUNNING' ? [0.9, 1.4, 0.9] : 1,
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                >
                  <path
                    d="M 0,-8 Q 0,0 8,0 Q 0,0 0,8 Q 0,0 -8,0 Q 0,0 0,-8 Z"
                    fill="#FFFFFF"
                    filter="url(#sparkBloom)"
                  />
                  <path
                    d="M 0,-5 Q 0,0 5,0 Q 0,0 0,5 Q 0,0 -5,0 Q 0,0 0,-5 Z"
                    fill="#FEF08A"
                  />
                </motion.g>

                {/* D. Expanding Sonar Ping Wave */}
                {timerStatus === 'RUNNING' && (
                  <motion.circle
                    cx={headX}
                    cy={headY}
                    fill="none"
                    stroke="#FEF08A"
                    strokeWidth="1.5"
                    animate={{ r: [6, 20], opacity: [0.9, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}

                {/* E. Solid Center Bead */}
                <circle
                  cx={headX}
                  cy={headY}
                  r="6.5"
                  fill="#FFFFFF"
                  stroke={theme.c1}
                  strokeWidth="2.5"
                  className="shadow-[0_0_15px_#FFFFFF]"
                />
              </g>
            )}

            {/* 7. Real-Time 60-Second Orbit Satellite Bead */}
            {timerStatus === 'RUNNING' && (
              <g>
                <circle
                  cx={secX}
                  cy={secY}
                  r="3.5"
                  fill="#38BDF8"
                  className="shadow-[0_0_10px_#38BDF8]"
                />
                <motion.circle
                  cx={secX}
                  cy={secY}
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="1"
                  animate={{ r: [3.5, 9], opacity: [0.8, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
                />
              </g>
            )}
          </svg>

          {/* Large Digital Digits inside dial */}
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
            <motion.div
              animate={
                timerStatus === 'RUNNING'
                  ? { scale: [1, 1.018, 1], filter: ['brightness(1)', 'brightness(1.12)', 'brightness(1)'] }
                  : { scale: 1, filter: 'brightness(1)' }
              }
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight text-white drop-shadow-[0_12px_28px_rgba(0,0,0,0.95)] select-none"
            >
              {formatSeconds(displaySeconds)}
            </motion.div>

            <div className="mt-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
              {timerStatus === 'RUNNING' ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  <span className="text-emerald-300 font-sans tracking-wider">Active Focus Flow</span>
                </>
              ) : (
                <span className="text-slate-400 font-sans tracking-wider">Ready / Paused</span>
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
              whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(99, 102, 241, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={startTimer}
              className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-base shadow-[0_4px_25px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all cursor-pointer border border-indigo-400/40"
            >
              <Play className="w-5 h-5 fill-white text-white" />
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
