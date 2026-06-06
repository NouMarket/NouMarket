"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { getLocationById } from "@/data/locations";
import { slugify } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CreateListingPayload = {
  /** Client-generated UUID used as the listing's id AND the Storage folder name */
  pendingListingId: string;
  categorySlug: string;
  title: string;
  description: string;
  condition: string;
  price: number;
  priceNegotiable: boolean;
  locationId: string;
  imageUrls: string[];
};

export type CreateListingResult =
  | { slug: string }
  | { error: string };

// ─────────────────────────────────────────────────────────────────────────────
// createListing
// Creates the listings row + listing_images rows in one Server Action call.
// No draft row is needed — the client pre-generates a UUID for the listing id
// and uses it as the Storage folder prefix before submitting.
// ─────────────────────────────────────────────────────────────────────────────

export async function createListing(
  payload: CreateListingPayload
): Promise<CreateListingResult> {
  const supabase = await createClient();

  // Verify the caller is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté pour publier une annonce." };

  // Resolve location name from the static data file
  const location = getLocationById(payload.locationId);
  const locationName =
    location?.isNeighborhood
      ? `${location.name}, ${location.commune}`
      : (location?.name ?? payload.locationId);

  // Build the base slug from the title + first 6 chars of the pending UUID.
  // On a collision the DB returns code 23505 — we regenerate the suffix and retry
  // up to MAX_SLUG_RETRIES times before giving up.
  const MAX_SLUG_RETRIES = 3;
  const baseSlug = slugify(payload.title);
  const rowBase = {
    id: payload.pendingListingId,
    seller_id: user.id,
    title: payload.title,
    description: payload.description,
    price: payload.price,
    price_negotiable: payload.priceNegotiable,
    category_slug: payload.categorySlug,
    location_id: payload.locationId,
    location_name: locationName,
    status: "pending" as const,
    condition:
      payload.condition && payload.condition !== ""
        ? (payload.condition as "new" | "like_new" | "good" | "fair" | "poor")
        : null,
  };

  let slug = baseSlug + "-" + payload.pendingListingId.slice(0, 6);
  let insertedSlug: string | null = null;

  for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
    if (attempt > 0) {
      // Append a fresh 4-char random suffix to break the collision
      slug = baseSlug + "-" + payload.pendingListingId.slice(0, 6) + "-" + Math.random().toString(36).slice(2, 6);
    }

    const { error: listingError } = await supabase.from("listings").insert({ ...rowBase, slug });

    if (!listingError) {
      insertedSlug = slug;
      break;
    }

    // Slug unique-constraint violation — retry with a new suffix
    if (listingError.code === "23505" && listingError.message.includes("slug")) {
      console.warn(`[createListing] slug collision on attempt ${attempt + 1}, retrying…`);
      continue;
    }

    // Any other DB error — fail immediately
    console.error("[createListing] listings insert error:", listingError.message);
    return { error: "Impossible de créer l'annonce. Réessayez." };
  }

  if (!insertedSlug) {
    console.error("[createListing] slug collision persisted after", MAX_SLUG_RETRIES, "retries");
    return { error: "Impossible de créer l'annonce. Réessayez." };
  }

  // Insert listing_images rows (if any images were uploaded)
  if (payload.imageUrls.length > 0) {
    const imageRows = payload.imageUrls.map((url, i) => ({
      listing_id: payload.pendingListingId,
      url,
      order: i,
    }));
    const { error: imgError } = await supabase.from("listing_images").insert(imageRows);
    if (imgError) {
      // The listing was created — log the image error but don't fail the whole action
      console.error("[createListing] listing_images insert error:", imgError.message);
    }
  }

  // Redirect to the new listing detail page
  redirect(`/listings/${insertedSlug}?submitted=1`);
}

// ─────────────────────────────────────────────────────────────────────────────
// updateListingStatus  (admin only)
// Uses the service-role client (bypasses RLS) to approve or reject a listing.
// ─────────────────────────────────────────────────────────────────────────────

export type UpdateStatusResult = { success: true } | { error: string };

export async function updateListingStatus(
  listingId: string,
  status: "active" | "rejected",
  rejectionReason?: string
): Promise<UpdateStatusResult> {
  if (status === "rejected" && !rejectionReason?.trim()) {
    return { error: "La raison du rejet est requise." };
  }

  // Verify the caller is an admin via the anon client (reads profiles table)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Accès refusé." };

  // Use service role to bypass RLS on the update
  const { error } = await adminSupabase
    .from("listings")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      ...(status === "rejected" && rejectionReason?.trim()
        ? { rejection_reason: rejectionReason.trim() }
        : {}),
    })
    .eq("id", listingId);

  if (error) {
    console.error("[updateListingStatus] error:", error.message);
    return { error: "Mise à jour impossible. Réessayez." };
  }

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// updateListing  (seller only)
// Updates all mutable fields and resets status to "pending" for re-moderation.
// Replaces listing_images entirely so ordering is preserved cleanly.
// ─────────────────────────────────────────────────────────────────────────────

export type UpdateListingPayload = {
  listingId: string;
  categorySlug: string;
  title: string;
  description: string;
  condition: string;
  price: number;
  priceNegotiable: boolean;
  locationId: string;
  imageUrls: string[];
};

export type UpdateListingResult = { slug: string } | { error: string };

export async function updateListing(
  payload: UpdateListingPayload
): Promise<UpdateListingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  // Fetch existing listing to verify ownership and get slug for redirect
  const { data: existing, error: fetchError } = await supabase
    .from("listings")
    .select("id, slug, seller_id, status")
    .eq("id", payload.listingId)
    .single();

  if (fetchError || !existing) return { error: "Annonce introuvable." };
  if (existing.seller_id !== user.id) return { error: "Accès refusé." };
  if (existing.status === "archived") return { error: "Cette annonce a été supprimée." };

  const location = getLocationById(payload.locationId);
  const locationName = location?.isNeighborhood
    ? `${location.name}, ${location.commune}`
    : (location?.name ?? payload.locationId);

  const { error: updateError } = await supabase
    .from("listings")
    .update({
      title: payload.title,
      description: payload.description,
      price: payload.price,
      price_negotiable: payload.priceNegotiable,
      category_slug: payload.categorySlug,
      location_id: payload.locationId,
      location_name: locationName,
      status: "pending" as const,
      condition:
        payload.condition && payload.condition !== ""
          ? (payload.condition as "new" | "like_new" | "good" | "fair" | "poor")
          : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.listingId);

  if (updateError) {
    console.error("[updateListing] update error:", updateError.message);
    return { error: "Mise à jour impossible. Réessayez." };
  }

  // Replace images: delete all existing rows, then insert the new ordered list
  await supabase.from("listing_images").delete().eq("listing_id", payload.listingId);

  if (payload.imageUrls.length > 0) {
    const imageRows = payload.imageUrls.map((url, i) => ({
      listing_id: payload.listingId,
      url,
      order: i,
    }));
    const { error: imgError } = await supabase.from("listing_images").insert(imageRows);
    if (imgError) {
      console.error("[updateListing] listing_images insert error:", imgError.message);
    }
  }

  redirect(`/listings/${existing.slug}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// deleteListing  (seller only — soft delete via "archived" status)
// ─────────────────────────────────────────────────────────────────────────────

export type DeleteListingResult = { success: true } | { error: string };

export async function deleteListing(listingId: string): Promise<DeleteListingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { data: existing, error: fetchError } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", listingId)
    .single();

  if (fetchError || !existing) return { error: "Annonce introuvable." };
  if (existing.seller_id !== user.id) return { error: "Accès refusé." };

  const { error } = await supabase
    .from("listings")
    .update({ status: "archived" as const, updated_at: new Date().toISOString() })
    .eq("id", listingId);

  if (error) {
    console.error("[deleteListing]", error.message);
    return { error: "Suppression impossible. Réessayez." };
  }

  revalidatePath("/profile");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// markAsSold  (seller only)
// ─────────────────────────────────────────────────────────────────────────────

export type MarkAsSoldResult = { success: true } | { error: string };

export async function markAsSold(listingId: string): Promise<MarkAsSoldResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { data: existing, error: fetchError } = await supabase
    .from("listings")
    .select("seller_id, status, slug")
    .eq("id", listingId)
    .single();

  if (fetchError || !existing) return { error: "Annonce introuvable." };
  if (existing.seller_id !== user.id) return { error: "Accès refusé." };
  if (existing.status === "sold") return { error: "Déjà marquée comme vendue." };

  const { error } = await supabase
    .from("listings")
    .update({ status: "sold" as const, updated_at: new Date().toISOString() })
    .eq("id", listingId);

  if (error) {
    console.error("[markAsSold]", error.message);
    return { error: "Mise à jour impossible. Réessayez." };
  }

  revalidatePath(`/listings/${existing.slug}`);
  revalidatePath("/profile");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// trackView
// Increments the view counter for a listing, skipping self-views.
// Uses the service-role client to bypass RLS (UPDATE on listings is restricted
// to the seller by default). Client-side dedup via sessionStorage prevents
// counting the same session twice.
// ─────────────────────────────────────────────────────────────────────────────

export async function trackView(listingId: string): Promise<void> {
  // Check whether the viewer is the seller
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing } = await supabase
    .from("listings")
    .select("seller_id, views")
    .eq("id", listingId)
    .single();

  if (!listing) return;
  if (user && user.id === listing.seller_id) return; // skip self-view

  // Increment via admin client (bypasses RLS — view counting is a system operation)
  await adminSupabase
    .from("listings")
    .update({ views: (listing.views ?? 0) + 1 })
    .eq("id", listingId);
}
