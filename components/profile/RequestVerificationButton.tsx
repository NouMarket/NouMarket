"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { requestVerification } from "@/app/actions/verification";
import { useTranslation } from "@/lib/i18n/useTranslation";
import Button from "@/components/ui/Button";

interface Props {
  onSuccess?: () => void;
}

export default function RequestVerificationButton({ onSuccess }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await requestVerification();
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      setDone(true);
      onSuccess?.();
    }
  }

  if (done) {
    return (
      <p className="text-sm text-green-700 font-medium flex items-center gap-1.5">
        <ShieldCheck className="h-4 w-4" />
        {t("verification.requestSuccess")}
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        loading={loading}
        className="gap-1.5"
      >
        <ShieldCheck className="h-4 w-4" />
        {loading ? t("verification.requesting") : t("verification.request")}
      </Button>
      <p className="text-xs text-gray-400">{t("verification.requestNote")}</p>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
