import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MOCK_LISTINGS } from "@/data/listings";
import { getCategoryBySlug } from "@/data/categories";
import { getLocationById } from "@/data/locations";
import { mapJoinedListingToListing } from "@/lib/mappers";
import type { Listing } from "@/types";
import ListingGrid from "@/components/listings/ListingGrid";
import SearchFilterSidebar from "@/components/search/SearchFilterSidebar";
import SearchSortBar from "@/components/search/SearchSortBar";

// Params accepted via URL
interface SearchParams {
  q?: string;
  categorySlug?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  sortBy?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q?.trim();
  const cat = params.categorySlug ? getCategoryBySlug(params.categorySlug) : undefined;

  const title = q
    ? `"${q}" – Recherche NouMarket`
    : cat
    ? `${cat.labelFr} – NouMarket`
    : "Recherche – NouMarket";

  return {
    title,
    description: `Trouvez des annonces${q ? ` pour "${q}"` : ""}${cat ? ` en ${cat.labelFr.toLowerCase()}` : ""} en Nouvelle-Calédonie sur NouMarket.`,
  };
}

/** Client-side fallback: filter and sort mock listings when DB is not live. */
function searchMockListings(params: SearchParams): Listing[] {
  let results = MOCK_LISTINGS.filter((l) => l.status === "active");

  if (params.q) {
    const q = params.q.toLowerCase();
    results = results.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
    );
  }
  if (params.categorySlug) {
    results = results.filter((l) => l.categorySlug === params.categorySlug);
  }
  if (params.location) {
    results = results.filter((l) => l.locationId === params.location);
  }
  if (params.minPrice) {
    const min = Number(params.minPrice);
    if (!isNaN(min)) results = results.filter((l) => l.price >= min);
  }
  if (params.maxPrice) {
    const max = Number(params.maxPrice);
    if (!isNaN(max)) results = results.filter((l) => l.price <= max);
  }
  if (params.condition) {
    results = results.filter((l) => l.condition === params.condition);
  }

  switch (params.sortBy) {
    case "price_asc":
      results.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      results.sort((a, b) => b.price - a.price);
      break;
    default:
      results.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  return results;
}

/** Live Supabase FTS + filter query. */
async function searchListings(params: SearchParams): Promise<Listing[]> {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(
      "*, listing_images(url, order), profiles!seller_id(*)"
    )
    .eq("status", "active");

  // Full-text search (French config) — only when query is ≥ 2 chars
  if (params.q && params.q.trim().length >= 2) {
    query = query.textSearch("fts", params.q.trim(), {
      type: "websearch",
      config: "french",
    });
  }

  if (params.categorySlug) query = query.eq("category_slug", params.categorySlug);
  if (params.location)     query = query.eq("location_id", params.location);
  if (params.minPrice && !isNaN(Number(params.minPrice)))
    query = query.gte("price", Number(params.minPrice));
  if (params.maxPrice && !isNaN(Number(params.maxPrice)))
    query = query.lte("price", Number(params.maxPrice));
  if (params.condition)
    query = query.eq(
      "condition",
      params.condition as "new" | "like_new" | "good" | "fair" | "poor"
    );

  switch (params.sortBy) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    // DB not live yet — fall back gracefully
    console.warn("[search] Supabase query failed, using mock data:", error.message);
    return searchMockListings(params);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => mapJoinedListingToListing(row));
}

export default async function SearchPage({ searchParams }: PageProps) {
  // Next.js 16: searchParams is a Promise — must be awaited
  const params = await searchParams;

  const q            = params.q?.trim() ?? "";
  const categorySlug = params.categorySlug ?? "";
  const location     = params.location ?? "";

  const listings = await searchListings(params);
  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined;
  const locationLabel = location ? getLocationById(location)?.name : undefined;

  // Build breadcrumb label
  const contextLabel =
    category?.labelFr ?? locationLabel ?? (q ? `"${q}"` : null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-gray-700">
            Accueil
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-medium">
            {contextLabel ? `Recherche : ${contextLabel}` : "Recherche"}
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar — Suspense wraps the Client Component that calls useSearchParams */}
          <Suspense
            fallback={
              <aside className="w-full lg:w-60 shrink-0 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </aside>
            }
          >
            <SearchFilterSidebar />
          </Suspense>

          {/* Results */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Sort bar — also uses useSearchParams */}
            <Suspense fallback={<div className="h-9 bg-gray-100 rounded-xl animate-pulse" />}>
              <SearchSortBar total={listings.length} query={q || undefined} />
            </Suspense>

            <ListingGrid
              listings={listings}
              emptyMessage={
                q
                  ? `Aucune annonce pour « ${q} ». Essayez des termes plus généraux.`
                  : "Aucune annonce ne correspond à ces filtres."
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
