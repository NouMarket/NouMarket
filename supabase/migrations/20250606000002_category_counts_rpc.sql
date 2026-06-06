-- ============================================================
-- NouMarket – Sprint C3: Category Counts RPC
-- ============================================================

-- get_active_category_counts
-- Returns one row per category_slug with the count of active
-- listings. Marked STABLE so Postgres can cache results within
-- a single query plan. Called by lib/categories.ts via the
-- service-role client once per ISR interval (60 s).
create or replace function public.get_active_category_counts()
returns table(category_slug text, count bigint)
language sql
stable
security definer
as $$
  select category_slug, count(*)::bigint
  from public.listings
  where status = 'active'
  group by category_slug;
$$;
