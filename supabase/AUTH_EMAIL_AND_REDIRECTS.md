# Supabase auth: fix redirect + Shoukhin sender

## 1. Fix “Confirm email” going to localhost:3000

In **Supabase Dashboard** → **Authentication** → **URL Configuration**:

| Field | Set to |
|-------|--------|
| **Site URL** | Your live site, e.g. `https://soukhin.vercel.app` |
| **Redirect URLs** (add each on its own line) | `https://soukhin.vercel.app/auth?verified=1` |
| | `https://soukhin.vercel.app/auth**` (wildcard) |
| | `http://localhost:5173/auth?verified=1` (local dev only) |

Remove `http://localhost:3000` if it is listed — that is the usual cause of wrong redirects.

**Vercel:** set `VITE_SITE_URL` to the same live URL (no trailing slash), then redeploy.

---

## 2. Emails from “Supabase” instead of Shoukhin

Supabase sends auth mail from `noreply@mail.app.supabase.io` until you add **Custom SMTP**.

**Dashboard** → **Authentication** → **SMTP Settings** → Enable custom SMTP.

Example with **Gmail** (`shoukhin.lifestyle.bd@gmail.com`):

1. Google Account → Security → 2-Step Verification → **App passwords**
2. Create an app password for “Mail”
3. In Supabase SMTP:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: `shoukhin.lifestyle.bd@gmail.com`
   - Password: (app password, not your normal Gmail password)
   - Sender email: `shoukhin.lifestyle.bd@gmail.com`
   - Sender name: `Shoukhin`

**Authentication** → **Email Templates** → **Confirm signup**:

- Subject: `Confirm your Shoukhin account`
- Body: keep `{{ .ConfirmationURL }}` — it will use the redirect URL from the app.

Optional: set **Authentication** → **Email** → **Email OTP** / branding to match your store name.

---

## 3. After changes

1. Save Supabase settings
2. Redeploy Vercel (if you changed `VITE_SITE_URL`)
3. Sign up with a **new test email** (old confirmation links still use the old redirect)
