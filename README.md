# Soukhin (শৌখিন) — Premium Bangladeshi Lifestyle Ecommerce

[![Repository](https://img.shields.io/badge/GitHub-ridhwankhan%2Fsoukhin-1B4332?style=flat-square&logo=github)](https://github.com/ridhwankhan/soukhin)

Production-ready storefront and admin dashboard for a Bangladeshi lifestyle brand. Built with **React**, **TypeScript**, **Tailwind CSS**, **Supabase**, and **Three.js**.

**Live stack (100% free tier to start):** Vercel (hosting) + Supabase (database, auth, storage, edge functions)

---

## What works today

### Customer website
- Product catalog from Supabase (categories, search, filters)
- Sign up / sign in with email verification (required before checkout)
- Shopping cart, wishlist, checkout with server-validated prices
- Cash on delivery + manual bKash transaction ID
- bKash tokenized checkout (edge function — configure credentials to enable)
- Order tracking by order number + phone
- Contact form with spam protection
- Order history on account page

### Admin dashboard (`/admin/login`)
- Role-based access: **Owner**, **Admin**, **Moderator**, **Order Manager**, **Inventory Manager**
- **Staff & role management** (Owner + Admin): add emails, assign roles, send invite, deactivate
- Products CRUD with compressed image upload to Supabase Storage
- Orders, messages, dashboard analytics
- Session idle timeout + permission checks on every API call

---

## Roles & who can do what

| Role | Access |
|------|--------|
| **Owner** | Everything + assign any role (including Admin/Owner) |
| **Admin** | Store operations + add **Inventory Manager**, **Order Manager**, **Moderator** |
| **Inventory Manager** | Add/edit/remove products and stock |
| **Order Manager** | View and update orders |
| **Moderator** | Reviews and customer messages |

### Adding team members (Owner / Admin)

1. Go to **Admin → Users** (`/admin/users`)
2. Click **Add Staff Member** — enter name, email, role
3. Click **Send invite** — they get an email to set a password
4. They sign in at **`/admin/login`** with that email

> **Owner only** can promote someone to Admin or Owner. Admins can add multiple Inventory Managers, Order Managers, etc.

---

## Free deployment guide (step by step)

Everything below stays on **free tiers** for a small launch. No credit card required for Vercel + Supabase free plans.

### Cost summary

| Service | Free tier | Paid when |
|---------|-----------|-----------|
| [Supabase](https://supabase.com) | 500 MB DB, 1 GB storage, 50k MAU auth | High traffic / storage |
| [Vercel](https://vercel.com) | Hobby hosting, 100 GB bandwidth/mo | Commercial use at scale |
| [Cloudflare](https://cloudflare.com) | DNS + CDN + basic DDoS (optional) | Advanced WAF |
| Domain `.com` | — | ~$10–15/year (optional; use `*.vercel.app` free subdomain first) |

---

### Step 1 — Supabase project (backend)

1. Go to [supabase.com](https://supabase.com) → **Start your project** → New organization → **New project**
2. Choose region **Singapore** (closest to Bangladesh)
3. Save your **database password**
4. Wait for the project to finish provisioning

**Run database migrations** (required, in order):

1. Open **SQL Editor** in Supabase dashboard
2. Run each file from `supabase/migrations/` in order:
   - `20260625181910_001_initial_schema.sql`
   - `20260625183059_003_restructure_categories.sql`
   - `20260625182007_002_seed_data.sql`
   - `20260626120000_004_customer_auth.sql`
   - `20260626140000_005_orders_analytics_notifications.sql`
   - `20260626160000_006_products_storage.sql`
   - `20260626180000_007_admin_security.sql`
   - `20260626200000_008_production_hardening.sql`
   - `20260626220000_009_staff_management.sql`

**Get API keys:** Settings → API → copy **Project URL** and **anon public** key.

**Auth URLs:** Authentication → URL Configuration (set after Vercel deploy in Step 4):
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth?verified=1`

---

### Step 2 — Create the Owner account

In **SQL Editor**, run (use your real email):

```sql
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('shoukhin.lifestyle.bd@gmail.com', 'Soukhin Owner', 'owner', true)
ON CONFLICT (email) DO UPDATE SET role = 'owner', is_active = true;
```

In **Authentication → Users → Add user**:
- Email: same as above
- Password: strong password
- ✅ Auto Confirm User (so you can log in immediately)

Sign in at `https://your-app.vercel.app/admin/login` after deploy.

---

### Step 3 — Deploy edge functions (invites + bKash)

Install [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Deploy functions:

```bash
supabase functions deploy invite-staff
supabase functions deploy bkash-payment
```

Set secrets (Dashboard → Edge Functions → Secrets, or CLI):

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
SITE_URL=https://your-app.vercel.app
ALLOWED_SITE_ORIGINS=https://your-app.vercel.app

# bKash (sandbox first — optional until you have merchant account)
BKASH_APP_KEY=
BKASH_APP_SECRET=
BKASH_USERNAME=
BKASH_PASSWORD=
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
```

---

### Step 4 — Deploy frontend on Vercel (free)

1. Push this repo to GitHub (already at `github.com/ridhwankhan/soukhin`)
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → Import `ridhwankhan/soukhin`
3. Framework: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Environment variables:

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SITE_URL=https://your-app.vercel.app
VITE_BKASH_ENABLED=false
```

7. Click **Deploy**

8. Copy your Vercel URL → go back to Supabase **Auth → URL Configuration** and set Site URL + Redirect URLs to match.

9. Redeploy on Vercel if you changed env vars.

**Custom domain (optional, paid yearly):** Vercel → Project → Settings → Domains → add `soukhin.com` → point DNS as instructed.

---

### Step 5 — Make it fully functional (checklist)

- [ ] All 9 migrations applied in Supabase
- [ ] Owner row in `admin_users` + Auth user with same email
- [ ] Vercel env vars set, site loads
- [ ] Supabase Auth redirect URLs match Vercel URL
- [ ] `invite-staff` function deployed (for team invites)
- [ ] Sign in at `/admin/login` as owner
- [ ] Add products under **Admin → Products** (upload images)
- [ ] Create customer account on storefront, verify email, place test order
- [ ] Test order tracking at `/track-order`
- [ ] Add inventory managers under **Admin → Users** → Send invite
- [ ] Set `WHATSAPP_NUMBER` in `src/config/site.ts` and redeploy for COD WhatsApp messages
- [ ] When bKash merchant ready: set secrets, `VITE_BKASH_ENABLED=true`, redeploy

---

### Step 6 — Local development

```bash
git clone https://github.com/ridhwankhan/soukhin.git
cd soukhin
npm install
cp .env.example .env   # fill in Supabase URL + anon key
npm run dev            # http://localhost:5173
```

```bash
npm run build          # production build
npm run load-test      # stress-test public endpoints (optional)
```

---

## Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Vercel + `.env` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Vercel + `.env` | Public API key |
| `VITE_SITE_URL` | Vercel + `.env` | Your live URL (bKash origin check) |
| `VITE_BKASH_ENABLED` | Vercel | `true` when bKash is configured |
| Edge function secrets | Supabase only | bKash keys, service role, `SITE_URL` |

Never commit `.env` or the **service role** key to GitHub.

---

## Project structure

```
src/
├── admin/              # Dashboard (login, products, orders, users, …)
├── components/         # UI, auth guards, cart, layout
├── config/             # Brand, delivery, payment, roles
├── context/            # Auth, AdminAuth, Cart, Wishlist
├── hooks/              # Session manager, debounce
├── lib/                # Supabase services (orders, products, staff, …)
├── pages/customer/     # Storefront pages
└── pages/info/         # About, contact, policies

supabase/
├── migrations/         # Run in order on Supabase
└── functions/          # invite-staff, bkash-payment
```

---

## Security

- Admin routes require staff login + server-side permission checks
- Checkout prices validated on server (`create_order_secure`)
- Rate limits on contact, search, track order, auth
- Product image uploads restricted to staff with `manage-products`
- bKash payments verify order ownership + amount

---

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · Supabase · Three.js · Framer Motion · Recharts

---

## Support contact

Store email: **shoukhin.lifestyle.bd@gmail.com**

---

MIT License · Built for the Bangladeshi ecommerce community.
