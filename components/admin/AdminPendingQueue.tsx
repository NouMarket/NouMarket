"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Listing } from "@/types";
import { updateListingStatus } from "@/app/actions/listings";
import { useTranslation } from "@/lib/i18n/useTranslation";
import PendingListingCard from "./PendingListingCard";
import Badge from "@/components/ui/Badge";

type ActionedListing = {
  id: string;
  action: "approved" | "rejected";
  reason?: string;
};

interface AdminPendingQueueProps {
  initialListings: Listing[];
}

export default function AdminPendingQueue({
  initialListings,
}: AdminPendingQueueProps) {
  const [pending, setPending] = useState<Listing[]>(initialListings);
  const [actioned, setActioned] = useState<ActionedListing[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const { t } = useTranslation();

  async function handleApprove(id: string) {
    setProcessing(id);
    const result = await updateListingStatus(id, "active");
    setProcessing(null);

    if ("error" in result) {
      alert(result.error);
      return;
    }

    setPending((prev) => prev.filter((l) => l.id !== id));
    setActioned((prev) => [...prev, { id, action: "approved" }]);
  }

  async function handleReject(id: string, reason: string) {
    setProcessing(id);
    const result = await updateListingStatus(id, "rejected", reason);
    setProcessing(null);

    if ("error" in result) {
      alert(result.error);
      return;
    }

    setPending((prev) => prev.filter((l) => l.id !== id));
    setActioned((prev) => [...prev, { id, action: "rejected", reason }]);
  }

  const approved = actioned.filter((a) => a.action === "approved").length;
  const rejected = actioned.filter((a) => a.action === "rejected").length;

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{pending.length}</p>
            <p className="text-xs text-gray-500">{t("status.pending")}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{approved}</p>
            <p className="text-xs text-gray-500">{t("admin.approvedPlural")}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{rejected}</p>
            <p className="text-xs text-gray-500">{t("admin.rejectedPlural")}</p>
          </div>
        </div>
      </div>

      {pending.length > 0 ? (
        <div className="space-y-4">
          {pending.map((listing) => (
            <PendingListingCard
              key={listing.id}
              listing={listing}
              processing={processing === listing.id}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-4xl mb-4">✓</p>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {t("admin.pendingEmptyTitle")}
          </h2>
          <p className="text-sm text-gray-500">{t("admin.pendingEmptyText")}</p>
        </div>
      )}

      {actioned.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {t("admin.sessionHistory")}
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {actioned.map((a) => {
              const actionLabel =
                a.action === "approved"
                  ? t("admin.approved").toLowerCase()
                  : t("admin.rejected").toLowerCase();
              return (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                  {a.action === "approved" ? (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                  <span className="text-gray-700">
                    {t("admin.listingActioned", {
                      id: a.id.slice(0, 8),
                      action: actionLabel,
                    })}
                    {a.reason && (
                      <span className="text-gray-400"> - {a.reason}</span>
                    )}
                  </span>
                  <Badge
                    className="ml-auto"
                    variant={a.action === "approved" ? "success" : "danger"}
                  >
                    {a.action === "approved"
                      ? t("admin.approved")
                      : t("admin.rejected")}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
