export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type GoalType = 'TIME' | 'TASK' | 'HABIT' | 'DEADLINE';
export type TimerMode = 'POMODORO' | 'STOPWATCH' | 'COUNTDOWN';
export type ActiveTab = 'dashboard' | 'timer' | 'tasks' | 'habits' | 'goals' | 'analytics' | 'review' | 'settings';

export interface Activity {
  id: string;
  name: string;
  category: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind/HEX color
  dailyTargetMinutes: number; // in minutes
  isActive: boolean;
}

export interface StudySession {
  id: string;
  activityId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  durationSeconds: number;
  notes?: string;
  date: string; // YYYY-MM-DD for fast querying
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  color: string;
  icon: string;
  frequency: 'daily' | 'weekly';
  targetDaysPerWeek: number;
  createdAt: string; // ISO date
  isActive: boolean;
  logs: Record<string, boolean>; // Map of YYYY-MM-DD -> boolean
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: string;
  dueDate?: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string; // ISO string
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  targetValue: number; // e.g. 100 hours, 20 tasks, 30 habit days
  currentValue: number;
  targetDate?: string; // YYYY-MM-DD
  category: string;
  color: string;
  createdAt: string;
}

export interface CustomCountdown {
  id: string;
  title: string;
  targetDate: string; // ISO String or YYYY-MM-DD
  category: string;
  color: string;
  icon: string;
}

export interface DailyReview {
  id: string;
  date: string; // YYYY-MM-DD
  wentWell: string;
  improve: string;
  tomorrowFocus: string;
  notes?: string;
  productivityScore: number; // 1-10
}

export interface UserSettings {
  userName: string;
  theme: 'dark' | 'light' | 'system';
  dailyTargetMinutes: number;
  workIntervalMinutes: number; // Pomodoro work time
  shortBreakMinutes: number;
  longBreakMinutes: number;
  autoStartBreaks: boolean;
  soundEnabled: boolean;
  ambientSound: 'none' | 'rain' | 'white-noise' | 'forest' | 'waves';
}

export interface DayActivityData {
  date: string; // YYYY-MM-DD
  totalSeconds: number;
  sessionCount: number;
  completedHabitsCount: number;
  totalHabitsCount: number;
  completedTasksCount: number;
  hasReview: boolean;
}
