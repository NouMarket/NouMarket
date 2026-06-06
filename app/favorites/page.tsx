import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapJoinedListingToListing, type JoinedListing } from "@/lib/mappers";
import type { Listing } from "@/types";
import ListingGrid from "@/components/listings/ListingGrid";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Mes favoris",
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/favorites");

  // Step 1: get favorite listing IDs ordered by when they were saved
  const { data: favRows } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const favIds = (favRows ?? []).map((r) => r.listing_id);

  // Step 2: fetch the actual listings (only active ones — skip deleted/rejected)
  let favorites: Listing[] = [];
  if (favIds.length > 0) {
    const { data: listingRows } = await supabase
      .from("listings")
      .select("*, listing_images(url, order), profiles!seller_id(*)")
      .in("id", favIds)
      .eq("status", "active");

    if (listingRows) {
      // Re-order to match the favorites table order
      const byId = new Map(
        (listingRows as JoinedListing[]).map((row) => [row.id, row])
      );
      favorites = favIds
        .filter((id) => byId.has(id))
        .map((id) => mapJoinedListingToListing(byId.get(id)!));
    }
  }

  const favoritedIds = new Set(favorites.map((l) => l.id));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mes favoris</h1>
          <p className="text-sm text-gray-500">
            {favorites.length} annonce{favorites.length !== 1 ? "s" : ""} sauvegardée
            {favorites.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {favorites.length > 0 ? (
        <ListingGrid listings={favorites} favoritedIds={favoritedIds} />
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💔</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun favori pour l&apos;instant
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Cliquez sur le ♡ sur une annonce pour la sauvegarder ici.
          </p>
          <Link href="/">
            <Button>Explorer les annonces</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
