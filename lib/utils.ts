import { clsx, type ClassValue } from "clsx";
import { SellerTrustLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number): string {
  if (price === 0) return "Gratuit / À discuter";
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(price) + " XPF";
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} jours`;
  return formatDate(dateStr);
}

export function trustLevelLabel(level: SellerTrustLevel): string {
  const labels: Record<SellerTrustLevel, string> = {
    new: "Nouveau",
    verified: "Vérifié",
    trusted: "De confiance",
    pro: "Professionnel",
  };
  return labels[level];
}

export function trustLevelColor(level: SellerTrustLevel): string {
  const colors: Record<SellerTrustLevel, string> = {
    new: "bg-gray-100 text-gray-600",
    verified: "bg-blue-50 text-blue-700",
    trusted: "bg-green-50 text-green-700",
    pro: "bg-violet-50 text-violet-700",
  };
  return colors[level];
}

export function conditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    new: "Neuf",
    like_new: "Comme neuf",
    good: "Bon état",
    fair: "État correct",
    poor: "À remettre en état",
  };
  return labels[condition] ?? condition;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
