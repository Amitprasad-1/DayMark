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
  clockStyle: 'digital',
  vintageClockMode: 'focus',
};

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-data-analytics',
    name: 'Data Analytics Course',
    category: 'Study',
    icon: 'Database',
    color: '#06B6D4', // Punchy Cyan
    dailyTargetMinutes: 120,
    isActive: true,
  },
  {
    id: 'act-coding-dsa',
    name: 'Coding & DSA Practice',
    category: 'Development',
    icon: 'Code',
    color: '#6366F1', // Punchy Indigo
    dailyTargetMinutes: 90,
    isActive: true,
  },
  {
    id: 'act-apti-prep',
    name: 'Aptitude & KPIT Prep',
    category: 'Placement',
    icon: 'Brain',
    color: '#F59E0B', // Punchy Amber
    dailyTargetMinutes: 60,
    isActive: true,
  },
  {
    id: 'act-english-reading',
    name: 'English Practice & Reading',
    category: 'Language',
    icon: 'BookOpen',
    color: '#8B5CF6', // Punchy Purple
    dailyTargetMinutes: 30,
    isActive: true,
  },
  {
    id: 'act-exercise-fitness',
    name: 'Exercise & Workout',
    category: 'Health',
    icon: 'Flame',
    color: '#10B981', // Punchy Emerald
    dailyTargetMinutes: 45,
    isActive: true,
  },
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'hab-data-analytics',
    name: 'Learn Data Analytics Course (1h)',
    category: 'Study',
    color: '#06B6D4',
    icon: 'Database',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    isActive: true,
    logs: {},
  },
  {
    id: 'hab-coding-dsa',
    name: 'Coding & Problem Solving',
    category: 'Coding',
    color: '#6366F1',
    icon: 'Code',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    isActive: true,
    logs: {},
  },
  {
    id: 'hab-apti-practice',
    name: 'Aptitude Questions Practice',
    category: 'Placement',
    color: '#F59E0B',
    icon: 'Brain',
    frequency: 'daily',
    targetDaysPerWeek: 6,
    createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    isActive: true,
    logs: {},
  },
  {
    id: 'hab-english-reading',
    name: 'English Practice & Reading (20m)',
    category: 'Language',
    color: '#8B5CF6',
    icon: 'BookOpen',
    frequency: 'daily',
    targetDaysPerWeek: 6,
    createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    isActive: true,
    logs: {},
  },
  {
    id: 'hab-daily-exercise',
    name: 'Daily Exercise & Workout',
    category: 'Fitness',
    color: '#10B981',
    icon: 'Flame',
    frequency: 'daily',
    targetDaysPerWeek: 6,
    createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    isActive: true,
    logs: {},
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-data-1',
    title: 'Advanced Python for Data Analytics (13 lessons)',
    description: 'Python data structures, pandas, numpy, and scripts',
    priority: 'HIGH',
    category: 'Data Analytics',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    completed: false,
    createdAt: format(new Date(), 'yyyy-MM-dd'),
  },
  {
    id: 'task-data-2',
    title: 'AI Tools for Data Analysts',
    description: 'Master AI-powered coding and analyst productivity tools',
    priority: 'HIGH',
    category: 'Data Analytics',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    completed: false,
    createdAt: format(new Date(), 'yyyy-MM-dd'),
  },
  {
    id: 'task-data-3',
    title: 'Advanced Excel for Data Analytics (44 lessons)',
    description: 'Pivot tables, VLOOKUP/XLOOKUP, formulas & data cleaning',
    priority: 'MEDIUM',
    category: 'Data Analytics',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    completed: false,
    createdAt: format(new Date(), 'yyyy-MM-dd'),
  },
  {
    id: 'task-data-4',
    title: 'Git & GitHub for Data Analysts',
    description: 'Version control, repositories, and project sharing',
    priority: 'MEDIUM',
    category: 'Data Analytics',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    completed: false,
    createdAt: format(new Date(), 'yyyy-MM-dd'),
  },
  {
    id: 'task-data-5',
    title: 'Probability & Statistics for Data Analytics',
    description: 'Descriptive stats, distributions, hypothesis testing',
    priority: 'HIGH',
    category: 'Data Analytics',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    completed: false,
    createdAt: format(new Date(), 'yyyy-MM-dd'),
  },
  {
    id: 'task-data-6',
    title: 'Power BI & Tableau Data Visualization',
    description: 'Interactive dashboard creation, DAX queries, reports',
    priority: 'HIGH',
    category: 'Data Analytics',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    completed: false,
    createdAt: format(new Date(), 'yyyy-MM-dd'),
  },
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-data-analytics',
    title: 'Master Data Analytics & AI Course',
    description: 'Complete Python, Excel, Stats, Power BI & Tableau modules (60h)',
    type: 'TIME',
    targetValue: 60,
    currentValue: 2,
    targetDate: format(new Date(new Date().getFullYear(), 9, 31), 'yyyy-MM-dd'),
    category: 'Data Analytics',
    color: '#06B6D4',
    createdAt: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
  },
  {
    id: 'goal-coding-dsa',
    title: 'Reach 100 Hours of Deep Coding & DSA',
    description: 'Core programming problem solving, algorithm design, and projects',
    type: 'TIME',
    targetValue: 100,
    currentValue: 42,
    targetDate: format(new Date(new Date().getFullYear(), 11, 31), 'yyyy-MM-dd'),
    category: 'Coding',
    color: '#6366F1',
    createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  },
  {
    id: 'goal-aptitude-kpit',
    title: 'Crack KPIT & Placement Aptitude (300 Questions)',
    description: 'Solve quantitative, reasoning, and technical aptitude sets',
    type: 'TASK',
    targetValue: 300,
    currentValue: 65,
    targetDate: format(new Date(new Date().getFullYear(), 8, 10), 'yyyy-MM-dd'),
    category: 'Placement',
    color: '#F59E0B',
    createdAt: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
  },
  {
    id: 'goal-study-streak',
    title: 'Complete 30 Consecutive Study Days',
    description: 'Maintain uninterrupted daily study and exercise routine',
    type: 'HABIT',
    targetValue: 30,
    currentValue: 18,
    targetDate: format(new Date(new Date().getFullYear(), 9, 15), 'yyyy-MM-dd'),
    category: 'Consistency',
    color: '#10B981',
    createdAt: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
  },
];

export const INITIAL_COUNTDOWNS: CustomCountdown[] = [
  {
    id: 'cd-kpit-job',
    title: 'KPIT Job',
    targetDate: `${new Date().getFullYear()}-09-10`,
    category: 'Milestone',
    color: '#F59E0B',
    icon: 'Target',
  },
  {
    id: 'cd-daymark-launch',
    title: 'DayMark Production Launch',
    targetDate: `${new Date().getFullYear()}-11-15`,
    category: 'Milestone',
    color: '#8B5CF6',
    icon: 'Rocket',
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
  // Generate realistic history across all past days of the current year!
  const daysInYearPassed = Math.min(245, Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / 86400000));
  for (let i = 1; i <= daysInYearPassed; i++) {
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
