-- ============================================================
-- Sprint D3 — Trust & Verification
-- Adds verification-related columns to profiles.
-- All columns use IF NOT EXISTS for idempotency.
-- ============================================================

alter table public.profiles
  add column if not exists phone                      text,
  add column if not exists phone_verified_at          timestamptz,
  add column if not exists identity_verified_at       timestamptz,
  add column if not exists verification_status        text not null default 'none',
  add column if not exists verification_note          text,
  add column if not exists verification_requested_at  timestamptz,
  add column if not exists last_active_at             timestamptz;

-- Enforce allowed values (no-op if constraint already exists via try/catch pattern)
do $$
begin
  alter table public.profiles
    add constraint profiles_verification_status_check
    check (verification_status in ('none', 'pending', 'verified', 'rejected'));
exception
  when duplicate_object then null;
end $$;

-- Index for admin verification queue sorted by request time (partial: only pending rows)
create index if not exists profiles_verification_status_pending_idx
  on public.profiles (verification_requested_at asc)
  where verification_status = 'pending';
