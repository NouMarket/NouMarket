import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { CATEGORIES } from "@/data/categories";
import { getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import type { TranslationKey } from "@/lib/i18n/dictionaries";

export default async function Footer() {
  const year = new Date().getFullYear();
  const dictionary = await getServerDictionary();
  const t = (key: TranslationKey) => translate(dictionary, key);

  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-bold text-white text-lg">{SITE_NAME}</span>
            </div>
            <p className="text-sm leading-relaxed">{t("site.description")}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">
              {t("common.categories")}
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {t(`category.${cat.slug}` as TranslationKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">
              {t("common.navigation")}
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/create", label: t("nav.postListing") },
                { href: "/favorites", label: t("nav.myFavorites") },
                { href: "/profile", label: t("nav.account") },
                { href: "/login", label: t("nav.login") },
                { href: "/register", label: t("nav.register") },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">
              {t("common.information")}
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/about", label: t("nav.about") },
                { href: "/terms", label: t("nav.terms") },
                { href: "/privacy", label: t("nav.privacy") },
                { href: "/help", label: t("nav.help") },
              ].map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>
            © {year} {SITE_NAME} – {t("common.allRights")} Nouvelle-Calédonie
          </p>
          <p>{t("common.madeForNc")}</p>
        </div>
      </div>
    </footer>
  );
}
