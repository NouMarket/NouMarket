"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { actionError } from "@/lib/i18n/action-errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { notifyListingFavorited } from "@/lib/notifications";

export async function addFavorite(
  listingId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: await actionError("errors.authRequired") };

  const rl = await checkRateLimit(`toggleFavorite:${user.id}`, 30, 60);
  if (!rl.ok) return { error: rl.error };

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, listing_id: listingId });

  // 23505 = unique violation → already favorited, treat as success
  if (error && error.code !== "23505") {
    console.error("[addFavorite]", error.message);
    return { error: await actionError("errors.addFavorite") };
  }

  revalidatePath("/favorites");
  // Notify seller (fire-and-forget; skips self-favorites inside the helper)
  void notifyListingFavorited(listingId, user.id);
  return { success: true };
}

export async function removeFavorite(
  listingId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: await actionError("errors.authRequired") };

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("listing_id", listingId);

  if (error) {
    console.error("[removeFavorite]", error.message);
    return { error: await actionError("errors.removeFavorite") };
  }

  revalidatePath("/favorites");
  return { success: true };
}
