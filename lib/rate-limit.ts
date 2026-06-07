import "server-only";
import { adminSupabase } from "@/lib/supabase/admin";
import { actionError } from "@/lib/i18n/action-errors";

export type RateLimitResult = { ok: true } | { ok: false; error: string };

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
    console.warn("[rate-limit] check failed, failing open:", error.message);
    return { ok: true };
  }

  if ((data as number) > maxRequests) {
    return { ok: false, error: await actionError("errors.rateLimit") };
  }

  return { ok: true };
}
