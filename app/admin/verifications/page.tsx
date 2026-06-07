import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Calendar, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { getLocale, getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import AdminNav from "@/components/admin/AdminNav";
import VerificationActions from "./VerificationActions";

export const metadata: Metadata = {
  title: "Vérifications — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminVerificationsPage() {
  // Guard: must be authenticated admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/verifications");

  const { data: caller } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!caller?.is_admin) redirect("/");

  const [dictionary, locale] = await Promise.all([
    getServerDictionary(),
    getLocale(),
  ]);
  const t = (key: TranslationKey, params?: Record<string, string | number>) =>
    translate(dictionary, key, params);

  // Fetch all pending verification requests via service role (bypasses RLS)
  const { data: pendingUsers } = await adminSupabase
    .from("profiles")
    .select(
      "id, name, avatar_url, location_name, member_since, phone, verification_requested_at"
    )
    .eq("verification_status", "pending")
    .order("verification_requested_at", { ascending: true });

  const rows = pendingUsers ?? [];

  return (
    <>
      <AdminNav current="/admin/verifications" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl font-bold text-gray-900">
              {t("admin.verificationsTitle")}
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            {t("admin.verificationsSubtitle")}
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-sm">{t("admin.verificationsEmpty")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((profile) => {
              const memberSince = new Date(
                profile.member_since
              ).toLocaleDateString(locale === "tr" ? "tr-TR" : "fr-FR", {
                year: "numeric",
                month: "long",
              });
              const requestedAt = profile.verification_requested_at
                ? new Date(profile.verification_requested_at).toLocaleDateString(
                    locale === "tr" ? "tr-TR" : "fr-FR",
                    { year: "numeric", month: "long", day: "numeric" }
                  )
                : "—";

              return (
                <div
                  key={profile.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                >
                  <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                    {/* Avatar */}
                    <Link href={`/sellers/${profile.id}`} className="shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-lg overflow-hidden">
                        {profile.avatar_url ? (
                          <Image
                            src={profile.avatar_url}
                            alt={profile.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          profile.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/sellers/${profile.id}`}
                        className="font-semibold text-gray-900 hover:text-sky-600 transition-colors"
                      >
                        {profile.name}
                      </Link>

                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {t("common.memberSince", { date: memberSince })}
                        </span>
                        {profile.location_name && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {profile.location_name}
                          </span>
                        )}
                        {profile.phone && (
                          <span className="text-gray-700 font-mono">
                            {profile.phone}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-amber-700 mt-1.5 font-medium">
                        {t("verification.pending")} — {requestedAt}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 w-full sm:w-auto">
                      <VerificationActions userId={profile.id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
