'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Circle, Palette } from 'lucide-react';

interface VintageAlarmClockProps {
  timerStatus: 'IDLE' | 'RUNNING' | 'PAUSED';
  timerMode: 'POMODORO' | 'STOPWATCH' | 'COUNTDOWN';
  displaySeconds: number;
  totalPhaseSeconds: number;
  progressFraction: number;
  selectedPomodoroPhase: 'work' | 'shortBreak' | 'longBreak';
  theme: {
    c1: string;
    c2: string;
    c3: string;
    glow: string;
    textAccent: string;
  };
  isZen?: boolean;
}

export type HandStyle = 'vintageSpade' | 'modernStudio';
export type ClockFrameStyle = 'round' | 'twinBell';
export type LuxuryFinish = 'noirChrome' | 'royalGold' | 'midnightSapphire' | 'racingEmerald';
export type HandColorPreset = 'auto' | 'goldCyan' | 'emeraldGold' | 'rubyAmber' | 'sapphireCoral';

interface FinishPalette {
  id: LuxuryFinish;
  label: string;
  icon: string;
  glow: string;
  accent: string;
  accentGrad1: string;
  accentGrad2: string;
  accentGrad3: string;
  caseGrad1: string;
  caseGrad2: string;
  caseGrad3: string;
  dialGrad1: string;
  dialGrad2: string;
  bezelTrim1: string;
  bezelTrim2: string;
  // Distinct, non-white, richly saturated dual-tone colors
  hourHandLight: string;
  hourHandMid: string;
  hourHandDark: string;
  hourSpine: string;
  minuteHandLight: string;
  minuteHandMid: string;
  minuteHandDark: string;
  minuteSpine: string;
  secondHand: string;
  secondTip: string;
  nobeBallHighlight: string;
  nobeBallMid: string;
  nobeBallShadow: string;
}

const LUXURY_FINISHES: Record<LuxuryFinish, FinishPalette> = {
  noirChrome: {
    id: 'noirChrome',
    label: 'Studio Noir',
    icon: '✨',
    glow: 'rgba(56, 189, 248, 0.55)',
    accent: '#38BDF8',
    accentGrad1: '#BAE6FD',
    accentGrad2: '#38BDF8',
    accentGrad3: '#0284C7',
    caseGrad1: '#1E2430',
    caseGrad2: '#0F131C',
    caseGrad3: '#05070B',
    dialGrad1: '#0E1118',
    dialGrad2: '#04060A',
    bezelTrim1: '#FFFFFF',
    bezelTrim2: '#94A3B8',
    // Hour: 24K Rich Sunburst Gold (Warm & Prestigious)
    hourHandLight: '#FEF08A',
    hourHandMid: '#F59E0B',
    hourHandDark: '#B45309',
    hourSpine: '#FEF9C3',
    // Minute: Electric Cyan Blue (High-Contrast, Vivid, Zero White!)
    minuteHandLight: '#7DD3FC',
    minuteHandMid: '#0284C7',
    minuteHandDark: '#0369A1',
    minuteSpine: '#E0F2FE',
    secondHand: '#FF3B30',
    secondTip: '#DC2626',
    nobeBallHighlight: '#FFFFFF',
    nobeBallMid: '#CBD5E1',
    nobeBallShadow: '#334155',
  },
  royalGold: {
    id: 'royalGold',
    label: 'Royal Gold',
    icon: '👑',
    glow: 'rgba(245, 158, 11, 0.55)',
    accent: '#F59E0B',
    accentGrad1: '#FDE68A',
    accentGrad2: '#F59E0B',
    accentGrad3: '#B45309',
    caseGrad1: '#262118',
    caseGrad2: '#13110D',
    caseGrad3: '#070604',
    dialGrad1: '#14161E',
    dialGrad2: '#06070B',
    bezelTrim1: '#FDE68A',
    bezelTrim2: '#B45309',
    // Hour: Deep Bronzed 24K Gold
    hourHandLight: '#FDE68A',
    hourHandMid: '#D97706',
    hourHandDark: '#78350F',
    hourSpine: '#FEF08A',
    // Minute: Deep Royal Sapphire Blue
    minuteHandLight: '#93C5FD',
    minuteHandMid: '#3B82F6',
    minuteHandDark: '#1D4ED8',
    minuteSpine: '#DBEAFE',
    secondHand: '#DC2626',
    secondTip: '#991B1B',
    nobeBallHighlight: '#FFFBEB',
    nobeBallMid: '#FCD34D',
    nobeBallShadow: '#78350F',
  },
  midnightSapphire: {
    id: 'midnightSapphire',
    label: 'Sapphire',
    icon: '💎',
    glow: 'rgba(56, 189, 248, 0.55)',
    accent: '#38BDF8',
    accentGrad1: '#BAE6FD',
    accentGrad2: '#38BDF8',
    accentGrad3: '#1D4ED8',
    caseGrad1: '#131D2E',
    caseGrad2: '#0A101C',
    caseGrad3: '#04070D',
    dialGrad1: '#0B1120',
    dialGrad2: '#040711',
    bezelTrim1: '#E2E8F0',
    bezelTrim2: '#64748B',
    // Hour: Electric Sapphire Azure Blue
    hourHandLight: '#7DD3FC',
    hourHandMid: '#0284C7',
    hourHandDark: '#075985',
    hourSpine: '#BAE6FD',
    // Minute: Vivid Solar Sunset Orange
    minuteHandLight: '#FED7AA',
    minuteHandMid: '#F97316',
    minuteHandDark: '#C2410C',
    minuteSpine: '#FFEDD5',
    secondHand: '#F43F5E',
    secondTip: '#BE123C',
    nobeBallHighlight: '#FFFFFF',
    nobeBallMid: '#93C5FD',
    nobeBallShadow: '#1E3A8A',
  },
  racingEmerald: {
    id: 'racingEmerald',
    label: 'Emerald',
    icon: '🌲',
    glow: 'rgba(16, 185, 129, 0.55)',
    accent: '#10B981',
    accentGrad1: '#A7F3D0',
    accentGrad2: '#10B981',
    accentGrad3: '#047857',
    caseGrad1: '#12221A',
    caseGrad2: '#0A150F',
    caseGrad3: '#040906',
    dialGrad1: '#0A1410',
    dialGrad2: '#040907',
    bezelTrim1: '#FDE68A',
    bezelTrim2: '#047857',
    // Hour: Deep Rich Emerald Green (Rich & Vivid, NOT washed-out!)
    hourHandLight: '#6EE7B7',
    hourHandMid: '#10B981',
    hourHandDark: '#047857',
    hourSpine: '#A7F3D0',
    // Minute: Radiant 24K Gold (Contrasts sharply with green hour hand and black dial!)
    minuteHandLight: '#FEF08A',
    minuteHandMid: '#F59E0B',
    minuteHandDark: '#B45309',
    minuteSpine: '#FEF9C3',
    secondHand: '#FB923C',
    secondTip: '#EA580C',
    nobeBallHighlight: '#FFFFFF',
    nobeBallMid: '#6EE7B7',
    nobeBallShadow: '#064E3B',
  },
};

// Preset customizable hand pairings
const HAND_COLOR_PRESETS: Record<
  Exclude<HandColorPreset, 'auto'>,
  {
    label: string;
    hourLight: string;
    hourMid: string;
    hourDark: string;
    hourSpine: string;
    minuteLight: string;
    minuteMid: string;
    minuteDark: string;
    minuteSpine: string;
  }
> = {
  goldCyan: {
    label: 'Gold & Cyan',
    hourLight: '#FEF08A',
    hourMid: '#F59E0B',
    hourDark: '#B45309',
    hourSpine: '#FEF9C3',
    minuteLight: '#7DD3FC',
    minuteMid: '#0284C7',
    minuteDark: '#0369A1',
    minuteSpine: '#E0F2FE',
  },
  emeraldGold: {
    label: 'Emerald & Gold',
    hourLight: '#6EE7B7',
    hourMid: '#10B981',
    hourDark: '#047857',
    hourSpine: '#A7F3D0',
    minuteLight: '#FEF08A',
    minuteMid: '#F59E0B',
    minuteDark: '#B45309',
    minuteSpine: '#FEF9C3',
  },
  rubyAmber: {
    label: 'Ruby & Amber',
    hourLight: '#FCA5A5',
    hourMid: '#EF4444',
    hourDark: '#991B1B',
    hourSpine: '#FEE2E2',
    minuteLight: '#FDE047',
    minuteMid: '#F59E0B',
    minuteDark: '#B45309',
    minuteSpine: '#FEF9C3',
  },
  sapphireCoral: {
    label: 'Sapphire & Coral',
    hourLight: '#7DD3FC',
    hourMid: '#2563EB',
    hourDark: '#1E3A8A',
    hourSpine: '#BAE6FD',
    minuteLight: '#FDBA74',
    minuteMid: '#F97316',
    minuteDark: '#C2410C',
    minuteSpine: '#FFEDD5',
  },
};

export const VintageAlarmClock: React.FC<VintageAlarmClockProps> = ({
  timerStatus,
  timerMode,
  displaySeconds,
  totalPhaseSeconds,
  progressFraction,
  selectedPomodoroPhase,
  theme,
  isZen = false,
}) => {
  const [realTime, setRealTime] = useState(() => new Date());
  const [showRinging, setShowRinging] = useState(false);
  const [handStyle, setHandStyle] = useState<HandStyle>('vintageSpade');
  const [frameStyle, setFrameStyle] = useState<ClockFrameStyle>('round');
  const [handColorPreset, setHandColorPreset] = useState<HandColorPreset>('auto');

  // Default to Studio Noir
  const defaultFinish: LuxuryFinish =
    selectedPomodoroPhase === 'shortBreak'
      ? 'racingEmerald'
      : selectedPomodoroPhase === 'longBreak'
      ? 'midnightSapphire'
      : 'noirChrome';

  const [luxuryFinish, setLuxuryFinish] = useState<LuxuryFinish>(defaultFinish);

  useEffect(() => {
    setLuxuryFinish(defaultFinish);
  }, [defaultFinish]);

  const activePal = LUXURY_FINISHES[luxuryFinish];

  // Resolve active hand colors based on preset or theme auto
  const resolvedHandColors =
    handColorPreset === 'auto'
      ? {
          hourLight: activePal.hourHandLight,
          hourMid: activePal.hourHandMid,
          hourDark: activePal.hourHandDark,
          hourSpine: activePal.hourSpine,
          minuteLight: activePal.minuteHandLight,
          minuteMid: activePal.minuteHandMid,
          minuteDark: activePal.minuteHandDark,
          minuteSpine: activePal.minuteSpine,
        }
      : HAND_COLOR_PRESETS[handColorPreset];

  // Update real-time clock smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date());
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Ringing alarm animation on session completion
  useEffect(() => {
    if (timerMode === 'POMODORO' && timerStatus === 'IDLE' && progressFraction >= 0.999) {
      setShowRinging(true);
      const timeout = setTimeout(() => setShowRinging(false), 6500);
      return () => clearTimeout(timeout);
    }
  }, [timerStatus, progressFraction, timerMode]);

  const isWithBells = frameStyle === 'twinBell';

  // Geometry configuration
  const cx = 200;
  const cy = isWithBells ? 245 : 200;
  const dialRadius = 152;

  // Helper for formatting time HH:MM:SS or MM:SS
  const formatTime = (sec: number) => {
    const sSec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sSec / 3600);
    const m = Math.floor((sSec % 3600) / 60);
    const s = sSec % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isStopwatch = timerMode === 'STOPWATCH';
  const elapsedSeconds = isStopwatch ? displaySeconds : Math.max(0, totalPhaseSeconds - displaySeconds);
  const isStopwatchReady = isStopwatch && elapsedSeconds === 0;
  const hasSector = !isStopwatch || elapsedSeconds > 0;
  const showAlarmHand = !isStopwatch;

  const sessionMinutes = isStopwatch
    ? Math.max(0, Math.floor(elapsedSeconds / 60))
    : Math.max(1, Math.round(totalPhaseSeconds / 60));

  const elapsedMinutesFraction = elapsedSeconds / 60;

  // Real-Time Session Window Calculation
  const nowMs = realTime.getTime();
  const sessionStartTime = new Date(nowMs - elapsedSeconds * 1000);
  const sessionEndTime = isStopwatch ? realTime : new Date(sessionStartTime.getTime() + totalPhaseSeconds * 1000);

  const startMinute = sessionStartTime.getMinutes() + sessionStartTime.getSeconds() / 60;
  const endMinute = isStopwatch
    ? startMinute + Math.min(60, elapsedSeconds / 60)
    : startMinute + sessionMinutes;

  const currentRealMinute = realTime.getMinutes() + realTime.getSeconds() / 60;

  // Cartesian angle helper (0 rad = 3 o'clock; 12 o'clock = -90 deg)
  const minuteToCartesianDeg = (m: number) => (m / 60) * 360 - 90;

  const activeStartDeg = minuteToCartesianDeg(startMinute);
  const activeEndDeg = minuteToCartesianDeg(endMinute);

  // SVG Sector (Pie Wedge)
  const createArcSector = (startDeg: number, endDeg: number, r: number) => {
    const diff = endDeg - startDeg;
    if (diff <= 0.001) return '';
    if (diff >= 359.9) {
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
    }
    const startRad = (startDeg * Math.PI) / 180;
    const endRad = (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const normDiff = (diff + 3600) % 360;
    const largeArc = normDiff > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  // SVG Arc Stroke
  const createArcPath = (startDeg: number, endDeg: number, r: number) => {
    const diff = endDeg - startDeg;
    if (diff <= 0.001) return '';
    if (diff >= 359.9) {
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`;
    }
    const startRad = (startDeg * Math.PI) / 180;
    const endRad = (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const normDiff = (diff + 3600) % 360;
    const largeArc = normDiff > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const sectorR = dialRadius - 6;
  const startRad = (activeStartDeg * Math.PI) / 180;
  const endRad = (activeEndDeg * Math.PI) / 180;
  const startX = cx + sectorR * Math.cos(startRad);
  const startY = cy + sectorR * Math.sin(startRad);
  const endX = cx + sectorR * Math.cos(endRad);
  const endY = cy + sectorR * Math.sin(endRad);

  const focusSectorPath = createArcSector(activeStartDeg, activeEndDeg, dialRadius - 2);
  const focusArcPath = createArcPath(activeStartDeg, activeEndDeg, dialRadius - 2);

  // Elapsed Progress Wedge
  const elapsedEndDeg = minuteToCartesianDeg(Math.min(endMinute, Math.max(startMinute, currentRealMinute)));
  const elapsedSectorPath = createArcSector(activeStartDeg, elapsedEndDeg, dialRadius - 2);

  // Clockwise Hands Angles (0° = 12 o'clock, 90° = 3 o'clock)
  const rtHours = realTime.getHours() % 12;
  const rtMinutes = realTime.getMinutes();
  const rtSeconds = realTime.getSeconds();

  const hourHandAngle = ((rtHours + rtMinutes / 60 + rtSeconds / 3600) / 12) * 360;
  const minuteHandAngle = ((rtMinutes + rtSeconds / 60) / 60) * 360;
  const secondHandAngle = (rtSeconds / 60) * 360;
  const alarmHandAngle = ((endMinute % 60) / 60) * 360;

  // Interval containment check
  const isMinuteInActiveFocus = (m: number) => {
    if (isStopwatch) {
      if (isStopwatchReady) return true;
      const normStart = ((startMinute % 60) + 60) % 60;
      const normEnd = ((endMinute % 60) + 60) % 60;
      if (elapsedSeconds >= 3600) return true;
      if (normStart <= normEnd) {
        return m >= normStart - 1.5 && m <= normEnd + 1.5;
      } else {
        return m >= normStart - 1.5 || m <= normEnd + 1.5;
      }
    }

    const normStart = ((startMinute % 60) + 60) % 60;
    const normEnd = ((endMinute % 60) + 60) % 60;
    if (sessionMinutes >= 60) return true;
    if (normStart <= normEnd) {
      return m >= normStart - 1.5 && m <= normEnd + 1.5;
    } else {
      return m >= normStart - 1.5 || m <= normEnd + 1.5;
    }
  };

  // 12 Bold Rounded Numerals matching Reference Image 2
  const numeralRadius = 108;
  const numerals = Array.from({ length: 12 }).map((_, i) => {
    const num = i === 0 ? 12 : i;
    const angleDeg = i * 30 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = cx + numeralRadius * Math.cos(angleRad);
    const y = cy + numeralRadius * Math.sin(angleRad);
    const numMinute = (num % 12) * 5;
    const isInFocus = isMinuteInActiveFocus(numMinute);

    return { num, x, y, isInFocus };
  });

  // 60 Perimeter Tick Marks matching Reference Image 2
  const tickOuterRadius = dialRadius - 6; // 146
  const majorTickInnerRadius = dialRadius - 20; // 132 (length 14px)
  const minorTickInnerRadius = dialRadius - 14; // 138 (length 8px)

  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const isMajor = i % 5 === 0;
    const angleDeg = i * 6 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);

    const x1 = cx + tickOuterRadius * cosA;
    const y1 = cy + tickOuterRadius * sinA;
    const innerR = isMajor ? majorTickInnerRadius : minorTickInnerRadius;
    const x2 = cx + innerR * cosA;
    const y2 = cy + innerR * sinA;
    const isInFocus = isMinuteInActiveFocus(i);

    return { i, x1, y1, x2, y2, isMajor, isInFocus };
  });

  const startTimeStr = sessionStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = sessionEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const viewBoxStr = isWithBells ? '0 0 400 450' : '0 0 400 400';

  const svgSizeClass = isZen
    ? 'w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] md:w-[490px] md:h-[490px] lg:w-[530px] lg:h-[530px] overflow-visible drop-shadow-[0_25px_70px_rgba(0,0,0,0.95)]'
    : 'w-[290px] h-[290px] sm:w-[350px] sm:h-[350px] md:w-[390px] md:h-[390px] overflow-visible drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]';

  return (
    <div className="relative flex flex-col items-center justify-center select-none z-10">
      {/* Top Controls: Mode Badge, Finish Selector, Hand Style, Hand Color Adjuster & Frame Style */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 z-20 max-w-3xl px-2">
        {/* Live Focus Session Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-[#0B0E17]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            {timerStatus === 'RUNNING' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                timerStatus === 'RUNNING'
                  ? 'bg-emerald-400'
                  : isStopwatchReady
                  ? 'bg-amber-400'
                  : 'bg-slate-400'
              }`}
            />
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-200">
            {isStopwatch ? (
              isStopwatchReady ? (
                <>
                  Stopwatch: <span style={{ color: activePal.accent }}>Ready to Track</span>
                </>
              ) : (
                <>
                  Study: <span style={{ color: activePal.accent }}>{startTimeStr} → {endTimeStr}</span>
                </>
              )
            ) : (
              <>
                Focus: <span style={{ color: activePal.accent }}>{startTimeStr} — {endTimeStr}</span>
              </>
            )}
          </span>
        </div>

        {/* Hand Style Selector */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#0B0E17]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setHandStyle('vintageSpade')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              handStyle === 'vintageSpade'
                ? 'bg-white/20 text-white shadow-inner border border-white/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Vintage Spade Hands (from Reference Image 3)"
          >
            <span>🗡️</span>
            <span>Spade</span>
          </button>
          <button
            type="button"
            onClick={() => setHandStyle('modernStudio')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              handStyle === 'modernStudio'
                ? 'bg-white/20 text-white shadow-inner border border-white/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Modern Studio Baton Hands (from Reference Image 2)"
          >
            <span>⏱️</span>
            <span>Baton</span>
          </button>
        </div>

        {/* ADJUSTABLE HAND ("NOBE") COLORS SELECTOR */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#0B0E17]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
          <Palette className="w-3 h-3 text-amber-400 ml-1 mr-0.5" />
          <button
            type="button"
            onClick={() => setHandColorPreset('auto')}
            className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              handColorPreset === 'auto'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Auto colors matching active theme"
          >
            Auto
          </button>
          <button
            type="button"
            onClick={() => setHandColorPreset('emeraldGold')}
            className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              handColorPreset === 'emeraldGold'
                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Emerald Hour & Gold Minute"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
          </button>
          <button
            type="button"
            onClick={() => setHandColorPreset('goldCyan')}
            className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              handColorPreset === 'goldCyan'
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Gold Hour & Cyan Minute"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
          </button>
          <button
            type="button"
            onClick={() => setHandColorPreset('rubyAmber')}
            className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              handColorPreset === 'rubyAmber'
                ? 'bg-rose-500/30 text-rose-300 border border-rose-400/40 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Ruby Hour & Amber Minute"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
          </button>
        </div>

        {/* Frame Style Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#0B0E17]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setFrameStyle('round')}
            className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              frameStyle === 'round'
                ? 'bg-white/20 text-white shadow-inner border border-white/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Clean Circular Dial (Reference Image 2)"
          >
            <Circle className="w-3 h-3" />
            <span className="hidden sm:inline">Round</span>
          </button>
          <button
            type="button"
            onClick={() => setFrameStyle('twinBell')}
            className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              frameStyle === 'twinBell'
                ? 'bg-white/20 text-white shadow-inner border border-white/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Twin Alarm Bells"
          >
            <Bell className="w-3 h-3" />
            <span className="hidden sm:inline">Twin Bell</span>
          </button>
        </div>

        {/* Luxury Finishes Selector */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#0B0E17]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
          {(['noirChrome', 'royalGold', 'midnightSapphire', 'racingEmerald'] as LuxuryFinish[]).map((fId) => {
            const f = LUXURY_FINISHES[fId];
            const isSelected = luxuryFinish === fId;
            return (
              <button
                key={fId}
                type="button"
                onClick={() => setLuxuryFinish(fId)}
                className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-white/20 text-white shadow-inner border border-white/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={f.label}
              >
                <span>{f.icon}</span>
                <span className="hidden md:inline">{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Clock Dial Masterpiece */}
      <div className="relative flex items-center justify-center">
        <svg viewBox={viewBoxStr} className={svgSizeClass}>
          <defs>
            {/* Deep Velvet Matte Black Dial Face Gradient (Image 2) */}
            <radialGradient id="vluxDialGrad" cx="50%" cy="50%" r="68%">
              <stop offset="0%" stopColor={activePal.dialGrad1} />
              <stop offset="65%" stopColor={activePal.dialGrad2} />
              <stop offset="100%" stopColor="#010204" />
            </radialGradient>

            {/* Polished Metallic Bezel Rim Gradient */}
            <linearGradient id="vluxBezelRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={activePal.bezelTrim1} />
              <stop offset="30%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor={activePal.bezelTrim2} />
              <stop offset="75%" stopColor={activePal.bezelTrim1} />
              <stop offset="100%" stopColor={activePal.bezelTrim2} />
            </linearGradient>

            {/* Subtle, Non-Intrusive Focus Session Sector Gradient */}
            <radialGradient id="vluxFocusFluidGrad" cx={cx} cy={cy} r={dialRadius} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={activePal.accentGrad1} stopOpacity="0.22" />
              <stop offset="60%" stopColor={activePal.accentGrad2} stopOpacity="0.14" />
              <stop offset="90%" stopColor={activePal.accentGrad3} stopOpacity="0.08" />
              <stop offset="100%" stopColor={activePal.accent} stopOpacity="0.03" />
            </radialGradient>

            {/* Crystal Glare Gradient */}
            <linearGradient id="vluxCrystalGlare" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.10" />
              <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.02" />
              <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* 1. DISTINCT RICH HOUR HAND METALLIC GRADIENT (Zero Washed-Out White!) */}
            <linearGradient id="vluxHourHandMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={resolvedHandColors.hourLight} />
              <stop offset="45%" stopColor={resolvedHandColors.hourMid} />
              <stop offset="90%" stopColor={resolvedHandColors.hourDark} />
              <stop offset="100%" stopColor="#0B0F19" stopOpacity="0.6" />
            </linearGradient>

            {/* 2. DISTINCT CONTRASTING MINUTE HAND METALLIC GRADIENT (Zero Washed-Out White!) */}
            <linearGradient id="vluxMinuteHandMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={resolvedHandColors.minuteLight} />
              <stop offset="45%" stopColor={resolvedHandColors.minuteMid} />
              <stop offset="90%" stopColor={resolvedHandColors.minuteDark} />
              <stop offset="100%" stopColor="#0B0F19" stopOpacity="0.6" />
            </linearGradient>

            {/* 3D SPHERICAL POLISHED CHROME DOME KNOB ("NOBE") GRADIENT (Image 3) */}
            <radialGradient id="vluxChromeSphereNobe" cx="32%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor={activePal.nobeBallHighlight} />
              <stop offset="60%" stopColor={activePal.nobeBallMid} />
              <stop offset="88%" stopColor={activePal.nobeBallShadow} />
              <stop offset="100%" stopColor="#0B0F19" />
            </radialGradient>

            {/* Stepped Collar Ring Gradient */}
            <linearGradient id="vluxCollarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor={activePal.bezelTrim1} />
              <stop offset="80%" stopColor={activePal.bezelTrim2} />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>

            {/* Laser Glow Filter */}
            <filter id="vluxLaserGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Hand Realistic Drop Shadow */}
            <filter id="vluxHandDropShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="1" dy="3" stdDeviation="2.8" floodColor="#000000" floodOpacity="0.85" />
            </filter>

            {/* Volumetric Clock Shadow */}
            <filter id="vluxClockVolumetricShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.8" />
            </filter>

            {/* Nobe Drop Shadow */}
            <filter id="vluxNobeShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0.5" dy="1.8" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* =========================================================================
              OPTIONAL TWIN BELLS & HANDLE (When frameStyle === 'twinBell')
              ========================================================================= */}
          {isWithBells && (
            <g>
              {/* Top Handle */}
              <g filter="url(#vluxClockVolumetricShadow)">
                <path
                  d="M 120 120 C 120 30, 280 30, 280 120"
                  fill="none"
                  stroke="url(#vluxBezelRimGrad)"
                  strokeWidth="9.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 123 118 C 123 34, 277 34, 277 118"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeOpacity="0.75"
                  strokeLinecap="round"
                />
                <circle cx="200" cy="45" r="7.5" fill="url(#vluxBezelRimGrad)" stroke="#1E1408" strokeWidth="1.5" />
              </g>

              {/* Angled Feet Stand */}
              <g filter="url(#vluxClockVolumetricShadow)">
                <line x1="112" y1="349" x2="70" y2="421" stroke="url(#vluxBezelRimGrad)" strokeWidth="11" strokeLinecap="round" />
                <circle cx="70" cy="421" r="8" fill="url(#vluxCollarGrad)" stroke="#1F2937" strokeWidth="1.5" />
                <line x1="288" y1="349" x2="330" y2="421" stroke="url(#vluxBezelRimGrad)" strokeWidth="11" strokeLinecap="round" />
                <circle cx="330" cy="421" r="8" fill="url(#vluxCollarGrad)" stroke="#1F2937" strokeWidth="1.5" />
              </g>

              {/* Articulated Striker Hammer */}
              <motion.g
                animate={showRinging ? { rotate: [-16, 16, -16] } : { rotate: 0 }}
                transition={showRinging ? { duration: 0.08, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
                style={{ originX: '200px', originY: '133px' }}
              >
                <line x1="200" y1="133" x2="200" y2="91" stroke="url(#vluxBezelRimGrad)" strokeWidth="5.5" strokeLinecap="round" />
                <rect x="195" y="83" width="10" height="18" rx="3" fill="url(#vluxBezelRimGrad)" stroke="#0F172A" strokeWidth="1" />
                <circle cx="200" cy="83" r="7.5" fill="url(#vluxCollarGrad)" stroke="#0F172A" strokeWidth="1.5" />
              </motion.g>

              {/* Left Bell Cup */}
              <motion.g
                animate={showRinging ? { rotate: [-2, 2, -2] } : { rotate: 0 }}
                transition={showRinging ? { duration: 0.1, repeat: Infinity } : { duration: 0.2 }}
                style={{ originX: '95px', originY: '89px' }}
                filter="url(#vluxClockVolumetricShadow)"
              >
                <line x1="128" y1="143" x2="96" y2="89" stroke="url(#vluxBezelRimGrad)" strokeWidth="8" strokeLinecap="round" />
                <circle cx="96" cy="89" r="6" fill="url(#vluxBezelRimGrad)" />
                <path
                  d="M 50 115 C 42 63, 126 37, 144 89 C 148 99, 139 113, 125 115 Z"
                  fill="#111827"
                  stroke="#090D14"
                  strokeWidth="3"
                />
                <path d="M 52 113 C 65 118, 116 118, 127 114" fill="none" stroke="url(#vluxBezelRimGrad)" strokeWidth="2.5" strokeLinecap="round" />
              </motion.g>

              {/* Right Bell Cup */}
              <motion.g
                animate={showRinging ? { rotate: [2, -2, 2] } : { rotate: 0 }}
                transition={showRinging ? { duration: 0.1, repeat: Infinity } : { duration: 0.2 }}
                style={{ originX: '305px', originY: '89px' }}
                filter="url(#vluxClockVolumetricShadow)"
              >
                <line x1="272" y1="143" x2="304" y2="89" stroke="url(#vluxBezelRimGrad)" strokeWidth="8" strokeLinecap="round" />
                <circle cx="304" cy="89" r="6" fill="url(#vluxBezelRimGrad)" />
                <path
                  d="M 350 115 C 358 63, 274 37, 256 89 C 252 99, 261 113, 275 115 Z"
                  fill="#111827"
                  stroke="#090D14"
                  strokeWidth="3"
                />
                <path d="M 348 113 C 335 118, 284 118, 273 114" fill="none" stroke="url(#vluxBezelRimGrad)" strokeWidth="2.5" strokeLinecap="round" />
              </motion.g>
            </g>
          )}

          {/* =========================================================================
              CLEAN SINGLE SLIM LUXURY BEZEL & DIAL (The 2 heavy outer borders removed!)
              ========================================================================= */}
          <g filter="url(#vluxClockVolumetricShadow)">
            {/* Slim Brushed Titanium Outer Rim (Replaces the 2 heavy thick borders) */}
            <circle cx={cx} cy={cy} r={dialRadius + 3.5} fill="#141822" stroke="#2D3748" strokeWidth="2" />

            {/* Delicate Diamond-Cut Specular Chamfer Line */}
            <circle cx={cx} cy={cy} r={dialRadius + 2.5} fill="none" stroke="url(#vluxBezelRimGrad)" strokeWidth="1.2" strokeOpacity="0.85" />

            {/* Pure Matte Black Velvet Watch Dial Face (Image 2) */}
            <circle cx={cx} cy={cy} r={dialRadius} fill="url(#vluxDialGrad)" />

            {/* Subtle Inner Dial Edge Line */}
            <circle cx={cx} cy={cy} r={dialRadius - 0.5} fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
          </g>

          {/* =========================================================================
              ACTIVE FOCUS / STUDY PORTION (Glowing Radial Slice & Laser Track)
              ========================================================================= */}
          {hasSector && (
            <g>
              {/* Luminous Glowing Focus Sector Wedge */}
              <path
                d={focusSectorPath}
                fill="url(#vluxFocusFluidGrad)"
                className="transition-all duration-500"
              />

              {/* Elapsed Session Arc Slice (In Pomodoro mode) */}
              {!isStopwatch && elapsedMinutesFraction > 0.02 && (
                <path
                  d={elapsedSectorPath}
                  fill={activePal.accent}
                  fillOpacity="0.14"
                />
              )}

              {/* Radial Boundary Guide Lines */}
              <line
                x1={cx}
                y1={cy}
                x2={startX}
                y2={startY}
                stroke={activePal.accent}
                strokeWidth="1.8"
                strokeDasharray="4 2"
                strokeOpacity="0.8"
              />
              <line
                x1={cx}
                y1={cy}
                x2={endX}
                y2={endY}
                stroke={activePal.accent}
                strokeWidth="2.2"
                strokeOpacity="0.95"
              />

              {/* Perimeter Luminous Neon Glowing Arc */}
              <path
                d={focusArcPath}
                fill="none"
                stroke={activePal.accent}
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#vluxLaserGlow)"
              />
              <path
                d={focusArcPath}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeOpacity="0.9"
              />

              {/* Start & End Luminous Beacons */}
              <circle cx={startX} cy={startY} r="3.5" fill="#FFFFFF" stroke={activePal.accent} strokeWidth="1.8" filter="url(#vluxLaserGlow)" />
              <circle cx={endX} cy={endY} r="4.5" fill="#FFFFFF" stroke={activePal.accent} strokeWidth="2.2" filter="url(#vluxLaserGlow)" />
            </g>
          )}

          {/* =========================================================================
              60 PERIMETER CHAPTER RING TICKS (Reference Image 2)
              12 major 5-minute ticks (longer and bolder) & 48 minor minute ticks
              ========================================================================= */}
          <g>
            {ticks.map((t) => {
              const isLit = t.isInFocus;
              return (
                <line
                  key={`tick-${t.i}`}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={
                    isStopwatchReady
                      ? t.isMajor
                        ? '#FFFFFF'
                        : 'rgba(255, 255, 255, 0.45)'
                      : isLit
                      ? activePal.accentGrad1
                      : t.isMajor
                      ? 'rgba(255, 255, 255, 0.75)'
                      : 'rgba(255, 255, 255, 0.25)'
                  }
                  strokeWidth={t.isMajor ? 3.2 : 1.8}
                  strokeLinecap="round"
                  className="transition-colors duration-300"
                />
              );
            })}
          </g>

          {/* =========================================================================
              12 BOLD ROUNDED NUMERALS 1 THROUGH 12 (Reference Image 2)
              High-contrast, crisp typography without muddy circular halo blobs
              ========================================================================= */}
          <g>
            {numerals.map((num) => {
              const isLit = num.isInFocus;
              return (
                <g key={`num-${num.num}`}>
                  <text
                    x={num.x}
                    y={num.y + (num.num === 12 ? 1 : 2)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={num.num === 12 ? '33' : '30'}
                    fontWeight="800"
                    fontFamily="'Fredoka', 'Varela Round', 'Nunito', 'Arial Rounded MT Bold', sans-serif"
                    fill={
                      isStopwatchReady
                        ? '#FFFFFF'
                        : isLit
                        ? '#FFFFFF'
                        : 'rgba(255, 255, 255, 0.88)'
                    }
                    className="transition-all duration-300 select-none pointer-events-none"
                    style={{
                      textShadow: isStopwatchReady
                        ? '0 0 10px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.95)'
                        : isLit
                        ? `0 0 16px ${activePal.glow}, 0 0 5px #FFFFFF, 0 2px 4px rgba(0,0,0,0.95)`
                        : '0 2px 4px rgba(0,0,0,0.95)',
                    }}
                  >
                    {num.num}
                  </text>
                </g>
              );
            })}
          </g>

          {/* =========================================================================
              ALARM TARGET HAND (In Pomodoro mode)
              ========================================================================= */}
          {showAlarmHand && (
            <g transform={`rotate(${alarmHandAngle} ${cx} ${cy})`}>
              <path
                d={`M ${cx - 3.5} ${cy - 12} L ${cx} ${cy - 72} L ${cx + 3.5} ${cy - 12} Z`}
                fill="url(#vluxBezelRimGrad)"
                stroke="#090D16"
                strokeWidth="1"
              />
              <polygon
                points={`${cx - 5},${cy - 56} ${cx},${cy - 72} ${cx + 5},${cy - 56}`}
                fill={activePal.accent}
                filter="url(#vluxLaserGlow)"
              />
            </g>
          )}

          {/* =========================================================================
              HANDS RENDERING WITH DISTINCT COLORS (Hour vs Minute Node Color)
              ========================================================================= */}
          {handStyle === 'vintageSpade' ? (
            /* =====================================================================
               STYLE A: VINTAGE SPADE HANDS (Reference Image 3)
               - Distinct Hour Hand: Richly Saturated Hue (Zero Plain White!)
               - Distinct Minute Hand: Contrasting Saturated Hue (Zero Plain White!)
               ===================================================================== */
            <g filter="url(#vluxHandDropShadow)">
              {/* --- HOUR HAND (EXACT SHAPE FROM USER PHOTO) --- */}
              <g transform={`translate(${cx}, ${cy}) rotate(${hourHandAngle})`}>
                {/* Counterweight Tail */}
                <path
                  d="M -1.1,0 L -1.1,16 A 1.1 1.1 0 0 0 1.1,16 L 1.1,0 Z"
                  fill="url(#vluxHourHandMetalGrad)"
                  stroke="rgba(0,0,0,0.6)"
                  strokeWidth="0.8"
                />

                {/* Main Vintage Spade Body: Slender stem -> bulbous teardrop -> rounded rod tip */}
                <path
                  d="M -1.1,-7
                     L -1.1,-38
                     C -1.1,-38.2 -2.5,-39.2 -4.0,-40.5
                     C -6.5,-42.5 -7.2,-45 -7.2,-47.5
                     C -7.2,-50.5 -4.8,-54.5 -2.6,-58
                     C -1.6,-59.5 -1.1,-61 -1.1,-63
                     L -1.1,-69
                     A 1.1 1.1 0 0 1 1.1,-69
                     L 1.1,-63
                     C 1.1,-61 1.6,-59.5 2.6,-58
                     C 4.8,-54.5 7.2,-50.5 7.2,-47.5
                     C 7.2,-45 6.5,-42.5 4.0,-40.5
                     C 2.5,-39.2 1.1,-38.2 1.1,-38
                     L 1.1,-7 Z"
                  fill="url(#vluxHourHandMetalGrad)"
                  stroke="rgba(0, 0, 0, 0.7)"
                  strokeWidth="0.8"
                />

                {/* Coordinated specular spine */}
                <line x1="0" y1="-8" x2="0" y2="-66" stroke={resolvedHandColors.hourSpine} strokeWidth="0.75" strokeOpacity="0.85" />
              </g>

              {/* --- MINUTE HAND (EXACT SHAPE FROM USER PHOTO) --- */}
              <g transform={`translate(${cx}, ${cy}) rotate(${minuteHandAngle})`}>
                {/* Counterweight Tail */}
                <path
                  d="M -1.1,0 L -1.1,20 A 1.1 1.1 0 0 0 1.1,20 L 1.1,0 Z"
                  fill="url(#vluxMinuteHandMetalGrad)"
                  stroke="rgba(0,0,0,0.6)"
                  strokeWidth="0.8"
                />

                {/* Main Vintage Spade Body: Long slender stem -> bulbous teardrop -> rounded rod tip */}
                <path
                  d="M -1.1,-7
                     L -1.1,-68
                     C -1.1,-68.2 -2.5,-69.2 -4.2,-70.5
                     C -6.8,-72.5 -7.6,-75.5 -7.6,-78.5
                     C -7.6,-82.5 -5.2,-87 -3.0,-91
                     C -1.8,-93 -1.2,-95 -1.2,-97
                     L -1.2,-111
                     A 1.2 1.2 0 0 1 1.2,-111
                     L 1.2,-97
                     C 1.2,-95 1.8,-93 3.0,-91
                     C 5.2,-87 7.6,-82.5 7.6,-78.5
                     C 7.6,-75.5 6.8,-72.5 4.2,-70.5
                     C 2.5,-69.2 1.1,-68.2 1.1,-68
                     L 1.1,-7 Z"
                  fill="url(#vluxMinuteHandMetalGrad)"
                  stroke="rgba(0, 0, 0, 0.7)"
                  strokeWidth="0.8"
                />

                {/* Coordinated specular spine */}
                <line x1="0" y1="-8" x2="0" y2="-107" stroke={resolvedHandColors.minuteSpine} strokeWidth="0.75" strokeOpacity="0.85" />
              </g>

              {/* --- SECOND HAND (SLENDER NEEDLE) --- */}
              <g transform={`translate(${cx}, ${cy}) rotate(${secondHandAngle})`}>
                {/* Slender polished needle shaft */}
                <line x1="0" y1="28" x2="0" y2="-116" stroke={activePal.secondHand} strokeWidth="1.6" strokeLinecap="round" />
                {/* Counterbalance Disc */}
                <circle cx="0" cy="18" r="3.6" fill="url(#vluxCollarGrad)" stroke="#1F2937" strokeWidth="0.8" />
                {/* Active Indicator Tip */}
                <circle cx="0" cy="-108" r="2.4" fill={activePal.secondTip} filter="url(#vluxLaserGlow)" />
              </g>
            </g>
          ) : (
            /* =====================================================================
               STYLE B: MODERN STUDIO BATON HANDS (Reference Image 2)
               - Distinct Hour Hand: Rich Color 1 Baton
               - Distinct Minute Hand: Rich Color 2 Baton
               - Second Hand: Electric Blue Needle with Center Ring
               ===================================================================== */
            <g filter="url(#vluxHandDropShadow)">
              {/* Hour Hand (Color 1 Baton) */}
              <g transform={`translate(${cx}, ${cy}) rotate(${hourHandAngle})`}>
                <rect x="-4" y="-72" width="8" height="84" rx="4" fill="url(#vluxHourHandMetalGrad)" stroke="#0A0E17" strokeWidth="1.2" />
              </g>

              {/* Minute Hand (Color 2 Baton - Non-White!) */}
              <g transform={`translate(${cx}, ${cy}) rotate(${minuteHandAngle})`}>
                <rect x="-3.5" y="-112" width="7" height="126" rx="3.5" fill="url(#vluxMinuteHandMetalGrad)" stroke="#0A0E17" strokeWidth="1.2" />
              </g>

              {/* Second Hand (Vibrant Electric Blue Hand with Center Ring - Image 2) */}
              <g transform={`translate(${cx}, ${cy}) rotate(${secondHandAngle})`}>
                <line x1="0" y1="34" x2="0" y2="-118" stroke="#0284C7" strokeWidth="2.8" strokeLinecap="round" />
                <line x1="0" y1="34" x2="0" y2="-118" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                <circle cx="0" cy="0" r="7.5" fill="none" stroke="#38BDF8" strokeWidth="2.4" />
              </g>
            </g>
          )}

          {/* =========================================================================
              SAPPHIRE CRYSTAL GLASS REFLECTION
              ========================================================================= */}
          <path
            d={`M ${cx - dialRadius + 18} ${cy - 15} A ${dialRadius - 6} ${dialRadius - 6} 0 0 1 ${cx + dialRadius - 18} ${cy - 15} C ${cx + 75} ${cy - 85}, ${cx - 75} ${cy - 85}, ${cx - dialRadius + 18} ${cy - 15} Z`}
            fill="url(#vluxCrystalGlare)"
            className="pointer-events-none"
          />

          {/* =========================================================================
              THE "NOBE" (CENTER KNOB / ARBOR CAP) - IMAGE 3
              Polished 3D chrome sphere dome nut with stepped collar washer
              ========================================================================= */}
          <g filter="url(#vluxNobeShadow)">
            {/* Stepped Metallic Collar Washer Ring */}
            <circle cx={cx} cy={cy} r="8.5" fill="url(#vluxCollarGrad)" stroke="#111827" strokeWidth="1" />
            <circle cx={cx} cy={cy} r="6.8" fill="url(#vluxHourHandMetalGrad)" stroke="#1F2937" strokeWidth="0.6" strokeOpacity="0.85" />

            {/* 3D Chrome Spherical Dome Nut ("Nobe") */}
            <circle cx={cx} cy={cy} r="5.2" fill="url(#vluxChromeSphereNobe)" stroke="#1E293B" strokeWidth="0.6" />

            {/* Specular Highlight Glint on Upper Left */}
            <ellipse
              cx={cx - 1.5}
              cy={cy - 1.6}
              rx="1.8"
              ry="1.1"
              transform={`rotate(-35 ${cx - 1.5} ${cy - 1.6})`}
              fill="#FFFFFF"
              fillOpacity="0.95"
            />
            <circle cx={cx - 1} cy={cy - 1} r="0.5" fill="#FFFFFF" />
          </g>
        </svg>
      </div>

      {/* Digital Precision Readout & Tagline */}
      <div className="mt-3 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-[#0B0E17]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
          <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            {formatTime(displaySeconds)}
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 text-slate-200">
            {timerStatus === 'RUNNING' ? 'Flowing' : isStopwatchReady ? 'Ready' : 'Paused'}
          </span>
        </div>

        {/* Real-time Focus Interval Tagline */}
        <div className="mt-2 text-xs font-semibold text-slate-400 flex items-center gap-2">
          {isStopwatch ? (
            isStopwatchReady ? (
              <span>Stopwatch Mode • Click Start to record study hours</span>
            ) : (
              <>
                <span>Study Tracked</span>
                <span>•</span>
                <span className="font-mono font-bold" style={{ color: activePal.accent }}>
                  Started {startTimeStr} ({Math.floor(elapsedSeconds / 3600) > 0 ? `${Math.floor(elapsedSeconds / 3600)}h ${Math.floor((elapsedSeconds % 3600) / 60)}m` : `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`})
                </span>
              </>
            )
          ) : (
            <>
              <span>
                {selectedPomodoroPhase === 'work'
                  ? 'Focus Interval'
                  : selectedPomodoroPhase === 'shortBreak'
                  ? 'Short Break'
                  : 'Long Break'}
              </span>
              <span>•</span>
              <span className="font-mono font-bold" style={{ color: activePal.accent }}>
                {startTimeStr} → {endTimeStr} ({sessionMinutes}m)
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
