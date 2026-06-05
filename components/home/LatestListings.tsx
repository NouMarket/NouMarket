import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLatestListings } from "@/data/listings";
import ListingGrid from "@/components/listings/ListingGrid";

export default function LatestListings() {
  const listings = getLatestListings(8);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dernières annonces</h2>
          <p className="text-sm text-gray-500 mt-0.5">Les plus récentes d&apos;abord</p>
        </div>
        <Link
          href="/search"
          className="flex items-center gap-1 text-sm text-sky-500 hover:text-sky-600 font-medium transition-colors"
        >
          Voir toutes <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ListingGrid listings={listings} compact />
    </section>
  );
}
