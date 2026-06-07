"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { actionError } from "@/lib/i18n/action-errors";
import type { NotificationRow } from "@/types/database";

export type GetNotificationsResult =
  | { notifications: NotificationRow[]; unreadCount: number }
  | { error: string };

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getNotifications(
  limit = 30
): Promise<GetNotificationsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: await actionError("errors.authRequired") };

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { error: await actionError("errors.genericRetry") };

  const notifications = (data ?? []) as NotificationRow[];
  const unreadCount = notifications.filter((n) => !n.read_at).length;
  return { notifications, unreadCount };
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return count ?? 0;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function markNotificationRead(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: await actionError("errors.authRequired") };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id) // belt-and-suspenders alongside RLS
    .is("read_at", null); // skip already-read rows (no-op is fine too)

  if (error) return { error: await actionError("errors.genericRetry") };

  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllNotificationsRead(): Promise<
  { success: true } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: await actionError("errors.authRequired") };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) return { error: await actionError("errors.genericRetry") };

  revalidatePath("/notifications");
  return { success: true };
}
