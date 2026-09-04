import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma, checkDatabaseConnection, isDbConnected } from './db';
import { seedDatabaseIfEmpty } from './seed';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const getId = (req: Request): string => {
  const { id } = req.params;
  return (Array.isArray(id) ? id[0] : id) || '';
};

// In-Memory Data Store (Instant fallback when offline or DB initializing)
let inMemoryStore = {
  settings: {
    userName: 'Productive Architect',
    theme: 'dark',
    dailyTargetMinutes: 360,
    workIntervalMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    autoStartBreaks: false,
    soundEnabled: true,
    ambientSound: 'none',
  },
  activities: [
    { id: 'act-1', name: 'Deep Work & Coding', category: 'Development', icon: 'Code', color: '#3B82F6', dailyTargetMinutes: 240, isActive: true },
    { id: 'act-2', name: 'Reading & Research', category: 'Learning', icon: 'BookOpen', color: '#8B5CF6', dailyTargetMinutes: 60, isActive: true },
    { id: 'act-3', name: 'Health & Fitness', category: 'Wellness', icon: 'Dumbbell', color: '#10B981', dailyTargetMinutes: 45, isActive: true },
    { id: 'act-4', name: 'Creative Design', category: 'Design', icon: 'Sparkles', color: '#EC4899', dailyTargetMinutes: 60, isActive: true },
  ],
  sessions: [] as any[],
  habits: [
    { id: 'hab-1', name: 'Morning Focus Routine (30m)', category: 'Mindset', icon: 'Sun', color: '#3B82F6', frequency: 'daily', targetDaysPerWeek: 7, isActive: true, logs: {} as Record<string, boolean> },
    { id: 'hab-2', name: 'Drink 3L Water', category: 'Health', icon: 'Droplets', color: '#06B6D4', frequency: 'daily', targetDaysPerWeek: 7, isActive: true, logs: {} as Record<string, boolean> },
    { id: 'hab-3', name: 'Read 20 Pages', category: 'Learning', icon: 'BookOpen', color: '#8B5CF6', frequency: 'daily', targetDaysPerWeek: 5, isActive: true, logs: {} as Record<string, boolean> },
  ],
  tasks: [
    { id: 'task-1', title: 'Connect to GitHub Remote Repository', priority: 'HIGH', category: 'Git', completed: true, dueDate: '2026-09-03' },
    { id: 'task-2', title: 'Modularize Architecture into Frontend, Backend, Database', priority: 'HIGH', category: 'Architecture', completed: true, dueDate: '2026-09-03' },
    { id: 'task-3', title: 'Deploy 24/7 Cloud Architecture (Vercel, Render, Supabase)', priority: 'HIGH', category: 'DevOps', completed: false, dueDate: '2026-09-04' },
  ],
  goals: [
    { id: 'goal-1', title: 'Reach 100 Hours of Deep Coding', type: 'TIME', targetValue: 100, currentValue: 45, category: 'Development', color: '#3B82F6' },
    { id: 'goal-2', title: 'Complete 30 Consecutive Habit Days', type: 'HABIT', targetValue: 30, currentValue: 18, category: 'Mindset', color: '#10B981' },
  ],
  countdowns: [
    { id: 'cd-1', title: 'DayMark Production Launch', targetDate: '2026-11-15', category: 'Milestone', color: '#8B5CF6', icon: 'Rocket' },
  ],
  reviews: [] as any[],
};

// 1. Health & Keep-Alive API (Used by UptimeRobot / Cron / Ping)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'DayMark Backend REST API',
    database: isDbConnected() ? 'connected (Supabase/PostgreSQL)' : 'fallback (In-Memory)',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// 2. Settings API
app.get('/api/settings', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const s = await prisma.userSettings.findFirst();
      if (s) return res.json(s);
    }
  } catch (e: any) {
    console.error('Settings fetch fallback:', e.message);
  }
  res.json(inMemoryStore.settings);
});

app.put('/api/settings', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const updated = await prisma.userSettings.upsert({
        where: { userId: 'default-user' },
        update: req.body,
        create: { userId: 'default-user', ...req.body },
      });
      return res.json(updated);
    }
  } catch (e: any) {
    console.error('Settings update fallback:', e.message);
  }
  inMemoryStore.settings = { ...inMemoryStore.settings, ...req.body };
  res.json(inMemoryStore.settings);
});

// 3. Activities API
app.get('/api/activities', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const acts = await prisma.activity.findMany({ where: { userId: 'default-user' } });
      if (acts.length > 0) return res.json(acts);
    }
  } catch (e: any) {
    console.error('Activities fetch fallback:', e.message);
  }
  res.json(inMemoryStore.activities);
});

app.post('/api/activities', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const created = await prisma.activity.create({
        data: {
          userId: 'default-user',
          name: req.body.name,
          category: req.body.category || 'General',
          icon: req.body.icon || 'BookOpen',
          color: req.body.color || '#3B82F6',
          dailyTargetMinutes: req.body.dailyTargetMinutes || 60,
          isActive: req.body.isActive !== false,
        },
      });
      return res.status(201).json(created);
    }
  } catch (e: any) {
    console.error('Activity create fallback:', e.message);
  }
  const newAct = { ...req.body, id: `act-${Date.now()}` };
  inMemoryStore.activities.push(newAct);
  res.status(201).json(newAct);
});

app.delete('/api/activities/:id', async (req: Request, res: Response) => {
  const id = getId(req);
  try {
    if (isDbConnected()) {
      await prisma.activity.delete({ where: { id } }).catch(() => null);
      return res.status(204).send();
    }
  } catch (e: any) {
    console.error('Activity delete fallback:', e.message);
  }
  inMemoryStore.activities = inMemoryStore.activities.filter((a) => a.id !== id);
  res.status(204).send();
});

// 4. Focus Sessions API
app.get('/api/sessions', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const sess = await prisma.studySession.findMany({
        where: { userId: 'default-user' },
        orderBy: { startTime: 'desc' },
      });
      return res.json(sess);
    }
  } catch (e: any) {
    console.error('Sessions fetch fallback:', e.message);
  }
  res.json(inMemoryStore.sessions);
});

app.post('/api/sessions', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const created = await prisma.studySession.create({
        data: {
          userId: 'default-user',
          activityId: req.body.activityId,
          startTime: new Date(req.body.startTime),
          endTime: new Date(req.body.endTime),
          durationSeconds: req.body.durationSeconds,
          notes: req.body.notes,
          date: req.body.date,
        },
      });
      return res.status(201).json(created);
    }
  } catch (e: any) {
    console.error('Session create fallback:', e.message);
  }
  const newSession = { ...req.body, id: `sess-${Date.now()}` };
  inMemoryStore.sessions.unshift(newSession);
  res.status(201).json(newSession);
});

app.delete('/api/sessions/:id', async (req: Request, res: Response) => {
  const id = getId(req);
  try {
    if (isDbConnected()) {
      await prisma.studySession.delete({ where: { id } }).catch(() => null);
      return res.status(204).send();
    }
  } catch (e: any) {
    console.error('Session delete fallback:', e.message);
  }
  inMemoryStore.sessions = inMemoryStore.sessions.filter((s) => s.id !== id);
  res.status(204).send();
});

// 5. Habits API
app.get('/api/habits', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const habits = await prisma.habit.findMany({
        where: { userId: 'default-user' },
        include: { logs: true },
      });
      if (habits.length > 0) {
        const mapped = habits.map((h) => {
          const logsObj: Record<string, boolean> = {};
          h.logs.forEach((log) => {
            logsObj[log.date] = log.completed;
          });
          return {
            id: h.id,
            name: h.name,
            category: h.category,
            icon: h.icon,
            color: h.color,
            frequency: h.frequency,
            targetDaysPerWeek: h.targetDaysPerWeek,
            isActive: h.isActive,
            createdAt: h.createdAt.toISOString().slice(0, 10),
            logs: logsObj,
          };
        });
        return res.json(mapped);
      }
    }
  } catch (e: any) {
    console.error('Habits fetch fallback:', e.message);
  }
  res.json(inMemoryStore.habits);
});

app.post('/api/habits', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const created = await prisma.habit.create({
        data: {
          userId: 'default-user',
          name: req.body.name,
          category: req.body.category || 'Mindset',
          icon: req.body.icon || 'Zap',
          color: req.body.color || '#3B82F6',
          frequency: req.body.frequency || 'daily',
          targetDaysPerWeek: req.body.targetDaysPerWeek || 7,
          isActive: req.body.isActive !== false,
        },
      });
      return res.status(201).json({ ...created, logs: {} });
    }
  } catch (e: any) {
    console.error('Habit create fallback:', e.message);
  }
  const newHabit = { ...req.body, id: `hab-${Date.now()}`, logs: {} };
  inMemoryStore.habits.push(newHabit);
  res.status(201).json(newHabit);
});

app.post('/api/habits/:id/toggle', async (req: Request, res: Response) => {
  const id = getId(req);
  const { date } = req.body;
  try {
    if (isDbConnected()) {
      const existing = await prisma.habitLog.findUnique({
        where: {
          habitId_date: { habitId: id, date },
        },
      });
      if (existing) {
        await prisma.habitLog.delete({ where: { id: existing.id } });
      } else {
        await prisma.habitLog.create({
          data: { habitId: id, date, completed: true },
        });
      }
      return res.json({ habitId: id, date, completed: !existing });
    }
  } catch (e: any) {
    console.error('Habit toggle fallback:', e.message);
  }
  const habit = inMemoryStore.habits.find((h) => h.id === id);
  if (habit) {
    habit.logs[date] = !habit.logs[date];
    return res.json(habit);
  }
  res.status(404).json({ error: 'Habit not found' });
});

app.delete('/api/habits/:id', async (req: Request, res: Response) => {
  const id = getId(req);
  try {
    if (isDbConnected()) {
      await prisma.habit.delete({ where: { id } }).catch(() => null);
      return res.status(204).send();
    }
  } catch (e: any) {
    console.error('Habit delete fallback:', e.message);
  }
  inMemoryStore.habits = inMemoryStore.habits.filter((h) => h.id !== id);
  res.status(204).send();
});

// 6. Tasks API
app.get('/api/tasks', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const tasks = await prisma.task.findMany({
        where: { userId: 'default-user' },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(tasks);
    }
  } catch (e: any) {
    console.error('Tasks fetch fallback:', e.message);
  }
  res.json(inMemoryStore.tasks);
});

app.post('/api/tasks', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const created = await prisma.task.create({
        data: {
          userId: 'default-user',
          title: req.body.title,
          description: req.body.description,
          priority: req.body.priority || 'MEDIUM',
          category: req.body.category || 'General',
          dueDate: req.body.dueDate,
          completed: !!req.body.completed,
        },
      });
      return res.status(201).json(created);
    }
  } catch (e: any) {
    console.error('Task create fallback:', e.message);
  }
  const newTask = { ...req.body, id: `task-${Date.now()}`, completed: false };
  inMemoryStore.tasks.unshift(newTask);
  res.status(201).json(newTask);
});

app.post('/api/tasks/:id/toggle', async (req: Request, res: Response) => {
  const id = getId(req);
  try {
    if (isDbConnected()) {
      const task = await prisma.task.findUnique({ where: { id } });
      if (task) {
        const updated = await prisma.task.update({
          where: { id },
          data: {
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : null,
          },
        });
        return res.json(updated);
      }
    }
  } catch (e: any) {
    console.error('Task toggle fallback:', e.message);
  }
  const task = inMemoryStore.tasks.find((t) => t.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.completed = !task.completed;
  res.json(task);
});

app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
  const id = getId(req);
  try {
    if (isDbConnected()) {
      await prisma.task.delete({ where: { id } }).catch(() => null);
      return res.status(204).send();
    }
  } catch (e: any) {
    console.error('Task delete fallback:', e.message);
  }
  inMemoryStore.tasks = inMemoryStore.tasks.filter((t) => t.id !== id);
  res.status(204).send();
});

// 7. Goals API
app.get('/api/goals', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const goals = await prisma.goal.findMany({ where: { userId: 'default-user' } });
      return res.json(goals);
    }
  } catch (e: any) {
    console.error('Goals fetch fallback:', e.message);
  }
  res.json(inMemoryStore.goals);
});

app.post('/api/goals', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const created = await prisma.goal.create({
        data: {
          userId: 'default-user',
          title: req.body.title,
          description: req.body.description,
          type: req.body.type || 'TIME',
          targetValue: req.body.targetValue || 10,
          currentValue: req.body.currentValue || 0,
          targetDate: req.body.targetDate,
          category: req.body.category || 'General',
          color: req.body.color || '#3B82F6',
        },
      });
      return res.status(201).json(created);
    }
  } catch (e: any) {
    console.error('Goal create fallback:', e.message);
  }
  const newGoal = { ...req.body, id: `goal-${Date.now()}`, currentValue: 0 };
  inMemoryStore.goals.push(newGoal);
  res.status(201).json(newGoal);
});

app.post('/api/goals/:id/progress', async (req: Request, res: Response) => {
  const id = getId(req);
  const { delta } = req.body;
  try {
    if (isDbConnected()) {
      const goal = await prisma.goal.findUnique({ where: { id } });
      if (goal) {
        const updated = await prisma.goal.update({
          where: { id },
          data: { currentValue: Math.max(0, goal.currentValue + (delta || 1)) },
        });
        return res.json(updated);
      }
    }
  } catch (e: any) {
    console.error('Goal progress fallback:', e.message);
  }
  const goal = inMemoryStore.goals.find((g) => g.id === id);
  if (goal) {
    goal.currentValue = Math.max(0, goal.currentValue + (delta || 1));
    return res.json(goal);
  }
  res.status(404).json({ error: 'Goal not found' });
});

app.delete('/api/goals/:id', async (req: Request, res: Response) => {
  const id = getId(req);
  try {
    if (isDbConnected()) {
      await prisma.goal.delete({ where: { id } }).catch(() => null);
      return res.status(204).send();
    }
  } catch (e: any) {
    console.error('Goal delete fallback:', e.message);
  }
  inMemoryStore.goals = inMemoryStore.goals.filter((g) => g.id !== id);
  res.status(204).send();
});

// 8. Countdowns API
app.get('/api/countdowns', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const cds = await prisma.customCountdown.findMany();
      return res.json(cds);
    }
  } catch (e: any) {
    console.error('Countdowns fetch fallback:', e.message);
  }
  res.json(inMemoryStore.countdowns);
});

app.post('/api/countdowns', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const created = await prisma.customCountdown.create({
        data: {
          title: req.body.title,
          targetDate: req.body.targetDate,
          category: req.body.category || 'Milestone',
          color: req.body.color || '#8B5CF6',
          icon: req.body.icon || 'Rocket',
        },
      });
      return res.status(201).json(created);
    }
  } catch (e: any) {
    console.error('Countdown create fallback:', e.message);
  }
  const newCd = { ...req.body, id: `cd-${Date.now()}` };
  inMemoryStore.countdowns.push(newCd);
  res.status(201).json(newCd);
});

app.delete('/api/countdowns/:id', async (req: Request, res: Response) => {
  const id = getId(req);
  try {
    if (isDbConnected()) {
      await prisma.customCountdown.delete({ where: { id } }).catch(() => null);
      return res.status(204).send();
    }
  } catch (e: any) {
    console.error('Countdown delete fallback:', e.message);
  }
  inMemoryStore.countdowns = inMemoryStore.countdowns.filter((c) => c.id !== id);
  res.status(204).send();
});

// 9. Daily Reviews API
app.get('/api/reviews', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const revs = await prisma.dailyReview.findMany({
        where: { userId: 'default-user' },
        orderBy: { date: 'desc' },
      });
      return res.json(revs);
    }
  } catch (e: any) {
    console.error('Reviews fetch fallback:', e.message);
  }
  res.json(inMemoryStore.reviews);
});

app.post('/api/reviews', async (req: Request, res: Response) => {
  const { date, wentWell, improve, tomorrowFocus, notes, productivityScore } = req.body;
  try {
    if (isDbConnected()) {
      const upserted = await prisma.dailyReview.upsert({
        where: { userId_date: { userId: 'default-user', date } },
        update: { wentWell, improve, tomorrowFocus, notes, productivityScore },
        create: { userId: 'default-user', date, wentWell, improve, tomorrowFocus, notes, productivityScore },
      });
      return res.status(201).json(upserted);
    }
  } catch (e: any) {
    console.error('Review save fallback:', e.message);
  }
  const reviewObj = { id: `rev-${Date.now()}`, date, wentWell, improve, tomorrowFocus, notes, productivityScore };
  const idx = inMemoryStore.reviews.findIndex((r) => r.date === date);
  if (idx >= 0) inMemoryStore.reviews[idx] = reviewObj;
  else inMemoryStore.reviews.unshift(reviewObj);
  res.status(201).json(reviewObj);
});

// 10. Instant Full Cloud Sync Endpoint (Ultra Fast 1-Step Sync between Phone & Laptop)
app.get('/api/sync/full', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const [settings, activities, sessions, habits, tasks, goals, countdowns, reviews] = await Promise.all([
        prisma.userSettings.findFirst(),
        prisma.activity.findMany({ where: { userId: 'default-user' } }),
        prisma.studySession.findMany({ where: { userId: 'default-user' }, orderBy: { startTime: 'desc' } }),
        prisma.habit.findMany({ where: { userId: 'default-user' }, include: { logs: true } }),
        prisma.task.findMany({ where: { userId: 'default-user' }, orderBy: { createdAt: 'desc' } }),
        prisma.goal.findMany({ where: { userId: 'default-user' } }),
        prisma.customCountdown.findMany(),
        prisma.dailyReview.findMany({ where: { userId: 'default-user' }, orderBy: { date: 'desc' } }),
      ]);

      const mappedHabits = habits.map((h) => {
        const logsObj: Record<string, boolean> = {};
        h.logs.forEach((l) => (logsObj[l.date] = l.completed));
        return {
          id: h.id,
          name: h.name,
          category: h.category,
          icon: h.icon,
          color: h.color,
          frequency: h.frequency,
          targetDaysPerWeek: h.targetDaysPerWeek,
          isActive: h.isActive,
          createdAt: h.createdAt.toISOString().slice(0, 10),
          logs: logsObj,
        };
      });

      return res.json({
        settings: settings || inMemoryStore.settings,
        activities: activities.length > 0 ? activities : inMemoryStore.activities,
        sessions,
        habits: mappedHabits.length > 0 ? mappedHabits : inMemoryStore.habits,
        tasks: tasks.length > 0 ? tasks : inMemoryStore.tasks,
        goals: goals.length > 0 ? goals : inMemoryStore.goals,
        countdowns: countdowns.length > 0 ? countdowns : inMemoryStore.countdowns,
        reviews,
        serverTime: new Date().toISOString(),
      });
    }
  } catch (e: any) {
    console.error('Full sync fetch fallback:', e.message);
  }

  res.json({
    ...inMemoryStore,
    serverTime: new Date().toISOString(),
  });
});

app.post('/api/sync/full', async (req: Request, res: Response) => {
  const { settings, activities, sessions, habits, tasks, goals, countdowns, reviews } = req.body;
  if (settings) inMemoryStore.settings = { ...inMemoryStore.settings, ...settings };
  if (activities) inMemoryStore.activities = activities;
  if (sessions) inMemoryStore.sessions = sessions;
  if (habits) inMemoryStore.habits = habits;
  if (tasks) inMemoryStore.tasks = tasks;
  if (goals) inMemoryStore.goals = goals;
  if (countdowns) inMemoryStore.countdowns = countdowns;
  if (reviews) inMemoryStore.reviews = reviews;

  res.json({
    ...inMemoryStore,
    serverTime: new Date().toISOString(),
  });
});

// Server Initialization
app.listen(PORT, async () => {
  console.log(`🚀 DayMark REST API Server running on port ${PORT}`);
  console.log(`🔍 Checking database connection...`);
  const connected = await checkDatabaseConnection();
  if (connected) {
    console.log(`⚡ Connected to Supabase PostgreSQL database successfully!`);
    await seedDatabaseIfEmpty();
  } else {
    console.log(`ℹ️ Running with local in-memory fallback. Connect DATABASE_URL for permanent PostgreSQL sync.`);
  }
});
