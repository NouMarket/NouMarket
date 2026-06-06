import "server-only";
import { adminSupabase } from "@/lib/supabase/admin";

/**
 * Fetches live active-listing counts grouped by category_slug.
 * Returns a plain Record so callers can merge with the static CATEGORIES array.
 * Relies on page-level ISR (revalidate: 60) for caching — no wrapper needed.
 */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const { data, error } = await adminSupabase.rpc("get_active_category_counts");
  if (error || !data) {
    console.warn("[categories] getCategoryCounts failed:", error?.message);
    return {};
  }
  return Object.fromEntries(
    (data as { category_slug: string; count: number }[]).map((row) => [
      row.category_slug,
      Number(row.count),
    ])
  );
}
