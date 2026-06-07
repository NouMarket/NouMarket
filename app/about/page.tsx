import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import type { TranslationKey } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: `À propos - ${SITE_NAME}`,
  description:
    "Découvrez la mission de NouMarket, la marketplace locale de Nouvelle-Calédonie.",
};

const sections = [
  { title: "legal.aboutMissionTitle", body: "legal.aboutMissionText" },
  { title: "legal.aboutMarketplaceTitle", body: "legal.aboutMarketplaceText" },
  { title: "legal.aboutContactTitle", body: "legal.aboutContactText" },
] satisfies Array<{ title: TranslationKey; body: TranslationKey }>;

export default async function AboutPage() {
  const dictionary = await getServerDictionary();
  const t = (key: TranslationKey) => translate(dictionary, key);

  return (
    <main className="bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <nav
          aria-label={t("legal.breadcrumbLabel")}
          className="mb-8 flex items-center gap-2 text-sm text-gray-500"
        >
          <Link href="/" className="hover:text-sky-700">
            {t("nav.home")}
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span className="font-medium text-gray-700">{t("nav.about")}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          {t("legal.aboutTitle")}
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          {t("legal.aboutIntro")}
        </p>

        <div className="mt-10 divide-y divide-gray-200 border-y border-gray-200">
          {sections.map((section) => (
            <section key={section.title} className="py-7">
              <h2 className="text-xl font-semibold text-gray-900">
                {t(section.title)}
              </h2>
              <p className="mt-3 leading-7 text-gray-600">{t(section.body)}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
