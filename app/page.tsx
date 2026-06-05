import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  getFeaturedListings,
  getLatestListings,
} from "@/data/listings";
import { mapJoinedListingToListing, type JoinedListing } from "@/lib/mappers";
import type { Listing } from "@/types";
import Hero from "@/components/home/Hero";
import CategoryShortcuts from "@/components/home/CategoryShortcuts";
import FeaturedListings from "@/components/home/FeaturedListings";
import LatestListings from "@/components/home/LatestListings";
import PopularLocations from "@/components/home/PopularLocations";
import TrustSection from "@/components/home/TrustSection";
import CreateListingCTA from "@/components/home/CreateListingCTA";

export const metadata: Metadata = {
  title: "NouMarket – La marketplace de Nouvelle-Calédonie",
  description:
    "Achetez, vendez et découvrez des milliers d'annonces en Nouvelle-Calédonie. Immobilier, véhicules, électronique, services et plus encore.",
};

// Revalidate the home page every 60 seconds (ISR)
export const revalidate = 60;

const SELECT = "*, listing_images(url, order), profiles!seller_id(*)";

async function fetchFeatured(): Promise<Listing[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listings")
      .select(SELECT)
      .eq("status", "active")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(6);
    if (error || !data || data.length === 0) return getFeaturedListings();
    return (data as JoinedListing[]).map(mapJoinedListingToListing);
  } catch {
    return getFeaturedListings();
  }
}

async function fetchLatest(): Promise<Listing[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listings")
      .select(SELECT)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8);
    if (error || !data || data.length === 0) return getLatestListings(8);
    return (data as JoinedListing[]).map(mapJoinedListingToListing);
  } catch {
    return getLatestListings(8);
  }
}

export default async function HomePage() {
  const [featured, latest] = await Promise.all([fetchFeatured(), fetchLatest()]);

  return (
    <>
      <Hero />
      <CategoryShortcuts />
      <FeaturedListings listings={featured} />
      <PopularLocations />
      <LatestListings listings={latest} />
      <TrustSection />
      <CreateListingCTA />
    </>
  );
}
