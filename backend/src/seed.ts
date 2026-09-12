import { prisma } from './db';

export async function seedDatabaseIfEmpty() {
  try {
    // 1. Ensure Default User
    const user = await prisma.user.upsert({
      where: { id: 'default-user' },
      update: { name: 'Amit Prasad' },
      create: {
        id: 'default-user',
        email: 'user@daymark.app',
        name: 'Amit Prasad',
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
          userName: 'Amit Prasad',
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
          { id: 'act-data-analytics', userId: user.id, name: 'Data Analytics Course', category: 'Study', icon: 'Database', color: '#06B6D4', dailyTargetMinutes: 120, isActive: true },
          { id: 'act-coding-dsa', userId: user.id, name: 'Coding & DSA Practice', category: 'Development', icon: 'Code', color: '#6366F1', dailyTargetMinutes: 90, isActive: true },
          { id: 'act-apti-prep', userId: user.id, name: 'Aptitude & KPIT Prep', category: 'Placement', icon: 'Brain', color: '#F59E0B', dailyTargetMinutes: 60, isActive: true },
          { id: 'act-english-reading', userId: user.id, name: 'English Practice & Reading', category: 'Language', icon: 'BookOpen', color: '#8B5CF6', dailyTargetMinutes: 30, isActive: true },
          { id: 'act-exercise-fitness', userId: user.id, name: 'Exercise & Workout', category: 'Health', icon: 'Flame', color: '#10B981', dailyTargetMinutes: 45, isActive: true },
        ],
      });
      console.log('✅ Default activities seeded');
    }

    // 4. Ensure Default Habits
    const habitCount = await prisma.habit.count({ where: { userId: user.id } });
    if (habitCount === 0) {
      await prisma.habit.createMany({
        data: [
          { userId: user.id, name: 'Learn Data Analytics Course (1h)', category: 'Study', icon: 'Database', color: '#06B6D4', frequency: 'daily', targetDaysPerWeek: 7, isActive: true },
          { userId: user.id, name: 'Coding & Problem Solving', category: 'Coding', icon: 'Code', color: '#6366F1', frequency: 'daily', targetDaysPerWeek: 7, isActive: true },
          { userId: user.id, name: 'Aptitude Questions Practice', category: 'Placement', icon: 'Brain', color: '#F59E0B', frequency: 'daily', targetDaysPerWeek: 6, isActive: true },
          { userId: user.id, name: 'English Practice & Reading (20m)', category: 'Language', icon: 'BookOpen', color: '#8B5CF6', frequency: 'daily', targetDaysPerWeek: 6, isActive: true },
          { userId: user.id, name: 'Daily Exercise & Workout', category: 'Fitness', icon: 'Flame', color: '#10B981', frequency: 'daily', targetDaysPerWeek: 6, isActive: true },
        ],
      });
      console.log('✅ Default habits seeded');
    }

    // 5. Ensure Default Tasks
    const taskCount = await prisma.task.count({ where: { userId: user.id } });
    if (taskCount === 0) {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);

      await prisma.task.createMany({
        data: [
          { userId: user.id, title: 'Advanced Python for Data Analytics (13 lessons)', priority: 'HIGH', category: 'Data Analytics', completed: false, dueDate: todayStr },
          { userId: user.id, title: 'AI Tools for Data Analysts', priority: 'HIGH', category: 'Data Analytics', completed: false, dueDate: todayStr },
          { userId: user.id, title: 'Advanced Excel for Data Analytics (44 lessons)', priority: 'MEDIUM', category: 'Data Analytics', completed: false, dueDate: todayStr },
          { userId: user.id, title: 'Git & GitHub for Data Analysts', priority: 'MEDIUM', category: 'Data Analytics', completed: false, dueDate: todayStr },
          { userId: user.id, title: 'Probability & Statistics for Data Analytics', priority: 'HIGH', category: 'Data Analytics', completed: false, dueDate: todayStr },
          { userId: user.id, title: 'Power BI & Tableau Data Visualization', priority: 'HIGH', category: 'Data Analytics', completed: false, dueDate: todayStr },
        ],
      });
      console.log('✅ Default tasks seeded');
    }

    // 6. Ensure Default Goals
    const goalCount = await prisma.goal.count({ where: { userId: user.id } });
    if (goalCount === 0) {
      await prisma.goal.createMany({
        data: [
          { userId: user.id, title: 'Master Data Analytics & AI Course', type: 'TIME', targetValue: 60, currentValue: 24, category: 'Data Analytics', color: '#06B6D4' },
          { userId: user.id, title: 'Reach 100 Hours of Deep Coding & DSA', type: 'TIME', targetValue: 100, currentValue: 42, category: 'Coding', color: '#6366F1' },
          { userId: user.id, title: 'Crack KPIT & Placement Aptitude (300 Questions)', type: 'TASK', targetValue: 300, currentValue: 65, category: 'Placement', color: '#F59E0B' },
          { userId: user.id, title: 'Complete 30 Consecutive Study Days', type: 'HABIT', targetValue: 30, currentValue: 18, category: 'Consistency', color: '#10B981' },
        ],
      });
      console.log('✅ Default goals seeded');
    }

    // 7. Ensure Default Countdowns
    const cdCount = await prisma.customCountdown.count();
    if (cdCount === 0) {
      const year = new Date().getFullYear();
      await prisma.customCountdown.createMany({
        data: [
          { title: 'KPIT Job', targetDate: `${year}-09-10`, category: 'Milestone', color: '#F59E0B', icon: 'Target' },
          { title: 'DayMark Production Launch', targetDate: `${year}-11-15`, category: 'Milestone', color: '#8B5CF6', icon: 'Rocket' },
          { title: 'Complete Spring Boot', targetDate: `${year}-12-31`, category: 'Target', color: '#10B981', icon: 'Target' },
        ],
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
