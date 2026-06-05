export const FREE_IMAGE_LIMIT = 5;
export const PREMIUM_IMAGE_LIMIT = 20;

export const SITE_NAME = "NouMarket";
export const SITE_DESCRIPTION =
  "La marketplace locale de Nouvelle-Calédonie. Achetez, vendez, louez et découvrez des annonces près de chez vous.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://noumarket.nc";

export const DEFAULT_CURRENCY = "XPF";
export const DEFAULT_LOCALE = "fr-FR";

export const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/categories/immobilier", label: "Immobilier" },
  { href: "/categories/vehicules", label: "Véhicules" },
  { href: "/categories/electronique", label: "Électronique" },
];

export const CONDITION_OPTIONS = [
  { value: "new", label: "Neuf" },
  { value: "like_new", label: "Comme neuf" },
  { value: "good", label: "Bon état" },
  { value: "fair", label: "État correct" },
  { value: "poor", label: "À remettre en état" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Plus récents" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "relevance", label: "Pertinence" },
];
