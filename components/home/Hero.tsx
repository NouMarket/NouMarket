"use client";

import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/data/categories";
import { LOCATIONS } from "@/data/locations";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import { useTranslation } from "@/lib/i18n/useTranslation";
import Button from "@/components/ui/Button";

export default function Hero() {
  const router = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const popularCategories = CATEGORIES.slice(0, 4);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-400 py-20 sm:py-28">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-sky-100 text-sm font-medium tracking-wide uppercase mb-4">
          {t("home.marketplace")}
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
          {t("home.heroTitleLine1")}
          <br />
          <span className="text-cyan-200">{t("home.heroTitleLine2")}</span>
        </h1>
        <p className="text-sky-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          {t("home.heroSubtitle")}
        </p>

        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto"
        >
          <div className="flex-1 flex items-center gap-2 px-3">
            <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("home.searchQuestion")}
              className="w-full py-2 text-gray-900 placeholder-gray-400 text-sm focus:outline-none"
            />
          </div>
          <div className="hidden sm:block w-px bg-gray-200 self-stretch my-1" />
          <div className="flex items-center gap-2 px-3">
            <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="py-2 text-sm text-gray-700 focus:outline-none bg-transparent"
            >
              <option value="">{t("location.allNc")}</option>
              {LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" size="lg" className="shrink-0 w-full sm:w-auto">
            {t("common.search")}
          </Button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-sky-100">
          <span>{t("home.popular")}</span>
          {popularCategories.map((category) => (
            <button
              key={category.slug}
              onClick={() => router.push(`/categories/${category.slug}`)}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
            >
              {t(`category.${category.slug}` as TranslationKey)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
