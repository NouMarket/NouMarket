"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/constants";

interface SearchSortBarProps {
  total: number;
  query?: string;
}

export default function SearchSortBar({ total, query }: SearchSortBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
            résultat{total !== 1 ? "s" : ""}
            {query && (
              <>
                {" "}pour <span className="font-medium text-gray-700">&ldquo;{query}&rdquo;</span>
              </>
            )}
          </>
        ) : (
          "Aucun résultat"
        )}
      </p>

      <select
        value={currentSort}
        onChange={(e) => handleSort(e.target.value)}
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none bg-white"
        aria-label="Trier les résultats"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
