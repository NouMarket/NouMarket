import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";

export const metadata: Metadata = {
  title: "Page introuvable",
};

export default async function NotFound() {
  const dictionary = await getServerDictionary();
  const t = (key: keyof typeof dictionary) => translate(dictionary, key);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-7xl font-black text-sky-500 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t("common.notFoundTitle")}
        </h1>
        <p className="text-sm text-gray-500 mb-8">{t("common.notFoundText")}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {t("common.backHome")}
          </Link>
          <Link
            href="/search"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors"
          >
            <Search className="h-4 w-4" />
            {t("common.searchPlaceholder")}
          </Link>
        </div>
      </div>
    </div>
  );
}
