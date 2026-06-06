"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getLocationById } from "@/data/locations";
import type { Database } from "@/types/database";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type UpdateProfilePayload = {
  name: string;
  bio: string;
  locationId: string;
  avatarUrl?: string | null;
};

export type UpdateProfileResult = { error: string };

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<UpdateProfileResult> {
  const name = payload.name.trim();
  const bio = payload.bio.trim();

  if (!name) return { error: "Le nom est requis." };
  if (name.length > 100) return { error: "Le nom ne peut pas dépasser 100 caractères." };
  if (bio.length > 500) return { error: "La bio ne peut pas dépasser 500 caractères." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const location = payload.locationId ? getLocationById(payload.locationId) : undefined;
  const locationName = location
    ? location.isNeighborhood
      ? `${location.name}, ${location.commune}`
      : location.name
    : null;

  // Build update object — only include avatarUrl if explicitly provided
  const update: ProfileUpdate = {
    name,
    bio: bio || null,
    location_id: payload.locationId || null,
    location_name: locationName,
    updated_at: new Date().toISOString(),
  };

  if (payload.avatarUrl !== undefined) {
    update.avatar_url = payload.avatarUrl ?? null;
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) {
    console.error("[updateProfile]", error.message);
    return { error: "Mise à jour impossible. Réessayez." };
  }

  revalidatePath("/profile");
  redirect("/profile?updated=1");
}
