'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Circle } from 'lucide-react';

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
  handFaceLight: string;
  handFaceDark: string;
  secondHand: string;
  secondTip: string;
  knobChrome1: string;
  knobChrome2: string;
  knobChrome3: string;
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
    dialGrad1: '#0F1219',
    dialGrad2: '#06080D',
    bezelTrim1: '#FFFFFF',
    bezelTrim2: '#94A3B8',
    handFaceLight: '#FFFFFF',
    handFaceDark: '#CBD5E1',
    secondHand: '#38BDF8',
    secondTip: '#0284C7',
    knobChrome1: '#FFFFFF',
    knobChrome2: '#CBD5E1',
    knobChrome3: '#475569',
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
    handFaceLight: '#FEF08A',
    handFaceDark: '#CA8A04',
    secondHand: '#FDE047',
    secondTip: '#EF4444',
    knobChrome1: '#FFFBEB',
    knobChrome2: '#FCD34D',
    knobChrome3: '#78350F',
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
    handFaceLight: '#FFFFFF',
    handFaceDark: '#94A3B8',
    secondHand: '#38BDF8',
    secondTip: '#F43F5E',
    knobChrome1: '#FFFFFF',
    knobChrome2: '#93C5FD',
    knobChrome3: '#1E3A8A',
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
    handFaceLight: '#A7F3D0',
    handFaceDark: '#059669',
    secondHand: '#34D399',
    secondTip: '#F59E0B',
    knobChrome1: '#FFFFFF',
    knobChrome2: '#6EE7B7',
    knobChrome3: '#064E3B',
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

  // Default to Studio Noir (matching user's reference images 2 & 3)
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
  const dialRadius = 150;

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

  const focusSectorPath = createArcSector(activeStartDeg, activeEndDeg, dialRadius - 4);
  const focusArcPath = createArcPath(activeStartDeg, activeEndDeg, dialRadius - 4);

  // Elapsed Progress Wedge
  const elapsedEndDeg = minuteToCartesianDeg(Math.min(endMinute, Math.max(startMinute, currentRealMinute)));
  const elapsedSectorPath = createArcSector(activeStartDeg, elapsedEndDeg, dialRadius - 4);

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
  const numeralRadius = 106;
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
  // 12 Major ticks at hours (longer and bolder), 48 minor ticks at minutes
  const tickOuterRadius = dialRadius - 6; // 144
  const majorTickInnerRadius = dialRadius - 19; // 131 (length 13px)
  const minorTickInnerRadius = dialRadius - 14; // 136 (length 8px)

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

  // ViewBox adapts based on whether twin bells are shown
  const viewBoxStr = isWithBells ? '0 0 400 450' : '0 0 400 400';

  const svgSizeClass = isZen
    ? 'w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] md:w-[490px] md:h-[490px] lg:w-[530px] lg:h-[530px] overflow-visible drop-shadow-[0_25px_70px_rgba(0,0,0,0.95)]'
    : 'w-[290px] h-[290px] sm:w-[350px] sm:h-[350px] md:w-[390px] md:h-[390px] overflow-visible drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]';

  return (
    <div className="relative flex flex-col items-center justify-center select-none z-10">
      {/* Top Controls: Mode Badge, Finish Selector, Hand Style & Frame Style */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 z-20 max-w-2xl px-2">
        {/* Live Real-Time Focus Session Badge */}
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

        {/* Hand Style Selector: Vintage Spade (Image 3) vs Modern Studio (Image 2) */}
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
            <span>Spade Hands</span>
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
            <span>Studio Baton</span>
          </button>
        </div>

        {/* Frame Style Toggle: Circular Dial (Image 2) vs Twin Bell */}
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
            {/* Dynamic Outer Bezel Case Gradient */}
            <radialGradient id="vluxCaseGrad" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor={activePal.caseGrad1} />
              <stop offset="45%" stopColor={activePal.caseGrad2} />
              <stop offset="100%" stopColor={activePal.caseGrad3} />
            </radialGradient>

            {/* Polished Metallic Bezel Rim Gradient */}
            <linearGradient id="vluxBezelRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={activePal.bezelTrim1} />
              <stop offset="30%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor={activePal.bezelTrim2} />
              <stop offset="75%" stopColor={activePal.bezelTrim1} />
              <stop offset="100%" stopColor={activePal.bezelTrim2} />
            </linearGradient>

            {/* Deep Velvet Matte Black Dial Face Gradient (Image 2) */}
            <radialGradient id="vluxDialGrad" cx="50%" cy="50%" r="68%">
              <stop offset="0%" stopColor={activePal.dialGrad1} />
              <stop offset="65%" stopColor={activePal.dialGrad2} />
              <stop offset="100%" stopColor="#020306" />
            </radialGradient>

            {/* Active Focus Session Sector Glow Fluid Gradient */}
            <radialGradient id="vluxFocusFluidGrad" cx={cx} cy={cy} r={dialRadius} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={activePal.accentGrad1} stopOpacity="0.45" />
              <stop offset="60%" stopColor={activePal.accentGrad2} stopOpacity="0.32" />
              <stop offset="85%" stopColor={activePal.accentGrad3} stopOpacity="0.2" />
              <stop offset="100%" stopColor={activePal.accent} stopOpacity="0.12" />
            </radialGradient>

            {/* Crystal Glare Gradient */}
            <linearGradient id="vluxCrystalGlare" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.14" />
              <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.04" />
              <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* 3D SPHERICAL POLISHED CHROME DOME KNOB ("NOBE") GRADIENT (Image 3) */}
            {/* Creates a photorealistic 3D metallic sphere with upper-left specular reflection */}
            <radialGradient id="vluxChromeSphereNobe" cx="30%" cy="26%" r="72%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor={activePal.knobChrome1} />
              <stop offset="55%" stopColor={activePal.knobChrome2} />
              <stop offset="85%" stopColor={activePal.knobChrome3} />
              <stop offset="100%" stopColor="#0F172A" />
            </radialGradient>

            {/* Stepped Collar Ring Metallic Gradient */}
            <linearGradient id="vluxCollarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor={activePal.bezelTrim1} />
              <stop offset="70%" stopColor={activePal.bezelTrim2} />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>

            {/* 3D Hand Light Facet Gradient */}
            <linearGradient id="vluxHandFacetLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor={activePal.handFaceLight} />
              <stop offset="100%" stopColor={activePal.accentGrad1} />
            </linearGradient>

            {/* 3D Hand Shadow Facet Gradient */}
            <linearGradient id="vluxHandFacetDark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={activePal.handFaceDark} />
              <stop offset="60%" stopColor="#475569" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* Laser Glow Filter */}
            <filter id="vluxLaserGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Volumetric Soft Drop Shadow */}
            <filter id="vluxClockVolumetricShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000000" floodOpacity="0.9" />
            </filter>

            {/* Nobe Drop Shadow */}
            <filter id="vluxNobeShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.75" />
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
                  fill="url(#vluxCaseGrad)"
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
                  fill="url(#vluxCaseGrad)"
                  stroke="#090D14"
                  strokeWidth="3"
                />
                <path d="M 348 113 C 335 118, 284 118, 273 114" fill="none" stroke="url(#vluxBezelRimGrad)" strokeWidth="2.5" strokeLinecap="round" />
              </motion.g>
            </g>
          )}

          {/* =========================================================================
              MAIN CIRCULAR CLOCK CASING & BEZEL (Reference Image 2)
              ========================================================================= */}
          <g filter="url(#vluxClockVolumetricShadow)">
            {/* Outer Deep Slate / Obsidian Bezel Ring */}
            <circle cx={cx} cy={cy} r={dialRadius + 22} fill="url(#vluxCaseGrad)" stroke="#040609" strokeWidth="4" />

            {/* Specular Polished Chrome / Platinum Outer Bevel */}
            <circle cx={cx} cy={cy} r={dialRadius + 21} fill="none" stroke="url(#vluxBezelRimGrad)" strokeWidth="2" strokeOpacity="0.9" />

            {/* Inset Precision Step */}
            <circle cx={cx} cy={cy} r={dialRadius + 8} fill="#090C14" stroke="#000000" strokeWidth="1.5" />

            {/* High-Reflectivity Inner Bezel Rim */}
            <circle cx={cx} cy={cy} r={dialRadius + 6} fill="none" stroke="url(#vluxBezelRimGrad)" strokeWidth="2.5" strokeOpacity="0.8" />

            {/* Pure Matte Black Watch Face Dial (Image 2) */}
            <circle cx={cx} cy={cy} r={dialRadius} fill="url(#vluxDialGrad)" />

            {/* Subtle Inner Dial Depth Vignette Rim */}
            <circle cx={cx} cy={cy} r={dialRadius - 1} fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.2" />
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
                  fillOpacity="0.22"
                />
              )}

              {/* Radial Boundary Guide Lines */}
              <line
                x1={cx}
                y1={cy}
                x2={startX}
                y2={startY}
                stroke={activePal.accent}
                strokeWidth="2"
                strokeDasharray="4 2"
                strokeOpacity="0.85"
              />
              <line
                x1={cx}
                y1={cy}
                x2={endX}
                y2={endY}
                stroke={activePal.accent}
                strokeWidth="2.5"
                strokeOpacity="0.95"
              />

              {/* Perimeter Luminous Neon Glowing Arc */}
              <path
                d={focusArcPath}
                fill="none"
                stroke={activePal.accent}
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#vluxLaserGlow)"
              />
              <path
                d={focusArcPath}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeOpacity="0.9"
              />

              {/* Start & End Luminous Beacons */}
              <circle cx={startX} cy={startY} r="4" fill="#FFFFFF" stroke={activePal.accent} strokeWidth="2" filter="url(#vluxLaserGlow)" />
              <circle cx={endX} cy={endY} r="5" fill="#FFFFFF" stroke={activePal.accent} strokeWidth="2" filter="url(#vluxLaserGlow)" />
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
              Rendered in chunky, curved, bold rounded typography ('Fredoka')
              ========================================================================= */}
          <g>
            {numerals.map((num) => {
              const isLit = num.isInFocus;
              return (
                <g key={`num-${num.num}`}>
                  {/* Glowing backlight halo behind in-focus numbers */}
                  {isLit && !isStopwatchReady && (
                    <circle
                      cx={num.x}
                      cy={num.y}
                      r="18"
                      fill={activePal.accent}
                      fillOpacity="0.22"
                      className="transition-opacity duration-300"
                    />
                  )}
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
                        ? `0 0 18px ${activePal.glow}, 0 0 6px #FFFFFF, 0 2px 4px rgba(0,0,0,0.95)`
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
              HANDS RENDERING (Vintage Spade - Image 3 vs Modern Studio - Image 2)
              ========================================================================= */}
          {handStyle === 'vintageSpade' ? (
            /* =====================================================================
               STYLE A: VINTAGE SPADE / POIRE HANDS (Reference Image 3)
               Slender stems expanding into ornate pear/spade teardrops with fine tips
               ===================================================================== */
            <g filter="url(#vluxClockVolumetricShadow)">
              {/* Hour Hand (Vintage Spade) */}
              <g transform={`rotate(${hourHandAngle} ${cx} ${cy})`}>
                {/* Counterweight Tail */}
                <rect x={cx - 2.5} y={cy} width="5" height="24" rx="2.5" fill="url(#vluxHandFacetLight)" stroke="#1F2937" strokeWidth="0.8" />

                {/* Left Beveled Facet */}
                <path
                  d={`M ${cx - 3} ${cy}
                     L ${cx - 2} ${cy - 40}
                     C ${cx - 6.5} ${cy - 46}, ${cx - 7.5} ${cy - 56}, ${cx} ${cy - 70}
                     L ${cx} ${cy} Z`}
                  fill="url(#vluxHandFacetLight)"
                />
                {/* Right Beveled Facet */}
                <path
                  d={`M ${cx} ${cy}
                     L ${cx} ${cy - 70}
                     C ${cx + 7.5} ${cy - 56}, ${cx + 6.5} ${cy - 46}, ${cx + 2} ${cy - 40}
                     L ${cx + 3} ${cy} Z`}
                  fill="url(#vluxHandFacetDark)"
                />
                {/* Center Ridge Crease */}
                <line x1={cx} y1={cy} x2={cx} y2={cy - 70} stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.8" />
              </g>

              {/* Minute Hand (Vintage Spade) */}
              <g transform={`rotate(${minuteHandAngle} ${cx} ${cy})`}>
                {/* Counterweight Tail */}
                <rect x={cx - 2.2} y={cy} width="4.4" height="28" rx="2.2" fill="url(#vluxHandFacetLight)" stroke="#1F2937" strokeWidth="0.8" />

                {/* Left Beveled Facet */}
                <path
                  d={`M ${cx - 2.8} ${cy}
                     L ${cx - 1.8} ${cy - 68}
                     C ${cx - 7.5} ${cy - 76}, ${cx - 8.5} ${cy - 88}, ${cx} ${cy - 108}
                     L ${cx} ${cy} Z`}
                  fill="url(#vluxHandFacetLight)"
                />
                {/* Right Beveled Facet */}
                <path
                  d={`M ${cx} ${cy}
                     L ${cx} ${cy - 108}
                     C ${cx + 8.5} ${cy - 88}, ${cx + 7.5} ${cy - 76}, ${cx + 1.8} ${cy - 68}
                     L ${cx + 2.8} ${cy} Z`}
                  fill="url(#vluxHandFacetDark)"
                />
                {/* Center Ridge Crease */}
                <line x1={cx} y1={cy} x2={cx} y2={cy - 108} stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.85" />
              </g>

              {/* Second Hand (Slender Needle with Counterbalance) */}
              <g transform={`rotate(${secondHandAngle} ${cx} ${cy})`}>
                {/* Slender Needle Shaft */}
                <line x1={cx} y1={cy + 34} x2={cx} y2={cy - 116} stroke={activePal.secondHand} strokeWidth="1.8" strokeLinecap="round" />
                {/* Counterbalance Disc */}
                <circle cx={cx} cy={cy + 24} r="4.5" fill="url(#vluxCollarGrad)" stroke="#1F2937" strokeWidth="1" />
                {/* Luminous Active Arrow / Pip Tip */}
                <circle cx={cx} cy={cy - 106} r="2.8" fill={activePal.secondTip} filter="url(#vluxLaserGlow)" />
              </g>
            </g>
          ) : (
            /* =====================================================================
               STYLE B: MODERN STUDIO BATON HANDS (Reference Image 2)
               Pure white rounded capsules with electric blue second hand & center ring
               ===================================================================== */
            <g filter="url(#vluxClockVolumetricShadow)">
              {/* Hour Hand (Thick Rounded White Baton - Image 2) */}
              <g transform={`rotate(${hourHandAngle} ${cx} ${cy})`}>
                {/* Counterweight Tail */}
                <rect x={cx - 4.5} y={cy} width="9" height="14" rx="4.5" fill="#FFFFFF" />
                {/* Main Body */}
                <rect
                  x={cx - 4.5}
                  y={cy - 72}
                  width="9"
                  height="76"
                  rx="4.5"
                  fill="#FFFFFF"
                  stroke="#0A0E17"
                  strokeWidth="1.2"
                />
              </g>

              {/* Minute Hand (Longer Thick Rounded White Baton - Image 2) */}
              <g transform={`rotate(${minuteHandAngle} ${cx} ${cy})`}>
                {/* Counterweight Tail */}
                <rect x={cx - 4} y={cy} width="8" height="16" rx="4" fill="#FFFFFF" />
                {/* Main Body */}
                <rect
                  x={cx - 4}
                  y={cy - 112}
                  width="8"
                  height="116"
                  rx="4"
                  fill="#FFFFFF"
                  stroke="#0A0E17"
                  strokeWidth="1.2"
                />
              </g>

              {/* Second Hand (Vibrant Electric Blue Hand with Center Ring - Image 2) */}
              <g transform={`rotate(${secondHandAngle} ${cx} ${cy})`}>
                {/* Blue Needle Stem */}
                <line x1={cx} y1={cy + 36} x2={cx} y2={cy - 118} stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
                <line x1={cx} y1={cy + 36} x2={cx} y2={cy - 118} stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" />

                {/* Open Center Ring (Doughnut) around Hub - Image 2 */}
                <circle cx={cx} cy={cy} r="8.5" fill="none" stroke="#38BDF8" strokeWidth="2.5" />
              </g>
            </g>
          )}

          {/* =========================================================================
              SAPPHIRE CRYSTAL GLASS REFLECTION (Curved Upper Diagonal Glare)
              ========================================================================= */}
          <path
            d={`M ${cx - dialRadius + 18} ${cy - 15} A ${dialRadius - 6} ${dialRadius - 6} 0 0 1 ${cx + dialRadius - 18} ${cy - 15} C ${cx + 75} ${cy - 85}, ${cx - 75} ${cy - 85}, ${cx - dialRadius + 18} ${cy - 15} Z`}
            fill="url(#vluxCrystalGlare)"
            className="pointer-events-none"
          />

          {/* =========================================================================
              THE "NOBE" (KNOB / CENTER HUB) EXACTLY MATCHING REFERENCE IMAGE 3!
              Photorealistic 3D polished chrome sphere dome nut with stepped collar rings
              ========================================================================= */}
          <g filter="url(#vluxNobeShadow)">
            {/* Step 1: Base Stepped Collar Ring (Outer Bevel) */}
            <circle cx={cx} cy={cy} r="12" fill="url(#vluxCollarGrad)" stroke="#090D14" strokeWidth="1.8" />

            {/* Step 2: Intermediate Raised Collar Ring */}
            <circle cx={cx} cy={cy} r="8.5" fill="url(#vluxBezelRimGrad)" stroke="#1F2937" strokeWidth="1" />

            {/* Step 3: Polished Chrome 3D Sphere Dome Nut ("Nobe") - Image 3 */}
            <circle cx={cx} cy={cy} r="6.2" fill="url(#vluxChromeSphereNobe)" stroke="#0F172A" strokeWidth="0.8" />

            {/* Specular Glint Highlight on 3D Dome Sphere */}
            <ellipse
              cx={cx - 1.8}
              cy={cy - 2}
              rx="2.2"
              ry="1.4"
              transform={`rotate(-32 ${cx - 1.8} ${cy - 2})`}
              fill="#FFFFFF"
              fillOpacity="0.95"
            />
            {/* Ambient Micro-Sparkle */}
            <circle cx={cx - 1.2} cy={cy - 1.2} r="0.6" fill="#FFFFFF" />
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
