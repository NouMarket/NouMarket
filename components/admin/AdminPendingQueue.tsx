"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Listing } from "@/types";
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

export default function AdminPendingQueue({ initialListings }: AdminPendingQueueProps) {
  const [pending, setPending] = useState<Listing[]>(initialListings);
  const [actioned, setActioned] = useState<ActionedListing[]>([]);

  function handleApprove(id: string) {
    setPending((prev) => prev.filter((l) => l.id !== id));
    setActioned((prev) => [...prev, { id, action: "approved" }]);
    // TODO (Phase 5): call updateListingStatus(id, "active") Server Action
  }

  function handleReject(id: string, reason: string) {
    setPending((prev) => prev.filter((l) => l.id !== id));
    setActioned((prev) => [...prev, { id, action: "rejected", reason }]);
    // TODO (Phase 5): call updateListingStatus(id, "rejected", reason) Server Action
  }

  const approved = actioned.filter((a) => a.action === "approved").length;
  const rejected = actioned.filter((a) => a.action === "rejected").length;

  return (
    <>
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{pending.length}</p>
            <p className="text-xs text-gray-500">En attente</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{approved}</p>
            <p className="text-xs text-gray-500">Approuvées</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{rejected}</p>
            <p className="text-xs text-gray-500">Rejetées</p>
          </div>
        </div>
      </div>

      {/* Listing queue */}
      {pending.length > 0 ? (
        <div className="space-y-4">
          {pending.map((listing) => (
            <PendingListingCard
              key={listing.id}
              listing={listing}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-4xl mb-4">🎉</p>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            File d&apos;attente vide !
          </h2>
          <p className="text-sm text-gray-500">
            Toutes les annonces ont été examinées. Beau travail !
          </p>
        </div>
      )}

      {/* Action log */}
      {actioned.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Historique de cette session
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {actioned.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                {a.action === "approved" ? (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                )}
                <span className="text-gray-700">
                  Annonce <span className="font-medium">#{a.id}</span>{" "}
                  {a.action === "approved" ? "approuvée" : "rejetée"}
                  {a.reason && (
                    <span className="text-gray-400"> — {a.reason}</span>
                  )}
                </span>
                <Badge
                  className="ml-auto"
                  variant={a.action === "approved" ? "success" : "danger"}
                >
                  {a.action === "approved" ? "Approuvée" : "Rejetée"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
