# 🌐 DayMark 24/7 Independent Cloud Architecture Guide

Make DayMark completely independent so that **even when your laptop is turned off or in sleep mode**, your application loads **without delay** on your phone, laptop, and tablet, with **real-time database sync**.

---

## Architecture Overview

```
[ Your Phone (Installed App / Safari / Chrome) ]     [ Your Laptop / Tablet ]
                       │                                       │
                       └───────────────────┬───────────────────┘
                                           │
                                           ▼ (0ms Instant Load via CDN & Cache)
                            [ Vercel Cloud (Frontend Client) ]
                                           │
                                           ▼ (Real-Time REST Sync)
                            [ Render.com (Backend REST API) ]
                                           │
                                           ▼ (Persistent PostgreSQL)
                            [ Supabase (Cloud Database) ]
```

---

## Step 1: Database Setup (Supabase PostgreSQL) — ~2 mins

1. Go to **[supabase.com](https://supabase.com)** and open your `DayMark` project (or click **"New Project"**).
2. Go to **Project Settings** (gear icon) ➡️ **Database**.
3. Under **Connection string**, select the **URI** tab (choose **Session Mode** or **Transaction Mode** port 5432 or 6543).
4. Copy the connection string. It looks like:
   ```text
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   *(Remember to replace `[YOUR-PASSWORD]` with your actual Supabase database password).*

---

## Step 2: Deploy Backend REST API (Render.com) — ~3 mins

1. Go to **[render.com](https://render.com)** and sign in.
2. Click **"New +"** ➡️ **"Web Service"**.
3. Connect your GitHub repository: **`Amitprasad-1/DayMark`**.
4. Configure the Web Service:
   - **Name**: `daymark-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     npm install && npx prisma db push --accept-data-loss && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
5. Click **"Advanced"** ➡️ **"Add Environment Variable"**:
   - `DATABASE_URL`: *(paste your Supabase URI from Step 1)*
   - `PORT`: `5000`
6. Click **"Create Web Service"**.
7. Once deployed, Render will provide your public backend URL (e.g. `https://daymark-backend.onrender.com`).
8. Verify it by visiting `https://daymark-backend.onrender.com/api/health` in your browser. You should see:
   ```json
   { "status": "ok", "service": "DayMark Backend REST API", "database": "connected (Supabase/PostgreSQL)" }
   ```

---

## Step 3: Eliminate Render Free-Tier Delay (Keep-Alive Ping) — ~1 min

Render's free tier sleeps after 15 minutes of inactivity (causing a 50s cold start). To keep DayMark loading **instantly without delay 24/7**:

1. Go to free ping service **[cron-job.org](https://cron-job.org)** (or **[uptimerobot.com](https://uptimerobot.com)**).
2. Create a free account and click **"Create Cronjob"** (or **"Add New Monitor"**).
3. Set the URL to your Render health endpoint:
   ```text
   https://daymark-backend.onrender.com/api/health
   ```
4. Set the schedule to run **every 10 minutes**.
5. Save! Render will now stay awake 24/7 with **0 seconds delay** when you open your app.

---

## Step 4: Deploy Frontend (Vercel) — ~2 mins

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **"Add New..."** ➡️ **"Project"**.
3. Import **`Amitprasad-1/DayMark`**.
4. In the Project Setup:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and select **`frontend`**
5. Expand **Environment Variables** and add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://daymark-backend.onrender.com` *(your Render URL from Step 2, no trailing slash)*
6. Click **"Deploy"**.

In ~60 seconds, your site is live with a global production URL (e.g., `https://daymark-seven.vercel.app`)!

---

## Step 5: Install DayMark on Your Phone (Native App Mode)

You never need to open a terminal or have your laptop powered on again. DayMark is a Progressive Web App (PWA):

### On Android (Chrome / Brave / Edge)
1. Open your Vercel URL on your phone browser.
2. Tap the **three vertical dots (⋮)** in the top right.
3. Tap **"Add to Home screen"** or **"Install application"**.
4. The DayMark app icon will appear on your phone's home screen. Tap it to launch full-screen like an App Store app!

### On iPhone (Safari)
1. Open your Vercel URL in **Safari**.
2. Tap the **Share** button (the square with an arrow pointing up at the bottom).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top right.
5. The DayMark icon is now on your home screen and runs independently in native full-screen mode.

---

## Real-Time Synchronization Features

- 🟢 **Instant 0ms Load**: DayMark immediately loads your schedule and focus stats from local cache on launch — no loading spinners or blank screens.
- ⚡ **Cloud Auto-Sync**: Background sync fetches the latest habit streaks, timer sessions, and tasks from Supabase automatically whenever you open the app or switch tabs.
- 🔄 **Cloud Status Pill**: Look at the top bar header for the **"Cloud Synced"** indicator. You can click it at any time to trigger an instant cloud refresh.
