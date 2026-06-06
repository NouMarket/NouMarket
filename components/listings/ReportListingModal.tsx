"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Flag, X } from "lucide-react";
import { reportListing, type ReportReason } from "@/app/actions/reports";
import { useAuth } from "@/components/providers/AuthProvider";
import Button from "@/components/ui/Button";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "inappropriate", label: "Contenu inapproprie" },
  { value: "spam", label: "Spam" },
  { value: "fraud", label: "Fraude ou arnaque" },
  { value: "wrong_category", label: "Mauvaise categorie" },
  { value: "other", label: "Autre" },
];

interface ReportListingModalProps {
  listingId: string;
  sellerId: string;
  currentPath: string;
}

type State = "idle" | "success" | "alreadyReported";

export default function ReportListingModal({
  listingId,
  sellerId,
  currentPath,
}: ReportListingModalProps) {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("inappropriate");
  const [details, setDetails] = useState("");
  const [state, setState] = useState<State>("idle");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;
  if (user?.id === sellerId) return null;

  async function handleSubmit() {
    if (!user || pending) return;

    setPending(true);
    setError(null);

    const result = await reportListing(listingId, reason, details);
    setPending(false);

    if ("success" in result) {
      setState("success");
      return;
    }

    if ("alreadyReported" in result) {
      setState("alreadyReported");
      return;
    }

    setError(result.error);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600"
      >
        <Flag className="h-3.5 w-3.5" />
        Signaler cette annonce
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Signaler cette annonce
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Aidez-nous a garder NouMarket fiable.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!user ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                  Connectez-vous pour signaler cette annonce.
                </div>
                <Link href={`/login?next=${encodeURIComponent(currentPath)}`}>
                  <Button fullWidth>Se connecter</Button>
                </Link>
              </div>
            ) : state === "success" ? (
              <div className="space-y-4 text-center">
                <CheckCircle className="mx-auto h-10 w-10 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Signalement envoye</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Merci, notre equipe examinera cette annonce.
                  </p>
                </div>
                <Button fullWidth onClick={() => setOpen(false)}>
                  Fermer
                </Button>
              </div>
            ) : state === "alreadyReported" ? (
              <div className="space-y-4 text-center">
                <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Deja signalee</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Vous avez deja signale cette annonce.
                  </p>
                </div>
                <Button fullWidth onClick={() => setOpen(false)}>
                  Fermer
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {REASONS.map((item) => (
                    <label
                      key={item.value}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={item.value}
                        checked={reason === item.value}
                        onChange={() => setReason(item.value)}
                        className="accent-sky-500"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>

                <textarea
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="Details complementaires (optionnel)"
                  rows={3}
                  maxLength={1000}
                  className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />

                {error && (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="button" loading={pending} onClick={handleSubmit}>
                    Envoyer
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
