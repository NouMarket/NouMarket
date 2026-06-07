import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "listing_approved"
  | "listing_rejected"
  | "new_message"
  | "listing_favorited"
  | "listing_reported"
  | "verification_approved"
  | "verification_rejected";

interface NotifPayload {
  type: NotificationType;
  /** Raw fallback title (listing title, sender name, etc.) */
  title: string;
  /** Raw fallback body */
  body: string;
  href?: string | null;
  metadata?: Record<string, Json> | null;
}

// ─── Low-level primitives ─────────────────────────────────────────────────────

/**
 * Inserts a single notification row using the service-role client.
 * Fire-and-forget — logs errors but never throws.
 */
async function insertNotification(
  userId: string,
  payload: NotifPayload
): Promise<void> {
  const { error } = await adminSupabase.from("notifications").insert({
    user_id: userId,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    href: payload.href ?? null,
    metadata: (payload.metadata ?? null) as Json | null,
  });
  if (error) {
    console.error("[notifications] insert failed:", payload.type, error.message);
  }
}

/**
 * Inserts a notification row for every admin user.
 * Fetches admin IDs via adminSupabase, then bulk-inserts.
 */
async function insertForAdmins(payload: NotifPayload): Promise<void> {
  const { data: admins, error } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("is_admin", true);

  if (error || !admins?.length) {
    console.warn("[notifications] insertForAdmins – no admins found:", error?.message);
    return;
  }

  const rows = admins.map((admin) => ({
    user_id: admin.id,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    href: payload.href ?? null,
    metadata: (payload.metadata ?? null) as Json | null,
  }));

  const { error: insertError } = await adminSupabase
    .from("notifications")
    .insert(rows);

  if (insertError) {
    console.error("[notifications] insertForAdmins failed:", insertError.message);
  }
}

// ─── Domain helpers — called from server actions ──────────────────────────────

/**
 * Notify the listing seller when an admin approves or rejects their listing.
 * Called from app/actions/listings.ts → updateListingStatus.
 */
export async function notifyListingModerated(
  listingId: string,
  status: "active" | "rejected",
  rejectionReason?: string
): Promise<void> {
  const { data: listing } = await adminSupabase
    .from("listings")
    .select("seller_id, title, slug")
    .eq("id", listingId)
    .single();

  if (!listing) return;

  await insertNotification(listing.seller_id, {
    type: status === "active" ? "listing_approved" : "listing_rejected",
    title: listing.title,
    body: status === "active" ? "" : (rejectionReason ?? ""),
    href: `/listings/${listing.slug}`,
    metadata: {
      listingTitle: listing.title,
      listingSlug: listing.slug,
      ...(status === "rejected" && rejectionReason
        ? { rejectionReason }
        : {}),
    },
  });
}

/**
 * Notify the message receiver when a new message is sent.
 * Called from app/actions/messages.ts → sendMessage.
 */
export async function notifyNewMessage(opts: {
  receiverId: string;
  senderId: string;
  conversationId: string;
  listingId: string;
}): Promise<void> {
  const [senderRes, listingRes] = await Promise.all([
    adminSupabase.from("profiles").select("name").eq("id", opts.senderId).single(),
    adminSupabase.from("listings").select("title").eq("id", opts.listingId).single(),
  ]);

  const senderName = senderRes.data?.name ?? "";
  const listingTitle = listingRes.data?.title ?? "";

  await insertNotification(opts.receiverId, {
    type: "new_message",
    title: senderName,
    body: listingTitle,
    href: `/messages/${opts.conversationId}`,
    metadata: {
      senderName,
      conversationId: opts.conversationId,
      listingTitle,
    },
  });
}

/**
 * Notify the listing seller when someone favorites their listing.
 * Skips self-favorites.
 * Called from app/actions/favorites.ts → addFavorite.
 */
export async function notifyListingFavorited(
  listingId: string,
  favoriterId: string
): Promise<void> {
  const { data: listing } = await adminSupabase
    .from("listings")
    .select("seller_id, title, slug")
    .eq("id", listingId)
    .single();

  if (!listing) return;
  // Don't notify sellers about their own listings
  if (listing.seller_id === favoriterId) return;

  await insertNotification(listing.seller_id, {
    type: "listing_favorited",
    title: listing.title,
    body: "",
    href: `/listings/${listing.slug}`,
    metadata: {
      listingTitle: listing.title,
      listingSlug: listing.slug,
    },
  });
}

/**
 * Notify a user when their verification request is approved or rejected.
 * Called from app/actions/verification.ts.
 */
export async function notifyVerificationResult(
  userId: string,
  approved: boolean
): Promise<void> {
  await insertNotification(userId, {
    type: approved ? "verification_approved" : "verification_rejected",
    title: "",
    body: "",
    href: "/profile",
    metadata: null,
  });
}

/**
 * Notify all admin users when a listing is reported.
 * Called from app/actions/reports.ts → reportListing.
 */
export async function notifyAdminsNewReport(listingId: string): Promise<void> {
  const { data: listing } = await adminSupabase
    .from("listings")
    .select("title, slug")
    .eq("id", listingId)
    .single();

  if (!listing) return;

  await insertForAdmins({
    type: "listing_reported",
    title: listing.title,
    body: "",
    href: `/admin/reports`,
    metadata: {
      listingTitle: listing.title,
      listingSlug: listing.slug,
    },
  });
}
