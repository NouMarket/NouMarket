"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { LOCATIONS, NOUMEA_NEIGHBORHOODS } from "@/data/locations";
import { CONDITION_OPTIONS } from "@/lib/constants";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function SearchFilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const currentCategory = searchParams.get("categorySlug") ?? "";
  const currentLocation = searchParams.get("location") ?? "";
  const currentCondition = searchParams.get("condition") ?? "";
  const currentMinPrice = searchParams.get("minPrice") ?? "";
  const currentMaxPrice = searchParams.get("maxPrice") ?? "";

  const activeFilters = [
    currentCategory,
    currentLocation,
    currentCondition,
    currentMinPrice,
    currentMaxPrice,
  ].filter(Boolean).length;

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <SlidersHorizontal className="h-4 w-4" />
          {t("common.filters")}
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
            <X className="h-3 w-3" /> {t("common.clear")}
          </button>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {t("create.category")}
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
              {t("common.allCategories")}
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
                <span className="flex-1">
                  {t(`category.${cat.slug}` as TranslationKey)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {t("create.locationLabel")}
        </p>
        <select
          value={currentLocation}
          onChange={(e) => setParam("location", e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none bg-white"
        >
          <option value="">{t("location.allNc")}</option>
          <optgroup label={t("location.communes")}>
            {LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </optgroup>
          <optgroup label={t("location.noumeaNeighborhoods")}>
            {NOUMEA_NEIGHBORHOODS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {t("common.price")} (XPF)
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder={t("common.min")}
            value={currentMinPrice}
            onChange={(e) => setParam("minPrice", e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
          <input
            type="number"
            min={0}
            placeholder={t("common.max")}
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

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {t("create.conditionLabel")}
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
              {t("common.allConditions")}
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
                {t(`condition.${opt.value}` as TranslationKey)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:hidden">
        <Button
          fullWidth
          variant="secondary"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          {t("common.viewResults")}
        </Button>
      </div>
    </aside>
  );
}
