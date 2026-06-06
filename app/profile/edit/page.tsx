import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import EditProfileForm from "@/components/profile/EditProfileForm";

export const metadata: Metadata = {
  title: "Modifier mon profil",
  robots: { index: false, follow: false },
};

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/profile/edit");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/profile");

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      {/* Back link */}
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour au profil
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Modifier mon profil</h1>
        <p className="text-sm text-gray-500 mb-8">
          Ces informations sont visibles par les autres utilisateurs de NouMarket.
        </p>

        <EditProfileForm profile={profile} />
      </div>
    </div>
  );
}
