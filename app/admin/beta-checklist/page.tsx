import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { betaChecklist } from "@/lib/i18n/beta-checklist";
import { getLocale, getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Beta Checklist - Admin NouMarket",
  robots: { index: false, follow: false },
};

export default async function BetaChecklistPage() {
  const [locale, dictionary] = await Promise.all([
    getLocale(),
    getServerDictionary(),
  ]);
  const t = (key: keyof typeof dictionary, params?: Record<string, string | number>) =>
    translate(dictionary, key, params);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/beta-checklist");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) notFound();

  const sections = betaChecklist[locale];
  const totalItems = sections.reduce((n, section) => n + section.items.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav current="/admin/beta-checklist" />

      <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("admin.betaTitle")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("admin.betaIntro", {
              sections: sections.length,
              items: totalItems,
            })}
          </p>
          <p className="mt-2 text-xs text-amber-600 font-medium">
            {t("admin.betaGuide")} :{" "}
            <code className="bg-amber-50 px-1 rounded">
              docs/BETA_QA_CHECKLIST.md
            </code>
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <span className="inline-flex h-7 min-w-12 items-center justify-center rounded-lg bg-sky-50 px-2 text-xs font-semibold text-sky-600">
                  {section.label}
                </span>
                <h2 className="font-semibold text-gray-900">{section.title}</h2>
                <span className="ml-auto text-xs text-gray-400">
                  {t("admin.betaPoints", { count: section.items.length })}
                </span>
              </div>
              <ul className="divide-y divide-gray-50">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 px-5 py-3">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-sky-500 accent-sky-500 cursor-pointer"
                      aria-label={item}
                    />
                    <span className="text-sm text-gray-700 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          {t("admin.betaFooter")}
        </p>
      </div>
    </div>
  );
}
