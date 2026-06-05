import type { Metadata } from "next";
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

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryShortcuts />
      <FeaturedListings />
      <PopularLocations />
      <LatestListings />
      <TrustSection />
      <CreateListingCTA />
    </>
  );
}
