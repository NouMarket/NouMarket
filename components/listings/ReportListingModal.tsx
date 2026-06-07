"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Flag, X } from "lucide-react";
import { reportListing, type ReportReason } from "@/app/actions/reports";
import { useAuth } from "@/components/providers/AuthProvider";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import { useTranslation } from "@/lib/i18n/useTranslation";
import Button from "@/components/ui/Button";

const REASONS: ReportReason[] = [
  "inappropriate",
  "spam",
  "fraud",
  "wrong_category",
  "other",
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
  const { t } = useTranslation();
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
        {t("listing.report")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {t("listing.report")}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {t("listing.reportHelp")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                aria-label={t("common.close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!user ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                  {t("listing.reportLogin")}
                </div>
                <Link href={`/login?next=${encodeURIComponent(currentPath)}`}>
                  <Button fullWidth>{t("nav.login")}</Button>
                </Link>
              </div>
            ) : state === "success" ? (
              <div className="space-y-4 text-center">
                <CheckCircle className="mx-auto h-10 w-10 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {t("listing.reportSuccessTitle")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {t("listing.reportSuccessText")}
                  </p>
                </div>
                <Button fullWidth onClick={() => setOpen(false)}>
                  {t("common.close")}
                </Button>
              </div>
            ) : state === "alreadyReported" ? (
              <div className="space-y-4 text-center">
                <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {t("listing.reportAlreadyTitle")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {t("listing.reportAlreadyText")}
                  </p>
                </div>
                <Button fullWidth onClick={() => setOpen(false)}>
                  {t("common.close")}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {REASONS.map((item) => (
                    <label
                      key={item}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={item}
                        checked={reason === item}
                        onChange={() => setReason(item)}
                        className="accent-sky-500"
                      />
                      {t(`listing.reportReason.${item}` as TranslationKey)}
                    </label>
                  ))}
                </div>

                <textarea
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder={t("listing.reportDetails")}
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
                    {t("common.cancel")}
                  </Button>
                  <Button type="button" loading={pending} onClick={handleSubmit}>
                    {t("common.submit")}
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
