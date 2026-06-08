# NouMarket — Supabase Live Checklist

Reference for the full Supabase configuration required before going live.

---

## 1. Required Migrations

Apply in order via **Supabase Dashboard → SQL Editor** or `supabase db push`.

| File | Purpose |
|---|---|
| `supabase/migrations/20250605000001_initial_schema.sql` | Core tables, indexes, RLS policies |
| `supabase/migrations/20250605000002_storage_policies.sql` | `storage.objects` RLS policies |
| `supabase/migrations/20250606000001_rate_limit_and_view_rpc.sql` | Rate limiting table + 2 RPCs |
| `supabase/migrations/20250606000002_category_counts_rpc.sql` | Category counts RPC |
| `supabase/migrations/20250607000001_notifications.sql` | Notifications table + RLS |
| `supabase/migrations/20250608000001_trust_verification.sql` | Verification columns on profiles |

---

## 2. Required Tables

After all migrations, these tables must exist in the `public` schema:

| Table | Description |
|---|---|
| `profiles` | Extends `auth.users`. One row per user, created by trigger |
| `listings` | Classified listings with status lifecycle |
| `listing_images` | Ordered images per listing |
| `favorites` | User ↔ listing many-to-many |
| `conversations` | One per (listing, buyer) pair |
| `messages` | Messages within conversations |
| `listing_reports` | User reports on listings |
| `rate_limit_windows` | Fixed-window rate limiting (service-role only) |
| `notifications` | Per-user notification feed |

Verify all tables exist:
```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

---

## 3. Required Columns on `profiles`

The trust_verification migration adds these columns. Verify they exist:

```sql
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
order by ordinal_position;
```

Required columns (in addition to core schema):
- `phone` text, nullable
- `phone_verified_at` timestamptz, nullable
- `identity_verified_at` timestamptz, nullable
- `verification_status` text, not null, default `'none'`
- `verification_note` text, nullable
- `verification_requested_at` timestamptz, nullable
- `last_active_at` timestamptz, nullable

---

## 4. Required RPC Functions

| Function | Signature | Used by |
|---|---|---|
| `rate_limit_check` | `(p_key text, p_window_start timestamptz, p_max integer) → integer` | `lib/rate-limit.ts` |
| `increment_listing_views` | `(p_listing_id uuid) → void` | `app/actions/listings.ts` |
| `get_active_category_counts` | `() → table(category_slug text, count bigint)` | `lib/categories.ts` |

Verify:
```sql
select routine_name, routine_type
from information_schema.routines
where routine_schema = 'public'
order by routine_name;
```

---

## 5. Row Level Security

RLS must be enabled on these tables (done by migrations):

| Table | RLS |
|---|---|
| `profiles` | Public read; owner update |
| `listings` | Public read (active only); seller read own; admin read all; seller insert/update own; admin update any |
| `listing_images` | Public read; authenticated insert (own listing); owner delete |
| `favorites` | Owner CRUD only |
| `conversations` | Participant read/insert; owner delete (soft) |
| `messages` | Participant read; participant insert; participant update (mark read) |
| `listing_reports` | Reporter insert; owner read; admin read all |
| `rate_limit_windows` | RLS **disabled** (service-role only) |
| `notifications` | Owner select/update; no public insert (service-role inserts) |

Verify RLS is enabled:
```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

---

## 6. Storage Bucket

This is a **manual step** — not applied by migrations.

| Setting | Value |
|---|---|
| Bucket name | `listing-images` |
| Public | `true` |
| Max file size | `5242880` (5 MB) |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp` |

Storage RLS policies (from `20250605000002_storage_policies.sql`):
- Authenticated upload to own folder: `listing-images/{user_id}/...`
- Public read: all objects in `listing-images`
- Owner delete: own folder only

Verify in Supabase Dashboard → Storage → Policies.

---

## 7. Realtime Publication

Enable realtime for these two tables:

**Supabase Dashboard → Database → Replication → supabase_realtime publication**

- [ ] `messages` — required for real-time chat
- [ ] `notifications` — required for live notification badge

Verify via SQL:
```sql
select schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime';
```

---

## 8. Auth Configuration

In **Supabase Dashboard → Authentication → Settings**:

| Setting | Recommended value |
|---|---|
| Site URL | `https://your-production-domain.com` |
| Email confirmations | Enabled (recommended for beta) |
| Secure email change | Enabled |

**Redirect URL allowlist** (Authentication → URL Configuration):
```
https://your-production-domain.com/auth/callback
https://*.vercel.app/auth/callback  (for preview deploys, optional)
```

**Email templates** (optional): customise the confirmation and reset password emails in Authentication → Email Templates.

---

## 9. Manual Verification SQL Queries

### Approve a verification request manually
```sql
update public.profiles
set
  verification_status    = 'verified',
  identity_verified_at   = now()
where id = '<user-uuid>'
  and verification_status = 'pending';
```

### Reject a verification request manually
```sql
update public.profiles
set
  verification_status = 'rejected',
  verification_note   = 'Raison du refus ici'
where id = '<user-uuid>'
  and verification_status = 'pending';
```

### Reset a user to unverified (re-open for new request)
```sql
update public.profiles
set
  verification_status         = 'none',
  verification_note           = null,
  verification_requested_at   = null,
  identity_verified_at        = null
where id = '<user-uuid>';
```

### List all verified users
```sql
select id, name, identity_verified_at
from public.profiles
where verification_status = 'verified'
order by identity_verified_at desc;
```

---

*Last updated: 2026-06-08*
