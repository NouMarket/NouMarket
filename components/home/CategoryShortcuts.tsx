import Link from "next/link";
import { CATEGORIES } from "@/data/categories";
import { getCategoryCounts } from "@/lib/categories";

export default async function CategoryShortcuts() {
  const counts = await getCategoryCounts();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Parcourir par catégorie</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
        {CATEGORIES.map((cat) => {
          const liveCount = counts[cat.slug] ?? cat.count;
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-sky-200 transition-all duration-200 text-center"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                {cat.icon}
              </span>
              <span className="text-xs font-medium text-gray-700 leading-tight">{cat.labelFr}</span>
              {liveCount != null && liveCount > 0 && (
                <span className="text-xs text-gray-400">{liveCount}</span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
