import { Listing } from "@/types";
import ListingCard from "./ListingCard";

interface ListingGridProps {
  listings: Listing[];
  compact?: boolean;
  emptyMessage?: string;
}

export default function ListingGrid({
  listings,
  compact = false,
  emptyMessage = "Aucune annonce pour le moment.",
}: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} compact={compact} />
      ))}
    </div>
  );
}
