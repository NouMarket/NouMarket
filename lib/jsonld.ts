import type { Listing } from "@/types";
import type { Category } from "@/types";

export type BreadcrumbItem = { name: string; url?: string };

export function buildBreadcrumbSchema(items: BreadcrumbItem[], siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: `${siteUrl}${item.url}` } : {}),
    })),
  };
}

// Maps internal condition values to schema.org OfferItemCondition URIs
const CONDITION_SCHEMA: Record<string, string> = {
  new: "https://schema.org/NewCondition",
  like_new: "https://schema.org/LikeNewCondition",
  good: "https://schema.org/UsedCondition",
  fair: "https://schema.org/UsedCondition",
  poor: "https://schema.org/DamagedCondition",
};

export function buildProductSchema(
  listing: Listing,
  siteUrl: string
) {
  const url = `${siteUrl}/listings/${listing.slug}`;
  const validImages = listing.images.filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    url,
    ...(validImages.length > 0 ? { image: validImages } : {}),
    ...(listing.condition
      ? { itemCondition: CONDITION_SCHEMA[listing.condition] }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      price: listing.price,
      priceCurrency: "XPF",
      availability:
        listing.status === "active"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      seller: {
        "@type": "Person",
        name: listing.seller.name,
        url: `${siteUrl}/sellers/${listing.seller.id}`,
      },
    },
  };
}

export function buildPersonSchema(name: string, userId: string, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: `${siteUrl}/sellers/${userId}`,
  };
}

export function buildListingJsonLd(
  listing: Listing,
  category: Category | undefined,
  siteUrl: string
): string {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Accueil", url: "/" },
    ...(category
      ? [{ name: category.labelFr, url: `/categories/${category.slug}` }]
      : []),
    { name: listing.title },
  ];

  return JSON.stringify([
    buildProductSchema(listing, siteUrl),
    buildBreadcrumbSchema(breadcrumbs, siteUrl),
  ]);
}
