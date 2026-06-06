"use server";

import { createClient } from "@/lib/supabase/server";
import type { ListingRow, ListingReportRow } from "@/types/database";

export type ReportReason = ListingReportRow["reason"];

export type ReportListingResult =
  | { success: true }
  | { alreadyReported: true }
  | { error: string };

const REPORT_REASONS: ReportReason[] = [
  "inappropriate",
  "spam",
  "fraud",
  "wrong_category",
  "other",
];

export async function reportListing(
  listingId: string,
  reason: ReportReason,
  details?: string
): Promise<ReportListingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Vous devez etre connecte pour signaler une annonce." };
  if (!REPORT_REASONS.includes(reason)) return { error: "Motif de signalement invalide." };

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_id")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) return { error: "Annonce introuvable." };

  const sellerId = (listing as Pick<ListingRow, "seller_id">).seller_id;
  if (sellerId === user.id) {
    return { error: "Vous ne pouvez pas signaler votre propre annonce." };
  }

  const { error } = await supabase.from("listing_reports").insert({
    listing_id: listingId,
    reporter_id: user.id,
    reason,
    details: details?.trim() ? details.trim() : null,
  });

  if (!error) return { success: true };
  if (error.code === "23505") return { alreadyReported: true };

  return { error: "Signalement impossible. Reessayez." };
}
