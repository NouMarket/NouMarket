-- ─────────────────────────────────────────────────────────────────────────────
-- Sprint D2 — Notifications
-- Creates the notifications table, indexes, and RLS policies.
--
-- Security model:
--   • Authenticated users can SELECT and UPDATE only their own rows (RLS).
--   • INSERT is reserved for the service role (adminSupabase in lib/notifications.ts).
--     No INSERT policy for the `authenticated` role.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.notifications (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  type       text        not null,        -- listing_approved | listing_rejected | new_message | listing_favorited | listing_reported
  title      text        not null,        -- raw fallback title (may be listing title or sender name)
  body       text        not null,        -- raw fallback body
  href       text,                        -- destination URL
  read_at    timestamptz,                 -- null = unread
  created_at timestamptz not null default now(),
  metadata   jsonb                        -- {listingTitle, listingSlug, rejectionReason, senderName, conversationId, …}
);

-- Fast lookup: user's notifications, newest first
create index notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

-- Partial index for cheap unread-count queries
create index notifications_user_unread_idx
  on public.notifications (user_id)
  where read_at is null;

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.notifications enable row level security;

-- Authenticated users can read their own notifications only
create policy "notifications: owner select"
  on public.notifications
  for select
  to authenticated
  using (user_id = auth.uid());

-- Authenticated users can update their own notifications (to mark as read)
create policy "notifications: owner update"
  on public.notifications
  for update
  to authenticated
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- No INSERT policy for the `authenticated` role.
-- All inserts originate from server-side code using the service role key,
-- which bypasses RLS entirely.
