'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { format, parseISO } from 'date-fns';

interface AppContextType {
  // Navigation State
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  isDayDetailOpen: boolean;
  setIsDayDetailOpen: (open: boolean) => void;

  // App Data
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id'>) => void;
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

  // Active Focus Timer State
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
  TIMER: 'daymark_timer_state',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [isDayDetailOpen, setIsDayDetailOpen] = useState<boolean>(false);

  // Core Data States
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [countdowns, setCountdowns] = useState<CustomCountdown[]>(INITIAL_COUNTDOWNS);
  const [reviews, setReviews] = useState<DailyReview[]>([]);

  // Focus Timer States
  const [timerMode, setTimerMode] = useState<TimerMode>('POMODORO');
  const [timerStatus, setTimerStatus] = useState<'IDLE' | 'RUNNING' | 'PAUSED'>('IDLE');
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState<number>(25 * 60);
  const [timerTotalDuration, setTimerTotalDuration] = useState<number>(25 * 60);
  const [activeActivityId, setActiveActivityId] = useState<string>(INITIAL_ACTIVITIES[0].id);

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
        // Seed initial dummy data for spectacular first impression
        const seed = generateSeedData();
        setSessions(seed.sessions);
        setReviews(seed.reviews);
        
        setHabits(prevHabits => 
          prevHabits.map(h => ({
            ...h,
            logs: seed.habitLogs[h.id] || {}
          }))
        );
      }

      const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (storedTasks) setTasks(JSON.parse(storedTasks));

      const storedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (storedGoals) setGoals(JSON.parse(storedGoals));

      const storedCountdowns = localStorage.getItem(STORAGE_KEYS.COUNTDOWNS);
      if (storedCountdowns) setCountdowns(JSON.parse(storedCountdowns));

    } catch (e) {
      console.error('Error hydrating state from localStorage:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save changes to localStorage
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

  // Actions
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addActivity = (activityData: Omit<Activity, 'id'>) => {
    const newAct: Activity = {
      ...activityData,
      id: `act-${Date.now()}`,
    };
    setActivities((prev) => [...prev, newAct]);
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const addSession = (sessionData: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
    };
    setSessions((prev) => [newSession, ...prev]);

    // Automatically update time goals
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
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      completed: false,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const isNowCompleted = !t.completed;
        if (isNowCompleted) {
          // Increment Task Goals
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
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'currentValue'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      currentValue: 0,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoalProgress = (id: string, delta: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, currentValue: Math.max(0, g.currentValue + delta) } : g))
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addCountdown = (cdData: Omit<CustomCountdown, 'id'>) => {
    const newCd: CustomCountdown = {
      ...cdData,
      id: `cd-${Date.now()}`,
    };
    setCountdowns((prev) => [...prev, newCd]);
  };

  const deleteCountdown = (id: string) => {
    setCountdowns((prev) => prev.filter((cd) => cd.id !== id));
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
  };

  // Helper for date stats
  const getDayActivityData = (dateStr: string): DayActivityData => {
    const daySessions = sessions.filter((s) => s.date === dateStr);
    const totalSeconds = daySessions.reduce((acc, s) => acc + s.durationSeconds, 0);

    const activeHabits = habits.filter((h) => h.isActive);
    const completedHabitsCount = activeHabits.filter((h) => !!h.logs[dateStr]).length;

    const completedTasksCount = tasks.filter((t) => t.completedAt && format(parseISO(t.completedAt), 'yyyy-MM-dd') === dateStr).length;

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
        getDayActivityData,
        exportDataJSON,
        importDataJSON,
        resetAllData,
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
