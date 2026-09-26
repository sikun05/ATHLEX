# ATHLEX — Premium Gym & Fitness Platform

A production-grade gym website and member/admin platform: cinematic marketing site, membership checkout with Razorpay, Supabase auth & Postgres (RLS), member dashboard, QR attendance and a full admin console.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Motion (Framer Motion) · Supabase (Postgres, Auth, Storage) · Razorpay · React Hook Form + Zod · Recharts · Lucide.

---

## Quick start (demo mode — no accounts needed)

```bash
npm install
npm run dev          # http://localhost:3000
```

With no Supabase keys the app runs in **demo mode**: an in-memory database seeded with realistic data (members, payments, attendance, plans…), demo logins and a simulated payment gateway. Data resets when the server restarts.

| Role    | Email                 | Password     |
| ------- | --------------------- | ------------ |
| Admin   | admin@athlex.demo     | Admin@123    |
| Staff   | staff@athlex.demo     | Staff@123    |
| Trainer | trainer@athlex.demo   | Trainer@123  |
| Member  | member@athlex.demo    | Member@123   |

Demo mode is on automatically in development. In a production build it's only enabled with `DEMO_MODE=true` (for previews).

## Going live

1. **Supabase** — create a project, then apply the SQL:
   ```bash
   supabase link --project-ref <ref>
   supabase db push                 # runs supabase/migrations/*
   psql "$DATABASE_URL" -f supabase/seed.sql   # placeholder catalogue (optional)
   ```
   Sign up through the site, then promote yourself in the SQL editor:
   `update public.users set role = 'admin' where email = 'you@yourgym.com';`
   In **Auth → URL configuration** add `https://your-domain/auth/callback` to redirect URLs.
2. **Environment** — copy `.env.example` → `.env.local` and fill in Supabase URL/anon key, `SUPABASE_SERVICE_ROLE_KEY`, `APP_SECRET` (32+ chars), `CRON_SECRET`.
3. **Razorpay** — add `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`, create a webhook to `https://your-domain/api/payments/webhook` (events `payment.captured`, `payment.failed`, `order.paid`) and set `RAZORPAY_WEBHOOK_SECRET`.
4. **Notifications (optional)** — Resend (email), WhatsApp Cloud API, Twilio (SMS). Unset channels are logged instead of sent.
5. **Deploy to Vercel** — `vercel.json` schedules the daily `/api/cron/reminders` job (expiry sweep, renewal and class reminders).

## Replacing placeholder content

| What | Where |
| --- | --- |
| Business name, address, phone, hours, socials, WhatsApp | `src/lib/site.ts` |
| Photography | `src/lib/media.ts` (swap URLs for your own / Supabase Storage) |
| Programs & facilities | `src/lib/content/programs.ts`, `facilities.ts` |
| Plans, trainers, classes, gallery, testimonials, blog, offers, coupons | Admin console (DB). Static fallbacks live in `src/lib/content/*` |
| Seed file | `npm run seed:generate` regenerates `supabase/seed.sql` from `src/lib/content` |

Optional hero video: set `NEXT_PUBLIC_HERO_VIDEO_URL` to a compressed MP4/WebM.

## Architecture

```
src/
  app/(site)/        marketing site: home, about, programs, trainers, membership, schedule,
                     gallery, transformations, calculators, blog, contact, free-trial, checkout
  app/(auth)/        login, signup, forgot/reset password, verify email
  app/dashboard/     member area: overview, membership, check-in QR, classes, workout, diet, progress, profile
  app/admin/         admin console: KPIs, scanner, 20 CRUD modules, reports, notifications, settings
  app/api/           route handlers (all inputs validated with Zod)
  proxy.ts           Supabase session refresh + auth gate for /dashboard and /admin
  lib/db/            repository: Supabase (RLS) or in-memory demo store, same interface
  lib/payments/      Razorpay client + idempotent settlement service
  lib/admin/         declarative admin resources (columns, fields, roles) + schema builder
supabase/migrations  schema, RLS policies, RPCs, storage buckets
```

### Payments (server-authoritative)
`PLAN → REGISTRATION → ORDER → RAZORPAY CHECKOUT → VERIFY → MEMBERSHIP → RECEIPT → NOTIFY`
- The amount is always computed server-side from `membership_plans` (+ coupon); client prices are never trusted.
- `/api/payments/verify` checks the HMAC signature **and** re-fetches the payment from Razorpay (order id, amount, captured status).
- `/api/payments/webhook` verifies `x-razorpay-signature` and settles the order even if the customer closed the tab.
- Settlement is an atomic compare-and-set (`created → paid`), so verify + webhook racing activates exactly once. Duplicate payments on one order are flagged to admins for refund. Failed/cancelled attempts are recorded; open orders are reused for 30 min.
- Renewals stack after the current membership's end date.

### Security
- Row Level Security on every table; members only see their own data, trainers only their assigned members, anonymous users can submit leads but never read them. A trigger blocks role escalation from API roles.
- Role-based access (`admin`, `staff`, `trainer`, `member`) enforced in layouts, API routes and in the database.
- Service-role key used only in server code after explicit authorization (payments, webhooks, cron).
- QR attendance tokens are HMAC-signed, expire in 60 s, and are single-use.
- Zod validation on every API route, same-origin checks on mutations, honeypots and rate limits on public forms, CSV-injection-safe exports, security headers.
- Rate limiting is in-memory per instance — use Upstash/Redis for strict multi-region limits.

### Design system
Tokens live in `src/app/globals.css` (`@theme`): charcoal ramp, bone type, a single volt accent, Anton display + Inter + JetBrains Mono, 6px card radius, grain overlay. Motion primitives are in `src/components/motion/reveal.tsx`; everything honours `prefers-reduced-motion` (MotionConfig `reducedMotion="user"`, CSS fallbacks, preloader/cursor disabled).

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run lint         # ESLint
npm run typecheck    # route types + tsc
npm run seed:generate
```
