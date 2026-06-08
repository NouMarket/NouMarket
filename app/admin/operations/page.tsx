import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  BarChart2,
  ListChecks,
  Flag,
  ShieldCheck,
  HardDrive,
  ClipboardList,
  Settings,
  BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Opérations — Admin",
  robots: { index: false, follow: false },
};

const QUICK_LINKS: Array<{
  href: string;
  labelKey: TranslationKey;
  icon: typeof BarChart2;
  color: string;
  bg: string;
}> = [
  { href: "/admin",               labelKey: "admin.navDashboard",      icon: BarChart2,   color: "text-sky-600",    bg: "bg-sky-50" },
  { href: "/admin/pending",       labelKey: "admin.navListings",        icon: ListChecks,  color: "text-amber-600",  bg: "bg-amber-50" },
  { href: "/admin/reports",       labelKey: "nav.reports",              icon: Flag,        color: "text-red-600",    bg: "bg-red-50" },
  { href: "/admin/verifications", labelKey: "nav.adminVerifications",   icon: ShieldCheck, color: "text-green-600",  bg: "bg-green-50" },
  { href: "/admin/storage",       labelKey: "admin.storage",            icon: HardDrive,   color: "text-purple-600", bg: "bg-purple-50" },
  { href: "/admin/beta-checklist",labelKey: "admin.betaChecklist",      icon: ClipboardList,color: "text-indigo-600",bg: "bg-indigo-50" },
];

const OPS_ITEMS: TranslationKey[] = [
  "admin.opsItemMigrations",
  "admin.opsItemBuckets",
  "admin.opsItemRealtime",
  "admin.opsItemEmailAuth",
  "admin.opsItemAdmin",
  "admin.opsItemEnvVars",
  "admin.opsItemDomain",
  "admin.opsItemSmokeTests",
];

const DOCS: Array<{ file: string; labelKey: TranslationKey }> = [
  { file: "docs/BETA_DEPLOYMENT_CHECKLIST.md", labelKey: "admin.opsDocDeployment" },
  { file: "docs/ADMIN_SETUP.md",               labelKey: "admin.opsDocAdmin" },
  { file: "docs/SUPABASE_LIVE_CHECKLIST.md",   labelKey: "admin.opsDocSupabase" },
  { file: "docs/BETA_TESTER_GUIDE.md",         labelKey: "admin.opsDocTesters" },
];

export default async function AdminOperationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/operations");

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!callerProfile?.is_admin) notFound();

  const dictionary = await getServerDictionary();
  const t = (key: TranslationKey) => translate(dictionary, key);

  return (
    <>
      <AdminNav current="/admin/operations" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="h-5 w-5 text-gray-600" />
            <h1 className="text-xl font-bold text-gray-900">
              {t("admin.operationsTitle")}
            </h1>
          </div>
          <p className="text-sm text-gray-500">{t("admin.operationsSubtitle")}</p>
        </div>

        {/* Quick Links */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            {t("admin.operationsQuickLinks")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_LINKS.map(({ href, labelKey, icon: Icon, color, bg }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
              >
                <span
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                </span>
                <span className="text-sm font-medium text-gray-900 leading-tight">
                  {t(labelKey)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deployment Checklist */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {t("admin.operationsChecklist")}
            </h2>
            <p className="text-xs text-amber-600 font-medium mb-3">
              {t("admin.operationsChecklistNote")}
            </p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-50">
                {OPS_ITEMS.map((key) => (
                  <li key={key} className="flex items-center gap-3 px-5 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 shrink-0 rounded border-gray-300 accent-sky-500 cursor-pointer"
                      aria-label={t(key)}
                    />
                    <span className="text-sm text-gray-700">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Documentation */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {t("admin.opsDocs")}
            </h2>
            <p className="text-xs text-gray-400 mb-3">docs/</p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-50">
                {DOCS.map(({ file, labelKey }) => (
                  <li key={file} className="flex items-start gap-3 px-5 py-4">
                    <BookOpen className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {t(labelKey)}
                      </p>
                      <code className="text-xs text-gray-400 font-mono">
                        {file}
                      </code>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
