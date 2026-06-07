"use client";

import { Suspense, useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signIn } from "@/app/actions/auth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import Button from "@/components/ui/Button";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const oauthError = searchParams.get("error");
  const resetSuccess = searchParams.get("reset");
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, formAction, pending] = useActionState(signIn, null);

  async function handleGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
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
          {t("auth.welcomeBack")}
        </h1>
        <p className="text-sm text-gray-500">{t("auth.loginSubtitle")}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {resetSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            {t("auth.resetSuccess")}
          </div>
        )}

        {oauthError === "oauth" && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {t("auth.oauthError")}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />

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
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-sky-500 hover:text-sky-600">
              {t("auth.forgotPassword")}
            </Link>
          </div>

          <Button type="submit" fullWidth size="lg" loading={pending}>
            {pending ? t("auth.loggingIn") : t("auth.loginButton")}
          </Button>
        </form>

        <div className="relative mt-5 mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">
            {t("auth.continueWith")}
          </div>
        </div>

        <Button
          variant="outline"
          fullWidth
          size="md"
          className="gap-2"
          onClick={handleGoogle}
          loading={googleLoading}
          type="button"
        >
          {t("auth.google")}
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        {t("auth.noAccount")}{" "}
        <Link href="/register" className="text-sky-500 hover:text-sky-600 font-medium">
          {t("auth.createAccount")}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-sm flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-lg bg-sky-500 animate-pulse" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
