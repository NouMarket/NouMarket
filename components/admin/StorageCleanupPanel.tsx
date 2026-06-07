"use client";

import { useState } from "react";
import { Trash2, Eye, AlertTriangle } from "lucide-react";
import { cleanupArchivedListingImages } from "@/app/actions/storage";
import type { StorageCleanupResult } from "@/app/actions/storage";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function StorageCleanupPanel() {
  const { t } = useTranslation();
  const [result, setResult] = useState<StorageCleanupResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function handlePreview() {
    setBusy(true);
    setResult(await cleanupArchivedListingImages(true));
    setBusy(false);
  }

  async function handleDelete() {
    if (!confirm(t("admin.storageConfirm"))) return;
    setBusy(true);
    setResult(await cleanupArchivedListingImages(false));
    setBusy(false);
  }

  const hasPreview = result && "preview" in result;
  const hasDone = result && "deleted" in result;
  const hasError = result && "error" in result;
  const preview = hasPreview
    ? (result as { preview: { archivedListingCount: number; imageCount: number } }).preview
    : null;
  const done = hasDone ? (result as { deleted: number; errors: number }) : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handlePreview}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 disabled:opacity-50 transition-colors"
        >
          <Eye className="h-4 w-4" />
          {busy ? t("common.loading") : t("admin.storagePreview")}
        </button>

        {preview && preview.imageCount > 0 && (
          <button
            onClick={handleDelete}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-sm font-medium text-red-700 border border-red-200 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {t("common.delete")}
          </button>
        )}
      </div>

      {preview && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm space-y-1">
          <div className="flex items-center gap-2 font-medium text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {t("admin.storagePreviewTitle")}
          </div>
          <p className="text-amber-700">
            {t("admin.storageArchivedListings")} :{" "}
            <strong>{preview.archivedListingCount}</strong>
          </p>
          <p className="text-amber-700">
            {t("admin.storageImagesToDelete")} : <strong>{preview.imageCount}</strong>
          </p>
          {preview.imageCount === 0 && (
            <p className="text-green-700 font-medium">{t("admin.storageNothing")}</p>
          )}
        </div>
      )}

      {done && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm space-y-1">
          <p className="font-medium text-green-800">{t("admin.storageDone")}</p>
          <p className="text-green-700">
            {t("admin.storageDeletedFiles")} : <strong>{done.deleted}</strong>
          </p>
          {done.errors > 0 && (
            <p className="text-red-700">
              {t("admin.storageErrors")} : <strong>{done.errors}</strong>{" "}
              ({t("admin.storageServerLogs")})
            </p>
          )}
        </div>
      )}

      {hasError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {(result as { error: string }).error}
        </div>
      )}
    </div>
  );
}
