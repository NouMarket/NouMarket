"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, CheckCircle2, Trash2 } from "lucide-react";
import { markAsSold, deleteListing } from "@/app/actions/listings";
import type { Listing } from "@/types";
import { useTranslation } from "@/lib/i18n/useTranslation";
import ListingCard from "@/components/listings/ListingCard";

interface Props {
  listing: Listing;
}

export default function ProfileListingCard({ listing }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canMarkSold = listing.status === "active" || listing.status === "pending";
  const canEdit = listing.status !== "archived";

  function handleMarkSold() {
    setError(null);
    startTransition(async () => {
      const result = await markAsSold(listing.id);
      if ("error" in result) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  async function handleDelete() {
    setDeleteLoading(true);
    setError(null);
    const result = await deleteListing(listing.id);
    setDeleteLoading(false);
    if ("error" in result) {
      setError(result.error);
      setShowDeleteModal(false);
    } else {
      router.refresh();
    }
  }

  return (
    <>
      <div className="flex flex-col">
        <ListingCard listing={listing} />

        <div className="flex gap-1.5 mt-2 px-0.5">
          {canEdit && (
            <Link
              href={`/listings/${listing.slug}/edit`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-600 transition-colors"
            >
              <Pencil className="h-3 w-3" />
              {t("common.edit")}
            </Link>
          )}

          {canMarkSold && (
            <button
              type="button"
              onClick={handleMarkSold}
              disabled={isPending}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-600 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="h-3 w-3" />
              {t("profile.sold")}
            </button>
          )}

          {listing.status !== "archived" && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setShowDeleteModal(true);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-100 bg-white hover:bg-red-50 text-xs font-medium text-red-500 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              {t("common.delete")}
            </button>
          )}
        </div>

        {error && <p className="mt-1 px-0.5 text-xs text-red-500">{error}</p>}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              {t("profile.deleteTitle")}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {t("profile.deleteArchiveText")}
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                {t("common.cancel")}
              </button>
              <button
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
