"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function SearchPagination({ currentPage, totalPages }: SearchPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  // Show at most 5 page numbers centered around currentPage
  const delta = 2;
  const start = Math.max(1, currentPage - delta);
  const end = Math.min(totalPages, currentPage + delta);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 pt-2"
    >
      <button
        onClick={() => navigate(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Page précédente"
        className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => navigate(1)}
            className="min-w-[36px] h-9 px-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            1
          </button>
          {start > 2 && (
            <span className="px-1 text-gray-400 text-sm select-none">…</span>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => navigate(p)}
          aria-current={p === currentPage ? "page" : undefined}
          className={`min-w-[36px] h-9 px-2 rounded-xl border text-sm transition-colors ${
            p === currentPage
              ? "border-sky-500 bg-sky-50 text-sky-600 font-semibold"
              : "border-gray-200 text-gray-700 hover:bg-gray-100"
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-1 text-gray-400 text-sm select-none">…</span>
          )}
          <button
            onClick={() => navigate(totalPages)}
            className="min-w-[36px] h-9 px-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => navigate(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Page suivante"
        className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
