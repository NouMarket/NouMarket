# NouMarket — Beta Deployment Checklist

Internal checklist for deploying NouMarket to a production Vercel + Supabase environment before opening to beta testers.

---

## 1. Source Control

- [ ] All sprint branches merged to `master`
- [ ] `git status` is clean (no uncommitted changes)
- [ ] Latest commit pushed to GitHub remote

---

## 2. Vercel

- [ ] Vercel project created and connected to the GitHub repo
- [ ] Build command: `npm run build` (auto-detected)
- [ ] Output directory: `.next` (auto-detected)
- [ ] Node.js version ≥ 20 selected in project settings
- [ ] Production branch set to `master`
- [ ] First deployment triggered and completed successfully

---

## 3. Environment Variables

Set the following in **Vercel → Project → Settings → Environment Variables** for the `Production` environment.

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key |
| `NEXT_PUBLIC_SITE_URL` | Your production domain, e.g. `https://noumarket.nc` |

- [ ] All four variables set in Vercel (Production)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is **not** prefixed with `NEXT_PUBLIC_` (must stay server-side only)
- [ ] Re-deploy after adding variables

---

## 4. Supabase Migrations

Apply migrations in order via **Supabase Dashboard → SQL Editor** or `supabase db push`.

- [ ] `20250605000001_initial_schema.sql` — core tables, indexes, RLS
- [ ] `20250605000002_storage_policies.sql` — storage.objects RLS policies
- [ ] `20250606000001_rate_limit_and_view_rpc.sql` — rate_limit_windows table + 2 RPCs
- [ ] `20250606000002_category_counts_rpc.sql` — get_active_category_counts RPC
- [ ] `20250607000001_notifications.sql` — notifications table + RLS
- [ ] `20250608000001_trust_verification.sql` — verification columns on profiles

Verify: run `select * from profiles limit 1` in the SQL editor — the result set should include `verification_status`, `phone`, `verification_requested_at`.

---

## 5. Storage Bucket

This step is manual (cannot be done via SQL migration).

- [ ] Supabase Dashboard → Storage → **New bucket**
  - Name: `listing-images`
  - Public: **enabled**
  - Maximum file size: `5242880` (5 MB)
  - Allowed MIME types: `image/jpeg, image/png, image/webp`
- [ ] Storage policies from `20250605000002_storage_policies.sql` applied

---

## 6. Realtime

- [ ] Supabase Dashboard → Database → Replication
- [ ] `messages` table added to the realtime publication
- [ ] `notifications` table added to the realtime publication

---

## 7. Auth Configuration

- [ ] Supabase → Authentication → Email: **Enable email signups** = on
- [ ] **Confirm email** setting matches your beta policy (recommended: enabled)
- [ ] Site URL set to your production domain
- [ ] Redirect URL allowlist includes:
  - `https://your-domain.com/auth/callback`
  - `https://your-vercel-preview-url.vercel.app/auth/callback` (optional, for preview deploys)
- [ ] Google OAuth: configured in Supabase → Authentication → Providers → Google (optional)
  - Client ID and Secret from Google Cloud Console
  - Authorized redirect URI added to Google: `https://<project>.supabase.co/auth/v1/callback`

---

## 8. First Admin User

- [ ] Register an account via the live app at `/register`
- [ ] Open Supabase → SQL Editor and run:

```sql
update public.profiles
set is_admin = true
where id = '<your-user-uuid>';
```

- [ ] Confirm admin access: log in and navigate to `/admin` — the dashboard should load without a 404
- [ ] Full admin setup instructions: `docs/ADMIN_SETUP.md`

---

## 9. Seed / Test Data Policy

NouMarket does **not** include seed scripts for production. Beta testers create their own listings.

- [ ] No seed data loaded in production
- [ ] If test listings were created during setup, archive or delete them via `/admin/pending` or the SQL editor

---

## 10. Domain Setup

- [ ] Custom domain added in Vercel → Project → Domains
- [ ] DNS records (A or CNAME) configured with your registrar
- [ ] SSL certificate issued automatically by Vercel (wait ~1 min after DNS propagates)
- [ ] `NEXT_PUBLIC_SITE_URL` updated to the custom domain and redeployed

---

## 11. Smoke Test Checklist

Run these manually after deployment:

- [ ] Home page loads and displays categories
- [ ] Registration flow works (email confirmation received)
- [ ] Login works
- [ ] Create listing (upload images, submit) → listing enters pending state
- [ ] Admin `/admin/pending` shows the new listing
- [ ] Admin approves listing → listing appears on home/search
- [ ] Search for a keyword returns the listing
- [ ] Favorite a listing → appears in `/favorites`
- [ ] Open a message conversation → message sends and appears in real time
- [ ] Notification appears after admin approves listing
- [ ] Profile edit (name, bio, phone) saves correctly
- [ ] Mark listing as sold
- [ ] Report a listing → appears in `/admin/reports`
- [ ] Request verification → appears in `/admin/verifications`
- [ ] Admin approves verification → user trust badge updated

---

*Last updated: 2026-06-08*
