"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Une erreur est survenue</h1>
        <p className="text-sm text-gray-500 mb-6">
          Quelque chose s&apos;est mal passé. Veuillez réessayer ou revenir à l&apos;accueil.
          {error.digest && (
            <span className="block mt-1 text-xs text-gray-400">Code : {error.digest}</span>
          )}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={unstable_retry}
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
