"use server";

import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

export type StorageCleanupPreview = {
  archivedListingCount: number;
  imageCount: number;
};

export type StorageCleanupResult =
  | { preview: StorageCleanupPreview }
  | { deleted: number; errors: number }
  | { error: string };

/**
 * Admin-only utility for cleaning up images that belong to archived listings.
 *
 * Archived listings are soft-deleted (status = 'archived') so their rows and
 * image rows persist. This action removes the Storage objects and then the
 * listing_images rows for those listings.
 *
 * @param dryRun  When true (default), returns a preview without deleting anything.
 */
export async function cleanupArchivedListingImages(
  dryRun = true
): Promise<StorageCleanupResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Accès refusé." };

  // 1. Find all archived listing IDs
  const { data: archivedListings, error: listErr } = await adminSupabase
    .from("listings")
    .select("id")
    .eq("status", "archived");

  if (listErr) return { error: "Impossible de récupérer les annonces archivées." };

  const archivedIds = (archivedListings ?? []).map((l) => l.id);

  if (archivedIds.length === 0) {
    if (dryRun) return { preview: { archivedListingCount: 0, imageCount: 0 } };
    return { deleted: 0, errors: 0 };
  }

  // 2. Get all listing_images rows for those archived listings
  const { data: images, error: imgErr } = await adminSupabase
    .from("listing_images")
    .select("id, url, listing_id")
    .in("listing_id", archivedIds);

  if (imgErr) return { error: "Impossible de récupérer les images." };

  const imageRows = images ?? [];
  const listingIds = [...new Set(imageRows.map((img) => img.listing_id))];

  if (dryRun) {
    return {
      preview: {
        archivedListingCount: listingIds.length,
        imageCount: imageRows.length,
      },
    };
  }

  // 3. Delete Storage files
  let deleted = 0;
  let errors = 0;

  for (const img of imageRows) {
    // URL: https://<host>/storage/v1/object/public/listing-images/<path>
    const marker = "/storage/v1/object/public/listing-images/";
    const idx = img.url.indexOf(marker);
    if (idx === -1) {
      errors++;
      continue;
    }
    const storagePath = img.url.slice(idx + marker.length);
    const { error: rmErr } = await adminSupabase.storage
      .from("listing-images")
      .remove([storagePath]);

    if (rmErr) {
      console.error("[storage-cleanup] remove error:", rmErr.message, storagePath);
      errors++;
    } else {
      deleted++;
    }
  }

  // 4. Delete listing_images rows (Storage is already gone; DB cleanup is safe regardless)
  if (imageRows.length > 0) {
    const imageIds = imageRows.map((img) => img.id);
    await adminSupabase.from("listing_images").delete().in("id", imageIds);
  }

  return { deleted, errors };
}
