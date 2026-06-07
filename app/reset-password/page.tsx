"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Lock } from "lucide-react";
import { updatePassword } from "@/app/actions/auth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import Button from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const [error, formAction, pending] = useActionState(updatePassword, null);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <span className="font-bold text-gray-900 text-xl">NouMarket</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">
            {t("auth.newPassword")}
          </h1>
          <p className="text-sm text-gray-500">{t("auth.resetSubtitle")}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                {t("auth.newPassword")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder={t("auth.passwordMin")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm" className="text-sm font-medium text-gray-700">
                {t("auth.confirmPassword")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder={t("auth.confirmPlaceholder")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-colors"
                />
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" loading={pending}>
              {pending ? t("auth.updating") : t("auth.updatePassword")}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t("auth.expiredLink")}{" "}
          <Link href="/forgot-password" className="text-sky-500 hover:text-sky-600 font-medium">
            {t("auth.requestNewLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
