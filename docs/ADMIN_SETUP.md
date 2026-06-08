# NouMarket — Admin Setup Guide

How to configure the first admin user and use the admin dashboard in production.

---

## 1. Creating the First Admin User

There is no in-app admin creation flow. Admins are set directly in the database.

### Step 1 — Register a normal account

Go to `/register` on the live app and create an account with the admin email address.

### Step 2 — Find the user UUID

In **Supabase Dashboard → Authentication → Users**, locate the account by email and copy the UUID.

Alternatively, via the SQL editor:

```sql
select id, name, member_since
from public.profiles
where name ilike '%your name%'
limit 5;
```

### Step 3 — Grant admin

```sql
update public.profiles
set is_admin = true
where id = '<paste-uuid-here>';
```

### Step 4 — Verify admin access

1. Log in as the admin user
2. Navigate to `/admin` — the analytics dashboard should load
3. If you see a 404, the `is_admin` flag was not applied to the correct row

---

## 2. Admin Dashboard Overview

| Route | Purpose |
|---|---|
| `/admin` | Analytics: stats, recent activity, top categories and listings |
| `/admin/pending` | Review and approve / reject new listings |
| `/admin/reports` | Review user-submitted reports on listings |
| `/admin/verifications` | Approve or reject identity verification requests |
| `/admin/storage` | Clean up images from archived listings |
| `/admin/beta-checklist` | QA checklist for beta testing cycles |
| `/admin/operations` | Quick links and deployment status checklist |

---

## 3. Approving and Rejecting Listings

1. Go to `/admin/pending`
2. Each pending listing shows: title, category, price, description, images, seller name
3. **Approve**: click "Approuver" — the listing is published immediately and the seller is notified
4. **Reject**: click "Rejeter", enter a reason, confirm — the listing is rejected and the seller is notified with the reason

The session history panel shows all actions taken in the current browser session.

---

## 4. Reviewing Reports

1. Go to `/admin/reports`
2. Each report shows: listing title, reporter name, reason, timestamp
3. From the report card, click the listing title to open the listing detail page
4. Take action directly on the listing (approve, reject, or archive) via the admin tools on the listing page

There is no per-report "resolve" button in v1 — managing the listing itself is the resolution.

---

## 5. Managing Verification Requests

1. Go to `/admin/verifications`
2. Pending requests are sorted oldest-first (FIFO queue)
3. Each row shows: user avatar, name (linked to seller profile), location, phone number, request date
4. **Approve**: click "Approuver" — sets `identity_verified_at`, changes status to `verified`, notifies the user
5. **Reject**: click "Rejeter", optionally enter a note, confirm — sets status to `rejected`, notifies the user with the note

The user can submit a new request after rejection.

---

## 6. Storage Cleanup

The storage cleanup tool removes images associated with archived listings.

**This action is irreversible. Images are permanently deleted from Supabase Storage.**

1. Go to `/admin/storage`
2. Click **"Aperçu"** (Preview) first to see what will be deleted without deleting anything
3. Review the list of archived listings and their image counts
4. If you are confident, click **"Supprimer définitivement"** to proceed
5. The tool reports deleted file count and any errors

Run this periodically to prevent storage from growing unbounded.

---

## 7. Revoking Admin Access

```sql
update public.profiles
set is_admin = false
where id = '<user-uuid>';
```

---

## 8. Useful SQL Queries

### List all admins
```sql
select id, name, member_since
from public.profiles
where is_admin = true;
```

### Count listings by status
```sql
select status, count(*)
from public.listings
group by status
order by count desc;
```

### List pending verification requests
```sql
select id, name, phone, verification_requested_at
from public.profiles
where verification_status = 'pending'
order by verification_requested_at asc;
```

### Check unread notifications
```sql
select user_id, count(*) as unread
from public.notifications
where read_at is null
group by user_id
order by unread desc
limit 20;
```

---

*Last updated: 2026-06-08*
