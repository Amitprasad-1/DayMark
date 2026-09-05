'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Crown, Gem, Compass } from 'lucide-react';

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

type LuxuryFinish = 'royalGold' | 'midnightSapphire' | 'racingEmerald' | 'platinumChrome';

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
  jewelCore: string;
}

const LUXURY_FINISHES: Record<LuxuryFinish, FinishPalette> = {
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
    dialGrad1: '#151720',
    dialGrad2: '#080A0F',
    bezelTrim1: '#FDE68A',
    bezelTrim2: '#B45309',
    handFaceLight: '#FEF08A',
    handFaceDark: '#CA8A04',
    secondHand: '#FDE047',
    secondTip: '#EF4444',
    jewelCore: '#DC2626',
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
    dialGrad1: '#0F172A',
    dialGrad2: '#060A14',
    bezelTrim1: '#E2E8F0',
    bezelTrim2: '#64748B',
    handFaceLight: '#FFFFFF',
    handFaceDark: '#94A3B8',
    secondHand: '#38BDF8',
    secondTip: '#F43F5E',
    jewelCore: '#2563EB',
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
    dialGrad1: '#0C1814',
    dialGrad2: '#050B08',
    bezelTrim1: '#FDE68A',
    bezelTrim2: '#B45309',
    handFaceLight: '#FEF08A',
    handFaceDark: '#CA8A04',
    secondHand: '#34D399',
    secondTip: '#F59E0B',
    jewelCore: '#059669',
  },
  platinumChrome: {
    id: 'platinumChrome',
    label: 'Platinum',
    icon: '✨',
    glow: 'rgba(226, 232, 240, 0.5)',
    accent: '#F1F5F9',
    accentGrad1: '#FFFFFF',
    accentGrad2: '#E2E8F0',
    accentGrad3: '#64748B',
    caseGrad1: '#2C3342',
    caseGrad2: '#161B24',
    caseGrad3: '#0B0E14',
    dialGrad1: '#171B24',
    dialGrad2: '#0B0D12',
    bezelTrim1: '#FFFFFF',
    bezelTrim2: '#94A3B8',
    handFaceLight: '#FFFFFF',
    handFaceDark: '#CBD5E1',
    secondHand: '#EF4444',
    secondTip: '#EF4444',
    jewelCore: '#DC2626',
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

  // Auto-pick default luxury finish by phase, or allow user override
  const defaultFinish: LuxuryFinish =
    selectedPomodoroPhase === 'shortBreak'
      ? 'racingEmerald'
      : selectedPomodoroPhase === 'longBreak'
      ? 'midnightSapphire'
      : 'royalGold';

  const [luxuryFinish, setLuxuryFinish] = useState<LuxuryFinish>(defaultFinish);

  // Sync default finish when phase changes unless overridden
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

  const cx = 200;
  const cy = 240;
  const dialRadius = 140;

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
  const showAlarmHand = !isStopwatch; // In stopwatch mode, no countdown target alarm hand

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

  const focusSectorPath = createArcSector(activeStartDeg, activeEndDeg, dialRadius - 6);
  const focusArcPath = createArcPath(activeStartDeg, activeEndDeg, dialRadius - 6);

  // Elapsed Progress Wedge
  const elapsedEndDeg = minuteToCartesianDeg(Math.min(endMinute, Math.max(startMinute, currentRealMinute)));

  const elapsedSectorPath = createArcSector(activeStartDeg, elapsedEndDeg, dialRadius - 6);

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

  // 12 Classic Numerals
  const numeralRadius = 104;
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

  // 60 Minute Chapter Ring Dots
  const dotRadius = 125;
  const minuteDots = Array.from({ length: 60 }).map((_, i) => {
    const angleDeg = i * 6 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = cx + dotRadius * Math.cos(angleRad);
    const y = cy + dotRadius * Math.sin(angleRad);
    const isMajor = i % 5 === 0;
    const isInFocus = isMinuteInActiveFocus(i);

    return { i, x, y, isMajor, isInFocus };
  });

  const startTimeStr = sessionStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = sessionEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const svgSizeClass = isZen
    ? 'w-[320px] h-[360px] sm:w-[440px] sm:h-[490px] md:w-[500px] md:h-[560px] lg:w-[540px] lg:h-[600px] overflow-visible drop-shadow-[0_25px_70px_rgba(0,0,0,0.95)]'
    : 'w-[290px] h-[330px] sm:w-[350px] sm:h-[395px] md:w-[390px] md:h-[440px] overflow-visible drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]';

  return (
    <div className="relative flex flex-col items-center justify-center select-none z-10">
      {/* Top Controls: Mode Switcher & Luxury Finishes Selector */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 z-20">
        {/* Live Real-Time Focus Session Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#0B0E17]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
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
                  Study Tracking: <span style={{ color: activePal.accent }}>{startTimeStr} → {endTimeStr}</span>
                </>
              )
            ) : (
              <>
                Live Focus: <span style={{ color: activePal.accent }}>{startTimeStr} — {endTimeStr}</span>
              </>
            )}
          </span>
        </div>

        {/* Luxury Finish Theme Pills */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#0B0E17]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
          {(['royalGold', 'midnightSapphire', 'racingEmerald', 'platinumChrome'] as LuxuryFinish[]).map((fId) => {
            const f = LUXURY_FINISHES[fId];
            const isSelected = luxuryFinish === fId;
            return (
              <button
                key={fId}
                type="button"
                onClick={() => setLuxuryFinish(fId)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-white/15 text-white shadow-inner border border-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={`${f.label} Luxury Edition`}
              >
                <span>{f.icon}</span>
                <span className="hidden sm:inline">{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Luxury Masterpiece Alarm Clock */}
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 400 450" className={svgSizeClass}>
          <defs>
            {/* Dynamic Luxury Case Gradient */}
            <radialGradient id="luxCaseGrad" cx="30%" cy="25%" r="85%">
              <stop offset="0%" stopColor={activePal.caseGrad1} />
              <stop offset="35%" stopColor={activePal.caseGrad2} />
              <stop offset="100%" stopColor={activePal.caseGrad3} />
            </radialGradient>

            {/* Polished Gold / Chrome Bezel Rim Gradient */}
            <linearGradient id="luxBezelRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={activePal.bezelTrim1} />
              <stop offset="25%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor={activePal.bezelTrim2} />
              <stop offset="75%" stopColor={activePal.bezelTrim1} />
              <stop offset="100%" stopColor={activePal.bezelTrim2} />
            </linearGradient>

            {/* Bell Metal Metallic Dome Gradient */}
            <radialGradient id="luxBellGrad" cx="32%" cy="28%" r="75%">
              <stop offset="0%" stopColor="#4B5563" />
              <stop offset="20%" stopColor={activePal.caseGrad1} />
              <stop offset="65%" stopColor={activePal.caseGrad2} />
              <stop offset="100%" stopColor="#05070A" />
            </radialGradient>

            {/* Luxury Sunburst Dial Face Gradient */}
            <radialGradient id="luxDialGrad" cx="50%" cy="46%" r="62%">
              <stop offset="0%" stopColor={activePal.dialGrad1} />
              <stop offset="55%" stopColor={activePal.dialGrad2} />
              <stop offset="100%" stopColor="#030407" />
            </radialGradient>

            {/* Highly Visible Luminous Radial Gradient for Active Focus Portion */}
            <radialGradient id="luxFocusFluidGrad" cx={cx} cy={cy} r={dialRadius} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={activePal.accentGrad1} stopOpacity="0.48" />
              <stop offset="55%" stopColor={activePal.accentGrad2} stopOpacity="0.38" />
              <stop offset="85%" stopColor={activePal.accentGrad3} stopOpacity="0.25" />
              <stop offset="100%" stopColor={activePal.accent} stopOpacity="0.18" />
            </radialGradient>

            {/* High-Reflectivity Glass Crystal Glare */}
            <linearGradient id="crystalGlareGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="80%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Hand Light Facet Gradient */}
            <linearGradient id="handFacetLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor={activePal.handFaceLight} />
              <stop offset="100%" stopColor={activePal.accentGrad1} />
            </linearGradient>

            {/* Hand Shadow Facet Gradient */}
            <linearGradient id="handFacetDark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={activePal.handFaceDark} />
              <stop offset="60%" stopColor="#78350F" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1E1609" />
            </linearGradient>

            {/* Center Cap Gold / Chrome Concentric Gradient */}
            <radialGradient id="luxCenterCapGrad" cx="35%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor={activePal.bezelTrim1} />
              <stop offset="70%" stopColor={activePal.bezelTrim2} />
              <stop offset="100%" stopColor="#1E293B" />
            </radialGradient>

            {/* Jewel Pivot Ruby Gradient */}
            <radialGradient id="rubyJewelGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FCA5A5" />
              <stop offset="40%" stopColor={activePal.jewelCore} />
              <stop offset="100%" stopColor="#450A0A" />
            </radialGradient>

            {/* Laser Focus Bloom Glow Filter (Crisp Micro-Bloom) */}
            <filter id="laserGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Volumetric Soft Drop Shadow */}
            <filter id="clockVolumetricShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.85" />
            </filter>
          </defs>

          {/* 1. TOP CARRYING HANDLE (Mirror-Polished Steel & Brass Arch) */}
          <g filter="url(#clockVolumetricShadow)">
            <path
              d="M 120 115 C 120 25, 280 25, 280 115"
              fill="none"
              stroke="url(#luxBezelRimGrad)"
              strokeWidth="9.5"
              strokeLinecap="round"
            />
            {/* Mirror specular ridge line */}
            <path
              d="M 123 113 C 123 29, 277 29, 277 113"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeOpacity="0.75"
              strokeLinecap="round"
            />
            {/* Center knurled fixture nut */}
            <circle cx="200" cy="40" r="7.5" fill="url(#luxBezelRimGrad)" stroke="#1E1408" strokeWidth="1.5" />
            <circle cx="200" cy="40" r="3.5" fill="url(#rubyJewelGrad)" />
          </g>

          {/* 2. ANGLED FEET (Precision Tapered Peg Stand with Polished Spheres) */}
          <g filter="url(#clockVolumetricShadow)">
            {/* Left Peg Leg */}
            <line x1="112" y1="344" x2="70" y2="416" stroke="url(#luxBezelRimGrad)" strokeWidth="11" strokeLinecap="round" />
            <circle cx="70" cy="416" r="8" fill="url(#luxCenterCapGrad)" stroke="#1F2937" strokeWidth="1.5" />
            <ellipse cx="68" cy="423" rx="14" ry="4" fill="#000000" fillOpacity="0.55" />

            {/* Right Peg Leg */}
            <line x1="288" y1="344" x2="330" y2="416" stroke="url(#luxBezelRimGrad)" strokeWidth="11" strokeLinecap="round" />
            <circle cx="330" cy="416" r="8" fill="url(#luxCenterCapGrad)" stroke="#1F2937" strokeWidth="1.5" />
            <ellipse cx="332" cy="423" rx="14" ry="4" fill="#000000" fillOpacity="0.55" />
          </g>

          {/* 3. TWIN BELLS & ARTICULATED STRIKER HAMMER */}
          {/* Bell Mounting Brackets */}
          <line x1="128" y1="138" x2="96" y2="84" stroke="url(#luxBezelRimGrad)" strokeWidth="8" strokeLinecap="round" />
          <line x1="272" y1="138" x2="304" y2="84" stroke="url(#luxBezelRimGrad)" strokeWidth="8" strokeLinecap="round" />

          {/* Center Hammer Stalk */}
          <line x1="200" y1="128" x2="200" y2="86" stroke="url(#luxBezelRimGrad)" strokeWidth="5.5" strokeLinecap="round" />

          {/* Animated Central Striker Hammer */}
          <motion.g
            animate={showRinging ? { rotate: [-16, 16, -16] } : { rotate: 0 }}
            transition={showRinging ? { duration: 0.08, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
            style={{ originX: '200px', originY: '128px' }}
          >
            <rect x="195" y="78" width="10" height="18" rx="3" fill="url(#luxBezelRimGrad)" stroke="#0F172A" strokeWidth="1" />
            <circle cx="200" cy="78" r="7.5" fill="url(#luxCenterCapGrad)" stroke="#0F172A" strokeWidth="1.5" />
          </motion.g>

          {/* Left Bell Cup (Deep Titanium Body with Gold Trim Ring) */}
          <motion.g
            animate={showRinging ? { rotate: [-2, 2, -2] } : { rotate: 0 }}
            transition={showRinging ? { duration: 0.1, repeat: Infinity } : { duration: 0.2 }}
            style={{ originX: '95px', originY: '84px' }}
            filter="url(#clockVolumetricShadow)"
          >
            <circle cx="96" cy="84" r="6" fill="url(#luxBezelRimGrad)" />
            {/* Bell Dome */}
            <path
              d="M 50 110 C 42 58, 126 32, 144 84 C 148 94, 139 108, 125 110 Z"
              fill="url(#luxBellGrad)"
              stroke="#090D14"
              strokeWidth="3"
            />
            {/* Gold / Chrome Rim Lip */}
            <path
              d="M 52 108 C 65 113, 116 113, 127 109"
              fill="none"
              stroke="url(#luxBezelRimGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Specular sheen reflection */}
            <ellipse cx="88" cy="62" rx="18" ry="9" transform="rotate(-28 88 62)" fill="#FFFFFF" fillOpacity="0.28" />
          </motion.g>

          {/* Right Bell Cup (Deep Titanium Body with Gold Trim Ring) */}
          <motion.g
            animate={showRinging ? { rotate: [2, -2, 2] } : { rotate: 0 }}
            transition={showRinging ? { duration: 0.1, repeat: Infinity } : { duration: 0.2 }}
            style={{ originX: '305px', originY: '84px' }}
            filter="url(#clockVolumetricShadow)"
          >
            <circle cx="304" cy="84" r="6" fill="url(#luxBezelRimGrad)" />
            {/* Bell Dome */}
            <path
              d="M 350 110 C 358 58, 274 32, 256 84 C 252 94, 261 108, 275 110 Z"
              fill="url(#luxBellGrad)"
              stroke="#090D14"
              strokeWidth="3"
            />
            {/* Gold / Chrome Rim Lip */}
            <path
              d="M 348 108 C 335 113, 284 113, 273 109"
              fill="none"
              stroke="url(#luxBezelRimGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Specular sheen reflection */}
            <ellipse cx="312" cy="62" rx="18" ry="9" transform="rotate(28 312 62)" fill="#FFFFFF" fillOpacity="0.28" />
          </motion.g>

          {/* 4. MAIN CLOCK HOUSING & MULTI-TIER PRECISION BEZEL */}
          <g filter="url(#clockVolumetricShadow)">
            {/* Tier 1: Outer Heavy Ceramic / Obsidian Frame */}
            <circle cx={cx} cy={cy} r={dialRadius + 24} fill="url(#luxCaseGrad)" stroke="#05070B" strokeWidth="4" />

            {/* Tier 2: 24K Gold / Platinum Polished Bevel Ring */}
            <circle cx={cx} cy={cy} r={dialRadius + 23} fill="none" stroke="url(#luxBezelRimGrad)" strokeWidth="2.5" />

            {/* Tier 3: Fluted Inset Ring */}
            <circle cx={cx} cy={cy} r={dialRadius + 11} fill="#090C14" stroke="#000000" strokeWidth="2" />

            {/* Tier 4: Frosted Platinum Chapter Bezel Ring with Fine Track */}
            <circle cx={cx} cy={cy} r={dialRadius + 9} fill="none" stroke="url(#luxBezelRimGrad)" strokeWidth="3" strokeOpacity="0.75" />

            {/* Tier 5: Sunburst Charcoal Velvet Dial */}
            <circle cx={cx} cy={cy} r={dialRadius - 1} fill="url(#luxDialGrad)" />

            {/* Concentric Guilloché Chapter Rings on Dial */}
            <circle cx={cx} cy={cy} r={dialRadius - 14} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <circle cx={cx} cy={cy} r={dialRadius - 38} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="2 4" />
            <circle cx={cx} cy={cy} r={dialRadius - 65} fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
          </g>

          {/* 5. VIVIDLY HIGHLIGHTED ACTIVE FOCUS / STUDY PORTION */}
          {hasSector && (
            <g>
              {/* A. Luminous Glowing Focus Sector Wedge */}
              <path
                d={focusSectorPath}
                fill="url(#luxFocusFluidGrad)"
                className="transition-all duration-500"
              />

              {/* B. Elapsed Session Arc Slice (Only in Pomodoro mode) */}
              {!isStopwatch && elapsedMinutesFraction > 0.02 && (
                <path
                  d={elapsedSectorPath}
                  fill={activePal.accent}
                  fillOpacity="0.22"
                />
              )}

              {/* C. Radial Divider Boundary Lines (Start & Finish of the portion) */}
              <line
                x1={cx}
                y1={cy}
                x2={startX}
                y2={startY}
                stroke={activePal.accent}
                strokeWidth="2.5"
                strokeDasharray="4 2"
                strokeOpacity="0.9"
              />
              <line
                x1={cx}
                y1={cy}
                x2={endX}
                y2={endY}
                stroke={activePal.accent}
                strokeWidth="3"
                strokeOpacity="0.95"
              />

              {/* D. Perimeter Luminous Neon Glowing Arc */}
              <path
                d={focusArcPath}
                fill="none"
                stroke={activePal.accent}
                strokeWidth="4.5"
                strokeLinecap="round"
                filter="url(#laserGlowFilter)"
              />
              <path
                d={focusArcPath}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeOpacity="0.85"
              />

              {/* E. Start & End Luminous Beacons */}
              <circle cx={startX} cy={startY} r="4.5" fill="#FFFFFF" stroke={activePal.accent} strokeWidth="2" filter="url(#laserGlowFilter)" />
              <circle cx={endX} cy={endY} r="5.5" fill="#FFFFFF" stroke={activePal.accent} strokeWidth="2.5" filter="url(#laserGlowFilter)" />
            </g>
          )}

          {/* 6. 60 PRECISION CHAPTER RING DOTS */}
          <g>
            {minuteDots.map((dot) => {
              const isLit = dot.isInFocus;
              return (
                <circle
                  key={`dot-${dot.i}`}
                  cx={dot.x}
                  cy={dot.y}
                  r={dot.isMajor ? 2.5 : 1.4}
                  fill={
                    isStopwatchReady
                      ? dot.isMajor
                        ? 'rgba(255, 255, 255, 0.65)'
                        : 'rgba(255, 255, 255, 0.25)'
                      : isLit
                      ? activePal.accentGrad1
                      : dot.isMajor
                      ? 'rgba(255, 255, 255, 0.45)'
                      : 'rgba(255, 255, 255, 0.15)'
                  }
                  className="transition-colors duration-300"
                />
              );
            })}
          </g>

          {/* 7. HIGH-CONTRAST ILLUMINATED NUMERALS 1 THROUGH 12 */}
          <g>
            {numerals.map((num) => {
              const isLit = num.isInFocus;
              return (
                <g key={`num-${num.num}`}>
                  {/* Subtle backlight halo behind in-focus numbers (hidden when stopwatch is at 00:00) */}
                  {isLit && !isStopwatchReady && (
                    <circle
                      cx={num.x}
                      cy={num.y}
                      r="16"
                      fill={activePal.accent}
                      fillOpacity="0.18"
                      className="transition-opacity duration-300"
                    />
                  )}
                  <text
                    x={num.x}
                    y={num.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={num.num === 12 ? '26' : '24'}
                    fontWeight="900"
                    fontFamily="'Cinzel', 'Playfair Display', 'Georgia', serif"
                    fill={
                      isStopwatchReady
                        ? 'rgba(241, 245, 249, 0.92)'
                        : isLit
                        ? '#FFFFFF'
                        : 'rgba(100, 116, 139, 0.22)'
                    }
                    className="transition-all duration-300 select-none pointer-events-none"
                    style={{
                      textShadow: isStopwatchReady
                        ? '0 0 8px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.95)'
                        : isLit
                        ? `0 0 16px ${activePal.glow}, 0 0 6px #FFFFFF, 0 2px 4px rgba(0,0,0,0.95)`
                        : '0 1px 2px rgba(0,0,0,0.9)',
                    }}
                  >
                    {num.num}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 8. LUXURY HOROLOGY INSCRIPTION */}
          <g>
            <text
              x={cx}
              y={cy + 50}
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="800"
              fontFamily="'Cinzel', 'Playfair Display', sans-serif"
              letterSpacing="0.32em"
              fill={activePal.bezelTrim1}
              fillOpacity="0.9"
            >
              QUARTZ
            </text>
            <text
              x={cx}
              y={cy + 65}
              textAnchor="middle"
              fontSize="8"
              fontWeight="700"
              fontFamily="sans-serif"
              letterSpacing="0.22em"
              fill={activePal.accent}
              fillOpacity="0.85"
            >
              DAYMARK • CHRONOMETER
            </text>
          </g>

          {/* 9. ALARM TARGET HAND (Only shown in Pomodoro mode where there is a target) */}
          {showAlarmHand && (
            <g transform={`rotate(${alarmHandAngle} ${cx} ${cy})`}>
              <path
                d={`M ${cx - 3.5} ${cy - 12} L ${cx} ${cy - 68} L ${cx + 3.5} ${cy - 12} Z`}
                fill="url(#luxBezelRimGrad)"
                stroke="#090D16"
                strokeWidth="1"
              />
              {/* Luminous indicator arrow tip */}
              <polygon
                points={`${cx - 5},${cy - 52} ${cx},${cy - 68} ${cx + 5},${cy - 52}`}
                fill={activePal.accent}
                filter="url(#laserGlowFilter)"
              />
            </g>
          )}

          {/* 10. 3D FACETED HOUR HAND (Beveled Light & Shadow Facets) */}
          <g transform={`rotate(${hourHandAngle} ${cx} ${cy})`} filter="url(#clockVolumetricShadow)">
            {/* Counterweight Tail */}
            <rect x={cx - 3.5} y={cy} width="7" height="24" rx="2" fill="url(#handFacetLight)" stroke="#1F2937" strokeWidth="0.8" />

            {/* Left Beveled Facet (Reflective Highlight) */}
            <path
              d={`M ${cx - 5.5} ${cy} L ${cx - 4.5} ${cy - 58} L ${cx} ${cy - 70} L ${cx} ${cy} Z`}
              fill="url(#handFacetLight)"
            />
            {/* Right Beveled Facet (Shadow Depth) */}
            <path
              d={`M ${cx} ${cy} L ${cx} ${cy - 70} L ${cx + 4.5} ${cy - 58} L ${cx + 5.5} ${cy} Z`}
              fill="url(#handFacetDark)"
            />
            {/* Center Ridge Crease */}
            <line x1={cx} y1={cy} x2={cx} y2={cy - 70} stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.7" />

            {/* Luminous Aperture Slot */}
            <rect
              x={cx - 2}
              y={cy - 54}
              width="4"
              height="28"
              rx="1.5"
              fill="#FFFFFF"
              fillOpacity="0.95"
            />
          </g>

          {/* 11. 3D FACETED MINUTE HAND (Longer Diamond Sword Hand) */}
          <g transform={`rotate(${minuteHandAngle} ${cx} ${cy})`} filter="url(#clockVolumetricShadow)">
            {/* Counterweight Tail */}
            <rect x={cx - 3} y={cy} width="6" height="28" rx="2" fill="url(#handFacetLight)" stroke="#1F2937" strokeWidth="0.8" />

            {/* Left Beveled Facet (Reflective Highlight) */}
            <path
              d={`M ${cx - 4.5} ${cy} L ${cx - 3.5} ${cy - 88} L ${cx} ${cy - 102} L ${cx} ${cy} Z`}
              fill="url(#handFacetLight)"
            />
            {/* Right Beveled Facet (Shadow Depth) */}
            <path
              d={`M ${cx} ${cy} L ${cx} ${cy - 102} L ${cx + 3.5} ${cy - 88} L ${cx + 4.5} ${cy} Z`}
              fill="url(#handFacetDark)"
            />
            {/* Center Ridge Crease */}
            <line x1={cx} y1={cy} x2={cx} y2={cy - 102} stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.8" />

            {/* Luminous Aperture Slot with Glow */}
            <rect
              x={cx - 1.8}
              y={cy - 82}
              width="3.6"
              height="46"
              rx="1.8"
              fill={activePal.accentGrad1}
              fillOpacity="0.95"
              filter="url(#laserGlowFilter)"
            />
          </g>

          {/* 12. SAPPHIRE CRYSTAL GLASS REFLECTION (Curved Upper Diagonal Glare) */}
          <path
            d={`M ${cx - dialRadius + 18} ${cy - 20} A ${dialRadius - 4} ${dialRadius - 4} 0 0 1 ${cx + dialRadius - 20} ${cy - 20} C ${cx + 70} ${cy - 80}, ${cx - 70} ${cy - 80}, ${cx - dialRadius + 18} ${cy - 20} Z`}
            fill="url(#crystalGlareGrad)"
            className="pointer-events-none"
          />

          {/* 13. NEEDLE SECOND HAND (Polished Needle with Smooth Ticking) */}
          <g transform={`rotate(${secondHandAngle} ${cx} ${cy})`}>
            {/* Slender Needle Shaft */}
            <line x1={cx} y1={cy + 30} x2={cx} y2={cy - 108} stroke={activePal.secondHand} strokeWidth="1.6" strokeLinecap="round" />
            {/* Counterbalance Disc */}
            <circle cx={cx} cy={cy + 22} r="4.5" fill="url(#luxCenterCapGrad)" stroke="#1F2937" strokeWidth="1" />
            {/* Luminous Active Arrow / Pip Tip */}
            <circle cx={cx} cy={cy - 98} r="2.8" fill={activePal.secondTip} filter="url(#laserGlowFilter)" />
          </g>

          {/* 14. MULTI-LAYER CENTER ARBOR WITH RUBY JEWEL CORE */}
          <g>
            {/* Outer Beveled Gold / Steel Collar */}
            <circle cx={cx} cy={cy} r="9.5" fill="url(#luxCenterCapGrad)" stroke="#090D14" strokeWidth="1.8" />
            {/* Inner Ring */}
            <circle cx={cx} cy={cy} r="5.5" fill="url(#luxBezelRimGrad)" />
            {/* Polished Ruby Bearing Core */}
            <circle cx={cx} cy={cy} r="3" fill="url(#rubyJewelGrad)" />
            {/* Specular Micro Sparkle on Jewel */}
            <circle cx={cx - 1} cy={cy - 1} r="0.8" fill="#FFFFFF" />
          </g>
        </svg>
      </div>

      {/* Digital Precision Readout (Luxury Horology Pill) */}
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
