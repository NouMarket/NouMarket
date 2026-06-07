import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import CreateListingForm from "@/components/forms/CreateListingForm";

export const metadata: Metadata = {
  title: "Déposer une annonce",
  description: "Publiez votre annonce gratuitement sur NouMarket en quelques minutes.",
  robots: { index: false, follow: false },
};

export default async function CreatePage() {
  const dictionary = await getServerDictionary();
  const t = (key: keyof typeof dictionary) => translate(dictionary, key);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/create");
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700">
            {t("nav.home")}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-medium">{t("create.title")}</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("create.title")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t("create.subtitle")}</p>
        </div>

        <CreateListingForm />
      </div>
    </div>
  );
}
