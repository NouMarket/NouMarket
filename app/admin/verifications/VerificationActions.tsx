"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ChevronDown } from "lucide-react";
import { approveVerification, rejectVerification } from "@/app/actions/verification";
import { useTranslation } from "@/lib/i18n/useTranslation";
import Button from "@/components/ui/Button";

interface Props {
  userId: string;
}

export default function VerificationActions({ userId }: Props) {
  const { t } = useTranslation();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  async function handleApprove() {
    setLoading("approve");
    setError(null);
    const result = await approveVerification(userId);
    setLoading(null);
    if ("error" in result) {
      setError(result.error);
    } else {
      setDone("approved");
    }
  }

  async function handleReject() {
    setLoading("reject");
    setError(null);
    const result = await rejectVerification(userId, note);
    setLoading(null);
    if ("error" in result) {
      setError(result.error);
    } else {
      setDone("rejected");
    }
  }

  if (done === "approved") {
    return (
      <span className="flex items-center gap-1 text-xs text-blue-700 font-medium">
        <CheckCircle className="h-3.5 w-3.5" />
        {t("admin.verifyApprove")} ✓
      </span>
    );
  }
  if (done === "rejected") {
    return (
      <span className="flex items-center gap-1 text-xs text-red-700 font-medium">
        <XCircle className="h-3.5 w-3.5" />
        {t("admin.verifyReject")} ✓
      </span>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleApprove}
          loading={loading === "approve"}
          disabled={loading !== null}
          className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white border-0"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          {loading === "approve"
            ? t("admin.verifyApproving")
            : t("admin.verifyApprove")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowRejectForm((v) => !v)}
          disabled={loading !== null}
          className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
        >
          <XCircle className="h-3.5 w-3.5" />
          {t("admin.verifyReject")}
          <ChevronDown
            className={`h-3 w-3 transition-transform ${showRejectForm ? "rotate-180" : ""}`}
          />
        </Button>
      </div>

      {showRejectForm && (
        <div className="space-y-2 pl-1">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("admin.verifyRejectNote")}
            rows={2}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 resize-none"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleReject}
            loading={loading === "reject"}
            disabled={loading !== null}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            {loading === "reject"
              ? t("admin.verifyRejecting")
              : t("admin.verifyConfirmReject")}
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
