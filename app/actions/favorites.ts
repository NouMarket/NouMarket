"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addFavorite(
  listingId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, listing_id: listingId });

  // 23505 = unique violation → already favorited, treat as success
  if (error && error.code !== "23505") {
    console.error("[addFavorite]", error.message);
    return { error: "Impossible d'ajouter aux favoris." };
  }

  revalidatePath("/favorites");
  return { success: true };
}

export async function removeFavorite(
  listingId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("listing_id", listingId);

  if (error) {
    console.error("[removeFavorite]", error.message);
    return { error: "Impossible de supprimer des favoris." };
  }

  revalidatePath("/favorites");
  return { success: true };
}
