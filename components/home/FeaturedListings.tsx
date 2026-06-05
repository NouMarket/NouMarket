import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedListings } from "@/data/listings";
import ListingCard from "@/components/listings/ListingCard";

export default function FeaturedListings() {
  const listings = getFeaturedListings();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Annonces à la une</h2>
          <p className="text-sm text-gray-500 mt-0.5">Sélectionnés par notre équipe</p>
        </div>
        <Link
          href="/search?featured=true"
          className="flex items-center gap-1 text-sm text-sky-500 hover:text-sky-600 font-medium transition-colors"
        >
          Voir tout <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Premium horizontal scroll on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
