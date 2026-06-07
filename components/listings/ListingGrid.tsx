import { Listing } from "@/types";
import { getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import ListingCard from "./ListingCard";

interface ListingGridProps {
  listings: Listing[];
  compact?: boolean;
  emptyMessage?: string;
  favoritedIds?: Set<string>;
}

export default async function ListingGrid({
  listings,
  compact = false,
  emptyMessage,
  favoritedIds,
}: ListingGridProps) {
  const dictionary = await getServerDictionary();
  const fallbackEmptyMessage = translate(dictionary, "listing.noListings");

  if (listings.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-4xl mb-3">⌕</p>
        <p className="text-sm">{emptyMessage ?? fallbackEmptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          compact={compact}
          initialFavorited={favoritedIds?.has(listing.id) ?? false}
        />
      ))}
    </div>
  );
}
