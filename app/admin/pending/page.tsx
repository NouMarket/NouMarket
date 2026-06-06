import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MOCK_PENDING_LISTINGS } from "@/data/listings";
import { mapJoinedListingToListing, type JoinedListing } from "@/lib/mappers";
import AdminPendingQueue from "@/components/admin/AdminPendingQueue";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Administration – Annonces en attente",
  robots: { index: false, follow: false },
};

export default async function AdminPendingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts already redirects unauthenticated requests, but a second check
  // here gives a hard 404 if someone bypasses it (e.g. during SSG/ISR)
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
      .in("listing_id", pendingListings.map((listing) => listing.id));

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
      {/* Admin top bar */}
      <div className="bg-gray-900 text-white px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <LayoutDashboard className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium">Administration NouMarket</span>
          <Link
            href="/admin/reports"
            className="ml-auto text-xs text-gray-300 hover:text-white"
          >
            Signalements
          </Link>
          <Badge variant="warning">
            Mode Admin
          </Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Annonces en attente</h1>
          <p className="text-sm text-gray-500 mt-1">
            Examinez et modérez les annonces soumises par les utilisateurs.
          </p>
        </div>

        <AdminPendingQueue initialListings={pendingListings} />
      </div>
    </div>
  );
}
