import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import CreateListingForm from "@/components/forms/CreateListingForm";

export const metadata: Metadata = {
  title: "Déposer une annonce",
  description: "Publiez votre annonce gratuitement sur NouMarket en quelques minutes.",
};

export default async function CreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/create");
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700">Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-medium">Déposer une annonce</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Déposer une annonce</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gratuit et rapide – votre annonce sera en ligne en moins de 24h.
          </p>
        </div>

        <CreateListingForm />
      </div>
    </div>
  );
}
