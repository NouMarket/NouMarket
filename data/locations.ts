import { Location } from "@/types";

export const LOCATIONS: Location[] = [
  { id: "noumea", name: "Nouméa" },
  { id: "dumbea", name: "Dumbéa" },
  { id: "mont-dore", name: "Mont-Dore" },
  { id: "paita", name: "Païta" },
  { id: "bourail", name: "Bourail" },
  { id: "kone", name: "Koné" },
  { id: "lifou", name: "Lifou" },
  { id: "mare", name: "Maré" },
  { id: "poindimie", name: "Poindimié" },
  { id: "la-foa", name: "La Foa" },
];

export const NOUMEA_NEIGHBORHOODS: Location[] = [
  { id: "anse-vata", name: "Anse Vata", commune: "Nouméa", isNeighborhood: true },
  { id: "baie-citrons", name: "Baie des Citrons", commune: "Nouméa", isNeighborhood: true },
  { id: "magenta", name: "Magenta", commune: "Nouméa", isNeighborhood: true },
  { id: "val-plaisance", name: "Val Plaisance", commune: "Nouméa", isNeighborhood: true },
  { id: "tina", name: "Tina", commune: "Nouméa", isNeighborhood: true },
  { id: "riviere-salee", name: "Rivière-Salée", commune: "Nouméa", isNeighborhood: true },
  { id: "centre-ville", name: "Centre Ville", commune: "Nouméa", isNeighborhood: true },
  { id: "orphelinat", name: "Orphelinat", commune: "Nouméa", isNeighborhood: true },
];

export const ALL_LOCATIONS: Location[] = [...LOCATIONS, ...NOUMEA_NEIGHBORHOODS];

export function getLocationById(id: string): Location | undefined {
  return ALL_LOCATIONS.find((l) => l.id === id);
}
