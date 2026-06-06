import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";
import StorageCleanupPanel from "@/components/admin/StorageCleanupPanel";

export const metadata: Metadata = {
  title: "Storage – Admin NouMarket",
  robots: { index: false, follow: false },
};

export default async function AdminStoragePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/storage");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav current="/admin/storage" />
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nettoyage Storage</h1>
          <p className="mt-1 text-sm text-gray-500">
            Supprime les images associées aux annonces archivées (supprimées
            par leurs vendeurs). Les annonces actives, en attente et vendues
            ne sont jamais affectées.
          </p>
        </div>
        <StorageCleanupPanel />
      </div>
    </div>
  );
}
