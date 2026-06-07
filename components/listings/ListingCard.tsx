"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { MapPin, Eye } from "lucide-react";
import { Listing } from "@/types";
import { cn, trustLevelColor } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import Badge from "@/components/ui/Badge";
import FavoriteButton from "./FavoriteButton";

interface ListingCardProps {
  listing: Listing;
  compact?: boolean;
  initialFavorited?: boolean;
}

function formatRelativeDate(
  dateStr: string,
  locale: "fr" | "tr",
  t: ReturnType<typeof useTranslation>["t"]
) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return t("time.now");
  if (diff < 3600) return t("time.minutesAgo", { count: Math.floor(diff / 60) });
  if (diff < 86400) return t("time.hoursAgo", { count: Math.floor(diff / 3600) });
  if (diff < 604800) return t("time.daysAgo", { count: Math.floor(diff / 86400) });

  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatListingPrice(price: number, locale: "fr" | "tr", freeLabel: string) {
  if (price === 0) return freeLabel;
  return (
    new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "fr-FR", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(price) + " XPF"
  );
}

export default function ListingCard({
  listing,
  compact = false,
  initialFavorited = false,
}: ListingCardProps) {
  const [imgError, setImgError] = useState(false);
  const { locale, t } = useTranslation();

  const trustColor = trustLevelColor(listing.seller.trustLevel);
  const trustLabel = t(`trust.${listing.seller.trustLevel}` as TranslationKey);
  const priceLabel = formatListingPrice(listing.price, locale, t("common.free"));
  const relativeDate = formatRelativeDate(listing.createdAt, locale, t);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <Link href={`/listings/${listing.slug}`} className="block">
        <div className={cn("relative bg-gray-100 overflow-hidden", compact ? "h-40" : "h-52")}>
          {!imgError && listing.images[0] ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-100">
              📷
            </div>
          )}
          {listing.status !== "active" && (
            <span
              className={cn(
                "absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full",
                listing.status === "sold"
                  ? "bg-green-600 text-white"
                  : listing.status === "pending"
                    ? "bg-amber-400 text-amber-900"
                    : listing.status === "rejected"
                      ? "bg-red-500 text-white"
                      : "bg-gray-500 text-white"
              )}
            >
              {t(`status.${listing.status}` as TranslationKey)}
            </span>
          )}
          {listing.status === "active" && listing.isFeatured && (
            <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded-full">
              {t("listing.featured")}
            </span>
          )}
        </div>
      </Link>

      <FavoriteButton
        listingId={listing.id}
        listingPath={`/listings/${listing.slug}`}
        initialFavorited={initialFavorited}
        className="absolute top-2 right-2"
      />

      <Link href={`/listings/${listing.slug}`} className="block p-4">
        <div className="mb-1.5">
          <span className={cn("font-bold", listing.price === 0 ? "text-gray-600" : "text-gray-900 text-base")}>
            {priceLabel}
          </span>
          {listing.priceNegotiable && (
            <span className="ml-1.5 text-xs text-gray-400">
              ({t("common.negotiable")})
            </span>
          )}
        </div>

        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-2">
          {listing.title}
        </h3>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{listing.locationName}</span>
        </div>

        <div className="flex items-center justify-between">
          <Badge className={cn("text-xs", trustColor)}>
            {listing.seller.trustLevel === "pro"
              ? "🏢"
              : listing.seller.trustLevel === "trusted"
                ? "✓"
                : ""}{" "}
            {trustLabel}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {listing.views != null && (
              <>
                <Eye className="h-3 w-3" />
                <span>{listing.views}</span>
              </>
            )}
            <span className="ml-1">{relativeDate}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
