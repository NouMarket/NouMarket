-- ============================================================
-- NouMarket – Sprint C2: Rate Limiting & Atomic View Counter
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- RATE LIMIT WINDOWS
-- Fixed-window rate limiting table. Each row is one (key,
-- window_start) bucket. Accessed only by the service-role
-- client — no RLS required.
-- ────────────────────────────────────────────────────────────
create table if not exists public.rate_limit_windows (
  key          text        not null,
  window_start timestamptz not null,
  count        integer     not null default 1,
  primary key  (key, window_start)
);

create index if not exists idx_rate_limit_windows_start
  on public.rate_limit_windows (window_start);

-- Service-role bypasses RLS; no public access needed.
alter table public.rate_limit_windows disable row level security;

-- ────────────────────────────────────────────────────────────
-- rate_limit_check
-- Atomically upserts the counter for (key, window_start) and
-- returns the new count. Called from the TypeScript helper with
-- the service-role key. Opportunistically prunes rows older
-- than 2 hours on 1% of calls to keep the table lean.
-- ────────────────────────────────────────────────────────────
create or replace function public.rate_limit_check(
  p_key          text,
  p_window_start timestamptz,
  p_max          integer
) returns integer
language plpgsql
security definer
as $$
declare
  v_count integer;
begin
  insert into public.rate_limit_windows (key, window_start, count)
  values (p_key, p_window_start, 1)
  on conflict (key, window_start)
  do update set count = rate_limit_windows.count + 1
  returning count into v_count;

  if random() < 0.01 then
    delete from public.rate_limit_windows
    where window_start < now() - interval '2 hours';
  end if;

  return v_count;
end;
$$;

-- ────────────────────────────────────────────────────────────
-- increment_listing_views
-- Atomic UPDATE — no read-then-write race. Called via service-
-- role client from trackView() to bypass RLS on listings.
-- ────────────────────────────────────────────────────────────
create or replace function public.increment_listing_views(
  p_listing_id uuid
) returns void
language sql
security definer
as $$
  update public.listings
  set views = views + 1
  where id = p_listing_id;
$$;
