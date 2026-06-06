"use client";

import { useState } from "react";
import { Trash2, Eye, AlertTriangle } from "lucide-react";
import { cleanupArchivedListingImages } from "@/app/actions/storage";
import type { StorageCleanupResult } from "@/app/actions/storage";

export default function StorageCleanupPanel() {
  const [result, setResult] = useState<StorageCleanupResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function handlePreview() {
    setBusy(true);
    setResult(await cleanupArchivedListingImages(true));
    setBusy(false);
  }

  async function handleDelete() {
    if (!confirm("Supprimer définitivement ces images du Storage ? Cette action est irréversible.")) return;
    setBusy(true);
    setResult(await cleanupArchivedListingImages(false));
    setBusy(false);
  }

  const hasPreview = result && "preview" in result;
  const hasDone = result && "deleted" in result;
  const hasError = result && "error" in result;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handlePreview}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 disabled:opacity-50 transition-colors"
        >
          <Eye className="h-4 w-4" />
          {busy ? "Chargement…" : "Aperçu"}
        </button>

        {hasPreview && (result as { preview: { imageCount: number } }).preview.imageCount > 0 && (
          <button
            onClick={handleDelete}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-sm font-medium text-red-700 border border-red-200 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </button>
        )}
      </div>

      {hasPreview && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm space-y-1">
          <div className="flex items-center gap-2 font-medium text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Aperçu (aucune suppression effectuée)
          </div>
          <p className="text-amber-700">
            Annonces archivées avec images : <strong>{(result as { preview: { archivedListingCount: number; imageCount: number } }).preview.archivedListingCount}</strong>
          </p>
          <p className="text-amber-700">
            Images à supprimer : <strong>{(result as { preview: { archivedListingCount: number; imageCount: number } }).preview.imageCount}</strong>
          </p>
          {(result as { preview: { imageCount: number } }).preview.imageCount === 0 && (
            <p className="text-green-700 font-medium">Rien à nettoyer.</p>
          )}
        </div>
      )}

      {hasDone && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm space-y-1">
          <p className="font-medium text-green-800">Nettoyage terminé</p>
          <p className="text-green-700">Fichiers supprimés : <strong>{(result as { deleted: number; errors: number }).deleted}</strong></p>
          {(result as { deleted: number; errors: number }).errors > 0 && (
            <p className="text-red-700">Erreurs : <strong>{(result as { deleted: number; errors: number }).errors}</strong> (voir les logs serveur)</p>
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
