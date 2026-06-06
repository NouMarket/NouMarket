"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { MapPin, Eye } from "lucide-react";
import { Listing } from "@/types";
import { formatPrice, getRelativeTime, trustLevelLabel, trustLevelColor, cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import FavoriteButton from "./FavoriteButton";

interface ListingCardProps {
  listing: Listing;
  compact?: boolean;
  initialFavorited?: boolean;
}

export default function ListingCard({
  listing,
  compact = false,
  initialFavorited = false,
}: ListingCardProps) {
  const [imgError, setImgError] = useState(false);

  const trustColor = trustLevelColor(listing.seller.trustLevel);
  const trustLabel = trustLevelLabel(listing.seller.trustLevel);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Image */}
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
          {listing.isFeatured && (
            <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded-full">
              À la une
            </span>
          )}
        </div>
      </Link>

      {/* Favorite button */}
      <FavoriteButton
        listingId={listing.id}
        listingPath={`/listings/${listing.slug}`}
        initialFavorited={initialFavorited}
        className="absolute top-2 right-2"
      />

      {/* Content */}
      <Link href={`/listings/${listing.slug}`} className="block p-4">
        {/* Price */}
        <div className="mb-1.5">
          <span className={cn("font-bold", listing.price === 0 ? "text-gray-600" : "text-gray-900 text-base")}>
            {formatPrice(listing.price)}
          </span>
          {listing.priceNegotiable && (
            <span className="ml-1.5 text-xs text-gray-400">(négociable)</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-2">
          {listing.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{listing.locationName}</span>
        </div>

        {/* Footer */}
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
            <span className="ml-1">{getRelativeTime(listing.createdAt)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
