# 🌐 DayMark Cloud Deployment Guide

Deploy your **Frontend**, **Backend**, and **Database** online for free in under 10 minutes so you can access DayMark from your phone, laptop, or any browser anywhere in the world!

---

## Architecture Summary for Cloud

```
[ Your Phone / Laptop ]
         │
         ▼
[ Vercel (Frontend Client) ] ────────► [ Render / Railway (Backend API) ]
                                                      │
                                                      ▼
                                       [ Supabase / Neon / Render (PostgreSQL) ]
```

---

## Step 1: Deploy Database (PostgreSQL) — 2 mins

### Option A: Supabase (Recommended - Free Forever)
1. Go to **[supabase.com](https://supabase.com)** and sign in with GitHub.
2. Click **"New Project"**, name it `DayMark`, and set a database password.
3. Once created, go to **Project Settings** ➡️ **Database**.
4. Copy the **Connection String (URI)** (e.g. `postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres`).
5. Save this `DATABASE_URL` for Step 2.

*(Alternatively, you can use **[neon.tech](https://neon.tech)** for instant serverless PostgreSQL).*

---

## Step 2: Deploy Backend REST API (Render / Railway) — 3 mins

### Using Render.com (Free Tier)
1. Go to **[render.com](https://render.com)** and sign in with GitHub.
2. Click **"New +"** ➡️ **"Web Service"**.
3. Select your repository: **`Amitprasad-1/DayMark`**.
4. Fill in these settings:
   - **Name**: `daymark-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Click **"Advanced"** ➡️ **"Add Environment Variable"**:
   - `DATABASE_URL`: *(paste your Supabase/Postgres connection string from Step 1)*
   - `PORT`: `5000`
6. Click **"Create Web Service"**.
7. Once deployed, copy your backend URL (e.g., `https://daymark-backend.onrender.com`).

---

## Step 3: Deploy Frontend (Vercel) — 2 mins

### Using Vercel (Fastest & Native Next.js Support)
1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **"Add New..."** ➡️ **"Project"**.
3. Import **`Amitprasad-1/DayMark`**.
4. In the configuration screen:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and select **`frontend`**.
5. Expand **Environment Variables** and add:
   - `NEXT_PUBLIC_API_URL`: *(paste your deployed Backend URL from Step 2, e.g. `https://daymark-backend.onrender.com`)*
6. Click **"Deploy"**!

🎉 Your DayMark app is now live at `https://daymark-xxxx.vercel.app`! You can bookmark it, add it to your phone's home screen as a PWA, and use it 24/7.
