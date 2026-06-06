export type Category = {
  id: string;
  slug: string;
  label: string;
  labelFr: string;
  icon: string;
  count?: number;
};

export type Location = {
  id: string;
  name: string;
  commune?: string;
  isNeighborhood?: boolean;
};

export type ListingStatus =
  | "draft"
  | "pending"
  | "active"
  | "rejected"
  | "sold"
  | "expired"
  | "archived";

export type SellerTrustLevel = "new" | "verified" | "trusted" | "pro";

export type Seller = {
  id: string;
  name: string;
  avatar?: string;
  trustLevel: SellerTrustLevel;
  memberSince: string;
  listingCount: number;
  responseRate?: number;
};

export type Listing = {
  id: string;
  slug: string; // human-readable URL segment, unique in DB
  title: string;
  description: string;
  price: number;
  priceNegotiable?: boolean;
  categorySlug: string;
  locationId: string;
  locationName: string;
  images: string[];
  seller: Seller;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
  views?: number;
  reportCount?: number;
  condition?: "new" | "like_new" | "good" | "fair" | "poor";
  attributes?: Record<string, string>;
};

export type PendingListing = Listing & {
  rejectionReason?: string;
  reviewedAt?: string;
};

export type CreateListingFormData = {
  categorySlug: string;
  title: string;
  description: string;
  condition: string;
  price: number;
  priceNegotiable: boolean;
  locationId: string;
  images: File[];
};

export type SearchFilters = {
  query?: string;
  categorySlug?: string;
  locationId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  sortBy?: "newest" | "price_asc" | "price_desc" | "relevance";
};
