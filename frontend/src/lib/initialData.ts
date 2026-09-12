import { Activity, Habit, Task, Goal, CustomCountdown, UserSettings, DailyReview, StudySession, MotivationalQuote } from '@/types';
import { format, subDays } from 'date-fns';

export const INITIAL_SETTINGS: UserSettings = {
  userName: 'Amit Prasad',
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
    currentValue: 24,
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
  {
    id: 'cd-spring-boot',
    title: 'Complete Spring Boot',
    targetDate: `${new Date().getFullYear()}-12-31`,
    category: 'Target',
    color: '#10B981',
    icon: 'Target',
  },
];

export const INITIAL_QUOTES: MotivationalQuote[] = [
  {
    id: 'quote-job-parents',
    text: 'Jaldi Job Lelo or Mammy & Papa ko Proud feel karwaoo nhi to phir kisko proud karwaoo ge',
    category: 'Parents & Pride',
    author: 'Self Reminder',
    color: '#F59E0B',
    icon: 'Heart',
    isActive: true,
    createdAt: format(new Date(), 'yyyy-MM-dd'),
  },
  {
    id: 'quote-career-focus',
    text: 'Every hour of deep focus today brings your dream offer one step closer.',
    category: 'Placement Target',
    author: 'DayMark',
    color: '#06B6D4',
    icon: 'Target',
    isActive: true,
    createdAt: format(new Date(), 'yyyy-MM-dd'),
  },
  {
    id: 'quote-silent-hustle',
    text: 'Mehnat itni shanti se karo ki tumhari kamyabi shor macha de.',
    category: 'Silent Hustle',
    author: 'Wisdom',
    color: '#10B981',
    icon: 'Flame',
    isActive: true,
    createdAt: format(new Date(), 'yyyy-MM-dd'),
  },
  {
    id: 'quote-future-self',
    text: 'Your future self and family will thank you for not giving up today.',
    category: 'Discipline',
    author: 'Focus Mindset',
    color: '#8B5CF6',
    icon: 'Sparkles',
    isActive: true,
    createdAt: format(new Date(), 'yyyy-MM-dd'),
  },
];


// Authentic Real Study Sessions for Real Subjects (No Math.random mock data)
export function generateSeedData(): {
  sessions: StudySession[];
  habitLogs: Record<string, Record<string, boolean>>;
  reviews: DailyReview[];
} {
  const sessions: StudySession[] = [];
  const habitLogs: Record<string, Record<string, boolean>> = {
    'hab-data-analytics': {},
    'hab-coding-dsa': {},
    'hab-apti-practice': {},
    'hab-english-reading': {},
    'hab-daily-exercise': {},
  };
  const reviews: DailyReview[] = [];

  const today = new Date();

  // Real sessions strictly for the days the user actually studied (Sep 10: 4h, Sep 11: 2h)
  const REAL_STUDY_SCHEDULE: {
    daysAgo: number;
    sessions: {
      activityId: string;
      durationMinutes: number;
      notes: string;
      hourOffset: number;
    }[];
    habitsCompleted: string[];
    review?: {
      wentWell: string;
      improve: string;
      tomorrowFocus: string;
      productivityScore: number;
    };
  }[] = [
    {
      daysAgo: 1, // Yesterday (Sep 11) - 2 Hours
      sessions: [
        {
          activityId: 'act-data-analytics',
          durationMinutes: 120, // 2 Hours
          notes: 'Advanced Excel for Data Analytics - Pivot Tables, VLOOKUP & data cleaning',
          hourOffset: 10,
        },
      ],
      habitsCompleted: ['hab-data-analytics'],
      review: {
        wentWell: 'Mastered Excel Pivot Tables and formulas.',
        improve: 'Increase problem solving pace.',
        tomorrowFocus: 'Deep dive into Python pandas and data analytics.',
        productivityScore: 9,
      },
    },
    {
      daysAgo: 2, // 2 Days Ago (Sep 10) - 4 Hours
      sessions: [
        {
          activityId: 'act-data-analytics',
          durationMinutes: 120, // 2 Hours
          notes: 'Advanced Python for Data Analytics - Pandas, DataFrames & NumPy arrays',
          hourOffset: 9,
        },
        {
          activityId: 'act-coding-dsa',
          durationMinutes: 120, // 2 Hours (Total: 4 Hours)
          notes: 'Coding & DSA - Data structures, array problem solving and logic building',
          hourOffset: 14,
        },
      ],
      habitsCompleted: ['hab-data-analytics', 'hab-coding-dsa'],
      review: {
        wentWell: 'Strong 4-hour deep work day! Implemented pandas dataframes from scratch and solved DSA problems.',
        improve: 'Take short 5-minute movement breaks.',
        tomorrowFocus: 'Excel advanced formulas and placement aptitude.',
        productivityScore: 9,
      },
    },
  ];

  // Populate real sessions, habit logs, and reviews
  REAL_STUDY_SCHEDULE.forEach((item) => {
    const d = subDays(today, item.daysAgo);
    const dateStr = format(d, 'yyyy-MM-dd');

    // Add sessions
    item.sessions.forEach((sess, idx) => {
      const startTime = new Date(d);
      startTime.setHours(sess.hourOffset, 0, 0, 0);
      const endTime = new Date(startTime.getTime() + sess.durationMinutes * 60 * 1000);

      sessions.push({
        id: `sess-real-${dateStr}-${idx + 1}`,
        activityId: sess.activityId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationSeconds: sess.durationMinutes * 60,
        notes: sess.notes,
        date: dateStr,
      });
    });

    // Add habit completions
    item.habitsCompleted.forEach((habitId) => {
      if (habitLogs[habitId]) {
        habitLogs[habitId][dateStr] = true;
      }
    });

    // Add reflection review if present
    if (item.review) {
      reviews.push({
        id: `review-real-${dateStr}`,
        date: dateStr,
        wentWell: item.review.wentWell,
        improve: item.review.improve,
        tomorrowFocus: item.review.tomorrowFocus,
        productivityScore: item.review.productivityScore,
      });
    }
  });

  return { sessions, habitLogs, reviews };
}
