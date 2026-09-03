import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Data Store (Easily syncable with Prisma / Database layer)
let dataStore = {
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
    { id: 'act-1', name: 'Deep Work & Coding', category: 'Development', color: '#3B82F6', dailyTargetMinutes: 240, isActive: true },
    { id: 'act-2', name: 'Reading & Research', category: 'Learning', color: '#8B5CF6', dailyTargetMinutes: 60, isActive: true },
    { id: 'act-3', name: 'Health & Fitness', category: 'Wellness', color: '#10B981', dailyTargetMinutes: 45, isActive: true },
    { id: 'act-4', name: 'Creative Design', category: 'Design', color: '#EC4899', dailyTargetMinutes: 60, isActive: true },
  ],
  sessions: [] as any[],
  habits: [
    { id: 'hab-1', name: 'Morning Focus Routine (30m)', category: 'Mindset', color: '#3B82F6', frequency: 'daily', targetDaysPerWeek: 7, logs: {} },
    { id: 'hab-2', name: 'Drink 3L Water', category: 'Health', color: '#06B6D4', frequency: 'daily', targetDaysPerWeek: 7, logs: {} },
    { id: 'hab-3', name: 'Read 20 Pages', category: 'Learning', color: '#8B5CF6', frequency: 'daily', targetDaysPerWeek: 5, logs: {} },
  ],
  tasks: [
    { id: 'task-1', title: 'Connect to GitHub Remote Repository', priority: 'HIGH', category: 'Git', completed: true, dueDate: '2026-09-03' },
    { id: 'task-2', title: 'Modularize Architecture into Frontend, Backend, Database', priority: 'HIGH', category: 'Architecture', completed: true, dueDate: '2026-09-03' },
  ],
  goals: [
    { id: 'goal-1', title: 'Reach 100 Hours of Deep Coding', type: 'TIME', targetValue: 100, currentValue: 45, category: 'Development' },
    { id: 'goal-2', title: 'Complete 30 Consecutive Habit Days', type: 'HABIT', targetValue: 30, currentValue: 18, category: 'Mindset' },
  ],
  countdowns: [
    { id: 'cd-1', title: 'DayMark Production Launch', targetDate: '2026-11-15', category: 'Milestone', color: '#8B5CF6', icon: 'Rocket' },
  ],
  reviews: [] as any[],
};

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'DayMark Backend API', timestamp: new Date().toISOString() });
});

// Settings API
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(dataStore.settings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  dataStore.settings = { ...dataStore.settings, ...req.body };
  res.json(dataStore.settings);
});

// Activities API
app.get('/api/activities', (_req: Request, res: Response) => {
  res.json(dataStore.activities);
});

app.post('/api/activities', (req: Request, res: Response) => {
  const newAct = { ...req.body, id: `act-${Date.now()}` };
  dataStore.activities.push(newAct);
  res.status(201).json(newAct);
});

app.delete('/api/activities/:id', (req: Request, res: Response) => {
  dataStore.activities = dataStore.activities.filter((a) => a.id !== req.params.id);
  res.status(204).send();
});

// Focus Sessions API
app.get('/api/sessions', (_req: Request, res: Response) => {
  res.json(dataStore.sessions);
});

app.post('/api/sessions', (req: Request, res: Response) => {
  const newSession = { ...req.body, id: `sess-${Date.now()}` };
  dataStore.sessions.unshift(newSession);
  res.status(201).json(newSession);
});

app.delete('/api/sessions/:id', (req: Request, res: Response) => {
  dataStore.sessions = dataStore.sessions.filter((s) => s.id !== req.params.id);
  res.status(204).send();
});

// Habits API
app.get('/api/habits', (_req: Request, res: Response) => {
  res.json(dataStore.habits);
});

app.post('/api/habits', (req: Request, res: Response) => {
  const newHabit = { ...req.body, id: `hab-${Date.now()}`, logs: {} };
  dataStore.habits.push(newHabit);
  res.status(201).json(newHabit);
});

app.post('/api/habits/:id/toggle', (req: Request, res: Response) => {
  const { date } = req.body;
  const habit = dataStore.habits.find((h) => h.id === req.params.id);
  if (!habit) return res.status(404).json({ error: 'Habit not found' });

  const current = !!habit.logs[date];
  habit.logs[date] = !current;
  res.json(habit);
});

app.delete('/api/habits/:id', (req: Request, res: Response) => {
  dataStore.habits = dataStore.habits.filter((h) => h.id !== req.params.id);
  res.status(204).send();
});

// Tasks API
app.get('/api/tasks', (_req: Request, res: Response) => {
  res.json(dataStore.tasks);
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const newTask = { ...req.body, id: `task-${Date.now()}`, completed: false };
  dataStore.tasks.unshift(newTask);
  res.status(201).json(newTask);
});

app.post('/api/tasks/:id/toggle', (req: Request, res: Response) => {
  const task = dataStore.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.completed = !task.completed;
  res.json(task);
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  dataStore.tasks = dataStore.tasks.filter((t) => t.id !== req.params.id);
  res.status(204).send();
});

// Goals API
app.get('/api/goals', (_req: Request, res: Response) => {
  res.json(dataStore.goals);
});

app.post('/api/goals', (req: Request, res: Response) => {
  const newGoal = { ...req.body, id: `goal-${Date.now()}`, currentValue: 0 };
  dataStore.goals.push(newGoal);
  res.status(201).json(newGoal);
});

app.delete('/api/goals/:id', (req: Request, res: Response) => {
  dataStore.goals = dataStore.goals.filter((g) => g.id !== req.params.id);
  res.status(204).send();
});

// Countdowns API
app.get('/api/countdowns', (_req: Request, res: Response) => {
  res.json(dataStore.countdowns);
});

app.post('/api/countdowns', (req: Request, res: Response) => {
  const newCd = { ...req.body, id: `cd-${Date.now()}` };
  dataStore.countdowns.push(newCd);
  res.status(201).json(newCd);
});

app.delete('/api/countdowns/:id', (req: Request, res: Response) => {
  dataStore.countdowns = dataStore.countdowns.filter((c) => c.id !== req.params.id);
  res.status(204).send();
});

// Reviews API
app.get('/api/reviews', (_req: Request, res: Response) => {
  res.json(dataStore.reviews);
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const { date, wentWell, improve, tomorrowFocus, productivityScore } = req.body;
  const existingIdx = dataStore.reviews.findIndex((r) => r.date === date);
  const reviewObj = { id: `rev-${Date.now()}`, date, wentWell, improve, tomorrowFocus, productivityScore };

  if (existingIdx >= 0) {
    dataStore.reviews[existingIdx] = reviewObj;
  } else {
    dataStore.reviews.unshift(reviewObj);
  }
  res.status(201).json(reviewObj);
});

// Backup Export & Import API
app.get('/api/export', (_req: Request, res: Response) => {
  res.json({
    data: dataStore,
    exportedAt: new Date().toISOString(),
  });
});

app.post('/api/import', (req: Request, res: Response) => {
  if (req.body && req.body.data) {
    dataStore = { ...dataStore, ...req.body.data };
    res.json({ success: true, message: 'Data imported successfully' });
  } else {
    res.status(400).json({ error: 'Invalid import payload' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 DayMark REST API Server running on port ${PORT}`);
});
