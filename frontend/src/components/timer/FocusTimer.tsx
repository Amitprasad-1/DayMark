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
} from 'lucide-react';

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

  // Toggle ambient sound engine
  const handleAmbientSoundToggle = (sound: 'none' | 'rain' | 'white-noise' | 'forest' | 'waves') => {
    updateSettings({ ambientSound: sound });
    soundEngine.setAmbientSound(sound);
  };

  return (
    <div className={`space-y-8 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#060911] p-8 flex flex-col justify-between overflow-y-auto' : ''}`}>
      {/* Top Timer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 lg:p-5 rounded-3xl border border-white/10 shadow-xl">
        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          {(['POMODORO', 'STOPWATCH'] as TimerMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setTimerMode(mode);
                resetTimer();
              }}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                timerMode === mode
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Ambient Soundscape & Fullscreen */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/5">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={settings.ambientSound}
              onChange={(e) => handleAmbientSoundToggle(e.target.value as any)}
              className="text-xs bg-transparent text-slate-200 outline-none cursor-pointer font-medium"
            >
              <option value="none" className="bg-slate-900">Mute Soundscape</option>
              <option value="rain" className="bg-slate-900">🌧️ Rain Shower</option>
              <option value="white-noise" className="bg-slate-900">📻 White Noise</option>
              <option value="forest" className="bg-slate-900">🌲 Forest Wind</option>
              <option value="waves" className="bg-slate-900">🌊 Ocean Waves</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Toggle Fullscreen Focus"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CENTERPIECE TIME DISPLAY */}
      <div className="glass-panel p-8 lg:p-14 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden shadow-2xl">
        {/* Radiant Ambient Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-tr from-amber-500/10 via-indigo-600/15 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Pomodoro Phase Switcher */}
        {timerMode === 'POMODORO' && (
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/70 border border-white/10 shadow-inner relative z-10">
            <button
              type="button"
              onClick={() => switchPomodoroPhase('work')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedPomodoroPhase === 'work'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Focus ({settings.workIntervalMinutes}m)
            </button>
            <button
              type="button"
              onClick={() => switchPomodoroPhase('shortBreak')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedPomodoroPhase === 'shortBreak'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Short Break ({settings.shortBreakMinutes}m)
            </button>
            <button
              type="button"
              onClick={() => switchPomodoroPhase('longBreak')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedPomodoroPhase === 'longBreak'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Long Break ({settings.longBreakMinutes}m)
            </button>
          </div>
        )}

        {/* Target Activity Selector */}
        <div className="flex items-center gap-2.5 relative z-10">
          <span className="text-xs text-slate-400 font-medium">Activity:</span>
          <select
            value={activeActivityId}
            onChange={(e) => setActiveActivityId(e.target.value)}
            className="px-4 py-2 text-xs font-bold rounded-xl glass-input bg-slate-900/90 text-indigo-300 border border-white/10 cursor-pointer"
          >
            {activities.map((act) => (
              <option key={act.id} value={act.id} className="bg-slate-900 text-white">
                {act.name}
              </option>
            ))}
          </select>
        </div>

        {/* TIME NUMBERS DISPLAY */}
        <div className="relative group z-10">
          <div className="text-6xl sm:text-8xl md:text-9xl font-extrabold font-mono tracking-tight text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] select-none">
            {formatSeconds(displaySeconds)}
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mt-2 flex items-center justify-center gap-2">
            {timerStatus === 'RUNNING' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-300">Active Focus Session</span>
              </>
            ) : (
              <span className="text-slate-400">Ready / Paused</span>
            )}
          </p>
        </div>

        {/* Notes Input */}
        <div className="w-full max-w-md relative z-10">
          <input
            type="text"
            placeholder="Add session focus note (e.g. Deep Work on API specs)..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="w-full px-4 py-3 text-xs text-center rounded-2xl glass-input"
          />
        </div>

        {/* CONTROLS (START / PAUSE / RESET) */}
        <div className="flex items-center gap-4 pt-2 relative z-10">
          <button
            type="button"
            onClick={resetTimer}
            className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-lg"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {timerStatus === 'RUNNING' ? (
            <button
              type="button"
              onClick={pauseTimer}
              className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-base shadow-xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Pause className="w-5 h-5 fill-slate-950" />
              <span>Pause Focus</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startTimer}
              className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 hover:from-emerald-300 hover:to-teal-500 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Start Focus</span>
            </button>
          )}

          {timerMode === 'STOPWATCH' && stopwatchElapsed > 0 && (
            <button
              type="button"
              onClick={() => finishStopwatch(sessionNotes)}
              className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg cursor-pointer"
              title="Save Stopwatch Session"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
