'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Circle, Palette, Sparkles, SlidersHorizontal, Check, Disc3, ShieldAlert } from 'lucide-react';

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

export type HandStyle =
  | 'vintageSpade'
  | 'breguet'
  | 'cathedral'
  | 'dauphineSword'
  | 'arrowField'
  | 'artDeco'
  | 'skeleton'
  | 'modernStudio';

export type CenterNobeStyle = 'chromeSphere' | 'rubyJewel' | 'goldRosette' | 'stealthOnyx';

export type ClockFrameStyle = 'round' | 'twinBell';

export type LuxuryFinish = 'noirChrome' | 'royalGold' | 'midnightSapphire' | 'racingEmerald';

export type HandColorPreset =
  | 'auto'
  | 'emeraldGold'
  | 'goldCyan'
  | 'crimsonCyan'
  | 'sapphireOrange'
  | 'roseGoldPlat'
  | 'cyberpunkNeon'
  | 'imperialAmber'
  | 'stealthFlame'
  | 'pastelMint'
  | 'onyxGold';

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
    // Hour: 24K Sunburst Gold
    hourHandLight: '#FEF08A',
    hourHandMid: '#F59E0B',
    hourHandDark: '#B45309',
    hourSpine: '#FEF9C3',
    // Minute: Electric Cyan Blue (Zero White!)
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
    hourHandLight: '#FDE68A',
    hourHandMid: '#D97706',
    hourHandDark: '#78350F',
    hourSpine: '#FEF08A',
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
    hourHandLight: '#7DD3FC',
    hourHandMid: '#0284C7',
    hourHandDark: '#075985',
    hourSpine: '#BAE6FD',
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
    hourHandLight: '#6EE7B7',
    hourHandMid: '#10B981',
    hourHandDark: '#047857',
    hourSpine: '#A7F3D0',
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

// 10 Eye-Catching, High-Contrast Dual-Tone Color Presets (Zero washed-out white!)
const HAND_COLOR_PRESETS: Record<
  Exclude<HandColorPreset, 'auto'>,
  {
    label: string;
    desc: string;
    hourColor: string;
    minuteColor: string;
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
  emeraldGold: {
    label: 'Emerald & Gold',
    desc: 'Rolex Cosmograph Daytona',
    hourColor: '#10B981',
    minuteColor: '#F59E0B',
    hourLight: '#6EE7B7',
    hourMid: '#10B981',
    hourDark: '#047857',
    hourSpine: '#A7F3D0',
    minuteLight: '#FEF08A',
    minuteMid: '#F59E0B',
    minuteDark: '#B45309',
    minuteSpine: '#FEF9C3',
  },
  goldCyan: {
    label: 'Gold & Cyan',
    desc: 'Supernova Dual Luxury',
    hourColor: '#F59E0B',
    minuteColor: '#00D8FF',
    hourLight: '#FEF08A',
    hourMid: '#F59E0B',
    hourDark: '#B45309',
    hourSpine: '#FEF9C3',
    minuteLight: '#7DD3FC',
    minuteMid: '#0284C7',
    minuteDark: '#0369A1',
    minuteSpine: '#E0F2FE',
  },
  crimsonCyan: {
    label: 'Crimson & Azure',
    desc: 'Cyberpunk Neon Matrix',
    hourColor: '#F43F5E',
    minuteColor: '#38BDF8',
    hourLight: '#FDA4AF',
    hourMid: '#E11D48',
    hourDark: '#9F1239',
    hourSpine: '#FFE4E6',
    minuteLight: '#7DD3FC',
    minuteMid: '#0284C7',
    minuteDark: '#0369A1',
    minuteSpine: '#E0F2FE',
  },
  sapphireOrange: {
    label: 'Sapphire & Tangerine',
    desc: 'Gulf Racing Chronograph',
    hourColor: '#3B82F6',
    minuteColor: '#F97316',
    hourLight: '#93C5FD',
    hourMid: '#2563EB',
    hourDark: '#1E40AF',
    hourSpine: '#DBEAFE',
    minuteLight: '#FED7AA',
    minuteMid: '#EA580C',
    minuteDark: '#9A3412',
    minuteSpine: '#FFEDD5',
  },
  roseGoldPlat: {
    label: 'Rose Gold & Platinum',
    desc: 'Mayfair Haute Horlogerie',
    hourColor: '#FB7185',
    minuteColor: '#94A3B8',
    hourLight: '#FECDD3',
    hourMid: '#F43F5E',
    hourDark: '#BE123C',
    hourSpine: '#FFF1F2',
    minuteLight: '#E2E8F0',
    minuteMid: '#64748B',
    minuteDark: '#334155',
    minuteSpine: '#F8FAFC',
  },
  cyberpunkNeon: {
    label: 'Magenta & Toxic Lime',
    desc: 'Synthwave Velocity',
    hourColor: '#EC4899',
    minuteColor: '#84CC16',
    hourLight: '#F472B6',
    hourMid: '#DB2777',
    hourDark: '#831843',
    hourSpine: '#FCE7F3',
    minuteLight: '#BEF264',
    minuteMid: '#84CC16',
    minuteDark: '#4D7C0F',
    minuteSpine: '#ECFCCB',
  },
  imperialAmber: {
    label: 'Imperial Violet & Amber',
    desc: 'Tokyo Midnight Emperor',
    hourColor: '#A855F7',
    minuteColor: '#EAB308',
    hourLight: '#D8B4FE',
    hourMid: '#9333EA',
    hourDark: '#581C87',
    hourSpine: '#F3E8FF',
    minuteLight: '#FDE047',
    minuteMid: '#EAB308',
    minuteDark: '#854D0E',
    minuteSpine: '#FEF9C3',
  },
  stealthFlame: {
    label: 'Titanium & Flame',
    desc: 'Stealth Interceptor Fighter',
    hourColor: '#64748B',
    minuteColor: '#EF4444',
    hourLight: '#CBD5E1',
    hourMid: '#475569',
    hourDark: '#1E293B',
    hourSpine: '#E2E8F0',
    minuteLight: '#FCA5A5',
    minuteMid: '#EF4444',
    minuteDark: '#991B1B',
    minuteSpine: '#FEE2E2',
  },
  pastelMint: {
    label: 'Mint Frost & Lilac',
    desc: 'Nordic Aurora Glow',
    hourColor: '#34D399',
    minuteColor: '#A78BFA',
    hourLight: '#A7F3D0',
    hourMid: '#10B981',
    hourDark: '#047857',
    hourSpine: '#D1FAE5',
    minuteLight: '#DDD6FE',
    minuteMid: '#8B5CF6',
    minuteDark: '#5B21B6',
    minuteSpine: '#EDE9FE',
  },
  onyxGold: {
    label: 'Polished Onyx & 24K Gold',
    desc: 'Black Tie Tuxedo Edition',
    hourColor: '#475569',
    minuteColor: '#F59E0B',
    hourLight: '#64748B',
    hourMid: '#334155',
    hourDark: '#0F172A',
    hourSpine: '#94A3B8',
    minuteLight: '#FEF08A',
    minuteMid: '#F59E0B',
    minuteDark: '#B45309',
    minuteSpine: '#FEF9C3',
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

  // Persistence hooks for user customization
  const [handStyle, setHandStyle] = useState<HandStyle>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('daymark_clock_hand_style') as HandStyle;
      if (saved) return saved;
    }
    return 'vintageSpade';
  });

  const [centerNobeStyle, setCenterNobeStyle] = useState<CenterNobeStyle>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('daymark_clock_center_nobe') as CenterNobeStyle;
      if (saved) return saved;
    }
    return 'chromeSphere';
  });

  const [handColorPreset, setHandColorPreset] = useState<HandColorPreset>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('daymark_clock_hand_color') as HandColorPreset;
      if (saved) return saved;
    }
    return 'emeraldGold'; // Default to stunning emerald & gold instead of auto/white
  });

  const [frameStyle, setFrameStyle] = useState<ClockFrameStyle>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('daymark_clock_frame_style') as ClockFrameStyle;
      if (saved) return saved;
    }
    return 'round';
  });

  const [handGlowEnabled, setHandGlowEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('daymark_clock_hand_glow');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const [showCustomizer, setShowCustomizer] = useState(false);
  const [activeCustomizerTab, setActiveCustomizerTab] = useState<'hands' | 'colors' | 'nobe' | 'dial'>('colors');

  // Persist preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('daymark_clock_hand_style', handStyle);
    }
  }, [handStyle]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('daymark_clock_center_nobe', centerNobeStyle);
    }
  }, [centerNobeStyle]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('daymark_clock_hand_color', handColorPreset);
    }
  }, [handColorPreset]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('daymark_clock_frame_style', frameStyle);
    }
  }, [frameStyle]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('daymark_clock_hand_glow', String(handGlowEnabled));
    }
  }, [handGlowEnabled]);

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

  // 8 MASTER HOROLOGY HAND RENDERING STYLES
  const renderHourHandBody = () => {
    switch (handStyle) {
      case 'vintageSpade':
        // EXACT silhouette from user's close-up photo: flared bulb, circular lobe, straight parallel tip with rounded capsule cap
        return (
          <>
            <path
              d="M -1.1,0 L -1.1,16 A 1.1 1.1 0 0 0 1.1,16 L 1.1,0 Z"
              fill="url(#vluxHourHandMetalGrad)"
              stroke="rgba(0,0,0,0.6)"
              strokeWidth="0.8"
            />
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
            <line x1="0" y1="-8" x2="0" y2="-66" stroke={resolvedHandColors.hourSpine} strokeWidth="0.75" strokeOpacity="0.85" />
          </>
        );

      case 'breguet':
        // Iconic Royal Breguet Moon / Ring Hand
        return (
          <>
            <rect x="-1" y="0" width="2" height="15" rx="1" fill="url(#vluxHourHandMetalGrad)" stroke="#000" strokeWidth="0.6" />
            <line x1="0" y1="-7" x2="0" y2="-43" stroke="url(#vluxHourHandMetalGrad)" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="0" cy="-48" r="6.2" fill="url(#vluxHourHandMetalGrad)" stroke="#000000" strokeWidth="0.7" />
            <circle cx="0" cy="-48" r="3.4" fill="#04060A" />
            <line x1="0" y1="-54.2" x2="0" y2="-68" stroke="url(#vluxHourHandMetalGrad)" strokeWidth="1.8" strokeLinecap="round" />
          </>
        );

      case 'cathedral':
        // Historic Cathedral Aviator Lattice Hand
        return (
          <>
            <rect x="-1.2" y="0" width="2.4" height="16" rx="1.2" fill="url(#vluxHourHandMetalGrad)" stroke="#000" strokeWidth="0.6" />
            <path
              d="M -1.2,-7 L -1.2,-30 L -5,-44 L 0,-60 L 5,-44 L 1.2,-30 L 1.2,-7 Z"
              fill="url(#vluxHourHandMetalGrad)"
              stroke="#000000"
              strokeWidth="0.8"
            />
            <path d="M -3,-44 L 0,-54 L 3,-44 L 0,-34 Z" fill="#04060A" />
            <line x1="-3" y1="-44" x2="3" y2="-44" stroke="url(#vluxHourHandMetalGrad)" strokeWidth="0.8" />
            <line x1="0" y1="-60" x2="0" y2="-69" stroke="url(#vluxHourHandMetalGrad)" strokeWidth="2" strokeLinecap="round" />
          </>
        );

      case 'dauphineSword':
        // Sharp Patek/Grand Seiko Diamond Sword Hand
        return (
          <>
            <polygon points="-1,0 0,16 1,0" fill="url(#vluxHourHandMetalGrad)" stroke="#000" strokeWidth="0.5" />
            <polygon points="0,-7 -5,-32 0,-70" fill={resolvedHandColors.hourLight} stroke="#000" strokeWidth="0.6" />
            <polygon points="0,-7 5,-32 0,-70" fill={resolvedHandColors.hourDark} stroke="#000" strokeWidth="0.6" />
            <line x1="0" y1="-7" x2="0" y2="-70" stroke={resolvedHandColors.hourSpine} strokeWidth="0.8" strokeOpacity="0.9" />
          </>
        );

      case 'arrowField':
        // Military Broad Arrow / Speedmaster Navigator
        return (
          <>
            <rect x="-1.2" y="0" width="2.4" height="16" rx="1.2" fill="url(#vluxHourHandMetalGrad)" stroke="#000" strokeWidth="0.6" />
            <line x1="0" y1="-7" x2="0" y2="-48" stroke="url(#vluxHourHandMetalGrad)" strokeWidth="3" strokeLinecap="round" />
            {/* Broad Arrowhead */}
            <polygon points="0,-68 -6.5,-48 -2,-49 -2,-45 2,-45 2,-49 6.5,-48" fill="url(#vluxHourHandMetalGrad)" stroke="#000000" strokeWidth="0.8" />
            {/* Arrow Lumen Inset */}
            <polygon points="0,-64 -3.8,-50 3.8,-50" fill={resolvedHandColors.hourLight} />
          </>
        );

      case 'artDeco':
        // 1920s Art Deco Stepped Skyscraper
        return (
          <>
            <polygon points="-1.5,0 0,16 1.5,0" fill="url(#vluxHourHandMetalGrad)" stroke="#000" strokeWidth="0.5" />
            <path
              d="M -3.5,-7 L -3.5,-25 L -2.5,-25 L -2.5,-42 L -1.5,-42 L -1.5,-58 L 0,-68 L 1.5,-58 L 1.5,-42 L 2.5,-42 L 2.5,-25 L 3.5,-25 L 3.5,-7 Z"
              fill="url(#vluxHourHandMetalGrad)"
              stroke="#000000"
              strokeWidth="0.8"
            />
            <line x1="0" y1="-7" x2="0" y2="-66" stroke={resolvedHandColors.hourSpine} strokeWidth="0.8" />
          </>
        );

      case 'skeleton':
        // Haute Horlogerie Skeleton Openworked Hand
        return (
          <>
            <rect x="-1" y="0" width="2" height="16" rx="1" fill="url(#vluxHourHandMetalGrad)" stroke="#000" strokeWidth="0.6" />
            <path
              d="M -3,-7 L -3,-54 L 0,-68 L 3,-54 L 3,-7 Z"
              fill="none"
              stroke="url(#vluxHourHandMetalGrad)"
              strokeWidth="1.6"
            />
            {/* Center Open Hollow Window */}
            <path d="M -1.4,-12 L -1.4,-52 L 0,-62 L 1.4,-52 L 1.4,-12 Z" fill="#04060A" />
            {/* Diamond Center Bridge */}
            <line x1="-2.8" y1="-32" x2="2.8" y2="-32" stroke="url(#vluxHourHandMetalGrad)" strokeWidth="1.2" />
          </>
        );

      case 'modernStudio':
      default:
        // Clean Bauhaus Rounded Baton (Image 2)
        return (
          <rect x="-4" y="-72" width="8" height="84" rx="4" fill="url(#vluxHourHandMetalGrad)" stroke="#0A0E17" strokeWidth="1.2" />
        );
    }
  };

  const renderMinuteHandBody = () => {
    switch (handStyle) {
      case 'vintageSpade':
        // EXACT silhouette from user's close-up photo: flared bulb, circular lobe, straight parallel tip with rounded capsule cap
        return (
          <>
            <path
              d="M -1.1,0 L -1.1,20 A 1.1 1.1 0 0 0 1.1,20 L 1.1,0 Z"
              fill="url(#vluxMinuteHandMetalGrad)"
              stroke="rgba(0,0,0,0.6)"
              strokeWidth="0.8"
            />
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
            <line x1="0" y1="-8" x2="0" y2="-107" stroke={resolvedHandColors.minuteSpine} strokeWidth="0.75" strokeOpacity="0.85" />
          </>
        );

      case 'breguet':
        // Iconic Royal Breguet Moon / Ring Hand
        return (
          <>
            <rect x="-1" y="0" width="2" height="18" rx="1" fill="url(#vluxMinuteHandMetalGrad)" stroke="#000" strokeWidth="0.6" />
            <line x1="0" y1="-7" x2="0" y2="-82" stroke="url(#vluxMinuteHandMetalGrad)" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="0" cy="-88" r="6.8" fill="url(#vluxMinuteHandMetalGrad)" stroke="#000000" strokeWidth="0.7" />
            <circle cx="0" cy="-88" r="3.6" fill="#04060A" />
            <line x1="0" y1="-95" x2="0" y2="-111" stroke="url(#vluxMinuteHandMetalGrad)" strokeWidth="1.8" strokeLinecap="round" />
          </>
        );

      case 'cathedral':
        // Historic Cathedral Aviator Lattice Hand
        return (
          <>
            <rect x="-1.2" y="0" width="2.4" height="18" rx="1.2" fill="url(#vluxMinuteHandMetalGrad)" stroke="#000" strokeWidth="0.6" />
            <path
              d="M -1.2,-7 L -1.2,-58 L -5,-76 L 0,-98 L 5,-76 L 1.2,-58 L 1.2,-7 Z"
              fill="url(#vluxMinuteHandMetalGrad)"
              stroke="#000000"
              strokeWidth="0.8"
            />
            <path d="M -3.2,-76 L 0,-90 L 3.2,-76 L 0,-62 Z" fill="#04060A" />
            <line x1="-3.2" y1="-76" x2="3.2" y2="-76" stroke="url(#vluxMinuteHandMetalGrad)" strokeWidth="0.8" />
            <line x1="0" y1="-98" x2="0" y2="-111" stroke="url(#vluxMinuteHandMetalGrad)" strokeWidth="2" strokeLinecap="round" />
          </>
        );

      case 'dauphineSword':
        // Sharp Patek/Grand Seiko Diamond Sword Hand
        return (
          <>
            <polygon points="-1,0 0,18 1,0" fill="url(#vluxMinuteHandMetalGrad)" stroke="#000" strokeWidth="0.5" />
            <polygon points="0,-7 -4.8,-45 0,-111" fill={resolvedHandColors.minuteLight} stroke="#000" strokeWidth="0.6" />
            <polygon points="0,-7 4.8,-45 0,-111" fill={resolvedHandColors.minuteDark} stroke="#000" strokeWidth="0.6" />
            <line x1="0" y1="-7" x2="0" y2="-111" stroke={resolvedHandColors.minuteSpine} strokeWidth="0.8" strokeOpacity="0.9" />
          </>
        );

      case 'arrowField':
        // Military Broad Arrow / Speedmaster Navigator
        return (
          <>
            <rect x="-1.2" y="0" width="2.4" height="18" rx="1.2" fill="url(#vluxMinuteHandMetalGrad)" stroke="#000" strokeWidth="0.6" />
            <line x1="0" y1="-7" x2="0" y2="-88" stroke="url(#vluxMinuteHandMetalGrad)" strokeWidth="2.8" strokeLinecap="round" />
            {/* Elongated Arrowhead */}
            <polygon points="0,-111 -5.8,-88 -2,-89 -2,-84 2,-84 2,-89 5.8,-88" fill="url(#vluxMinuteHandMetalGrad)" stroke="#000000" strokeWidth="0.8" />
            <polygon points="0,-107 -3.5,-90 3.5,-90" fill={resolvedHandColors.minuteLight} />
          </>
        );

      case 'artDeco':
        // 1920s Art Deco Stepped Skyscraper
        return (
          <>
            <polygon points="-1.5,0 0,18 1.5,0" fill="url(#vluxMinuteHandMetalGrad)" stroke="#000" strokeWidth="0.5" />
            <path
              d="M -3.2,-7 L -3.2,-40 L -2.2,-40 L -2.2,-68 L -1.4,-68 L -1.4,-98 L 0,-111 L 1.4,-98 L 1.4,-68 L 2.2,-68 L 2.2,-40 L 3.2,-40 L 3.2,-7 Z"
              fill="url(#vluxMinuteHandMetalGrad)"
              stroke="#000000"
              strokeWidth="0.8"
            />
            <line x1="0" y1="-7" x2="0" y2="-108" stroke={resolvedHandColors.minuteSpine} strokeWidth="0.8" />
          </>
        );

      case 'skeleton':
        // Haute Horlogerie Skeleton Openworked Hand
        return (
          <>
            <rect x="-1" y="0" width="2" height="18" rx="1" fill="url(#vluxMinuteHandMetalGrad)" stroke="#000" strokeWidth="0.6" />
            <path
              d="M -2.8,-7 L -2.8,-94 L 0,-111 L 2.8,-94 L 2.8,-7 Z"
              fill="none"
              stroke="url(#vluxMinuteHandMetalGrad)"
              strokeWidth="1.5"
            />
            {/* Center Open Hollow Window */}
            <path d="M -1.3,-12 L -1.3,-90 L 0,-104 L 1.3,-90 L 1.3,-12 Z" fill="#04060A" />
            {/* Twin Diamond Lattice Bridges */}
            <line x1="-2.6" y1="-44" x2="2.6" y2="-44" stroke="url(#vluxMinuteHandMetalGrad)" strokeWidth="1.1" />
            <line x1="-2.6" y1="-72" x2="2.6" y2="-72" stroke="url(#vluxMinuteHandMetalGrad)" strokeWidth="1.1" />
          </>
        );

      case 'modernStudio':
      default:
        // Clean Bauhaus Rounded Baton (Image 2)
        return (
          <rect x="-3.5" y="-112" width="7" height="126" rx="3.5" fill="url(#vluxMinuteHandMetalGrad)" stroke="#0A0E17" strokeWidth="1.2" />
        );
    }
  };

  // Center "Nobe" rendering helper
  const renderCenterNobe = () => {
    switch (centerNobeStyle) {
      case 'rubyJewel':
        return (
          <g filter="url(#vluxNobeShadow)">
            {/* Polished Gold Bezel Setting */}
            <circle cx={cx} cy={cy} r="8.5" fill="url(#vluxCollarGrad)" stroke="#78350F" strokeWidth="1" />
            <circle cx={cx} cy={cy} r="6.8" fill="#F59E0B" stroke="#92400E" strokeWidth="0.6" />
            {/* Synthetic Ruby Cabochon Jewel */}
            <circle cx={cx} cy={cy} r="5.2" fill="url(#vluxRubyJewelGrad)" stroke="#4C0519" strokeWidth="0.6" />
            {/* Ruby Specular Glint */}
            <ellipse
              cx={cx - 1.5}
              cy={cy - 1.6}
              rx="1.7"
              ry="1.0"
              transform={`rotate(-35 ${cx - 1.5} ${cy - 1.6})`}
              fill="#FFE4E6"
              fillOpacity="0.95"
            />
          </g>
        );

      case 'goldRosette':
        return (
          <g filter="url(#vluxNobeShadow)">
            {/* 24K Fluted Rosette Bezel */}
            <circle cx={cx} cy={cy} r="8.8" fill="url(#vluxCollarGrad)" stroke="#78350F" strokeWidth="1" />
            {/* Radiating Flutes */}
            {Array.from({ length: 12 }).map((_, idx) => {
              const rad = (idx * 30 * Math.PI) / 180;
              return (
                <line
                  key={`flute-${idx}`}
                  x1={cx + 5 * Math.cos(rad)}
                  y1={cy + 5 * Math.sin(rad)}
                  x2={cx + 8 * Math.cos(rad)}
                  y2={cy + 8 * Math.sin(rad)}
                  stroke="#78350F"
                  strokeWidth="0.8"
                />
              );
            })}
            <circle cx={cx} cy={cy} r="5.4" fill="url(#vluxGoldRosetteGrad)" stroke="#92400E" strokeWidth="0.8" />
            <circle cx={cx} cy={cy} r="2.2" fill="#FEF08A" />
          </g>
        );

      case 'stealthOnyx':
        return (
          <g filter="url(#vluxNobeShadow)">
            {/* Titanium Outer Collar */}
            <circle cx={cx} cy={cy} r="8.5" fill="#334155" stroke="#0F172A" strokeWidth="1" />
            <circle cx={cx} cy={cy} r="6.8" fill="#1E293B" stroke="#0F172A" strokeWidth="0.6" />
            {/* Deep Jet Onyx Dome */}
            <circle cx={cx} cy={cy} r="5.2" fill="url(#vluxOnyxGrad)" stroke="#020617" strokeWidth="0.6" />
            <ellipse
              cx={cx - 1.5}
              cy={cy - 1.6}
              rx="1.6"
              ry="0.9"
              transform={`rotate(-35 ${cx - 1.5} ${cy - 1.6})`}
              fill="#FFFFFF"
              fillOpacity="0.75"
            />
          </g>
        );

      case 'chromeSphere':
      default:
        // 3D Polished Chrome Sphere Dome Nut (Photo Reference)
        return (
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
        );
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none z-10">
      {/* =========================================================================
          TOP INTERACTIVE QUICK-CONTROLS STRIP (Always visible, deeply interactive!)
          ========================================================================= */}
      <div className="mb-2 flex flex-wrap items-center justify-center gap-2 z-20 max-w-4xl px-2">
        {/* Live Focus Session Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-[#0B0E17]/90 border border-white/10 shadow-xl backdrop-blur-xl">
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
                <>Stopwatch: <span style={{ color: activePal.accent }}>Ready</span></>
              ) : (
                <>Study: <span style={{ color: activePal.accent }}>{startTimeStr} → {endTimeStr}</span></>
              )
            ) : (
              <>Focus: <span style={{ color: activePal.accent }}>{startTimeStr} — {endTimeStr}</span></>
            )}
          </span>
        </div>

        {/* Master Interactive Watch Studio Trigger */}
        <button
          type="button"
          onClick={() => setShowCustomizer((prev) => !prev)}
          className={`px-3 py-1 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xl border backdrop-blur-xl ${
            showCustomizer
              ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
              : 'bg-[#0B0E17]/90 text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
          }`}
          title="Open interactive studio to customize hand styles, dual-tone colors, and nobe shapes"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Watch Studio</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/25 font-mono">
            {handStyle.slice(0, 7)}
          </span>
        </button>

        {/* Frame Style (Round vs Twin Bell) */}
        <div className="flex items-center gap-1 p-0.5 rounded-2xl bg-[#0B0E17]/90 border border-white/10 shadow-xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setFrameStyle('round')}
            className={`px-2 py-0.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
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
            className={`px-2 py-0.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
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
      </div>

      {/* =========================================================================
          EXPANDABLE MASTER HOROLOGY STUDIO (Hands, Colors, Nobe, Finishes)
          ========================================================================= */}
      <AnimatePresence>
        {showCustomizer && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="mb-3 w-full max-w-3xl p-3.5 rounded-3xl bg-[#080C16]/95 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-30 flex flex-col gap-3"
          >
            {/* Customizer Sub-Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1">
                {[
                  { id: 'colors', label: '10 Color Pairs', icon: '🎨' },
                  { id: 'hands', label: '8 Hand ("Nobe") Styles', icon: '🗡️' },
                  { id: 'nobe', label: 'Center Hub Cap', icon: '🔘' },
                  { id: 'dial', label: 'Dial Edition', icon: '✨' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCustomizerTab(tab.id as any)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      activeCustomizerTab === tab.id
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-inner'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Luminescent Hand Aura Toggle */}
              <button
                type="button"
                onClick={() => setHandGlowEnabled((prev) => !prev)}
                className={`px-2 py-0.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                  handGlowEnabled
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40 shadow-inner'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
                title="Toggle laser neon glow around hands"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>Aura: {handGlowEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* TAB 1: 10 HIGH-CONTRAST DUAL-TONE COLOR PRESETS */}
            {activeCustomizerTab === 'colors' && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    <span>Eye-Catching Dual-Tone Palettes (Hour Hand vs Minute Hand):</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">Zero Washed-Out White</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {/* Theme Auto */}
                  <button
                    type="button"
                    onClick={() => setHandColorPreset('auto')}
                    className={`p-2 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${
                      handColorPreset === 'auto'
                        ? 'bg-amber-500/25 border-amber-400/60 text-white shadow-lg ring-1 ring-amber-400/50'
                        : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center -space-x-1 mb-1">
                      <span className="w-3.5 h-3.5 rounded-full ring-1 ring-black" style={{ backgroundColor: activePal.hourHandMid }} />
                      <span className="w-3.5 h-3.5 rounded-full ring-1 ring-black" style={{ backgroundColor: activePal.minuteHandMid }} />
                    </div>
                    <span className="text-[11px] font-bold leading-tight">Theme Auto</span>
                    <span className="text-[9px] text-slate-400 font-mono">Sync Dial</span>
                  </button>

                  {/* 10 Curated Palettes */}
                  {(Object.keys(HAND_COLOR_PRESETS) as Array<Exclude<HandColorPreset, 'auto'>>).map((k) => {
                    const p = HAND_COLOR_PRESETS[k];
                    const isSel = handColorPreset === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setHandColorPreset(k)}
                        className={`p-2 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${
                          isSel
                            ? 'bg-white/20 border-white/50 text-white shadow-lg ring-1 ring-white/50'
                            : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'
                        }`}
                      >
                        <div className="flex items-center -space-x-1 mb-1">
                          <span className="w-3.5 h-3.5 rounded-full ring-1 ring-black shadow-sm" style={{ backgroundColor: p.hourColor }} />
                          <span className="w-3.5 h-3.5 rounded-full ring-1 ring-black shadow-sm" style={{ backgroundColor: p.minuteColor }} />
                        </div>
                        <span className="text-[11px] font-bold leading-tight">{p.label}</span>
                        <span className="text-[9px] text-slate-400 font-mono truncate max-w-[120px]">{p.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: 8 ICONIC HAND ("NOBE") SHAPES */}
            {activeCustomizerTab === 'hands' && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <span>🗡️</span>
                    <span>Hand Silhouette ("Nobe" Design):</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">8 Horology Silhouettes</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'vintageSpade', label: 'Vintage Spade', icon: '🗡️', sub: 'Photo Exact Match' },
                    { id: 'breguet', label: 'Royal Breguet', icon: '🌙', sub: 'Hollow Moon Rings' },
                    { id: 'cathedral', label: 'Cathedral', icon: '🏛️', sub: 'Gothic Lattice Aviator' },
                    { id: 'dauphineSword', label: 'Dauphine Sword', icon: '⚔️', sub: '3D Beveled Razor' },
                    { id: 'arrowField', label: 'Broad Arrow', icon: '🏹', sub: 'Military Navigator' },
                    { id: 'artDeco', label: 'Art Deco', icon: '🏢', sub: '1920s Skyscraper' },
                    { id: 'skeleton', label: 'Skeleton', icon: '⚙️', sub: 'Tourbillon Openwork' },
                    { id: 'modernStudio', label: 'Studio Baton', icon: '⏱️', sub: 'Bauhaus Minimalist' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setHandStyle(s.id as HandStyle)}
                      className={`px-3 py-2 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${
                        handStyle === s.id
                          ? 'bg-amber-500/25 border-amber-400/60 text-white shadow-lg ring-1 ring-amber-400/50'
                          : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <span className="text-base">{s.icon}</span>
                      <span className="text-[11px] font-bold leading-tight mt-0.5">{s.label}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{s.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: CENTER NOBE (HUB CAP / PIN) DESIGNS */}
            {activeCustomizerTab === 'nobe' && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Disc3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Center Arbor Nobe (Hub Cap & Pin Design):</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">4 Luxury Caps</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'chromeSphere', label: '3D Chrome Sphere', icon: '🔘', sub: 'Photo Exact Dome Nut' },
                    { id: 'rubyJewel', label: 'Swiss Ruby Cabochon', icon: '🔴', sub: 'Horology Synthetic Jewel' },
                    { id: 'goldRosette', label: '24K Fluted Rosette', icon: '🟡', sub: 'Radial Sunburst Crown' },
                    { id: 'stealthOnyx', label: 'Polished Jet Onyx', icon: '⚫', sub: 'Obsidian Faceted Gem' },
                  ].map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setCenterNobeStyle(n.id as CenterNobeStyle)}
                      className={`px-3 py-2 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${
                        centerNobeStyle === n.id
                          ? 'bg-amber-500/25 border-amber-400/60 text-white shadow-lg ring-1 ring-amber-400/50'
                          : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <span className="text-base">{n.icon}</span>
                      <span className="text-[11px] font-bold leading-tight mt-0.5">{n.label}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{n.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: DIAL FINISH EDITIONS */}
            {activeCustomizerTab === 'dial' && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                    Master Watch Dial Finish:
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['noirChrome', 'royalGold', 'midnightSapphire', 'racingEmerald'] as LuxuryFinish[]).map((fId) => {
                    const f = LUXURY_FINISHES[fId];
                    const isSelected = luxuryFinish === fId;
                    return (
                      <button
                        key={fId}
                        type="button"
                        onClick={() => setLuxuryFinish(fId)}
                        className={`px-3 py-2 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-white/20 border-white/50 text-white shadow-lg'
                            : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'
                        }`}
                      >
                        <span className="text-base">{f.icon}</span>
                        <span className="text-[11px] font-bold leading-tight mt-0.5">{f.label}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{f.accent}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          SVG CLOCK DIAL MASTERPIECE
          Clean circular dial, edge-to-edge titanium rim, bold rounded numerals (Fredoka),
          60 perimeter ticks, and exact photo spade/poire hands
          ========================================================================= */}
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

            {/* Subtle Focus Session Sector Gradient */}
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

            {/* 1. DISTINCT RICH HOUR HAND METALLIC GRADIENT */}
            <linearGradient id="vluxHourHandMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={resolvedHandColors.hourLight} />
              <stop offset="45%" stopColor={resolvedHandColors.hourMid} />
              <stop offset="90%" stopColor={resolvedHandColors.hourDark} />
              <stop offset="100%" stopColor="#0B0F19" stopOpacity="0.75" />
            </linearGradient>

            {/* 2. DISTINCT CONTRASTING MINUTE HAND METALLIC GRADIENT */}
            <linearGradient id="vluxMinuteHandMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={resolvedHandColors.minuteLight} />
              <stop offset="45%" stopColor={resolvedHandColors.minuteMid} />
              <stop offset="90%" stopColor={resolvedHandColors.minuteDark} />
              <stop offset="100%" stopColor="#0B0F19" stopOpacity="0.75" />
            </linearGradient>

            {/* 3D SPHERICAL POLISHED CHROME DOME KNOB ("NOBE") GRADIENT (Image 3) */}
            <radialGradient id="vluxChromeSphereNobe" cx="32%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor={activePal.nobeBallHighlight} />
              <stop offset="60%" stopColor={activePal.nobeBallMid} />
              <stop offset="88%" stopColor={activePal.nobeBallShadow} />
              <stop offset="100%" stopColor="#0B0F19" />
            </radialGradient>

            {/* SWISS SYNTHETIC RUBY CABOCHON JEWEL GRADIENT */}
            <radialGradient id="vluxRubyJewelGrad" cx="30%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#FDA4AF" />
              <stop offset="25%" stopColor="#F43F5E" />
              <stop offset="65%" stopColor="#BE123C" />
              <stop offset="90%" stopColor="#881337" />
              <stop offset="100%" stopColor="#4C0519" />
            </radialGradient>

            {/* 24K GOLD FLUTED ROSETTE GRADIENT */}
            <radialGradient id="vluxGoldRosetteGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="28%" stopColor="#FDE68A" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="88%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </radialGradient>

            {/* POLISHED JET ONYX GEM GRADIENT */}
            <radialGradient id="vluxOnyxGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="35%" stopColor="#1E293B" />
              <stop offset="75%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
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

            {/* Hand Luminescent Aura Filter */}
            <filter id="vluxHandAuraFilter" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.45 0" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Hand Realistic Drop Shadow */}
            <filter id="vluxHandDropShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="1.2" dy="3.5" stdDeviation="3" floodColor="#000000" floodOpacity="0.88" />
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
            {/* Slim Brushed Titanium Outer Rim */}
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
              HANDS RENDERING (8 Master Horology Styles & 10 Contrasting Palettes)
              ========================================================================= */}
          <g filter={handGlowEnabled ? 'url(#vluxHandAuraFilter)' : 'url(#vluxHandDropShadow)'}>
            {/* --- HOUR HAND --- */}
            <g transform={`translate(${cx}, ${cy}) rotate(${hourHandAngle})`}>
              {renderHourHandBody()}
            </g>

            {/* --- MINUTE HAND --- */}
            <g transform={`translate(${cx}, ${cy}) rotate(${minuteHandAngle})`}>
              {renderMinuteHandBody()}
            </g>

            {/* --- SECOND HAND (SLENDER NEEDLE) --- */}
            <g transform={`translate(${cx}, ${cy}) rotate(${secondHandAngle})`}>
              {handStyle === 'modernStudio' ? (
                <>
                  <line x1="0" y1="34" x2="0" y2="-118" stroke="#0284C7" strokeWidth="2.8" strokeLinecap="round" />
                  <line x1="0" y1="34" x2="0" y2="-118" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="0" cy="0" r="7.5" fill="none" stroke="#38BDF8" strokeWidth="2.4" />
                </>
              ) : (
                <>
                  {/* Slender polished needle shaft */}
                  <line x1="0" y1="28" x2="0" y2="-116" stroke={activePal.secondHand} strokeWidth="1.6" strokeLinecap="round" />
                  {/* Counterbalance Disc */}
                  <circle cx="0" cy="18" r="3.6" fill="url(#vluxCollarGrad)" stroke="#1F2937" strokeWidth="0.8" />
                  {/* Active Indicator Tip */}
                  <circle cx="0" cy="-108" r="2.4" fill={activePal.secondTip} filter="url(#vluxLaserGlow)" />
                </>
              )}
            </g>
          </g>

          {/* =========================================================================
              SAPPHIRE CRYSTAL GLASS REFLECTION
              ========================================================================= */}
          <path
            d={`M ${cx - dialRadius + 18} ${cy - 15} A ${dialRadius - 6} ${dialRadius - 6} 0 0 1 ${cx + dialRadius - 18} ${cy - 15} C ${cx + 75} ${cy - 85}, ${cx - 75} ${cy - 85}, ${cx - dialRadius + 18} ${cy - 15} Z`}
            fill="url(#vluxCrystalGlare)"
            className="pointer-events-none"
          />

          {/* =========================================================================
              THE "NOBE" (CENTER KNOB / ARBOR CAP)
              Interchangeable 3D Chrome Dome, Swiss Ruby Jewel, Gold Rosette, or Onyx
              ========================================================================= */}
          {renderCenterNobe()}
        </svg>
      </div>

      {/* =========================================================================
          INTERACTIVE DOCK UNDER CLOCK: DIRECT 1-CLICK SELECTORS
          ========================================================================= */}
      <div className="mt-3 flex flex-col items-center justify-center text-center w-full max-w-lg px-2 gap-2">
        {/* Quick Color Palette Swatches Strip */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0B0E17]/90 border border-white/10 shadow-xl backdrop-blur-xl overflow-x-auto max-w-full">
          <span className="text-[10px] font-black uppercase text-slate-400 pl-2 pr-1 flex items-center gap-1">
            <Palette className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Palette:</span>
          </span>
          {(Object.keys(HAND_COLOR_PRESETS) as Array<Exclude<HandColorPreset, 'auto'>>).map((key) => {
            const pal = HAND_COLOR_PRESETS[key];
            const isSelected = handColorPreset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setHandColorPreset(key)}
                className={`group relative p-1 rounded-xl transition-all cursor-pointer border flex items-center gap-1 ${
                  isSelected
                    ? 'bg-white/20 border-white/60 shadow-[0_0_10px_rgba(255,255,255,0.3)] scale-105'
                    : 'bg-white/[0.04] border-white/10 hover:bg-white/10'
                }`}
                title={`${pal.label} (${pal.desc})`}
              >
                <span className="flex items-center -space-x-1">
                  <span className="w-3 h-3 rounded-full ring-1 ring-black" style={{ backgroundColor: pal.hourColor }} />
                  <span className="w-3 h-3 rounded-full ring-1 ring-black" style={{ backgroundColor: pal.minuteColor }} />
                </span>
                {isSelected && (
                  <span className="text-[10px] font-bold text-white px-1 max-w-[85px] truncate">
                    {pal.label.split('&')[0]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Digital Precision Readout */}
        <div className="flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-[#0B0E17]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
          <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            {formatTime(displaySeconds)}
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 text-slate-200">
            {timerStatus === 'RUNNING' ? 'Flowing' : isStopwatchReady ? 'Ready' : 'Paused'}
          </span>
        </div>

        {/* Real-time Focus Interval Tagline */}
        <div className="text-xs font-semibold text-slate-400 flex items-center gap-2">
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
