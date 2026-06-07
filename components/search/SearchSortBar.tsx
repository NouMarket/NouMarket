"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/constants";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SearchSortBarProps {
  total: number;
  query?: string;
}

export default function SearchSortBar({ total, query }: SearchSortBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  function handleSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") {
      params.delete("sortBy");
    } else {
      params.set("sortBy", value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  const currentSort = searchParams.get("sortBy") ?? "newest";

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <p className="text-sm text-gray-500">
        {total > 0 ? (
          <>
            <span className="font-semibold text-gray-900">{total}</span>{" "}
            {t("common.results", { plural: total !== 1 ? "s" : "" })}
            {query && (
              <>
                {" "}
                {t("common.forQuery")}{" "}
                <span className="font-medium text-gray-700">
                  &ldquo;{query}&rdquo;
                </span>
              </>
            )}
          </>
        ) : (
          t("common.noResults")
        )}
      </p>

      <select
        value={currentSort}
        onChange={(e) => handleSort(e.target.value)}
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none bg-white"
        aria-label={t("search.sortResults")}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t(`sort.${opt.value}` as TranslationKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
