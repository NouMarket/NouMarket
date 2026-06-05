import { Category } from "@/types";

export const CATEGORIES: Category[] = [
  {
    id: "real-estate",
    slug: "immobilier",
    label: "Real Estate",
    labelFr: "Immobilier",
    icon: "🏠",
    count: 247,
  },
  {
    id: "vehicles",
    slug: "vehicules",
    label: "Vehicles",
    labelFr: "Véhicules",
    icon: "🚗",
    count: 183,
  },
  {
    id: "boats",
    slug: "bateaux",
    label: "Boats",
    labelFr: "Bateaux",
    icon: "⛵",
    count: 42,
  },
  {
    id: "electronics",
    slug: "electronique",
    label: "Electronics",
    labelFr: "Électronique",
    icon: "📱",
    count: 312,
  },
  {
    id: "furniture",
    slug: "mobilier",
    label: "Furniture",
    labelFr: "Mobilier",
    icon: "🛋️",
    count: 156,
  },
  {
    id: "fashion",
    slug: "mode",
    label: "Fashion",
    labelFr: "Mode",
    icon: "👗",
    count: 289,
  },
  {
    id: "jobs",
    slug: "emploi",
    label: "Jobs",
    labelFr: "Emploi",
    icon: "💼",
    count: 94,
  },
  {
    id: "services",
    slug: "services",
    label: "Services",
    labelFr: "Services",
    icon: "🔧",
    count: 178,
  },
  {
    id: "businesses",
    slug: "commerces",
    label: "Local Businesses",
    labelFr: "Commerces",
    icon: "🏪",
    count: 67,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
