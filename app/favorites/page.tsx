import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MOCK_LISTINGS } from "@/data/listings";
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

  // ── Runtime: use DB data ────────────────────────────────────
  // When DB is live, replace mock with:
  //   const { data: rows } = await supabase
  //     .from("favorites")
  //     .select("listing_id, listings(*, listing_images(url, order), profiles!seller_id(*))")
  //     .eq("user_id", user.id)
  //     .order("created_at", { ascending: false })
  //   const favorites = (rows ?? []).map(r => mapJoinedListingToListing(r.listings))
  //
  // ── Dev fallback (DB not yet live) ─────────────────────────
  const favorites = MOCK_LISTINGS.slice(0, 3);

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
        <ListingGrid listings={favorites} />
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
