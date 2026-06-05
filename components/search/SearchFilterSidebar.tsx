"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { LOCATIONS, NOUMEA_NEIGHBORHOODS } from "@/data/locations";
import { CONDITION_OPTIONS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function SearchFilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read current filter values from URL
  const currentCategory = searchParams.get("categorySlug") ?? "";
  const currentLocation  = searchParams.get("location") ?? "";
  const currentCondition = searchParams.get("condition") ?? "";
  const currentMinPrice  = searchParams.get("minPrice") ?? "";
  const currentMaxPrice  = searchParams.get("maxPrice") ?? "";

  const activeFilters = [
    currentCategory,
    currentLocation,
    currentCondition,
    currentMinPrice,
    currentMaxPrice,
  ].filter(Boolean).length;

  /** Update a single param, preserve all others, scroll to top. */
  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 whenever a filter changes
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    const q = searchParams.get("q");
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <aside className="w-full lg:w-60 shrink-0 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {activeFilters > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-500 text-white text-xs font-bold">
              {activeFilters}
            </span>
          )}
        </div>
        {activeFilters > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-3 w-3" /> Effacer
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Catégorie
        </p>
        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => setParam("categorySlug", "")}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                !currentCategory
                  ? "bg-sky-50 text-sky-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Toutes les catégories
            </button>
          </li>
          {CATEGORIES.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => setParam("categorySlug", cat.slug)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                  currentCategory === cat.slug
                    ? "bg-sky-50 text-sky-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{cat.icon}</span>
                <span className="flex-1">{cat.labelFr}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Location */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Localité
        </p>
        <select
          value={currentLocation}
          onChange={(e) => setParam("location", e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none bg-white"
        >
          <option value="">Toute la NC</option>
          <optgroup label="Communes">
            {LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Quartiers de Nouméa">
            {NOUMEA_NEIGHBORHOODS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Prix (XPF)
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={currentMinPrice}
            onChange={(e) => setParam("minPrice", e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={currentMaxPrice}
            onChange={(e) => setParam("maxPrice", e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
        </div>
        {(currentMinPrice || currentMaxPrice) && (
          <p className="text-xs text-gray-400 mt-1">
            {currentMinPrice ? formatPrice(Number(currentMinPrice)) : "0"}{" "}
            → {currentMaxPrice ? formatPrice(Number(currentMaxPrice)) : "∞"}
          </p>
        )}
      </div>

      {/* Condition */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          État
        </p>
        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => setParam("condition", "")}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                !currentCondition
                  ? "bg-sky-50 text-sky-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Tous les états
            </button>
          </li>
          {CONDITION_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                onClick={() => setParam("condition", opt.value)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                  currentCondition === opt.value
                    ? "bg-sky-50 text-sky-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Apply button (mobile convenience) */}
      <div className="lg:hidden">
        <Button fullWidth variant="secondary" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Voir les résultats
        </Button>
      </div>
    </aside>
  );
}
