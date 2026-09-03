'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { soundEngine } from '@/lib/audio';
import { TimerMode } from '@/types';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

export const FocusTimer: React.FC = () => {
  const {
    timerMode,
    setTimerMode,
    timerStatus,
    setTimerStatus,
    timerSecondsRemaining,
    setTimerSecondsRemaining,
    activeActivityId,
    setActiveActivityId,
    activities,
    addSession,
    settings,
    updateSettings,
  } = useApp();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPomodoroPhase, setSelectedPomodoroPhase] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [sessionNotes, setSessionNotes] = useState('');
  const [stopwatchElapsed, setStopwatchElapsed] = useState(0);

  const activeActivity = activities.find((a) => a.id === activeActivityId) || activities[0];

  // Configure timer duration when phase/mode changes
  useEffect(() => {
    if (timerMode === 'POMODORO') {
      if (selectedPomodoroPhase === 'work') {
        setTimerSecondsRemaining(settings.workIntervalMinutes * 60);
      } else if (selectedPomodoroPhase === 'shortBreak') {
        setTimerSecondsRemaining(settings.shortBreakMinutes * 60);
      } else {
        setTimerSecondsRemaining(settings.longBreakMinutes * 60);
      }
    }
  }, [selectedPomodoroPhase, timerMode, settings, setTimerSecondsRemaining]);

  // Main Timer Interval Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerStatus === 'RUNNING') {
      interval = setInterval(() => {
        if (timerMode === 'STOPWATCH') {
          setStopwatchElapsed((prev) => prev + 1);
        } else {
          setTimerSecondsRemaining((prev) => {
            if (prev <= 1) {
              handleTimerCompleted();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStatus, timerMode, setTimerSecondsRemaining]);

  const handleTimerCompleted = () => {
    setTimerStatus('IDLE');
    if (settings.soundEnabled) {
      soundEngine.playCompletionChime();
    }
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });

    // Save session automatically if it was a work interval
    if (timerMode === 'POMODORO' && selectedPomodoroPhase === 'work') {
      const duration = settings.workIntervalMinutes * 60;
      const now = new Date();
      addSession({
        activityId: activeActivity.id,
        startTime: new Date(now.getTime() - duration * 1000).toISOString(),
        endTime: now.toISOString(),
        durationSeconds: duration,
        notes: sessionNotes || `Completed ${settings.workIntervalMinutes}m Pomodoro Focus`,
        date: format(now, 'yyyy-MM-dd'),
      });
    }
  };

  const handleStopwatchFinish = () => {
    if (stopwatchElapsed < 10) return;
    setTimerStatus('IDLE');
    if (settings.soundEnabled) soundEngine.playCompletionChime();

    const now = new Date();
    addSession({
      activityId: activeActivity.id,
      startTime: new Date(now.getTime() - stopwatchElapsed * 1000).toISOString(),
      endTime: now.toISOString(),
      durationSeconds: stopwatchElapsed,
      notes: sessionNotes || `Stopwatch focus session (${Math.round(stopwatchElapsed / 60)}m)`,
      date: format(now, 'yyyy-MM-dd'),
    });

    setStopwatchElapsed(0);
    confetti({ particleCount: 60, spread: 70 });
  };

  const handleResetTimer = () => {
    setTimerStatus('IDLE');
    if (timerMode === 'STOPWATCH') {
      setStopwatchElapsed(0);
    } else {
      if (selectedPomodoroPhase === 'work') {
        setTimerSecondsRemaining(settings.workIntervalMinutes * 60);
      } else if (selectedPomodoroPhase === 'shortBreak') {
        setTimerSecondsRemaining(settings.shortBreakMinutes * 60);
      } else {
        setTimerSecondsRemaining(settings.longBreakMinutes * 60);
      }
    }
  };

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
    <div className={`space-y-8 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-8 flex flex-col justify-between overflow-y-auto' : ''}`}>
      {/* Timer Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          {(['POMODORO', 'STOPWATCH'] as TimerMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setTimerMode(mode);
                setTimerStatus('IDLE');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                timerMode === mode
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Ambient Sound Scape Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> Soundscape:
          </span>
          <select
            value={settings.ambientSound}
            onChange={(e) => handleAmbientSoundToggle(e.target.value as any)}
            className="px-3 py-1.5 text-xs rounded-lg glass-input bg-slate-900"
          >
            <option value="none">Mute Ambient</option>
            <option value="rain">🌧️ Rain Shower</option>
            <option value="white-noise">📻 White Noise</option>
            <option value="forest">🌲 Forest Wind</option>
            <option value="waves">🌊 Ocean Waves</option>
          </select>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
            title="Toggle Fullscreen Focus Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CENTERPIECE TIMER DISPLAY */}
      <div className="glass-panel p-8 lg:p-12 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Pomodoro Phase Switcher (if Pomodoro mode) */}
        {timerMode === 'POMODORO' && (
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10">
            <button
              onClick={() => {
                setSelectedPomodoroPhase('work');
                setTimerStatus('IDLE');
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedPomodoroPhase === 'work' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Focus ({settings.workIntervalMinutes}m)
            </button>
            <button
              onClick={() => {
                setSelectedPomodoroPhase('shortBreak');
                setTimerStatus('IDLE');
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedPomodoroPhase === 'shortBreak' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Short Break ({settings.shortBreakMinutes}m)
            </button>
            <button
              onClick={() => {
                setSelectedPomodoroPhase('longBreak');
                setTimerStatus('IDLE');
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedPomodoroPhase === 'longBreak' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Long Break ({settings.longBreakMinutes}m)
            </button>
          </div>
        )}

        {/* Target Activity Chip Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Target Activity:</span>
          <select
            value={activeActivityId}
            onChange={(e) => setActiveActivityId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl glass-input bg-slate-900 text-indigo-300"
          >
            {activities.map((act) => (
              <option key={act.id} value={act.id}>
                {act.name}
              </option>
            ))}
          </select>
        </div>

        {/* GIANT TIME DISPLAY */}
        <div className="relative group">
          <div className="text-6xl sm:text-8xl md:text-9xl font-bold font-mono tracking-tight text-white drop-shadow-2xl">
            {formatSeconds(displaySeconds)}
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-400 mt-2">
            {timerStatus === 'RUNNING' ? '🔥 Focus Session Active' : 'Paused / Ready'}
          </p>
        </div>

        {/* Optional Notes Input */}
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="Add session task note (e.g., Coding DayMark Timer UI)..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="w-full px-4 py-2.5 text-xs text-center rounded-xl glass-input"
          />
        </div>

        {/* PLAY / PAUSE / RESET ACTION BUTTONS */}
        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={handleResetTimer}
            className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {timerStatus === 'RUNNING' ? (
            <button
              onClick={() => setTimerStatus('PAUSED')}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <Pause className="w-6 h-6 fill-slate-950" />
              <span>Pause Focus</span>
            </button>
          ) : (
            <button
              onClick={() => setTimerStatus('RUNNING')}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>Start Focus</span>
            </button>
          )}

          {timerMode === 'STOPWATCH' && stopwatchElapsed > 0 && (
            <button
              onClick={handleStopwatchFinish}
              className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md"
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
