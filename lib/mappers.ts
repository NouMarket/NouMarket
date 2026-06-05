import type { Listing, Seller, SellerTrustLevel } from "@/types";
import type { ListingRow, ListingImageRow, ProfileRow } from "@/types/database";

/**
 * Maps a profiles DB row to the Seller type used by all existing UI components.
 * listingCount is passed separately (computed via count query or aggregation).
 */
export function mapDbToSeller(
  profile: ProfileRow,
  listingCount = 0
): Seller {
  return {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar_url ?? undefined,
    trustLevel: (profile.trust_level as SellerTrustLevel) ?? "new",
    memberSince: new Date(profile.member_since).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
    }),
    listingCount,
    responseRate: profile.response_rate ?? undefined,
  };
}

/**
 * Maps a listings DB row + related profile + images to the Listing type.
 * This keeps ListingCard, ListingGrid, and all display components unchanged
 * while the data source transitions from mock arrays to Supabase.
 */
export function mapDbListingToListing(
  listing: ListingRow,
  seller: ProfileRow,
  images: Pick<ListingImageRow, "url" | "order">[]
): Listing {
  const sortedImages = [...images]
    .sort((a, b) => a.order - b.order)
    .map((img) => img.url);

  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price: Number(listing.price), // DB is bigint; real gen-types may return string
    priceNegotiable: listing.price_negotiable,
    categorySlug: listing.category_slug,
    locationId: listing.location_id,
    locationName: listing.location_name,
    images: sortedImages,
    seller: mapDbToSeller(seller),
    status: listing.status,
    createdAt: listing.created_at,
    updatedAt: listing.updated_at,
    isFeatured: listing.is_featured,
    views: listing.views,
    condition: listing.condition ?? undefined,
    attributes: listing.attributes
      ? (listing.attributes as Record<string, string>)
      : undefined,
  };
}

/**
 * Supabase join result type when listings are fetched with
 * .select('*, listing_images(url, order), profiles!seller_id(*)')
 *
 * Use this as the input to mapJoinedListingToListing for convenience.
 */
export type JoinedListing = ListingRow & {
  listing_images: Pick<ListingImageRow, "url" | "order">[];
  profiles: ProfileRow;
};

export function mapJoinedListingToListing(row: JoinedListing): Listing {
  return mapDbListingToListing(row, row.profiles, row.listing_images);
}
