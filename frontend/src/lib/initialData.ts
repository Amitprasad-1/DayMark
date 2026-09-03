import { Activity, Habit, Task, Goal, CustomCountdown, UserSettings, DailyReview, StudySession } from '@/types';
import { format, subDays } from 'date-fns';

export const INITIAL_SETTINGS: UserSettings = {
  userName: 'Productive Architect',
  theme: 'dark',
  dailyTargetMinutes: 360, // 6 hours
  workIntervalMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  autoStartBreaks: false,
  soundEnabled: true,
  ambientSound: 'none',
};

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    name: 'Deep Work & Coding',
    category: 'Development',
    icon: 'Code',
    color: '#3B82F6', // Blue
    dailyTargetMinutes: 240,
    isActive: true,
  },
  {
    id: 'act-2',
    name: 'Reading & Research',
    category: 'Learning',
    icon: 'BookOpen',
    color: '#8B5CF6', // Purple
    dailyTargetMinutes: 60,
    isActive: true,
  },
  {
    id: 'act-3',
    name: 'Health & Fitness',
    category: 'Wellness',
    icon: 'Activity',
    color: '#10B981', // Emerald
    dailyTargetMinutes: 45,
    isActive: true,
  },
  {
    id: 'act-4',
    name: 'Creative Design',
    category: 'Design',
    icon: 'Palette',
    color: '#EC4899', // Pink
    dailyTargetMinutes: 60,
    isActive: true,
  },
  {
    id: 'act-5',
    name: 'Planning & Review',
    category: 'Management',
    icon: 'Compass',
    color: '#F59E0B', // Amber
    dailyTargetMinutes: 30,
    isActive: true,
  },
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'hab-1',
    name: 'Morning Focus Routine (30m)',
    category: 'Mindset',
    color: '#3B82F6',
    icon: 'Sun',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    createdAt: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
    isActive: true,
    logs: {},
  },
  {
    id: 'hab-2',
    name: 'Drink 3L Water',
    category: 'Health',
    color: '#06B6D4',
    icon: 'Droplets',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    createdAt: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
    isActive: true,
    logs: {},
  },
  {
    id: 'hab-3',
    name: 'Read 20 Pages',
    category: 'Learning',
    color: '#8B5CF6',
    icon: 'Book',
    frequency: 'daily',
    targetDaysPerWeek: 5,
    createdAt: format(subDays(new Date(), 45), 'yyyy-MM-dd'),
    isActive: true,
    logs: {},
  },
  {
    id: 'hab-4',
    name: '10K Steps or Workout',
    category: 'Fitness',
    color: '#10B981',
    icon: 'Zap',
    frequency: 'daily',
    targetDaysPerWeek: 6,
    createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    isActive: true,
    logs: {},
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Architect DayMark Core Calendar Component',
    description: 'Implement responsive 12-month visual heatmap grid and day detail modal',
    priority: 'HIGH',
    category: 'Development',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
  },
  {
    id: 'task-2',
    title: 'Integrate Web Audio Ambient Generator',
    description: 'Synthesize Rain, White Noise, and Ocean Sound waves natively without external assets',
    priority: 'HIGH',
    category: 'Audio',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
  },
  {
    id: 'task-3',
    title: 'Build Interactive Habit Consistency Matrix',
    description: 'Calculate streak record, active streaks, and monthly completion percentage',
    priority: 'MEDIUM',
    category: 'Analytics',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    completed: false,
    createdAt: format(new Date(), 'yyyy-MM-dd'),
  },
  {
    id: 'task-4',
    title: 'Configure PWA Service Worker & Manifest',
    description: 'Enable offline support and installable app banner',
    priority: 'MEDIUM',
    category: 'PWA',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    completed: false,
    createdAt: format(new Date(), 'yyyy-MM-dd'),
  },
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'Reach 100 Hours of Deep Coding',
    description: 'Target for Q3 to build core full-stack software products',
    type: 'TIME',
    targetValue: 100, // hours
    currentValue: 42,
    targetDate: format(new Date(new Date().getFullYear(), 11, 31), 'yyyy-MM-dd'),
    category: 'Development',
    color: '#3B82F6',
    createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  },
  {
    id: 'goal-2',
    title: 'Complete 30 Consecutive Habit Days',
    description: 'Maintain morning focus routine without missing a single day',
    type: 'HABIT',
    targetValue: 30,
    currentValue: 18,
    targetDate: format(new Date(new Date().getFullYear(), 9, 15), 'yyyy-MM-dd'),
    category: 'Mindset',
    color: '#10B981',
    createdAt: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
  },
  {
    id: 'goal-3',
    title: 'Finish 25 Key Roadmap Tasks',
    description: 'Ship feature updates and polish DayMark UI',
    type: 'TASK',
    targetValue: 25,
    currentValue: 14,
    targetDate: format(new Date(new Date().getFullYear(), 10, 1), 'yyyy-MM-dd'),
    category: 'Productivity',
    color: '#F59E0B',
    createdAt: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
  },
];

export const INITIAL_COUNTDOWNS: CustomCountdown[] = [
  {
    id: 'cd-1',
    title: 'Productivity Summit & Release v1.0',
    targetDate: format(new Date(new Date().getFullYear(), 10, 15), 'yyyy-MM-dd'),
    category: 'Milestone',
    color: '#8B5CF6',
    icon: 'Rocket',
  },
  {
    id: 'cd-2',
    title: 'Quarter 4 Goal Sprint',
    targetDate: format(new Date(new Date().getFullYear(), 9, 1), 'yyyy-MM-dd'),
    category: 'Work',
    color: '#EC4899',
    icon: 'Target',
  },
];

// Helper to generate seed historical data so the full year visual calendar has realistic heatmaps!
export function generateSeedData(): {
  sessions: StudySession[];
  habitLogs: Record<string, Record<string, boolean>>;
  reviews: DailyReview[];
} {
  const sessions: StudySession[] = [];
  const habitLogs: Record<string, Record<string, boolean>> = {
    'hab-1': {},
    'hab-2': {},
    'hab-3': {},
    'hab-4': {},
  };
  const reviews: DailyReview[] = [];

  const today = new Date();
  // Generate random history over past 60 days
  for (let i = 1; i <= 60; i++) {
    const d = subDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');

    // Random chance of focus activity (80% of days)
    if (Math.random() > 0.2) {
      const numSessions = Math.floor(Math.random() * 3) + 1;
      for (let s = 0; s < numSessions; s++) {
        const actIndex = Math.floor(Math.random() * INITIAL_ACTIVITIES.length);
        const act = INITIAL_ACTIVITIES[actIndex];
        const durationSec = Math.floor(Math.random() * 45 + 15) * 60; // 15 to 60 mins
        
        sessions.push({
          id: `seed-sess-${i}-${s}`,
          activityId: act.id,
          startTime: new Date(d.valueOf() + s * 3600000).toISOString(),
          endTime: new Date(d.valueOf() + s * 3600000 + durationSec * 1000).toISOString(),
          durationSeconds: durationSec,
          notes: `Productive focus session on ${act.name}`,
          date: dateStr,
        });
      }
    }

    // Seed habit completion logs
    INITIAL_HABITS.forEach((h) => {
      if (Math.random() > 0.3) {
        habitLogs[h.id][dateStr] = true;
      }
    });

    // Seed periodic reviews
    if (i % 7 === 0) {
      reviews.push({
        id: `review-${dateStr}`,
        date: dateStr,
        wentWell: 'Completed coding targets and maintained consistent focus routine.',
        improve: 'Minimize notification distractions in the afternoon.',
        tomorrowFocus: 'Deep dive into analytical metrics and calendar visualizers.',
        productivityScore: Math.floor(Math.random() * 3) + 8, // 8-10
      });
    }
  }

  return { sessions, habitLogs, reviews };
}
