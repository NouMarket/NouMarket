import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SlidersHorizontal, ChevronRight } from "lucide-react";
import { getCategoryBySlug, CATEGORIES } from "@/data/categories";
import { getListingsByCategory } from "@/data/listings";
import ListingGrid from "@/components/listings/ListingGrid";
import { SORT_OPTIONS } from "@/lib/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.labelFr} à vendre en Nouvelle-Calédonie`,
    description: `Parcourez les annonces de ${category.labelFr.toLowerCase()} en Nouvelle-Calédonie sur NouMarket.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const listings = getListingsByCategory(slug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-900 font-medium">{category.labelFr}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar – desktop */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Catégories
            </h3>
            <ul className="space-y-1">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors
                      ${cat.slug === slug
                        ? "bg-sky-50 text-sky-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="flex-1">{cat.labelFr}</span>
                    <span className="text-xs text-gray-400">{cat.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">{category.icon}</span>
                {category.labelFr}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {listings.length} annonce{listings.length !== 1 ? "s" : ""} trouvée{listings.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort links — delegate to /search with categorySlug pre-filled */}
              {SORT_OPTIONS.filter((o) => o.value !== "relevance").map((opt) => (
                <Link
                  key={opt.value}
                  href={`/search?categorySlug=${slug}&sortBy=${opt.value}`}
                  className="hidden sm:block px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {opt.label}
                </Link>
              ))}
              <Link
                href={`/search?categorySlug=${slug}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtres avancés
              </Link>
            </div>
          </div>

          <ListingGrid listings={listings} emptyMessage={`Aucune annonce en ${category.labelFr} pour le moment.`} />
        </div>
      </div>
    </div>
  );
}
