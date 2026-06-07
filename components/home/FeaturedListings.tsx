import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Listing } from "@/types";
import { getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import ListingCard from "@/components/listings/ListingCard";

interface Props {
  listings: Listing[];
}

export default async function FeaturedListings({ listings }: Props) {
  if (listings.length === 0) return null;

  const dictionary = await getServerDictionary();
  const t = (key: keyof typeof dictionary) => translate(dictionary, key);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {t("home.featuredTitle")}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {t("home.featuredSubtitle")}
          </p>
        </div>
        <Link
          href="/search?featured=true"
          className="flex items-center gap-1 text-sm text-sky-500 hover:text-sky-600 font-medium transition-colors"
        >
          {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
