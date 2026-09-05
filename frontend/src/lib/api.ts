import {
  Activity,
  StudySession,
  Habit,
  Task,
  Goal,
  CustomCountdown,
  DailyReview,
  UserSettings,
} from '@/types';

// Reads the public API URL configured in Vercel or .env.local
// Example: https://daymark-backend.onrender.com or http://localhost:5000
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

interface FullSyncPayload {
  settings?: UserSettings;
  activities?: Activity[];
  sessions?: StudySession[];
  habits?: Habit[];
  tasks?: Task[];
  goals?: Goal[];
  countdowns?: CustomCountdown[];
  reviews?: DailyReview[];
}

interface FullSyncResponse {
  settings: UserSettings;
  activities: Activity[];
  sessions: StudySession[];
  habits: Habit[];
  tasks: Task[];
  goals: Goal[];
  countdowns: CustomCountdown[];
  reviews: DailyReview[];
  serverTime: string;
}

// Resilient fetch wrapper with short timeout to ensure 0ms UI delay on errors
async function request<T>(endpoint: string, options: RequestInit = {}, timeoutMs = 8000): Promise<T | null> {
  if (!API_BASE_URL) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn(`[DayMark API] ${options.method || 'GET'} ${endpoint} failed with HTTP ${res.status}`);
      return null;
    }

    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.warn(`[DayMark API] Request to ${endpoint} timed out.`);
    } else {
      console.warn(`[DayMark API] Network error on ${endpoint}:`, err.message);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export const daymarkApi = {
  // Check backend server status
  async checkHealth(): Promise<{ status: string; service?: string } | null> {
    return request<{ status: string; service?: string }>('/api/health', { method: 'GET' }, 4000);
  },

  // 1-Step Complete Cloud Sync (Pulls or pushes full workspace state)
  async syncFull(payload?: FullSyncPayload): Promise<FullSyncResponse | null> {
    if (payload) {
      return request<FullSyncResponse>('/api/sync/full', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return request<FullSyncResponse>('/api/sync/full', { method: 'GET' });
  },

  // Settings
  async getSettings(): Promise<UserSettings | null> {
    return request<UserSettings>('/api/settings');
  },
  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings | null> {
    return request<UserSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Activities
  async getActivities(): Promise<Activity[] | null> {
    return request<Activity[]>('/api/activities');
  },
  async createActivity(activity: Omit<Activity, 'id'>): Promise<Activity | null> {
    return request<Activity>('/api/activities', {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  },
  async deleteActivity(id: string): Promise<boolean> {
    const res = await request(`/api/activities/${id}`, { method: 'DELETE' });
    return res !== null;
  },

  // Sessions
  async getSessions(): Promise<StudySession[] | null> {
    return request<StudySession[]>('/api/sessions');
  },
  async createSession(session: Omit<StudySession, 'id'>): Promise<StudySession | null> {
    return request<StudySession>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  },
  async deleteSession(id: string): Promise<boolean> {
    const res = await request(`/api/sessions/${id}`, { method: 'DELETE' });
    return res !== null;
  },

  // Habits
  async getHabits(): Promise<Habit[] | null> {
    return request<Habit[]>('/api/habits');
  },
  async createHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'logs'>): Promise<Habit | null> {
    return request<Habit>('/api/habits', {
      method: 'POST',
      body: JSON.stringify(habit),
    });
  },
  async toggleHabit(id: string, date: string): Promise<Habit | null> {
    return request<Habit>(`/api/habits/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  },
  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | null> {
    return request<Habit>(`/api/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteHabit(id: string): Promise<boolean> {
    const res = await request(`/api/habits/${id}`, { method: 'DELETE' });
    return res !== null;
  },

  // Tasks
  async getTasks(): Promise<Task[] | null> {
    return request<Task[]>('/api/tasks');
  },
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'completed'>): Promise<Task | null> {
    return request<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },
  async toggleTask(id: string): Promise<Task | null> {
    return request<Task>(`/api/tasks/${id}/toggle`, { method: 'POST' });
  },
  async deleteTask(id: string): Promise<boolean> {
    const res = await request(`/api/tasks/${id}`, { method: 'DELETE' });
    return res !== null;
  },

  // Goals
  async getGoals(): Promise<Goal[] | null> {
    return request<Goal[]>('/api/goals');
  },
  async createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'currentValue'>): Promise<Goal | null> {
    return request<Goal>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  },
  async updateGoalProgress(id: string, delta: number): Promise<Goal | null> {
    return request<Goal>(`/api/goals/${id}/progress`, {
      method: 'POST',
      body: JSON.stringify({ delta }),
    });
  },
  async deleteGoal(id: string): Promise<boolean> {
    const res = await request(`/api/goals/${id}`, { method: 'DELETE' });
    return res !== null;
  },

  // Countdowns
  async getCountdowns(): Promise<CustomCountdown[] | null> {
    return request<CustomCountdown[]>('/api/countdowns');
  },
  async createCountdown(countdown: Omit<CustomCountdown, 'id'>): Promise<CustomCountdown | null> {
    return request<CustomCountdown>('/api/countdowns', {
      method: 'POST',
      body: JSON.stringify(countdown),
    });
  },
  async deleteCountdown(id: string): Promise<boolean> {
    const res = await request(`/api/countdowns/${id}`, { method: 'DELETE' });
    return res !== null;
  },

  // Reviews
  async getReviews(): Promise<DailyReview[] | null> {
    return request<DailyReview[]>('/api/reviews');
  },
  async saveReview(review: Omit<DailyReview, 'id'>): Promise<DailyReview | null> {
    return request<DailyReview>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  },
};
