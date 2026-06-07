import Link from "next/link";
import { MapPin } from "lucide-react";
import { LOCATIONS } from "@/data/locations";
import { getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";

const LOCATION_IMAGES: Record<string, string> = {
  noumea: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=600&q=80",
  dumbea: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  "mont-dore": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
  paita: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
  lifou: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80",
};

const LISTING_COUNTS: Record<string, number> = {
  noumea: 842,
  dumbea: 243,
  "mont-dore": 187,
  paita: 134,
  bourail: 78,
  kone: 56,
  lifou: 41,
  mare: 29,
  poindimie: 22,
  "la-foa": 19,
};

const FEATURED_LOCATIONS = LOCATIONS.slice(0, 5);

export default async function PopularLocations() {
  const dictionary = await getServerDictionary();
  const t = (key: keyof typeof dictionary, params?: Record<string, string | number>) =>
    translate(dictionary, key, params);

  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900">
            {t("home.popularLocations")}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {t("home.popularLocationsSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {FEATURED_LOCATIONS.map((loc) => {
            const count = LISTING_COUNTS[loc.id] ?? 0;
            return (
              <Link
                key={loc.id}
                href={`/search?location=${loc.id}`}
                className="group relative overflow-hidden rounded-2xl aspect-square bg-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-cyan-600" />
                {LOCATION_IMAGES[loc.id] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={LOCATION_IMAGES[loc.id]}
                    alt={loc.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-white flex-shrink-0" />
                    <span className="text-white font-semibold text-sm">{loc.name}</span>
                  </div>
                  <p className="text-white/70 text-xs mt-0.5">
                    {t("home.listingCount", {
                      count,
                      plural: count !== 1 ? "s" : "",
                    })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
