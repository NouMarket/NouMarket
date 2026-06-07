import Link from "next/link";
import { BarChart2, ListChecks, Flag, HardDrive, ClipboardList, ShieldCheck } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import { getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";

const NAV: Array<{ href: string; label: TranslationKey; icon: typeof BarChart2 }> = [
  { href: "/admin", label: "admin.navDashboard", icon: BarChart2 },
  { href: "/admin/pending", label: "admin.navListings", icon: ListChecks },
  { href: "/admin/reports", label: "nav.reports", icon: Flag },
  { href: "/admin/verifications", label: "nav.adminVerifications", icon: ShieldCheck },
  { href: "/admin/storage", label: "admin.storage", icon: HardDrive },
  { href: "/admin/beta-checklist", label: "admin.betaChecklist", icon: ClipboardList },
];

export default async function AdminNav({ current }: { current: string }) {
  const dictionary = await getServerDictionary();
  const t = (key: TranslationKey) => translate(dictionary, key);

  return (
    <div className="bg-gray-900 text-white px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center gap-1 flex-wrap">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-3">
          {t("admin.mode")}
        </span>
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              current === href
                ? "bg-white/15 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {t(label)}
          </Link>
        ))}
      </div>
    </div>
  );
}
