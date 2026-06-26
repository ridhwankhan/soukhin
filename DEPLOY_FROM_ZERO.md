# Soukhin — Deploy from zero (beginner guide)

You use **3 websites**. Each does one job:

| Website | What it is | What you do there |
|---------|------------|-------------------|
| **GitHub** | Stores your code | Already done — code is at `github.com/ridhwankhan/soukhin` |
| **Supabase** | Database + login backend | Paste SQL once, create your owner login |
| **Vercel** | Shows your shop to the world | Connect GitHub, click Deploy |

Your Supabase project URL: `https://yxctdtihkmslpidscfph.supabase.co`

---

## Part A — Supabase (database) — do this FIRST

### A1. Open the right place

1. Go to **https://supabase.com** and sign in  
2. Click your project (name might be "Soukhin" or similar)  
3. On the **left sidebar**, click **SQL Editor**  
   - It looks empty. **That is normal.** You paste SQL yourself.

### A2. Run the database setup (one paste)

1. In SQL Editor, click **+ New query** (top right)  
2. On your computer, open this file from the Soukhin folder:  
   **`supabase/ONE_CLICK_DATABASE_SETUP.sql`**  
   - Or on GitHub: open `supabase/ONE_CLICK_DATABASE_SETUP.sql` → copy all  
3. **Select all** (Ctrl+A) in that file → **Copy** (Ctrl+C)  
4. **Paste** into the Supabase SQL Editor box (Ctrl+V)  
5. Click the green **RUN** button (bottom right)  
6. Wait 30–60 seconds. You should see **Success** (green).  
   - If you see red errors, scroll up — copy the error and ask for help.

### A3. Check it worked

1. Left sidebar → **Table Editor**  
2. You should see tables like: `products`, `categories`, `orders`, `admin_users`  
3. Click **`admin_users`** — you should see one row: your owner email

### A4. Create your login password (Authentication)

The database knows your email. Now Supabase needs a **password** for you:

1. Left sidebar → **Authentication**  
2. Click **Users** (under Authentication)  
3. Click **Add user** → **Create new user**  
4. Fill in:
   - **Email:** `shoukhin.lifestyle.bd@gmail.com` (or your owner email)
   - **Password:** choose a strong password (write it down)
   - Turn ON **Auto Confirm User** ✅  
5. Click **Create user**

### A5. Tell Supabase your website address (Auth URLs)

Do this twice — once for local testing, once after Vercel (Part B).

1. Left sidebar → **Authentication** → **URL Configuration**  
2. For **local testing** set:
   - **Site URL:** `http://localhost:5173`  
   - **Redirect URLs** — click Add, paste:  
     `http://localhost:5173/auth?verified=1`  
3. Click **Save**

### A6. Copy your API keys (for Vercel later)

1. Left sidebar → **Project Settings** (gear icon at bottom)  
2. Click **API**  
3. Copy and save somewhere safe:
   - **Project URL** → you will use as `VITE_SUPABASE_URL`  
   - **Publishable key** (`sb_publishable_...`) → you will use as `VITE_SUPABASE_ANON_KEY`  

> Do **NOT** put the **Secret** key (`sb_secret_...`) in Vercel or GitHub. Server only.

---

## Part B — Vercel (put shop online for FREE)

### B1. Sign up and import

1. Go to **https://vercel.com** → sign up (use **Continue with GitHub**)  
2. Click **Add New…** → **Project**  
3. Find **`ridhwankhan/soukhin`** → click **Import**

### B2. Environment variables — YES, you can import a file

You do **not** need to type each variable one by one.

#### Option A — Import on Vercel (easiest)

1. On your PC, open **`env.import.template`** from the Soukhin folder (or [on GitHub](https://github.com/ridhwankhan/soukhin/blob/main/env.import.template))
2. Replace the placeholders:
   - `PASTE_YOUR_sb_publishable_KEY_HERE` → your key from Supabase → Settings → API → **Publishable**
   - `YOUR-APP-NAME.vercel.app` → leave as-is for first deploy, fix after you get the real URL
3. Save the file (e.g. as `my-vercel.env`)
4. On Vercel import screen → expand **Environment Variables**
5. Click **Import .env** (or **Browse** / paste the file contents)
6. Select your filled file — all 5 variables appear at once
7. Check **Production**, **Preview**, and **Development** are all ticked

#### Option B — Copy/paste lines

Paste these 5 lines into Vercel’s env box (after filling real values):

```
VITE_SUPABASE_URL=https://yxctdtihkmslpidscfph.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_your_key_here
VITE_SITE_URL=https://soukhin.vercel.app
VITE_BKASH_ENABLED=false
VITE_WHATSAPP_NUMBER=8801577577168
```

#### Local dev on your PC

```bash
copy env.import.template .env
```

Edit `.env` with your real key. Run `npm run dev`.  
The `.env` file stays **only on your computer** — never uploaded to GitHub.

> **Why not commit `.env` to GitHub?** It contains secrets. Anyone could steal your database access. GitHub + Vercel both block this on purpose.

Also check before Deploy:
- **Framework Preset:** Vite  
- **Build Command:** `npm run build`  
- **Output Directory:** `dist`  

4. Click **Deploy**  
5. Wait ~2 minutes. You get a URL like `https://soukhin-xxxxx.vercel.app`

### B3. After first deploy — fix auth URLs

1. Copy your Vercel URL (e.g. `https://soukhin-xxxxx.vercel.app`)  
2. **Vercel** → your project → **Settings** → **Environment Variables**  
   - Edit `VITE_SITE_URL` → paste your Vercel URL → Save  
   - Click **Deployments** → **⋯** on latest → **Redeploy**  
3. **Supabase** → Authentication → URL Configuration  
   - **Site URL:** your Vercel URL  
   - **Redirect URLs:** add  
     `https://soukhin-xxxxx.vercel.app/auth?verified=1`  
   - Save  

---

## Part C — Test everything

### Customer shop (public)

| What | URL |
|------|-----|
| Home page | `https://YOUR-VERCEL-URL.vercel.app/` |
| Sign up | `https://YOUR-VERCEL-URL.vercel.app/auth` |
| Track order | `https://YOUR-VERCEL-URL.vercel.app/track-order` |

### Admin dashboard (you only)

| What | URL |
|------|-----|
| Staff login | `https://YOUR-VERCEL-URL.vercel.app/admin/login` |
| Add products | `/admin/products` after login |
| Add inventory managers | `/admin/users` after login |

**Login:** `shoukhin.lifestyle.bd@gmail.com` + password you set in **Authentication → Users** (see Part A4)

| Channel | Contact |
|---------|---------|
| Email | shoukhin.lifestyle.bd@gmail.com |
| Phone / WhatsApp | 01577577168 |

---

## Part D — Local testing on your PC (optional)

```bash
cd Soukhin
npm install
npm run dev
```

Open `http://localhost:5173` — uses `.env` file in the project folder.

---

## Common “I don’t get it” problems

### “SQL Editor is empty”
**Normal.** Paste `ONE_CLICK_DATABASE_SETUP.sql` and click RUN.

### “I don’t see tables”
You didn’t run the SQL yet, or RUN failed. Check for red error text.

### “Admin login says not authorized”
1. Your email must be in **Table Editor → admin_users**  
2. Same email must exist in **Authentication → Users**  
3. **Auto Confirm User** must have been ON when you created the user

### “Website is blank / 404 on refresh”
Vercel should use `vercel.json` from the repo (already included). Redeploy if needed.

### `NEXT_PUBLIC_` variables
This app uses **`VITE_`** not `NEXT_PUBLIC_`. Ignore the Next.js tab in Supabase.

### PostgreSQL connection string
`postgresql://postgres:PASSWORD@db....` is **only** for advanced DB tools. **Not** for Vercel or `.env` frontend.

---

## What costs money?

| Thing | Free? |
|-------|-------|
| Supabase free tier | ✅ Yes for small shop |
| Vercel hobby + `.vercel.app` URL | ✅ Yes |
| Custom domain `.com` | ❌ ~$10–15/year (optional) |
| bKash merchant fees | Only when you sell (separate from hosting) |

---

## Quick checklist

- [ ] Pasted `ONE_CLICK_DATABASE_SETUP.sql` in Supabase SQL Editor → RUN  
- [ ] See tables in Table Editor  
- [ ] Created user in Authentication → Users (Auto Confirm ON)  
- [ ] Set Auth URL Configuration  
- [ ] Vercel project imported from GitHub  
- [ ] 5 env vars set on Vercel (including `VITE_WHATSAPP_NUMBER`)  
- [ ] Redeployed after setting `VITE_SITE_URL`  
- [ ] Logged in at `/admin/login`  
- [ ] Added a product in Admin → Products  

You’re live. 🎉
