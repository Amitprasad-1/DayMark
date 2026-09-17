'use client';

import React from 'react';
import { VintageAlarmClock } from './VintageAlarmClock';

export interface MiniHudViewProps {
  timerStatus: 'IDLE' | 'RUNNING' | 'PAUSED';
  timerMode: 'POMODORO' | 'STOPWATCH' | 'COUNTDOWN';
  formattedTime: string;
  activityLabel: string;
  progressFraction: number;
  totalSeconds: number;
  totalPhaseSeconds?: number;
  selectedPomodoroPhase?: 'work' | 'shortBreak' | 'longBreak';
  todayFocusMinutes: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onFocusApp: () => void;
}

export const MiniHudView: React.FC<MiniHudViewProps> = ({
  timerStatus,
  timerMode,
  formattedTime,
  activityLabel,
  progressFraction,
  totalSeconds,
  totalPhaseSeconds = 25 * 60,
  selectedPomodoroPhase = 'work',
  todayFocusMinutes,
  onPause,
  onResume,
  onStop,
  onFocusApp,
}) => {
  const isRunning = timerStatus === 'RUNNING';

  return (
    <div className="mini-hud-root">
      {/* Top Bar: Live REC Beacon, Equalizer & Activity Tag */}
      <div className="hud-header">
        <div className="hud-header-left">
          {/* Glowing REC Dot */}
          <div className="hud-beacon-wrap">
            {isRunning && <div className="hud-beacon-ping" />}
            <div className={`hud-beacon-dot ${isRunning ? 'is-running' : 'is-paused'}`} />
          </div>

          <span className="hud-rec-tag">{isRunning ? 'REC' : 'PAUSED'}</span>

          {/* Equalizer Visualizer */}
          <div className={`hud-eq-wrap ${isRunning ? 'is-active' : ''}`}>
            <span className="hud-eq-bar bar-1" />
            <span className="hud-eq-bar bar-2" />
            <span className="hud-eq-bar bar-3" />
            <span className="hud-eq-bar bar-4" />
          </div>

          {/* Activity Name */}
          <span className="hud-activity" title={activityLabel}>
            {activityLabel}
          </span>
        </div>

        {/* Mode Tag */}
        <span className="hud-mode-pill">{timerMode}</span>
      </div>

      {/* Center Section: Exact Vintage Alarm Clock Replica + Big Atomic Digits */}
      <div className="hud-body">
        {/* Exact same Horology Watch Face in miniature with real-time sync */}
        <div className="hud-radar-wrap">
          <VintageAlarmClock
            timerStatus={timerStatus}
            timerMode={timerMode}
            displaySeconds={totalSeconds}
            totalPhaseSeconds={totalPhaseSeconds}
            progressFraction={progressFraction}
            selectedPomodoroPhase={selectedPomodoroPhase}
            isMini={true}
          />
        </div>

        {/* Digital Time & Subtitle */}
        <div className="hud-time-column">
          <div className="hud-digits">{formattedTime}</div>
          <div className="hud-time-sub">
            <span className={`hud-status-indicator ${isRunning ? 'is-flow' : 'is-paused'}`}>
              {isRunning ? 'FLOW STATE' : 'PAUSED'}
            </span>
            <span className="hud-dot-sep">•</span>
            <span>Today: {todayFocusMinutes}m</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls Row: Play/Pause, Stop, Focus App */}
      <div className="hud-controls">
        {isRunning ? (
          <button type="button" onClick={onPause} className="hud-btn hud-btn-pause" title="Pause Timer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
            <span>Pause</span>
          </button>
        ) : (
          <button type="button" onClick={onResume} className="hud-btn hud-btn-resume" title="Resume Timer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>Resume</span>
          </button>
        )}

        <button type="button" onClick={onStop} className="hud-btn hud-btn-stop" title="Stop & Log Session">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
          <span>Stop</span>
        </button>

        <button type="button" onClick={onFocusApp} className="hud-btn hud-btn-app" title="Switch to Main DayMark Window">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          <span>DayMark</span>
        </button>
      </div>
    </div>
  );
};

export const MINI_HUD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;800&family=JetBrains+Mono:wght@700;800;900&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    user-select: none;
  }
  html, body {
    background-color: #060913;
    color: #F8FAFC;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }
  .mini-hud-root {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
    width: 100vw;
    padding: 8px 12px;
    background: radial-gradient(circle at 50% 0%, #151D33 0%, #060913 75%);
    border: 2px solid rgba(239, 68, 68, 0.7);
    box-shadow: inset 0 0 35px rgba(239, 68, 68, 0.2), 0 0 20px rgba(0, 0, 0, 0.8);
  }

  /* Header */
  .hud-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
  }
  .hud-header-left {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    flex: 1;
  }
  .hud-beacon-wrap {
    position: relative;
    width: 10px;
    height: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .hud-beacon-ping {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #EF4444;
    opacity: 0.75;
    animation: hudPing 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
  .hud-beacon-dot {
    position: relative;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .hud-beacon-dot.is-running {
    background-color: #EF4444;
    box-shadow: 0 0 10px #EF4444, 0 0 4px #FFFFFF;
  }
  .hud-beacon-dot.is-paused {
    background-color: #F59E0B;
    box-shadow: 0 0 8px #F59E0B;
  }
  .hud-rec-tag {
    font-size: 9px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 900;
    letter-spacing: 1px;
    color: #FCA5A5;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.4);
    padding: 1px 4px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  /* Equalizer Animation */
  .hud-eq-wrap {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 10px;
    flex-shrink: 0;
  }
  .hud-eq-bar {
    width: 2px;
    height: 3px;
    background-color: #EF4444;
    border-radius: 1px;
    opacity: 0.5;
  }
  .hud-eq-wrap.is-active .bar-1 { animation: hudEq 0.8s ease-in-out infinite alternate; }
  .hud-eq-wrap.is-active .bar-2 { animation: hudEq 0.6s ease-in-out 0.2s infinite alternate; }
  .hud-eq-wrap.is-active .bar-3 { animation: hudEq 0.9s ease-in-out 0.4s infinite alternate; }
  .hud-eq-wrap.is-active .bar-4 { animation: hudEq 0.7s ease-in-out 0.1s infinite alternate; }

  .hud-activity {
    font-size: 11px;
    font-weight: 700;
    color: #E2E8F0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hud-mode-pill {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.5px;
    color: #94A3B8;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1px 6px;
    border-radius: 6px;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  /* Body: Exact Vintage Horology Clock + Big Atomic Digits */
  .hud-body {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 2px 0;
    min-height: 84px;
  }
  .hud-radar-wrap {
    position: relative;
    width: 84px;
    height: 84px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
  }
  .hud-radar-wrap svg {
    display: block;
    width: 84px;
    height: 84px;
    overflow: visible;
  }
  .hud-time-column {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    flex: 1;
  }
  .hud-digits {
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 34px;
    font-weight: 900;
    line-height: 1;
    color: #FFFFFF;
    letter-spacing: 1.5px;
    text-shadow: 0 0 16px rgba(239, 68, 68, 0.75), 0 2px 4px rgba(0, 0, 0, 0.9);
  }
  .hud-time-sub {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: #94A3B8;
    margin-top: 4px;
    font-weight: 600;
  }
  .hud-status-indicator.is-flow {
    color: #34D399;
    font-weight: 800;
    letter-spacing: 0.5px;
  }
  .hud-status-indicator.is-paused {
    color: #FBBF24;
    font-weight: 800;
    letter-spacing: 0.5px;
  }
  .hud-dot-sep {
    opacity: 0.4;
  }

  /* Controls */
  .hud-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
  }
  .hud-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.15s ease;
    border: 1px solid transparent;
    flex: 1;
  }
  .hud-btn-pause {
    background: rgba(245, 158, 11, 0.2);
    border-color: rgba(245, 158, 11, 0.4);
    color: #FDE68A;
  }
  .hud-btn-pause:hover {
    background: rgba(245, 158, 11, 0.35);
  }
  .hud-btn-resume {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.5);
    color: #FCA5A5;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
  }
  .hud-btn-resume:hover {
    background: rgba(239, 68, 68, 0.4);
  }
  .hud-btn-stop {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    color: #F87171;
  }
  .hud-btn-stop:hover {
    background: rgba(239, 68, 68, 0.3);
    color: #FFFFFF;
  }
  .hud-btn-app {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
    color: #CBD5E1;
  }
  .hud-btn-app:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #FFFFFF;
  }

  @keyframes hudPing {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }
  @keyframes hudEq {
    0% { height: 2px; opacity: 0.4; }
    100% { height: 10px; opacity: 1; }
  }
`;
