"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, CheckCircle2, Trash2 } from "lucide-react";
import { markAsSold, deleteListing } from "@/app/actions/listings";
import type { ListingStatus } from "@/types";
import { useTranslation } from "@/lib/i18n/useTranslation";
import Button from "@/components/ui/Button";

interface Props {
  listingId: string;
  slug: string;
  status: ListingStatus;
}

export default function SellerListingActions({ listingId, slug, status }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canMarkSold = status === "active" || status === "pending";

  function handleMarkSold() {
    setError(null);
    startTransition(async () => {
      const result = await markAsSold(listingId);
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
    const result = await deleteListing(listingId);
    setDeleteLoading(false);
    if ("error" in result) {
      setError(result.error);
      setShowDeleteModal(false);
    } else {
      router.push("/profile");
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          {t("profile.manageListing")}
        </p>
        <div className="flex flex-col gap-2">
          <Link href={`/listings/${slug}/edit`} className="block">
            <Button variant="outline" fullWidth size="sm" className="gap-1.5 justify-start">
              <Pencil className="h-3.5 w-3.5" />
              {t("common.edit")}
            </Button>
          </Link>

          {canMarkSold && (
            <Button
              variant="outline"
              fullWidth
              size="sm"
              className="gap-1.5 justify-start"
              onClick={handleMarkSold}
              loading={isPending}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("profile.markSold")}
            </Button>
          )}

          <Button
            variant="danger"
            fullWidth
            size="sm"
            className="gap-1.5 justify-start"
            onClick={() => {
              setError(null);
              setShowDeleteModal(true);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("common.delete")}
          </Button>
        </div>

        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              {t("profile.deleteTitle")}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {t("profile.deleteIrreversibleText")}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={handleDelete}
                loading={deleteLoading}
              >
                {t("common.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
