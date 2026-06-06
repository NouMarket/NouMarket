import "server-only";
import { adminSupabase } from "@/lib/supabase/admin";

export type RateLimitResult = { ok: true } | { ok: false; error: string };

/**
 * Fixed-window rate limiter backed by Supabase (works across Vercel instances).
 *
 * @param key           Unique bucket key, e.g. "sendMessage:user-uuid"
 * @param maxRequests   Max calls allowed per window
 * @param windowSeconds Window size in seconds
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const windowMs = windowSeconds * 1000;
  const windowStart = new Date(
    Math.floor(Date.now() / windowMs) * windowMs
  ).toISOString();

  const { data, error } = await adminSupabase.rpc("rate_limit_check", {
    p_key: key,
    p_window_start: windowStart,
    p_max: maxRequests,
  });

  if (error) {
    // Fail open — never block legitimate traffic due to a DB hiccup
    console.warn("[rate-limit] check failed, failing open:", error.message);
    return { ok: true };
  }

  if ((data as number) > maxRequests) {
    return { ok: false, error: "Trop de requêtes. Réessayez dans quelques instants." };
  }

  return { ok: true };
}
