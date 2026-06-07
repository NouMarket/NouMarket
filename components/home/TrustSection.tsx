import { ShieldCheck, MessageCircle, Star, Lock } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import { getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";

const TRUST_POINTS: Array<{
  icon: typeof ShieldCheck;
  title: TranslationKey;
  desc: TranslationKey;
}> = [
  {
    icon: ShieldCheck,
    title: "home.trustVerifiedTitle",
    desc: "home.trustVerifiedText",
  },
  {
    icon: MessageCircle,
    title: "home.trustMessagingTitle",
    desc: "home.trustMessagingText",
  },
  {
    icon: Star,
    title: "home.trustReviewsTitle",
    desc: "home.trustReviewsText",
  },
  {
    icon: Lock,
    title: "home.trustPrivacyTitle",
    desc: "home.trustPrivacyText",
  },
];

export default async function TrustSection() {
  const dictionary = await getServerDictionary();
  const t = (key: TranslationKey) => translate(dictionary, key);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("home.trustTitle")}
        </h2>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">
          {t("home.trustText")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TRUST_POINTS.map((point) => (
          <div
            key={point.title}
            className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
              <point.icon className="h-6 w-6 text-sky-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {t(point.title)}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t(point.desc)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
