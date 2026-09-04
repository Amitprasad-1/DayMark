import { prisma } from './db';

export async function seedDatabaseIfEmpty() {
  try {
    // 1. Ensure Default User
    const user = await prisma.user.upsert({
      where: { id: 'default-user' },
      update: {},
      create: {
        id: 'default-user',
        email: 'user@daymark.app',
        name: 'Productive Architect',
      },
    });

    // 2. Ensure User Settings
    const existingSettings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });
    if (!existingSettings) {
      await prisma.userSettings.create({
        data: {
          userId: user.id,
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
      });
      console.log('✅ Default settings seeded');
    }

    // 3. Ensure Default Activities
    const activityCount = await prisma.activity.count({ where: { userId: user.id } });
    if (activityCount === 0) {
      await prisma.activity.createMany({
        data: [
          { userId: user.id, name: 'Deep Work & Coding', category: 'Development', icon: 'Code', color: '#3B82F6', dailyTargetMinutes: 240, isActive: true },
          { userId: user.id, name: 'Reading & Research', category: 'Learning', icon: 'BookOpen', color: '#8B5CF6', dailyTargetMinutes: 60, isActive: true },
          { userId: user.id, name: 'Health & Fitness', category: 'Wellness', icon: 'Dumbbell', color: '#10B981', dailyTargetMinutes: 45, isActive: true },
          { userId: user.id, name: 'Creative Design', category: 'Design', icon: 'Sparkles', color: '#EC4899', dailyTargetMinutes: 60, isActive: true },
        ],
      });
      console.log('✅ Default activities seeded');
    }

    // 4. Ensure Default Habits
    const habitCount = await prisma.habit.count({ where: { userId: user.id } });
    if (habitCount === 0) {
      await prisma.habit.createMany({
        data: [
          { userId: user.id, name: 'Morning Focus Routine (30m)', category: 'Mindset', icon: 'Sun', color: '#3B82F6', frequency: 'daily', targetDaysPerWeek: 7, isActive: true },
          { userId: user.id, name: 'Drink 3L Water', category: 'Health', icon: 'Droplets', color: '#06B6D4', frequency: 'daily', targetDaysPerWeek: 7, isActive: true },
          { userId: user.id, name: 'Read 20 Pages', category: 'Learning', icon: 'BookOpen', color: '#8B5CF6', frequency: 'daily', targetDaysPerWeek: 5, isActive: true },
        ],
      });
      console.log('✅ Default habits seeded');
    }

    // 5. Ensure Default Tasks
    const taskCount = await prisma.task.count({ where: { userId: user.id } });
    if (taskCount === 0) {
      await prisma.task.createMany({
        data: [
          { userId: user.id, title: 'Connect to GitHub Remote Repository', priority: 'HIGH', category: 'Git', completed: true, dueDate: '2026-09-03' },
          { userId: user.id, title: 'Modularize Architecture into Frontend, Backend, Database', priority: 'HIGH', category: 'Architecture', completed: true, dueDate: '2026-09-03' },
          { userId: user.id, title: 'Deploy 24/7 Cloud Architecture (Vercel, Render, Supabase)', priority: 'HIGH', category: 'DevOps', completed: false, dueDate: '2026-09-04' },
        ],
      });
      console.log('✅ Default tasks seeded');
    }

    // 6. Ensure Default Goals
    const goalCount = await prisma.goal.count({ where: { userId: user.id } });
    if (goalCount === 0) {
      await prisma.goal.createMany({
        data: [
          { userId: user.id, title: 'Reach 100 Hours of Deep Coding', type: 'TIME', targetValue: 100, currentValue: 45, category: 'Development', color: '#3B82F6' },
          { userId: user.id, title: 'Complete 30 Consecutive Habit Days', type: 'HABIT', targetValue: 30, currentValue: 18, category: 'Mindset', color: '#10B981' },
        ],
      });
      console.log('✅ Default goals seeded');
    }

    // 7. Ensure Default Countdowns
    const cdCount = await prisma.customCountdown.count();
    if (cdCount === 0) {
      await prisma.customCountdown.create({
        data: {
          title: 'DayMark Production Launch',
          targetDate: '2026-11-15',
          category: 'Milestone',
          color: '#8B5CF6',
          icon: 'Rocket',
        },
      });
      console.log('✅ Default countdowns seeded');
    }

    console.log('✨ Supabase database initialization complete.');
  } catch (error: any) {
    console.error('⚠️ Database seeding encountered an issue:', error.message);
  }
}

// Standalone execution if called directly via CLI
if (require.main === module) {
  seedDatabaseIfEmpty().then(() => process.exit(0));
}
