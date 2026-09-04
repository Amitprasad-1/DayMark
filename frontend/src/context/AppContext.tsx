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
} from '@/types';
import {
  INITIAL_SETTINGS,
  INITIAL_ACTIVITIES,
  INITIAL_HABITS,
  INITIAL_TASKS,
  INITIAL_GOALS,
  INITIAL_COUNTDOWNS,
  generateSeedData,
} from '@/lib/initialData';
import { soundEngine } from '@/lib/audio';
import { daymarkApi } from '@/lib/api';
import confetti from 'canvas-confetti';
import { format, parseISO } from 'date-fns';

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

  // Cloud Synchronization State
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncedAt: Date | null;
  syncWithCloud: () => Promise<void>;

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
  TIMER: 'daymark_timer_state_v2',
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

  // Global Resilient Timer States
  const [timerMode, setTimerMode] = useState<TimerMode>('POMODORO');
  const [timerStatus, setTimerStatus] = useState<'IDLE' | 'RUNNING' | 'PAUSED'>('IDLE');
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState<number>(25 * 60);
  const [timerTotalDuration, setTimerTotalDuration] = useState<number>(25 * 60);
  const [activeActivityId, setActiveActivityId] = useState<string>(INITIAL_ACTIVITIES[0].id);
  const [selectedPomodoroPhase, setSelectedPomodoroPhase] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [stopwatchElapsed, setStopwatchElapsed] = useState<number>(0);

  // Timestamp refs for background resilience
  const timerTargetTimestampRef = useRef<number | null>(null);
  const stopwatchStartTimestampRef = useRef<number | null>(null);

  // Cloud Sync State
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) setSettings(JSON.parse(storedSettings));

      const storedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (storedActivities) setActivities(JSON.parse(storedActivities));

      const storedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      const storedHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
      const storedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);

      if (storedSessions && storedHabits) {
        setSessions(JSON.parse(storedSessions));
        setHabits(JSON.parse(storedHabits));
        if (storedReviews) setReviews(JSON.parse(storedReviews));
      } else {
        const seed = generateSeedData();
        setSessions(seed.sessions);
        setReviews(seed.reviews);
        setHabits((prev) =>
          prev.map((h) => ({
            ...h,
            logs: seed.habitLogs[h.id] || {},
          }))
        );
      }

      const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (storedTasks) setTasks(JSON.parse(storedTasks));

      const storedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (storedGoals) setGoals(JSON.parse(storedGoals));

      const storedCountdowns = localStorage.getItem(STORAGE_KEYS.COUNTDOWNS);
      if (storedCountdowns) setCountdowns(JSON.parse(storedCountdowns));

      // Restore Timer State with exact epoch timestamps
      const storedTimer = localStorage.getItem(STORAGE_KEYS.TIMER);
      if (storedTimer) {
        const t = JSON.parse(storedTimer);
        if (t.timerMode) setTimerMode(t.timerMode);
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
      setIsHydrated(true);
    }
  }, []);

  // Background Cloud Sync Function (Runs without blocking UI)
  const syncWithCloud = async () => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setCloudSyncStatus('offline');
      return;
    }

    try {
      setCloudSyncStatus('syncing');
      const cloudData = await daymarkApi.syncFull();

      if (!cloudData) {
        setCloudSyncStatus('offline');
        return;
      }

      // Merge Cloud updates if remote data exists
      if (cloudData.settings) setSettings((prev) => ({ ...prev, ...cloudData.settings }));
      if (cloudData.activities && cloudData.activities.length > 0) setActivities(cloudData.activities);
      if (cloudData.sessions && cloudData.sessions.length > 0) setSessions(cloudData.sessions);
      if (cloudData.habits && cloudData.habits.length > 0) setHabits(cloudData.habits);
      if (cloudData.tasks && cloudData.tasks.length > 0) setTasks(cloudData.tasks);
      if (cloudData.goals && cloudData.goals.length > 0) setGoals(cloudData.goals);
      if (cloudData.countdowns && cloudData.countdowns.length > 0) setCountdowns(cloudData.countdowns);
      if (cloudData.reviews && cloudData.reviews.length > 0) setReviews(cloudData.reviews);

      setCloudSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err) {
      console.warn('[DayMark] Cloud sync error:', err);
      setCloudSyncStatus('error');
    }
  };

  // Background Sync Effect: on hydration, every 60s, and when app focuses
  useEffect(() => {
    if (!isHydrated) return;
    syncWithCloud();

    const interval = setInterval(syncWithCloud, 60000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncWithCloud();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
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
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [settings, activities, sessions, habits, tasks, goals, countdowns, reviews, isHydrated]);

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
    if (stopwatchElapsed < 10) return;
    setTimerStatus('IDLE');
    timerTargetTimestampRef.current = null;
    stopwatchStartTimestampRef.current = null;
    if (settings.soundEnabled) soundEngine.playCompletionChime();
    confetti({ particleCount: 60, spread: 70 });

    const now = new Date();
    addSession({
      activityId: activeActivityId,
      startTime: new Date(now.getTime() - stopwatchElapsed * 1000).toISOString(),
      endTime: now.toISOString(),
      durationSeconds: stopwatchElapsed,
      notes: notes || `Stopwatch focus session (${Math.round(stopwatchElapsed / 60)}m)`,
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
    const newSession: StudySession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
    };
    setSessions((prev) => [newSession, ...prev]);
    daymarkApi.createSession(sessionData).catch(() => null);

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
    setTasks((prev) => prev.filter((t) => t.id !== id));
    daymarkApi.deleteTask(id).catch(() => null);
  };

  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'currentValue'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      currentValue: 0,
    };
    setGoals((prev) => [...prev, newGoal]);
    daymarkApi.createGoal(goalData).catch(() => null);
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
    setGoals((prev) => prev.filter((g) => g.id !== id));
    daymarkApi.deleteGoal(id).catch(() => null);
  };

  const addCountdown = (cdData: Omit<CustomCountdown, 'id'>) => {
    const newCd: CustomCountdown = {
      ...cdData,
      id: `cd-${Date.now()}`,
    };
    setCountdowns((prev) => [...prev, newCd]);
    daymarkApi.createCountdown(cdData).catch(() => null);
  };

  const deleteCountdown = (id: string) => {
    setCountdowns((prev) => prev.filter((cd) => cd.id !== id));
    daymarkApi.deleteCountdown(id).catch(() => null);
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

  // Helper for date stats
  const getDayActivityData = (dateStr: string): DayActivityData => {
    const daySessions = sessions.filter((s) => s.date === dateStr);
    const totalSeconds = daySessions.reduce((acc, s) => acc + s.durationSeconds, 0);

    const activeHabits = habits.filter((h) => h.isActive);
    const completedHabitsCount = activeHabits.filter((h) => !!h.logs[dateStr]).length;

    const completedTasksCount = tasks.filter(
      (t) => t.completedAt && format(parseISO(t.completedAt), 'yyyy-MM-dd') === dateStr
    ).length;

    const hasReview = reviews.some((r) => r.date === dateStr);

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
    setHabits(INITIAL_HABITS);
    setTasks(INITIAL_TASKS);
    setGoals(INITIAL_GOALS);
    setCountdowns(INITIAL_COUNTDOWNS);
    resetTimer();
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
        cloudSyncStatus,
        lastSyncedAt,
        syncWithCloud,
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
