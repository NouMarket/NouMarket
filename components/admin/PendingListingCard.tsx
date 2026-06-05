"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Calendar, CheckCircle, XCircle, Eye } from "lucide-react";
import { Listing } from "@/types";
import { formatPrice, getRelativeTime } from "@/lib/utils";
import { getCategoryBySlug } from "@/data/categories";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface PendingListingCardProps {
  listing: Listing;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export default function PendingListingCard({
  listing,
  onApprove,
  onReject,
}: PendingListingCardProps) {
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [imgError, setImgError] = useState(false);
  const category = getCategoryBySlug(listing.categorySlug);

  function handleReject() {
    if (!reason.trim()) return;
    onReject(listing.id, reason);
    setRejectMode(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-40 h-36 sm:h-auto bg-gray-100 flex-shrink-0">
          {!imgError && listing.images[0] ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
              sizes="160px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">📷</div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="warning">En attente</Badge>
                {category && (
                  <span className="text-xs text-gray-500">
                    {category.icon} {category.labelFr}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{listing.description}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-gray-900">{formatPrice(listing.price)}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {listing.locationName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {getRelativeTime(listing.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> Vendeur : {listing.seller.name}
            </span>
          </div>

          {/* Actions */}
          {!rejectMode ? (
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={() => onApprove(listing.id)}
              >
                <CheckCircle className="h-4 w-4" />
                Approuver
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
                onClick={() => setRejectMode(true)}
              >
                <XCircle className="h-4 w-4" />
                Rejeter
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Raison du rejet (ex: photos manquantes, prix incorrect...)"
                rows={2}
                className="w-full rounded-xl border border-red-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleReject}
                  disabled={!reason.trim()}
                >
                  Confirmer le rejet
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setRejectMode(false); setReason(""); }}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
