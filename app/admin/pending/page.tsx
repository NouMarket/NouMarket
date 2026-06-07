import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MOCK_PENDING_LISTINGS } from "@/data/listings";
import { mapJoinedListingToListing, type JoinedListing } from "@/lib/mappers";
import { getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import AdminPendingQueue from "@/components/admin/AdminPendingQueue";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Administration - Annonces en attente",
  robots: { index: false, follow: false },
};

export default async function AdminPendingPage() {
  const dictionary = await getServerDictionary();
  const t = (key: keyof typeof dictionary) => translate(dictionary, key);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin/pending");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) notFound();

  const { data: rows, error: listingsError } = await supabase
    .from("listings")
    .select("*, listing_images(url, order), profiles!seller_id(*)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const pendingListings =
    listingsError || !rows
      ? MOCK_PENDING_LISTINGS
      : (rows as JoinedListing[]).map(mapJoinedListingToListing);

  if (!listingsError && pendingListings.length > 0) {
    const { data: reports } = await supabase
      .from("listing_reports")
      .select("listing_id")
      .in(
        "listing_id",
        pendingListings.map((listing) => listing.id)
      );

    const reportCounts = new Map<string, number>();
    for (const report of reports ?? []) {
      reportCounts.set(
        report.listing_id,
        (reportCounts.get(report.listing_id) ?? 0) + 1
      );
    }

    for (const listing of pendingListings) {
      listing.reportCount = reportCounts.get(listing.id) ?? 0;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav current="/admin/pending" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("admin.pendingTitle")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("admin.pendingSubtitle")}
          </p>
        </div>

        <AdminPendingQueue initialListings={pendingListings} />
      </div>
    </div>
  );
}
