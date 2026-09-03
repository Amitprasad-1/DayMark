# DayMark ⚡

> **Visual Full-Year Productivity & Time Mastery Suite**

DayMark is a full-featured productivity ecosystem featuring an interactive full-year visual heatmap calendar, high-precision focus timer with ambient soundscapes, habits matrix, task directives, strategic goals, and daily reflection journals.

## Architecture

DayMark is cleanly separated into three modular services:

```
DayMark/
├── frontend/          # Client App (React, Tailwind CSS, Lucide Icons, Recharts)
├── backend/           # Express REST API Server (Node.js, TypeScript, Express)
└── database/          # Prisma ORM Schema, SQLite / PostgreSQL models
```

---

## Getting Started

### 1. Frontend Client
```bash
cd frontend
npm install
npm run dev
```
Runs the client at `http://localhost:3000`.

### 2. Backend REST API
```bash
cd backend
npm install
npm run dev
```
Runs the API server at `http://localhost:5000`.

### 3. Database Layer
```bash
cd database
npx prisma generate
```

---

## Key Features

- 📅 **Full-Year Visual Calendar**: 12-month interactive heatmap centerpiece tracking daily focus hours & habit completions.
- ⏱️ **Focus Timer**: Pomodoro, Stopwatch, and countdown modes with real-time Web Audio ambient sound synthesis (Rain, White Noise, Ocean Waves, Forest Wind) and bell completion chimes.
- ⚡ **Habit Matrix**: 14-day interactive streak matrix with celebratory micro-interactions.
- ✅ **Task Directives**: Prioritized task manager with due dates and tags.
- 🎯 **Strategic Goals**: Quantified milestone tracking for hours, habits, and tasks.
- 📊 **Productivity Analytics**: Visual charts powered by Recharts (Category breakdown, weekly focus trends).
- 📝 **Daily Reflection**: Structured journaling for daily wins, obstacles, and productivity scoring.
- 💾 **Data Portability**: Local persistence with full JSON export and backup restoration.
