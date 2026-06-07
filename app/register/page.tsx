"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, User, CheckCircle } from "lucide-react";
import { signUp } from "@/app/actions/auth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import Button from "@/components/ui/Button";

function RegisterForm() {
  const searchParams = useSearchParams();
  const confirm = searchParams.get("confirm") === "1";
  const [error, formAction, pending] = useActionState(signUp, null);
  const { t } = useTranslation();

  if (confirm) {
    return (
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <span className="font-bold text-gray-900 text-xl">NouMarket</span>
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {t("auth.checkEmailTitle")}
          </h1>
          <p className="text-sm text-gray-500">{t("auth.confirmEmailText")}</p>
          <p className="text-xs text-gray-400">{t("auth.checkSpam")}</p>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          {t("auth.alreadyAccount")}{" "}
          <Link href="/login" className="text-sky-500 hover:text-sky-600 font-medium">
            {t("auth.loginButton")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
            <span className="text-white font-bold">N</span>
          </div>
          <span className="font-bold text-gray-900 text-xl">NouMarket</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">
          {t("auth.registerTitle")}
        </h1>
        <p className="text-sm text-gray-500">{t("auth.joinSubtitle")}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              {t("auth.firstLastName")}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Marie Dupont"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              {t("auth.email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="vous@exemple.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              {t("auth.password")}
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

          <p className="text-xs text-gray-400">
            {t("auth.acceptTermsStart")}{" "}
            <Link href="#" className="text-sky-500 hover:underline">
              {t("nav.terms")}
            </Link>{" "}
            {t("auth.acceptTermsAnd")}{" "}
            <Link href="#" className="text-sky-500 hover:underline">
              {t("nav.privacy")}
            </Link>
            .
          </p>

          <Button type="submit" fullWidth size="lg" loading={pending}>
            {pending ? t("auth.creating") : t("auth.createMyAccount")}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        {t("auth.alreadyAccount")}{" "}
        <Link href="/login" className="text-sky-500 hover:text-sky-600 font-medium">
          {t("auth.loginButton")}
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-sm flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-lg bg-sky-500 animate-pulse" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
