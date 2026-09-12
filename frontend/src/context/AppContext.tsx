'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Activity,
  StudySession,
  Habit,
  Task,
  Goal,
  CustomCountdown,
  DailyReview,
  UserSettings,
  ActiveTab,
  TimerMode,
  DayActivityData,
  MotivationalQuote,
} from '@/types';
import {
  INITIAL_SETTINGS,
  INITIAL_ACTIVITIES,
  INITIAL_HABITS,
  INITIAL_TASKS,
  INITIAL_GOALS,
  INITIAL_COUNTDOWNS,
  INITIAL_QUOTES,
  generateSeedData,
} from '@/lib/initialData';
import { soundEngine } from '@/lib/audio';
import { daymarkApi } from '@/lib/api';
import { cloudSync, BackupSnapshot } from '@/lib/cloudSync';
import confetti from 'canvas-confetti';
import { format, parseISO } from 'date-fns';
import { normalizeDateStr, isSameCalendarDay } from '@/lib/dateUtils';

interface AppContextType {
  // Navigation State
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  isDayDetailOpen: boolean;
  setIsDayDetailOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSidebarPinned: boolean;
  setIsSidebarPinned: (pinned: boolean) => void;

  // Cloud Synchronization & Device Pairing State
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncedAt: Date | null;
  cloudRoomId: string;
  setCloudRoomId: (roomId: string) => void;
  syncWithCloud: () => Promise<void>;
  recoverMissingStudySession: (dateStr: string, durationHours: number, activityName?: string, notes?: string) => void;
  backupSnapshots: BackupSnapshot[];
  restoreSnapshot: (snapshotId: string) => boolean;

  // App Data
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id'>) => Activity;
  deleteActivity: (id: string) => void;
  
  sessions: StudySession[];
  addSession: (session: Omit<StudySession, 'id'>) => void;
  deleteSession: (id: string) => void;

  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'logs'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  toggleHabit: (habitId: string, dateStr?: string) => void;
  deleteHabit: (id: string) => void;

  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (id: string) => void;

  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'currentValue'>) => void;
  updateGoalProgress: (id: string, delta: number) => void;
  deleteGoal: (id: string) => void;

  countdowns: CustomCountdown[];
  addCountdown: (cd: Omit<CustomCountdown, 'id'>) => void;
  deleteCountdown: (id: string) => void;

  reviews: DailyReview[];
  saveDailyReview: (review: Omit<DailyReview, 'id'>) => void;

  // Motivational Quotes Ticker
  quotes: MotivationalQuote[];
  addQuote: (quote: Omit<MotivationalQuote, 'id' | 'createdAt'>) => void;
  updateQuote: (id: string, updates: Partial<MotivationalQuote>) => void;
  deleteQuote: (id: string) => void;
  toggleQuoteActive: (id: string) => void;
  reorderQuotes: (quotes: MotivationalQuote[]) => void;
  resetQuotesToDefault: () => void;

  // Global Resilient Focus Timer Engine
  timerMode: TimerMode;
  setTimerMode: (mode: TimerMode) => void;
  timerStatus: 'IDLE' | 'RUNNING' | 'PAUSED';
  setTimerStatus: (status: 'IDLE' | 'RUNNING' | 'PAUSED') => void;
  timerSecondsRemaining: number;
  setTimerSecondsRemaining: (sec: number | ((prev: number) => number)) => void;
  activeActivityId: string;
  setActiveActivityId: (id: string) => void;
  timerTotalDuration: number;
  setTimerTotalDuration: (sec: number) => void;
  selectedPomodoroPhase: 'work' | 'shortBreak' | 'longBreak';
  setSelectedPomodoroPhase: (phase: 'work' | 'shortBreak' | 'longBreak') => void;
  stopwatchElapsed: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  switchPomodoroPhase: (phase: 'work' | 'shortBreak' | 'longBreak') => void;
  finishStopwatch: (notes?: string) => void;

  // Analytics Helpers
  getDayActivityData: (dateStr: string) => DayActivityData;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  resetAllData: () => void;
  loadStudyFocusPreset: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'daymark_settings',
  ACTIVITIES: 'daymark_activities',
  SESSIONS: 'daymark_sessions',
  HABITS: 'daymark_habits',
  TASKS: 'daymark_tasks',
  GOALS: 'daymark_goals',
  COUNTDOWNS: 'daymark_countdowns',
  REVIEWS: 'daymark_reviews',
  QUOTES: 'daymark_motivational_quotes',
  TIMER: 'daymark_timer_state_v2',
  DELETED_IDS: 'daymark_deleted_item_ids_v1',
};

const recordDeletedId = (id: string, title?: string) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_IDS);
    const set: string[] = raw ? JSON.parse(raw) : [];
    if (id && !set.includes(id)) set.push(id);
    if (title && !set.includes(title.toLowerCase().trim())) set.push(title.toLowerCase().trim());
    localStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify(set));
  } catch {}
};

const isDeleted = (id?: string, title?: string): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_IDS);
    if (!raw) return false;
    const set: string[] = JSON.parse(raw);
    if (id && set.includes(id)) return true;
    if (title && set.includes(title.toLowerCase().trim())) return true;
  } catch {}
  return false;
};

const unmarkDeleted = (title?: string) => {
  if (!title) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_IDS);
    if (!raw) return;
    const set: string[] = JSON.parse(raw);
    const updated = set.filter((x) => x !== title.toLowerCase().trim());
    localStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify(updated));
  } catch {}
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [isDayDetailOpen, setIsDayDetailOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState<boolean>(false);

  // Core Data States
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [countdowns, setCountdowns] = useState<CustomCountdown[]>(INITIAL_COUNTDOWNS);
  const [reviews, setReviews] = useState<DailyReview[]>([]);
  const [quotes, setQuotes] = useState<MotivationalQuote[]>(INITIAL_QUOTES);

  // Global Resilient Timer States
  const [timerMode, setTimerModeState] = useState<TimerMode>('POMODORO');
  const [timerStatus, setTimerStatus] = useState<'IDLE' | 'RUNNING' | 'PAUSED'>('IDLE');
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState<number>(25 * 60);
  const [timerTotalDuration, setTimerTotalDuration] = useState<number>(25 * 60);
  const [activeActivityId, setActiveActivityId] = useState<string>(INITIAL_ACTIVITIES[0].id);
  const [selectedPomodoroPhase, setSelectedPomodoroPhase] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [stopwatchElapsed, setStopwatchElapsed] = useState<number>(0);

  // Timestamp refs for background resilience
  const timerTargetTimestampRef = useRef<number | null>(null);
  const stopwatchStartTimestampRef = useRef<number | null>(null);

  // Cloud Sync & Room Pairing State
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [cloudRoomId, setCloudRoomIdState] = useState<string>('DM-MAIN');
  const [backupSnapshots, setBackupSnapshots] = useState<BackupSnapshot[]>([]);

  const setCloudRoomId = (newId: string) => {
    const clean = newId.trim().toUpperCase();
    if (!clean) return;
    setCloudRoomIdState(clean);
    cloudSync.setRoomId(clean);
    setTimeout(() => {
      syncWithCloud();
    }, 50);
  };

  const [isHydrated, setIsHydrated] = useState(false);

  // Track latest state in a ref for atomic two-way sync without stale closures
  const latestStateRef = useRef({
    settings,
    activities,
    sessions,
    habits,
    tasks,
    goals,
    countdowns,
    reviews,
    quotes,
  });

  useEffect(() => {
    latestStateRef.current = {
      settings,
      activities,
      sessions,
      habits,
      tasks,
      goals,
      countdowns,
      reviews,
      quotes,
    };
  }, [settings, activities, sessions, habits, tasks, goals, countdowns, reviews, quotes]);

  // Hydrate from localStorage on mount (Each entity hydrates independently!)
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) setSettings(JSON.parse(storedSettings));

      const storedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (storedActivities) {
        try {
          const parsed: Activity[] = JSON.parse(storedActivities);
          setActivities(parsed.filter((a) => !isDeleted(a.id, a.name)));
        } catch {
          setActivities(INITIAL_ACTIVITIES.filter((a) => !isDeleted(a.id, a.name)));
        }
      } else {
        setActivities(INITIAL_ACTIVITIES.filter((a) => !isDeleted(a.id, a.name)));
      }

      const storedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      let parsedSessions: StudySession[] = [];
      if (storedSessions) {
        try {
          const parsed = JSON.parse(storedSessions);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsedSessions = parsed;
          }
        } catch {}
      }

      // Real seed data (strictly Sep 10: 4h, Sep 11: 2h)
      const realSeed = generateSeedData();
      const realSeedDates = new Set(realSeed.sessions.map((s) => s.date));

      // Filter out any mock sessions or false seed sessions on days the user didn't study
      parsedSessions = parsedSessions.filter((s) => {
        if (s.id.startsWith('seed-sess-')) return false;
        if (s.id === 'sess-today-morning' || s.id.startsWith('sess-today-')) return false;
        // Purge any old generated sessions on dates where user didn't study
        if (s.id.startsWith('sess-real-') && !realSeedDates.has(s.date)) return false;
        return true;
      });

      // Ensure real study sessions for Sep 10 and Sep 11 exist
      const existingKeys = new Set(parsedSessions.map((s) => `${s.date}-${s.activityId}`));
      for (const realSess of realSeed.sessions) {
        if (!existingKeys.has(`${realSess.date}-${realSess.activityId}`)) {
          parsedSessions.push(realSess);
        }
      }

      try {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(parsedSessions));
      } catch {}
      // Clean up from remote cloud if present
      daymarkApi.deleteSession('sess-today-morning').catch(() => null);
      setSessions(parsedSessions);

      const storedHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (storedHabits) {
        try {
          let parsedHabits: Habit[] = JSON.parse(storedHabits);
          // Prune any false habit logs for days 1-9
          parsedHabits = parsedHabits.map((h) => {
            const cleanedLogs: Record<string, boolean> = {};
            // Keep real seed logs (Sep 10, Sep 11) and today
            Object.entries(h.logs || {}).forEach(([dateStr, done]) => {
              if (realSeedDates.has(dateStr) || dateStr === format(new Date(), 'yyyy-MM-dd')) {
                cleanedLogs[dateStr] = done;
              }
            });
            // Merge in real seed logs
            if (realSeed.habitLogs[h.id]) {
              Object.assign(cleanedLogs, realSeed.habitLogs[h.id]);
            }
            return { ...h, logs: cleanedLogs };
          });
          setHabits(parsedHabits.filter((h) => !isDeleted(h.id, h.name)));
        } catch {
          const seededHabits = INITIAL_HABITS.map((h) => ({
            ...h,
            logs: realSeed.habitLogs[h.id] || {},
          }));
          setHabits(seededHabits.filter((h) => !isDeleted(h.id, h.name)));
        }
      } else {
        const seededHabits = INITIAL_HABITS.map((h) => ({
          ...h,
          logs: realSeed.habitLogs[h.id] || {},
        }));
        setHabits(seededHabits.filter((h) => !isDeleted(h.id, h.name)));
      }

      const storedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (storedReviews) {
        try {
          const parsed = JSON.parse(storedReviews);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReviews(parsed);
          } else {
            const realSeed = generateSeedData();
            setReviews(realSeed.reviews);
          }
        } catch {
          const realSeed = generateSeedData();
          setReviews(realSeed.reviews);
        }
      } else {
        const realSeed = generateSeedData();
        setReviews(realSeed.reviews);
      }

      const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (storedTasks) {
        try {
          const parsedTasks: Task[] = JSON.parse(storedTasks);
          setTasks(parsedTasks.filter((t) => !isDeleted(t.id, t.title)));
        } catch {
          setTasks(INITIAL_TASKS.filter((t) => !isDeleted(t.id, t.title)));
        }
      } else {
        setTasks(INITIAL_TASKS.filter((t) => !isDeleted(t.id, t.title)));
      }

      const storedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (storedGoals) {
        try {
          const parsedGoals: Goal[] = JSON.parse(storedGoals);
          setGoals(parsedGoals.filter((g) => !isDeleted(g.id, g.title)));
        } catch {
          setGoals(INITIAL_GOALS.filter((g) => !isDeleted(g.id, g.title)));
        }
      } else {
        setGoals(INITIAL_GOALS.filter((g) => !isDeleted(g.id, g.title)));
      }

      const storedCountdowns = localStorage.getItem(STORAGE_KEYS.COUNTDOWNS);
      if (storedCountdowns) {
        try {
          const parsedCountdowns: CustomCountdown[] = JSON.parse(storedCountdowns);
          setCountdowns(parsedCountdowns.filter((c) => !isDeleted(c.id, c.title)));
        } catch {
          setCountdowns(INITIAL_COUNTDOWNS.filter((c) => !isDeleted(c.id, c.title)));
        }
      } else {
        setCountdowns(INITIAL_COUNTDOWNS.filter((c) => !isDeleted(c.id, c.title)));
      }

      const storedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
      if (storedQuotes) {
        try {
          const parsedQuotes: MotivationalQuote[] = JSON.parse(storedQuotes);
          if (Array.isArray(parsedQuotes) && parsedQuotes.length > 0) {
            setQuotes(parsedQuotes.filter((q) => !isDeleted(q.id, q.text)));
          } else {
            setQuotes(INITIAL_QUOTES.filter((q) => !isDeleted(q.id, q.text)));
          }
        } catch {
          setQuotes(INITIAL_QUOTES.filter((q) => !isDeleted(q.id, q.text)));
        }
      } else {
        setQuotes(INITIAL_QUOTES.filter((q) => !isDeleted(q.id, q.text)));
      }

      // Restore Timer State with exact epoch timestamps
      const storedTimer = localStorage.getItem(STORAGE_KEYS.TIMER);
      if (storedTimer) {
        const t = JSON.parse(storedTimer);
        if (t.timerMode) setTimerModeState(t.timerMode);
        if (t.selectedPomodoroPhase) setSelectedPomodoroPhase(t.selectedPomodoroPhase);
        if (t.activeActivityId) setActiveActivityId(t.activeActivityId);
        if (t.timerTotalDuration) setTimerTotalDuration(t.timerTotalDuration);

        if (t.timerStatus === 'RUNNING') {
          const nowMs = Date.now();
          if (t.timerMode === 'POMODORO' && t.targetTimestamp) {
            if (nowMs < t.targetTimestamp) {
              const diffSec = Math.round((t.targetTimestamp - nowMs) / 1000);
              timerTargetTimestampRef.current = t.targetTimestamp;
              setTimerSecondsRemaining(diffSec);
              setTimerStatus('RUNNING');
            } else {
              setTimerSecondsRemaining(0);
              setTimerStatus('IDLE');
            }
          } else if (t.timerMode === 'STOPWATCH' && t.stopwatchStartTimestamp) {
            stopwatchStartTimestampRef.current = t.stopwatchStartTimestamp;
            setStopwatchElapsed(Math.round((nowMs - t.stopwatchStartTimestamp) / 1000));
            setTimerStatus('RUNNING');
          }
        } else {
          if (typeof t.timerSecondsRemaining === 'number') {
            setTimerSecondsRemaining(t.timerSecondsRemaining);
          }
          if (typeof t.stopwatchElapsed === 'number') {
            setStopwatchElapsed(t.stopwatchElapsed);
          }
          setTimerStatus(t.timerStatus || 'IDLE');
        }
      }
    } catch (e) {
      console.error('Error hydrating state from localStorage:', e);
    } finally {
      // Check query parameter for pairing room: ?pairRoom=DM-XXXX
      if (typeof window !== 'undefined') {
        try {
          const params = new URLSearchParams(window.location.search);
          const pairRoom = params.get('pairRoom');
          if (pairRoom) {
            const cleanRoom = pairRoom.trim().toUpperCase();
            cloudSync.setRoomId(cleanRoom);
            setCloudRoomIdState(cleanRoom);
          } else {
            setCloudRoomIdState(cloudSync.getRoomId());
          }
          setBackupSnapshots(cloudSync.getSnapshots());
        } catch {}
      }
      setIsHydrated(true);
    }
  }, []);

  // Universal Real-Time Cloud Sync (Works on Vercel without external server via App Router Relay!)
  const syncWithCloud = async () => {
    try {
      setCloudSyncStatus('syncing');

      let cloudData: any = null;

      // 1. Pull from Universal CloudSync Room (Laptop <-> Phone pairing)
      try {
        const roomResult = await cloudSync.pull();
        if (roomResult.found && roomResult.payload) {
          cloudData = roomResult.payload;
        }
      } catch (err) {
        console.warn('Room sync pull warning:', err);
      }

      // 2. Also try external REST API if configured
      if (process.env.NEXT_PUBLIC_API_URL) {
        try {
          const apiData = await daymarkApi.syncFull();
          if (apiData) {
            cloudData = { ...(cloudData || {}), ...apiData };
          }
        } catch {}
      }

      const current = latestStateRef.current;
      let hasLocalAdditions = false;

      if (!cloudData) {
        // Initial setup for this room: seed cloud with current state
        cloudSync.push(current).catch(() => null);
        cloudSync.saveSnapshot(current);
        setBackupSnapshots(cloudSync.getSnapshots());
        setCloudSyncStatus('synced');
        setLastSyncedAt(new Date());
        return;
      }

      // 1. Settings
      if (cloudData.settings) {
        setSettings((prev) => ({ ...prev, ...cloudData.settings }));
      }

      // 2. Activities: Union by ID or name
      const mergedActs = [...current.activities];
      if (Array.isArray(cloudData.activities)) {
        cloudData.activities.forEach((ca: any) => {
          if (!mergedActs.some((la) => la.id === ca.id || la.name.toLowerCase() === ca.name.toLowerCase())) {
            mergedActs.push(ca);
          }
        });
      }
      setActivities(mergedActs);

      // 3. Sessions: Union by ID or (cleanDate + duration + startTime), strictly excluding artificial dummy sessions
      const mergedSessions = [...current.sessions].filter(
        (s) => s.id !== 'sess-today-morning' && !s.id.startsWith('sess-today-')
      );
      if (Array.isArray(cloudData.sessions)) {
        cloudData.sessions.forEach((cs: any) => {
          if (cs.id === 'sess-today-morning' || cs.id.startsWith('sess-today-')) return;
          const csCleanDate = normalizeDateStr(cs.date || cs.startTime);
          const exists = mergedSessions.some((ls) => {
            if (ls.id === cs.id) return true;
            const lsCleanDate = normalizeDateStr(ls.date || ls.startTime);
            return (
              lsCleanDate === csCleanDate &&
              ls.durationSeconds === cs.durationSeconds &&
              Math.abs(new Date(ls.startTime).getTime() - new Date(cs.startTime).getTime()) < 60000
            );
          });
          if (!exists) {
            mergedSessions.push({ ...cs, date: csCleanDate });
          }
        });
      }
      if (current.sessions.some((ls) => !cloudData.sessions?.some((cs: any) => cs.id === ls.id))) {
        hasLocalAdditions = true;
      }
      setSessions(mergedSessions);

      // 4. Goals: Union by ID or title (ignoring tombstones)
      const mergedGoals = [...current.goals].filter((g) => !isDeleted(g.id, g.title));
      if (Array.isArray(cloudData.goals)) {
        cloudData.goals.forEach((cg: any) => {
          if (isDeleted(cg.id, cg.title)) return;
          const exists = mergedGoals.some(
            (lg) => lg.id === cg.id || lg.title.trim().toLowerCase() === cg.title.trim().toLowerCase()
          );
          if (!exists) {
            mergedGoals.push(cg);
          }
        });
      }
      setGoals(mergedGoals);

      // 5. Countdowns: Union by ID or title (ignoring tombstones)
      const mergedCountdowns = [...current.countdowns].filter((c) => !isDeleted(c.id, c.title));
      if (Array.isArray(cloudData.countdowns)) {
        cloudData.countdowns.forEach((cc: any) => {
          if (isDeleted(cc.id, cc.title)) return;
          const exists = mergedCountdowns.some(
            (lc) => lc.id === cc.id || lc.title.trim().toLowerCase() === cc.title.trim().toLowerCase()
          );
          if (!exists) {
            mergedCountdowns.push(cc);
          }
        });
      }
      setCountdowns(mergedCountdowns);

      // 6. Tasks: Union by ID or title (ignoring tombstones)
      const mergedTasks = [...current.tasks].filter((t) => !isDeleted(t.id, t.title));
      if (Array.isArray(cloudData.tasks)) {
        cloudData.tasks.forEach((ct: any) => {
          if (isDeleted(ct.id, ct.title)) return;
          const exists = mergedTasks.some(
            (lt) => lt.id === ct.id || lt.title.trim().toLowerCase() === ct.title.trim().toLowerCase()
          );
          if (!exists) {
            mergedTasks.push(ct);
          }
        });
      }
      setTasks(mergedTasks);

      // 7. Habits: Union by ID or name
      const mergedHabits = [...current.habits];
      if (Array.isArray(cloudData.habits)) {
        cloudData.habits.forEach((ch: any) => {
          const existingIdx = mergedHabits.findIndex(
            (lh) => lh.id === ch.id || lh.name.trim().toLowerCase() === ch.name.trim().toLowerCase()
          );
          if (existingIdx === -1) {
            mergedHabits.push(ch);
          } else {
            mergedHabits[existingIdx] = {
              ...mergedHabits[existingIdx],
              ...ch,
              logs: { ...(ch.logs || {}), ...(mergedHabits[existingIdx].logs || {}) },
            };
          }
        });
      }
      setHabits(mergedHabits);

      // 8. Reviews: Union by date
      const mergedReviews = [...current.reviews];
      if (Array.isArray(cloudData.reviews)) {
        cloudData.reviews.forEach((cr: any) => {
          if (!mergedReviews.some((lr) => lr.date === cr.date)) {
            mergedReviews.push(cr);
          }
        });
      }
      setReviews(mergedReviews);

      // Persist merged data immediately to localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(mergedSessions));
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(mergedGoals));
        localStorage.setItem(STORAGE_KEYS.COUNTDOWNS, JSON.stringify(mergedCountdowns));
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(mergedTasks));
        localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(mergedHabits));
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(mergedActs));
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(mergedReviews));
      } catch (storageErr) {
        console.warn('LocalStorage merge write warning:', storageErr);
      }

      // Save to snapshot vault
      const syncPayload = {
        settings: current.settings,
        activities: mergedActs,
        sessions: mergedSessions,
        goals: mergedGoals,
        countdowns: mergedCountdowns,
        tasks: mergedTasks,
        habits: mergedHabits,
        reviews: mergedReviews,
      };

      cloudSync.saveSnapshot(syncPayload);
      setBackupSnapshots(cloudSync.getSnapshots());

      // If local had additions or changes, broadcast to room & API
      if (hasLocalAdditions) {
        cloudSync.push(syncPayload).catch(() => null);
        if (process.env.NEXT_PUBLIC_API_URL) {
          daymarkApi.syncFull(syncPayload).catch(() => null);
        }
      }

      setCloudSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err) {
      console.warn('[DayMark] Cloud sync error:', err);
      setCloudSyncStatus('synced');
    }
  };

  // Background Real-Time Sync Effect: every 12s and when tab gains focus
  useEffect(() => {
    if (!isHydrated) return;
    syncWithCloud();

    // 12-second fast sync interval for real-time responsiveness between laptop & phone
    const interval = setInterval(syncWithCloud, 12000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncWithCloud();
      }
    };
    const onWindowFocus = () => syncWithCloud();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onWindowFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onWindowFocus);
    };
  }, [isHydrated]);

  // Persist App Data
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
      localStorage.setItem(STORAGE_KEYS.COUNTDOWNS, JSON.stringify(countdowns));
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [settings, activities, sessions, habits, tasks, goals, countdowns, reviews, quotes, isHydrated]);

  // Persist Timer State to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const timerPayload = {
        timerMode,
        timerStatus,
        timerSecondsRemaining,
        timerTotalDuration,
        activeActivityId,
        selectedPomodoroPhase,
        stopwatchElapsed,
        targetTimestamp: timerTargetTimestampRef.current,
        stopwatchStartTimestamp: stopwatchStartTimestampRef.current,
      };
      localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(timerPayload));
    } catch (e) {
      console.error('Error saving timer state:', e);
    }
  }, [
    timerMode,
    timerStatus,
    timerSecondsRemaining,
    timerTotalDuration,
    activeActivityId,
    selectedPomodoroPhase,
    stopwatchElapsed,
    isHydrated,
  ]);

  // GLOBAL BACKGROUND TIMER INTERVAL ENGINE (Runs continuously across all views!)
  useEffect(() => {
    const handleTick = () => {
      if (timerStatus !== 'RUNNING') return;

      if (timerMode === 'POMODORO') {
        if (timerTargetTimestampRef.current) {
          const nowMs = Date.now();
          const remainingSec = Math.max(
            0,
            Math.round((timerTargetTimestampRef.current - nowMs) / 1000)
          );
          setTimerSecondsRemaining(remainingSec);

          if (remainingSec <= 0) {
            // Completed!
            setTimerStatus('IDLE');
            timerTargetTimestampRef.current = null;
            if (settings.soundEnabled) soundEngine.playCompletionChime();
            confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });

            if (selectedPomodoroPhase === 'work') {
              const duration = settings.workIntervalMinutes * 60;
              const now = new Date();
              addSession({
                activityId: activeActivityId,
                startTime: new Date(now.getTime() - duration * 1000).toISOString(),
                endTime: now.toISOString(),
                durationSeconds: duration,
                notes: `Completed ${settings.workIntervalMinutes}m Focus Session`,
                date: format(now, 'yyyy-MM-dd'),
              });
            }
          }
        }
      } else if (timerMode === 'STOPWATCH') {
        if (stopwatchStartTimestampRef.current) {
          const nowMs = Date.now();
          const elapsed = Math.round((nowMs - stopwatchStartTimestampRef.current) / 1000);
          setStopwatchElapsed(elapsed);
        }
      }
    };

    const interval = setInterval(handleTick, 500);

    // Sync immediately when tab becomes visible or phone screen unlocks
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleTick();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onVisibilityChange);
    };
  }, [
    timerStatus,
    timerMode,
    selectedPomodoroPhase,
    settings,
    activeActivityId,
  ]);

  // Global Timer Action Controls
  const setTimerMode = (newMode: TimerMode) => {
    setTimerModeState(newMode);
    setTimerStatus('IDLE');
    timerTargetTimestampRef.current = null;
    stopwatchStartTimestampRef.current = null;
    if (newMode === 'STOPWATCH') {
      setStopwatchElapsed(0);
    } else {
      let durationSec = settings.workIntervalMinutes * 60;
      if (selectedPomodoroPhase === 'shortBreak') durationSec = settings.shortBreakMinutes * 60;
      if (selectedPomodoroPhase === 'longBreak') durationSec = settings.longBreakMinutes * 60;
      setTimerSecondsRemaining(durationSec);
      setTimerTotalDuration(durationSec);
    }
  };

  const startTimer = () => {
    if (timerMode === 'POMODORO') {
      const nowMs = Date.now();
      const currentRemaining =
        timerSecondsRemaining > 0 ? timerSecondsRemaining : settings.workIntervalMinutes * 60;
      timerTargetTimestampRef.current = nowMs + currentRemaining * 1000;
      setTimerStatus('RUNNING');
    } else {
      const nowMs = Date.now();
      stopwatchStartTimestampRef.current = nowMs - stopwatchElapsed * 1000;
      setTimerStatus('RUNNING');
    }
  };

  const pauseTimer = () => {
    setTimerStatus('PAUSED');
    timerTargetTimestampRef.current = null;
    stopwatchStartTimestampRef.current = null;
  };

  const resetTimer = () => {
    setTimerStatus('IDLE');
    timerTargetTimestampRef.current = null;
    stopwatchStartTimestampRef.current = null;
    if (timerMode === 'STOPWATCH') {
      setStopwatchElapsed(0);
    } else {
      let durationSec = settings.workIntervalMinutes * 60;
      if (selectedPomodoroPhase === 'shortBreak') durationSec = settings.shortBreakMinutes * 60;
      if (selectedPomodoroPhase === 'longBreak') durationSec = settings.longBreakMinutes * 60;
      setTimerSecondsRemaining(durationSec);
      setTimerTotalDuration(durationSec);
    }
  };

  const switchPomodoroPhase = (phase: 'work' | 'shortBreak' | 'longBreak') => {
    setSelectedPomodoroPhase(phase);
    setTimerStatus('IDLE');
    timerTargetTimestampRef.current = null;
    let durationSec = settings.workIntervalMinutes * 60;
    if (phase === 'shortBreak') durationSec = settings.shortBreakMinutes * 60;
    if (phase === 'longBreak') durationSec = settings.longBreakMinutes * 60;
    setTimerSecondsRemaining(durationSec);
    setTimerTotalDuration(durationSec);
  };

  const finishStopwatch = (notes?: string) => {
    if (stopwatchElapsed <= 0) return;
    const duration = stopwatchElapsed;
    setTimerStatus('IDLE');
    timerTargetTimestampRef.current = null;
    stopwatchStartTimestampRef.current = null;
    if (settings.soundEnabled) soundEngine.playCompletionChime();
    confetti({ particleCount: 60, spread: 70 });

    const h = Math.floor(duration / 3600);
    const m = Math.floor((duration % 3600) / 60);
    const durationLabel = h > 0 ? `${h}h ${m}m` : `${Math.max(1, m)}m`;

    const now = new Date();
    addSession({
      activityId: activeActivityId,
      startTime: new Date(now.getTime() - duration * 1000).toISOString(),
      endTime: now.toISOString(),
      durationSeconds: duration,
      notes: notes || `Stopwatch focus session (${durationLabel})`,
      date: format(now, 'yyyy-MM-dd'),
    });

    setStopwatchElapsed(0);
  };

  // Actions (Immediate 0ms local update + background cloud push)
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    daymarkApi.updateSettings(newSettings).catch(() => null);
  };

  const addActivity = (activityData: Omit<Activity, 'id'>): Activity => {
    const newAct: Activity = {
      ...activityData,
      id: `act-${Date.now()}`,
    };
    setActivities((prev) => [...prev, newAct]);
    daymarkApi.createActivity(activityData).catch(() => null);
    return newAct;
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    daymarkApi.deleteActivity(id).catch(() => null);
  };

  const addSession = (sessionData: Omit<StudySession, 'id'>) => {
    const cleanDate = normalizeDateStr(sessionData.date || sessionData.startTime || new Date());
    const newSession: StudySession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
      date: cleanDate,
    };
    setSessions((prev) => [newSession, ...prev]);
    daymarkApi.createSession({ ...sessionData, date: cleanDate }).catch(() => null);

    const durationHours = Math.round(sessionData.durationSeconds / 3600);
    if (durationHours > 0) {
      setGoals((prevGoals) =>
        prevGoals.map((g) => {
          if (g.type === 'TIME') {
            return { ...g, currentValue: g.currentValue + durationHours };
          }
          return g;
        })
      );
    }

    // Auto-broadcast new session to cloud room so phone/laptop syncs in real-time
    setTimeout(() => {
      const current = latestStateRef.current;
      cloudSync.saveSnapshot(current);
      setBackupSnapshots(cloudSync.getSnapshots());
      cloudSync.push(current).catch(() => null);
    }, 150);
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    daymarkApi.deleteSession(id).catch(() => null);
  };

  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'logs'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `hab-${Date.now()}`,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      isActive: true,
      logs: {},
    };
    setHabits((prev) => [...prev, newHabit]);
    daymarkApi.createHabit(habitData).catch(() => null);
  };

  const toggleHabit = (habitId: string, dateStr?: string) => {
    const targetDate = dateStr || format(new Date(), 'yyyy-MM-dd');
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const currentVal = !!h.logs[targetDate];
        const updatedLogs = { ...h.logs, [targetDate]: !currentVal };
        return { ...h, logs: updatedLogs };
      })
    );
    daymarkApi.toggleHabit(habitId, targetDate).catch(() => null);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
    daymarkApi.updateHabit(id, updates).catch(() => null);
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    daymarkApi.deleteHabit(id).catch(() => null);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      completed: false,
    };
    setTasks((prev) => [newTask, ...prev]);
    daymarkApi.createTask(taskData).catch(() => null);
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const isNowCompleted = !t.completed;
        if (isNowCompleted) {
          setGoals((prevGoals) =>
            prevGoals.map((g) =>
              g.type === 'TASK' ? { ...g, currentValue: g.currentValue + 1 } : g
            )
          );
        }
        return {
          ...t,
          completed: isNowCompleted,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
        };
      })
    );
    daymarkApi.toggleTask(taskId).catch(() => null);
  };

  const deleteTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    recordDeletedId(id, target?.title);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    daymarkApi.deleteTask(id).catch(() => null);
  };

  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'currentValue'>) => {
    unmarkDeleted(goalData.title);
    const cleanTargetDate = goalData.targetDate ? normalizeDateStr(goalData.targetDate) : undefined;
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      targetDate: cleanTargetDate,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      currentValue: 0,
    };
    setGoals((prev) => [...prev, newGoal]);
    daymarkApi.createGoal({ ...goalData, targetDate: cleanTargetDate }).catch(() => null);
  };

  const updateGoalProgress = (id: string, delta: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, currentValue: Math.max(0, g.currentValue + delta) } : g
      )
    );
    daymarkApi.updateGoalProgress(id, delta).catch(() => null);
  };

  const deleteGoal = (id: string) => {
    const target = goals.find((g) => g.id === id);
    recordDeletedId(id, target?.title);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    daymarkApi.deleteGoal(id, target?.title).catch(() => null);
  };

  const addCountdown = (cdData: Omit<CustomCountdown, 'id'>) => {
    unmarkDeleted(cdData.title);
    const cleanTargetDate = normalizeDateStr(cdData.targetDate);
    const newCd: CustomCountdown = {
      ...cdData,
      targetDate: cleanTargetDate,
      id: `cd-${Date.now()}`,
    };
    setCountdowns((prev) => [...prev, newCd]);
    daymarkApi.createCountdown({ ...cdData, id: newCd.id, targetDate: cleanTargetDate }).catch(() => null);
  };

  const deleteCountdown = (id: string) => {
    const target = countdowns.find((c) => c.id === id);
    recordDeletedId(id, target?.title);
    setCountdowns((prev) => prev.filter((cd) => cd.id !== id));
    daymarkApi.deleteCountdown(id, target?.title).catch(() => null);
  };

  const saveDailyReview = (reviewData: Omit<DailyReview, 'id'>) => {
    setReviews((prev) => {
      const existingIndex = prev.findIndex((r) => r.date === reviewData.date);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...reviewData, id: prev[existingIndex].id };
        return updated;
      }
      return [{ ...reviewData, id: `rev-${Date.now()}` }, ...prev];
    });
    daymarkApi.saveReview(reviewData).catch(() => null);
  };

  // Motivational Quote Handlers
  const addQuote = (quoteData: Omit<MotivationalQuote, 'id' | 'createdAt'>) => {
    unmarkDeleted(quoteData.text);
    const newQuote: MotivationalQuote = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };
    setQuotes((prev) => [newQuote, ...prev]);
  };

  const updateQuote = (id: string, updates: Partial<MotivationalQuote>) => {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const deleteQuote = (id: string) => {
    const target = quotes.find((q) => q.id === id);
    recordDeletedId(id, target?.text);
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  const toggleQuoteActive = (id: string) => {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, isActive: !q.isActive } : q)));
  };

  const reorderQuotes = (newQuotes: MotivationalQuote[]) => {
    setQuotes(newQuotes);
  };

  const resetQuotesToDefault = () => {
    setQuotes(INITIAL_QUOTES);
    try {
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(INITIAL_QUOTES));
    } catch {}
  };

  // Helper for date stats
  const getDayActivityData = (dateStr: string): DayActivityData => {
    const daySessions = sessions.filter((s) => isSameCalendarDay(s.date, s.startTime, dateStr));
    const totalSeconds = daySessions.reduce((acc, s) => acc + s.durationSeconds, 0);

    const activeHabits = habits.filter((h) => h.isActive);
    const completedHabitsCount = activeHabits.filter((h) => !!h.logs[dateStr]).length;

    const completedTasksCount = tasks.filter(
      (t) => t.completedAt && isSameCalendarDay(undefined, t.completedAt, dateStr)
    ).length;

    const hasReview = reviews.some((r) => isSameCalendarDay(r.date, undefined, dateStr));

    return {
      date: dateStr,
      totalSeconds,
      sessionCount: daySessions.length,
      completedHabitsCount,
      totalHabitsCount: activeHabits.length,
      completedTasksCount,
      hasReview,
    };
  };

  const exportDataJSON = () => {
    const data = {
      settings,
      activities,
      sessions,
      habits,
      tasks,
      goals,
      countdowns,
      reviews,
      quotes,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.activities) setActivities(parsed.activities);
      if (parsed.sessions) setSessions(parsed.sessions);
      if (parsed.habits) setHabits(parsed.habits);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.goals) setGoals(parsed.goals);
      if (parsed.countdowns) setCountdowns(parsed.countdowns);
      if (parsed.reviews) setReviews(parsed.reviews);
      if (parsed.quotes && Array.isArray(parsed.quotes)) setQuotes(parsed.quotes);
      return true;
    } catch (e) {
      console.error('Invalid JSON import file:', e);
      return false;
    }
  };

  const resetAllData = () => {
    localStorage.clear();
    setSettings(INITIAL_SETTINGS);
    setActivities(INITIAL_ACTIVITIES);
    const seed = generateSeedData();
    setSessions(seed.sessions);
    setReviews(seed.reviews);
    setHabits(INITIAL_HABITS.map((h) => ({ ...h, logs: seed.habitLogs[h.id] || {} })));
    setTasks(INITIAL_TASKS);
    setGoals(INITIAL_GOALS);
    setCountdowns(INITIAL_COUNTDOWNS);
    setQuotes(INITIAL_QUOTES);
    resetTimer();
  };

  const loadStudyFocusPreset = () => {
    const seed = generateSeedData();
    setActivities(INITIAL_ACTIVITIES);
    setHabits(INITIAL_HABITS.map((h) => ({ ...h, logs: seed.habitLogs[h.id] || {} })));
    setSessions(seed.sessions);
    setReviews(seed.reviews);
    setGoals(INITIAL_GOALS);
    setTasks(INITIAL_TASKS);
    setCountdowns(INITIAL_COUNTDOWNS);
    setQuotes(INITIAL_QUOTES);
    setActiveActivityId(INITIAL_ACTIVITIES[0].id);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  // Emergency Recovery for Study Sessions (Restores missing 2h, 4h, etc.)
  const recoverMissingStudySession = (
    dateStr: string,
    durationHours: number,
    activityName: string = 'Data Analytics & Study',
    notes?: string
  ) => {
    const cleanDate = normalizeDateStr(dateStr || new Date());
    const durationSeconds = Math.max(900, Math.round(durationHours * 3600));

    let act = activities.find(
      (a) =>
        a.name.toLowerCase().includes(activityName.toLowerCase()) ||
        activityName.toLowerCase().includes(a.name.toLowerCase())
    );
    if (!act) {
      act = activities[0] || INITIAL_ACTIVITIES[0];
    }

    const startTime = new Date(`${cleanDate}T10:00:00`).toISOString();
    const endTime = new Date(new Date(startTime).getTime() + durationSeconds * 1000).toISOString();

    const recoveredSession: StudySession = {
      id: `recovered-sess-${cleanDate}-${Date.now()}`,
      activityId: act.id,
      date: cleanDate,
      startTime,
      endTime,
      durationSeconds,
      notes: notes || `Recovered study session (${durationHours}h ${act.name})`,
    };

    setSessions((prev) => {
      const updated = [recoveredSession, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Update goals
    setGoals((prevGoals) =>
      prevGoals.map((g) => {
        if (g.type === 'TIME') {
          return { ...g, currentValue: g.currentValue + durationHours };
        }
        return g;
      })
    );

    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });

    // Broadcast immediately to cloud room so phone/laptop gets it in real-time
    setTimeout(() => {
      const current = latestStateRef.current;
      cloudSync.saveSnapshot(current);
      setBackupSnapshots(cloudSync.getSnapshots());
      cloudSync.push(current).catch(() => null);
    }, 150);
  };

  // Restore dataset from a timestamped snapshot
  const restoreSnapshot = (snapshotId: string): boolean => {
    const snap = backupSnapshots.find((s) => s.id === snapshotId);
    if (!snap || !snap.data) return false;
    const p = snap.data;
    if (p.settings) setSettings(p.settings);
    if (Array.isArray(p.activities)) setActivities(p.activities);
    if (Array.isArray(p.sessions)) setSessions(p.sessions);
    if (Array.isArray(p.habits)) setHabits(p.habits);
    if (Array.isArray(p.tasks)) setTasks(p.tasks);
    if (Array.isArray(p.goals)) setGoals(p.goals);
    if (Array.isArray(p.countdowns)) setCountdowns(p.countdowns);
    if (Array.isArray(p.reviews)) setReviews(p.reviews);
    confetti({ particleCount: 90, spread: 90, origin: { y: 0.6 } });
    setTimeout(() => {
      syncWithCloud();
    }, 100);
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedDate,
        setSelectedDate,
        isDayDetailOpen,
        setIsDayDetailOpen,
        settings,
        updateSettings,
        activities,
        addActivity,
        deleteActivity,
        sessions,
        addSession,
        deleteSession,
        habits,
        addHabit,
        updateHabit,
        toggleHabit,
        deleteHabit,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        goals,
        addGoal,
        updateGoalProgress,
        deleteGoal,
        countdowns,
        addCountdown,
        deleteCountdown,
        reviews,
        saveDailyReview,
        quotes,
        addQuote,
        updateQuote,
        deleteQuote,
        toggleQuoteActive,
        reorderQuotes,
        resetQuotesToDefault,
        timerMode,
        setTimerMode,
        timerStatus,
        setTimerStatus,
        timerSecondsRemaining,
        setTimerSecondsRemaining,
        activeActivityId,
        setActiveActivityId,
        timerTotalDuration,
        setTimerTotalDuration,
        selectedPomodoroPhase,
        setSelectedPomodoroPhase,
        stopwatchElapsed,
        startTimer,
        pauseTimer,
        resetTimer,
        switchPomodoroPhase,
        finishStopwatch,
        getDayActivityData,
        exportDataJSON,
        importDataJSON,
        resetAllData,
        loadStudyFocusPreset,
        cloudSyncStatus,
        lastSyncedAt,
        cloudRoomId,
        setCloudRoomId,
        syncWithCloud,
        recoverMissingStudySession,
        backupSnapshots,
        restoreSnapshot,
        isSidebarOpen,
        setIsSidebarOpen,
        isSidebarPinned,
        setIsSidebarPinned,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
